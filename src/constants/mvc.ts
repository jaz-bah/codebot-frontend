/**
 * MVC blueprint registry — static local data feeding the
 * /dashboard/mvc/* pages (see Brain/MVC.md). Each framework shows its
 * folder tree mapped to MVC roles: model / view / controller + service
 * glue. Nothing here is user-owned API data — see src/data/mvc/.
 */
import { expressjsMvcTree } from "@/data/mvc/expressjsMvc";
import { nestjsMvcTree } from "@/data/mvc/nestjsMvc";
import { nextjsMvcTree } from "@/data/mvc/nextjsMvc";
import { reactNativeMvcTree } from "@/data/mvc/reactNativeMvc";
import { remixjsMvcTree } from "@/data/mvc/remixjsMvc";
import { wxtMvcTree } from "@/data/mvc/wxtMvc";
import type { IMvcNode } from "@/types/global.type";

export type MvcFramework = {
  /** URL segment under /dashboard/mvc. */
  slug: string;
  /** Display name (sidebar + page heading + gallery card). */
  title: string;
  /** Gallery card / page description. */
  description: string;
  /** Full folder tree, rendered MVC.md-style. */
  tree: IMvcNode;
};

export const MVC_FRAMEWORKS: Record<string, MvcFramework> = {
  nextjs: {
    slug: "nextjs",
    title: "Next.js",
    description:
      "App Router tree from Brain/MVC.md — app/ is views + controllers, models & services below.",
    tree: nextjsMvcTree,
  },
  remixjs: {
    slug: "remixjs",
    title: "Remix.js",
    description:
      "loader/action per route is the controller — the default export is the view, .server.ts keeps models private.",
    tree: remixjsMvcTree,
  },
  nestjs: {
    slug: "nestjs",
    title: "Nest.js",
    description:
      "MVC native — @Controller + @Injectable per feature module, entities/DTOs as models, common/ for cross-cutting.",
    tree: nestjsMvcTree,
  },
  expressjs: {
    slug: "expressjs",
    title: "Express.js",
    description:
      "Manual MVC — routes map URLs to thin controllers, controllers call services, services use models.",
    tree: expressjsMvcTree,
  },
  wxt: {
    slug: "wxt",
    title: "WXT",
    description:
      "Browser extensions on Vite — background/content scripts control, popup/options/newtab view, storage is the model.",
    tree: wxtMvcTree,
  },
  reactNative: {
    slug: "react-native",
    title: "React Native",
    description:
      "Expo Router — app/ is the navigation tree (views), services + types/stores carry model duty for native apps.",
    tree: reactNativeMvcTree,
  },
} as const;

/** Number of nodes in a framework tree (folders + files). */
export function countMvcNodes(node: IMvcNode): number {
  return 1 + (node.children ?? []).reduce(
    (sum, child) => sum + countMvcNodes(child),
    0
  );
}
