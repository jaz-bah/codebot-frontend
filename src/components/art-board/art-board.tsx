"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

import { ArtBoardProvider } from "./art-board.context"
import { ArtBoardToolbar } from "./art-board-toolbar"
import {
  DEFAULT_FONT_SIZE,
  DEFAULT_STROKE_WIDTH,
  useArtBoard,
} from "./use-art-board"
import type {
  ArtBoardHandle,
  ArtBoardItem,
  ArtBoardProps,
} from "./art-board.types"

/**
 * Frame variants mirror shadcn's vocabulary; colours stay on semantic
 * tokens so consumer themes apply automatically (DESIGN.md §2, §9).
 */
const artBoardVariants = cva(
  "overflow-hidden rounded-md bg-background text-foreground transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
  {
    variants: {
      variant: {
        outline: "border border-input shadow-xs",
        dashed: "border border-dashed border-border",
        ghost: "border border-transparent",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  }
)

/** Styling variant props of `<ArtBoard>` (this component's own subset). */
export type ArtBoardVariantProps = VariantProps<typeof artBoardVariants>

function BoardElement({
  item,
  strokeColor,
  strokeWidth,
}: {
  item: ArtBoardItem
  strokeColor: string
  strokeWidth: number
}) {
  if (item.type === "path") {
    return (
      <path
        data-slot="art-board-strokes"
        d={item.d}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )
  }
  return (
    <text
      data-slot="art-board-text"
      x={item.x}
      y={item.y}
      fontSize={item.fontSize}
      fill={strokeColor}
    >
      {item.text}
    </text>
  )
}

/**
 * Root component. Renders the drawing surface plus (by default) the
 * built-in tool/undo/clear toolbar; pass children (e.g.
 * `<ArtBoard.Toolbar />` or a fully custom toolbar built on
 * `useArtBoardContext`) to compose instead.
 */
export const ArtBoard = Object.assign(
  React.forwardRef<ArtBoardHandle, ArtBoardProps>(function ArtBoard(
    {
      value,
      defaultValue,
      onValueChange,
      tool,
      defaultTool = "draw",
      onToolChange,
      readOnly = false,
      disabled = false,
      label = "Drawing board",
      placeholder,
      strokeColor = "currentColor",
      strokeWidth = DEFAULT_STROKE_WIDTH,
      fontSize = DEFAULT_FONT_SIZE,
      autoFocus = false,
      toolbar = true,
      minHeight,
      maxHeight,
      variant = "outline",
      className,
      surfaceClassName,
      toolbarClassName,
      textInputClassName,
      id,
      children,
    },
    ref
  ) {
    const hook = useArtBoard({
      value,
      defaultValue,
      onValueChange,
      tool,
      defaultTool,
      onToolChange,
      fontSize,
      readOnly,
      disabled,
      autoFocus,
    })
    const {
      surfaceRef,
      value: committedValue,
      items,
      preview,
      textDraft,
      updateText,
      commitText,
      cancelText,
      setValue: setValueFromHook,
      tool: activeTool,
      setTool,
      empty,
      canUndo,
      editable,
      fontSize: committedFontSize,
      undo,
      clear,
      getSVG,
      handlePointerDown,
      handlePointerMove,
      handlePointerUp,
      handlePointerCancel,
      handleKeyDown,
    } = hook

    const instructionsId = React.useId()
    const textInputId = `${instructionsId}-text`

    // `strokeColor = "currentColor"` is theme-aware when rendered, but an
    // exported `<svg>` string should carry a concrete colour so it looks
    // the same anywhere. Falls back gracefully when styles are unknown.
    const exportStrokeColor = React.useCallback(() => {
      if (strokeColor && strokeColor !== "currentColor") return strokeColor
      const surface = surfaceRef.current
      if (!surface) return "currentColor"
      const computed = window.getComputedStyle(surface).color
      return computed || "currentColor"
    }, [strokeColor, surfaceRef])

    React.useImperativeHandle(
      ref,
      () => ({
        focus: () => surfaceRef.current?.focus({ preventScroll: true }),
        blur: () => surfaceRef.current?.blur(),
        getValue: () => committedValue,
        setValue: setValueFromHook,
        undo,
        clear,
        getTool: () => activeTool,
        setTool,
        getSVG: () =>
          getSVG({
            stroke: exportStrokeColor(),
            strokeWidth,
            fontFamily:
              window.getComputedStyle(surfaceRef.current ?? document.body)
                .fontFamily || undefined,
          }),
      }),
      [
        surfaceRef,
        committedValue,
        setValueFromHook,
        undo,
        clear,
        activeTool,
        setTool,
        getSVG,
        exportStrokeColor,
        strokeWidth,
      ]
    )

    const contextValue = React.useMemo(
      () => ({
        tool: activeTool,
        setTool,
        empty,
        canUndo,
        editable,
        undo,
        clear,
      }),
      [activeTool, setTool, empty, canUndo, editable, undo, clear]
    )

    const hasChildren = React.Children.count(children) > 0

    return (
      <div
        data-slot="art-board"
        data-readonly={readOnly || undefined}
        data-disabled={disabled || undefined}
        data-empty={empty || undefined}
        data-tool={activeTool}
        aria-disabled={disabled || undefined}
        className={cn(
          artBoardVariants({ variant }),
          disabled && "pointer-events-none opacity-50",
          className
        )}
      >
        <ArtBoardProvider value={contextValue}>
          {hasChildren ? (
            children
          ) : toolbar ? (
            <ArtBoardToolbar className={toolbarClassName} />
          ) : null}
          <div
            data-slot="art-board-surface"
            data-drawing={preview != null || undefined}
            data-tool={activeTool}
            ref={surfaceRef}
            id={id}
            role="application"
            aria-label={label}
            aria-roledescription="freehand drawing board"
            aria-describedby={
              textDraft ? `${instructionsId} ${textInputId}` : instructionsId
            }
            tabIndex={disabled ? -1 : 0}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onKeyDown={handleKeyDown}
            style={{ minHeight, maxHeight, touchAction: "none" }}
            className={cn(
              "relative flex min-h-48 h-full outline-none select-none",
              editable ? "cursor-crosshair" : "cursor-default",
              surfaceClassName
            )}
          >
            <svg
              data-slot="art-board-svg"
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden"
            >
              {items.map((item, index) => (
                <BoardElement
                  key={index}
                  item={item}
                  strokeColor={strokeColor}
                  strokeWidth={strokeWidth}
                />
              ))}
              {preview ? (
                <BoardElement
                  item={preview}
                  strokeColor={strokeColor}
                  strokeWidth={strokeWidth}
                />
              ) : null}
            </svg>
            {empty && !preview && !textDraft && placeholder != null ? (
              <span
                data-slot="art-board-placeholder"
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-4 flex items-center justify-center text-sm text-muted-foreground select-none"
              >
                {placeholder}
              </span>
            ) : null}
            {textDraft ? (
              <input
                data-slot="art-board-text-input"
                id={textInputId}
                type="text"
                autoFocus
                aria-label={`Text at ${Math.round(textDraft.x)}, ${Math.round(textDraft.y)}`}
                value={textDraft.text}
                onChange={(event) => updateText(event.target.value)}
                onKeyDown={(event) => {
                  // The surface must not see typing keys (Backspace undoes!).
                  event.stopPropagation()
                  if (event.key === "Enter") {
                    event.preventDefault()
                    commitText()
                  } else if (event.key === "Escape") {
                    event.preventDefault()
                    cancelText()
                  }
                }}
                onPointerDown={(event) => event.stopPropagation()}
                onPointerMove={(event) => event.stopPropagation()}
                onPointerUp={(event) => event.stopPropagation()}
                onBlur={commitText}
                style={{
                  left: textDraft.x,
                  top: textDraft.y - committedFontSize,
                  fontSize: committedFontSize,
                  lineHeight: "1.2",
                  width: `${Math.max(textDraft.text.length + 1, 4)}ch`,
                }}
                className={cn(
                  "absolute bg-transparent p-0 caret-foreground outline-none",
                  textInputClassName
                )}
              />
            ) : null}
            <span id={instructionsId} className="sr-only">
              Drawing surface. Freehand drawing, shapes and text require a
              mouse, pen or touch input. Keyboard: Escape cancels the current
              element, Backspace or Delete undoes the last element, Control or
              Command plus Z also undoes.
            </span>
          </div>
        </ArtBoardProvider>
      </div>
    )
  }),
  {
    /** Default toolbar part. */
    Toolbar: ArtBoardToolbar,
  }
)
