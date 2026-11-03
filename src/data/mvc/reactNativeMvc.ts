import type { IMvcNode } from "@/types/global.type";

/**
 * React Native (Expo Router) MVC tree: the app/ directory IS the
 * navigation tree (file-based route screens = views); business logic
 * lives in services with types/stores as models. Platform variants
 * split via .ios/.android/.web file suffixes, not folders.
 */
export const reactNativeMvcTree: IMvcNode = {
  name: "my-app/",
  children: [
    {
      name: "app/",
      note: "# File-based routes (VIEW)",
      role: "view",
      children: [
        {
          name: "_layout.tsx",
          note: "# Root layout — providers, fonts",
        },
        {
          name: "(tabs)/",
          note: "# Tab navigator screens",
          children: [
            { name: "_layout.tsx" },
            { name: "index.tsx" },
            { name: "profile.tsx" },
          ],
        },
        {
          name: "[id].tsx",
          note: "# Dynamic segment screen",
        },
      ],
    },
    {
      name: "components/",
      note: "# RN primitives — no HTML/DOM",
      role: "view",
      children: [{ name: "ui/", note: "# Platform splits via .native/.web" }],
    },
    {
      name: "theme/",
      note: "# Tokens — colors, spacing, type",
      role: "view",
    },
    {
      name: "types/",
      note: "# DOMAIN MODELS + prop types",
      role: "model",
    },
    {
      name: "store/",
      note: "# Zustand/Redux models",
      role: "model",
      children: [{ name: "user.store.ts" }],
    },
    {
      name: "services/",
      note: "# Fetch clients — tokens via expo-secure-store (SERVICE)",
      role: "service",
      children: [{ name: "api.ts" }],
    },
    {
      name: "hooks/",
      note: "# Queries, permissions, orientation",
      role: "shared",
    },
    {
      name: "constants/",
      note: "# API url, feature flags",
      role: "shared",
    },
    {
      name: "utils/",
      note: "# Pure helpers",
      role: "shared",
    },
    {
      name: "assets/",
      note: "# images/ fonts/",
      role: "view",
    },
    {
      name: "app.json",
      note: "# Expo config — icon, splash",
      role: "shared",
    },
    { name: "metro.config.js", role: "shared" },
    { name: "package.json", role: "shared" },
    {
      name: "android/ + ios/",
      note: "# Native shells (expo prebuild)",
      role: "shared",
    },
  ],
};
