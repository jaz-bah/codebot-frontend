"use client";

import * as React from "react";
import {
  Download,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import { Section, SectionCard } from "@/components/shared/Section";
import {
  ToolFormDialog,
  type ToolFormValues,
} from "@/components/dashboard/tools/tool-form-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateTool,
  useDeleteTool,
  useToolsList,
  useUpdateTool,
} from "@/hooks/use-tools";
import type { Tool } from "@/types/tool.type";

const PAGE_SIZE = 20;

/** Shown date format for the Updated column. */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ToolsPage() {
  const [page, setPage] = React.useState(1);
  const query = useToolsList({
    page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const data = query.data;

  const createToolMutation = useCreateTool();
  const updateToolMutation = useUpdateTool();
  const deleteToolMutation = useDeleteTool();

  /* Add / edit dialog state: null = closed. */
  const [dialog, setDialog] = React.useState<
    { mode: "create" } | { mode: "edit"; tool: Tool } | null
  >(null);
  const closeDialog = () => setDialog(null);

  const submitDialog = (values: ToolFormValues) => {
    if (dialog?.mode === "edit") {
      updateToolMutation.mutate(
        { id: dialog.tool.id, patch: values },
        { onSuccess: closeDialog }
      );
    } else {
      createToolMutation.mutate(values, { onSuccess: closeDialog });
    }
  };

  const dialogBusy =
    dialog?.mode === "edit" ? updateToolMutation : createToolMutation;

  const removeTool = (tool: Tool) => {
    deleteToolMutation.mutate(tool.id);
  };

  return (
    <Section
      title="Tools"
      description="Your downloadable utilities with one-click links."
      action={
        <>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setDialog({ mode: "create" })}
          >
            <Plus className="size-4" />
            Add tool
          </Button>
          <ToolFormDialog
            open={dialog !== null}
            onOpenChange={(open) => !open && closeDialog()}
            tool={dialog?.mode === "edit" ? dialog.tool : undefined}
            isPending={dialogBusy.isPending}
            error={dialogBusy.error?.message ?? undefined}
            onSubmit={submitDialog}
          />
        </>
      }
      totalItems={data?.total ?? 0}
      pageSize={PAGE_SIZE}
      page={page}
      onPageChange={setPage}
      columns={1}
      emptyState={
        <SectionCard
          title="No tools yet"
          description="Add your first tool with the button above."
          className="justify-center py-8 text-center"
        />
      }
    >
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
        <Card size="sm" className="py-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="hidden px-4 py-2.5 font-medium md:table-cell">
                  Description
                </th>
                <th className="hidden px-4 py-2.5 font-medium lg:table-cell">
                  Updated
                </th>
                <th className="px-4 py-2.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }, (_, i) => (
                <tr key={i} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-2.5"><Skeleton className="h-4 w-28" /></td>
                  <td className="hidden px-4 py-2.5 md:table-cell">
                    <Skeleton className="h-3 w-2/3" />
                  </td>
                  <td className="hidden px-4 py-2.5 lg:table-cell">
                    <Skeleton className="h-3 w-20" />
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1">
                      <Skeleton className="size-7 rounded-lg" />
                      <Skeleton className="size-7 rounded-lg" />
                      <Skeleton className="size-7 rounded-lg" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        data &&
        data.items.length > 0 && (
          <ToolsTable
            items={data.items}
            onEdit={(tool) => setDialog({ mode: "edit", tool })}
            onDelete={removeTool}
          />
        )
      )}
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Table                                                               */
/* ------------------------------------------------------------------ */

function ToolsTable({
  items,
  onEdit,
  onDelete,
}: {
  items: Tool[];
  onEdit: (tool: Tool) => void;
  onDelete: (tool: Tool) => void;
}) {
  return (
    <Card size="sm" className="py-0">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase text-muted-foreground">
            <th className="px-4 py-2.5 font-medium">Name</th>
            <th className="hidden px-4 py-2.5 font-medium md:table-cell">
              Description
            </th>
            <th className="hidden px-4 py-2.5 font-medium lg:table-cell">
              Updated
            </th>
            <th className="px-4 py-2.5 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((tool) => (
            <tr
              key={tool.id}
              className="border-b border-border/50 transition-colors last:border-0 hover:bg-muted/40"
            >
              <td className="px-4 py-2.5 align-middle font-medium whitespace-nowrap">
                {tool.name}
              </td>
              <td className="hidden max-w-md px-4 py-2.5 align-middle text-muted-foreground md:table-cell">
                <p className="line-clamp-2">
                  {tool.description || (
                    <span className="italic">No description.</span>
                  )}
                </p>
              </td>
              <td className="hidden px-4 py-2.5 align-middle text-xs whitespace-nowrap text-muted-foreground lg:table-cell">
                {formatDate(tool.updatedAt)}
              </td>
              <td className="px-4 py-2.5 align-middle">
                <div className="flex items-center justify-end gap-1">
                  <a
                    href={tool.downloadLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Download ${tool.name}`}
                    >
                      <Download className="size-3.5" />
                    </Button>
                  </a>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Edit ${tool.name}`}
                    onClick={() => onEdit(tool)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Delete ${tool.name}`}
                    onClick={() => onDelete(tool)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
