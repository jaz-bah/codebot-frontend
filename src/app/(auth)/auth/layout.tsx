import Link from "next/link";
import { Bot, Check } from "lucide-react";

const BRAND_BULLETS = [
  "Notes, todos, files & components — one workspace",
  "Every proven answer reusable as a preset",
  "Everything searchable from a single box",
];

/**
 * Auth route shell. Desktop (lg+): split brand pane (left, 45%) + centered
 * form column (right). Mobile: slim brand strip on top, card below.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground lg:flex-row">
      {/* Mobile brand strip */}
      <div className="flex items-center justify-between border-b px-6 py-3 lg:hidden">
        <Link href="/" className="flex items-center gap-2" aria-label="Codebot — home">
          <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="size-4" />
          </span>
          <span className="font-heading text-sm font-semibold tracking-widest">
            Codebot
          </span>
        </Link>
        <span className="text-xs text-muted-foreground">
          Your coding life, in one place
        </span>
      </div>

      {/* Desktop brand pane */}
      <aside className="relative hidden overflow-hidden border-r border-border bg-card lg:flex lg:w-[45%]">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_18%_-5%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent),radial-gradient(ellipse_55%_40%_at_85%_105%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent)] dark:bg-[radial-gradient(ellipse_60%_45%_at_18%_-5%,color-mix(in_oklch,var(--primary)_28%,transparent),transparent),radial-gradient(ellipse_55%_40%_at_85%_105%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent)]"
        />
        <div className="relative z-10 flex flex-1 flex-col p-12">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Codebot — home">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Bot className="size-5" />
            </span>
            <span className="font-heading text-lg font-semibold tracking-widest">
              Codebot
            </span>
          </Link>

          <div className="flex flex-1 flex-col justify-center py-12">
            <div className="max-w-md">
              <h2 className="font-heading text-balance text-4xl font-semibold tracking-tight">
                The workspace for everything you write.
              </h2>
              <p className="mt-3 text-base text-muted-foreground text-pretty">
                Notes, todos, files, components, presets, experts, tools and
                snippets — one quiet workspace, all searchable.
              </p>
            </div>

            <ul className="mt-10 flex max-w-md flex-col gap-3">
              {BRAND_BULLETS.map((bullet) => (
                <li
                  key={bullet}
                  className="flex items-center gap-3 text-sm text-muted-foreground"
                >
                  <span
                    aria-hidden
                    className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/12 text-primary"
                  >
                    <Check className="size-3" />
                  </span>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      {/* Form pane — children (the AuthCard) stay centered here */}
      <main className="flex flex-1 items-center justify-center p-6 sm:p-10">
        {children}
      </main>
    </div>
  );
}
