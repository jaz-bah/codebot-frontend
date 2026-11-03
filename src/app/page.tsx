import { Landing } from "@/components/site/landing";

/**
 * `/` — public landing page (no dashboard shell, per DESIGN.md §5).
 * The whole animated page lives in components/site/landing.tsx (GSAP
 * needs a client boundary); this file stays the thin view.
 */
export default function Home() {
  return <Landing />;
}
