/**
 * Artboard domain types (Brain/api-guide — /artboards NestJS endpoints).
 * Transport lives in services/artboard.service.ts; react-query wiring in
 * hooks/use-artboards.ts.
 */

/**
 * A drawing board. `content` is the drawing as SVG fragment markup
 * (art-board ADR-007) — one self-contained element per committed item,
 * stored verbatim by the backend.
 */
export type Artboard = {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type ArtboardSortBy = "title" | "createdAt";
export type ArtboardSortOrder = "asc" | "desc";

export type ArtboardListParams = {
  page: number;
  limit: number;
  search?: string;
  sortBy: ArtboardSortBy;
  sortOrder: ArtboardSortOrder;
};

export type ArtboardPage = {
  items: Artboard[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateArtboardInput = {
  title: string;
  content?: string;
};

export type UpdateArtboardPatch = Partial<
  Pick<Artboard, "title" | "content">
>;
