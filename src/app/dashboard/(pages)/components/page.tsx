/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import { Section, SectionCard } from "@/components/shared/Section";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete";
import {
  ComponentFormDialog,
  type ComponentFormValues,
} from "@/components/dashboard/components/component-form-dialog";
import { ComponentCardSkeleton } from "@/components/skeletons/component-card-skeleton";
import { ShareButton } from "@/components/dashboard/posts/share-button";
import { Button } from "@/components/ui/button";
import {
  useComponentsList,
  useCreateComponent,
  useDeleteComponent,
  useUpdateComponent,
} from "@/hooks/use-components";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { Component } from "@/types/component.type";

/* The API caps `limit` at 100; 9 cards per page matches the gallery grid. */
const PAGE_SIZE = 9;

/* ================================================================== */

export default function ComponentsPage() {
  const [page, setPage] = React.useState(1);

  const listParams = React.useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      sortBy: "createdAt" as const,
      sortOrder: "desc" as const,
    }),
    [page]
  );

  const query = useComponentsList(listParams);
  const data = query.data;

  const createComponentMutation = useCreateComponent();
  const updateComponentMutation = useUpdateComponent();
  const deleteComponentMutation = useDeleteComponent();

  /* Add / edit dialog state: null = closed. */
  const [dialog, setDialog] = React.useState<
    { mode: "create" } | { mode: "edit"; component: Component } | null
  >(null);
  const closeDialog = () => setDialog(null);

  const submitDialog = (values: ComponentFormValues) => {
    if (dialog?.mode === "edit") {
      updateComponentMutation.mutate(
        {
          id: dialog.component.id,
          patch: { name: values.name, preview: values.preview },
        },
        { onSuccess: closeDialog }
      );
    } else {
      createComponentMutation.mutate(
        {
          name: values.name,
          preview: values.preview,
          files: values.files ?? [],
        },
        { onSuccess: closeDialog }
      );
    }
  };

  const dialogMutation =
    dialog?.mode === "edit" ? updateComponentMutation : createComponentMutation;

  /* Pending destructive action: the component awaiting its confirm. */
  const [deleteTarget, setDeleteTarget] = React.useState<Component | null>(
    null
  );

  /* One-click delete routed through a shared confirm so destructive
   * actions never fire on a stray click. */
  const confirmRemoveComponent = () => {
    if (!deleteTarget) return;
    deleteComponentMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  return (
    <Section
      title="Components"
      description="Your component library: a preview image plus its code files, stored verbatim."
      action={
        <>
          <Button size="sm" className="gap-1.5" onClick={() => setDialog({ mode: "create" })}>
            <Plus className="size-4" />
            New component
          </Button>
          <ComponentFormDialog
            open={dialog !== null}
            onOpenChange={(open) => !open && closeDialog()}
            component={dialog?.mode === "edit" ? dialog.component : undefined}
            isPending={dialogMutation.isPending}
            error={dialogMutation.error?.message ?? undefined}
            onSubmit={submitDialog}
          />
        </>
      }
      headerExtra={
        <div className="flex flex-wrap items-center gap-2">
          {data !== undefined && (
            <span className="ml-auto text-xs text-muted-foreground">
              {data.total} component{data.total === 1 ? "" : "s"}
            </span>
          )}
        </div>
      }
      totalItems={data?.total ?? 0}
      pageSize={PAGE_SIZE}
      page={page}
      onPageChange={setPage}
      columns={3}
      emptyState={
        query.isPending ? null : (
          <SectionCard
            title="No components yet"
            description="Create your first component with the button above."
            className="justify-center py-8 text-center"
          />
        )
      }
    >
      {query.error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive sm:col-span-full">
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

      {query.isPending
        ? Array.from({ length: 6 }, (_, i) => <ComponentCardSkeleton key={i} />)
        : data?.items.map((component) => (
            <ComponentCard
              key={component.id}
              component={component}
              onEdit={(c) => setDialog({ mode: "edit", component: c })}
              onDelete={setDeleteTarget}
            />
          ))}

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        label={deleteTarget ? `“${deleteTarget.name}”` : "this component"}
        error={deleteComponentMutation.error?.message}
        isPending={deleteComponentMutation.isPending}
        onSubmit={confirmRemoveComponent}
      />
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

function ComponentCard({
  component,
  onEdit,
  onDelete,
}: {
  component: Component;
  onEdit: (component: Component) => void;
  onDelete: (component: Component) => void;
}) {
  return (
    <div className="group/card relative">
      <Link
        href={`${ROUTES.dashboard.components}/${component.id}`}
        aria-label={`Open ${component.name}`}
        className="block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <SectionCard
          className="h-full transition-[box-shadow,ring-color] group-hover/card:ring-foreground/20"
          header={
            <div className="aspect-video bg-muted">
              <img
                src={component.preview}
                alt={`${component.name} preview`}
                loading="lazy"
                className="aspect-video w-full bg-muted object-cover transition-transform duration-300 group-hover/card:scale-[1.03]"
              />
            </div>
          }
          footer={
            <div className="flex w-full items-center justify-between gap-2">
              {/* A header (preview) suppresses SectionCard's title —
               * the component name lives in the footer. */}
              <p className="min-w-0 truncate font-medium">{component.name}</p>
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-lg",
                  "bg-primary/10 text-primary transition-transform",
                  "group-hover/card:translate-x-0.5 group-hover/card:bg-primary group-hover/card:text-primary-foreground"
                )}
                aria-hidden
              >
                <ArrowRight className="size-3.5" />
              </span>
            </div>
          }
        />
      </Link>

      {/* Quick actions overlay the preview — outside the Link so the
          keyboard stops before them. */}
      <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 transition-opacity group-focus-within/card:opacity-100 group-hover/card:opacity-100">
        <ShareButton
          resourceType="component"
          resourceId={component.id}
          defaultTitle={component.name}
          className="bg-background/80 backdrop-blur hover:bg-background"
        />
        <Button
          variant="secondary"
          size="icon-xs"
          className="bg-background/80 backdrop-blur"
          aria-label={`Edit ${component.name} details`}
          onClick={() => onEdit(component)}
        >
          <Pencil />
        </Button>
        <Button
          variant="secondary"
          size="icon-xs"
          className="bg-background/80 text-destructive backdrop-blur hover:bg-background hover:text-destructive"
          aria-label={`Delete ${component.name}`}
          onClick={() => onDelete(component)}
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  );
}
