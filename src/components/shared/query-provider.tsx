"use client";

import * as React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";

import { makeQueryClient } from "@/lib/query-client";

let browserQueryClient: QueryClient | undefined;

function getQueryClient(): QueryClient {
  // Server: a fresh client per request so no shared cache leaks between
  // users (matches the TanStack "Advanced SSR" guide).
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  // Browser: module singleton so suspense boundaries and re-mounts don't
  // recreate the cache.
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

/** Wraps the app with TanStack Query. Rendered once in `app/layout.tsx`. */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(getQueryClient);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
