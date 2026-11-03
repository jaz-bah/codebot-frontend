"use client"

import * as React from "react"

import type { WorkspaceFile } from "./editor-workspace.types"
import type { WorkspaceIndexes } from "./use-editor-workspace"

/**
 * What compound parts (Topbar, FileTree, custom UIs) can access inside
 * `<EditorWorkbench>`. Only our types — the tree engine instance never
 * crosses this boundary.
 */
export interface EditorWorkbenchContextValue {
  files: WorkspaceFile[]
  /** Flattened lookup maps over `files` (data loader + id lookups). */
  indexes: WorkspaceIndexes
  /** Currently selected file (full object or `null` when nothing selected). */
  selectedFile: WorkspaceFile | null
  selectedId: string
  /** Changes the selection (fires `onValueChange`). */
  selectFile: (id: string) => void
  /** Ids of currently expanded folders. */
  expanded: string[]
  setExpanded: (ids: string[]) => void
  /** Currently focused tree item id (roving keyboard focus). */
  focusedId: string | null
  setFocused: (id: string | null) => void
  expandAll: () => void
  collapseAll: () => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  /** Runs `onSave` with the selected file (no-op when not saveable). */
  save: () => void
  /** Whether an `onSave` handler was provided (Save button exists). */
  hasSave: boolean
  /** Whether the Save button should be enabled right now. */
  canSave: boolean
  dirty: boolean
  /** `false` for readOnly / disabled: interactions inert. */
  editable: boolean
  /** Whether the built-in sidebar is enabled at all (not visibility). */
  hasSidebar: boolean
  /** Per-tree-item action node, or `undefined`. */
  renderItemAction?: (file: WorkspaceFile) => React.ReactNode
  /** Accessible name of the tree. */
  label: string
}

const EditorWorkbenchContext =
  React.createContext<EditorWorkbenchContextValue | null>(null)

export function EditorWorkbenchProvider({
  value,
  children,
}: {
  value: EditorWorkbenchContextValue
  children: React.ReactNode
}) {
  return (
    <EditorWorkbenchContext.Provider value={value}>
      {children}
    </EditorWorkbenchContext.Provider>
  )
}

/** Access the workbench state inside compound parts (incl. custom UIs). */
export function useEditorWorkbenchContext() {
  const context = React.useContext(EditorWorkbenchContext)
  if (!context) {
    throw new Error(
      "useEditorWorkbenchContext must be used inside <EditorWorkbench>."
    )
  }
  return context
}
