import type { IMvcNode } from "@/types/global.type";

/**
 * Remix MVC tree: routes carry the controller duty through their
 * `loader` (read) and `action` (write) exports; views are the default
 * component exports. `.server.ts` suffix keeps model/service code
 * server-only (never shipped to the client).
 */
export const remixjsMvcTree: IMvcNode = {
  name: "remix-app/",
  children: [
    {
      name: "app/",
      children: [
        {
          name: "root.tsx",
          note: "# Document shell + global providers",
          role: "view",
        },
        {
          name: "routes/",
          note: "# URL segments",
          children: [
            {
              name: "_index.tsx",
              note: "# view + loader/action (CONTROLLER)",
              role: "controller",
            },
            {
              name: "dashboard.tsx",
              note: "# loader() reads, action() mutates",
              role: "controller",
            },
            {
              name: "settings.tsx",
              note: "# layout route — nested segments share it",
              role: "view",
            },
            {
              name: "$.tsx",
              note: "# splat/catch-all route",
              role: "view",
            },
          ],
        },
        {
          name: "components/",
          note: "# VIEW — reusable UI",
          role: "view",
        },
        {
          name: "styles/",
          note: "# Plain CSS imports per route",
          role: "view",
        },
        {
          name: "models/",
          note: "# MODELS — .server.ts = never shipped",
          role: "model",
          children: [{ name: "user.model.server.ts" }],
        },
        {
          name: "services/",
          note: "# Business logic + API calls",
          role: "service",
          children: [{ name: "user.service.server.ts" }],
        },
        {
          name: "lib/",
          note: "# DB client singleton, sessions",
          role: "shared",
          children: [{ name: "db.server.ts" }],
        },
        {
          name: "utils/",
          note: "# Pure helpers",
          role: "shared",
        },
        {
          name: "types/",
          note: "# Shared interfaces",
          role: "shared",
        },
        { name: "entry.server.tsx", note: "# SSR bootstrap (optional)" },
        { name: "entry.client.tsx", note: "# Hydration bootstrap (optional)" },
      ],
    },
    {
      name: "public/",
      note: "# Static assets served as-is",
      role: "view",
    },
    { name: "vite.config.ts", note: "# Remix + Vite config", role: "shared" },
    {
      name: ".env",
      note: "# SESSION_SECRET, DATABASE_URL",
      role: "shared",
    },
    { name: "package.json", role: "shared" },
  ],
};
