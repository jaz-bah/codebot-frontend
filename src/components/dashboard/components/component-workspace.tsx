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
import {
  languageForFile,
  languageFromFileName,
} from "@/lib/component-files";
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

/** A live file row: display name (form-only) + verbatim code. The API
 *  stores files nameless — the name's extension doubles as the stored
 *  `language` slug at save time. Index-keyed, payload order. */
type EditableFile = {
  /** User-typed file name; undefined for rows straight off the server
   *  (their display name is derived from the stored language). */
  name?: string;
  /** Language slug as last accepted by the server (or derived while
   *  editing — always in sync with the name's extension). */
  language: string;
  code: string;
};

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

/** Display name of a row: the user's name when set, otherwise derived
 *  from the row's (last-saved or live) language slug. */
function baseFileName(file: EditableFile): string {
  const explicit = file.name?.trim();
  return explicit ? explicit : defaultFileName(file.language);
}

/** Unique display name for every file, de-duplicated by payload order —
 *  two rows may share an extension (and even an explicit name). */
function uniqueFileNames(files: EditableFile[]): string[] {
  const used = new Set<string>();
  const names: string[] = [];
  for (const file of files) {
    const base = baseFileName(file);
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
 * carry a language slug only, and each row's display file name is
 * form-only: the name's extension IS the language slug the API stores.
 * Server rows without a typed name derive one ("styles.css", "script.js", …).
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

  /* Dirty when any row differs from the accepted baseline (added,
   * removed, renamed or edited rows count as dirty too). */
  const isDirty =
    files.length !== baseline.length ||
    files.some(
      (file, i) =>
        (baseline[i]?.name ?? "") !== (file.name ?? "") ||
        (baseline[i]?.language ?? "") !== file.language ||
        (baseline[i]?.code ?? "") !== file.code
    );

  /* Save validation: every name needs a valid extension (= language slug)
   * and code within the per-file budget. */
  const invalidCount = files.filter((file) => {
    if (file.name === undefined) return false; // untouched server row
    return languageFromFileName(file.name) === null;
  }).length;
  const overlongCount = files.filter(
    (file) => file.code.length > MAX_CODE_LENGTH
  ).length;
  const canSave =
    files.length >= 1 &&
    files.length <= MAX_FILES &&
    invalidCount === 0 &&
    overlongCount === 0;

  /** Editing the name re-derives the language live: the extension IS the
   *  language the API will store. Invalid → "" (blocks save until fixed). */
  const updateActiveName = (name: string) => {
    setFiles((prev) =>
      prev.map((file, i) =>
        i === activeIndex
          ? { ...file, name, language: languageFromFileName(name) ?? "" }
          : file
      )
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
      language:
        file.name !== undefined
          ? (languageFromFileName(file.name) ?? file.language)
          : file.language.trim().toLowerCase(),
      code: file.code,
    }));
    await onSave(component.id, { files: payload });
    /* Accepted: this payload is the new baseline; live rows converge.
     * The typed names stay on the rows — they are display-only. */
    const baselineRows = payload.map((file, i) => ({
      ...file,
      name: files[i].name,
    }));
    setBaseline(baselineRows);
    setFiles(baselineRows);
    setSavedAt(new Date().toLocaleTimeString());
  };

  const retryHint = overlongCount > 0
    ? `${overlongCount} file${overlongCount === 1 ? "" : "s"} exceed the ${MAX_CODE_LENGTH.toLocaleString()} character code limit.`
    : invalidCount > 0
      ? `Fix ${invalidCount} file name${invalidCount === 1 ? "" : "s"} — each needs an extension (a-z, 0-9, _ or -), e.g. styles.css.`
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
        {/* File name row — the name's extension IS the language the API
         *  stores; display names are form-only. */}
        <div className="flex flex-wrap items-center gap-2 border-b px-3 py-2">
          <Label htmlFor="file-name" className="text-xs">
            File name
          </Label>
          <Input
            id="file-name"
            value={activeFile ? baseFileName(activeFile) : ""}
            onChange={(event) => updateActiveName(event.target.value)}
            placeholder="e.g. styles.css, index.html, utils.ts"
            maxLength={100}
            className={cn(
              "h-7 w-52 font-mono text-xs",
              activeFile &&
                activeFile.name !== undefined &&
                languageFromFileName(activeFile.name) === null &&
                "border-destructive"
            )}
            autoComplete="off"
            spellCheck={false}
          />
          <span className="text-xs text-muted-foreground">
            the extension sets the language · file {activeIndex + 1}/
            {files.length}
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
