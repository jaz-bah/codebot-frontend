import type { Metadata } from "next";

import { TextCompareTool } from "@/components/dev-tools/text-compare-tool";

export const metadata: Metadata = {
  title: "Text Compare",
  description:
    "Compare two blocks of text side by side or inline. Spot added, removed and modified lines, with options to ignore whitespace and case.",
};

// See app/dev-tools/page.tsx — the shell's client auth gate hides this
// segment from the instant-navigation validation pass.
export const instant = false;

export default function TextComparePage() {
  return (
    <>
      <h2 className="sr-only">Text Compare</h2>
      <TextCompareTool />
    </>
  );
}
