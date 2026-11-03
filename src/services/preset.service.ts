/**
 * Preset service — the transport layer for the /presets NestJS endpoints
 * (Brain/api-guide/preset-api-guide.md). No react-query / UI code in here.
 */
import { API_URL } from "@/lib/auth-client";
import type {
  CreatePresetInput,
  Preset,
  PresetListParams,
  PresetPage,
  UpdatePresetPatch,
} from "@/types/preset.type";

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

function listQuerystring(params: PresetListParams): string {
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

/** GET /presets — server-side paginated + filtered list */
export function fetchPresetPage(params: PresetListParams): Promise<PresetPage> {
  return request<PresetPage>(`/presets?${listQuerystring(params)}`);
}

/** GET /presets/:id — 404 when missing or owned by another user */
export function fetchPreset(id: string): Promise<Preset> {
  return request<Preset>(`/presets/${id}`);
}

/** POST /presets — name + language + data required, data verbatim */
export function createPreset(input: CreatePresetInput): Promise<Preset> {
  return request<Preset>("/presets", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** PATCH /presets/:id — partial update; empty patch → 400 */
export function updatePreset(
  id: string,
  patch: UpdatePresetPatch
): Promise<Preset> {
  return request<Preset>(`/presets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

/** DELETE /presets/:id */
export function deletePreset(
  id: string
): Promise<{ deleted: boolean; id: string }> {
  return request(`/presets/${id}`, { method: "DELETE" });
}
