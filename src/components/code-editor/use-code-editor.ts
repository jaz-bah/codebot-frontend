"use client"

import * as React from "react"
import type { LanguageSupport } from "@codemirror/language"
import { EditorState, type Extension } from "@codemirror/state"
import { EditorView } from "@codemirror/view"

import { useCallbackRef } from "@/hooks/use-callback-ref"
import { useControllableState } from "@/hooks/use-controllable-state"

import { loadLanguage, resolveLanguage } from "./code-editor.languages"
import { codeEditorTheme } from "./code-editor.theme"
import type {
  CodeEditorLanguage,
  CodeEditorLanguageStatus,
  CodeEditorProps,
} from "./code-editor.types"

export type UseCodeEditorOptions = Pick<
  CodeEditorProps,
  | "language"
  | "value"
  | "defaultValue"
  | "onValueChange"
  | "lineWrapping"
  | "tabSize"
  | "label"
  | "extensions"
  | "onLanguageStatusChange"
>

interface LoadedLanguage {
  language: CodeEditorLanguage
  support: LanguageSupport | null
}

/**
 * Headless logic for CodeEditor: controllable document, lazy language
 * loading, and the assembled extension list. Use it directly to build a
 * custom UI on top of the same behaviour.
 */
export function useCodeEditor({
  language = "plaintext",
  value,
  defaultValue,
  onValueChange,
  lineWrapping = false,
  tabSize = 2,
  label,
  extensions: userExtensions,
  onLanguageStatusChange,
}: UseCodeEditorOptions) {
  const [doc = "", setDoc] = useControllableState<string>({
    prop: value,
    defaultProp: defaultValue ?? "",
    onChange: onValueChange,
  })

  const [loaded, setLoaded] = React.useState<LoadedLanguage | null>(null)
  const onStatusChange = useCallbackRef(onLanguageStatusChange)

  const isCurrent = loaded?.language === language
  const languageStatus: CodeEditorLanguageStatus = !language
    ? "idle"
    : isCurrent
      ? loaded.support
        ? "ready"
        : resolveLanguage(language)
          ? "unsupported"
          : "ready"
      : "loading"

  React.useEffect(() => {
    let cancelled = false
    loadLanguage(language).then((support) => {
      if (!cancelled) setLoaded({ language, support })
    })
    return () => {
      cancelled = true
    }
  }, [language])

  React.useEffect(() => {
    onStatusChange(languageStatus)
  }, [languageStatus, onStatusChange])

  const extensions = React.useMemo<Extension[]>(() => {
    const list: Extension[] = [codeEditorTheme, EditorState.tabSize.of(tabSize)]
    if (isCurrent && loaded.support) list.push(loaded.support)
    if (lineWrapping) list.push(EditorView.lineWrapping)
    if (label)
      list.push(EditorView.contentAttributes.of({ "aria-label": label }))
    if (userExtensions) list.push(...userExtensions)
    return list
  }, [isCurrent, loaded, tabSize, lineWrapping, label, userExtensions])

  const handleChange = React.useCallback(
    (next: string) => setDoc(next),
    [setDoc]
  )

  return {
    /** Current document text. */
    value: doc,
    /** Replace the document (fires onValueChange). */
    setValue: setDoc,
    /** Pass to the engine's onChange. */
    handleChange,
    /** Extensions to hand to the engine. */
    extensions,
    languageStatus,
  }
}
