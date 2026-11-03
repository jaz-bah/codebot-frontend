import { LanguageDescription, type LanguageSupport } from "@codemirror/language"
import { languages } from "@codemirror/language-data"

/** Aliases `@codemirror/language-data` does not know about. */
const ALIASES: Record<string, string> = {
  py: "python",
  yml: "yaml",
  md: "markdown",
  rb: "ruby",
  kt: "kotlin",
  cs: "csharp",
  "c++": "cpp",
  plain: "plaintext",
  text: "plaintext",
  txt: "plaintext",
}

const PLAIN_TEXT = new Set(["plaintext"])

const cache = new Map<string, Promise<LanguageSupport | null>>()

/** Resolves a language id/alias to a `LanguageDescription`, or `null` for plain text / unknown. */
export function resolveLanguage(name: string): LanguageDescription | null {
  const normalized = name.trim().toLowerCase()
  const key = ALIASES[normalized] ?? normalized
  if (PLAIN_TEXT.has(key)) return null
  return LanguageDescription.matchLanguageName(languages, key, true)
}

/** Lazily loads the language support for a name; cached per language. */
export function loadLanguage(name: string): Promise<LanguageSupport | null> {
  const description = resolveLanguage(name)
  if (!description) return Promise.resolve(null)

  const cached = cache.get(description.name)
  if (cached) return cached

  const loading = description.load().catch(() => null)
  cache.set(description.name, loading)
  return loading
}

/** All language names the editor can load (for pickers and docs). */
export function listLanguages(): string[] {
  return languages.map((l) => l.name)
}
