"use client";

import { useEffect } from "react";

/**
 * Global error UI — replaces the root layout when it crashes, so it must
 * render its own <html>/<body> and may not export metadata.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to monitoring/observability tooling.
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background text-foreground">
        <title>Something went wrong</title>
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">
          Please try again. If the problem persists, contact support.
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground outline-none hover:opacity-90"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
