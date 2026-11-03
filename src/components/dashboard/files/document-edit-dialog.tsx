"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Document } from "@/types/document.type";

export type DocumentEditValues = {
  name: string;
  /** null clears the stored description (PATCH accepts null). */
  description: string | null;
};

export type DocumentEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document?: Document;
  isPending: boolean;
  error?: string;
  onSubmit: (values: DocumentEditValues) => void;
};

/** Rename / re-describe dialog for PATCH /documents/:id. Only metadata is
 * editable — the bytes and url are immutable; replacing a file means
 * uploading a new document. Remounts its fields per open so the form is
 * always pristine. */
export function DocumentEditDialog({
  open,
  onOpenChange,
  document: doc,
  isPending,
  error,
  onSubmit,
}: DocumentEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Remount per open/document so the form is always pristine. */}
      {open && doc && (
        <DocumentEditFields
          key={doc.id}
          document={doc}
          isPending={isPending}
          error={error}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      )}
    </Dialog>
  );
}

function DocumentEditFields({
  document: doc,
  isPending,
  error,
  onOpenChange,
  onSubmit,
}: {
  document: Document;
  isPending: boolean;
  error?: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: DocumentEditValues) => void;
}) {
  const [name, setName] = React.useState(doc.name);
  const [description, setDescription] = React.useState(
    doc.description ?? ""
  );

  const isNameValid = name.trim().length > 0;
  const canSubmit = isNameValid && !isPending;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      name: name.trim(),
      description: description.trim() === "" ? null : description.trim(),
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit file details</DialogTitle>
        <DialogDescription>
          Rename the file or update its description — the stored file itself
          can&apos;t be replaced here.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="document-edit-name">Name</Label>
          <Input
            id="document-edit-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={255}
            aria-invalid={!isNameValid}
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="document-edit-description">Description</Label>
          <textarea
            id="document-edit-description"
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
            Save changes
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
