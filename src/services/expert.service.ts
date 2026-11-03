/**
 * Expert service — the transport layer for the /experts NestJS endpoints
 * (Brain/api-guide/expert-api-guide.md). No react-query / UI code in here.
 */
import { API_URL } from "@/lib/auth-client";
import type {
  CreateExpertInput,
  Expert,
  ExpertListParams,
  ExpertPage,
  UpdateExpertPatch,
} from "@/types/expert.type";

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

function listQuerystring(params: ExpertListParams): string {
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

/** GET /experts — server-side paginated + searched list */
export function fetchExpertPage(params: ExpertListParams): Promise<ExpertPage> {
  return request<ExpertPage>(`/experts?${listQuerystring(params)}`);
}

/** POST /experts — title required */
export function createExpert(input: CreateExpertInput): Promise<Expert> {
  return request<Expert>("/experts", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** PATCH /experts/:id — partial update; empty patch → 400 */
export function updateExpert(
  id: string,
  patch: UpdateExpertPatch
): Promise<Expert> {
  return request<Expert>(`/experts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

/** DELETE /experts/:id */
export function deleteExpert(
  id: string
): Promise<{ deleted: boolean; id: string }> {
  return request(`/experts/${id}`, { method: "DELETE" });
}
