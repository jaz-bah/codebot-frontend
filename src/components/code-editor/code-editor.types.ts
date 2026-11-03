import type { Extension } from "@codemirror/state"

/**
 * Well-known language ids. Any other name or alias known to
 * `@codemirror/language-data` (~140 languages, e.g. "kotlin", "dockerfile")
 * is also accepted; unknown names fall back to plain text.
 */
export type CodeEditorLanguage =
  | "javascript"
  | "typescript"
  | "jsx"
  | "tsx"
  | "json"
  | "html"
  | "css"
  | "scss"
  | "markdown"
  | "python"
  | "rust"
  | "go"
  | "java"
  | "c"
  | "cpp"
  | "csharp"
  | "php"
  | "ruby"
  | "sql"
  | "yaml"
  | "toml"
  | "xml"
  | "shell"
  | "dockerfile"
  | "plaintext"
  | (string & {})

export type CodeEditorLanguageStatus =
  "idle" | "loading" | "ready" | "unsupported"

/**
 * Engine-specific escape hatch. These are CodeMirror 6 extensions; using
 * them couples the consumer to the engine (see README → Limits).
 */
export type CodeEditorExtension = Extension

export interface CodeEditorProps {
  /** Language id or alias, e.g. "typescript", "ts", "python". Switchable at runtime. */
  language?: CodeEditorLanguage
  /** Controlled document value. */
  value?: string
  /** Initial document value for uncontrolled usage. */
  defaultValue?: string
  /** Fires with the full document whenever the user edits it. */
  onValueChange?: (value: string) => void
  /** Content cannot be edited but can be selected and copied. */
  readOnly?: boolean
  /** Dims the editor and blocks interaction. */
  disabled?: boolean
  /** Shown when the document is empty. */
  placeholder?: string
  /** Accessible name for the editable region. */
  label?: string
  /** Show the line-number and fold gutters. @default true */
  lineNumbers?: boolean
  /** Soft-wrap long lines. @default false */
  lineWrapping?: boolean
  /** Spaces per indentation level. @default 2 */
  tabSize?: number
  /** Focus the editor on mount. */
  autoFocus?: boolean
  /** Editor height, e.g. "300px" or "100%". Defaults to content height. */
  height?: string
  minHeight?: string
  maxHeight?: string
  /** Class names for the outer wrapper (merged with `cn`). */
  className?: string
  /** Class names for the editor surface itself. */
  editorClassName?: string
  /** Extra CodeMirror extensions appended after ours (engine-specific). */
  extensions?: CodeEditorExtension[]
  /** Called when the language finishes loading or is not supported. */
  onLanguageStatusChange?: (status: CodeEditorLanguageStatus) => void
  id?: string
}

/** Imperative API exposed through `ref`. */
export interface CodeEditorHandle {
  focus: () => void
  blur: () => void
  getValue: () => string
  /** Replaces the whole document. Fires `onValueChange`. */
  setValue: (value: string) => void
  getSelection: () => { from: number; to: number; text: string }
  /** Inserts text at the cursor (replacing the selection). Fires `onValueChange`. */
  insertText: (text: string) => void
}
