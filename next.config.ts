import type { NextConfig } from "next";

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
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: "https://codebot-backend-aued.onrender.com/api/auth/:path*",
      },
      {
        source: "/api/:path*",
        destination: "https://codebot-backend-aued.onrender.com/:path*",
      },
    ];
  },
};

export default nextConfig;
