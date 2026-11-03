"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "cn";

import {
  CodeEditor,
  type CodeEditorLanguage,
} from "@/components/code-editor";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { detectLanguage, type Language } from "@/utils/detectLanguage";
import type { Preset } from "@/types/preset.type";

/* Dropdown options: the languages `detectLanguage` can identify. */
const LANGUAGE_OPTIONS: Language[] = [
  "javascript",
  "typescript",
  "jsx",
  "tsx",
  "html",
  "css",
  "json",
  "liquid",
  "python",
  "bash",
  "sql",
  "php",
];

export type PresetFormValues = {
  name: string;
  /** Free-form language label (1–50 chars, sent trimmed). */
  language: string;
  /** Verbatim code (1–20 000 chars, sent exactly as received). */
  data: string;
};

export type PresetFormDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present in edit mode, absent in create mode. */
  preset?: Preset;
  isPending: boolean;
  error?: string;
  onSubmit: (values: PresetFormValues) => void;
};

/** Add / edit preset drawer. Remounts its fields per open so the form is
 * always pristine. */
export function PresetFormDrawer({
  open,
  onOpenChange,
  preset,
  isPending,
  error,
  onSubmit,
}: PresetFormDrawerProps) {
  const isEdit = Boolean(preset);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      {/* Remount per open/preset so the form is always pristine. */}
      {open && (
        <PresetFormFields
          key={preset?.id ?? "create"}
          preset={preset}
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

function PresetFormFields({
  preset,
  isPending,
  error,
  isEdit,
  onOpenChange,
  onSubmit,
}: {
  preset?: Preset;
  isPending: boolean;
  error?: string;
  isEdit: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: PresetFormValues) => void;
}) {
  const [name, setName] = React.useState(preset?.name ?? "");
  const [code, setCode] = React.useState(preset?.data ?? "");
  const [language, setLanguage] = React.useState(preset?.language ?? "");
  /* Once the user types a language by hand, auto-detect stops filling. */
  const [languageTouched, setLanguageTouched] = React.useState(
    Boolean(preset)
  );

  const detected = React.useMemo(
    () => detectLanguage({ code }),
    [code]
  );

  /* While the language field is untouched, follow the auto-detection.
   * Adjust during render (guarded), not in an effect — avoids a
   * cascading extra pass for each keystroke. */
  if (!languageTouched && detected.language !== "unknown" && detected.language !== language) {
    setLanguage(detected.language);
  }

  const isNameValid = name.trim().length > 0;
  const isLanguageValid = language.trim().length > 0;
  const isDataValid = code.length > 0;
  const canSubmit =
    isNameValid && isLanguageValid && isDataValid && !isPending;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    // `data` is stored verbatim — send the code exactly as received.
    onSubmit({
      name: name.trim(),
      language: language.trim(),
      data: code,
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
        <DrawerTitle>{isEdit ? "Edit preset" : "New preset"}</DrawerTitle>
        <DrawerDescription>
          {isEdit
            ? "Update the preset details below."
            : "Name the preset and paste its code — the language is detected for you."}
        </DrawerDescription>
      </DrawerHeader>
      <form
        id="preset-form"
        onSubmit={handleSubmit}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="preset-name">Name</Label>
          <Input
            id="preset-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Debounce hook"
            maxLength={255}
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="preset-language">Language</Label>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  id="preset-language"
                  variant="outline"
                  className="w-full justify-between font-normal"
                  aria-invalid={!isLanguageValid}
                />
              }
            >
              <span className={cn(!language && "text-muted-foreground")}>
                {language || "Select language…"}
              </span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="max-h-72 min-w-40 overflow-y-auto"
            >
              {/* Base UI group labels require their items inside a Group. */}
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Language
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {LANGUAGE_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option}
                    onClick={() => {
                      setLanguage(option);
                      setLanguageTouched(true);
                    }}
                  >
                    <span className="flex-1">{option}</span>
                    {option === language && (
                      <Check className="size-3.5 text-primary" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          {detected.language !== "unknown" && detected.language !== language && (
            <span className="text-xs text-muted-foreground">
              Detected: {detected.language}
            </span>
          )}
        </div>
        <div className="flex min-h-0 flex-col gap-1.5">
          <Label htmlFor="preset-code">Code</Label>
          <CodeEditor
            id="preset-code"
            language={language as CodeEditorLanguage}
            value={code}
            onValueChange={setCode}
            label="Preset code"
            minHeight="220px"
            placeholder="Paste your code here…"
          />
          <span className="text-xs text-muted-foreground">
            {code.length.toLocaleString()} / 20,000
          </span>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
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
          form="preset-form"
          size="sm"
          disabled={!canSubmit}
        >
          {isEdit ? "Save changes" : "Add preset"}
        </Button>
      </DrawerFooter>
    </DrawerContent>
  );
}
