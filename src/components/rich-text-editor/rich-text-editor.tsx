"use client"

import * as React from "react"
import { EditorContent } from "@tiptap/react"

import { RichTextEditorProvider } from "./rich-text-editor.context"
import { RichTextEditorToolbar } from "./rich-text-editor-toolbar"
import { useRichTextEditor } from "./use-rich-text-editor"
import { cn } from "@/lib/utils"
import type {
  RichTextEditorHandle,
  RichTextEditorProps,
} from "./rich-text-editor.types"

/**
 * Prose styles for the editable surface. Only semantic tokens — the
 * consumer's theme applies automatically (DESIGN.md §2). Content-element
 * styling is deliberately scoped under `[&_.ProseMirror]`.
 */
const PROSE_CLASSES = [
  "[&_.ProseMirror]:outline-none",
  // Placeholder renders once, at the top of an EMPTY editor only. The
  // extension adds `is-editor-empty` to the first node while the document
  // is empty; `.is-empty` (any empty block) would repeat the text on
  // every blank line and is deliberately not styled.
  "[&_.ProseMirror_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
  "[&_.ProseMirror_.is-editor-empty:first-child::before]:float-left",
  "[&_.ProseMirror_.is-editor-empty:first-child::before]:h-0",
  "[&_.ProseMirror_.is-editor-empty:first-child::before]:pointer-events-none",
  "[&_.ProseMirror_.is-editor-empty:first-child::before]:text-muted-foreground",
  // Prose rhythm
  "[&_.ProseMirror]:text-sm [&_.ProseMirror]:leading-relaxed",
  "[&_.ProseMirror_p]:my-1.5",
  "[&_.ProseMirror_h1]:mt-3 [&_.ProseMirror_h1]:mb-1 [&_.ProseMirror_h1]:text-xl [&_.ProseMirror_h1]:font-semibold [&_.ProseMirror_h1]:tracking-tight [&_.ProseMirror_h1:first-child]:mt-0",
  "[&_.ProseMirror_h2]:mt-3 [&_.ProseMirror_h2]:mb-1 [&_.ProseMirror_h2]:text-lg [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:tracking-tight [&_.ProseMirror_h2:first-child]:mt-0",
  "[&_.ProseMirror_h3]:mt-2 [&_.ProseMirror_h3]:mb-1 [&_.ProseMirror_h3]:text-base [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3:first-child]:mt-0",
  "[&_.ProseMirror_ul]:my-1.5 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5",
  "[&_.ProseMirror_ol]:my-1.5 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5",
  "[&_.ProseMirror_li_p]:my-0.5",
  "[&_.ProseMirror_blockquote]:my-2 [&_.ProseMirror_blockquote]:border-l-2 [&_.ProseMirror_blockquote]:border-border [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:text-muted-foreground",
  "[&_.ProseMirror_code]:rounded-sm [&_.ProseMirror_code]:bg-muted [&_.ProseMirror_code]:px-1 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:font-mono [&_.ProseMirror_code]:text-xs [&_.ProseMirror_code]:text-foreground",
  "[&_.ProseMirror_pre]:my-2 [&_.ProseMirror_pre]:overflow-x-auto [&_.ProseMirror_pre]:rounded-md [&_.ProseMirror_pre]:bg-muted [&_.ProseMirror_pre]:p-3 [&_.ProseMirror_pre]:font-mono [&_.ProseMirror_pre]:text-xs",
  "[&_.ProseMirror_pre_code]:bg-transparent [&_.ProseMirror_pre_code]:p-0",
  "[&_.ProseMirror_a]:text-primary [&_.ProseMirror_a]:underline [&_.ProseMirror_a]:underline-offset-2",
  "[&_.ProseMirror_hr]:my-4 [&_.ProseMirror_hr]:border-border",
].join(" ")

const emptySubscribe = () => () => {}

/**
 * The engine instantiates on first render, and Tiptap uses values Next
 * (Cache Components) forbids during a prerendered client render. Mounting
 * the engine only after hydration keeps the registry item buildable with
 * zero consumer edits. Uses `useSyncExternalStore` (not setState-in-effect)
 * per the React Compiler lint rules.
 */
function useEngineGate() {
  return React.useSyncExternalStore(emptySubscribe, () => true, () => false)
}

const RichTextEditorInner = React.forwardRef<
  RichTextEditorHandle,
  RichTextEditorProps
>(function RichTextEditor(
  {
    value,
    defaultValue,
    onValueChange,
    readOnly = false,
    disabled = false,
    placeholder,
    label,
    autoFocus = false,
    toolbar = true,
    toolbarOptions,
    minHeight,
    maxHeight,
    className,
    editorClassName,
    toolbarClassName,
    extensions,
    id,
    children,
  },
  ref
) {
  const hook = useRichTextEditor({
    value,
    defaultValue,
    onValueChange,
    readOnly,
    disabled,
    placeholder,
    label,
    autoFocus,
    extensions,
  })
  const { editor, state, editable, setValue, runCommand } = hook
  const insertLink = hook.insertLink
  const unsetLink = hook.unsetLink

  React.useImperativeHandle(
    ref,
    () => ({
      focus: () => editor?.chain().focus().run(),
      blur: () => editor?.commands.blur(),
      getHTML: () => editor?.getHTML() ?? "",
      getJSON: () => editor?.getJSON() ?? null,
      setHTML: (next) => setValue(next),
      insertHTML: (next) => editor?.chain().focus().insertContent(next).run(),
      insertLink,
      unsetLink,
      runCommand,
    }),
    [editor, setValue, runCommand, insertLink, unsetLink]
  )

  const contextValue = React.useMemo(
    () => ({ editor, state, runCommand, insertLink, unsetLink, editable }),
    [editor, state, runCommand, insertLink, unsetLink, editable]
  )

  const hasChildren = React.Children.count(children) > 0

  return (
    <div
      data-slot="rich-text-editor"
      data-readonly={readOnly || undefined}
      data-disabled={disabled || undefined}
      aria-disabled={disabled || undefined}
      className={cn(
        "overflow-hidden rounded-md border border-input bg-background shadow-xs transition-[color,box-shadow]",
        "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      <RichTextEditorProvider value={contextValue}>
        {hasChildren ? (
          children
        ) : toolbar ? (
          <RichTextEditorToolbar
            items={toolbarOptions}
            className={toolbarClassName}
          />
        ) : null}
        <div
          data-slot="rich-text-editor-content"
          id={id}
          className={cn("min-h-32 px-3 py-2", PROSE_CLASSES, editorClassName)}
          style={{ minHeight, maxHeight }}
        >
          <EditorContent editor={editor} />
        </div>
      </RichTextEditorProvider>
    </div>
  )
})

const RichTextEditorWithoutToolbar = React.forwardRef<
  RichTextEditorHandle,
  RichTextEditorProps
>(function RichTextEditor(props, ref) {
  const {
    readOnly,
    disabled,
    minHeight,
    maxHeight,
    className,
    id,
  } = props
  const mounted = useEngineGate()

  if (!mounted) {
    // Hydration placeholder: same visual shell, engine not yet created.
    return (
      <div
        data-slot="rich-text-editor"
        data-readonly={readOnly || undefined}
        data-disabled={disabled || undefined}
        aria-disabled={disabled || undefined}
        className={cn(
          "overflow-hidden rounded-md border border-input bg-background shadow-xs",
          className
        )}
      >
        <div
          data-slot="rich-text-editor-content"
          id={id}
          className="min-h-32 px-3 py-2"
          style={{ minHeight, maxHeight }}
        />
      </div>
    )
  }

  return <RichTextEditorInner {...props} ref={ref} />
})

/**
 * Root component. Renders the editable surface plus (by default) the
 * built-in toolbar; pass children (e.g. `<RichTextEditor.Toolbar />` or a
 * fully custom toolbar built on `useRichTextEditorContext`) to compose
 * instead.
 */
export const RichTextEditor = Object.assign(RichTextEditorWithoutToolbar, {
  /** Default toolbar part. */
  Toolbar: RichTextEditorToolbar,
})
