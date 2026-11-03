"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, SearchX, TriangleAlert } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useSearch } from "@/hooks/use-search";
import { ROUTES } from "@/constants/routes";
import type { SearchHit, SearchHitType } from "@/types/search.type";

/* ------------------------------------------------------------------ */
/* Hit routing                                                         */
/* ------------------------------------------------------------------ */

/** Where each hit type navigates. Some domains have no dedicated page
 * (documents) — such rows render without a destination. */
const HIT_ROUTES: Partial<Record<SearchHitType, (id: string) => string>> = {
  todo: () => ROUTES.dashboard.todo,
  note: () => ROUTES.dashboard.note, // hit id = workspace fileId for the note
  file: () => ROUTES.dashboard.files,
  component: (id) => `${ROUTES.dashboard.components}/${id}`,
  preset: () => ROUTES.dashboard.presets,
  expert: () => ROUTES.dashboard.experts,
  tool: () => ROUTES.dashboard.tools,
  snippet: () => ROUTES.dashboard.ideSnippet,
};

const TYPE_LABELS: Record<SearchHitType, string> = {
  todo: "Todo",
  note: "Note",
  file: "File",
  document: "Document",
  component: "Component",
  preset: "Preset",
  expert: "Expert",
  tool: "Tool",
  snippet: "Snippet",
};

/** Debounce window — search is live per keystroke after this pause. */
const SEARCH_DEBOUNCE_MS = 250;

/* ================================================================== */

/**
 * Workspace-wide search portal for the dashboard header, backed by
 * `GET /search` (Brain/api-guide/search-api-guide.md): one input that
 * searches every domain at once, with `@scope` tokens (e.g.
 * `@presets payout`, `@files @notes contract`) passed verbatim.
 */
export function GlobalSearch() {
  const router = useRouter();
  const [term, setTerm] = React.useState("");
  const [debouncedTerm, setDebouncedTerm] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [highlight, setHighlight] = React.useState(-1);
  const rootRef = React.useRef<HTMLDivElement>(null);

  /* Debounce the raw input into the actual query term. */
  React.useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedTerm(term.trim()),
      SEARCH_DEBOUNCE_MS
    );
    return () => window.clearTimeout(timer);
  }, [term]);

  /* Clicks outside the portal close the results. */
  React.useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        rootRef.current &&
        !rootRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const trimmed = debouncedTerm.trim();
  const query = useSearch({ q: trimmed });
  const hits = query.data?.results ?? [];
  const isPanelOpen = open && trimmed.length > 0;

  const go = (hit: SearchHit) => {
    const buildRoute = HIT_ROUTES[hit.type];
    setOpen(false);
    // Search input keeps the term — refocusing re-runs the live query.
    if (!buildRoute) return;
    router.push(buildRoute(hit.id));
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!isPanelOpen) return;
    if (event.key === "Escape") {
      setOpen(false);
      (event.target as HTMLInputElement).blur();
      return;
    }
    if (query.isError || hits.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlight((prev) => Math.min(prev + 1, hits.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((prev) => Math.max(prev - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const picked =
        highlight >= 0 && highlight < hits.length ? hits[highlight] : hits[0];
      if (picked) go(picked);
    }
  };

  return (
    <div className="flex min-w-0 flex-1 justify-center px-2">
      <div ref={rootRef} className="relative w-full max-w-sm min-w-0">
        <Input
          type="search"
          value={term}
          placeholder="Search all… (@presets, @todos, @files…)"
          aria-label="Search the workspace"
          aria-expanded={isPanelOpen}
          className="pr-8 bg-accent dark:bg-input/30"
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setTerm(event.target.value);
            setHighlight(-1);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />
        <Search className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground" />

        {isPanelOpen && (
          <div
            className="absolute top-full left-1/2 z-30 mt-2 w-[min(24rem,calc(100vw-3rem))] -translate-x-1/2 overflow-hidden rounded-xl border bg-background shadow-lg dark:bg-card"
            role="listbox"
            aria-label="Search results"
          >
            {query.isPending ? (
              <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Searching…
              </div>
            ) : query.isError ? (
              /* Verbatim error (400 scope/query problems surface as-is). */
              <div className="flex items-start gap-2 px-3 py-4 text-sm text-destructive">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                <span className="min-w-0 break-words">
                  {query.error instanceof Error
                    ? query.error.message
                    : "The search failed — try again."}
                </span>
              </div>
            ) : hits.length === 0 ? (
              <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
                <SearchX className="size-4 shrink-0" />
                No matches for &quot;{trimmed}&quot;.
              </div>
            ) : (
              <>
                <ul className="max-h-80 overflow-y-auto p-1">
                  {hits.map((hit, index) => (
                    <li key={`${hit.type}-${hit.id}`}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={index === highlight}
                        onClick={() => go(hit)}
                        onMouseEnter={() => setHighlight(index)}
                        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors ${
                          index === highlight ? "bg-accent" : ""
                        } ${
                          HIT_ROUTES[hit.type] ? "cursor-pointer" : "cursor-default"
                        }`}
                      >
                        <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
                          {TYPE_LABELS[hit.type]}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-foreground">
                            {hit.title}
                          </span>
                          {hit.subtitle ? (
                            <span className="block truncate text-xs text-muted-foreground">
                              {hit.subtitle}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="border-t px-3 py-1.5 text-[11px] text-muted-foreground">
                  {query.data?.total} hits ·{" "}
                  {query.data?.scopes.includes("all")
                    ? "all domains"
                    : `scopes: ${query.data?.scopes.join(", ")}`}{" "}
                  · ↑↓ to move, Enter to open
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
