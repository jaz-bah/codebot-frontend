"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";

import {
  EditorWorkbench,
  type WorkspaceFile,
} from "@/components/editor-workspace";
import {
  RichTextEditor,
  type RichTextEditorToolbarItem,
} from "@/components/rich-text-editor";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  noteKeys,
  useCreateFile,
  useDeleteFile,
  useFileTree,
  useNoteDetail,
  useUpdateFile,
  useUpdateNote,
} from "@/hooks/use-notes";
import type { WorkspaceFileNode, WorkspaceNodeType } from "@/types/note.type";

/* ================================================================== */
/* Constants                                                           */
/* ================================================================== */

/** Subset + order of the built-in toolbar (append "separator" as needed). */
const NOTE_TOOLBAR: RichTextEditorToolbarItem[] = [
  "undo",
  "redo",
  "separator",
  "heading1",
  "heading2",
  "separator",
  "bold",
  "italic",
  "underline",
  "separator",
  "bulletList",
  "orderedList",
  "blockquote",
  "codeBlock",
  "separator",
  "link",
  "horizontalRule",
];

/* ================================================================== */
/* Local types + tree helpers                                          */
/* ================================================================== */

interface NoteContent {
  /** Live HTML coming out of the RichTextEditor. */
  html: string;
  /** Copy from the last save. `html !== saved` is the dirty flag. */
  saved: string;
  /** Time of the last save, or null while never saved. */
  savedAt: string | null;
}

type DraftMap = Record<string, NoteContent>;

/** Open modal. Create carries the destination; rename/delete the node. */
type DialogSpec =
  | {
      kind: "create";
      type: WorkspaceNodeType;
      parentId: string | null;
      parentName: string;
    }
  | { kind: "rename"; node: WorkspaceFile }
  | { kind: "delete"; node: WorkspaceFile };

/** Map API tree nodes onto the workbench's plain `WorkspaceFile` shape. */
function toTreeFiles(nodes: WorkspaceFileNode[]): WorkspaceFile[] {
  return nodes.map((node) => ({
    id: node.id,
    name: node.name,
    type: node.type,
    children: node.children ? toTreeFiles(node.children) : undefined,
  }));
}

/** Depth-first: the first note file in the tree (fallback selection). */
function firstFileId(files: WorkspaceFile[]): string {
  for (const node of files) {
    if (node.type === "file") return node.id;
    const childId = node.children ? firstFileId(node.children) : "";
    if (childId) return childId;
  }
  return "";
}

function findNode(files: WorkspaceFile[], id: string): WorkspaceFile | null {
  for (const node of files) {
    if (node.id === id) return node;
    const found = node.children ? findNode(node.children, id) : null;
    if (found) return found;
  }
  return null;
}

function collectFolderIds(files: WorkspaceFile[]): string[] {
  return files.flatMap((node) =>
    node.type === "folder"
      ? [node.id, ...collectFolderIds(node.children ?? [])]
      : []
  );
}

/** The node's id plus every descendant id (delete-cascade bookkeeping). */
function collectIds(node: WorkspaceFile): string[] {
  return [node.id, ...(node.children ?? []).flatMap((child) => collectIds(child))];
}

/**
 * Server rules (notes-api-guide.md): 1–255 chars, no `/` `\` or control
 * chars; note files must end `.html` (case-insensitive). A missing
 * `.html` on note files is appended automatically here so the user gets
 * `my-note.html` for typing `my-note`.
 */
function normalizeName(
  raw: string,
  type: WorkspaceNodeType
): { name?: string; error?: string } {
  const name = raw.trim();
  if (!name) return { error: "A name is required." };
  if (name.length > 255) {
    return { error: "Names are limited to 255 characters." };
  }
  if (/[/\\\u0000-\u001f]/.test(name)) {
    return { error: "Names can't contain `/` or `\\`." };
  }
  const finalName =
    type === "file" && !name.toLowerCase().endsWith(".html")
      ? `${name}.html`
      : name;
  return { name: finalName };
}

function mutationMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}

/* ================================================================== */
/* Small components                                                    */
/* ================================================================== */

/** Per-row actions in the file tree: create-into / rename / delete. */
function NodeMenu({
  file,
  onCreateIn,
  onRename,
  onDelete,
}: {
  file: WorkspaceFile;
  onCreateIn: (type: WorkspaceNodeType, folder: WorkspaceFile) => void;
  onRename: (node: WorkspaceFile) => void;
  onDelete: (node: WorkspaceFile) => void;
}) {
  const isFolder = file.type === "folder";
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
        {isFolder ? (
          <>
            <DropdownMenuItem onClick={() => onCreateIn("file", file)}>
              <Plus />
              New note
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCreateIn("folder", file)}>
              <Plus />
              New folder
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : null}
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

type NameDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  initialName?: string;
  /** Server-side node type: drives the `.html` suffix + validation. */
  nodeType: WorkspaceNodeType;
  placeholder?: string;
  submitLabel: string;
  onSubmit: (name: string) => Promise<void>;
};

/**
 * Create / rename modal. Remounts per open (keyed by the caller) so the
 * form is always pristine. Errors surface inline (e.g. 409 duplicate
 * sibling names).
 */
function NameDialog({
  open,
  onOpenChange,
  title,
  description,
  initialName = "",
  nodeType,
  placeholder,
  submitLabel,
  onSubmit,
}: NameDialogProps) {
  const [name, setName] = React.useState(initialName);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    const normalized = normalizeName(name, nodeType);
    if (!normalized.name) {
      setError(normalized.error ?? null);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(normalized.name);
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
            <Label htmlFor="note-name-dialog">{nodeType === "file" ? "Note name" : "Folder name"}</Label>
            <Input
              id="note-name-dialog"
              value={name}
              autoFocus
              placeholder={placeholder}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={Boolean(error)}
            />
            {nodeType === "file" ? (
              <p className="text-xs text-muted-foreground">
                Note files always end in <code>.html</code> — we&apos;ll add
                it for you if it&apos;s missing.
              </p>
            ) : null}
          </div>
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
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

/** Cascade confirmation: folders take every descendant + note with them. */
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
            Delete {node.type === "folder" ? "folder" : "note"} &ldquo;
            {node.name}&rdquo;?
          </DialogTitle>
          <DialogDescription>
            {node.type === "folder"
              ? "Everything inside it (subfolders, notes and their content) is removed too. This cannot be undone."
              : "The note and its content will be removed. This cannot be undone."}
            {" Unsaved editor changes are lost as well."}
          </DialogDescription>
        </DialogHeader>
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}
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

export default function NotePage() {
  const queryClient = useQueryClient();

  /* Workspace structure: folders + note files from GET /files/tree. */
  const treeQuery = useFileTree();
  const files = React.useMemo(
    () => toTreeFiles(treeQuery.data ?? []),
    [treeQuery.data]
  );

  const createFile = useCreateFile();
  const updateFileMutation = useUpdateFile();
  const deleteFileMutation = useDeleteFile();
  const saveNote = useUpdateNote();

  /* Controlled selection; stale ids (before the tree loads or after a
   * delete cascade) fall back to the first note file — derived below. */
  const [selectedId, setSelectedId] = React.useState("");

  /* Controlled tree expansion (created folders expand automatically). */
  const [expandedIds, setExpandedIds] = React.useState<string[]>([]);

  /* Unsaved drafts per file id (live HTML + last-saved copy). Only
   * created on the FIRST edit; server content is the value until then. */
  const [drafts, setDrafts] = React.useState<DraftMap>({});

  /* Modal state (create / rename / delete). */
  const [dialog, setDialog] = React.useState<DialogSpec | null>(null);

  /* Effective selection. */
  const selectedNode = findNode(files, selectedId);
  const resolvedId = selectedNode ? selectedId : firstFileId(files);
  const resolvedNode = findNode(files, resolvedId);
  const isFolder = resolvedNode?.type === "folder";

  /* After creating a note we select it before the refetched tree
   * contains it. Hold on "loading workspace" instead of flashing the
   * previous selection, then clear the gate once the tree catches up
   * (state adjusted during render for a derived transition). */
  const [pendingSelectionId, setPendingSelectionId] = React.useState<
    string | null
  >(null);
  const awaitingSelection =
    pendingSelectionId !== null && findNode(files, pendingSelectionId) === null;
  if (pendingSelectionId !== null && !awaitingSelection) {
    setPendingSelectionId(null);
  }

  /* Selected note's content, addressed by its 1:1 file id. */
  const noteQuery = useNoteDetail(isFolder ? "" : resolvedId);

  /* Expand everything the first time the tree comes back. */
  const didExpandRef = React.useRef(false);
  React.useEffect(() => {
    if (didExpandRef.current || treeQuery.isPending || files.length === 0) {
      return;
    }
    setExpandedIds(collectFolderIds(files));
    didExpandRef.current = true;
  }, [files, treeQuery.isPending]);

  /* Display value: the local draft once editing started, otherwise the
   * server content. Refetches can never clobber unsaved edits because
   * the draft is authoritative from the first keystroke. */
  const draft = isFolder ? undefined : drafts[resolvedId];
  const serverContent = noteQuery.data?.content;
  const isDirty = draft !== undefined && draft.html !== draft.saved;

  /* Edits flow out of the editor into the draft map. */
  const onChange = (html: string) => {
    setDrafts((prev) => ({
      ...prev,
      [resolvedId]: {
        html,
        saved: prev[resolvedId]?.saved ?? serverContent ?? "",
        savedAt: prev[resolvedId]?.savedAt ?? null,
      },
    }));
  };

  /* The workbench Save button: PATCH /notes/:fileId. */
  const handleSave = async (file: WorkspaceFile) => {
    if (saveNote.isPending) return;
    const html = draft?.html;
    if (html === undefined) return;
    try {
      const saved = await saveNote.mutateAsync({
        fileId: file.id,
        content: html,
      });
      setDrafts((prev) => ({
        ...prev,
        [file.id]: {
          html: saved.content,
          saved: saved.content,
          savedAt: new Date().toLocaleTimeString(),
        },
      }));
    } catch {
      /* Save errors surface in the topbar while the note stays dirty. */
    }
  };

  /* Create folder / file at root or inside a folder. Selects the new
   * note and expands its destination folder. */
  const handleCreate = async (name: string) => {
    if (dialog?.kind !== "create" || !name) return;
    const row = await createFile.mutateAsync({
      name,
      type: dialog.type,
      parentId: dialog.parentId,
    });
    if (row.parentId) {
      setExpandedIds((prev) =>
        prev.includes(row.parentId!) ? prev : [...prev, row.parentId!]
      );
    }
    if (dialog.type === "file") {
      setSelectedId(row.id);
      // Gate: hold before the refetched tree contains the new file.
      setPendingSelectionId(row.id);
    }
  };

  const handleRename = async (name: string) => {
    if (dialog?.kind !== "rename" || !name) return;
    await updateFileMutation.mutateAsync({
      id: dialog.node.id,
      patch: { name },
    });
  };

  /* Delete: PURGE the draft + cached content of every cascaded id so
   * the UI never flashes stale "content" for ids that now 404. */
  const handleDelete = async () => {
    if (dialog?.kind !== "delete") return;
    const ids = collectIds(dialog.node);
    await deleteFileMutation.mutateAsync(dialog.node.id);
    ids.forEach((id) => {
      queryClient.removeQueries({ queryKey: noteKeys.detail(id) });
    });
    setDrafts((prev) => {
      const next = { ...prev };
      for (const id of ids) delete next[id];
      return next;
    });
    /* If the selection was inside the deleted subtree, drop it so the
     * derived fallback picks the first remaining note file. */
    if (ids.includes(selectedId)) setSelectedId("");
  };

  const openCreate = (
    type: WorkspaceNodeType,
    folder: WorkspaceFile | null
  ) => {
    setDialog({
      kind: "create",
      type,
      parentId: folder ? folder.id : null,
      parentName: folder ? folder.name : "the workspace root",
    });
  };

  /* Content area states. */
  const renderContent = () => {
    if (treeQuery.isPending) {
      return (
        <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 aria-hidden className="size-4 animate-spin" />
          Loading workspace…
        </div>
      );
    }
    if (treeQuery.isError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Couldn&apos;t load your notes workspace.
            {treeQuery.error instanceof Error
              ? ` ${treeQuery.error.message}`
              : ""}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => treeQuery.refetch()}
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
            No folders or notes yet. Create your first folder or note to get
            started.
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openCreate("folder", null)}
            >
              New folder
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => openCreate("file", null)}
            >
              New note
            </Button>
          </div>
        </div>
      );
    }
    if (isFolder) {
      return (
        <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
          This is a folder — pick a note inside it to edit, or create a new
          one.
        </div>
      );
    }
    /* A just-created note is selected but the refetched tree hasn't
     * rendered it yet — hold the workspace instead of flashing content. */
    if (awaitingSelection) {
      return (
        <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 aria-hidden className="size-4 animate-spin" />
          Loading workspace…
        </div>
      );
    }
    /* Content available? Draft edits are authoritative; otherwise the
     * server payload ("" counts — it means a freshly created note). */
    if (draft !== undefined || serverContent !== undefined) {
      return (
        <RichTextEditor
          value={draft?.html ?? serverContent ?? ""}
          onValueChange={onChange}
          toolbarOptions={NOTE_TOOLBAR}
          placeholder="Start writing your note…"
          label="Note editor"
          minHeight="320px"
          className="flex h-full w-full flex-col rounded-none border-0 shadow-none focus-within:ring-0"
          editorClassName="flex-1 overflow-y-auto"
        />
      );
    }
    if (noteQuery.isError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Couldn&apos;t load this note.
            {noteQuery.error instanceof Error
              ? ` ${noteQuery.error.message}`
              : ""}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => noteQuery.refetch()}
          >
            <RefreshCw aria-hidden />
            Retry
          </Button>
        </div>
      );
    }
    return (
      <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 aria-hidden className="size-4 animate-spin" />
        Loading note…
      </div>
    );
  };

  return (
    <>
      <div className="min-w-0">
        <EditorWorkbench
          files={files}
          value={resolvedId}
          onValueChange={setSelectedId}
          expandedIds={expandedIds}
          onExpandedIdsChange={setExpandedIds}
          dirty={isDirty}
          onSave={handleSave}
          className="h-[calc(100vh-88px)]"
          renderItemAction={(file) => (
            <NodeMenu
              file={file}
              onCreateIn={openCreate}
              onRename={(node) => setDialog({ kind: "rename", node })}
              onDelete={(node) => setDialog({ kind: "delete", node })}
            />
          )}
          actions={
            <>
              {saveNote.isPending ? (
                <span className="hidden px-1 text-xs text-muted-foreground sm:inline">
                  Saving…
                </span>
              ) : null}
              {saveNote.isError ? (
                <span
                  role="alert"
                  className="hidden max-w-40 truncate px-1 text-xs text-destructive sm:inline"
                >
                  {mutationMessage(saveNote.error)}
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
                aria-label="New note at the workspace root"
                onClick={() => openCreate("file", null)}
              >
                <Plus />
              </Button>
            </>
          }
        >
          {renderContent()}
        </EditorWorkbench>
      </div>

      {dialog?.kind === "create" ? (
        <NameDialog
          key={`create/${dialog.type}/${dialog.parentId ?? "root"}`}
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
          nodeType={dialog.type}
          title={dialog.type === "file" ? "New note" : "New folder"}
          description={`Created inside ${dialog.parentName}.`}
          placeholder={dialog.type === "file" ? "my-note.html" : "My folder"}
          submitLabel="Create"
          onSubmit={handleCreate}
        />
      ) : null}

      {dialog?.kind === "rename" ? (
        <NameDialog
          key={`rename/${dialog.node.id}`}
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
          nodeType={dialog.node.type}
          title="Rename"
          description={`Enter a new name for “${dialog.node.name}”.`}
          initialName={dialog.node.name}
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
