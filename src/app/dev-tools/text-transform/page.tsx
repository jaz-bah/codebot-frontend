import type { Metadata } from "next";

import { TextTransformTool } from "@/components/dev-tools/text-transform-tool";

export const metadata: Metadata = {
  title: "Text Transform",
  description:
    "Convert text between uppercase, lowercase, camelCase, snake_case and more — with live character, word and line counts.",
};

// See app/dev-tools/page.tsx — the shell's client auth gate hides this
// segment from the instant-navigation validation pass.
export const instant = false;

export default function TextTransformPage() {
  return (
    <>
      <h2 className="sr-only">Text Transform</h2>
      <TextTransformTool />
    </>
  );
}
