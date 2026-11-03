/**
 * Document domain types (see Brain/api-guide/documents-api-guide.md).
 * Transport lives in services/document.service.ts; react-query wiring in
 * hooks/use-documents.ts.
 */

export type Document = {
  id: string;
  userId: string;
  /** Editable display name (≤ 255 chars). */
  name: string;
  /** Editable, optional description (≤ 5000 chars; null when empty). */
  description: string | null;
  /** Immutable Cloudinary URL of the uploaded bytes. */
  url: string;
  createdAt: string;
  updatedAt: string;
};

export type DocumentSortBy = "createdAt" | "updatedAt" | "name";
export type DocumentSortOrder = "asc" | "desc";

export type DocumentListParams = {
  page: number;
  limit: number;
  search?: string;
  sortBy: DocumentSortBy;
  sortOrder: DocumentSortOrder;
};

export type DocumentPage = {
  items: Document[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/** multipart text fields accepted by POST /documents. */
export type CreateDocumentInput = {
  file: File;
  /** Optional — falls back to the sanitized original filename server-side. */
  name?: string;
  /** Optional — stored as NULL when omitted/empty. */
  description?: string;
};

/** JSON body for PATCH /documents/:id — metadata only, at least one field. */
export type UpdateDocumentPatch = Partial<
  Pick<Document, "name" | "description">
>;
