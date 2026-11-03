"use client";

import * as React from "react";
import { Plus, RotateCcw, Trash2, TriangleAlert } from "lucide-react";

import {
  CodeEditor,
} from "@/components/code-editor";
import {
  EditorWorkbench,
  type WorkspaceFile,
} from "@/components/editor-workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { languageForFile } from "@/lib/component-files";
import { cn } from "@/lib/utils";
import type {
  Component,
  ComponentFileInput,
  UpdateComponentPatch,
} from "@/types/component.type";

/* ------------------------------------------------------------------ */
/* Contract constants (mirrors the Joi schemas)                        */
/* ------------------------------------------------------------------ */

const MAX_FILES = 20;
const MAX_CODE_LENGTH = 500_000;
/** Lowercase slug `a-z 0-9 _ -`, ≤ 20 chars. */
const LANGUAGE_PATTERN = /^[a-z0-9_-]{1,20}$/;

/** A live file row: language + verbatim code. Index-keyed, payload order. */
type EditableFile = { language: string; code: string };

/* ------------------------------------------------------------------ */
/* File naming                                                         */
/* ------------------------------------------------------------------ */

/** Friendly default filename per language slug, e.g. css → "styles.css". */
function defaultFileName(language: string): string {
  const lang = language.trim().toLowerCase();
  switch (lang) {
    case "css":
      return "styles.css";
    case "scss":
      return "styles.scss";
    case "html":
      return "index.html";
    case "javascript":
    case "js":
      return "script.js";
    case "typescript":
    case "ts":
      return "script.ts";
    case "jsx":
      return "view.jsx";
    case "tsx":
      return "component.tsx";
    case "json":
      return "data.json";
    case "svg":
      return "image.svg";
    case "xml":
      return "markup.xml";
    case "python":
    case "py":
      return "script.py";
    case "sql":
      return "query.sql";
    case "markdown":
    case "md":
      return "readme.md";
    case "shell":
    case "bash":
    case "sh":
      return "run.sh";
    case "yaml":
    case "yml":
      return "config.yaml";
    default:
      return `${lang || "file"}.txt`;
  }
}

/** Unique display name for every file, de-duplicated by payload order. */
function uniqueFileNames(files: EditableFile[]): string[] {
  const used = new Set<string>();
  const names: string[] = [];
  for (const file of files) {
    const base = defaultFileName(file.language);
    let name = base;
    let counter = 2;
    while (used.has(name)) {
      const dot = base.lastIndexOf(".");
      name =
        dot === -1
          ? `${base}-${counter}`
          : `${base.slice(0, dot)}-${counter}${base.slice(dot)}`;
      counter += 1;
    }
    used.add(name);
    names.push(name);
  }
  return names;
}

/* ------------------------------------------------------------------ */
/* Workspace                                                           */
/* ------------------------------------------------------------------ */

export type ComponentWorkspaceProps = {
  component: Component;
  /** Save hook — resolves when the server accepted the whole file set. */
  onSave: (id: string, patch: UpdateComponentPatch) => Promise<unknown>;
  isSaving: boolean;
  error?: string;
  className?: string;
};

/**
 * IDE-style workspace for one component's code files: flat file tree on
 * the left, CodeMirror on the right. The API has no file paths — files
 * carry a language slug only, so display names are derived from it
 * ("styles.css", "script.js", …).
 *
 * Local state is the live file array; its order is the payload order the
 * server keeps as 0-based positions. Save sends the whole set — the
 * endpoint replaces it atomically.
 */
export function ComponentWorkspace({
  component,
  onSave,
  isSaving,
  error,
  className,
}: ComponentWorkspaceProps) {
  /* Server truth at the last acceptance point. The live rows reset only
   * when THIS workspace accepts a save (or its host remounts) — never in
   * an effect, and metadata-only patches (name/preview) can't wipe
   * unsaved code drafts. */
  const [baseline, setBaseline] = React.useState<EditableFile[]>(() =>
    component.files.map((file) => ({
      language: file.language,
      code: file.code,
    }))
  );
  const [files, setFiles] = React.useState<EditableFile[]>(() =>
    component.files.map((file) => ({
      language: file.language,
      code: file.code,
    }))
  );
  const [savedAt, setSavedAt] = React.useState<string | null>(null);

  /* Display names derived per render; stable across keystrokes. */
  const fileNames = React.useMemo(() => uniqueFileNames(files), [files]);
  const tree = React.useMemo<WorkspaceFile[]>(
    () =>
      files.map((_, index) => ({
        id: fileNames[index],
        name: fileNames[index],
        type: "file" as const,
      })),
    [files, fileNames]
  );

  /* Selected file index; clamped to the current array. */
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const activeIndex = Math.max(0, Math.min(selectedIndex, files.length - 1));
  const activeFile = files[activeIndex];

  /* Dirty when any row differs from the accepted baseline (added or
   * removed rows count as dirty too). */
  const isDirty =
    files.length !== baseline.length ||
    files.some(
      (file, i) =>
        (baseline[i]?.language ?? "") !== file.language ||
        (baseline[i]?.code ?? "") !== file.code
    );

  /* Save validation: valid language slugs on every row and code within
   * the per-file budget. */
  const invalidCount = files.filter(
    (file) => !LANGUAGE_PATTERN.test(file.language.trim().toLowerCase())
  ).length;
  const overlongCount = files.filter(
    (file) => file.code.length > MAX_CODE_LENGTH
  ).length;
  const canSave =
    files.length >= 1 &&
    files.length <= MAX_FILES &&
    invalidCount === 0 &&
    overlongCount === 0;

  const updateActiveLanguage = (language: string) => {
    setFiles((prev) =>
      prev.map((file, i) => (i === activeIndex ? { ...file, language } : file))
    );
  };

  const updateActiveCode = (code: string) => {
    setFiles((prev) =>
      prev.map((file, i) => (i === activeIndex ? { ...file, code } : file))
    );
  };

  const addFile = () => {
    setFiles((prev) =>
      prev.length >= MAX_FILES ? prev : [...prev, { language: "", code: "" }]
    );
    setSelectedIndex(files.length);
  };

  const removeFile = (index: number) => {
    if (files.length <= 1) return;
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setSelectedIndex((prev) => {
      if (index < prev) return prev - 1;
      return Math.max(0, Math.min(prev, files.length - 2));
    });
  };

  const handleSave = async () => {
    if (!canSave || isSaving) return;
    const payload: ComponentFileInput[] = files.map((file) => ({
      language: file.language.trim().toLowerCase(),
      code: file.code,
    }));
    await onSave(component.id, { files: payload });
    /* Accepted: this payload is the new baseline; live rows converge. */
    setBaseline(payload);
    setFiles(payload);
    setSavedAt(new Date().toLocaleTimeString());
  };

  const retryHint = overlongCount > 0
    ? `${overlongCount} file${overlongCount === 1 ? "" : "s"} exceed the ${MAX_CODE_LENGTH.toLocaleString()} character code limit.`
    : invalidCount > 0
      ? `Fix ${invalidCount} language${invalidCount === 1 ? "" : "s"} — use a lowercase slug (a-z, 0-9, _ or -).`
      : undefined;

  return (
    <EditorWorkbench
      files={tree}
      value={fileNames[activeIndex] ?? ""}
      onValueChange={(id) =>
        setSelectedIndex(Math.max(0, fileNames.indexOf(id)))
      }
      dirty={isDirty && canSave}
      onSave={handleSave}
      label="Component files"
      className={className ?? "h-[calc(100vh-232px)]"}
      actions={
        <div className="flex items-center gap-2">
          {error && canSave ? (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={handleSave}
            >
              <RotateCcw className="size-3" />
              Retry save
            </Button>
          ) : null}
          {savedAt ? (
            <span className="hidden px-1 text-xs text-muted-foreground sm:inline">
              Saved {savedAt}
            </span>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={addFile}
            disabled={files.length >= MAX_FILES}
          >
            <Plus className="size-3.5" />
            Add file
          </Button>
        </div>
      }
      renderItemAction={(file: WorkspaceFile) =>
        file.type === "folder" || files.length <= 1 ? null : (
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Remove file ${file.name}`}
            onClick={() => removeFile(fileNames.indexOf(file.id))}
          >
            <Trash2 className="size-3.5" />
          </Button>
        )
      }
    >
      <div className="flex h-full min-h-0 flex-col">
        {/* Language row — the only per-file metadata the API carries. */}
        <div className="flex flex-wrap items-center gap-2 border-b px-3 py-2">
          <Label htmlFor="file-language" className="text-xs">
            Language
          </Label>
          <Input
            id="file-language"
            value={activeFile?.language ?? ""}
            onChange={(event) => updateActiveLanguage(event.target.value)}
            placeholder="e.g. css, html, ts"
            maxLength={20}
            className={cn(
              "h-7 w-44 font-mono text-xs",
              activeFile &&
                !LANGUAGE_PATTERN.test(activeFile.language.trim().toLowerCase()) &&
                "border-destructive"
            )}
            autoComplete="off"
            spellCheck={false}
          />
          <span className="text-xs text-muted-foreground">
            lowercase slug: a-z 0-9 _ - · file {activeIndex + 1}/{files.length}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="ml-auto text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label="Remove this file"
            onClick={() => removeFile(activeIndex)}
            disabled={files.length <= 1}
          >
            <Trash2 />
          </Button>
        </div>

        {(retryHint || error) && (
          <div className="flex flex-wrap items-center gap-2 bg-destructive/10 px-3 py-1.5 text-sm text-destructive">
            <TriangleAlert className="size-4 shrink-0" />
            <span>{retryHint ?? error}</span>
          </div>
        )}

        <div className="min-h-0 flex-1">
          {activeFile ? (
            <CodeEditor
              language={languageForFile(fileNames[activeIndex])}
              value={activeFile.code}
              onValueChange={updateActiveCode}
              label={`${fileNames[activeIndex]} source`}
              height="100%"
              lineWrapping
              className="h-full rounded-none border-0 shadow-none focus-within:ring-0"
            />
          ) : null}
        </div>
      </div>
    </EditorWorkbench>
  );
}
