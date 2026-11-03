"use client";

import * as React from "react";
import {
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import { Section, SectionCard } from "@/components/shared/Section";
import {
  ExpertFormDrawer,
  htmlToPlainText,
  type ExpertFormValues,
} from "@/components/dashboard/experts/expert-form-drawer";
import { ExpertCardSkeleton } from "@/components/skeletons/expert-card-skeleton";
import { Button } from "@/components/ui/button";
import {
  useCreateExpert,
  useDeleteExpert,
  useExpertsList,
  useUpdateExpert,
} from "@/hooks/use-experts";
import type { Expert } from "@/types/expert.type";

const PAGE_SIZE = 20;

/** Shown date format for the card sub-line. */
function formatCreated(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** First letter used as the avatar glyph. */
function initial(title: string): string {
  return title.trim().charAt(0).toUpperCase() || "E";
}

export default function ExpertsPage() {
  const [page, setPage] = React.useState(1);
  const query = useExpertsList({
    page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const data = query.data;

  const createExpertMutation = useCreateExpert();
  const updateExpertMutation = useUpdateExpert();
  const deleteExpertMutation = useDeleteExpert();

  /* Add / edit drawer state: null = closed. */
  const [drawer, setDrawer] = React.useState<
    { mode: "create" } | { mode: "edit"; expert: Expert } | null
  >(null);
  const closeDrawer = () => setDrawer(null);

  const submitDrawer = (values: ExpertFormValues) => {
    if (drawer?.mode === "edit") {
      updateExpertMutation.mutate(
        { id: drawer.expert.id, patch: values },
        { onSuccess: closeDrawer }
      );
    } else {
      createExpertMutation.mutate(values, { onSuccess: closeDrawer });
    }
  };

  const drawerBusy =
    drawer?.mode === "edit" ? updateExpertMutation : createExpertMutation;

  const removeExpert = (expert: Expert) => {
    deleteExpertMutation.mutate(expert.id);
  };

  return (
    <Section
      title="Experts"
      description="Your AI specialists — each one an instruction set you can reuse."
      action={
        <>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setDrawer({ mode: "create" })}
          >
            <Plus className="size-4" />
            Add expert
          </Button>
          <ExpertFormDrawer
            open={drawer !== null}
            onOpenChange={(open) => !open && closeDrawer()}
            expert={drawer?.mode === "edit" ? drawer.expert : undefined}
            isPending={drawerBusy.isPending}
            error={drawerBusy.error?.message ?? undefined}
            onSubmit={submitDrawer}
          />
        </>
      }
      totalItems={data?.total ?? 0}
      pageSize={PAGE_SIZE}
      page={page}
      onPageChange={setPage}
      columns={4}
      emptyState={
        <SectionCard
          title="No experts yet"
          description="Add your first expert with the button above."
          className="justify-center py-8 text-center"
        />
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
        ? Array.from({ length: 8 }, (_, i) => <ExpertCardSkeleton key={i} />)
        : data?.items.map((expert) => (
            <ExpertCard
              key={expert.id}
              expert={expert}
              onEdit={(e) => setDrawer({ mode: "edit", expert: e })}
              onDelete={removeExpert}
            />
          ))}
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

function ExpertCard({
  expert,
  onEdit,
  onDelete,
}: {
  expert: Expert;
  onEdit: (expert: Expert) => void;
  onDelete: (expert: Expert) => void;
}) {
  const plain = htmlToPlainText(expert.description ?? "");

  return (
    <SectionCard
      size="sm"
      className="h-full"
      title={expert.title}
      description={formatCreated(expert.updatedAt)}
      lead={
        <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-secondary-foreground">
          {initial(expert.title)}
        </span>
      }
      action={
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${expert.title}`}
            onClick={() => onEdit(expert)}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Delete ${expert.title}`}
            onClick={() => onDelete(expert)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      }
      footer={
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          disabled={!plain}
          onClick={() =>
            window.navigator.clipboard.writeText(plain)
          }
        >
          Copy
        </Button>
      }
    >
      {expert.description ? (
        <div
          className="line-clamp-4 [&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_li]:ml-4 [&_li]:list-disc [&_ol_li]:list-decimal [&_p]:text-sm [&_p]:text-muted-foreground [&_pre]:overflow-hidden [&_pre]:rounded [&_pre]:bg-muted [&_pre]:p-2 [&_pre]:text-xs [&_ul_li]:list-disc"
          dangerouslySetInnerHTML={{ __html: expert.description }}
        />
      ) : (
        <p className="text-sm italic text-muted-foreground">No description.</p>
      )}
    </SectionCard>
  );
}
