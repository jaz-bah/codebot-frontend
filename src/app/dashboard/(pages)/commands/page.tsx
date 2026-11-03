import Link from "next/link";
import { ArrowRight, Cloud, GitBranch, Hexagon, Layers, Server, ShoppingBag, Terminal } from "lucide-react";

import { Section, SectionCard } from "@/components/shared/Section";
import { ROUTES } from "@/constants/routes";
import { COMMAND_CATEGORIES, countCategoryCommands } from "@/constants/commands";
import type { CommandCategory } from "@/constants/commands";
import type { LucideIcon } from "lucide-react";

/* Category icons — plain SVG components, safe to render on the server. */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  github: GitBranch,
  linux: Terminal,
  vps: Cloud,
  server: Server,
  nextjs: Layers,
  shopify: ShoppingBag,
  nodejs: Hexagon,
};

/**
 * Commands landing page: static gallery of the cheat-sheet categories
 * (src/data/commands/*). No API data — composition mode only, since
 * function props can't cross the server/client boundary into Section.
 */
export default function CommandsPage() {
  const categories = Object.values(COMMAND_CATEGORIES);
  const sections = categories.length;
  const commands = categories.reduce(
    (sum, category) => sum + (countCategoryCommands(category) ?? 0),
    0
  );

  return (
    <Section
      title="Commands"
      description={`Ready-to-copy CLI cheat sheets — ${sections} categories, ${commands} commands. Open one and grab what you need.`}
      columns={3}
    >
      {categories.map((category) => (
        <CategoryCard key={category.slug} category={category} />
      ))}
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

function CategoryCard({ category }: { category: CommandCategory }) {
  const Icon = CATEGORY_ICONS[category.slug] ?? Terminal;

  return (
    <Link
      href={`${ROUTES.dashboard.commands.root}/${category.slug}`}
      aria-label={`Open the ${category.title} cheat sheet`}
      className="group rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <SectionCard
        size="sm"
        className="h-full transition-[box-shadow,ring-color] group-hover:ring-foreground/20"
        footer={
          <div className="flex w-full items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <span className="rounded-md bg-muted px-1.5 py-0.5">
                {category.groups.length} sections
              </span>
              <span className="rounded-md bg-muted px-1.5 py-0.5">
                {countCategoryCommands(category)} commands
              </span>
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
            <p className="font-medium">{category.title}</p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {category.description}
            </p>
          </div>
        </div>
      </SectionCard>
    </Link>
  );
}
