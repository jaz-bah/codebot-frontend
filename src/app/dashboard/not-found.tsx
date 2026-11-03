"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Construction, MoveLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Dashboard 404: any dashboard route without a page yet renders this
 * "Coming Soon" screen. It composes inside `app/dashboard/layout.tsx`,
 * so the shell (sidebar + header) stays interactive around it.
 */
export default function DashboardNotFound() {
  const router = useRouter();
  const pathname = usePathname();

  // "/dashboard/commands/github" -> "commands / github"
  const section = pathname
    .replace(/^\/dashboard\/?/, "")
    .split("/")
    .filter(Boolean)
    .join(" / ");

  return (
    <div className="flex min-h-[60svh] flex-col items-center justify-center gap-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl border border-dashed border-muted-foreground/40 bg-muted/50 text-muted-foreground">
        <Construction className="size-8" />
      </span>

      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Coming soon
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          {section ? (
            <>
              <span className="font-medium text-foreground">
                {section}
              </span>{" "}
              is still under construction.
            </>
          ) : (
            "This part of Codebot is still under construction."
          )}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => router.back()}
        >
          <MoveLeft />
          Go back
        </Button>
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href="/dashboard/note" />}
        >
          Open Note
        </Button>
      </div>
    </div>
  );
}
