"use client";

import * as React from "react";

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
import type { Tool } from "@/types/tool.type";

export type ToolFormValues = {
  name: string;
  /** Null when left empty — the API treats "" and null the same. */
  description: string | null;
  downloadLink: string;
};

export type ToolFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present in edit mode, absent in create mode. */
  tool?: Tool;
  isPending: boolean;
  error?: string;
  onSubmit: (values: ToolFormValues) => void;
};

/** True for a valid absolute http(s) URL — matches the backend rule. */
export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Add / edit tool modal. Remounts its fields per open so the form is
 * always pristine. */
export function ToolFormDialog({
  open,
  onOpenChange,
  tool,
  isPending,
  error,
  onSubmit,
}: ToolFormDialogProps) {
  const isEdit = Boolean(tool);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Remount per open/tool so the form is always pristine. */}
      {open && (
        <ToolFormFields
          key={tool?.id ?? "create"}
          tool={tool}
          isPending={isPending}
          error={error}
          isEdit={isEdit}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      )}
    </Dialog>
  );
}

function ToolFormFields({
  tool,
  isPending,
  error,
  isEdit,
  onOpenChange,
  onSubmit,
}: {
  tool?: Tool;
  isPending: boolean;
  error?: string;
  isEdit: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ToolFormValues) => void;
}) {
  const [name, setName] = React.useState(tool?.name ?? "");
  const [description, setDescription] = React.useState(
    tool?.description ?? ""
  );
  const [downloadLink, setDownloadLink] = React.useState(
    tool?.downloadLink ?? ""
  );

  const isNameValid = name.trim().length > 0;
  const isLinkValid = isValidHttpUrl(downloadLink);
  const canSubmit = isNameValid && isLinkValid && !isPending;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    const descriptionValue = description.trim();
    onSubmit({
      name: name.trim(),
      description: descriptionValue || null,
      downloadLink: downloadLink.trim(),
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit tool" : "New tool"}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Update the tool details below."
            : "Name the tool and link where it can be downloaded."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tool-name">Name</Label>
          <Input
            id="tool-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Notepad++"
            maxLength={255}
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tool-description">Description</Label>
          <textarea
            id="tool-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional details…"
            rows={3}
            maxLength={5000}
            className="field-sizing-content min-h-16 w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm placeholder:text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tool-download-link">Download link</Label>
          <Input
            id="tool-download-link"
            type="url"
            value={downloadLink}
            onChange={(event) => setDownloadLink(event.target.value)}
            placeholder="https://example.com/download"
            maxLength={2048}
            aria-invalid={downloadLink !== "" && !isLinkValid}
          />
          {downloadLink !== "" && !isLinkValid && (
            <p className="text-xs text-destructive">
              Enter a valid http(s) URL.
            </p>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

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
            {isEdit ? "Save changes" : "Add tool"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
