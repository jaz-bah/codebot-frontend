import { CommandSheet } from "@/components/dashboard/commands/command-sheet";
import { COMMAND_CATEGORIES } from "@/constants/commands";

export default function GitHubCommandsPage() {
  return <CommandSheet category={COMMAND_CATEGORIES.github} />;
}
