"use client";

import * as React from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  Bot,
  Braces,
  Check,
  Command,
  FolderTree,
  Globe,
  LayoutGrid,
  ListTodo,
  NotepadText,
  Sparkles,
  Wrench,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteNav } from "@/components/site/site-nav";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/* Feature data — real product surfaces, true claims only              */
/* ------------------------------------------------------------------ */

const FEATURES = [
  {
    icon: NotepadText,
    title: "Notes",
    description:
      "A rich-text notepad with tag previews and workspace files — captured and kept, not scattered.",
  },
  {
    icon: ListTodo,
    title: "Todos",
    description:
      "Priority badges, due dates and drag-to-order cards. Sortable, strikethrough-able, unlosable.",
  },
  {
    icon: FolderTree,
    title: "Files",
    description:
      "A workspace tree of folders and files with move, rename and live content — your second desktop.",
  },
  {
    icon: LayoutGrid,
    title: "Components",
    description:
      "Save a preview image plus its code files, edited in a real CodeMirror editor, stored verbatim.",
  },
  {
    icon: Braces,
    title: "Presets",
    description:
      "Promote proven snippets to language-tagged presets. One click to paste the same answer again.",
  },
  {
    icon: Globe,
    title: "Experts",
    description:
      "Your curated roster of expert references — quick entries so solutions are one click away.",
  },
  {
    icon: Wrench,
    title: "Tools",
    description:
      "A compact utility shelf of your daily dev helpers, rid of browser-bookmark archaeology.",
  },
  {
    icon: Command,
    title: "One search",
    description:
      "Search every domain at once from the topbar — or scope it with tokens like @presets, @todos.",
  },
] as const;

const HOW = [
  {
    step: "01",
    title: "Create your account",
    description:
      "Email and password, verify from your inbox, and the workspace opens. Nothing to configure.",
  },
  {
    step: "02",
    title: "Build in your sidebar",
    description:
      "Todos, notes, files, components and presets each have a page with a “+” action. Add, edit, delete — all yours, all stored server-side.",
  },
  {
    step: "03",
    title: "Search everything",
    descriptions: undefined,
    description:
      "The topbar searches across every domain: “contract”, “@notes inbox”, “@presets payout” — newest hits first.",
  },
] as const;

const STRIP_CHIPS = [
  "Todos",
  "Notes",
  "Files",
  "Components",
  "Presets",
  "Experts",
  "Tools",
  "Snippets",
] as const;

/* ================================================================== */

/**
 * Public landing page for `/`: nav banner, hero + product strip,
 * feature grid, how-to steps, CTA band and footer — animated with
 * GSAP (hero timeline + ScrollTrigger reveals, reduced-motion aware,
 * token-only styling per DESIGN.md).
 */
export function Landing() {
  const rootRef = React.useRef<HTMLDivElement>(null);
  /* The brand is dark-first: the landing renders dark unless the visitor
   * explicitly chose light in the dashboard (persisted in localStorage).
   * Applied on this subtree only — no global class changes. Read the
   * stored choice during render (guarded) so the first paint matches the
   * server output (dark) and no effect-based setState is needed. */
  const [dark, setDark] = React.useState(true);
  const [themeResolved, setThemeResolved] = React.useState(false);
  if (typeof window !== "undefined" && !themeResolved) {
    setThemeResolved(true);
    setDark(localStorage.getItem("theme") !== "light");
  }

  React.useEffect(() => {
    /* Motion is optional: honor the OS preference by leaving content at
     * its final state. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const context = gsap.context(() => {
      /* Hero: staggered rise. */
      gsap.from("[data-hero-item]", {
        y: 26,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.09,
      });

      /* Scroll-in sections, one shot each. */
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.from(element, {
          y: 30,
          opacity: 0,
          duration: 0.65,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 85%", once: true },
        });
      });

      /* Feature cards rise as a staggered batch. */
      gsap.from("[data-feature-card]", {
        y: 26,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.06,
        scrollTrigger: { trigger: "[data-feature-grid]", start: "top 80%", once: true },
      });

      /* The workspace strip gently floats in place. */
      gsap.to("[data-strip]", {
        y: -8,
        duration: 2.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    }, rootRef);

    return () => context.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className={
        dark
          ? "dark flex min-h-svh flex-col bg-background text-foreground"
          : "flex min-h-svh flex-col bg-background text-foreground"
      }
    >
      <SiteNav />

      <main className="flex-1">
        {/* ============================ HERO ============================ */}
        <section className="relative overflow-hidden">
          <div className="mx-auto w-full max-w-6xl px-4 pt-24 pb-20 text-center sm:pt-32">
            <span
              data-hero-item
              className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground"
            >
              <Sparkles className="size-3.5 text-primary" />
              One workspace · everything searchable
            </span>

            <h1
              data-hero-item
              className="font-heading mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl"
            >
              Keep every piece of your <span className="text-primary">coding life</span> in one
              dark, quiet place.
            </h1>

            <p
              data-hero-item
              className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground text-pretty sm:text-lg"
            >
              Codebot is the workspace for what you write and reuse: notes,
              todos, files, components, presets, experts, tools and snippets —
              all stored server-side and searchable in a single box.
            </p>

            <div data-hero-item className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={ROUTES.dashboard.root}
                className={cn(buttonVariants({ variant: "default", size: "lg" }), "gap-1.5")}
              >
                Open the dashboard
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={ROUTES.auth.signUp}
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Create a free account
              </Link>
            </div>

            {/* Product strip — the dashboard's own vocabulary, miniaturized. */}
            <WorkspaceStrip />
          </div>
        </section>

        {/* ========================== FEATURES =========================== */}
        <section id="features" className="scroll-mt-20 border-t py-16 sm:py-20">
          <div className="mx-auto w-full max-w-6xl px-4">
            <div data-reveal className="max-w-2xl">
              <p className="text-sm font-medium text-primary">Features</p>
              <h2 className="font-heading mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Eight rooms, one house.
              </h2>
              <p className="mt-3 text-muted-foreground">
                Every surface below is a live part of the dashboard — no
                coming-soon placeholders.
              </p>
            </div>

            <div
              data-feature-grid
              className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {FEATURES.map((feature) => (
                <FeatureCard key={feature.title} feature={feature} />
              ))}
            </div>
          </div>
        </section>

        {/* ========================= HOW TO USE ========================= */}
        <section id="how" className="scroll-mt-20 border-t bg-muted/30 py-16 sm:py-20">
          <div className="mx-auto w-full max-w-6xl px-4">
            <div data-reveal className="text-center">
              <p className="text-sm font-medium text-primary">How it works</p>
              <h2 className="font-heading mx-auto mt-2 max-w-xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                From sign-up to searched in three steps.
              </h2>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
              {HOW.map((item) => (
                <div
                  key={item.step}
                  data-reveal
                  className="relative rounded-xl border bg-card p-6 text-left shadow-xs"
                >
                  <p className="font-heading text-4xl font-semibold text-primary/30">
                    {item.step}
                  </p>
                  <p className="font-heading mt-3 text-lg font-semibold">{item.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================ CTA ============================= */}
        <section className="py-16 sm:py-20">
          <div data-reveal className="mx-auto w-full max-w-6xl px-4">
            <div className="rounded-2xl bg-primary p-8 text-center sm:p-12">
              <h2 className="font-heading mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-primary-foreground text-balance sm:text-4xl">
                Your work deserves better than twenty open tabs.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm text-primary-foreground/80 sm:text-base">
                Create an account and give your todos, notes, files, components
                and presets one home.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href={ROUTES.auth.signUp}
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                  )}
                >
                  Get started free
                </Link>
                <Link
                  href={ROUTES.auth.signIn}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "lg" }),
                    "text-primary-foreground hover:bg-primary-foreground/10"
                  )}
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

/* ================================================================== */
/* Workspace strip — miniaturized dashboard mock (aria-hidden)          */
/* ================================================================== */

function WorkspaceStrip() {
  return (
    <div data-strip aria-hidden className="mx-auto mt-14 max-w-3xl">
      <div className="rounded-xl border bg-card shadow-xs">
        <div className="flex">
          {/* Mini sidebar rail */}
          <div className="hidden w-12 flex-col items-center gap-2.5 border-r py-4 sm:flex">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Bot className="size-3.5" />
            </span>
            {[
              NotepadText,
              ListTodo,
              LayoutGrid,
              Braces,
              Globe,
            ].map((Icon, index) => (
              <span
                key={index}
                className="flex size-6 items-center justify-center rounded-md bg-muted text-muted-foreground"
              >
                <Icon className="size-3.5" />
              </span>
            ))}
          </div>

          {/* Main pane */}
          <div className="min-w-0 flex-1 space-y-3 p-4">
            {/* Header with search pill */}
            <div className="flex items-center gap-2">
              <div className="flex h-7 flex-1 items-center rounded-lg bg-muted px-2.5">
                <span className="size-3 rounded-full border-2 border-muted-foreground/40" />
                <span className="ml-2 h-1.5 w-24 rounded-full bg-muted-foreground/25" />
              </div>
              <span className="size-7 rounded-lg bg-primary/15" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Todo card */}
              <div className="rounded-lg border p-3">
                <div className="space-y-2">
                  {["Ship the hero section", "Review presets API", "Archive old snippets"].map(
                    (label, index) => (
                      <div key={label} className="flex items-center gap-2">
                        <span
                          className={`flex size-3.5 items-center justify-center rounded-[4px] ${
                            index === 0
                              ? "bg-primary text-primary-foreground"
                              : "border border-input"
                          }`}
                        >
                          {index === 0 && <Check className="size-2.5" strokeWidth={3} />}
                        </span>
                        <span
                          className={`h-2 rounded-full bg-muted-foreground/30 ${
                            ["w-28", "w-20", "w-24"][index]
                          } ${index === 0 ? "opacity-45" : ""}`}
                        />
                        <span
                          className={`ml-auto h-2.5 w-6 rounded-md ${
                            ["bg-red-500/25", "bg-amber-500/25", "bg-muted"][index]
                          }`}
                        />
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Code editor card */}
              <div className="overflow-hidden rounded-lg border">
                <div className="flex h-6 items-center gap-1.5 border-b bg-muted/50 px-2">
                  <span className="size-2 rounded-full bg-muted-foreground/40" />
                  <span className="h-1.5 w-14 rounded-full bg-muted-foreground/25" />
                </div>
                <div className="space-y-1 p-2.5 font-mono text-[10px] leading-5">
                  <p>
                    <span className="text-code-keyword">const</span>{" "}
                    <span className="text-foreground">hero</span>{" "}
                    <span className="text-code-keyword">=</span>{" "}
                    <span className="text-code-function">fetchPreset</span>
                    <span className="text-foreground">(</span>
                    <span className="text-code-string">&quot;navbar&quot;</span>
                    <span className="text-foreground">)</span>
                  </p>
                  <p className="text-code-comment">{"// one search, every domain"}</p>
                  <p>
                    <span className="text-code-function">search</span>
                    <span className="text-foreground">(</span>
                    <span className="text-code-string">&quot;@presets payout&quot;</span>
                    <span className="text-foreground">)</span>
                  </p>
                  <p>
                    <span className="text-code-keyword">return</span>{" "}
                    <span className="text-code-property">code</span>
                    <span className="text-foreground">;</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Domain chips */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {STRIP_CHIPS.map((chip) => (
          <span
            key={chip}
            className="rounded-full border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Feature card                                                        */
/* ------------------------------------------------------------------ */

function FeatureCard({
  feature,
}: {
  feature: (typeof FEATURES)[number];
}) {
  const Icon = feature.icon;

  return (
    <div
      data-feature-card
      className="rounded-2xl border bg-card p-5 shadow-xs transition-shadow hover:border-primary/30 hover:shadow-md"
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-4.5" />
      </span>
      <p className="font-heading mt-3 font-semibold">{feature.title}</p>
      <p className="mt-1.5 text-sm text-muted-foreground">{feature.description}</p>
    </div>
  );
}
