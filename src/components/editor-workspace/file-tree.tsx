"use client"

import * as React from "react"
import {
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
  type ItemInstance,
} from "@headless-tree/core"
import { useTree } from "@headless-tree/react"
import { ChevronRight, FileText, Folder, FolderOpen } from "lucide-react"

import { cn } from "@/lib/utils"

import {
  ROOT_ID,
  type WorkspaceItemData,
} from "./use-editor-workspace"
import { useEditorWorkbenchContext } from "./editor-workspace.context"

const FEATURES = [syncDataLoaderFeature, selectionFeature, hotkeysCoreFeature]

/** The synthetic root every `files` prop hangs off. */
const ROOT_DATA: WorkspaceItemData = {
  id: ROOT_ID,
  name: "",
  type: "folder" as const,
}

/**
 * The file/folder tree. The ONLY file in this component that knows about
 * the engine (@headless-tree); replacing the engine means replacing this
 * file's wiring (see research note → Swap plan).
 */
export function EditorWorkbenchFileTree({ className }: { className?: string }) {
  const {
    indexes,
    selectedId,
    focusedId,
    expanded,
    editable,
    label,
    selectFile,
    setExpanded,
    setFocused,
    renderItemAction,
  } = useEditorWorkbenchContext()

  const tree = useTree<WorkspaceItemData>({
    features: FEATURES,
    rootItemId: ROOT_ID,
    dataLoader: {
      getItem: (id) =>
        id === ROOT_ID
          ? ROOT_DATA
          : (indexes.byId.get(id) ?? { id, name: id, type: "file" as const }),
      getChildren: (id) => indexes.childrenOf.get(id) ?? [],
    },
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => item.getItemData().type === "folder",
    // Fully controlled sub-states: values come from the workbench state,
    // engine updates delegate back through the setter callbacks below.
    state: {
      selectedItems: selectedId ? [selectedId] : [],
      expandedItems: expanded,
      focusedItem: focusedId,
    },
    setSelectedItems: (update) => {
      if (!editable) return
      // Single-selection contract: plain clicks produce one id. Multi-select
      // (Ctrl/Shift) is not part of the workbench contract; keep the last.
      const ids = typeof update === "function" ? update([]) : update
      selectFile(ids[ids.length - 1] ?? "")
    },
    setExpandedItems: (update) => {
      if (!editable) return
      setExpanded(typeof update === "function" ? update(expanded) : update)
    },
    setFocusedItem: (update) => {
      if (!editable) return
      setFocused(typeof update === "function" ? update(focusedId) : update)
    },
  })
  // `files` is plain data that can change per render; the engine caches the
  // structural side of it, so every files change must be flushed through
  // rebuildTree (the data loader closures read the fresh indexes).
  React.useEffect(() => {
    tree.rebuildTree()
  }, [tree, indexes])

  const activateItem = (item: ItemInstance<WorkspaceItemData>) => {
    if (!editable) return
    item.setFocused()
    if (item.isFolder()) {
      if (item.isExpanded()) item.collapse()
      else item.expand()
    } else {
      selectFile(item.getId())
    }
  }

  const containerProps = tree.getContainerProps(label)

  const handleContainerKeyDown = (
    event: React.KeyboardEvent<HTMLElement>
  ) => {
    // WAI-ARIA tree activation: Enter/Space activates the focused item
    // (expand/collapse folders, select files). The engine hotkeys handle
    // arrows/Home/End.
    if (event.key !== "Enter" && event.key !== " ") return
    const focused = tree.getFocusedItem()
    if (!focused) return
    event.preventDefault()
    if (focused.isFolder()) {
      if (focused.isExpanded()) focused.collapse()
      else focused.expand()
    } else {
      selectFile(focused.getId())
    }
  }

  return (
    <div
      data-slot="editor-workbench-file-tree"
      {...containerProps}
      onKeyDown={(event) => {
        containerProps.onKeyDown?.(event)
        handleContainerKeyDown(event)
      }}
      className={cn("flex min-h-0 flex-col gap-px p-1.5", className)}
    >
      {tree.getItems().length === 0 ? (
        <p className="px-1.5 py-3 text-xs text-muted-foreground">
          No folders or notes yet.
        </p>
      ) : null}
      {tree.getItems().map((item) => {
        const data = item.getItemData()
        const isFolder = data.type === "folder"
        const selected = item.isSelected()
        const expandedNow = item.isExpanded()
        const level = item.getItemMeta().level
        return (
          <div
            key={item.getId()}
            data-slot="editor-workbench-tree-item"
            data-type={data.type}
            data-selected={selected || undefined}
            aria-disabled={!editable || undefined}
            {...item.getProps()}
            onClick={() => activateItem(item)}
            className={cn(
              "flex items-center gap-1 rounded-sm py-1 pr-1.5 text-sm outline-none transition-colors",
              "hover:bg-accent/50 focus-visible:bg-accent/40 focus-visible:ring-1 focus-visible:ring-ring",
              selected && "bg-accent text-accent-foreground",
              !editable && "pointer-events-none opacity-60"
            )}
            style={{ paddingLeft: `${(level - 1) * 14 + 6}px` }}
          >
            {isFolder ? (
              <span className="grid size-3.5 shrink-0 place-items-center">
                <ChevronRight
                  aria-hidden
                  className={cn(
                    "size-3 transition-transform",
                    expandedNow && "rotate-90"
                  )}
                />
              </span>
            ) : (
              <span aria-hidden className="size-3.5 shrink-0" />
            )}
            {isFolder ? (
              expandedNow ? (
                <FolderOpen aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
              ) : (
                <Folder aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
              )
            ) : (
              <FileText aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
            )}
            <span className={cn("truncate", renderItemAction && "flex-1")}>
              {item.getItemName()}
            </span>
            {renderItemAction ? (
              // The action owns its interactions: selecting/activating the
              // row must not fire when it is clicked or keyboard-driven.
              <span
                className="ml-auto flex shrink-0 items-center"
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
                {renderItemAction({
                  id: data.id,
                  name: data.name,
                  type: data.type,
                })}
              </span>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
