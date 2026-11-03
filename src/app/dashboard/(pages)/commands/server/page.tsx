import { CommandSheet } from "@/components/dashboard/commands/command-sheet";
import { COMMAND_CATEGORIES } from "@/constants/commands";

export default function ServerCommandsPage() {
  return <CommandSheet category={COMMAND_CATEGORIES.server} />;
}
