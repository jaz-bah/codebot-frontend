"use client";

import * as React from "react";
import { RotateCcw, Trash2, TriangleAlert } from "lucide-react";

import { CodeEditor } from "@/components/code-editor";
import { EditorWorkbench, type WorkspaceFile } from "@/components/editor-workspace";
import {
  SnippetFormDialog,
  type SnippetFormValues,
} from "@/components/dashboard/ide-snippet/snippet-form-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateIdeSnippet,
  useDeleteIdeSnippet,
  useIdeSnippetsList,
  useUpdateIdeSnippet,
} from "@/hooks/use-ide-snippets";
import type { CodeEditorLanguage } from "@/components/code-editor";
import type { IdeSnippet } from "@/types/ide-snippet.type";

/* The workbench shows the whole (paginated) list in the file tree. */
const PAGE_LIMIT = 100;

const listParams = {
  page: 1,
  limit: PAGE_LIMIT,
  sortBy: "createdAt" as const,
  sortOrder: "desc" as const,
};

/** Stable, unique display name for a snippet file row. */
function fileRowName(snippet: IdeSnippet): string {
  const short = snippet.id.slice(0, 6);
  return `${snippet.language} · ${short}`;
}

/** Shown time for the "Saved …" indicator. */
function nowTime(): string {
  return new Date().toLocaleTimeString();
}

export default function IdeSnippetPage() {
  const query = useIdeSnippetsList(listParams);
  const items = query.data?.items ?? [];

  const createSnippetMutation = useCreateIdeSnippet();
  const updateSnippetMutation = useUpdateIdeSnippet();
  const deleteSnippetMutation = useDeleteIdeSnippet();

  /* Selected snippet id; falls back to the first one when missing. */
  const [selectedId, setSelectedId] = React.useState<string>("");
  const active = items.find((snippet) => snippet.id === selectedId) ?? items[0] ?? null;

  /* Live code per snippet id; only touched once the user edits it.
   * Server data (`snippet.data`) is the never-edited baseline. */
  const [contents, setContents] = React.useState<Record<string, string>>({});

  /* New snippet dialog: null = closed. */
  const [dialogOpen, setDialogOpen] = React.useState(false);

  /* Last save time for the topbar indicator. */
  const [savedAt, setSavedAt] = React.useState<string | null>(null);

  /* Flat file tree — one row per snippet, no folders. */
  const files = React.useMemo<WorkspaceFile[]>(
    () =>
      items.map((snippet) => ({
        id: snippet.id,
        name: fileRowName(snippet),
        type: "file" as const,
      })),
    [items]
  );

  /* Dirty only once the user has actually edited the live doc. */
  const dirty =
    active !== null &&
    contents[active.id] !== undefined &&
    contents[active.id] !== active.data;

  const activeCode = active ? (contents[active.id] ?? active.data) : "";

  const saveActive = () => {
    if (!active) return;
    updateSnippetMutation.mutate(
      { id: active.id, patch: { data: contents[active.id] ?? active.data } },
      { onSuccess: () => setSavedAt(nowTime()) }
    );
  };

  const removeSnippet = (snippet: IdeSnippet) => {
    deleteSnippetMutation.mutate(snippet.id);
  };

  const submitDialog = (values: SnippetFormValues) => {
    createSnippetMutation.mutate(values, {
      onSuccess: (created) => {
        setDialogOpen(false);
        setSelectedId(created.id);
        setContents((prev) => ({ ...prev, [created.id]: created.data }));
      },
    });
  };

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="font-heading text-lg font-semibold">IDE Snippet</h2>
          <p className="text-sm text-muted-foreground">
            Small code snippets stored verbatim — pick one in the tree and edit.
          </p>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          New snippet
        </Button>
      </div>

      {query.error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <TriangleAlert className="size-4 shrink-0" />
          <span>
            {(query.error as { message?: string } | null)?.message ??
              "Something went wrong."}
          </span>
          <Button
            variant="ghost"
            size="xs"
            className="ml-auto gap-1.5"
            onClick={() => query.refetch()}
          >
            <RotateCcw className="size-3" />
            Retry
          </Button>
        </div>
      )}

      {query.isPending ? (
        <Card size="sm" className="h-[calc(100vh-176px)]">
          <Skeleton className="h-full w-full" />
        </Card>
      ) : active ? (
        <EditorWorkbench
          files={files}
          value={active?.id ?? ""}
          onValueChange={setSelectedId}
          onSave={saveActive}
          dirty={dirty}
          label="Snippets"
          className="h-[calc(100vh-176px)]"
          actions={
            savedAt ? (
              <span className="hidden px-1 text-xs text-muted-foreground sm:inline">
                Saved {savedAt}
              </span>
            ) : null
          }
          renderItemAction={(file: WorkspaceFile) =>
            file.type === "folder" ? null : (
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Delete snippet ${file.name}`}
                onClick={() => {
                  const target = items.find((snippet) => snippet.id === file.id);
                  if (target) removeSnippet(target);
                }}
              >
                <Trash2 className="size-3.5" />
              </Button>
            )
          }
        >
          <CodeEditor
            language={active.language as CodeEditorLanguage}
            value={activeCode}
            onValueChange={(next) =>
              setContents((prev) => ({ ...prev, [active.id]: next }))
            }
            label={`${fileRowName(active)} source`}
            height="100%"
            lineWrapping
            className="h-full rounded-none border-0 shadow-none focus-within:ring-0"
          />
        </EditorWorkbench>
      ) : (
        <Card size="sm" className="grid h-[calc(100vh-176px)] place-items-center">
          <div className="space-y-1 text-center">
            <p className="font-medium">No snippets yet</p>
            <p className="text-sm text-muted-foreground">
              Add your first snippet with the button above.
            </p>
          </div>
        </Card>
      )}

      <SnippetFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        isPending={createSnippetMutation.isPending}
        error={createSnippetMutation.error?.message ?? undefined}
        onSubmit={submitDialog}
      />
    </div>
  );
}
