/**
 * IDE Snippet service — the transport layer for the /ide-snippets NestJS
 * endpoints (Brain/api-guide/ide-snippet-api-guide.md). No react-query /
 * UI code in here.
 */
import { API_URL } from "@/lib/auth-client";
import type {
  CreateIdeSnippetInput,
  IdeSnippet,
  IdeSnippetListParams,
  IdeSnippetPage,
  UpdateIdeSnippetPatch,
} from "@/types/ide-snippet.type";

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
      ...(init?.body !== undefined
        ? { "content-type": "application/json" }
        : {}),
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

function listQuerystring(params: IdeSnippetListParams): string {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page));
  qs.set("limit", String(params.limit));
  qs.set("sortBy", params.sortBy);
  qs.set("sortOrder", params.sortOrder);
  if (params.search) qs.set("search", params.search);
  if (params.language) qs.set("language", params.language);
  return qs.toString();
}

/* ------------------------------------------------------------------ */
/* Endpoints                                                           */
/* ------------------------------------------------------------------ */

/** GET /ide-snippets — server-side paginated + filtered list */
export function fetchIdeSnippetPage(
  params: IdeSnippetListParams
): Promise<IdeSnippetPage> {
  return request<IdeSnippetPage>(`/ide-snippets?${listQuerystring(params)}`);
}

/** GET /ide-snippets/:id — 404 when missing or owned by another user */
export function fetchIdeSnippet(id: string): Promise<IdeSnippet> {
  return request<IdeSnippet>(`/ide-snippets/${id}`);
}

/** POST /ide-snippets — language + data required, data verbatim */
export function createIdeSnippet(
  input: CreateIdeSnippetInput
): Promise<IdeSnippet> {
  return request<IdeSnippet>("/ide-snippets", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** PATCH /ide-snippets/:id — partial update; empty patch → 400 */
export function updateIdeSnippet(
  id: string,
  patch: UpdateIdeSnippetPatch
): Promise<IdeSnippet> {
  return request<IdeSnippet>(`/ide-snippets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

/** DELETE /ide-snippets/:id */
export function deleteIdeSnippet(
  id: string
): Promise<{ deleted: boolean; id: string }> {
  return request(`/ide-snippets/${id}`, { method: "DELETE" });
}
