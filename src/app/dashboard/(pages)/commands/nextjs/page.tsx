import { CommandSheet } from "@/components/dashboard/commands/command-sheet";
import { COMMAND_CATEGORIES } from "@/constants/commands";

export default function NextjsCommandsPage() {
  return <CommandSheet category={COMMAND_CATEGORIES.nextjs} />;
}
