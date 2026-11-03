/**
 * Preset domain types (see Brain/api-guide/preset-api-guide.md).
 * Transport lives in services/preset.service.ts; react-query wiring in
 * hooks/use-presets.ts.
 */

export type Preset = {
  id: string;
  userId: string;
  /** 1–255 chars, trimmed. */
  name: string;
  /** Free-form language label, 1–50 chars ("css", "javascript", …). */
  language: string;
  /** Code stored verbatim (1–20 000 chars, never trimmed). */
  data: string;
  createdAt: string;
  updatedAt: string;
};

export type PresetSortBy = "createdAt" | "name";
export type PresetSortOrder = "asc" | "desc";

export type PresetListParams = {
  page: number;
  limit: number;
  search?: string;
  /** Exact-match filter on the stored language value. */
  language?: string;
  sortBy: PresetSortBy;
  sortOrder: PresetSortOrder;
};

export type PresetPage = {
  items: Preset[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreatePresetInput = {
  name: string;
  language: string;
  /** Verbatim code — sent exactly as received. */
  data: string;
};

export type UpdatePresetPatch = Partial<
  Pick<Preset, "name" | "language" | "data">
>;
