"use client";

import * as React from "react";

import {
  RichTextEditor,
  type RichTextEditorToolbarItem,
} from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Expert } from "@/types/expert.type";

/* Subset + order of the built-in toolbar (append "separator" as needed). */
const EXPERT_TOOLBAR: RichTextEditorToolbarItem[] = [
  "undo",
  "redo",
  "separator",
  "heading2",
  "separator",
  "bold",
  "italic",
  "underline",
  "separator",
  "bulletList",
  "orderedList",
  "codeBlock",
  "separator",
  "link",
];

export type ExpertFormValues = {
  title: string;
  /** HTML string, or null when the document is empty. */
  description: string | null;
};

export type ExpertFormDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present in edit mode, absent in create mode. */
  expert?: Expert;
  isPending: boolean;
  error?: string;
  onSubmit: (values: ExpertFormValues) => void;
};

/** Add / edit expert drawer. Remounts its fields per open so the form is
 * always pristine. */
export function ExpertFormDrawer({
  open,
  onOpenChange,
  expert,
  isPending,
  error,
  onSubmit,
}: ExpertFormDrawerProps) {
  const isEdit = Boolean(expert);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      {/* Remount per open/expert so the form is always pristine. */}
      {open && (
        <ExpertFormFields
          key={expert?.id ?? "create"}
          expert={expert}
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

function ExpertFormFields({
  expert,
  isPending,
  error,
  isEdit,
  onOpenChange,
  onSubmit,
}: {
  expert?: Expert;
  isPending: boolean;
  error?: string;
  isEdit: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ExpertFormValues) => void;
}) {
  const [title, setTitle] = React.useState(expert?.title ?? "");
  const [description, setDescription] = React.useState(
    expert?.description ?? ""
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || isPending) return;
    // The API treats "" and null the same (clears), but an empty rich
    // document is "<p></p>" — send null instead of that junk.
    onSubmit({
      title: title.trim(),
      description: hasTextContent(description) ? description : null,
    });
  };

  return (
    <DrawerContent
      className="data-[swipe-axis=x]:inset-y-4! sm:[--drawer-content-width:30rem]!"
      style={
        { "--drawer-height": "calc(100dvh - 2rem)" } as React.CSSProperties
      }
    >
      <DrawerHeader className="pt-8">
        <DrawerTitle>{isEdit ? "Edit expert" : "New expert"}</DrawerTitle>
        <DrawerDescription>
          {isEdit
            ? "Update the expert details below."
            : "Name the expert and describe what it does."}
        </DrawerDescription>
      </DrawerHeader>
      <form
        id="expert-form"
        onSubmit={handleSubmit}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="expert-title">Title</Label>
          <Input
            id="expert-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Linux Master"
            maxLength={255}
            autoFocus
          />
        </div>
        <div className="flex min-h-0 flex-col gap-1.5">
          <Label htmlFor="expert-description">Description</Label>
          <RichTextEditor
            id="expert-description"
            className="min-h-0"
            value={description}
            onValueChange={setDescription}
            toolbarOptions={EXPERT_TOOLBAR}
            label="Expert description"
            placeholder="What is this expert good at?"
            minHeight="180px"
          />
        </div>

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
          form="expert-form"
          size="sm"
          disabled={!title.trim() || isPending}
        >
          {isEdit ? "Save changes" : "Add expert"}
        </Button>
      </DrawerFooter>
    </DrawerContent>
  );
}

/** True when the rich HTML has any visible text (ignores empty paragraphs). */
export function hasTextContent(html: string): boolean {
  const container = document.createElement("div");
  container.innerHTML = html;
  return Boolean(container.textContent?.trim());
}

/** Plain text of a rich HTML string — for card previews + clipping. */
export function htmlToPlainText(html: string): string {
  const container = document.createElement("div");
  container.innerHTML = html;
  return container.textContent ?? "";
}
