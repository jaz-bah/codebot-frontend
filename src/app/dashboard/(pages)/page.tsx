import { DashboardFeed } from "@/components/dashboard/posts/feed";

/* Opt out of instant-navigation validation (per `[...slug]/page.tsx`):
 * the feed is a client component fetching public data via TanStack
 * Query, so there is no server-rendered UI to validate. Route segment
 * config must live in a Server Component module — see route page. */
export const instant = false;

/**
 * /dashboard — the community feed. Backed by the public /posts API
 * (Brain/api-guide/posts-api-guide.md): every shared resource shows up
 * in a card shaped like its own kind, with a star button to upvote.
 */
export default function DashboardFeedPage() {
  return <DashboardFeed />;
}
