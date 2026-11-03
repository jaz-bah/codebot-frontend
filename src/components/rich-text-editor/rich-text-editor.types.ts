import type { Extension } from "@tiptap/core"
import type * as React from "react"

/**
 * Commands exposed by the component's toolbar and imperative handle.
 * These are our names — the mapping to engine commands is ours, so
 * swapping the engine does not change this union.
 */
export type RichTextEditorCommandName =
  | "undo"
  | "redo"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "code"
  | "blockquote"
  | "bulletList"
  | "orderedList"
  | "codeBlock"
  | "link"
  | "horizontalRule"

/** A toolbar separator. */
export type RichTextEditorToolbarItem =
  | RichTextEditorCommandName
  | "separator"

/**
 * Snapshot of the engine state the toolbar (or a consumer-rebuilt toolbar)
 * needs to render active/disabled states. Compare-per-field, deep-equal
 * against a selector so toolbars only re-render when values change.
 */
export interface RichTextEditorState {
  /** Whether each command is active at the current selection. */
  active: Record<RichTextEditorCommandName, boolean>
  /** Undo/redo availability at the current selection. */
  canUndo: boolean
  canRedo: boolean
}

/**
 * Engine-specific escape hatch. These are Tiptap extensions; using them
 * couples the consumer to the engine (see README → Limits).
 */
export type RichTextEditorExtension = Extension

export interface RichTextEditorProps {
  /** Controlled document value (HTML string). */
  value?: string
  /** Initial document value (HTML string) for uncontrolled usage. */
  defaultValue?: string
  /**
   * Fires with the full document as HTML whenever the user edits it.
   * The document is HTML; the engine instance is hidden (see README).
   */
  onValueChange?: (value: string) => void
  /** Content cannot be edited but can be selected and copied. */
  readOnly?: boolean
  /** Dims the editor and blocks interaction (toolbar included). */
  disabled?: boolean
  /** Shown on empty paragraphs. Read on mount / on engine re-creation. */
  placeholder?: string
  /** Accessible name for the editable region. */
  label?: string
  /** Focus the editor on mount. */
  autoFocus?: boolean
  /**
   * Render the default toolbar toolbar when no children are given.
   * Pass `false` and own the UI via `useRichTextEditor` or the
   * `Toolbar` part. @default true
   */
  toolbar?: boolean
  /** Subset + order of default-toolbar items. Append `"separator"`. */
  toolbarOptions?: RichTextEditorToolbarItem[]
  /** Minimum height of the content area, e.g. "160px". */
  minHeight?: string
  /** Maximum height of the content area (content scrolls inside). */
  maxHeight?: string
  /** Class names for the outer wrapper (merged with `cn`). */
  className?: string
  /** Class names for the content area (merged with `cn`). */
  editorClassName?: string
  /** Class names for the default toolbar (merged with `cn`). */
  toolbarClassName?: string
  /** Extra engine extensions appended after ours (engine-specific). */
  extensions?: RichTextEditorExtension[]
  id?: string
  /** Compound toolbar slot. Replaces the default toolbar when given. */
  children?: React.ReactNode
}

/** Imperative API exposed through `ref`. */
export interface RichTextEditorHandle {
  focus: () => void
  blur: () => void
  getHTML: () => string
  /** Document as JSON. Engine-specific shape — documented in the README. */
  getJSON: () => unknown
  /** Replaces the whole document. Fires `onValueChange`. */
  setHTML: (html: string) => void
  /** Inserts HTML at the cursor (replacing the selection). Fires `onValueChange`. */
  insertHTML: (html: string) => void
  /** Applies a link mark to the selection. */
  insertLink: (href: string) => void
  /** Removes any link mark within the selection. */
  unsetLink: () => void
  /** Runs a toolbar command (headless, same mapping the toolbar uses). */
  runCommand: (name: RichTextEditorCommandName) => void
}
