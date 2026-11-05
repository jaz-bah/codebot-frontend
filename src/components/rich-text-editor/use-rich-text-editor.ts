"use client"

import * as React from "react"
import { useEditor, useEditorState } from "@tiptap/react"
import type { Editor } from "@tiptap/core"
import { StarterKit } from "@tiptap/starter-kit"
import { Placeholder } from "@tiptap/extensions"

import { useCallbackRef } from "@/hooks/use-callback-ref"
import { useControllableState } from "@/hooks/use-controllable-state"

import type {
  RichTextEditorCommandName,
  RichTextEditorHandle,
  RichTextEditorProps,
  RichTextEditorState,
  RichTextEditorToolbarItem,
} from "./rich-text-editor.types"

export type UseRichTextEditorOptions = Pick<
  RichTextEditorProps,
  | "value"
  | "defaultValue"
  | "onValueChange"
  | "readOnly"
  | "disabled"
  | "placeholder"
  | "label"
  | "autoFocus"
  | "extensions"
>

/** Default order of the built-in toolbar. Consumers reorder via prop. */
export const DEFAULT_TOOLBAR_ITEMS: RichTextEditorToolbarItem[] = [
  "undo",
  "redo",
  "separator",
  "heading1",
  "heading2",
  "heading3",
  "separator",
  "bold",
  "italic",
  "underline",
  "strike",
  "code",
  "separator",
  "bulletList",
  "orderedList",
  "blockquote",
  "codeBlock",
  "separator",
  "link",
  "horizontalRule",
]

/**
 * Headless logic for RichTextEditor: controllable HTML document, the
 * engine instance (hidden behind our types), the command mapping and the
 * active-command snapshot. Use it directly to build a custom UI on top of
 * the same behaviour — including rendering `RichTextEditorContent`.
 */
export function useRichTextEditor({
  value,
  defaultValue,
  onValueChange,
  readOnly = false,
  disabled = false,
  placeholder = "",
  label,
  autoFocus = false,
  extensions: userExtensions,
}: UseRichTextEditorOptions) {
  const [doc = "", setDoc] = useControllableState<string>({
    prop: value,
    defaultProp: defaultValue ?? "",
    onChange: onValueChange,
  })

  const editable = !readOnly && !disabled
  const [changed, bump] = React.useReducer((n: number) => n + 1, 0)
  const onUpdate = useCallbackRef(({ editor }: { editor: Editor }) => {
    setDoc(editor.getHTML())
    // In controlled mode `setDoc` is a no-op (the prop owns the value), so
    // mirror the code-editor pattern: force a render so the sync effect
    // below can revert rejected edits.
    bump()
  })

  const editor = useEditor(
    {
      // `doc` is read at engine-creation (and placeholder-driven recreation)
      // time only — `useEditor` ignores it on every other render. Passing
      // the live state keeps recreation from reverting user edits.
      content: doc,
      extensions: [
        StarterKit.configure({
          // The engine marks hard breaks via "Shift+Enter"; nothing else
          // needs configuration — the kit already ships every command
          // this component exposes.
          link: { openOnClick: false, autolink: true },
        }),
        Placeholder.configure({ placeholder }),
        ...(userExtensions ?? []),
      ],
      editable,
      // SSR-safe and re-render-cheap: transaction-driven state is read
      // through `useEditorState` selectors instead of component re-renders.
      shouldRerenderOnTransaction: false,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          "aria-label": label ?? "Rich text editor",
        },
      },
      onUpdate,
    },
    // Recreate only when the placeholder changes; content survives because
    // `mostRecentOptions` is re-read with the latest document below.
    [placeholder]
  )

  // Single source of truth: the engine follows `doc`. In uncontrolled mode
  // `doc` already equals the engine's HTML, so this is a no-op; in that
  // mode the editor may render `<p></p>` for an empty string, which we
  // treat as equal to its native empty representation. `changed` re-runs
  // this effect after each edit so controlled reverts happen immediately.
  React.useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (current === doc) return
    if (doc === "" && editor.isEmpty) return
    editor.commands.setContent(doc, { emitUpdate: false })
  }, [editor, doc, changed])

  // Keep editability in sync without recreating the engine.
  React.useEffect(() => {
    if (!editor) return
    if (editor.isEditable !== editable) editor.setEditable(editable)
  }, [editor, editable])

  const focusedOnce = React.useRef(false)
  React.useEffect(() => {
    if (!editor || !autoFocus || focusedOnce.current) return
    focusedOnce.current = true
    editor.commands.focus()
  }, [editor, autoFocus])

  const runCommand = useCallbackRef(
    (name: RichTextEditorCommandName, target?: Editor) => {
      const ed = target ?? editor
      if (!ed) return
      const chain = ed.chain().focus()
      switch (name) {
        case "undo":
          chain.undo().run()
          break
        case "redo":
          chain.redo().run()
          break
        case "heading1":
          chain.toggleHeading({ level: 1 }).run()
          break
        case "heading2":
          chain.toggleHeading({ level: 2 }).run()
          break
        case "heading3":
          chain.toggleHeading({ level: 3 }).run()
          break
        case "bold":
          chain.toggleBold().run()
          break
        case "italic":
          chain.toggleItalic().run()
          break
        case "underline":
          chain.toggleUnderline().run()
          break
        case "strike":
          chain.toggleStrike().run()
          break
        case "code":
          chain.toggleCode().run()
          break
        case "blockquote":
          chain.toggleBlockquote().run()
          break
        case "bulletList":
          chain.toggleBulletList().run()
          break
        case "orderedList":
          chain.toggleOrderedList().run()
          break
        case "codeBlock":
          chain.toggleCodeBlock().run()
          break
        case "link":
          // Headless toggle: clears an existing link; adding one needs a
          // URL, so that is the dedicated `insertLink` API.
          if (ed.isActive("link")) chain.unsetLink().run()
          break
        case "horizontalRule":
          chain.setHorizontalRule().run()
          break
      }
    }
  )

  const insertLink = useCallbackRef((href: string) => {
    if (!editor || !href) return
    editor.chain().focus().setLink({ href }).run()
  })

  const unsetLink = useCallbackRef(() => {
    if (!editor) return
    editor.chain().focus().unsetLink().run()
  })

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      if (!e) return null
      return {
        active: {
          undo: false,
          redo: false,
          heading1: e.isActive("heading", { level: 1 }),
          heading2: e.isActive("heading", { level: 2 }),
          heading3: e.isActive("heading", { level: 3 }),
          bold: e.isActive("bold"),
          italic: e.isActive("italic"),
          underline: e.isActive("underline"),
          strike: e.isActive("strike"),
          code: e.isActive("code"),
          blockquote: e.isActive("blockquote"),
          bulletList: e.isActive("bulletList"),
          orderedList: e.isActive("orderedList"),
          codeBlock: e.isActive("codeBlock"),
          link: e.isActive("link"),
          horizontalRule: false,
        },
        canUndo: e.can().undo(),
        canRedo: e.can().redo(),
      } satisfies RichTextEditorState
    },
  })

  return {
    /** Current document HTML. */
    value: doc,
    /** Replace the document (fires onValueChange). */
    setValue: setDoc,
    /**
     * Engine instance (Tiptap `Editor`). Engine-specific — escape hatch
     * for custom UIs; not part of the stable API.
     */
    editor,
    /** Toolbar state snapshot, or `null` until the engine is ready. */
    state,
    /** Invisible mapping shared with the built-in toolbar. */
    runCommand,
    /** Applies a link mark to the selection. */
    insertLink,
    /** Removes any link mark within the selection. */
    unsetLink,
    editable,
  } satisfies {
    value: string
    setValue: (next: string) => void
    editor: Editor | null
    state: RichTextEditorState | null
    runCommand: RichTextEditorHandle["runCommand"]
    insertLink: (href: string) => void
    unsetLink: () => void
    editable: boolean
  }
}
