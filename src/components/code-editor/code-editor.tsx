"use client"

import * as React from "react"
import ReactCodeMirror, {
  ExternalChange,
  type ReactCodeMirrorRef,
} from "@uiw/react-codemirror"

import { cn } from "@/lib/utils"

import type { CodeEditorHandle, CodeEditorProps } from "./code-editor.types"
import { useCodeEditor } from "./use-code-editor"

export const CodeEditor = React.forwardRef<CodeEditorHandle, CodeEditorProps>(
  function CodeEditor(
    {
      language = "plaintext",
      value,
      defaultValue,
      onValueChange,
      readOnly = false,
      disabled = false,
      placeholder,
      label,
      lineNumbers = true,
      lineWrapping = false,
      tabSize = 2,
      autoFocus = false,
      height,
      minHeight,
      maxHeight,
      className,
      editorClassName,
      extensions: userExtensions,
      onLanguageStatusChange,
      id,
    },
    ref
  ) {
    const cmRef = React.useRef<ReactCodeMirrorRef>(null)

    const editor = useCodeEditor({
      language,
      value,
      defaultValue,
      onValueChange,
      lineWrapping,
      tabSize,
      label,
      extensions: userExtensions,
      onLanguageStatusChange,
    })

    // Controlled mode: the engine only syncs when the `value` prop changes. If
    // the parent rejects an edit (prop stays the same) we must revert the view
    // ourselves, so force a render after each edit and reconcile below.
    const isControlled = value !== undefined
    const [, bump] = React.useReducer((n: number) => n + 1, 0)
    const handleChange = React.useCallback(
      (next: string) => {
        editor.handleChange(next)
        if (isControlled) bump()
      },
      [editor, isControlled]
    )

    React.useEffect(() => {
      const view = cmRef.current?.view
      if (!view) return
      const current = view.state.doc.toString()
      if (current === editor.value) return
      const anchor = Math.min(
        view.state.selection.main.anchor,
        editor.value.length
      )
      view.dispatch({
        changes: { from: 0, to: current.length, insert: editor.value },
        selection: { anchor },
        annotations: [ExternalChange.of(true)],
      })
    })

    React.useImperativeHandle(
      ref,
      () => ({
        focus: () => cmRef.current?.view?.focus(),
        blur: () => cmRef.current?.view?.contentDOM.blur(),
        getValue: () =>
          cmRef.current?.view?.state.doc.toString() ?? editor.value,
        setValue: (next) => editor.setValue(next),
        getSelection: () => {
          const state = cmRef.current?.view?.state
          if (!state) return { from: 0, to: 0, text: "" }
          const { from, to } = state.selection.main
          return { from, to, text: state.sliceDoc(from, to) }
        },
        insertText: (text) => {
          const view = cmRef.current?.view
          if (!view) return
          const { from, to } = view.state.selection.main
          view.dispatch({
            changes: { from, to, insert: text },
            selection: { anchor: from + text.length },
            userEvent: "input",
          })
          view.focus()
        },
      }),
      [editor]
    )

    const editable = !readOnly && !disabled

    return (
      <div
        data-slot="code-editor"
        data-language={language}
        data-language-status={editor.languageStatus}
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
        <ReactCodeMirror
          ref={cmRef}
          id={id}
          data-slot="code-editor-surface"
          // `h-full` completes the height chain: the uiw engine applies
          // `height` (incl. "100%") to `.cm-editor` itself, but its parent
          // wrapper is auto-height, so a percentage would resolve to
          // auto, the editor would grow to the content height and get
          // clipped instead of scrolling. 100% of a definite (fixed-px)
          // ancestor is a no-op; with an auto root it stays harmless.
          className={cn("text-sm h-full", editorClassName)}
          value={editor.value}
          onChange={handleChange}
          extensions={editor.extensions}
          theme="none"
          readOnly={readOnly}
          editable={editable}
          placeholder={placeholder}
          autoFocus={autoFocus}
          indentWithTab
          height={height}
          minHeight={minHeight}
          maxHeight={maxHeight}
          basicSetup={{
            lineNumbers,
            foldGutter: lineNumbers,
            highlightActiveLineGutter: lineNumbers,
            tabSize,
          }}
        />
      </div>
    )
  }
)
