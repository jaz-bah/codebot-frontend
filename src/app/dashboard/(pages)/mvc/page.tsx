import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Layers,
  Puzzle,
  Route,
  Shuffle,
  Smartphone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Section, SectionCard } from "@/components/shared/Section";
import { ROUTES } from "@/constants/routes";
import { MVC_FRAMEWORKS, countMvcNodes } from "@/constants/mvc";
import type { MvcFramework } from "@/constants/mvc";
import type { MvcRole } from "@/types/global.type";

/* Framework icons — plain SVG components, safe to render on the server. */
const FRAMEWORK_ICONS: Record<string, LucideIcon> = {
  nextjs: Layers,
  remixjs: Shuffle,
  nestjs: Boxes,
  expressjs: Route,
  wxt: Puzzle,
  reactNative: Smartphone,
};

/** Gallery legend chips — same colors as the sheet badges. */
const ROLE_CHIPS: Array<{ role: MvcRole; label: string; className: string }> = [
  { role: "model", label: "MODEL", className: "text-success bg-success/10" },
  { role: "view", label: "VIEW", className: "text-sky-600 dark:text-sky-400 bg-sky-500/10" },
  { role: "controller", label: "CONTROLLER", className: "text-warning bg-warning/10" },
  { role: "service", label: "SERVICE", className: "text-violet-600 dark:text-violet-400 bg-violet-500/10" },
  { role: "shared", label: "SHARED", className: "text-muted-foreground bg-muted" },
];

/**
 * MVC landing page: per-framework blueprints of how the folder tree
 * maps to Model / View / Controller. Static data (src/data/mvc/*,
 * Next.js spec from Brain/MVC.md) — composition mode only, since
 * function props can't cross the server/client boundary into Section.
 */
export default function MvcPage() {
  const frameworks = Object.values(MVC_FRAMEWORKS);

  return (
    <Section
      title="MVC"
      description="Blueprints of how each framework's folder tree maps to MVC — Model, View, Controller and the glue between them."
      columns={3}
    >
      {frameworks.map((framework) => (
        <FrameworkCard key={framework.slug} framework={framework} />
      ))}
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

function FrameworkCard({ framework }: { framework: MvcFramework }) {
  const Icon = FRAMEWORK_ICONS[framework.slug] ?? Layers;

  return (
    <Link
      href={`${ROUTES.dashboard.mvc.root}/${framework.slug}`}
      aria-label={`Open the ${framework.title} MVC blueprint`}
      className="group rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <SectionCard
        size="sm"
        className="h-full transition-[box-shadow,ring-color] group-hover:ring-foreground/20"
        footer={
          <div className="flex w-full items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
              <span className="rounded-md bg-muted px-1.5 py-0.5">
                {countMvcNodes(framework.tree)} paths
              </span>
              {ROLE_CHIPS.map((chip) => (
                <span
                  key={chip.role}
                  className={`hidden rounded-md px-1.5 py-0.5 font-mono text-[10px] first:inline md:inline ${
                    chip.className
                  }`}
                >
                  {chip.label}
                </span>
              ))}
            </div>
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:translate-x-0.5 group-hover:bg-primary group-hover:text-primary-foreground"
              aria-hidden
            >
              <ArrowRight className="size-3.5" />
            </span>
          </div>
        }
      >
        <div className="flex items-start gap-3">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted"
            aria-hidden
          >
            <Icon className="size-4.5 text-foreground" />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="font-medium">{framework.title}</p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {framework.description}
            </p>
          </div>
        </div>
      </SectionCard>
    </Link>
  );
}
