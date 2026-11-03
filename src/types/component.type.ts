/**
 * Components domain types (see Brain/api-guide/components-api-guide.md).
 * Transport lives in services/component.service.ts; react-query wiring
 * in hooks/use-components.ts.
 */

/** One code file row of the `component_file` table (always sent/read whole). */
export type ComponentFile = {
  id: string;
  /** Owning component. */
  componentId: string;
  userId: string;
  /** Lowercase slug, 1–20 chars (`css`, `html`, `ts`, `json`, `svg`, …). */
  language: string;
  /** Code stored verbatim (≤ 500 000 chars, never trimmed). */
  code: string;
  /** 0-based insertion rank; read queries order files by it. */
  position?: number;
  createdAt: string;
  updatedAt: string;
};

/** A named snippet-library entry: preview image + N code files. */
export type Component = {
  id: string;
  userId: string;
  /** 1–255 chars, trimmed. */
  name: string;
  /** Absolute URL (`https://…`) or root-relative path (`/image-url`), ≤ 1000 chars. */
  preview: string;
  /** Ordered by insertion (position 0, 1, …). */
  files: ComponentFile[];
  createdAt: string;
  updatedAt: string;
};

/** File payload as the API accepts it — language + verbatim code only. */
export type ComponentFileInput = {
  language: string;
  code: string;
};

export type ComponentSortBy = "createdAt" | "updatedAt" | "name";
export type ComponentSortOrder = "asc" | "desc";

export type ComponentListParams = {
  page: number;
  limit: number;
  /** Substring match over the component name (ILIKE). */
  search?: string;
  /** Keeps only components that have a file with this language. */
  language?: string;
  sortBy: ComponentSortBy;
  sortOrder: ComponentSortOrder;
};

export type ComponentPage = {
  items: Component[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateComponentInput = {
  name: string;
  preview: string;
  /** 1–20 files. */
  files: ComponentFileInput[];
};

export type UpdateComponentPatch = {
  name?: string;
  preview?: string;
  /** Present → the entire file set is replaced. */
  files?: ComponentFileInput[];
};

export type DeleteComponentResult = { deleted: boolean; id: string };
