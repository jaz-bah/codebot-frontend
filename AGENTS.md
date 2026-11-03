<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## TanStack Query — client-side server state (required)

`@tanstack/react-query` is installed and the app is wrapped by `<QueryProvider>` (rendered once in `app/layout.tsx`; client factory lives in `lib/query-client.ts`, default `staleTime` 1 minute).

Rules:

- **All remote reads go through query hooks.** In Client Components, every API fetch, live-updating value, or paginated list uses `useQuery` / `useInfiniteQuery`. Never fetch in `useEffect` + `setState` — that pattern is banned.
- **All writes go through `useMutation`.** After a mutation succeeds, invalidate what changed with `queryClient.invalidateQueries({ queryKey: … })` (broad list keys after CRUD; don't hand-merge results into the cache unless invalidation is impossible).
- **Key structure**: query keys are arrays, scoped by feature and shape — list: `["experts", "list", { page: 1 }]`, detail: `["experts", "detail", id]`. Keep keys unique per request shape; co-locate key constants next to the feature's hooks.
- **Always handle all states.** Never read `data` without checking `isPending`/`isError` — render skeletons (`components/ui/skeleton.tsx`) for pending and a readable error state with a retry (`refetch`).
- **Server Components don't use TanStack Query.** Data rendered in RSC comes from React itself (async components / `use cache` per Next docs). TanStack Query is for state the client fetches, owns, or needs to refetch/mutate — not a replacement for RSC data loading.
- **One query client.** Don't create `QueryClient` instances inline; everything flows through the provider `QueryProvider` gives. For imperative cache access (optimistic updates, prefetching on hover) use `useQueryClient`.
- **Transports**: define typed fetchers in `services/` per feature (e.g. `services/todo.service.ts`) and keep components free of raw `fetch` calls.

