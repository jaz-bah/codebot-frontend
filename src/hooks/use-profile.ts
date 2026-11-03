"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteProfileImage,
  fetchProfile,
  rotateNickname,
  updateNickname,
  updateProfileImage,
} from "@/services/profile.service";
import type { ProfilePatch } from "@/types/profile.type";

/* ------------------------------------------------------------------ */
/* Query keys                                                          */
/* ------------------------------------------------------------------ */

export const profileKeys = {
  all: () => ["profile"] as const,
  detail: () => ["profile", "detail"] as const,
};

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

/** The signed-in user's profile (nickname + live content counts). */
export function useProfile() {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: () => fetchProfile(),
  });
}

/** Claim a custom nickname — ApiError with status 409 when it's taken. */
export function useUpdateNickname() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: ProfilePatch) => updateNickname(patch),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
    },
  });
}

/** Discard the current auto-generated handle, mint a fresh one. */
export function useRotateNickname() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => rotateNickname(),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
    },
  });
}

/** PATCH /profile/image — upload a new profile image (multipart file). The
 * returned view re-reads the user row, so the cache is never stale. */
export function useUpdateProfileImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => updateProfileImage(file),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
    },
  });
}

/** DELETE /profile/image — clear the profile image. */
export function useDeleteProfileImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteProfileImage(),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
    },
  });
}
