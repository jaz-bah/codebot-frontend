"use client";

import * as React from "react";

import type { MvcFramework } from "@/constants/mvc";
import type { IMvcNode, MvcRole } from "@/types/global.type";

/* ================================================================== */

/** Note text color per MVC layer (legible in light + dark). */
const ROLE_NOTE_CLASSES: Record<MvcRole, string> = {
  model: "text-success",
  view: "text-sky-600 dark:text-sky-400",
  controller: "text-warning",
  service: "text-violet-600 dark:text-violet-400",
  shared: "text-muted-foreground",
};

/**
 * Static view of one framework's MVC blueprint, rendered as a
 * Brain/MVC.md-style ASCII tree: box-drawing guides, inline `#`
 * comments aligned to one column, notes colored by MVC role.
 */
export function MvcSheet({ framework }: { framework: MvcFramework }) {
  return (
    <div className="min-w-0 space-y-4">
      <div className="space-y-1">
        <h2 className="font-heading text-lg font-semibold">
          {framework.title}
        </h2>
        <p className="text-sm text-muted-foreground">
          {framework.description}
        </p>
      </div>

      <TreePanel tree={framework.tree} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tree panel                                                          */
/* ------------------------------------------------------------------ */

type TreeRow = {
  key: string;
  /** Guides + connector (`│   ├── ` runs), or "" for the root. */
  prefix: string;
  name: string;
  note?: string;
  role?: MvcRole;
  hasChildren: boolean;
};

function TreePanel({ tree }: { tree: IMvcNode }) {
  const rows = React.useMemo(() => collectRows(tree), [tree]);

  /* All `#` comments share one column, like the MVC.md reference. */
  const commentColumn = React.useMemo(
    () =>
      rows.reduce(
        (max, row) =>
          row.note !== undefined
            ? Math.max(max, row.prefix.length + row.name.length)
            : max,
        0
      ) + 2,
    [rows]
  );

  return (
    <div className="overflow-x-auto rounded-xl border bg-muted/30 dark:bg-muted/10">
      <div
        className="px-4 py-3 font-mono text-xs leading-5 md:text-[13px] md:leading-6"
      >
        <div role="tree" aria-label={`${tree.name} folder structure`}>
          {rows.map((row) => {
            const pad =
              row.note !== undefined
                ? " ".repeat(
                    Math.max(
                      2,
                      commentColumn - row.prefix.length - row.name.length
                    )
                  )
                : null;

            return (
              <div
                key={row.key}
                className="rounded-md whitespace-pre hover:bg-accent/50"
              >
                <span className="text-muted-foreground/60">{row.prefix}</span>
                <span
                  className={
                    row.hasChildren
                      ? "font-semibold text-foreground"
                      : "text-foreground"
                  }
                >
                  {row.name}
                </span>
                {row.note !== undefined ? (
                  <span
                    className={
                      row.role
                        ? ROLE_NOTE_CLASSES[row.role]
                        : "text-muted-foreground"
                    }
                  >
                    {pad}
                    {row.note}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Flattening — MVC.md rendering rules                                 */
/* ------------------------------------------------------------------ */

/**
 * Flatten the tree into rows, computing each row's prefix from its
 * position among siblings: non-last siblings use `├── `, the last uses
 * `└── `, and a child's guide rail below a non-last sibling continues
 * the vertical bar (`│   `), stopping (`    `) under a last sibling.
 * Works on the (possibly pruned) tree, so connectors stay correct.
 */
function collectRows(root: IMvcNode): TreeRow[] {
  const rows: TreeRow[] = [];

  const walk = (
    node: IMvcNode,
    /** Guide rail inherited from ancestors. */
    base: string,
    isRoot: boolean,
    isLast: boolean,
    keyPath: string
  ) => {
    rows.push({
      key: keyPath,
      prefix: isRoot ? "" : `${base}${isLast ? "└── " : "├── "}`,
      name: node.name,
      note: node.note,
      role: node.role,
      hasChildren: (node.children?.length ?? 0) > 0,
    });

    const children = node.children ?? [];
    const childBase = isRoot ? "" : `${base}${isLast ? "    " : "│   "}`;
    children.forEach((child, index) => {
      walk(child, childBase, false, index === children.length - 1, `${keyPath}.${index}`);
    });
  };

  walk(root, "", true, true, "n0");
  return rows;
}
