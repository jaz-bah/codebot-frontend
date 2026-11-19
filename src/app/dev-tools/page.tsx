import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CaseUpper, GitCompareArrows, Sparkles } from "lucide-react";

import { Section, SectionCard } from "@/components/shared/Section";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Dev Tools",
  description: "Browser-only utilities for everyday development chores.",
};

// The dashboard shell renders its children only after the client session
// check, so the validation pass never sees this segment. Same opt-out the
// /dashboard pages use.
export const instant = false;

/** Catalogue of /dev-tools pages. Add a card when a tool ships. */
const TOOLS = [
  {
    href: ROUTES.devTools.textTransform,
    title: "Text Transform",
    description:
      "Convert text between uppercase, lowercase, camelCase, snake_case and more. Clean up spacing, drop duplicate lines, reverse text, and count characters, words and lines — all in real time.",
    icon: CaseUpper,
  },
  {
    href: ROUTES.devTools.textCompare,
    title: "Text Compare",
    description:
      "Compare two blocks of text and highlight every addition, removal and modification. Switch between side-by-side and inline views, ignore whitespace or case, and get instant difference statistics.",
    icon: GitCompareArrows,
  },
] as const;

export default function DevToolsPage() {
  return (
    <Section
      title="Dev Tools"
      description="Small utilities that run entirely in your browser — nothing is uploaded."
      columns={3}
    >
      {TOOLS.map((tool) => (
        <SectionCard
          key={tool.href}
          lead={
            <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <tool.icon className="size-4" />
            </span>
          }
          title={tool.title}
          description={tool.description}
          className="h-full"
          contentClassName="flex-1"
          footer={
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5"
              render={<Link href={tool.href} />}
            >
              Open tool
              <ArrowRight className="size-3.5" />
            </Button>
          }
        />
      ))}

      <SectionCard
        lead={
          <span className="grid size-8 place-items-center rounded-lg bg-muted text-muted-foreground">
            <Sparkles className="size-4" />
          </span>
        }
        title="More on the way"
        description="New converters and formatters land here. Each one stays client-side and instant."
        className="h-full border border-dashed border-border"
        footer={
          <p className="text-xs text-muted-foreground">
            Have an idea? Add it to the list.
          </p>
        }
      />
    </Section>
  );
}
