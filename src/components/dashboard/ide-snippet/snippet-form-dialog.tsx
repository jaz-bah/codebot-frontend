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

export type SnippetFormValues = {
  /** Free-form language label (1–50 chars, sent trimmed). */
  language: string;
  /** Verbatim code (1–20 000 chars, sent exactly as received). */
  data: string;
};

export type SnippetFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  error?: string;
  onSubmit: (values: SnippetFormValues) => void;
};

const textareaClass =
  "min-h-64 w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 font-mono text-sm placeholder:text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

/** New snippet modal. Remounts its fields per open so the form is
 * always pristine. */
export function SnippetFormDialog({
  open,
  onOpenChange,
  isPending,
  error,
  onSubmit,
}: SnippetFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <SnippetFormFields
          isPending={isPending}
          error={error}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      )}
    </Dialog>
  );
}

function SnippetFormFields({
  isPending,
  error,
  onOpenChange,
  onSubmit,
}: {
  isPending: boolean;
  error?: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SnippetFormValues) => void;
}) {
  const [language, setLanguage] = React.useState("");
  const [code, setCode] = React.useState("");

  const canSubmit =
    language.trim().length > 0 && code.length > 0 && !isPending;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    // `data` is stored verbatim — send the code exactly as received.
    onSubmit({ language: language.trim(), data: code });
  };

  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>New snippet</DialogTitle>
        <DialogDescription>
          Label the language and paste the code — it is stored exactly as
          received.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="snippet-language">Language</Label>
          <Input
            id="snippet-language"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            placeholder="e.g. css, ts, python, c++"
            maxLength={50}
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="snippet-code">Code</Label>
          <textarea
            id="snippet-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Paste your code here…"
            rows={10}
            maxLength={20000}
            spellCheck={false}
            className={textareaClass}
          />
          <span className="text-xs text-muted-foreground">
            {code.length.toLocaleString()} / 20,000
          </span>
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
            Add snippet
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
