export type Language =
  | "json"
  | "liquid"
  | "html"
  | "css"
  | "javascript"
  | "typescript"
  | "jsx"
  | "tsx"
  | "python"
  | "bash"
  | "sql"
  | "php"
  | "unknown";

export interface DetectLanguageProps {
  code: string;
}

export interface DetectLanguageResult {
  language: Language;
  /** 0–1, rough heuristic confidence */
  confidence: number;
}

type Rule = { lang: Exclude<Language, "unknown" | "jsx" | "tsx">; test: RegExp; weight: number };

const RULES: Rule[] = [
  // Liquid
  { lang: "liquid", test: /\{%-?\s*(if|unless|for|assign|render|include|section|schema|endif|endfor|case|when)\b/, weight: 6 },
  { lang: "liquid", test: /\{\{-?\s*[\w.'"\[\]]+(\s*\|\s*\w+)/, weight: 5 },
  { lang: "liquid", test: /\{%-?\s*end(schema|if|for|unless|case|capture)\s*-?%\}/, weight: 5 },

  // HTML
  { lang: "html", test: /^\s*<!doctype html/i, weight: 8 },
  { lang: "html", test: /<(html|head|body|div|span|section|main|header|footer|ul|li|p|a|img|button|script|style)[\s>]/i, weight: 3 },
  { lang: "html", test: /<\/(div|span|section|ul|li|p|a|button|script|style|body|html)>/i, weight: 2 },

  // CSS
  { lang: "css", test: /(^|\})\s*[.#@:]?[\w\-\s,>+~:.#\[\]="']+\{[^}]*:[^}]*;?[^}]*\}/m, weight: 5 },
  { lang: "css", test: /^\s*(--[\w-]+|[a-z-]+)\s*:\s*[^;{}]+;\s*$/m, weight: 2 },
  { lang: "css", test: /@(media|keyframes|font-face|import|layer|container)\b/, weight: 4 },

  // TypeScript (distinctive)
  { lang: "typescript", test: /\b(interface|type)\s+\w+(<[^>]+>)?\s*(=|\{)/, weight: 6 },
  { lang: "typescript", test: /:\s*(string|number|boolean|unknown|any|void|never)\b(\[\])?/, weight: 4 },
  { lang: "typescript", test: /\b(as const|satisfies|readonly|enum\s+\w+|implements|public|private|protected)\b/, weight: 3 },
  { lang: "typescript", test: /\w+<[A-Z]\w*(,\s*\w+)*>\(/, weight: 2 },
  { lang: "typescript", test: /^\s*import\s+type\b/m, weight: 6 },

  // JavaScript
  { lang: "javascript", test: /\b(const|let|var)\s+[\w{[]/, weight: 3 },
  { lang: "javascript", test: /\bfunction\s*\w*\s*\(/, weight: 3 },
  { lang: "javascript", test: /=>/, weight: 2 },
  { lang: "javascript", test: /\b(console\.(log|error|warn)|document\.|window\.|require\()/, weight: 3 },
  { lang: "javascript", test: /^\s*(import .+ from|export (default|const|function|class))/m, weight: 3 },
  { lang: "javascript", test: /\b(customElements\.define|addEventListener|querySelector(All)?)\b/, weight: 3 },
  { lang: "javascript", test: /\bclass\s+\w+(\s+extends\s+\w+)?\s*\{/, weight: 2 },

  // Python
  { lang: "python", test: /^\s*def\s+\w+\s*\(.*\)\s*(->\s*[\w\[\], ]+)?\s*:/m, weight: 6 },
  { lang: "python", test: /^\s*(from\s+[\w.]+\s+import|import\s+\w+)(?!.*from\s+['"])/m, weight: 3 },
  { lang: "python", test: /^\s*(elif|except|finally|with .+ as .+):/m, weight: 4 },
  { lang: "python", test: /\b(self|None|True|False)\b/, weight: 2 },
  { lang: "python", test: /\bprint\(/, weight: 1 },
  { lang: "python", test: /^\s*class\s+\w+(\(.*\))?:\s*$/m, weight: 5 },

  // Bash
  { lang: "bash", test: /^#!\/(usr\/)?bin\/(env\s+)?(ba|z)?sh/, weight: 10 },
  { lang: "bash", test: /^\s*(sudo|apt(-get)?|npm|pnpm|yarn|git|cd|ls|mkdir|chmod|curl|export|echo)\s+/m, weight: 3 },
  { lang: "bash", test: /\$\(.+\)|\$\{?\w+\}?/, weight: 2 },
  { lang: "bash", test: /^\s*(fi|done|esac)\s*$/m, weight: 4 },

  // SQL
  { lang: "sql", test: /\bselect\b[\s\S]+\bfrom\b/i, weight: 6 },
  { lang: "sql", test: /\b(insert\s+into|update\s+\w+\s+set|delete\s+from|create\s+table|alter\s+table|group\s+by|order\s+by|inner\s+join|left\s+join)\b/i, weight: 5 },

  // PHP
  { lang: "php", test: /<\?php/, weight: 10 },
  { lang: "php", test: /\$\w+\s*=\s*.+;|->\w+\(/, weight: 2 },
];

const MIN_SCORE = 4;

function isJson(code: string): boolean {
  const trimmed = code.trim();
  if (!/^[\[{]/.test(trimmed)) return false;
  try {
    JSON.parse(trimmed);
    return true;
  } catch {
    return false;
  }
}

export function detectLanguage({ code }: DetectLanguageProps): DetectLanguageResult {
  const source = code?.trim() ?? "";
  if (!source) return { language: "unknown", confidence: 0 };

  if (isJson(source)) return { language: "json", confidence: 1 };

  const scores = new Map<Language, number>();
  for (const { lang, test, weight } of RULES) {
    if (test.test(source)) scores.set(lang, (scores.get(lang) ?? 0) + weight);
  }

  // Liquid files are usually HTML-wrapped; Liquid tags should win over plain HTML.
  if ((scores.get("liquid") ?? 0) >= 5) {
    scores.set("liquid", (scores.get("liquid") ?? 0) + (scores.get("html") ?? 0));
    scores.delete("html");
  }

  // TypeScript is a superset of JS: if any TS-only syntax is present, it beats JS.
  const ts = scores.get("typescript") ?? 0;
  const js = scores.get("javascript") ?? 0;
  if (ts >= 4) scores.set("typescript", ts + js);

  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  if (!ranked.length || ranked[0][1] < MIN_SCORE) {
    return { language: "unknown", confidence: 0 };
  }

  let [language] = ranked[0] as [Language, number];
  const top = ranked[0][1];
  const total = ranked.reduce((sum, [, s]) => sum + s, 0);

  // Promote JS/TS to JSX/TSX when JSX syntax is present.
  const hasJsx = /return\s*\(\s*<[\w>]|<[A-Z]\w*[\s/>]|=\s*\(\s*<\w+/.test(source);
  if (hasJsx && language === "javascript") language = "jsx";
  if (hasJsx && language === "typescript") language = "tsx";

  return { language, confidence: Math.min(1, top / total) };
}

// Example:
// detectLanguage({ code: "const a: number = 1;" })
// → { language: "typescript", confidence: 1 }
