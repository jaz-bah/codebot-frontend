"use client";

import * as React from "react";
import { Share2 } from "lucide-react";

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
import { usePublishPost } from "@/hooks/use-posts";
import type { PostResourceType } from "@/types/post.type";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* ShareButton                                                         */
/* ------------------------------------------------------------------ */

export type ShareButtonProps = {
  /** Which of the caller's resources is being published. */
  resourceType: PostResourceType;
  resourceId: string;
  /** Prefills the post title (usually the resource's name). */
  defaultTitle: string;
  /** Button height preset matching the host card's action row. */
  size?: "icon-xs" | "icon-sm";
  className?: string;
};

/**
 * "Share" action for any shareable resource card: opens a small dialog
 * (title + optional description) and publishes the resource with
 * POST /posts. Fully self-contained — owns its own mutation, so cards
 * don't need to thread callbacks or state.
 */
export function ShareButton({
  resourceType,
  resourceId,
  defaultTitle,
  size = "icon-xs",
  className,
}: ShareButtonProps) {
  const [open, setOpen] = React.useState(false);
  const publishMutation = usePublishPost();

  const kickOff = (values: { title: string; description: string }) => {
    publishMutation.mutate(
      {
        resourceType,
        resourceId,
        title: values.title,
        // Empty string collapses to NULL server-side — just send it.
        description: values.description,
      },
      { onSuccess: () => setOpen(false) }
    );
  };

  return (
    <>
      <Button
        variant="ghost"
        size={size}
        aria-label="Share as public post"
        className={className}
        onClick={() => {
          // Fresh reject/409 state from the previous attempt, if any.
          publishMutation.reset();
          setOpen(true);
        }}
      >
        <Share2 />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        {open && (
          /* Remount per open so the form is always pristine. */
          <ShareDialogFields
            key={resourceId}
            resourceType={resourceType}
            defaultTitle={defaultTitle}
            isPending={publishMutation.isPending}
            error={publishMutation.error?.message ?? undefined}
            onOpenChange={setOpen}
            onSubmit={kickOff}
          />
        )}
      </Dialog>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Dialog                                                              */
/* ------------------------------------------------------------------ */

function ShareDialogFields({
  resourceType,
  defaultTitle,
  isPending,
  error,
  onOpenChange,
  onSubmit,
}: {
  resourceType: PostResourceType;
  defaultTitle: string;
  isPending: boolean;
  error?: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: { title: string; description: string }) => void;
}) {
  const [title, setTitle] = React.useState(defaultTitle);
  const [description, setDescription] = React.useState("");

  /* Matches the server contract: trimmed 1–200 title, ≤ 2000 desc. */
  const canSubmit = title.trim().length > 0 && !isPending;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({ title: title.trim(), description: description.trim() });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Share as post</DialogTitle>
        <DialogDescription className="capitalize">
          Publish this {resourceType} to the public feed. It points at the
          live resource; the title and description below live on the post.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="post-title">Title</Label>
          <Input
            id="post-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={200}
            placeholder="What should the post be called?"
            aria-invalid={error ? true : undefined}
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="post-description">Description</Label>
          {/* Plain element: no Select/Textarea primitive in ui/. */}
          <textarea
            id="post-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={2000}
            rows={3}
            placeholder="Optional…"
            className="field-sizing-content min-h-16 w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm placeholder:text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          />
        </div>
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" className={cn("gap-1.5")} disabled={!canSubmit}>
            <Share2 />
            {isPending ? "Sharing…" : "Share"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
