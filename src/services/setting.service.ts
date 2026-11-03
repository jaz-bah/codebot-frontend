/**
 * Setting service — the transport layer for the /settings NestJS endpoints
 * (Brain/api-guide/settings-api-guide.md). No react-query / UI code in here.
 */
import { API_URL } from "@/lib/auth-client";
import type { Settings, SettingsPatch } from "@/types/setting.type";

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

/* ------------------------------------------------------------------ */
/* Endpoints                                                           */
/* ------------------------------------------------------------------ */

/** GET /settings — masked view; null = credential not configured. */
export function fetchSettings(): Promise<Settings> {
  return request<Settings>("/settings");
}

/** PATCH /settings — partial upsert; response is the masked view. */
export function updateSettings(patch: SettingsPatch): Promise<Settings> {
  return request<Settings>("/settings", {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

/** DELETE /settings — wipes the user's singleton settings row. */
export function resetSettings(): Promise<{ reset: boolean }> {
  return request<{ reset: boolean }>("/settings", { method: "DELETE" });
}
