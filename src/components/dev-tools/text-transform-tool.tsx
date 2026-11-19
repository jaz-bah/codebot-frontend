"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  TRANSFORMS,
  TRANSFORM_GROUPS,
  applyTransform,
  countText,
  type TextStats,
  type TransformId,
} from "@/utils/text-transform"
import { cn } from "cn"

const NUMBER = new Intl.NumberFormat("en-US")

/** Both panes share one height so the converters line up on desktop. */
const PANE_HEIGHT = "h-[clamp(360px,calc(100svh-16rem),760px)]"

/**
 * /dev-tools/text-transform — a two-pane converter.
 *
 * The selected format is applied live while typing. Work is fed through
 * `useDeferredValue`, so pasting something large never blocks the input
 * keystrokes: React renders the textarea first and the conversion right after.
 */
export function TextTransformTool() {
  const [input, setInput] = React.useState("")
  const [transform, setTransform] = React.useState<TransformId | null>(null)
  const [copied, setCopied] = React.useState(false)

  const deferredInput = React.useDeferredValue(input)
  const output = React.useMemo(
    () => applyTransform(deferredInput, transform),
    [deferredInput, transform]
  )
  const inputStats = React.useMemo(() => countText(input), [input])
  const outputStats = React.useMemo(() => countText(output), [output])
  const isBusy = deferredInput !== input

  const activeFormat =
    TRANSFORMS.find((item) => item.id === transform)?.label ?? "Original text"

  const outputRef = React.useRef<HTMLTextAreaElement>(null)
  const copyTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current)
    },
    []
  )

  const handleCopy = async () => {
    if (!output) return
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable")
      await navigator.clipboard.writeText(output)
    } catch {
      // Insecure context / denied permission: fall back to selecting the
      // read-only output so the browser's own copy command still works.
      const node = outputRef.current
      if (node) {
        node.focus()
        node.select()
        document.execCommand("copy")
      }
    }
    setCopied(true)
    if (copyTimer.current) clearTimeout(copyTimer.current)
    copyTimer.current = setTimeout(() => setCopied(false), 1600)
  }

  const handleClear = () => {
    setInput("")
    setCopied(false)
  }

  const handleUseAsInput = () => {
    if (!output) return
    setInput(output)
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {/* Format toolbar */}
      <Card size="sm" className="gap-0 py-0">
        <div className="flex items-start gap-3 p-3">
          <div
            role="group"
            aria-label="Text formats"
            className="min-w-0 flex-1 space-y-2"
          >
            {TRANSFORM_GROUPS.map((group) => (
              <div key={group.id} className="flex flex-wrap items-center gap-2">
                <span className="w-[72px] shrink-0 font-mono text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                  {group.label}
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {TRANSFORMS.filter((item) => item.group === group.id).map(
                    (item) => {
                      const active = transform === item.id
                      return (
                        <button
                          key={item.id}
                          type="button"
                          aria-pressed={active}
                          title={item.example}
                          onClick={() => setTransform(active ? null : item.id)}
                          className={cn(
                            "cursor-pointer rounded-md border px-2.5 py-1 text-[11px] leading-5 font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-muted/40 text-foreground/80 hover:bg-muted hover:text-foreground"
                          )}
                        >
                          {item.label}
                        </button>
                      )
                    }
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="xs"
            className="shrink-0"
            onClick={handleClear}
            disabled={!input && !output}
          >
            Clear
          </Button>
        </div>
      </Card>

      {/* Panes */}
      <div className="grid gap-3 lg:grid-cols-2">
        {/* Input */}
        <Card
          size="sm"
          className={cn(
            "flex min-w-0 flex-col gap-0 overflow-hidden py-0 transition-shadow focus-within:ring-2 focus-within:ring-ring/40",
            PANE_HEIGHT
          )}
        >
          <div className="flex h-9 shrink-0 items-center gap-2 border-b px-3">
            <span className="text-[10px] font-semibold tracking-[0.12em] uppercase">
              Input
            </span>
            <span className="ml-auto text-[11px] text-muted-foreground tabular-nums">
              <StatsLine stats={inputStats} />
            </span>
          </div>
          <Textarea
            value={input}
            spellCheck={false}
            aria-label="Input"
            placeholder="Type or paste text here…"
            onChange={(event) => setInput(event.target.value)}
            className="thin-scrollbar min-h-0 flex-1 resize-none rounded-none border-0 bg-transparent px-3 py-2.5 font-mono text-[12px] leading-relaxed shadow-none focus-visible:border-0 focus-visible:ring-0 md:text-[12px] dark:bg-transparent"
          />
        </Card>

        {/* Output */}
        <Card
          size="sm"
          className={cn(
            "flex min-w-0 flex-col gap-0 overflow-hidden py-0 transition-shadow focus-within:ring-2 focus-within:ring-ring/40",
            PANE_HEIGHT
          )}
        >
          <div className="flex h-9 shrink-0 items-center gap-2 border-b px-3">
            <span className="text-[10px] font-semibold tracking-[0.12em] uppercase">
              Output
            </span>
            <span className="truncate text-[11px] text-muted-foreground">
              {isBusy ? "updating…" : activeFormat}
            </span>
            <div className="ml-auto flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="xs"
                onClick={handleUseAsInput}
                disabled={!output}
              >
                Use as input
              </Button>
              <Button
                variant="secondary"
                size="xs"
                className="min-w-14 gap-1"
                onClick={handleCopy}
                disabled={!output}
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
          </div>
          <Textarea
            ref={outputRef}
            value={output}
            readOnly
            spellCheck={false}
            aria-label="Output"
            placeholder={
              transform
                ? "Your result appears here as you type…"
                : "Pick a format above to begin."
            }
            className="thin-scrollbar min-h-0 flex-1 resize-none rounded-none border-0 bg-transparent px-3 py-2.5 font-mono text-[12px] leading-relaxed shadow-none focus-visible:border-0 focus-visible:ring-0 md:text-[12px] dark:bg-transparent"
          />
          <div className="flex h-8 shrink-0 items-center border-t px-3 text-[11px] text-muted-foreground tabular-nums">
            {output ? <StatsLine stats={outputStats} /> : "Nothing to show yet"}
          </div>
        </Card>
      </div>

      <p aria-live="polite" className="sr-only">
        {copied ? "Output copied to clipboard" : ""}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function StatsLine({ stats }: { stats: TextStats }) {
  return (
    <>
      {NUMBER.format(stats.characters)} chars
      <span aria-hidden> · </span>
      {NUMBER.format(stats.words)} words
      <span aria-hidden> · </span>
      {NUMBER.format(stats.lines)} lines
    </>
  )
}
