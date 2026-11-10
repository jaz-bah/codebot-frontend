"use client"

import * as React from "react"
import {
  ArrowUpRight,
  Circle,
  Pencil,
  Slash,
  Square,
  Trash2,
  Triangle,
  Type,
  Undo2,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import { useArtBoardContext } from "./art-board.context"
import type { ArtBoardToolbarItem, ArtBoardTool } from "./art-board.types"
import { DEFAULT_TOOLBAR_ITEMS } from "./use-art-board"

const TOOL_BUTTONS: Record<ArtBoardTool, { label: string; icon: LucideIcon }> =
  {
    draw: { label: "Draw (pen)", icon: Pencil },
    rectangle: { label: "Rectangle", icon: Square },
    ellipse: { label: "Ellipse", icon: Circle },
    line: { label: "Line", icon: Slash },
    arrow: { label: "Arrow", icon: ArrowUpRight },
    triangle: { label: "Triangle", icon: Triangle },
    text: { label: "Text", icon: Type },
  }

const ACTION_BUTTONS: Record<
  Exclude<ArtBoardToolbarItem, ArtBoardTool | "separator">,
  { label: string; icon: LucideIcon }
> = {
  undo: { label: "Undo last element", icon: Undo2 },
  clear: { label: "Clear board", icon: Trash2 },
}

function ToolButton({ tool }: { tool: ArtBoardTool }) {
  const { tool: active, setTool, editable } = useArtBoardContext()
  const meta = TOOL_BUTTONS[tool]
  const Icon = meta.icon
  return (
    <Tooltip>
      <TooltipTrigger render={<Button type="button" variant="ghost" size="icon-sm" data-slot="art-board-toolbar-button" data-tool={tool} aria-label={meta.label} aria-pressed={active === tool} disabled={!editable} onMouseDown={(event) => {
                      // Keep the drawing surface focusable and in focus.
                      event.preventDefault()
                    }} onClick={() => setTool(tool)} className={cn(
                      "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                    )} />}><Icon aria-hidden /></TooltipTrigger>
      <TooltipContent side="bottom">{meta.label}</TooltipContent>
    </Tooltip>
  )
}

/**
 * Default toolbar. Reads the tool + state of the surrounding `<ArtBoard>`,
 * so it is used as `<ArtBoard.Toolbar />`. Items can be reordered, trimmed
 * or replaced with `"separator"s.
 */
export function ArtBoardToolbar({
  items = DEFAULT_TOOLBAR_ITEMS,
  className,
}: {
  /** Subset + order of built-in items. */
  items?: ArtBoardToolbarItem[]
  className?: string
}) {
  const { empty, canUndo, editable, undo, clear } = useArtBoardContext()

  return (
    <TooltipProvider>
      <div
        data-slot="art-board-toolbar"
        role="toolbar"
        aria-label="Drawing tools"
        className={cn(
          "flex flex-wrap items-center gap-0.5 border-b border-border p-1",
          className
        )}
      >
        {items.map((item, index) => {
          if (item === "separator") {
            return (
              <Separator
                key={`separator-${index}`}
                orientation="vertical"
                className="mx-0.5"
              />
            )
          }
          if (item === "undo" || item === "clear") {
            const meta = ACTION_BUTTONS[item]
            const Icon = meta.icon
            const disabled =
              !editable ||
              (item === "undo" && !canUndo) ||
              (item === "clear" && empty)
            return (
              <Tooltip key={item}>
                <TooltipTrigger render={<Button type="button" variant="ghost" size="icon-sm" data-slot="art-board-toolbar-button" aria-label={meta.label} disabled={disabled} onMouseDown={(event) => {
                                          event.preventDefault()
                                        }} onClick={() => (item === "undo" ? undo() : clear())} />}><Icon aria-hidden /></TooltipTrigger>
                <TooltipContent side="bottom">{meta.label}</TooltipContent>
              </Tooltip>
            )
          }
          return <ToolButton key={item} tool={item as ArtBoardTool} />
        })}
      </div>
    </TooltipProvider>
  )
}
