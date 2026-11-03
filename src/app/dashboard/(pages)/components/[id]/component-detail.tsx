"use client";

/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, RotateCcw, Trash2, TriangleAlert } from "lucide-react";

import { ComponentWorkspace } from "@/components/dashboard/components/component-workspace";
import {
  ComponentFormDialog,
  type ComponentFormValues,
} from "@/components/dashboard/components/component-form-dialog";
import { SectionCard } from "@/components/shared/Section";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useComponentDetail,
  useDeleteComponent,
  useUpdateComponent,
} from "@/hooks/use-components";
import { ROUTES } from "@/constants/routes";

/* ================================================================== */

/**
 * Full editable view of one component: metadata row (preview, name,
 * edit details / delete) plus the IDE-style file workspace. The host
 * page keys this component by route id so drafts reset between components.
 */
export function ComponentDetail({ id }: { id: string }) {
  const router = useRouter();
  const query = useComponentDetail(id);
  const component = query.data;

  const updateMutation = useUpdateComponent();
  const deleteMutation = useDeleteComponent();

  /* Metadata dialog: null = closed; opening reuses the loaded component. */
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        router.push(ROUTES.dashboard.components);
      },
    });
  };

  const handleSubmit = (values: ComponentFormValues) => {
    // Metadata-only patch: the `files` key stays omitted.
    updateMutation.mutate(
      { id, patch: { name: values.name, preview: values.preview } },
      { onSuccess: () => setDialogOpen(false) }
    );
  };

  if (query.isPending) {
    return <Skeleton className="h-[calc(100vh-96px)] w-full rounded-xl" />;
  }

  if (query.error || !component) {
    const message =
      (query.error as { message?: string } | null)?.message ??
      "This component may have been deleted or belongs to another account.";

    return (
      <div className="min-w-0">
        <BackLink />
        <SectionCard
          className="mt-4 justify-center py-10 text-center"
          title="Component not found"
          description={message}
        >
          <div className="flex justify-center gap-2">
            {query.error ? (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => query.refetch()}
              >
                <RotateCcw className="size-3.5" />
                Retry
              </Button>
            ) : null}
            <Button
              size="sm"
              variant="outline"
              render={<Link href={ROUTES.dashboard.components} />}
            >
              Back to components
            </Button>
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <BackLink className="mb-2" />
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <img
              src={component.preview}
              alt=""
              className="size-10 shrink-0 rounded-lg border object-cover"
            />
            <div className="min-w-0">
              <h2 className="font-heading truncate text-lg font-semibold">
                {component.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {component.files.length} file
                {component.files.length === 1 ? "" : "s"} · updated{" "}
                {new Date(component.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={deleteMutation.isPending}
            className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="size-4" />
            {deleteMutation.isPending ? "Deleting…" : "Delete"}
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => setDialogOpen(true)}>
            <Pencil className="size-4" />
            Edit details
          </Button>
        </div>
      </div>

      {deleteMutation.error && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <TriangleAlert className="size-4 shrink-0" />
          <span>{deleteMutation.error.message}</span>
        </div>
      )}

      {/*
       * The workspace owns the draft file state; `mutateAsync` resolves
       * when the server accepted the replacement set. Keyed errors: the
       * same update mutation serves the metadata dialog, so only surface
       * the message in the surface that triggered it.
       */}
      <ComponentWorkspace
        component={component}
        isSaving={updateMutation.isPending}
        onSave={async (componentId, patch) => {
          await updateMutation.mutateAsync({ id: componentId, patch });
        }}
        error={
          updateMutation.error && updateMutation.variables?.patch.files
            ? updateMutation.error.message
            : undefined
        }
      />

      <ComponentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        component={component}
        isPending={updateMutation.isPending}
        error={
          updateMutation.error && !updateMutation.variables?.patch.files
            ? updateMutation.error.message
            : undefined
        }
        onSubmit={handleSubmit}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function BackLink({ className }: { className?: string }) {
  return (
    <Link
      href={ROUTES.dashboard.components}
      className={
        (
          "inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground "
        ) + (className ?? "")
      }
    >
      <ArrowLeft className="size-3.5" />
      Back to components
    </Link>
  );
}
