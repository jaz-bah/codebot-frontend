/**
 * Document service — the transport layer for the /documents NestJS endpoints
 * (Brain/api-guide/documents-api-guide.md). No react-query / UI code in here.
 */
import { API_URL } from "@/lib/auth-client";
import type {
  CreateDocumentInput,
  Document,
  DocumentListParams,
  DocumentPage,
  UpdateDocumentPatch,
} from "@/types/document.type";

/* ------------------------------------------------------------------ */
/* Transport                                                           */
/* ------------------------------------------------------------------ */

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Backend returns a uniform error envelope: { statusCode, message, ... } */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    // Session is an httpOnly cookie on the backend origin.
    credentials: "include",
    ...init,
    headers: {
      ...init?.headers,
    },
  });

  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      res.status,
      typeof payload?.message === "string"
        ? payload.message
        : `Request failed (${res.status})`
    );
  }
  return payload as T;
}

function listQuerystring(params: DocumentListParams): string {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page));
  qs.set("limit", String(params.limit));
  qs.set("sortBy", params.sortBy);
  qs.set("sortOrder", params.sortOrder);
  if (params.search) qs.set("search", params.search);
  return qs.toString();
}

/* ------------------------------------------------------------------ */
/* Endpoints                                                           */
/* ------------------------------------------------------------------ */

/** GET /documents — server-side paginated + searched list */
export function fetchDocumentPage(
  params: DocumentListParams
): Promise<DocumentPage> {
  return request<DocumentPage>(`/documents?${listQuerystring(params)}`);
}

/** GET /documents/:id — 404 when missing or owned by another user */
export function fetchDocument(id: string): Promise<Document> {
  return request<Document>(`/documents/${id}`);
}

/** POST /documents — upload bytes to Cloudinary + persist metadata.
 * multipart/form-data field: `file`; optional text fields name/description. */
export async function createDocument(
  input: CreateDocumentInput
): Promise<Document> {
  const formData = new FormData();
  formData.set("file", input.file, input.file.name);
  if (input.name?.trim()) formData.set("name", input.name.trim());
  if (input.description?.trim()) {
    formData.set("description", input.description.trim());
  }
  // Never set content-type by hand — the browser adds the multipart boundary.
  return request<Document>("/documents", {
    method: "POST",
    body: formData,
  });
}

/** PATCH /documents/:id — metadata only (name/description); empty patch → 400. */
export function updateDocument(
  id: string,
  patch: UpdateDocumentPatch
): Promise<Document> {
  return request<Document>(`/documents/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
    headers: { "content-type": "application/json" },
  });
}

/** DELETE /documents/:id — removes the database row only; the Cloudinary
 * asset stays in the user's account. */
export function deleteDocument(
  id: string
): Promise<{ deleted: boolean; id: string }> {
  return request(`/documents/${id}`, { method: "DELETE" });
}
