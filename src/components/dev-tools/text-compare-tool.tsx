"use client"

import * as React from "react"
import { EditorView } from "@codemirror/view"
import ReactCodeMirror from "@uiw/react-codemirror"
import { Check, Copy } from "lucide-react"

import { codeEditorTheme } from "@/components/code-editor/code-editor.theme"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  compareText,
  type CompareResult,
  type DiffRow,
} from "@/utils/text-compare"
import { countText } from "@/utils/text-transform"
import { cn } from "cn"

const NUMBER = new Intl.NumberFormat("en-US")

/** Rows rendered per page — keeps a 20k-line diff from building 80k nodes. */
const ROW_PAGE = 600

type ViewMode = "split" | "inline"

type Side = "left" | "right"

/**
 * Plain-text CodeMirror setup: line numbers and undo/redo, soft wrapping, and
 * no code-editor extras (folding, brackets, autocomplete) for prose.
 */
const EDITOR_SETUP = {
  lineNumbers: true,
  foldGutter: false,
  highlightActiveLine: false,
  highlightActiveLineGutter: false,
  bracketMatching: false,
  closeBrackets: false,
  autocompletion: false,
  highlightSelectionMatches: false,
  foldKeymap: false,
  completionKeymap: false,
  lintKeymap: false,
} as const

/** Small type overrides on top of the shared editor chrome (12px prose). */
const EDITOR_THEME = EditorView.theme({
  "&": { fontSize: "12px" },
  ".cm-scroller": {
    fontFamily: "var(--font-mono, ui-monospace, SFMono-Regular, monospace)",
  },
  ".cm-content": { padding: "0.5rem 0" },
  ".cm-line": { padding: "0 0.5rem" },
  ".cm-gutter.cm-lineNumbers .cm-gutterElement": {
    padding: "0 0.5rem",
    minWidth: "2rem",
  },
})

const EDITOR_EXTENSIONS = [
  codeEditorTheme,
  EDITOR_THEME,
  EditorView.lineWrapping,
]

/**
 * /dev-tools/text-compare — two editable blocks, one diff.
 *
 * The diff is recomputed from deferred copies of both documents, so typing
 * always paints first and alignment follows; the engine itself caps its work
 * (see utils/text-compare.ts) and the table only renders the first page of
 * rows, so even a huge paste cannot lock the tab.
 */
export function TextCompareTool() {
  const [before, setBefore] = React.useState("")
  const [after, setAfter] = React.useState("")
  const [mode, setMode] = React.useState<ViewMode>("split")
  const [ignoreWhitespace, setIgnoreWhitespace] = React.useState(false)
  const [ignoreCase, setIgnoreCase] = React.useState(false)
  const [copied, setCopied] = React.useState<Side | null>(null)

  const deferredBefore = React.useDeferredValue(before)
  const deferredAfter = React.useDeferredValue(after)
  const isBusy = deferredBefore !== before || deferredAfter !== after

  const options = React.useMemo(
    () => ({ ignoreWhitespace, ignoreCase }),
    [ignoreWhitespace, ignoreCase]
  )

  const result = React.useMemo(
    () => compareText(deferredBefore, deferredAfter, options),
    [deferredBefore, deferredAfter, options]
  )

  // A new comparison restarts the row window.
  const [window, setWindow] = React.useState<{ result: CompareResult; visible: number }>(
    { result, visible: ROW_PAGE }
  )
  if (window.result !== result) {
    setWindow({ result, visible: ROW_PAGE })
  }
  const visibleRows = window.result === result ? window.visible : ROW_PAGE
  const { stats } = result
  /** Inline mode expands each modified pair into a −/+ pair, so it has more rows. */
  const renderCount = mode === "split" ? stats.totalRows : stats.totalRows + stats.modified

  const copyTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  React.useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current)
    },
    []
  )

  const copySide = async (side: Side, value: string) => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable")
      await navigator.clipboard.writeText(value)
    } catch {
      /* clipboard blocked — nothing to fall back to for a single pane */
    }
    setCopied(side)
    if (copyTimer.current) clearTimeout(copyTimer.current)
    copyTimer.current = setTimeout(() => setCopied(null), 1600)
  }

  const clear = () => {
    setBefore("")
    setAfter("")
    setCopied(null)
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {/* Toolbar */}
      <Card size="sm" className="gap-0 py-0">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-3">
          <div className="flex items-center gap-1.5" role="group" aria-label="Comparison mode">
            <ModeChip active={mode === "split"} onClick={() => setMode("split")}>
              Side by side
            </ModeChip>
            <ModeChip active={mode === "inline"} onClick={() => setMode("inline")}>
              Inline
            </ModeChip>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <OptionCheck
              checked={ignoreWhitespace}
              onChange={setIgnoreWhitespace}
              label="Ignore whitespace"
            />
            <OptionCheck
              checked={ignoreCase}
              onChange={setIgnoreCase}
              label="Ignore case"
            />
          </div>

          <Button
            variant="outline"
            size="xs"
            className="ml-auto shrink-0"
            onClick={clear}
            disabled={!before && !after}
          >
            Clear both
          </Button>
        </div>
      </Card>

      {/* Editable inputs */}
      <div className="grid gap-3 lg:grid-cols-2">
        <EditorPane
          label="Original"
          value={before}
          onChange={setBefore}
          onCopy={() => copySide("left", before)}
          copied={copied === "left"}
          placeholder="Paste the original text here…"
        />
        <EditorPane
          label="Changed"
          value={after}
          onChange={setAfter}
          onCopy={() => copySide("right", after)}
          copied={copied === "right"}
          placeholder="Paste the changed text here…"
        />
      </div>

      {/* Diff */}
      <Card size="sm" className="flex flex-col gap-0 overflow-hidden py-0">
        <div className="flex min-h-9 flex-wrap items-center gap-x-3 gap-y-1 border-b px-3 py-1.5">
          <span className="text-[10px] font-semibold tracking-[0.12em] uppercase">
            Differences
          </span>

          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] tabular-nums">
            <span className="text-success">+{NUMBER.format(stats.added)} added</span>
            <span className="text-destructive">
              −{NUMBER.format(stats.removed)} removed
            </span>
            <span className="text-warning">
              ~{NUMBER.format(stats.modified)} modified
            </span>
            <span className="text-muted-foreground">
              {NUMBER.format(stats.unchanged)} unchanged
            </span>
          </div>

          <span className="ml-auto shrink-0 text-[11px] text-muted-foreground tabular-nums">
            {isBusy ? "updating…" : `${stats.similarity}% identical`}
          </span>
        </div>

        <div className="thin-scrollbar h-[clamp(260px,42svh,560px)] overflow-auto">
          {stats.totalRows === 0 ? (
            <p className="px-4 py-10 text-center text-xs text-muted-foreground">
              Paste text into both editors to see the differences.
            </p>
          ) : mode === "split" ? (
            <SplitDiff rows={result.rows} visible={visibleRows} />
          ) : (
            <InlineDiff rows={result.rows} visible={visibleRows} />
          )}
        </div>

        <div className="flex min-h-8 flex-wrap items-center gap-2 border-t px-3 py-1.5 text-[11px] text-muted-foreground">
          {stats.coarse && (
            <span className="text-warning">
              Inputs are very large — showing block-level changes.
            </span>
          )}
          {!stats.coarse && stats.totalRows > 0 && stats.changes === 0 && (
            <span>Both sides are identical.</span>
          )}
          {renderCount > ROW_PAGE && (
            <>
              <span className="tabular-nums">
                Showing {NUMBER.format(Math.min(visibleRows, renderCount))} of{" "}
                {NUMBER.format(renderCount)} rows
              </span>
              {visibleRows < renderCount && (
                <Button
                  variant="ghost"
                  size="xs"
                  className="ml-auto"
                  onClick={() =>
                    setWindow((current) => ({
                      result: current.result,
                      visible: current.visible + ROW_PAGE,
                    }))
                  }
                >
                  Show {NUMBER.format(Math.min(ROW_PAGE, renderCount - visibleRows))} more
                </Button>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Toolbar bits                                                        */
/* ------------------------------------------------------------------ */

function ModeChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-md border px-2.5 py-1 text-[11px] leading-5 font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-muted/40 text-foreground/80 hover:bg-muted hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}

function OptionCheck({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
}) {
  return (
    <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-muted-foreground select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-3.5 accent-primary"
      />
      {label}
    </label>
  )
}

/* ------------------------------------------------------------------ */
/* Input pane                                                          */
/* ------------------------------------------------------------------ */

function EditorPane({
  label,
  value,
  onChange,
  onCopy,
  copied,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  onCopy: () => void
  copied: boolean
  placeholder: string
}) {
  const stats = React.useMemo(() => countText(value), [value])

  // Extensions are keyed only by the accessible name, so CodeMirror is not
  // reconfigured on every keystroke.
  const extensions = React.useMemo(
    () => [
      ...EDITOR_EXTENSIONS,
      EditorView.contentAttributes.of({ "aria-label": label }),
    ],
    [label]
  )

  return (
    <Card
      size="sm"
      className="flex h-[clamp(190px,26svh,280px)] min-w-0 flex-col gap-0 overflow-hidden py-0 transition-shadow focus-within:ring-2 focus-within:ring-ring/40"
    >
      <div className="flex h-9 shrink-0 items-center gap-2 border-b px-3">
        <span className="text-[10px] font-semibold tracking-[0.12em] uppercase">
          {label}
        </span>
        <span className="ml-auto truncate text-[11px] text-muted-foreground tabular-nums">
          {NUMBER.format(stats.lines)} lines · {NUMBER.format(stats.characters)} chars
        </span>
        <Button
          variant="ghost"
          size="xs"
          className="gap-1"
          onClick={onCopy}
          disabled={!value}
        >
          {copied ? (
            <>
              <Check className="size-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3" />
              Copy
            </>
          )}
        </Button>
      </div>

      <div className="min-h-0 flex-1">
        <ReactCodeMirror
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          height="100%"
          className="h-full"
          theme="none"
          extensions={extensions}
          basicSetup={EDITOR_SETUP}
        />
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Diff renderers                                                      */
/* ------------------------------------------------------------------ */

function rowTone(kind: DiffRow["kind"], side: Side): string {
  if (kind === "modify") {
    return side === "left"
      ? "border-l-destructive/60 bg-destructive/10"
      : "border-l-success/60 bg-success/10"
  }
  if (kind === "remove" && side === "left") {
    return "border-l-destructive/60 bg-destructive/10"
  }
  if (kind === "add" && side === "right") {
    return "border-l-success/60 bg-success/10"
  }
  return "border-l-transparent"
}

function SplitDiff({ rows, visible }: { rows: DiffRow[]; visible: number }) {
  return (
    <table className="w-full table-fixed border-collapse font-mono text-[12px]">
      <tbody>
        {rows.slice(0, visible).map((row, index) => (
          <tr key={index} className="h-5">
            <td className="w-12 border-r bg-muted/20 px-1.5 text-right align-top text-[11px] leading-5 text-muted-foreground/70 select-none">
              {row.left?.number ?? ""}
            </td>
            <td
              className={cn(
                "border-l-2 px-2 align-top leading-5 whitespace-pre-wrap [overflow-wrap:anywhere]",
                rowTone(row.kind, "left"),
                row.kind === "add" && "bg-muted/20"
              )}
            >
              {row.left?.text ?? ""}
            </td>
            <td className="w-12 border-r border-l bg-muted/20 px-1.5 text-right align-top text-[11px] leading-5 text-muted-foreground/70 select-none">
              {row.right?.number ?? ""}
            </td>
            <td
              className={cn(
                "border-l-2 px-2 align-top leading-5 whitespace-pre-wrap [overflow-wrap:anywhere]",
                rowTone(row.kind, "right"),
                row.kind === "remove" && "bg-muted/20"
              )}
            >
              {row.right?.text ?? ""}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function InlineDiff({ rows, visible }: { rows: DiffRow[]; visible: number }) {
  const lines = React.useMemo(() => {
    const expanded: { row: DiffRow; side: Side | "both" }[] = []
    for (const row of rows) {
      if (row.kind === "modify") {
        expanded.push({ row, side: "left" })
        expanded.push({ row, side: "right" })
      } else {
        expanded.push({ row, side: "both" })
      }
    }
    return expanded
  }, [rows])

  return (
    <table className="w-full table-fixed border-collapse font-mono text-[12px]">
      <tbody>
        {lines.slice(0, visible).map(({ row, side }, index) => {
          const kind = side === "both" ? row.kind : side === "left" ? "remove" : "add"
          // Modified pairs expand into a "−" (old) row and a "+" (new) row;
          // each expanded line belongs to only one document.
          const showOld = side !== "right"
          const showNew = side !== "left"
          const text = side === "right" ? row.right?.text : row.left?.text
          return (
            <tr key={index} className="h-5">
              <td className="w-12 border-r bg-muted/20 px-1.5 text-right align-top text-[11px] leading-5 text-muted-foreground/70 select-none">
                {showOld ? (row.left?.number ?? "") : ""}
              </td>
              <td className="w-12 border-r bg-muted/20 px-1.5 text-right align-top text-[11px] leading-5 text-muted-foreground/70 select-none">
                {showNew ? (row.right?.number ?? "") : ""}
              </td>
              <td
                className={cn(
                  "w-4 border-l-2 text-center align-top leading-5 select-none",
                  kind === "add"
                    ? "border-l-success/60 bg-success/10 text-success"
                    : kind === "remove"
                      ? "border-l-destructive/60 bg-destructive/10 text-destructive"
                      : "border-l-transparent"
                )}
              >
                {kind === "add" ? "+" : kind === "remove" ? "−" : ""}
              </td>
              <td
                className={cn(
                  "px-2 align-top leading-5 whitespace-pre-wrap [overflow-wrap:anywhere]",
                  kind === "add"
                    ? "bg-success/10"
                    : kind === "remove"
                      ? "bg-destructive/10"
                      : ""
                )}
              >
                {text ?? ""}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
