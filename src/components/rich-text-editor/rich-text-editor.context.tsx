"use client"

import * as React from "react"

import type { RichTextEditorState } from "./rich-text-editor.types"

export interface RichTextEditorContextValue {
  /** Engine instance (Tiptap `Editor`) — escape hatch, not public API. */
  editor: unknown
  /** Toolbar state snapshot, or `null` until the engine is ready. */
  state: RichTextEditorState | null
  /** Runs a command through the same mapping the built-in toolbar uses. */
  runCommand: (name: import("./rich-text-editor.types").RichTextEditorCommandName) => void
  /** Applies a link mark to the selection. */
  insertLink: (href: string) => void
  /** Removes any link mark within the selection. */
  unsetLink: () => void
  /** Whether the content is editable (false for readOnly/disabled). */
  editable: boolean
}

const RichTextEditorContext = React.createContext<RichTextEditorContextValue | null>(
  null
)

export function RichTextEditorProvider({
  value,
  children,
}: {
  value: RichTextEditorContextValue
  children: React.ReactNode
}) {
  return (
    <RichTextEditorContext.Provider value={value}>
      {children}
    </RichTextEditorContext.Provider>
  )
}

/**
 * Access the editor's headless state inside compound parts (e.g. a custom
 * toolbar rendered as a child of `<RichTextEditor>`).
 */
export function useRichTextEditorContext() {
  const context = React.useContext(RichTextEditorContext)
  if (!context) {
    throw new Error(
      "useRichTextEditorContext must be used inside <RichTextEditor>."
    )
  }
  return context
}
