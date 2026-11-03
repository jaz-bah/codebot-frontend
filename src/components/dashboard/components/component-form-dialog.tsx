"use client";

/* eslint-disable @next/next/no-img-element */
import * as React from "react";

import {
  CodeEditor,
  type CodeEditorLanguage,
} from "@/components/code-editor";
import {
  ImagePlus,
  Loader2,
  Plus,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";

import { cn } from "cn";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUploadImage } from "@/hooks/use-uploads";
import {
  IMAGE_UPLOAD_EXTENSIONS,
  IMAGE_UPLOAD_MAX_BYTES,
} from "@/services/upload.service";
import type {
  Component,
  ComponentFileInput,
} from "@/types/component.type";

/* ------------------------------------------------------------------ */
/* Contract constants (mirrors the Joi schemas)                        */
/* ------------------------------------------------------------------ */

export const COMPONENT_LIMITS = {
  /** Max metadata length. */
  name: 255,
  /** Max preview URL length. */
  preview: 1000,
  /** Files per component. */
  files: 20,
  /** Verbatim code length per file. */
  code: 500_000,
  /** Extension (= language slug) length per file name. */
  fileLanguage: 20,
} as const;

/** Lowercase slug `a-z 0-9 _ -`, ≤ 20 chars (server normalizes case). */
export function isValidLanguage(language: string): boolean {
  return /^[a-z0-9_-]{1,20}$/.test(language.trim().toLowerCase());
}

/** "styles.css" → "css". The file name's extension doubles as the
 * language slug the API stores (files are nameless server-side), so the
 * extension must be a valid language slug. Dot-less names (or dotfiles
 * like ".env") are invalid. */
export function languageFromFileName(fileName: string): string | null {
  const value = fileName.trim().toLowerCase();
  const dot = value.lastIndexOf(".");
  if (dot <= 0) return null; // no extension (or ".env"-style dotfile)
  const extension = value.slice(dot + 1);
  return extension.length <= COMPONENT_LIMITS.fileLanguage &&
    /^[a-z0-9_-]{1,20}$/.test(extension)
    ? extension
    : null;
}

/** Absolute URL (`https://…`, `http://…`) or root-relative (`/…`). */
export function isValidPreview(preview: string): boolean {
  const value = preview.trim();
  return (
    value.startsWith("/") ||
    /^https?:\/\/\S+$/.test(value)
  );
}

/** Client-side pre-check before hitting POST /uploads/images (the backend
 * re-checks with magic bytes; this only filters obvious mistakes early). */
function imageFileError(file: File): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (
    !IMAGE_UPLOAD_EXTENSIONS.includes(
      extension as (typeof IMAGE_UPLOAD_EXTENSIONS)[number]
    )
  ) {
    return "Only jpg, png, webp or gif images are supported.";
  }
  if (file.size === 0) {
    return "That file is empty — pick an image with content.";
  }
  if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
    return "Image is larger than the 10 MB upload limit.";
  }
  return null;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/* ------------------------------------------------------------------ */
/* Form                                                                */
/* ------------------------------------------------------------------ */

export type ComponentFormValues = {
  name: string;
  /** Cloudinary URL saved as the component preview. */
  preview: string;
  /** Create mode only — edit mode patches metadata and leaves files alone. */
  files?: ComponentFileInput[];
};

export type ComponentFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present in edit mode (metadata only — files are managed in the workspace). */
  component?: Component;
  isPending: boolean;
  error?: string;
  onSubmit: (values: ComponentFormValues) => void;
};

/** New component / edit-metadata drawer. Remounts its fields per open so
 * the form is always pristine. */
export function ComponentFormDialog({
  open,
  onOpenChange,
  component,
  isPending,
  error,
  onSubmit,
}: ComponentFormDialogProps) {
  const isEdit = Boolean(component);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      {/* Remount per open/component so the form is always pristine. */}
      {open && (
        <ComponentFormFields
          key={component?.id ?? "create"}
          component={component}
          isPending={isPending}
          error={error}
          isEdit={isEdit}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      )}
    </Drawer>
  );
}

function ComponentFormFields({
  component,
  isPending,
  error,
  isEdit,
  onOpenChange,
  onSubmit,
}: {
  component?: Component;
  isPending: boolean;
  error?: string;
  isEdit: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ComponentFormValues) => void;
}) {
  const [name, setName] = React.useState(component?.name ?? "");
  /* The preview the API stores: the Cloudinary URL returned by the image
   * upload. Edit mode starts from the component's current preview. */
  const [preview, setPreview] = React.useState(component?.preview ?? "");
  /* Create mode: local file rows named by the user ("styles.css"…). The
   * API stores files nameless — only the extension (as `language`) —
   * so a row holds the entered name plus verbatim code; edit mode
   * never shows this section (files live in the workspace). */
  const [files, setFiles] = React.useState<{ name: string; code: string }[]>([
    { name: "", code: "" },
  ]);

  const uploadMutation = useUploadImage();
  const [pickedName, setPickedName] = React.useState<string | null>(null);
  const [pickedBytes, setPickedBytes] = React.useState<number | null>(null);
  const [imageError, setImageError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const pickImage = (picked: File | null) => {
    setImageError(null);
    if (!picked) {
      setPickedName(null);
      setPickedBytes(null);
      return;
    }
    const invalid = imageFileError(picked);
    if (invalid) {
      setImageError(invalid);
      return;
    }
    setPickedName(picked.name);
    setPickedBytes(picked.size);
    uploadMutation.mutate(picked, {
      onSuccess: (result) => {
        setPreview(result.url);
        setImageError(null);
      },
      onError: (mutationError) => {
        setPickedName(null);
        setPickedBytes(null);
        setImageError(
          mutationError.message || "The image upload failed — try again."
        );
      },
    });
  };

  const clearImage = () => {
    pickImage(null);
    setPreview("");
    setImageError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const isUploadingImage = uploadMutation.isPending;
  const isPreviewValid = isValidPreview(preview);

  const isNameValid = name.trim().length > 0;

  const canSubmit =
    isNameValid && isPreviewValid && !isPending && !isUploadingImage;
  /* Per-row language (the extension) + overall row problems. */
  const fileLanguages = files.map((file) => languageFromFileName(file.name));
  const hasInvalidFile = files.some(
    (file, index) => fileLanguages[index] === null || file.code.length === 0
  );
  /* Duplicate extensions → two rows map to the same stored language. */
  const hasDuplicateLanguage =
    new Set(fileLanguages.filter((l) => l !== null)).size !==
    fileLanguages.filter((l) => l !== null).length;
  const childFormErrors = hasInvalidFile || hasDuplicateLanguage;
  const canSubmitCreate = !isEdit && !childFormErrors && canSubmit;
  const canSubmitEdit = isEdit && canSubmit;

  const updateFile = (
    index: number,
    patch: Partial<{ name: string; code: string }>
  ) => {
    setFiles((prev) =>
      prev.map((file, i) => (i === index ? { ...file, ...patch } : file))
    );
  };

  const addFile = () => {
    setFiles((prev) =>
      prev.length >= COMPONENT_LIMITS.files
        ? prev
        : [...prev, { name: "", code: "" }]
    );
  };

  const removeFile = (index: number) => {
    setFiles((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    // `code` is stored verbatim — send it exactly as received. The file
    // name is form-only; the API receives the extension as `language`.
    onSubmit({
      name: name.trim(),
      preview: preview.trim(),
      files:
        isEdit
          ? // Metadata-only patch: the `files` key stays omitted so the
            // existing file set is left untouched.
            undefined
          : files.map((file, index) => ({
              language: fileLanguages[index] as string,
              code: file.code,
            })),
    });
  };

  return (
    <DrawerContent
      className="data-[swipe-axis=x]:inset-y-4! sm:[--drawer-content-width:36rem]!"
      style={
        { "--drawer-height": "calc(100dvh - 2rem)" } as React.CSSProperties
      }
    >
      <DrawerHeader className="pt-8">
        <DrawerTitle>{isEdit ? "Edit component" : "New component"}</DrawerTitle>
        <DrawerDescription>
          {isEdit
            ? "Update the name and preview image. Files are edited in the workspace."
            : "Name the component, pick a preview image and add its code files — everything is stored exactly as received."}
        </DrawerDescription>
      </DrawerHeader>
      <form
        id="component-form"
        onSubmit={handleSubmit}
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="component-name">Name</Label>
          <Input
            id="component-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Glass navbar"
            maxLength={COMPONENT_LIMITS.name}
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="component-preview">Preview image</Label>
          {/* Hidden input + dashed picker (document-upload pattern). */}
          <input
            ref={inputRef}
            id="component-preview"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={(event) =>
              pickImage(event.target.files?.[0] ?? null)
            }
          />
          {isPreviewValid ? (
            <div className="flex items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm dark:bg-input/30">
              <img
                src={preview.trim()}
                alt="Preview"
                className="size-9 shrink-0 rounded-md border object-cover"
              />
              <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                {pickedName ?? "Current image"} ·{" "}
                {pickedBytes !== null
                  ? formatBytes(pickedBytes)
                  : isEdit
                    ? "kept as-is"
                    : "uploaded"}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Remove preview image"
                onClick={clearImage}
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploadingImage}
              className={cn(
                "flex min-h-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-input px-4 py-4 text-sm text-muted-foreground transition-colors hover:border-ring hover:bg-muted/50",
                imageError && "border-destructive"
              )}
            >
              {isUploadingImage ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {pickedName
                    ? `Uploading ${pickedName}…`
                    : "Uploading image…"}
                </>
              ) : (
                <>
                  <ImagePlus className="size-5" />
                  Click to choose a preview image
                </>
              )}
            </button>
          )}
          {!isUploadingImage && (
            <span className="text-xs text-muted-foreground">
              JPG, PNG, WebP or GIF — up to 10 MB. Uploads to your Cloudinary
              and the URL is saved as the component preview.
            </span>
          )}
          {imageError && (
            <p className="text-xs text-destructive">
              {imageError}
            </p>
          )}
        </div>

        {!isEdit && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>Files ({files.length}/{COMPONENT_LIMITS.files})</Label>
              <Button
                type="button"
                variant="outline"
                size="xs"
                className="gap-1.5"
                onClick={addFile}
                disabled={files.length >= COMPONENT_LIMITS.files}
              >
                <Plus className="size-3.5" />
                Add file
              </Button>
            </div>

            {files.map((file, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 rounded-lg border p-3"
              >
                <div className="flex items-center gap-2">
                  <Input
                    value={file.name}
                    onChange={(event) =>
                      updateFile(index, { name: event.target.value })
                    }
                    placeholder="File name, e.g. styles.css"
                    className="h-7 w-52 font-mono text-xs"
                    aria-label={`File ${index + 1} name`}
                  />
                  <span className="text-xs text-muted-foreground">
                    {file.code.length.toLocaleString()} / 500,000
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="ml-auto text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Remove file ${index + 1}`}
                    onClick={() => removeFile(index)}
                    disabled={files.length <= 1}
                  >
                    <Trash2 />
                  </Button>
                </div>
                {/* CodeMirror — same engine as the workspace, verbatim input.
                 * Highlighting follows the extension (ts, css, json…). */}
                <CodeEditor
                  language={(fileLanguages[index] ?? "") as CodeEditorLanguage}
                  value={file.code}
                  onValueChange={(next) => updateFile(index, { code: next })}
                  label={`File ${index + 1} code`}
                  minHeight="200px"
                  lineWrapping
                  placeholder="Paste this file's code here…"
                />
              </div>
            ))}

            {hasInvalidFile && (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <TriangleAlert className="size-3.5 shrink-0" />
                Every file needs a name with an extension (e.g. styles.css —
                a-z, 0-9, `_`, `-`) and code.
              </p>
            )}
            {!hasInvalidFile && hasDuplicateLanguage && (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <TriangleAlert className="size-3.5 shrink-0" />
                Two files share an extension — each needs a distinct one
                (files are stored per language).
              </p>
            )}
            {!childFormErrors && (
              <p className="text-xs text-muted-foreground">
                The extension becomes the file&apos;s language (css, tsx, json…) —
                files are stored per language, not by full name.
              </p>
            )}
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>
      <DrawerFooter className="mt-0 flex-row items-center justify-between gap-2 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="component-form"
          size="sm"
          disabled={!(canSubmitCreate || canSubmitEdit)}
        >
          {isEdit ? "Save changes" : "Create component"}
        </Button>
      </DrawerFooter>
    </DrawerContent>
  );
}
