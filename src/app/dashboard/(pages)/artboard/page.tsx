"use client";

import * as React from "react";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowDownWideNarrow,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { ArtBoard } from "@/components/art-board/art-board";
import {
  EditorWorkbench,
  type WorkspaceFile,
} from "@/components/editor-workspace";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useArtboardsList,
  useCreateArtboard,
  useDeleteArtboard,
  useUpdateArtboard,
} from "@/hooks/use-artboards";
import type { Artboard } from "@/types/artboard.type";

/* ================================================================== */
/* Local types                                                         */
/* ================================================================== */

interface ArtboardDraft {
  /** Live SVG fragment markup coming out of the ArtBoard. */
  svg: string;
  /** Copy from the last save. `svg !== saved` is the dirty flag. */
  saved: string;
  /** Time of the last save, or null while never saved. */
  savedAt: string | null;
}

type DraftMap = Record<string, ArtboardDraft>;

/** Open modal. Create carries nothing; rename/delete the artboard. */
type DialogSpec =
  | { kind: "create" }
  | { kind: "rename"; node: WorkspaceFile }
  | { kind: "delete"; node: WorkspaceFile };

type SortSpec = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  sortBy: "createdAt" | "title";
  sortOrder: "asc" | "desc";
};

const SORT_OPTIONS: SortSpec[] = [
  {
    label: "Newest first",
    icon: ArrowDownWideNarrow,
    sortBy: "createdAt",
    sortOrder: "desc",
  },
  {
    label: "Oldest first",
    icon: ArrowDownWideNarrow,
    sortBy: "createdAt",
    sortOrder: "asc",
  },
  { label: "Title A→Z", icon: ArrowDownAZ, sortBy: "title", sortOrder: "asc" },
  { label: "Title Z→A", icon: ArrowUpAZ, sortBy: "title", sortOrder: "desc" },
];

/** Server rules: 1–255 chars. Title-only validation (content is verbatim). */
function normalizeTitle(raw: string): { title?: string; error?: string } {
  const title = raw.trim();
  if (!title) return { error: "A name is required." };
  if (title.length > 255) {
    return { error: "Names are limited to 255 characters." };
  }
  return { title };
}

function mutationMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}

/* ================================================================== */
/* Small components                                                    */
/* ================================================================== */

/** Per-row actions in the artboard list: rename / delete. */
function NodeMenu({
  file,
  onRename,
  onDelete,
}: {
  file: WorkspaceFile;
  onRename: (node: WorkspaceFile) => void;
  onDelete: (node: WorkspaceFile) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${file.name}`}
          />
        }
      >
        <MoreHorizontal />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        <DropdownMenuItem onClick={() => onRename(file)}>
          <Pencil />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={() => onDelete(file)}>
          <Trash2 />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type TitleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  initialTitle?: string;
  placeholder?: string;
  submitLabel: string;
  onSubmit: (title: string) => Promise<void>;
};

/**
 * Create / rename modal. Remounts per open (keyed by the caller) so the
 * form is always pristine. Errors surface inline (e.g. validation).
 */
function TitleDialog({
  open,
  onOpenChange,
  title,
  description,
  initialTitle = "",
  placeholder,
  submitLabel,
  onSubmit,
}: TitleDialogProps) {
  const [name, setName] = React.useState(initialTitle);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    const normalized = normalizeTitle(name);
    if (!normalized.title) {
      setError(normalized.error ?? null);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(normalized.title);
      onOpenChange(false);
    } catch (mutationError) {
      setError(mutationMessage(mutationError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="artboard-name-dialog">Artboard name</Label>
            <Input
              id="artboard-name-dialog"
              value={name}
              autoFocus
              placeholder={placeholder}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={Boolean(error)}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin" /> : null}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type DeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: WorkspaceFile;
  onSubmit: () => Promise<void>;
};

/** Deletion is permanent — the backend hard-deletes the row. */
function DeleteDialog({ open, onOpenChange, node, onSubmit }: DeleteDialogProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const handleDelete = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit();
      onOpenChange(false);
    } catch (mutationError) {
      setError(mutationMessage(mutationError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Delete artboard &ldquo;{node.name}&rdquo;?
          </DialogTitle>
          <DialogDescription>
            The drawing will be removed permanently. Unsaved changes are lost
            as well. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={submitting}
            onClick={handleDelete}
          >
            {submitting ? <Loader2 className="animate-spin" /> : null}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ================================================================== */
/* Page                                                                */
/* ================================================================== */

export default function ArtboardPage() {
  /* Server-backed list controls: search (debounced) + sort. */
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [sort, setSort] = React.useState<SortSpec>(SORT_OPTIONS[0]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  /* One paginated list query — rows carry the full drawing content. */
  const listQuery = useArtboardsList(
    React.useMemo(
      () => ({
        page: 1,
        limit: 100,
        search: search || undefined,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
      }),
      [search, sort]
    )
  );

  /* Map rows onto the workbench's plain `WorkspaceFile` shape (flat list). */
  const artboards: Artboard[] = React.useMemo(
    () => listQuery.data?.items ?? [],
    [listQuery.data]
  );

  const files = React.useMemo(
    () =>
      artboards.map((row) => ({
        id: row.id,
        name: row.title,
        type: "file" as const,
      })),
    [artboards]
  );

  const createArtboard = useCreateArtboard();
  const renameMutation = useUpdateArtboard();
  const deleteArtboard = useDeleteArtboard();
  const saveArtboard = useUpdateArtboard();

  /* Controlled selection; stale ids (before the list loads or after a
   * delete) fall back to the first artboard — derived below. */
  const [selectedId, setSelectedId] = React.useState("");

  /* Unsaved drafts per artboard id (live SVG + last-saved copy). Only
   * created on the FIRST commit; server content is the value until then. */
  const [drafts, setDrafts] = React.useState<DraftMap>({});

  /* Modal state (create / rename / delete). */
  const [dialog, setDialog] = React.useState<DialogSpec | null>(null);

  /* Effective selection. */
  const resolvedId = files.some((file) => file.id === selectedId)
    ? selectedId
    : (files[0]?.id ?? "");
  const resolvedNode = files.find((file) => file.id === resolvedId);

  /* After creating an artboard we select it before the refetched list
   * contains it. Hold on "loading" instead of flashing the previous
   * selection, then clear the gate once the list catches up. */
  const [pendingSelectionId, setPendingSelectionId] = React.useState<
    string | null
  >(null);
  const awaitingSelection =
    pendingSelectionId !== null &&
    !artboards.some((row) => row.id === pendingSelectionId);
  if (pendingSelectionId !== null && !awaitingSelection) {
    setPendingSelectionId(null);
  }

  /* Selected artboard row (content + timestamps). */
  const selectedRow = artboards.find((row) => row.id === resolvedId);

  /* Display value: the local draft once editing started, otherwise the
   * server content. Refetches can never clobber unsaved edits because
   * the draft is authoritative from the first committed stroke. */
  const draft = drafts[resolvedId];
  const serverContent = selectedRow?.content;
  const isDirty = draft !== undefined && draft.svg !== draft.saved;

  /* Committed strokes/shapes/text flow out of the board into the draft. */
  const onChange = (svg: string) => {
    setDrafts((prev) => ({
      ...prev,
      [resolvedId]: {
        svg,
        saved: prev[resolvedId]?.saved ?? serverContent ?? "",
        savedAt: prev[resolvedId]?.savedAt ?? null,
      },
    }));
  };

  /* The workbench Save button: PATCH /artboards/:id. */
  const handleSave = async (file: WorkspaceFile) => {
    if (saveArtboard.isPending) return;
    const svg = drafts[file.id]?.svg;
    if (svg === undefined) return;
    try {
      await saveArtboard.mutateAsync({ id: file.id, patch: { content: svg } });
      setDrafts((prev) => ({
        ...prev,
        [file.id]: {
          svg,
          saved: svg,
          savedAt: new Date().toLocaleTimeString(),
        },
      }));
    } catch {
      /* Save errors surface in the topbar while the artboard stays dirty. */
    }
  };

  /* Create → select the new board and gate until the list catches up. */
  const handleCreate = async (title: string) => {
    if (dialog?.kind !== "create" || !title) return;
    const row = await createArtboard.mutateAsync({ title, content: "" });
    setSelectedId(row.id);
    setPendingSelectionId(row.id);
  };

  const handleRename = async (title: string) => {
    if (dialog?.kind !== "rename" || !title) return;
    await renameMutation.mutateAsync({ id: dialog.node.id, patch: { title } });
  };

  /* Delete: purge the draft + cached list data flows from invalidation. */
  const handleDelete = async () => {
    if (dialog?.kind !== "delete") return;
    await deleteArtboard.mutateAsync(dialog.node.id);
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[dialog.node.id];
      return next;
    });
    /* If the selection was the deleted row, drop it so the derived
     * fallback picks the first remaining artboard. */
    if (selectedId === dialog.node.id) setSelectedId("");
  };

  /* Content area states. */
  const renderContent = () => {
    if (listQuery.isPending) {
      return (
        <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 aria-hidden className="size-4 animate-spin" />
          Loading artboards…
        </div>
      );
    }
    if (listQuery.isError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Couldn&apos;t load your artboards.
            {listQuery.error instanceof Error
              ? ` ${listQuery.error.message}`
              : ""}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => listQuery.refetch()}
          >
            <RefreshCw aria-hidden />
            Retry
          </Button>
        </div>
      );
    }
    if (files.length === 0) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {search
              ? `No artboards match “${search}”.`
              : "No artboards yet. Create your first one to start drawing."}
          </p>
          {search ? null : (
            <Button
              type="button"
              size="sm"
              onClick={() => setDialog({ kind: "create" })}
            >
              <Plus aria-hidden />
              New artboard
            </Button>
          )}
        </div>
      );
    }
    /* A just-created board is selected but the refetched list hasn't
     * rendered it yet — hold instead of flashing content. */
    if (awaitingSelection) {
      return (
        <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 aria-hidden className="size-4 animate-spin" />
          Loading artboard…
        </div>
      );
    }
    /* Content available? Draft edits are authoritative; otherwise the
     * server payload ("" counts — it means a freshly created board). */
    if (draft !== undefined || serverContent !== undefined) {
      return (
        <ArtBoard
          value={draft?.svg ?? serverContent ?? ""}
          onValueChange={onChange}
          placeholder="Draw here — pick a tool above, sketch with your pointer…"
          label={`Artboard ${resolvedNode?.name ?? ""}`}
          className="h-full w-full rounded-none border-0 shadow-none focus-within:ring-0"
          surfaceClassName="flex-1 overflow-y-auto"
        />
      );
    }
    return (
      <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 aria-hidden className="size-4 animate-spin" />
        Loading artboard…
      </div>
    );
  };

  const SortIcon = sort.icon;

  return (
    <>
      <div className="min-w-0">
        <EditorWorkbench
          files={files}
          value={resolvedId}
          onValueChange={setSelectedId}
          dirty={isDirty}
          onSave={handleSave}
          label="Artboards"
          className="h-[calc(100vh-88px)]"
          renderItemAction={(file) => (
            <NodeMenu
              file={file}
              onRename={(node) => setDialog({ kind: "rename", node })}
              onDelete={(node) => setDialog({ kind: "delete", node })}
            />
          )}
          actions={
            <>
              {saveArtboard.isPending ? (
                <span className="hidden px-1 text-xs text-muted-foreground sm:inline">
                  Saving…
                </span>
              ) : null}
              {saveArtboard.isError ? (
                <span
                  role="alert"
                  className="hidden max-w-40 truncate px-1 text-xs text-destructive sm:inline"
                >
                  {mutationMessage(saveArtboard.error)}
                </span>
              ) : null}
              {draft?.savedAt ? (
                <span className="hidden px-1 text-xs text-muted-foreground sm:inline">
                  Saved {draft.savedAt}
                </span>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="New artboard"
                onClick={() => setDialog({ kind: "create" })}
              >
                <Plus />
              </Button>
            </>
          }
          /* Custom sidebar: search + sort controls above the built-in list. */
          sidebarContent={
            <div className="flex h-full min-h-0 flex-col">
              <div className="flex items-center gap-1 border-b border-border p-2">
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search artboards…"
                  aria-label="Search artboards"
                  className="h-7 flex-1 bg-background text-xs"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Sort artboards"
                      />
                    }
                  >
                    <SortIcon className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuLabel>Sort</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {SORT_OPTIONS.map((option) => (
                      <DropdownMenuItem
                        key={option.label}
                        onClick={() => setSort(option)}
                      >
                        <option.icon />
                        {option.label}
                        {option.label === sort.label ? " ✓" : ""}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {listQuery.data && listQuery.data.total > files.length ? (
                <p className="border-b border-border px-2 py-1 text-xs text-muted-foreground">
                  Showing {files.length} of {listQuery.data.total}
                </p>
              ) : null}
              <div className="min-h-0 flex-1 overflow-y-auto">
                <EditorWorkbench.FileTree />
              </div>
            </div>
          }
        >
          {renderContent()}
        </EditorWorkbench>
      </div>

      {dialog?.kind === "create" ? (
        <TitleDialog
          key="create"
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
          title="New artboard"
          description="Creates an empty drawing board."
          placeholder="My design"
          submitLabel="Create"
          onSubmit={handleCreate}
        />
      ) : null}

      {dialog?.kind === "rename" ? (
        <TitleDialog
          key={`rename/${dialog.node.id}`}
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
          title="Rename"
          description={`Enter a new name for “${dialog.node.name}”.`}
          initialTitle={dialog.node.name}
          submitLabel="Rename"
          onSubmit={handleRename}
        />
      ) : null}

      {dialog?.kind === "delete" ? (
        <DeleteDialog
          key={`delete/${dialog.node.id}`}
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
          node={dialog.node}
          onSubmit={handleDelete}
        />
      ) : null}
    </>
  );
}
