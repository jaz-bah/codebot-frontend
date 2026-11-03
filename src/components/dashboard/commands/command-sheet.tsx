"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { SectionCard } from "@/components/shared/Section";
import { Button } from "@/components/ui/button";
import type { CommandCategory } from "@/constants/commands";

/* ================================================================== */

/**
 * Static view of one command category: each section rendered as a card
 * of one-line copyable commands. Data is static (src/data/commands/*) —
 * no fetching, no filtering.
 */
export function CommandSheet({ category }: { category: CommandCategory }) {
  return (
    <div className="min-w-0 space-y-4">
      <div className="space-y-1">
        <h2 className="font-heading text-lg font-semibold">{category.title}</h2>
        <p className="text-sm text-muted-foreground">
          {category.description}
        </p>
      </div>

      {/* Masonry-style column flow: sections have wildly different
       * command counts, so a plain grid would stretch rows and leave
       * large blank areas under the shorter cards. */}
      <div className="columns-1 gap-4 md:columns-2 xl:columns-3">
        {category.groups.map((group) => (
          <div key={group.title} className="mb-4 break-inside-avoid">
            <SectionCard
              size="sm"
              className="pb-1"
              title={group.title}
              description={`${group.commands.length} commands`}
            >
              <ul className="-mx-3 -mb-2">
                {group.commands.map((command, index) => (
                  <CommandRow
                    key={`${command.cmd}-${index}`}
                    cmd={command.cmd}
                    desc={command.desc}
                  />
                ))}
              </ul>
            </SectionCard>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Row                                                                 */
/* ------------------------------------------------------------------ */

function CommandRow({ cmd, desc }: { cmd: string; desc: string }) {
  const [copied, setCopied] = React.useState(false);
  const timerRef = React.useRef<number | null>(null);

  React.useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    []
  );

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* Clipboard unavailable (permissions / insecure origin). */
    }
  };

  return (
    <li className="group/row flex items-start gap-2 border-b px-3 py-1.5 last:border-b-0">
      <div className="min-w-0 flex-1">
        <code className="text-foreground block font-mono text-xs break-all">
          {cmd}
        </code>
        <span className="text-muted-foreground block font-mono text-[11px] break-all">
          {desc}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        className="opacity-0 transition-opacity group-hover/row:opacity-100 group-focus-within/row:opacity-100"
        aria-label={copied ? "Command copied" : `Copy command: ${cmd}`}
        onClick={copyCommand}
      >
        {copied ? (
          <Check className="text-success" />
        ) : (
          <Copy />
        )}
      </Button>
    </li>
  );
}
