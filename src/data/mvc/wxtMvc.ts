import type { IMvcNode } from "@/types/global.type";

/**
 * WXT MVC tree (browser extensions on Vite): entrypoints are the
 * extension surfaces — background/content scripts act as controllers
 * over the browser APIs, popup/options/newtab are the views, storage
 * is the model.
 */
export const wxtMvcTree: IMvcNode = {
  name: "my-extension/",
  children: [
    {
      name: "entrypoints/",
      children: [
        {
          name: "background.ts",
          note: "# Service worker — events, alarms (CONTROLLER)",
          role: "controller",
        },
        {
          name: "content.ts",
          note: "# Injected page scripts (CONTROLLER)",
          role: "controller",
        },
        {
          name: "popup/",
          note: "# Toolbar popup (VIEW)",
          role: "view",
          children: [
            { name: "index.html" },
            { name: "App.tsx", note: "# auto-imports components" },
          ],
        },
        {
          name: "options.html",
          note: "# Full-page options (VIEW)",
          role: "view",
        },
        {
          name: "newtab/",
          note: "# Optional new-tab override (VIEW)",
          role: "view",
        },
      ],
    },
    {
      name: "components/",
      note: "# Shared UI — auto-imported",
      role: "view",
    },
    {
      name: "composables/",
      note: "# Reactive storage/browser hooks",
      role: "shared",
    },
    {
      name: "utils/",
      note: "# Helpers — auto-imported everywhere",
      role: "shared",
      children: [
        { name: "storage.ts", note: "# Extension storage (MODEL)", role: "model" },
        {
          name: "messaging.ts",
          note: "# Typed channels bg ↔ content (SERVICE)",
          role: "service",
        },
      ],
    },
    {
      name: "assets/",
      note: "# Images, fonts, styles",
      role: "view",
    },
    {
      name: "public/",
      note: "# Copied to dist verbatim",
      role: "view",
    },
    {
      name: "wxt.config.ts",
      note: "# Manifest — permissions, V2/V3",
      role: "shared",
    },
    {
      name: ".wxt/",
      note: "# Generated types — do not edit",
      role: "shared",
    },
    { name: "package.json", note: "# dev / build / zip", role: "shared" },
  ],
};
