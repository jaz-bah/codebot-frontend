"use client";

import * as React from "react";
import {
  Check,
  Copy,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import {
  CodeEditor,
  type CodeEditorLanguage,
} from "@/components/code-editor";
import { Section, SectionCard } from "@/components/shared/Section";
import {
  PresetFormDrawer,
  type PresetFormValues,
} from "@/components/dashboard/presets/preset-form-drawer";
import { PresetCardSkeleton } from "@/components/skeletons/preset-card-skeleton";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/dashboard/posts/share-button";
import {
  useCreatePreset,
  useDeletePreset,
  usePresetsList,
  useUpdatePreset,
} from "@/hooks/use-presets";
import type { Preset } from "@/types/preset.type";

const PAGE_SIZE = 9;

export default function PresetsPage() {
  const [page, setPage] = React.useState(1);
  const query = usePresetsList({
    page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const data = query.data;

  const createPresetMutation = useCreatePreset();
  const updatePresetMutation = useUpdatePreset();
  const deletePresetMutation = useDeletePreset();

  /* Add / edit drawer state: null = closed. */
  const [drawer, setDrawer] = React.useState<
    { mode: "create" } | { mode: "edit"; preset: Preset } | null
  >(null);
  const closeDrawer = () => setDrawer(null);

  const submitDrawer = (values: PresetFormValues) => {
    if (drawer?.mode === "edit") {
      updatePresetMutation.mutate(
        { id: drawer.preset.id, patch: values },
        { onSuccess: closeDrawer }
      );
    } else {
      createPresetMutation.mutate(values, { onSuccess: closeDrawer });
    }
  };

  const drawerBusy =
    drawer?.mode === "edit" ? updatePresetMutation : createPresetMutation;

  return (
    <Section
      title="Presets"
      description="Reusable code snippets saved straight into your clipboard-ready library."
      action={
        <>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setDrawer({ mode: "create" })}
          >
            <Plus className="size-4" />
            New preset
          </Button>
          <PresetFormDrawer
            open={drawer !== null}
            onOpenChange={(open) => !open && closeDrawer()}
            preset={drawer?.mode === "edit" ? drawer.preset : undefined}
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
      columns={3}
      emptyState={
        <SectionCard
          title="No presets yet"
          description="Add your first preset with the button above."
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

      {query.isPending
        ? Array.from({ length: 6 }, (_, i) => <PresetCardSkeleton key={i} />)
        : data?.items.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              onEdit={(p) => setDrawer({ mode: "edit", preset: p })}
              onDelete={(p) => deletePresetMutation.mutate(p.id)}
            />
          ))}
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Card (same design as before, now wired to the API)                  */
/* ------------------------------------------------------------------ */

function PresetCard({
  preset,
  onEdit,
  onDelete,
}: {
  preset: Preset;
  onEdit: (preset: Preset) => void;
  onDelete: (preset: Preset) => void;
}) {
  const [copied, setCopied] = React.useState(false);
  const timerRef = React.useRef<number | null>(null);

  React.useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    []
  );

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(preset.data);
      setCopied(true);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* Clipboard unavailable (permissions / insecure origin). */
    }
  };

  return (
    <SectionCard
      title={preset.name}
      action={
        <div className="flex items-center gap-1" aria-label="Preset actions">
          <span
            className="mr-1 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium tracking-wide text-muted-foreground"
            aria-label={`Language: ${preset.language}`}
          >
            {preset.language}
          </span>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={copied ? "Code copied" : "Copy preset code"}
            onClick={copyCode}
          >
            {copied ? (
              <Check className="text-success" />
            ) : (
              <Copy />
            )}
          </Button>
          <ShareButton
            resourceType="preset"
            resourceId={preset.id}
            defaultTitle={preset.name}
          />
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Edit preset"
            onClick={() => onEdit(preset)}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label="Delete preset"
            onClick={() => onDelete(preset)}
          >
            <Trash2 />
          </Button>
        </div>
      }
    >
      <CodeEditor
        language={preset.language as CodeEditorLanguage}
        defaultValue={preset.data}
        readOnly
        label={`${preset.name} code`}
        /* Editor snug to the code so short presets don't render as a void. */
        height={`${Math.min(Math.max(preset.data.split("\n").length * 21 + 32, 140), 320)}px`}
        className="-mx-4 -mb-4 rounded-none border-0 shadow-none focus-within:ring-0"
      />
    </SectionCard>
  );
}
