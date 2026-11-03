/**
 * IDE Snippet domain types (see Brain/api-guide/ide-snippet-api-guide.md).
 * Transport lives in services/ide-snippet.service.ts; react-query wiring
 * in hooks/use-ide-snippets.ts.
 */

export type IdeSnippet = {
  id: string;
  userId: string;
  /** Free-form language label, 1–50 chars ("css", "ts", "c++", …). */
  language: string;
  /** Code stored verbatim (1–20 000 chars, never trimmed). */
  data: string;
  createdAt: string;
  updatedAt: string;
};

export type IdeSnippetSortBy = "createdAt" | "language";
export type IdeSnippetSortOrder = "asc" | "desc";

export type IdeSnippetListParams = {
  page: number;
  limit: number;
  search?: string;
  /** Exact-match filter on the stored language value. */
  language?: string;
  sortBy: IdeSnippetSortBy;
  sortOrder: IdeSnippetSortOrder;
};

export type IdeSnippetPage = {
  items: IdeSnippet[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateIdeSnippetInput = {
  language: string;
  /** Verbatim code — sent exactly as received. */
  data: string;
};

export type UpdateIdeSnippetPatch = Partial<
  Pick<IdeSnippet, "language" | "data">
>;
