"use client"

import * as React from "react"
import {
  Bold,
  Code,
  Italic,
  Link,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  SquareCode,
  Strikethrough,
  Underline,
  Undo2,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import { useRichTextEditorContext } from "./rich-text-editor.context"
import { DEFAULT_TOOLBAR_ITEMS } from "./use-rich-text-editor"
import type {
  RichTextEditorCommandName,
  RichTextEditorToolbarItem,
} from "./rich-text-editor.types"

const COMMANDS: Record<
  Exclude<RichTextEditorToolbarItem, "separator">,
  { label: string; icon: LucideIcon | undefined }
> = {
  undo: { label: "Undo", icon: Undo2 },
  redo: { label: "Redo", icon: Redo2 },
  heading1: { label: "Heading 1", icon: undefined },
  heading2: { label: "Heading 2", icon: undefined },
  heading3: { label: "Heading 3", icon: undefined },
  bold: { label: "Bold", icon: Bold },
  italic: { label: "Italic", icon: Italic },
  underline: { label: "Underline", icon: Underline },
  strike: { label: "Strikethrough", icon: Strikethrough },
  code: { label: "Inline code", icon: Code },
  bulletList: { label: "Bullet list", icon: List },
  orderedList: { label: "Numbered list", icon: ListOrdered },
  blockquote: { label: "Quote", icon: Quote },
  codeBlock: { label: "Code block", icon: SquareCode },
  link: { label: "Link", icon: Link },
  horizontalRule: { label: "Divider", icon: Minus },
}

function ToolbarButton({
  name,
  active,
  disabled,
  onRun,
}: {
  name: RichTextEditorCommandName
  active: boolean
  disabled: boolean
  onRun: (name: RichTextEditorCommandName) => void
}) {
  const meta = COMMANDS[name]
  const isHeading = name.startsWith("heading")
  const Icon = meta.icon
  return (
    <Tooltip>
      <TooltipTrigger render={<Button type="button" variant="ghost" size={isHeading ? "icon-sm" : "icon-sm"} data-slot="rich-text-editor-toolbar-button" aria-label={meta.label} aria-pressed={active} disabled={disabled} data-state={active ? "active" : undefined} onMouseDown={(event) => {
                      // Keep the editor's selection alive; Tiptap commands use it.
                      event.preventDefault()
                    }} className={cn(
                      "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                    )} onClick={() => onRun(name)} />}>{Icon ? (
                      <Icon aria-hidden />
                    ) : (
                      <span aria-hidden className="text-xs font-semibold leading-none">
                        {name.slice(-1)}
                      </span>
                    )}</TooltipTrigger>
      <TooltipContent side="bottom">{meta.label}</TooltipContent>
    </Tooltip>
  )
}

/**
 * Default toolbar. Reads the state of the surrounding `<RichTextEditor>`,
 * so it is used as `<RichTextEditor.Toolbar />`. Items can be reordered,
 * trimmed or replaced with `"separator"s.
 */
export function RichTextEditorToolbar({
  items = DEFAULT_TOOLBAR_ITEMS,
  className,
}: {
  /** Subset + order of built-in items. */
  items?: RichTextEditorToolbarItem[]
  className?: string
}) {
  const { state, editable, runCommand, insertLink, unsetLink } =
    useRichTextEditorContext()
  const [linkOpen, setLinkOpen] = React.useState(false)
  const [href, setHref] = React.useState("")

  const disabled = !editable

  const run = (name: RichTextEditorCommandName) => {
    if (name === "link") {
      if (state?.active.link) unsetLink()
      else setLinkOpen(true)
      return
    }
    runCommand(name)
  }

  return (
    <TooltipProvider>
      <div
        data-slot="rich-text-editor-toolbar"
        role="toolbar"
        aria-label="Formatting"
        className={cn(
          "flex flex-wrap items-center gap-0.5 border-b border-border p-1",
          className
        )}
      >
        {items.map((item, index) =>
          item === "separator" ? (
            <Separator key={`separator-${index}`} orientation="vertical" className="mx-0.5" />
          ) : (
            <ToolbarButton
              key={item}
              name={item as RichTextEditorCommandName}
              active={state?.active[item as RichTextEditorCommandName] ?? false}
              disabled={
                disabled ||
                (item === "undo" && !state?.canUndo) ||
                (item === "redo" && !state?.canRedo)
              }
              onRun={run}
            />
          )
        )}

        <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogTitle>Insert link</DialogTitle>
            <DialogDescription>
              Enter the URL to apply to the selection.
            </DialogDescription>
            <Input
              value={href}
              onChange={(event) => setHref(event.target.value)}
              placeholder="https://example.com"
              type="url"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  insertLink(href)
                  setLinkOpen(false)
                }
              }}
            />
            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLinkOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!href.trim()}
                onClick={() => {
                  insertLink(href.trim())
                  setLinkOpen(false)
                }}
              >
                Apply
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
