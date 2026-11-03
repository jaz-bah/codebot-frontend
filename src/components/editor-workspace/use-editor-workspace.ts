"use client"

import * as React from "react"

import { useCallbackRef } from "@/hooks/use-callback-ref"
import { useControllableState } from "@/hooks/use-controllable-state"

import type { EditorWorkbenchProps, WorkspaceFile } from "./editor-workspace.types"

export type UseEditorWorkbenchOptions = Pick<
  EditorWorkbenchProps,
  | "files"
  | "value"
  | "defaultValue"
  | "onValueChange"
  | "onSave"
  | "dirty"
  | "readOnly"
  | "disabled"
  | "sidebarOpen"
  | "defaultSidebarOpen"
  | "onSidebarOpenChange"
  | "defaultExpandedIds"
  | "expandedIds"
  | "onExpandedIdsChange"
>

/** Root of the synthetic tree handed to the engine. */
export const ROOT_ID = "root"

/** Item data the tree engine sees (deliberately small — no children arrays). */
export type WorkspaceItemData = Pick<WorkspaceFile, "id" | "name" | "type">

export interface WorkspaceIndexes {
  /** Full file objects by id (data loader + lookups). */
  byId: Map<string, WorkspaceItemData>
  /** Ids of each node's visible children (incl. the synthetic root). */
  childrenOf: Map<string, string[]>
  /** All folder ids in `files` (drives `expandAll`). */
  folderIds: string[]
}

export function buildWorkspaceIndexes(files: WorkspaceFile[]): WorkspaceIndexes {
  const byId = new Map<string, WorkspaceItemData>()
  const childrenOf = new Map<string, string[]>()
  const folderIds: string[] = []

  const walk = (nodes: WorkspaceFile[], parentId: string) => {
    childrenOf.set(parentId, nodes.map((node) => node.id))
    for (const node of nodes) {
      byId.set(node.id, { id: node.id, name: node.name, type: node.type })
      if (node.type === "folder") {
        folderIds.push(node.id)
        walk(node.children ?? [], node.id)
      }
    }
  }
  walk(files, ROOT_ID)
  return { byId, childrenOf, folderIds }
}

/**
 * Headless logic for EditorWorkbench: controllable selection (ADR-002),
 * internal expansion/focus UI state, the sidebar toggle and the save flow.
 * The tree engine instance is created in `file-tree.tsx` — the only file
 * that knows the engine.
 */
export function useEditorWorkbench({
  files,
  value,
  defaultValue,
  onValueChange,
  onSave,
  dirty,
  readOnly = false,
  disabled = false,
  sidebarOpen,
  defaultSidebarOpen = true,
  onSidebarOpenChange,
  defaultExpandedIds = [],
  expandedIds,
  onExpandedIdsChange,
}: UseEditorWorkbenchOptions) {
  const editable = !readOnly && !disabled

  const indexes = React.useMemo(() => buildWorkspaceIndexes(files), [files])

  const [selectedId = "", selectFileRaw] = useControllableState<string>({
    prop: value,
    defaultProp: defaultValue ?? "",
    onChange: onValueChange,
  })

  const [focusedId, setFocusedRaw] = React.useState<string | null>(
    () => files[0]?.id ?? null
  )

  const [expanded = [], setExpandedRaw] = useControllableState<string[]>({
    prop: expandedIds,
    defaultProp: defaultExpandedIds,
    onChange: onExpandedIdsChange,
  })

  const [sidebarOpenState = true, setSidebarOpen] = useControllableState<boolean>({
    prop: sidebarOpen,
    defaultProp: defaultSidebarOpen,
    onChange: onSidebarOpenChange,
  })

  const selectedFile = React.useMemo<WorkspaceFile | null>(
    () => buildFullFile(files, selectedId),
    [files, selectedId]
  )

  const selectFile = useCallbackRef((id: string) => {
    selectFileRaw(id)
  })

  const expandAll = useCallbackRef(() => {
    setExpandedRaw(indexes.folderIds)
  })
  const collapseAll = useCallbackRef(() => {
    setExpandedRaw([])
  })

  const setExpanded = useCallbackRef((ids: string[]) => {
    setExpandedRaw(ids)
  })
  const setFocused = useCallbackRef((id: string | null) => {
    setFocusedRaw(id)
  })

  const toggleSidebar = useCallbackRef(() => {
    setSidebarOpen(!sidebarOpenState)
  })

  const dirtyValue = dirty ?? false
  const hasSave = !!onSave
  const canSave =
    editable &&
    hasSave &&
    selectedFile !== null &&
    selectedFile.type === "file" &&
    (dirty ?? true)

  const save = useCallbackRef(() => {
    if (!canSave) return
    onSave!(selectedFile)
  })

  return {
    files,
    indexes,
    selectedId,
    selectedFile: buildFullFile(files, selectedId),
    selectFile,
    focusedId,
    setFocused,
    expanded,
    setExpanded,
    expandAll,
    collapseAll,
    sidebarOpen: sidebarOpenState,
    setSidebarOpen,
    toggleSidebar,
    save,
    hasSave,
    canSave,
    dirty: dirtyValue,
    editable,
  }
}

/** Find the full `WorkspaceFile` (with children) a selection id points at. */
export function buildFullFile(
  files: WorkspaceFile[],
  id: string
): WorkspaceFile | null {
  const find = (nodes: WorkspaceFile[]): WorkspaceFile | null => {
    for (const node of nodes) {
      if (node.id === id) return node
      const found = find(node.children ?? [])
      if (found) return found
    }
    return null
  }
  return id ? find(files) : null
}
