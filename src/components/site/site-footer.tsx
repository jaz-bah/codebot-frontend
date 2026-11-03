import Link from "next/link";
import { Bot } from "lucide-react";

import { ROUTES } from "@/constants/routes";

/**
 * Public landing footer: brand + tagline, product/account links and the
 * legal bottom bar. Server-safe (pure links, no interactivity).
 */
export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
          <div className="max-w-sm space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Bot className="size-4.5" />
              </span>
              <span className="font-heading text-base font-semibold tracking-widest uppercase">
                Codebot
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              One dark, quiet workspace for everything you write: notes,
              todos, files, components, presets, experts, tools and code
              snippets — searchable in a single place.
            </p>
          </div>

          <div className="flex gap-12 sm:gap-16">
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Product
              </p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="text-muted-foreground transition-colors hover:text-foreground">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how" className="text-muted-foreground transition-colors hover:text-foreground">
                    How it works
                  </a>
                </li>
                <li>
                  <Link href={ROUTES.dashboard.root} className="text-muted-foreground transition-colors hover:text-foreground">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Account
              </p>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href={ROUTES.auth.signIn} className="text-muted-foreground transition-colors hover:text-foreground">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link href={ROUTES.auth.signUp} className="text-muted-foreground transition-colors hover:text-foreground">
                    Create account
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Codebot. All rights reserved.</p>
          <p>Built with Next.js · CodeMirror · TanStack Query.</p>
        </div>
      </div>
    </footer>
  );
}
