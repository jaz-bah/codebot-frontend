import type { IMvcNode } from "@/types/global.type";

/**
 * Next.js (App Router) MVC tree — mirrors Brain/MVC.md, which documents
 * THIS repo's own structure. `src/app/` carries the controller duties
 * (route handlers / server actions) next to the views.
 */
export const nextjsMvcTree: IMvcNode = {
  name: "my-app/",
  children: [
    {
      name: "src/",
      children: [
        {
          name: "app/",
          note: "# CONTROLLERS + VIEWS",
          role: "controller",
          children: [
            {
              name: "(site)/",
              note: "# Public facing pages (VIEW)",
              role: "view",
              children: [
                { name: "layout.tsx" },
                { name: "page.tsx" },
              ],
            },
            {
              name: "dashboard/",
              note: "# Authenticated area (VIEW)",
              role: "view",
              children: [
                { name: "layout.tsx" },
                { name: "page.tsx" },
                {
                  name: "settings/",
                  children: [{ name: "page.tsx" }],
                },
              ],
            },
            {
              name: "api/",
              note: "# Route handlers — REST endpoints",
              role: "controller",
              children: [{ name: "*/route.ts" }],
            },
            { name: "global-error.tsx", note: "# Global error UI", role: "view" },
            { name: "layout.tsx", note: "# App-level layout", role: "view" },
            { name: "page.tsx", note: "# Home page", role: "view" },
          ],
        },
        {
          name: "components/",
          note: "# VIEW — reusable UI",
          role: "view",
          children: [
            { name: "ui/", note: "# Buttons, inputs, cards…" },
            { name: "shared/", note: "# Navbars, footers, layouts" },
            { name: "forms/", note: "# Form components" },
            { name: "skeletons/", note: "# Loading skeletons" },
          ],
        },
        {
          name: "models/",
          note: "# MODELS — shared DB logic",
          role: "model",
          children: [{ name: "user.model.ts" }],
        },
        {
          name: "services/",
          note: "# SERVICES — API calls",
          role: "service",
          children: [
            { name: "user.service.ts" },
            { name: "product.service.ts" },
            { name: "order.service.ts" },
          ],
        },
        {
          name: "hooks/",
          note: "# Client data glue",
          role: "shared",
          children: [{ name: "useUser.ts" }],
        },
        {
          name: "lib/",
          note: "# Helpers + DB clients",
          role: "shared",
          children: [
            { name: "prisma.ts" },
            { name: "fetcher.ts" },
            { name: "validators/" },
            { name: "auth.ts" },
          ],
        },
        {
          name: "types/",
          note: "# Types/interfaces",
          role: "shared",
          children: [{ name: "global.type.ts" }, { name: "user.type.ts" }],
        },
        {
          name: "constants/",
          note: "# App-level constants",
          role: "shared",
          children: [{ name: "routes.ts" }, { name: "roles.ts" }],
        },
        {
          name: "utils/",
          note: "# Pure functions (no side effects)",
          role: "shared",
          children: [{ name: "date.ts" }, { name: "string.ts" }],
        },
        {
          name: "styles/",
          note: "# Global styles",
          role: "view",
          children: [{ name: "globals.css" }, { name: "variables.css" }],
        },
      ],
    },
    {
      name: "public/",
      note: "# Static assets",
      role: "view",
      children: [
        {
          name: "assets/",
          children: [
            { name: "images/" },
            { name: "icons/" },
            { name: "logos/" },
          ],
        },
      ],
    },
    { name: ".env", note: "# Secrets — never commit", role: "shared" },
    { name: "next.config.js", note: "# Framework config", role: "shared" },
    { name: "tsconfig.json", role: "shared" },
    { name: "package.json", role: "shared" },
  ],
};
