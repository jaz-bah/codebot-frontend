/**
 * Pure text transforms for the /dev-tools/text-transform converter.
 *
 * Every transform is linear in the input length (one pass, or one split/join)
 * so pasting a multi-megabyte file stays usable — the page additionally runs
 * them through React's `useDeferredValue` so typing never blocks on the
 * conversion.
 */

export type TransformId =
  | "uppercase"
  | "lowercase"
  | "capitalize-words"
  | "sentence-case"
  | "camel-case"
  | "pascal-case"
  | "snake-case"
  | "kebab-case"
  | "constant-case"
  | "collapse-spaces"
  | "dedupe-lines"
  | "reverse";

export type TransformGroupId = "case" | "code" | "cleanup";

export interface TransformGroup {
  id: TransformGroupId;
  label: string;
}

/** Toolbar rows, in display order. */
export const TRANSFORM_GROUPS: readonly TransformGroup[] = [
  { id: "case", label: "CASE" },
  { id: "code", label: "CODE" },
  { id: "cleanup", label: "CLEAN UP" },
] as const;

export interface TransformDefinition {
  id: TransformId;
  label: string;
  group: TransformGroupId;
  /** Full before → after hint, used as the chip tooltip. */
  example: string;
}

/** Palette order, grouped by intent: case formats, code casing, clean-up. */
export const TRANSFORMS: readonly TransformDefinition[] = [
  {
    id: "uppercase",
    label: "UPPERCASE",
    group: "case",
    example: "hello world → HELLO WORLD",
  },
  {
    id: "lowercase",
    label: "lowercase",
    group: "case",
    example: "HELLO WORLD → hello world",
  },
  {
    id: "capitalize-words",
    label: "Title Case",
    group: "case",
    example: "hello world → Hello World (capitalize each word)",
  },
  {
    id: "sentence-case",
    label: "Sentence case",
    group: "case",
    example: "hello world. next one. → Hello world. Next one.",
  },
  {
    id: "camel-case",
    label: "camelCase",
    group: "code",
    example: "hello world → helloWorld",
  },
  {
    id: "pascal-case",
    label: "PascalCase",
    group: "code",
    example: "hello world → HelloWorld",
  },
  {
    id: "snake-case",
    label: "snake_case",
    group: "code",
    example: "hello world → hello_world",
  },
  {
    id: "kebab-case",
    label: "kebab-case",
    group: "code",
    example: "hello world → hello-world",
  },
  {
    id: "constant-case",
    label: "CONSTANT_CASE",
    group: "code",
    example: "hello world → HELLO_WORLD",
  },
  {
    id: "collapse-spaces",
    label: "Remove extra spaces",
    group: "cleanup",
    example: "one   space   between words → one space between words",
  },
  {
    id: "dedupe-lines",
    label: "Remove duplicate lines",
    group: "cleanup",
    example: "apple\\napple\\npear → apple\\npear",
  },
  {
    id: "reverse",
    label: "Reverse text",
    group: "cleanup",
    example: "hello world → dlrow olleh (per line, line breaks kept)",
  },
] as const;

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

const LINE_BREAK = "\n";
const CRLF = /\r\n?/g;
const APOSTROPHES = /['’`]/g;
/** "helloWorld" → "hello World" (lowercase/digit followed by uppercase). */
const HUMP = /([\p{Ll}\p{N}])(\p{Lu})/gu;
/** "HTTPResponse" → "HTTP Response" (acronym followed by a capitalised word). */
const ACRONYM_END = /(\p{Lu})(\p{Lu}\p{Ll})/gu;
/** Anything that is not a letter or a number separates words. */
const NOT_WORD = /[^\p{L}\p{N}]+/u;
/** Horizontal whitespace only — newlines are structural. */
const HORIZONTAL_SPACE = /[^\S\n]+/g;

/** Applies `fn` to every line and reassembles with the original breaks. */
function perLine(text: string, fn: (line: string) => string): string {
  return text.split(LINE_BREAK).map(fn).join(LINE_BREAK);
}

function upperFirst(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Splits arbitrary text into words, coping with camelCase/PascalCase,
 * snake_case/kebab-case, acronyms, digits, apostrophes and accented letters.
 */
export function splitWords(input: string): string[] {
  return input
    .replace(APOSTROPHES, "")
    .replace(HUMP, "$1 $2")
    .replace(ACRONYM_END, "$1 $2")
    .split(NOT_WORD)
    .filter(Boolean);
}

/* ------------------------------------------------------------------ */
/* Case formats                                                        */
/* ------------------------------------------------------------------ */

/** `hello world` → `Hello World` (rest is lowercased, punctuation kept). */
function toCapitalizedWords(text: string): string {
  return text
    .toLowerCase()
    .replace(
      /(^|[^\p{L}\p{N}])(\p{L})/gu,
      (_match, lead: string, letter: string) => lead + letter.toUpperCase()
    );
}

/** Lowercases everything, then capitalises after line starts and `.?!`. */
function toSentenceCase(text: string): string {
  return text
    .toLowerCase()
    .replace(
      /(^|[.!?]\s+)(\p{L})/gmu,
      (_match, lead: string, letter: string) => lead + letter.toUpperCase()
    );
}

function toCamelCase(text: string): string {
  return perLine(text, (line) => {
    const words = splitWords(line);
    if (words.length === 0) return "";
    const [first, ...rest] = words;
    return (
      first.toLowerCase() + rest.map((word) => upperFirst(word.toLowerCase())).join("")
    );
  });
}

function toPascalCase(text: string): string {
  return perLine(text, (line) =>
    splitWords(line)
      .map((word) => upperFirst(word.toLowerCase()))
      .join("")
  );
}

function toDelimitedCase(
  text: string,
  separator: string,
  upper: boolean
): string {
  return perLine(text, (line) => {
    const words = splitWords(line);
    const mapped = upper
      ? words.map((word) => word.toUpperCase())
      : words.map((word) => word.toLowerCase());
    return mapped.join(separator);
  });
}

/* ------------------------------------------------------------------ */
/* Clean up                                                            */
/* ------------------------------------------------------------------ */

/**
 * Collapses runs of spaces/tabs into one space and trims every line, while
 * leaving the line structure (including intentional blank lines) intact.
 */
function collapseSpaces(text: string): string {
  return text
    .split(LINE_BREAK)
    .map((line) => line.replace(HORIZONTAL_SPACE, " ").trim())
    .join(LINE_BREAK)
    .replace(/^\n+|\n+$/g, "");
}

/** Keeps the first occurrence of each line, in order. */
function dedupeLines(text: string): string {
  const seen = new Set<string>();
  const kept: string[] = [];
  for (const line of text.split(LINE_BREAK)) {
    if (seen.has(line)) continue;
    seen.add(line);
    kept.push(line);
  }
  return kept.join(LINE_BREAK);
}

/** Reverses each line character by character (astral chars stay whole). */
function reverseText(text: string): string {
  return perLine(text, (line) => Array.from(line).reverse().join(""));
}

/* ------------------------------------------------------------------ */
/* Entry point                                                        */
/* ------------------------------------------------------------------ */

/**
 * Applies one transform. Line breaks survive every format: multi-line input
 * is converted line by line, and the cleaning utilities never reflow it.
 * CRLF input is normalised to LF so the helpers see one line-break char.
 */
export function applyTransform(
  text: string,
  id: TransformId | null
): string {
  if (!id || !text) return text;
  const source = text.replace(CRLF, LINE_BREAK);

  switch (id) {
    case "uppercase":
      return source.toUpperCase();
    case "lowercase":
      return source.toLowerCase();
    case "capitalize-words":
      return toCapitalizedWords(source);
    case "sentence-case":
      return toSentenceCase(source);
    case "camel-case":
      return toCamelCase(source);
    case "pascal-case":
      return toPascalCase(source);
    case "snake-case":
      return toDelimitedCase(source, "_", false);
    case "kebab-case":
      return toDelimitedCase(source, "-", false);
    case "constant-case":
      return toDelimitedCase(source, "_", true);
    case "collapse-spaces":
      return collapseSpaces(source);
    case "dedupe-lines":
      return dedupeLines(source);
    case "reverse":
      return reverseText(source);
    default:
      return source;
  }
}

/* ------------------------------------------------------------------ */
/* Statistics                                                          */
/* ------------------------------------------------------------------ */

export interface TextStats {
  characters: number;
  charactersWithoutSpaces: number;
  words: number;
  lines: number;
}

function isWhitespace(code: number): boolean {
  return (
    code === 32 || // space
    code === 9 || // tab
    code === 10 || // \n
    code === 11 || // \v
    code === 12 || // \f
    code === 13 || // \r
    code === 0xa0 || // nbsp
    code === 0x3000 // ideographic space
  );
}

/**
 * Single allocation-free pass: counts code points (not UTF-16 units, so an
 * emoji counts once), words as whitespace-separated runs, and lines.
 */
export function countText(text: string): TextStats {
  let characters = 0;
  let charactersWithoutSpaces = 0;
  let words = 0;
  let lineBreaks = 0;
  let inWord = false;

  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);

    // Surrogate pair → one character; count it and skip the low half.
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < text.length) {
      const low = text.charCodeAt(i + 1);
      if (low >= 0xdc00 && low <= 0xdfff) {
        characters += 1;
        charactersWithoutSpaces += 1;
        if (!inWord) {
          words += 1;
          inWord = true;
        }
        i += 1;
        continue;
      }
    }

    characters += 1;
    if (code === 10) lineBreaks += 1;

    if (isWhitespace(code)) {
      inWord = false;
      continue;
    }

    charactersWithoutSpaces += 1;
    if (!inWord) {
      words += 1;
      inWord = true;
    }
  }

  return {
    characters,
    charactersWithoutSpaces,
    words,
    lines: text.length > 0 ? lineBreaks + 1 : 0,
  };
}
