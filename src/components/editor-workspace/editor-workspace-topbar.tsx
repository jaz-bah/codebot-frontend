"use client"

import * as React from "react"
import { FileText, Folder, PanelRight, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { useEditorWorkbenchContext } from "./editor-workspace.context"

/**
 * Default topbar: selected file title, dirty indicator, an `actions`
 * slot, Save and the sidebar toggle. Reads from the surrounding
 * `<EditorWorkbench>`, so it also works standalone as
 * `<EditorWorkbench.Topbar />`.
 */
export function EditorWorkbenchTopbar({
  actions,
  className,
}: {
  /** Extra buttons / content between the title and Save. */
  actions?: React.ReactNode
  className?: string
}) {
  const {
    selectedFile,
    dirty,
    save,
    canSave,
    hasSave,
    hasSidebar,
    sidebarOpen,
    toggleSidebar,
  } = useEditorWorkbenchContext()

  return (
    <header
      data-slot="editor-workbench-topbar"
      className={cn(
        "flex items-center gap-2 border-b border-border px-2 py-1.5",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        {selectedFile === null ? null : selectedFile.type === "folder" ? (
          <Folder aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <FileText aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
        )}
        <span
          data-slot="editor-workbench-title"
          className="truncate text-sm font-medium"
        >
          {selectedFile?.name ?? "No file selected"}
        </span>
        {dirty ? (
          <>
            <span
              aria-hidden
              className="size-1.5 shrink-0 rounded-full bg-primary ring-1 ring-primary/30"
            />
            <span className="sr-only">Unsaved changes</span>
          </>
        ) : null}
      </div>

      <div
        role="toolbar"
        aria-label="Editor actions"
        className="flex shrink-0 items-center gap-1"
      >
        {actions}
        {hasSave ? (
          <Button
            type="button"
            size="sm"
            variant={dirty ? "default" : "outline"}
            disabled={!canSave}
            data-slot="editor-workbench-save"
            onClick={save}
          >
            <Save aria-hidden />
            Save
          </Button>
        ) : null}
        {hasSidebar ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={sidebarOpen ? "Hide file tree" : "Show file tree"}
            aria-expanded={sidebarOpen}
            data-state={sidebarOpen ? "open" : "closed"}
            onClick={toggleSidebar}
          >
            <PanelRight aria-hidden />
          </Button>
        ) : null}
      </div>
    </header>
  )
}
