import type * as React from "react"

/** A node in the file tree. Plain data in — the owner of the files decides what it means. */
export interface WorkspaceFile {
  /** Unique id. Selection state addresses files by id. */
  id: string
  /** Displayed in the tree and the topbar title. */
  name: string
  type: "file" | "folder"
  /** Children of a folder. Ignored for files. */
  children?: WorkspaceFile[]
}

export interface EditorWorkbenchProps {
  /** The file / folder tree. Plain data; changes flow in per render. */
  files: WorkspaceFile[]
  /** Controlled selected file id (addressing `files`). */
  value?: string
  /** Initial selected file id for uncontrolled usage. @default "" (none) */
  defaultValue?: string
  /** Fires with the selected file id whenever the selection changes. */
  onValueChange?: (fileId: string) => void
  /**
   * Enables the Save button in the topbar. Fires with the currently
   * selected file. The workbench never persists anything itself.
   */
  onSave?: (file: WorkspaceFile) => void
  /**
   * Marks the current document as changed: the Save button becomes
   * prominent while `true` and disabled while `false`. `undefined` treats
   * the document as always saveable.
   */
  dirty?: boolean
  /** Tree and Save are inert; content remains selectable/copyable. */
  readOnly?: boolean
  /** Dims the whole workbench and blocks interaction. */
  disabled?: boolean
  /** Render the built-in file tree sidebar. @default true */
  sidebar?: boolean
  /** Compose a custom sidebar instead (e.g. `EditorWorkbench.FileTree`). */
  sidebarContent?: React.ReactNode
  /** Controlled sidebar visibility. */
  sidebarOpen?: boolean
  /** Initial sidebar visibility for uncontrolled usage. @default true */
  defaultSidebarOpen?: boolean
  /** Fires when the sidebar toggle button changes visibility. */
  onSidebarOpenChange?: (open: boolean) => void
  /** Render the built-in topbar (title, actions, Save, sidebar toggle). @default true */
  topbar?: boolean
  /** Folder ids expanded on mount. */
  defaultExpandedIds?: string[]
  /** Controlled expanded folder ids (uncontrolled by default). */
  expandedIds?: string[]
  /** Fires when the tree expansion changes. */
  onExpandedIdsChange?: (ids: string[]) => void
  /** Accessible name of the tree. @default "Files" */
  label?: string
  /** Extra topbar content (buttons, dropdowns) rendered before Save. */
  actions?: React.ReactNode
  /**
   * Optional per-item action node (e.g. a context `<DropdownMenu />`)
   * rendered at the end of every tree row. Interactions inside it don't
   * activate/select the row.
   */
  renderItemAction?: (file: WorkspaceFile) => React.ReactNode
  /** Class for the outer wrapper (merged with `cn`). */
  className?: string
  /** Class for the topbar row. */
  topbarClassName?: string
  /** Class for the sidebar panel. */
  sidebarClassName?: string
  /** Class for the editor-content area. */
  contentClassName?: string
  /** Id of the wrapper element. */
  id?: string
  /** The editor area (e.g. `<CodeEditor />`, `<RichTextEditor />`, anything). */
  children: React.ReactNode
}

export interface EditorWorkbenchHandle {
  /** Programmatically change the selection (fires `onValueChange`). */
  selectFile: (id: string) => void
  /** Resolved `WorkspaceFile` for the current selection, or `null`. */
  getSelectedFile: () => WorkspaceFile | null
  /** Expand every folder in `files` (recursively). */
  expandAll: () => void
  /** Collapse every folder. */
  collapseAll: () => void
}
