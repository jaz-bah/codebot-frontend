import type { TodoPriority } from "@/types/todo.type";

/** Display metadata for todo priorities, shared by the card and the form. */

export const PRIORITY_LABELS: Record<TodoPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const PRIORITY_STYLES: Record<TodoPriority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  high: "bg-amber-500/15 text-amber-700 dark:text-amber-500",
  urgent: "bg-red-500/15 text-red-700 dark:text-red-500",
};

/** Accent colors for the card's left priority stripe. */
export const PRIORITY_ACCENTS: Record<TodoPriority, string> = {
  low: "border-l-muted-foreground/30",
  medium: "border-l-blue-500/60",
  high: "border-l-amber-500/70",
  urgent: "border-l-red-500/80",
};
