/**
 * Profile service — the transport layer for the /profile NestJS endpoints
 * (Brain/api-guide/profile-api-guide.md). No react-query / UI code in here.
 */
import { API_URL } from "@/lib/auth-client";
import type { Profile, ProfilePatch } from "@/types/profile.type";

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

/** Multipart transport — never set content-type by hand; the browser adds
 * the boundary (same pattern as the /uploads service). */
async function requestMultipart<T>(
  path: string,
  method: "PATCH",
  formData: FormData
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    // Session is an httpOnly cookie on the backend origin.
    credentials: "include",
    method,
    body: formData,
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

/** GET /profile — lazily creates the row on first call; handle + counts. */
export function fetchProfile(): Promise<Profile> {
  return request<Profile>("/profile");
}

/** PATCH /profile — claim a custom nickname; 409 when taken. */
export function updateNickname(patch: ProfilePatch): Promise<Profile> {
  return request<Profile>("/profile", {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

/** POST /profile/nickname/rotate — discard the handle, mint a fresh one. */
export function rotateNickname(): Promise<Profile> {
  return request<Profile>("/profile/nickname/rotate", { method: "POST" });
}

/* ------------------------------------------------------------------ */
/* Profile image (PATCH/DELETE /profile/image)                         */
/* ------------------------------------------------------------------ */

/** Server limit for PATCH /profile/image — mirrors the /uploads images cap
 * (10 MB, 413 above it; actual type validation is magic bytes server-side). */
export const PROFILE_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

/** PATCH /profile/image — multipart field `file`, jpg/png/webp/gif ≤ 10 MB.
 * Uploaded through the same per-user Cloudinary pipeline as /uploads; the
 * URL is persisted on the auth user and the fresh profile view is returned. */
export function updateProfileImage(file: File): Promise<Profile> {
  const formData = new FormData();
  formData.set("file", file, file.name);
  return requestMultipart<Profile>("/profile/image", "PATCH", formData);
}

/** DELETE /profile/image — clears the image; returns the fresh profile view. */
export function deleteProfileImage(): Promise<Profile> {
  return request<Profile>("/profile/image", { method: "DELETE" });
}
