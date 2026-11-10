import * as React from "react"

/**
 * Tools. `draw` is freehand; shapes are committed on pointer release
 * (drag = size); `text` opens an inline input — Enter or blur commits,
 * Escape cancels.
 */
export type ArtBoardTool =
  "draw" | "rectangle" | "ellipse" | "line" | "arrow" | "triangle" | "text"

/**
 * Value format (ADR-007): the drawing as **SVG fragment markup** — one
 * self-contained element per committed item:
 *
 * ```
 * <path d="M10.5 20.3L11 21"/><path d="M2 2H9V8H2Z"/><text x="10" y="26" font-size="16">Hi</text>
 * ```
 *
 * Strokes and shapes are `<path d="…"/>` (absolute, one-decimal commands);
 * typed text is `<text x y font-size>…</text>` (XML-escaped). Render the
 * value anywhere with `<svg>{value}</svg>` (or on a `<g>` via
 * `dangerouslySetInnerHTML`) — no drawing engine needed. The board parses
 * only this dialect (plus bare SVG path-data strings as a convenience for
 * existing values); `parseArtBoardValue()` turns a value into structured
 * items for custom rendering.
 */
export interface ArtBoardPathItem {
  type: "path"
  d: string
}

export interface ArtBoardTextItem {
  type: "text"
  /** Baseline position in surface coordinates (CSS px). */
  x: number
  y: number
  fontSize: number
  text: string
}

export type ArtBoardItem = ArtBoardPathItem | ArtBoardTextItem

export interface ArtBoardProps {
  /** Controlled drawing (SVG fragment markup as one string). */
  value?: string
  /** Initial drawing (SVG fragment markup) for uncontrolled usage. */
  defaultValue?: string
  /**
   * Fires with the full markup whenever an element is committed, undone,
   * cleared or set through the ref handle.
   */
  onValueChange?: (value: string) => void
  /** Controlled active tool. */
  tool?: ArtBoardTool
  /** Initial tool for uncontrolled usage. @default "draw" */
  defaultTool?: ArtBoardTool
  /** Fires whenever the tool changes (toolbar click or setTool). */
  onToolChange?: (tool: ArtBoardTool) => void
  /** New content cannot be drawn (existing drawing stays visible). */
  readOnly?: boolean
  /** Dims the board and blocks interaction (toolbar included). */
  disabled?: boolean
  /** Accessible name for the drawing surface. @default "Drawing board" */
  label?: string
  /** Shown centred while the board is empty. */
  placeholder?: React.ReactNode
  /** Stroke and text colour — any CSS colour. @default "currentColor" */
  strokeColor?: string
  /** Stroke width in px. @default 3 */
  strokeWidth?: number
  /** Font size of typed text (SVG user units = px). @default 16 */
  fontSize?: number
  /** Focus the drawing surface on mount. */
  autoFocus?: boolean
  /**
   * Render the default toolbar when no children are given. Pass `false`
   * and own the UI via `useArtBoard` or the `Toolbar` part.
   * @default true
   */
  toolbar?: boolean
  /** Minimum height of the drawing area, e.g. "320px". */
  minHeight?: string
  /** Maximum height of the drawing area. */
  maxHeight?: string
  /** Visual variant of the board frame. @default "outline" */
  variant?: ArtBoardVariant
  /** Class names for the outer wrapper (merged with `cn`). */
  className?: string
  /** Class names for the drawing surface (merged with `cn`). */
  surfaceClassName?: string
  /** Class names for the default toolbar (merged with `cn`). */
  toolbarClassName?: string
  /** Class names for the text input (merged with `cn`). */
  textInputClassName?: string
  id?: string
  /** Compound toolbar slot; replaces the default toolbar when given. */
  children?: React.ReactNode
}

export type ArtBoardVariant = "outline" | "dashed" | "ghost"

/** Subset + order of default-toolbar items. Append `"separator"`. */
export type ArtBoardToolbarItem = ArtBoardTool | "undo" | "clear" | "separator"

/** Imperative API exposed through `ref`. */
export interface ArtBoardHandle {
  focus: () => void
  blur: () => void
  /** Current drawing as SVG fragment markup. */
  getValue: () => string
  /** Replaces the whole drawing. Fires `onValueChange`. */
  setValue: (value: string) => void
  /** Removes the last committed element. Fires `onValueChange`. */
  undo: () => void
  /** Removes every element. Fires `onValueChange`. */
  clear: () => void
  /** Active tool. */
  getTool: () => ArtBoardTool
  /** Switches the tool. */
  setTool: (tool: ArtBoardTool) => void
  /**
   * The drawing as a complete standalone `<svg>` markup string — useful
   * for previews inside `dangerouslySetInnerHTML` or PNG rasterisation.
   */
  getSVG: () => string
}
