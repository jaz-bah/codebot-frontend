"use client";

import * as React from "react";
import {
  Archive,
  Download,
  FileCode2,
  FileImage,
  FileSpreadsheet,
  FileText,
  Film,
  Pencil,
  Plus,
  Presentation,
  RotateCcw,
  Settings,
  TriangleAlert,
  Trash2,
} from "lucide-react";
import Link from "next/link";

import { Section, SectionCard } from "@/components/shared/Section";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete";
import { FileCardSkeleton } from "@/components/skeletons/file-card-skeleton";
import { DocumentUploadDialog } from "@/components/dashboard/files/document-upload-dialog";
import { DocumentEditDialog } from "@/components/dashboard/files/document-edit-dialog";
import { Button } from "@/components/ui/button";
import {
  useCreateDocument,
  useDeleteDocument,
  useDocumentsList,
  useUpdateDocument,
} from "@/hooks/use-documents";
import { useSettings } from "@/hooks/use-settings";
import type { Document } from "@/types/document.type";
import type { LucideIcon } from "lucide-react";

const PAGE_SIZE = 20;

/* ------------------------------------------------------------------ */
/* Kind detection                                                      */
/* ------------------------------------------------------------------ */

type FileKind =
  "document" | "image" | "code" | "sheet" | "media" | "archive" | "slides";

const KIND_META: Record<FileKind, { icon: LucideIcon; label: string }> = {
  document: { icon: FileText, label: "Document" },
  image: { icon: FileImage, label: "Image" },
  code: { icon: FileCode2, label: "Code" },
  sheet: { icon: FileSpreadsheet, label: "Spreadsheet" },
  media: { icon: Film, label: "Media" },
  archive: { icon: Archive, label: "Archive" },
  slides: { icon: Presentation, label: "Slides" },
};

const KIND_EXTENSIONS: Record<FileKind, string[]> = {
  image: ["png", "jpg", "jpeg", "webp", "gif", "svg", "avif", "bmp", "ico"],
  code: [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "css",
    "html",
    "py",
    "sql",
    "yml",
    "yaml",
    "sh",
    "md",
  ],
  sheet: ["xls", "xlsx", "csv", "ods"],
  media: ["mp4", "webm", "mov", "mp3", "wav", "ogg", "mkv"],
  archive: ["zip", "rar", "7z", "tar", "gz"],
  slides: ["ppt", "pptx", "key", "odp"],
  document: [], // fallback
};

/** Guess the card icon from the stored url / display name. */
function kindOf(doc: Document): FileKind {
  const file = doc.url.split("?")[0] ?? "";
  const ext = (file.split(".").pop() ?? "").toLowerCase();
  for (const [kind, extensions] of Object.entries(KIND_EXTENSIONS) as [
    FileKind,
    string[],
  ][]) {
    if (extensions.includes(ext)) return kind;
  }
  return "document";
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Shown date format for the card sub-line. */
function formatUpdated(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Filename part of the stored Cloudinary url (fallback when the editable
 * name is stale or ambiguous). */
function urlFilename(doc: Document): string {
  const withoutQuery = doc.url.split("?")[0] ?? "";
  const segments = withoutQuery.split("/");
  return segments.at(-1) ?? withoutQuery;
}

/** Triggers a browser download of the Cloudinary asset. */
function downloadDocument(doc: Document) {
  const anchor = window.document.createElement("a");
  anchor.href = doc.url;
  anchor.download = doc.name;
  anchor.target = "_blank";
  anchor.rel = "noopener";
  window.document.body.append(anchor);
  anchor.click();
  anchor.remove();
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function FilesPage() {
  const [page, setPage] = React.useState(1);

  const query = useDocumentsList({
    page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const data = query.data;

  /* Cloudinary setup gate: files can't be uploaded or listed without the
   * user's own Cloudinary credentials (settings-api-guide.md). */
  const settings = useSettings();
  const cloudinaryFields = settings.data
    ? ([
        settings.data.cloudinaryCloudName,
        settings.data.cloudinaryApiKey,
        settings.data.cloudinaryApiSecret,
      ] as const)
    : null;
  const isCloudinaryConfigured =
    cloudinaryFields === null
      ? true // settings not loaded yet — don't nag before we know
      : cloudinaryFields.every((value) => Boolean(value));
  const isCheckingSettings = settings.isPending;

  const createDocumentMutation = useCreateDocument();
  const updateDocumentMutation = useUpdateDocument();
  const deleteDocumentMutation = useDeleteDocument();

  /* Dialog state: null = closed. */
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<Document | null>(null);
  const closeEdit = () => setEditTarget(null);
  /* Delete goes through a confirm; success closes it. */
  const [deleteTarget, setDeleteTarget] = React.useState<Document | null>(null);

  const confirmRemoveDocument = () => {
    if (!deleteTarget) return;
    deleteDocumentMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const submitEdit = (values: { name: string; description: string | null }) => {
    if (!editTarget) return;
    updateDocumentMutation.mutate(
      { id: editTarget.id, patch: values },
      { onSuccess: closeEdit },
    );
  };

  return (
    <Section
      title="Files"
      description="Documents, media and exports saved to your workspace."
      action={
        <>
          <Button
            size="sm"
            className="gap-1.5"
            disabled={!isCloudinaryConfigured && !isCheckingSettings}
            onClick={() => setUploadOpen(true)}
          >
            <Plus className="size-4" />
            Upload file
          </Button>
          <DocumentUploadDialog
            open={uploadOpen}
            onOpenChange={setUploadOpen}
            isPending={createDocumentMutation.isPending}
            error={createDocumentMutation.error?.message}
            onSubmit={(values) => {
              createDocumentMutation.mutate(values, {
                onSuccess: () => setUploadOpen(false),
              });
            }}
          />
          <DocumentEditDialog
            open={editTarget !== null}
            onOpenChange={(open) => !open && closeEdit()}
            document={editTarget ?? undefined}
            isPending={updateDocumentMutation.isPending}
            error={updateDocumentMutation.error?.message}
            onSubmit={submitEdit}
          />
        </>
      }
      headerExtra={
        !isCheckingSettings && !isCloudinaryConfigured ? (
          <div className="flex flex-wrap items-center gap-3 rounded-lg bg-warning/10 px-3 py-2.5 text-sm text-warning">
            <TriangleAlert className="size-4 shrink-0" />
            <span className="flex-1">
              Cloudinary isn&apos;t set up yet — files are stored in your own
              Cloudinary account. Add your credentials to start uploading.
            </span>
            <Button
              size="xs"
              className="gap-1.5"
              render={<Link href="/dashboard/settings" />}
            >
              <Settings className="size-3.5" />
              Set up now
            </Button>
          </div>
        ) : undefined
      }
      totalItems={data?.total ?? 0}
      pageSize={PAGE_SIZE}
      page={page}
      onPageChange={setPage}
      columns={4}
      emptyState={
        <SectionCard
          title="No files yet"
          description={
            isCheckingSettings || isCloudinaryConfigured
              ? "Upload your first file with the button above."
              : "Set up Cloudinary first, then upload your first file."
          }
          className="justify-center py-8 text-center"
        />
      }
    >
      {!isCheckingSettings && !isCloudinaryConfigured ? null : (
        <>
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
            ? Array.from({ length: 8 }, (_, i) => <FileCardSkeleton key={i} />)
            : data?.items.map((doc) => (
                <FileCard
                  key={doc.id}
                  doc={doc}
                  isDeleting={deleteDocumentMutation.isPending}
                  onEdit={setEditTarget}
                  onDelete={setDeleteTarget}
                />
              ))}
        </>
      )}
      {/* keepPreviousData: stale cards stay visible while the next page
          refetches (see placeholderData in use-documents). */}
      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        label={deleteTarget ? `“${deleteTarget.name}”` : "this file"}
        error={deleteDocumentMutation.error?.message}
        isPending={deleteDocumentMutation.isPending}
        onSubmit={confirmRemoveDocument}
      />
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

type FileCardProps = {
  doc: Document;
  isDeleting: boolean;
  onEdit: (document: Document) => void;
  onDelete: (doc: Document) => void;
};

function FileCard({ doc, isDeleting, onEdit, onDelete }: FileCardProps) {
  const kind = kindOf(doc);
  const meta = KIND_META[kind];
  const Icon = meta.icon;

  return (
    <SectionCard
      size="sm"
      className="h-full"
      title={<span className="line-clamp-2 break-all">{doc.name}</span>}
      description={
        <span className="block truncate">
          {meta.label} · {formatUpdated(doc.updatedAt)}
        </span>
      }
      lead={
        <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-secondary-foreground">
          <Icon className="size-4 text-secondary-foreground" />
        </span>
      }
      action={
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${doc.name}`}
            onClick={() => onEdit(doc)}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Delete ${doc.name}`}
            disabled={isDeleting}
            onClick={() => onDelete(doc)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      }
      footer={
        <div className="flex w-full flex-col items-stretch gap-2.5">
          <p className="truncate text-xs text-muted-foreground/70">
            {urlFilename(doc)}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1.5"
            onClick={() => downloadDocument(doc)}
          >
            <Download className="size-3.5" />
            Download
          </Button>
        </div>
      }
    >
      {doc.description ? (
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {doc.description}
        </p>
      ) : null}
    </SectionCard>
  );
}
