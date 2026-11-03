"use client";

import Link from "next/link";
import { Bot, LogIn } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

/**
 * Public landing nav banner: brand identity from the app sidebar
 * (primary square + Bot + uppercase wordmark) with anchor links and
 * the two account actions. Sticks to the top with a blurred backdrop.
 * Link-as-button pieces use `buttonVariants` (base-ui Button must stay
 * a native <button>, so no `render={<Link/>}` here).
 */
export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href={ROUTES.home}
          aria-label="Codebot home"
          className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="size-4.5" />
          </span>
          <span className="font-heading text-base font-semibold tracking-widest uppercase">
            Codebot
          </span>
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          <a href="#features" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Features
          </a>
          <a href="#how" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            How it works
          </a>
          <Link href={ROUTES.auth.signIn} className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Sign in
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={ROUTES.dashboard.root}
            className={cn(buttonVariants({ variant: "default", size: "sm" }), "hidden sm:inline-flex")}
          >
            Open dashboard
          </Link>
          {/* Small screens: one primary action + a sign-in shortcut. */}
          <Link
            href={ROUTES.auth.signUp}
            className={cn(buttonVariants({ variant: "default", size: "sm" }), "sm:hidden")}
          >
            Get started
          </Link>
          <Link
            href={ROUTES.auth.signIn}
            aria-label="Sign in"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "sm:hidden")}
          >
            <LogIn className="size-4" />
          </Link>
        </div>
      </nav>
    </header>
  );
}
