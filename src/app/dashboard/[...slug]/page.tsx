import { notFound } from "next/navigation";

// Opt out of instant-navigation validation: this segment is a 404 fallback
// that immediately throws notFound() and never renders a navigable shell,
// so it can't satisfy the "instant UI" check.
export const instant = false;

/**
 * Catch-all for dashboard routes that don't have a page yet. Rendering any
 * unmatched /dashboard/* URL here throws the 404 handled by
 * `app/dashboard/not-found.tsx` (the "Coming Soon" page), which still
 * renders inside the dashboard layout so the sidebar stays available.
 */
export default function DashboardCatchAllPage() {
  notFound();
}
