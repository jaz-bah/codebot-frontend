import { QueryClient } from "@tanstack/react-query";

/**
 * TanStack Query client factory (TanStack docs, Next.js App Router setup).
 *
 * Defaults:
 * - `staleTime` 1 minute: navigations within a minute reuse cached data
 *   instead of refetching on every mount.
 * - `refetchOnWindowFocus` stays on; reads stay fresh without extra config.
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}
