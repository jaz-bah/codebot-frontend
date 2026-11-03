/**
 * Commands cheat-sheet registry — static local data feeding the
 * /dashboard/commands/* pages. Each category is a list of sections
 * (`ICommandCard` groups); commands are `cmd` + `# comment` descriptions.
 * Nothing here is user-owned API data — see src/data/commands/.
 */
import { gitCommands } from "@/data/commands/gitCommands";
import { linuxCommands } from "@/data/commands/linuxCommands";
import { nextjsCommands } from "@/data/commands/nextjsCommands";
import { nodejsCommands } from "@/data/commands/nodejsCommands";
import { serverCommands } from "@/data/commands/serverCommands";
import { shopifyCommands } from "@/data/commands/shopifyCommands";
import { vpsCommands } from "@/data/commands/vpsCommands";
import type { ICommandCard } from "@/types/global.type";

export type CommandCategory = {
  /** URL segment under /dashboard/commands. */
  slug: string;
  /** Display name (sidebar + page heading + gallery card). */
  title: string;
  /** Gallery card / page description. */
  description: string;
  /** Section → commands data. */
  groups: ICommandCard[];
};

export const COMMAND_CATEGORIES: Record<string, CommandCategory> = {
  github: {
    slug: "github",
    title: "GitHub",
    description: "Git config, SSH keys, GitHub CLI auth, repos and releases.",
    groups: gitCommands,
  },
  linux: {
    slug: "linux",
    title: "Linux",
    description:
      "Shell essentials — files, permissions, text processing and processes.",
    groups: linuxCommands,
  },
  vps: {
    slug: "vps",
    title: "VPS",
    description:
      "Server basics — SSH, users, firewall, nginx, SSL and deployments.",
    groups: vpsCommands,
  },
  server: {
    slug: "server",
    title: "Server",
    description:
      "Ops cheat sheet — monitoring, logs, packages, services and systemd.",
    groups: serverCommands,
  },
  nextjs: {
    slug: "nextjs",
    title: "Next.js",
    description:
      "Next.js CLI — project setup, routing helpers and build/debug flags.",
    groups: nextjsCommands,
  },
  shopify: {
    slug: "shopify",
    title: "Shopify",
    description:
      "Shopify CLI — themes, Liquid snippets, app dev and stores.",
    groups: shopifyCommands,
  },
  nodejs: {
    slug: "nodejs",
    title: "Node.js",
    description:
      "npm/npx, package scripts, environment, debugging and Node core.",
    groups: nodejsCommands,
  },
} as const;

/** Number of commands across a category's groups. */
export function countCategoryCommands(category: CommandCategory): number {
  return category.groups.reduce((sum, group) => sum + group.commands.length, 0);
}
