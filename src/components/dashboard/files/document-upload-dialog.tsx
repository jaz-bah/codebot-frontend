"use client";

import * as React from "react";
import { FilePlus2, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "cn";

export type DocumentUploadValues = {
  file: File;
  name?: string;
  description?: string;
};

export type DocumentUploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  error?: string;
  onSubmit: (values: DocumentUploadValues) => void;
};

/** Server limit for POST /documents (50 MB). */
const MAX_BYTES = 50 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Upload dialog for POST /documents. Remounts its fields per open so the
 * form is always pristine. */
export function DocumentUploadDialog({
  open,
  onOpenChange,
  isPending,
  error,
  onSubmit,
}: DocumentUploadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Remount per open so the form is always pristine. */}
      {open && (
        <DocumentUploadFields
          key="create"
          isPending={isPending}
          error={error}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      )}
    </Dialog>
  );
}

function DocumentUploadFields({
  isPending,
  error,
  onOpenChange,
  onSubmit,
}: Omit<DocumentUploadDialogProps, "open">) {
  const [file, setFile] = React.useState<File | null>(null);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const pickFile = (picked: File | null) => {
    setFileError(null);
    if (!picked) {
      setFile(null);
      return;
    }
    if (picked.size === 0) {
      setFileError("That file is empty — pick a file with content.");
      return;
    }
    if (picked.size > MAX_BYTES) {
      setFileError(
        `File is larger than the 50 MB limit (${formatBytes(picked.size)}).`
      );
      return;
    }
    setFile(picked);
    // Pre-fill the name from the file, editable afterwards.
    setName((current) => current || picked.name);
  };

  const canSubmit = Boolean(file) && !isPending;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      file: file!,
      /* Omit when untouched so the backend falls back to the sanitized
       * original filename. */
      name: name.trim() === "" ? undefined : name.trim(),
      description:
        description.trim() === "" ? undefined : description.trim(),
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Upload file</DialogTitle>
        <DialogDescription>
          Any file type up to 50 MB — it goes to your own Cloudinary account
          and shows up in the list.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Drop-zone style picker */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="document-file">File</Label>
          <input
            ref={inputRef}
            id="document-file"
            type="file"
            className="sr-only"
            onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
          />
          {file ? (
            <div className="flex items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm dark:bg-input/30">
              <FilePlus2 className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatBytes(file.size)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove ${file.name}`}
                onClick={() => {
                  pickFile(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex min-h-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-input px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-ring hover:bg-muted/50",
                fileError && "border-destructive"
              )}
            >
              <FilePlus2 className="size-5" />
              Click to choose a file
            </button>
          )}
          {fileError && (
            <p className="text-xs text-destructive">
              {fileError}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="document-name">Name</Label>
          <Input
            id="document-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Defaults to the file name"
            maxLength={255}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="document-description">Description</Label>
          <textarea
            id="document-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional details…"
            rows={3}
            maxLength={5000}
            className="field-sizing-content min-h-16 w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm placeholder:text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={!canSubmit}>
            {isPending && <Loader2 className="animate-spin" />}
            Upload
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
