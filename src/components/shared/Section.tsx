"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "cn";

/* ------------------------------------------------------------------ */
/* Grid column presets                                                 */
/* ------------------------------------------------------------------ */

/** Responsive column classes for the card grid, keyed by max columns. */
const GRID_COLUMNS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
  6: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
};

/* ------------------------------------------------------------------ */
/* Pagination                                                          */
/* ------------------------------------------------------------------ */

/** Builds a page list: `1 … 4 5 6 … 20`. Always includes the first,
 * last, and the pages around the current one. */
function buildPageList(page: number, pageCount: number): (number | "…")[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  const around = [page - 1, page, page + 1].filter(
    (p) => p > 1 && p < pageCount
  );
  const list: (number | "…")[] = [1];
  if ((around[0] ?? 0) > 2) list.push("…");
  list.push(...around);
  if ((around.at(-1) ?? pageCount) < pageCount - 1) list.push("…");
  list.push(pageCount);
  return list;
}

export type SectionPaginationProps = {
  /** Current page (1-based). */
  page: number;
  /** Total number of pages. Nothing renders when `<= 1`. */
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
};

/** Minimal pager: prev / numbered pages with ellipses / next. */
export function SectionPagination({
  page,
  pageCount,
  onPageChange,
  className,
}: SectionPaginationProps) {
  if (pageCount <= 1) return null;

  const prev = () => onPageChange(Math.max(1, page - 1));
  const next = () => onPageChange(Math.min(pageCount, page + 1));

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1.5", className)}
    >
      <Button
        variant="outline"
        size="icon-sm"
        disabled={page === 1}
        onClick={prev}
        aria-label="Previous page"
      >
        <ChevronLeft />
      </Button>
      {buildPageList(page, pageCount).map((entry, i) =>
        entry === "…" ? (
          <span
            key={`ellipsis-${i}`}
            className="grid size-7 place-items-center text-muted-foreground"
          >
            <MoreHorizontal className="size-4" />
          </span>
        ) : (
          <Button
            key={entry}
            variant={entry === page ? "default" : "outline"}
            size="icon-sm"
            aria-current={entry === page ? "page" : undefined}
            onClick={() => onPageChange(entry)}
          >
            {entry}
          </Button>
        )
      )}
      <Button
        variant="outline"
        size="icon-sm"
        disabled={page === pageCount}
        onClick={next}
        aria-label="Next page"
      >
        <ChevronRight />
      </Button>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

export type SectionCardProps = {
  /** Card heading. */
  title?: React.ReactNode;
  /** Muted sub-line under the title. */
  description?: React.ReactNode;
  /** Small element in the top-right of the card (badge, menu…). */
  action?: React.ReactNode;
  /** Leading visual next to the title (icon, avatar, logo…). */
  lead?: React.ReactNode;
  /** Main body content. */
  children?: React.ReactNode;
  /** Bottom row (buttons, meta…). */
  footer?: React.ReactNode;
  /** Richer control than the `lead` shorthand. */
  header?: React.ReactNode;
  size?: "default" | "sm";
  className?: string;
};

/** Convenience card matching the shared `ui/card` look. Use it as the
 * `renderItem` output of Section, or anywhere else. */
export function SectionCard({
  title,
  description,
  action,
  lead,
  header,
  children,
  footer,
  size = "default",
  className,
}: SectionCardProps) {
  return (
    <Card size={size} className={className}>
      {header ?? null}
      {!header && (title ?? description ?? action ?? lead) && (
        <CardHeader>
          {lead}
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
          {action && <CardAction>{action}</CardAction>}
        </CardHeader>
      )}
      {children && <CardContent>{children}</CardContent>}
      {footer && <CardFooter className="mt-auto">{footer}</CardFooter>}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export type PageChangeDetails = { page: number };

export type SectionProps<T> = {
  /* Header */
  /** Section heading. */
  title?: React.ReactNode;
  /** Optional sub-line under the title. */
  description?: React.ReactNode;
  /** Top-right header slot — typically a button. */
  action?: React.ReactNode;
  /** Extra content between header and grid (filters, toolbar…). */
  headerExtra?: React.ReactNode;

  /* Data-driven mode: pass raw data + a card renderer. */
  items?: T[];
  /** Renders one grid cell per item. Pair with `items`. */
  renderItem?: (item: T, index: number, section: SectionRenderHelpers) => React.ReactNode;
  /** Stable React key for an item. Defaults to the index. */
  keyOf?: (item: T, index: number) => string;

  /* Composition mode: render anything directly. */
  children?: React.ReactNode;

  /* Grid */
  /** Max columns on xl screens; collapses gracefully on smaller ones. */
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  gridClassName?: string;
  /** Content when there is nothing to show. */
  emptyState?: React.ReactNode;

  /* Pagination */
  /** Items per page. Enables pagination in data mode and (with `totalItems`) composition mode. */
  pageSize?: number;
  /** Total item count for pagination when using `children` composition. */
  totalItems?: number;
  /** Hard override for the number of pages. */
  pageCount?: number;
  /** Controlled current page (1-based). Uncontrolled state is used otherwise. */
  page?: number;
  /** Called on page change in both modes. */
  onPageChange?: (page: number) => void;
};

export type SectionRenderHelpers = {
  /** 1-based page an item falls on (data mode only). */
  page: number;
};

/**
 * Flexible section wrapper:
 *
 * Data-driven (cards + pagination):
 * ```tsx
 * <Section title="My list" action={<Button>+ Add</Button>}
 *   items={data} renderItem={(item) => <SectionCard title={item.name} />}
 *   pageSize={9} columns={3} />
 * ```
 *
 * Composed (any children, pagination still available):
 * ```tsx
 * <Section title="My list" totalItems={120} pageSize={9}
 *   onPageChange={setPage}>
 *   {cards.map((c) => <MyCard key={c.id} {...c} />)}
 * </Section>
 * ```
 */
export function Section<T>({
  /* Header */
  title,
  description,
  action,
  headerExtra,

  /* Data */
  items,
  renderItem,
  keyOf,

  /* Composition */
  children,

  /* Grid */
  columns = 3,
  className,
  gridClassName,
  emptyState,

  /* Pagination */
  pageSize,
  totalItems,
  pageCount: pageCountProp,
  page: pageProp,
  onPageChange: onPageChangeProp,
}: SectionProps<T>) {
  const [internalPage, setInternalPage] = React.useState(1);

  const isDataMode = items !== undefined && renderItem !== undefined;
  const childrenArray = React.Children.toArray(children);

  /* Total item count & page count ---------------------------------- */
  const totalCount =
    isDataMode ? items!.length : (totalItems ?? childrenArray.length);
  const pageCount =
    pageCountProp ?? (pageSize ? Math.ceil(totalCount / pageSize) : 1);

  const isControlled = pageProp !== undefined;
  const requestedPage = isControlled ? pageProp : internalPage;
  // Derived clamp instead of a state fixup effect: renders stay correct
  // even when the data set shrinks below the current page.
  const page = Math.min(Math.max(requestedPage, 1), Math.max(pageCount, 1));
  const onPageChange = React.useCallback(
    (next: number) => {
      if (!isControlled) setInternalPage(next);
      onPageChangeProp?.(next);
    },
    [isControlled, onPageChangeProp]
  );

  /* Keep the page in range when data shrinks ----------------------- */
  /* (handled by the derived `page` clamp above) */

  /* Cells ---------------------------------------------------------- */
  const hasPagination = Boolean(pageSize) && pageCount > 1;
  let cells: React.ReactNode[];

  if (isDataMode) {
    const offset = hasPagination ? (page - 1) * pageSize! : 0;
    const visible = hasPagination
      ? items!.slice(offset, offset + pageSize!)
      : items!;
    cells = visible.map((item, index) => (
      <React.Fragment key={keyOf ? keyOf(item, index + offset) : index}>
        {renderItem!(item, index + offset, {
          page: hasPagination ? page : 1,
        })}
      </React.Fragment>
    ));
  } else {
    cells = childrenArray;
  }

  const showHeader = Boolean(title ?? description ?? action);

  return (
    <section className={cn("flex flex-col gap-4", className)}>
      {showHeader && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            {title && <h2 className="font-heading text-xl font-semibold tracking-tight">{title}</h2>}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {headerExtra}
      {cells.length > 0 ? (
        <div
          className={cn(
            "grid gap-4",
            GRID_COLUMNS[columns],
            gridClassName
          )}
        >
          {cells}
        </div>
      ) : (
        (emptyState ?? (
          <p className="text-sm text-muted-foreground">Nothing here yet.</p>
        ))
      )}
      {hasPagination && (
        <SectionPagination
          page={page}
          pageCount={pageCount}
          onPageChange={onPageChange}
        />
      )}
    </section>
  );
}

export default Section;
