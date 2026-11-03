/**
 * Components service — the transport layer for the /components NestJS
 * endpoints (Brain/api-guide/components-api-guide.md). No react-query /
 * UI code in here.
 */
import { API_URL } from "@/lib/auth-client";
import type {
  Component,
  ComponentListParams,
  ComponentPage,
  CreateComponentInput,
  DeleteComponentResult,
  UpdateComponentPatch,
} from "@/types/component.type";

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

function listQuerystring(params: ComponentListParams): string {
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

/** GET /components — paginated, every component with its full files array */
export function fetchComponentPage(
  params: ComponentListParams
): Promise<ComponentPage> {
  return request<ComponentPage>(`/components?${listQuerystring(params)}`);
}

/** GET /components/:id — one component with its files (404 if not owned) */
export function fetchComponent(id: string): Promise<Component> {
  return request<Component>(`/components/${id}`);
}

/** POST /components — creates metadata + all file rows in one transaction;
 * `code` is stored verbatim, files keep payload order. */
export function createComponent(input: CreateComponentInput): Promise<Component> {
  return request<Component>("/components", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** PATCH /components/:id — partial patch; `files` present = full file-set
 * replacement, omitted = files untouched. Empty patch → 400. */
export function updateComponent(
  id: string,
  patch: UpdateComponentPatch
): Promise<Component> {
  return request<Component>(`/components/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

/** DELETE /components/:id — cascades to all component files. */
export function deleteComponent(
  id: string
): Promise<DeleteComponentResult> {
  return request(`/components/${id}`, { method: "DELETE" });
}
