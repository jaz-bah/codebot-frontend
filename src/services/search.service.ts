/**
 * Search service — transport for the workspace-wide `GET /search`
 * endpoint (Brain/api-guide/search-api-guide.md). No react-query / UI
 * code in here.
 */
import { API_URL } from "@/lib/auth-client";
import type { SearchParams, SearchResponse } from "@/types/search.type";

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
async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    // Session is an httpOnly cookie on the backend origin.
    credentials: "include",
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

/* ------------------------------------------------------------------ */
/* Endpoints                                                           */
/* ------------------------------------------------------------------ */

/** GET /search?q=…&limit=… — merged, newest-first hits across scopes.
 * `@scope` tokens ride inside `q` (URL-encoded `@` is fine via
 * URLSearchParams). Errors surface verbatim (400 scope/query problems). */
export async function fetchSearch(params: SearchParams): Promise<SearchResponse> {
  const qs = new URLSearchParams();
  qs.set("q", params.q);
  if (params.limit !== undefined) {
    qs.set("limit", String(params.limit));
  }
  return request<SearchResponse>(`/search?${qs.toString()}`);
}
