"use client"

import * as React from "react"

import { EditorWorkbenchProvider } from "./editor-workspace.context"
import { EditorWorkbenchFileTree } from "./file-tree"
import { EditorWorkbenchTopbar } from "./editor-workspace-topbar"
import { useEditorWorkbench } from "./use-editor-workspace"
import { cn } from "@/lib/utils"
import type {
  EditorWorkbenchHandle,
  EditorWorkbenchProps,
} from "./editor-workspace.types"

const EditorWorkbenchBase = React.forwardRef<
  EditorWorkbenchHandle,
  EditorWorkbenchProps
>(function EditorWorkbench(
  {
    files,
    value,
    defaultValue,
    onValueChange,
    onSave,
    dirty,
    readOnly = false,
    disabled = false,
    sidebar = true,
    sidebarContent,
    sidebarOpen,
    defaultSidebarOpen = true,
    onSidebarOpenChange,
    topbar = true,
    defaultExpandedIds,
    expandedIds,
    onExpandedIdsChange,
    label = "Files",
    className,
    topbarClassName,
    sidebarClassName,
    contentClassName,
    id,
    actions,
    renderItemAction,
    children,
  },
  ref
) {
  const hook = useEditorWorkbench({
    files,
    value,
    defaultValue,
    onValueChange,
    onSave,
    dirty,
    readOnly,
    disabled,
    sidebarOpen,
    defaultSidebarOpen,
    onSidebarOpenChange,
    defaultExpandedIds,
    expandedIds,
    onExpandedIdsChange,
  })
  const {
    selectedFile,
    selectedId,
    selectFile,
    expanded,
    setExpanded,
    focusedId,
    setFocused,
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
  } = hook

  React.useImperativeHandle(
    ref,
    () => ({
      selectFile,
      getSelectedFile: () => selectedFile,
      expandAll,
      collapseAll,
    }),
    [selectFile, expandAll, collapseAll, selectedFile]
  )

  const contextValue = React.useMemo(
    () => ({
      files,
      indexes: hook.indexes,
      selectedFile,
      selectedId,
      selectFile,
      expanded,
      setExpanded,
      focusedId,
      setFocused,
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
      hasSidebar: sidebar !== false,
      label,
      renderItemAction,
    }),
    [
      files,
      hook.indexes,
      selectedFile,
      selectedId,
      selectFile,
      expanded,
      setExpanded,
      focusedId,
      setFocused,
      expandAll,
      collapseAll,
      sidebarOpenState,
      setSidebarOpen,
      toggleSidebar,
      save,
      hasSave,
      canSave,
      dirtyValue,
      editable,
      sidebar,
      label,
      renderItemAction,
    ]
  )

  return (
    <div
      data-slot="editor-workbench"
      data-readonly={readOnly || undefined}
      data-disabled={disabled || undefined}
      aria-disabled={disabled || undefined}
      id={id}
      className={cn(
        "flex h-[420px] flex-col overflow-hidden rounded-md border border-input bg-background shadow-xs",
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      <EditorWorkbenchProvider value={contextValue}>
        {topbar ? (
          <EditorWorkbenchTopbar
            actions={actions}
            className={topbarClassName}
          />
        ) : null}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <main
            data-slot="editor-workbench-content"
            className={cn(
              "min-w-0 flex-1 overflow-hidden",
              contentClassName
            )}
          >
            {children}
          </main>
          {sidebar !== false && sidebarOpenState ? (
            <aside
              data-slot="editor-workbench-sidebar"
              aria-label={label}
              className={cn(
                "w-56 shrink-0 overflow-y-auto border-l border-border",
                sidebarClassName
              )}
            >
              {sidebarContent ?? <EditorWorkbenchFileTree />}
            </aside>
          ) : null}
        </div>
      </EditorWorkbenchProvider>
    </div>
  )
})

/**
 * IDE-style shell around any editor: a topbar (selected file title, Save,
 * extra actions, sidebar toggle) and a right sidebar with the file tree.
 * The editor itself is the consumer's — pass `<CodeEditor />`,
 * `<RichTextEditor />` or anything as children.
 */
export const EditorWorkbench = Object.assign(EditorWorkbenchBase, {
  /** Default topbar part. */
  Topbar: EditorWorkbenchTopbar,
  /** Default file-tree part. */
  FileTree: EditorWorkbenchFileTree,
})
