/**
 * Artboard service — transport for the /artboards NestJS endpoints.
 * No react-query / UI code in here.
 */
import { API_URL } from "@/lib/auth-client";
import type {
  Artboard,
  ArtboardListParams,
  ArtboardPage,
  CreateArtboardInput,
  UpdateArtboardPatch,
} from "@/types/artboard.type";

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

function listQuerystring(params: ArtboardListParams): string {
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

/** GET /artboards — server-side paginated list (search + sort). */
export function fetchArtboardPage(
  params: ArtboardListParams
): Promise<ArtboardPage> {
  return request<ArtboardPage>(`/artboards?${listQuerystring(params)}`);
}

/** GET /artboards/:id — one artboard (content stored verbatim). */
export function fetchArtboard(id: string): Promise<Artboard> {
  return request<Artboard>(`/artboards/${id}`);
}

/** POST /artboards — create with a title (content defaults to ""). */
export function createArtboard(input: CreateArtboardInput): Promise<Artboard> {
  return request<Artboard>("/artboards", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** PATCH /artboards/:id — rename and/or replace the drawing. */
export function updateArtboard(
  id: string,
  patch: UpdateArtboardPatch
): Promise<Artboard> {
  return request<Artboard>(`/artboards/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

/** DELETE /artboards/:id */
export function deleteArtboard(
  id: string
): Promise<{ deleted: boolean; id: string }> {
  return request(`/artboards/${id}`, { method: "DELETE" });
}
