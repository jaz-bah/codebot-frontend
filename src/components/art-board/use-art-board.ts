"use client"

import * as React from "react"

import { useCallbackRef } from "@/hooks/use-callback-ref"
import { useControllableState } from "@/hooks/use-controllable-state"

import type {
  ArtBoardItem,
  ArtBoardProps,
  ArtBoardToolbarItem,
  ArtBoardTool,
} from "./art-board.types"

export type UseArtBoardOptions = Pick<
  ArtBoardProps,
  | "value"
  | "defaultValue"
  | "onValueChange"
  | "tool"
  | "defaultTool"
  | "onToolChange"
  | "fontSize"
  | "readOnly"
  | "disabled"
  | "autoFocus"
>

/** Default order of the built-in toolbar. Consumers reorder via prop. */
export const DEFAULT_TOOLBAR_ITEMS: ArtBoardToolbarItem[] = [
  "draw",
  "rectangle",
  "ellipse",
  "line",
  "arrow",
  "triangle",
  "text",
  "separator",
  "undo",
  "clear",
]

/** Default stroke width when none is given. */
export const DEFAULT_STROKE_WIDTH = 3

/** Default font size of typed text, in SVG user units (= px). */
export const DEFAULT_FONT_SIZE = 16

/** A point in surface coordinates (CSS px, origin = surface top-left). */
interface Point {
  x: number
  y: number
}

/** Distance (px) the pointer must travel before the next freehand point is recorded. */
const MIN_POINT_DISTANCE = 1.25

const SHAPE_TOOLS = new Set<ArtBoardTool>([
  "rectangle",
  "ellipse",
  "line",
  "arrow",
  "triangle",
])

/** One-decimal rounding keeps the value string compact and stable. */
const round1 = (n: number) => Math.round(n * 10) / 10

/* ------------------------------------------------------------------ */
/* Value dialect: markup parsing / serialisation                       */
/* ------------------------------------------------------------------ */

const ITEM_PATTERN = /<path\b([^>]*?)\/>|<text\b([^>]*)>([\s\S]*?)<\/text>/g

const textEntities = new Map([
  ["&lt;", "<"],
  ["&gt;", ">"],
  ["&quot;", '"'],
  ["&apos;", "'"],
  ["&amp;", "&"],
])

/** XML-escape for text content committed into the value. */
export function escapeArtBoardText(text: string): string {
  return text.replace(/[&<>]/g, (ch) => {
    switch (ch) {
      case "&":
        return "&amp;"
      case "<":
        return "&lt;"
      case ">":
        return "&gt;"
      default:
        return ch
    }
  })
}

function attr(source: string, name: string): string | undefined {
  return new RegExp(`\\b${name}="([^"]*)"`).exec(source)?.[1]
}

/**
 * Parses a value into committed items. Accepts the board's own markup
 * dialect; a bare SVG path-data string (existing saved drawings) is
 * treated as one path. Malformed fragments are skipped, never thrown.
 */
export function parseArtBoardValue(value: string): ArtBoardItem[] {
  if (!value.trim()) return []

  const items: ArtBoardItem[] = []
  for (const match of value.matchAll(ITEM_PATTERN)) {
    const [, pathAttrs, textSizeAttrs, content] = match
    if (pathAttrs !== undefined) {
      const d = attr(pathAttrs, "d")
      if (d) items.push({ type: "path", d })
    } else if (textSizeAttrs !== undefined) {
      const x = Number(attr(textSizeAttrs, "x"))
      const y = Number(attr(textSizeAttrs, "y"))
      const fontSize = Number(attr(textSizeAttrs, "font-size"))
      if (Number.isFinite(x) && Number.isFinite(y)) {
        items.push({
          type: "text",
          x,
          y,
          fontSize: Number.isFinite(fontSize) ? fontSize : DEFAULT_FONT_SIZE,
          text: (content ?? "").replace(
            /&(?:lt|gt|quot|apos|amp);/g,
            (entity) => textEntities.get(entity) ?? entity
          ),
        })
      }
    }
  }
  if (items.length === 0 && value.includes("M")) {
    // Convenience: a bare SVG path-data string (pre-markup saved drawings)
    // is treated as one path element.
    items.push({ type: "path", d: value.trim() })
  }
  return items
}

/** Serialises an item back into the value dialect (used by undo). */
export function serializeArtBoardItem(item: ArtBoardItem): string {
  if (item.type === "path") {
    return `<path d="${item.d}"/>`
  }
  return `<text x="${round1(item.x)}" y="${round1(item.y)}" font-size="${round1(item.fontSize)}">${escapeArtBoardText(item.text)}</text>`
}

/* ------------------------------------------------------------------ */
/* Geometry serialisation                                              */
/* ------------------------------------------------------------------ */

function relativePoint(
  event: Pick<React.PointerEvent, "clientX" | "clientY">,
  origin: { x: number; y: number }
): Point {
  return { x: event.clientX - origin.x, y: event.clientY - origin.y }
}

/**
 * Serialises a freehand stroke to `M x yL x y…` path data. A single point
 * becomes a zero-length segment (`L` to the same point), which renders as
 * a round dot under `stroke-linecap: round`.
 */
function serializeStroke(points: readonly Point[]): string {
  if (points.length === 0) return ""
  let d = `M${round1(points[0].x)} ${round1(points[0].y)}`
  for (let i = 1; i < points.length; i++) {
    d += `L${round1(points[i].x)} ${round1(points[i].y)}`
  }
  if (points.length === 1) d += `L${round1(points[0].x)} ${round1(points[0].y)}`
  return d
}

/** Two anchor points → shape geometry, always as a single `<path>`. */
function shapePathData(
  kind: ArtBoardTool,
  anchor: Point,
  point: Point
): string {
  switch (kind) {
    case "rectangle": {
      return `M${round1(anchor.x)} ${round1(anchor.y)}H${round1(point.x)}V${round1(point.y)}H${round1(anchor.x)}Z`
    }
    case "ellipse": {
      const cx = round1((anchor.x + point.x) / 2)
      const cy = round1((anchor.y + point.y) / 2)
      const rx = Math.max(1, round1(Math.abs(point.x - anchor.x) / 2))
      const ry = Math.max(1, round1(Math.abs(point.y - anchor.y) / 2))
      return `M${cx} ${round1(cy - ry)}A${rx} ${ry} 0 1 1 ${cx} ${round1(cy + ry)}A${rx} ${ry} 0 1 1 ${cx} ${round1(cy - ry)}Z`
    }
    case "line": {
      return `M${round1(anchor.x)} ${round1(anchor.y)}L${round1(point.x)} ${round1(point.y)}`
    }
    case "arrow": {
      const dx = point.x - anchor.x
      const dy = point.y - anchor.y
      const length = Math.hypot(dx, dy) || 1
      const head = Math.min(16, length / 2)
      const ux = dx / length
      const uy = dy / length
      const px = -uy
      const py = ux
      const wingX = (sign: number) =>
        point.x - ux * head + px * head * 0.45 * sign
      const wingY = (sign: number) =>
        point.y - uy * head + py * head * 0.45 * sign
      return `M${round1(anchor.x)} ${round1(anchor.y)}L${round1(point.x)} ${round1(point.y)}M${round1(wingX(1))} ${round1(wingY(1))}L${round1(point.x)} ${round1(point.y)}L${round1(wingX(-1))} ${round1(wingY(-1))}`
    }
    case "triangle": {
      const left = round1(Math.min(anchor.x, point.x))
      const right = round1(Math.max(anchor.x, point.x))
      const top = round1(Math.min(anchor.y, point.y))
      const bottom = round1(Math.max(anchor.y, point.y))
      return `M${round1((left + right) / 2)} ${top}L${right} ${bottom}L${left} ${bottom}Z`
    }
    default:
      return ""
  }
}

/* ------------------------------------------------------------------ */
/* The hook                                                            */
/* ------------------------------------------------------------------ */

/**
 * Headless logic for ArtBoard: controllable markup value, the tool
 * (`draw`/shapes/`text`), pointer-to-element capture, the inline text
 * input state, keyboard undo/cancel and the `<svg>` export. Use it
 * directly to build a custom UI on top of the same behaviour.
 */
export function useArtBoard({
  value: userValue,
  defaultValue,
  onValueChange,
  tool: toolProp,
  defaultTool = "draw",
  onToolChange,
  fontSize = DEFAULT_FONT_SIZE,
  readOnly = false,
  disabled = false,
  autoFocus = false,
}: UseArtBoardOptions) {
  const [doc = "", setDoc] = useControllableState<string>({
    prop: userValue,
    defaultProp: defaultValue ?? "",
    onChange: onValueChange,
  })
  const [toolState, setToolRaw] = useControllableState<ArtBoardTool>({
    prop: toolProp,
    defaultProp: defaultTool,
    onChange: onToolChange,
  })
  const tool = toolState ?? defaultTool

  const editable = !readOnly && !disabled

  const surfaceRef = React.useRef<HTMLDivElement | null>(null)

  // Transient (ephemeral) state: the in-flight shape / freehand stroke and
  // the open text input. Committed elements are the `doc` string alone.
  const drawingRef = React.useRef(false)
  const pointerIdRef = React.useRef<number | null>(null)
  const originRef = React.useRef({ x: 0, y: 0 })
  const pointsRef = React.useRef<readonly Point[]>([])
  const anchorRef = React.useRef<Point | null>(null)
  const [strokePoints, setStrokePoints] = React.useState<readonly Point[]>([])
  const [shapeAnchor, setShapeAnchor] = React.useState<Point | null>(null)
  const [shapePoint, setShapePoint] = React.useState<Point | null>(null)
  const [textDraft, setTextDraft] = React.useState<{
    x: number
    y: number
    text: string
  } | null>(null)

  const items = React.useMemo(() => parseArtBoardValue(doc), [doc])
  const canUndo = items.length > 0
  const empty = items.length === 0

  React.useEffect(() => {
    if (!autoFocus) return
    surfaceRef.current?.focus({ preventScroll: true })
  }, [autoFocus])

  const setTool = (next: ArtBoardTool) => {
    // Switching tools commits pending text and cancels in-flight drawing.
    if (textDraft?.text) commitText()
    else if (textDraft) setTextDraft(null)
    drawingRef.current = false
    pointerIdRef.current = null
    setStrokePoints([])
    setShapeAnchor(null)
    setShapePoint(null)
    setToolRaw(next)
  }

  const updateText = (text: string) => {
    setTextDraft((draft) => (draft ? { ...draft, text } : draft))
  }

  const cancelText = () => setTextDraft(null)

  const commitText = () => {
    if (!textDraft) return
    if (textDraft.text) {
      setDoc(
        doc +
          `<text x="${round1(textDraft.x)}" y="${round1(textDraft.y + fontSize)}" font-size="${round1(fontSize)}">${escapeArtBoardText(textDraft.text)}</text>`
      )
    }
    setTextDraft(null)
  }

  const undo = () => {
    if (!editable || !canUndo) return
    // Rebuilding from parsed items normalises the value to our dialect.
    setDoc(items.slice(0, -1).map(serializeArtBoardItem).join(""))
  }

  const clear = () => {
    if (!editable || empty) return
    setDoc("")
  }

  const endDraw = (commit: boolean) => {
    if (!drawingRef.current) return
    drawingRef.current = false
    pointerIdRef.current = null
    const points = pointsRef.current
    const anchor = anchorRef.current
    pointsRef.current = []
    anchorRef.current = null
    setStrokePoints([])
    setShapeAnchor(null)
    setShapePoint(null)

    const markup = commit
      ? SHAPE_TOOLS.has(tool) && anchor
        ? `<path d="${shapePathData(tool, anchor, points[points.length - 1] ?? anchor)}"/>`
        : `<path d="${serializeStroke(points)}"/>`
      : ""
    if (markup) setDoc(doc + markup)
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const surface = surfaceRef.current
    if (!editable || !surface) return
    if (event.pointerType === "mouse" && event.button !== 0) return

    event.preventDefault()
    surface.focus({ preventScroll: true })

    if (tool === "text") {
      const rect = surface.getBoundingClientRect()
      const point = relativePoint(event, { x: rect.left, y: rect.top })
      if (textDraft?.text) commitText()
      else if (textDraft) setTextDraft(null)
      setTextDraft({ x: point.x, y: point.y, text: "" })
      return
    }
    if (drawingRef.current) return

    const rect = surface.getBoundingClientRect()
    originRef.current = { x: rect.left, y: rect.top }
    const point = relativePoint(event, originRef.current)

    drawingRef.current = true
    pointerIdRef.current = event.pointerId
    pointsRef.current = [point]
    setStrokePoints([point])
    if (SHAPE_TOOLS.has(tool)) {
      anchorRef.current = point
      setShapeAnchor(point)
      setShapePoint(point)
    }
    // Keeps streaming `pointermove`s during multi-touch and outside presses.
    // Optional call: jsdom (tests) and older browsers lack the API.
    surface.setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drawingRef.current || event.pointerId !== pointerIdRef.current) return
    const point = relativePoint(event, originRef.current)
    if (SHAPE_TOOLS.has(tool) && anchorRef.current) {
      // [anchor, end] — the shape's own geometry for preview and commit.
      pointsRef.current = [anchorRef.current, point]
      setShapePoint(point)
      return
    }
    const points = pointsRef.current
    const last = points[points.length - 1]
    if (
      last &&
      Math.hypot(point.x - last.x, point.y - last.y) < MIN_POINT_DISTANCE
    ) {
      return
    }
    const next = [...points, point]
    pointsRef.current = next
    setStrokePoints(next)
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (tool !== "text" && event.pointerId === pointerIdRef.current)
      endDraw(true)
  }

  const handlePointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== pointerIdRef.current) return
    endDraw(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // Text input manages its own keys (Enter/Escape) and stops propagation.
    if (event.target !== event.currentTarget) return
    if (event.key === "Escape" && drawingRef.current) {
      event.preventDefault()
      endDraw(false)
      return
    }
    if (!editable) return
    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault()
      undo()
      return
    }
    if (
      (event.key === "z" || event.key === "Z") &&
      (event.metaKey || event.ctrlKey)
    ) {
      event.preventDefault()
      undo()
    }
  }

  /**
   * Builds a standalone `<svg>` string of the current drawing. The default
   * stroke is `currentColor` (theme-aware when rendered); pass concrete
   * values for an interchangeable/portable string. Styles are inlined here
   * so the output looks the same anywhere the string is pasted.
   */
  const getSVG = useCallbackRef(
    (options?: {
      stroke?: string
      strokeWidth?: number
      fontFamily?: string
    }) => {
      const rect = surfaceRef.current?.getBoundingClientRect()
      const width = Math.max(1, Math.ceil(rect?.width ?? 0))
      const height = Math.max(1, Math.ceil(rect?.height ?? 0))
      const stroke = options?.stroke ?? "currentColor"
      const strokeWidth = options?.strokeWidth ?? DEFAULT_STROKE_WIDTH
      const fontFamily = options?.fontFamily
      const heading = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`
      const body = parseArtBoardValue(doc)
        .map((item) => {
          if (item.type === "path") {
            return `<path d="${item.d}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
          }
          return `<text x="${round1(item.x)}" y="${round1(item.y)}" font-size="${round1(item.fontSize)}"${fontFamily ? ` font-family="${fontFamily}"` : ""} fill="${stroke}">${escapeArtBoardText(item.text)}</text>`
        })
        .join("")
      return `${heading}${body}</svg>`
    }
  )

  // In-flight preview item (`null` while not drawing). Kept as an item so
  // the renderer draws the preview exactly like a committed element.
  const preview: ArtBoardItem | null =
    SHAPE_TOOLS.has(tool) && shapeAnchor && shapePoint
      ? { type: "path", d: shapePathData(tool, shapeAnchor, shapePoint) }
      : strokePoints.length > 0
        ? { type: "path", d: serializeStroke(strokePoints) }
        : null

  return {
    /** Committed drawing as markup. */
    value: doc,
    /** Replace the drawing (fires onValueChange). */
    setValue: setDoc,
    /** Committed elements, parsed from the value. */
    items,
    /** In-flight element (`null` when not drawing). */
    preview,
    /** Whether an element is being drawn right now. */
    drawing: preview != null,
    /** Active tool (controlled/uncontrolled). */
    tool,
    /** Switches the tool (cancels in-flight work). */
    setTool,
    /** Open inline text input, or `null` while closed. */
    textDraft,
    /** Replaces the text inside the open input. */
    updateText,
    /** Commits the open text input (fires onValueChange when non-empty). */
    commitText,
    /** Cancels the open text input. */
    cancelText,
    /** True when the board has no committed elements. */
    empty,
    /** True when at least one element can be undone. */
    canUndo,
    /** Font size of typed text. */
    fontSize,
    editable,
    surfaceRef,
    undo,
    clear,
    getSVG,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handleKeyDown,
  } satisfies {
    value: string
    setValue: (next: string) => void
    items: ArtBoardItem[]
    preview: ArtBoardItem | null
    drawing: boolean
    tool: ArtBoardTool
    setTool: (next: ArtBoardTool) => void
    textDraft: { x: number; y: number; text: string } | null
    updateText: (text: string) => void
    commitText: () => void
    cancelText: () => void
    empty: boolean
    canUndo: boolean
    fontSize: number
    editable: boolean
    surfaceRef: React.RefObject<HTMLDivElement | null>
    undo: () => void
    clear: () => void
    getSVG: (options?: {
      stroke?: string
      strokeWidth?: number
      fontFamily?: string
    }) => string
    handlePointerDown: React.PointerEventHandler<HTMLDivElement>
    handlePointerMove: React.PointerEventHandler<HTMLDivElement>
    handlePointerUp: React.PointerEventHandler<HTMLDivElement>
    handlePointerCancel: React.PointerEventHandler<HTMLDivElement>
    handleKeyDown: React.KeyboardEventHandler<HTMLDivElement>
  }
}
