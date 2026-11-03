/**
 * Tool service — the transport layer for the /tools NestJS endpoints
 * (Brain/api-guide/tool-api-guide.md). No react-query / UI code in here.
 */
import { API_URL } from "@/lib/auth-client";
import type {
  CreateToolInput,
  Tool,
  ToolListParams,
  ToolPage,
  UpdateToolPatch,
} from "@/types/tool.type";

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

function listQuerystring(params: ToolListParams): string {
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

/** GET /tools — server-side paginated + searched list */
export function fetchToolPage(params: ToolListParams): Promise<ToolPage> {
  return request<ToolPage>(`/tools?${listQuerystring(params)}`);
}

/** POST /tools — name + downloadLink required */
export function createTool(input: CreateToolInput): Promise<Tool> {
  return request<Tool>("/tools", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** PATCH /tools/:id — partial update; empty patch → 400 */
export function updateTool(
  id: string,
  patch: UpdateToolPatch
): Promise<Tool> {
  return request<Tool>(`/tools/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

/** DELETE /tools/:id */
export function deleteTool(
  id: string
): Promise<{ deleted: boolean; id: string }> {
  return request(`/tools/${id}`, { method: "DELETE" });
}
