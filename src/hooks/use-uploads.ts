"use client";

import { useMutation } from "@tanstack/react-query";

import { uploadImage } from "@/services/upload.service";

/**
 * Upload hooks. Uploads don't change any queryable server state (they go
 * to the user's own Cloudinary account), so there are no query keys to
 * invalidate — callers consume the returned URL directly.
 */

/** POST /uploads/images — one image file → Cloudinary URL. */
export function useUploadImage() {
  return useMutation({ mutationFn: (file: File) => uploadImage(file) });
}
