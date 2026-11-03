/**
 * Search models — the uniform response of `GET /search` (see
 * Brain/api-guide/search-api-guide.md). One merged, newest-first hit
 * list across todos, notes, files, documents, components, presets,
 * experts, tools and IDE snippets.
 */

/** Canonical scope tokens (@todos, @notes, …) — singular/plural aliases
 * are accepted by the API but these are what it echoes back / 400s with. */
export const SEARCH_SCOPES = [
  "todos",
  "notes",
  "files",
  "documents",
  "components",
  "presets",
  "experts",
  "tools",
  "snippets",
] as const;

export type SearchScope = (typeof SEARCH_SCOPES)[number];

/** Singular domain label of one hit (what the API returns). */
export type SearchHitType =
  | "todo"
  | "note"
  | "file"
  | "document"
  | "component"
  | "preset"
  | "expert"
  | "tool"
  | "snippet";

/** One merged search hit — identical shape across all domains. */
export type SearchHit = {
  type: SearchHitType;
  /** Resolver id: the hit type's own id (notes carry the fileId). */
  id: string;
  /** Best display string (todo title, file name, component name…). */
  title: string;
  /** Domain context (text preview, language, description…). */
  subtitle: string | null;
  /** Ordering key — results arrive newest-first. */
  updatedAt: string;
};

export type SearchResponse = {
  /** What the API received (token + free text). */
  query: string;
  /** `["all"]` or the canonical list of scopes actually searched. */
  scopes: string[];
  /** Per-scope cap that was applied. */
  limit: number;
  /** Number of returned hits (≤ scopes × limit). */
  total: number;
  results: SearchHit[];
};

/** POST-free read params. `q` is required (tokens + free text); `limit`
 * caps each scope's result count (1–50, default 10). */
export type SearchParams = {
  q: string;
  limit?: number;
};
