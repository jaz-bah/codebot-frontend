/**
 * Uploads service — the transport layer for the /uploads NestJS endpoints
 * (Brain/api-guide/uploads-api-guide.md). Files go straight to the user's
 * own Cloudinary account; the Cloudinary URL comes back to the caller and
 * nothing is persisted in our database. No react-query / UI code in here.
 */
import { API_URL } from "@/lib/auth-client";

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
async function requestMultipart<T>(
  path: string,
  formData: FormData
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    // Session is an httpOnly cookie on the backend origin.
    credentials: "include",
    method: "POST",
    body: formData,
    // Never set content-type by hand — the browser adds the boundary.
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
/* Images — POST /uploads/images                                       */
/* ------------------------------------------------------------------ */

/** Cloudinary image URL payload (same shape for every upload endpoint). */
export type UploadResult = {
  url: string;
  publicId: string;
  resourceType: string;
  format: string;
  bytes: number;
  filename: string;
};

/** Server limit for POST /uploads/images (10 MB, enforced via 413). */
export const IMAGE_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

/** Extensions the backend accepts (detected from magic bytes, not the
 * client-supplied mimetype — this list is only a client-side pre-filter). */
export const IMAGE_UPLOAD_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
] as const;

/** POST /uploads/images — multipart field `file`, single image. */
export function uploadImage(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.set("file", file, file.name);
  return requestMultipart<UploadResult>("/uploads/images", formData);
}
