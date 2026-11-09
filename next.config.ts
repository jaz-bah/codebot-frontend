import type { NextConfig } from "next";

// Same var server.mjs uses for /api + /socket.io proxying — one knob for both.
// (BACKEND_ORIGIN kept as a legacy alias.) Rewrites are baked into the build,
// so this must be present when the frontend service builds.
const backendOrigin =
  process.env.BACKEND_URL ?? process.env.BACKEND_ORIGIN ?? "http://localhost:3000";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Same-origin API proxy. In production, server.mjs already relays /api/** and
  // /socket.io/** (incl. WebSocket upgrade) to the backend before Next sees the
  // request. This fallback catches the backend's root-level routes (/todos,
  // /experts, /posts, /health, …) in BOTH dev (`next dev`) and prod: anything
  // that is not a frontend page/static asset is proxied to the backend, so the
  // browser only ever talks to THIS origin — auth/session cookies stay
  // first-party (survive third-party-cookie blocking) and CORS is not involved.
  async rewrites() {
    return {
      fallback: [
        {
          source: "/:path*",
          destination: `${backendOrigin}/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
