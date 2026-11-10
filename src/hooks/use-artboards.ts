"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createArtboard,
  deleteArtboard,
  fetchArtboardPage,
  updateArtboard,
} from "@/services/artboard.service";
import type {
  ArtboardListParams,
  CreateArtboardInput,
  UpdateArtboardPatch,
} from "@/types/artboard.type";

/* ------------------------------------------------------------------ */
/* Query keys                                                          */
/* ------------------------------------------------------------------ */

export const artboardKeys = {
  all: () => ["artboards"] as const,
  list: (params: ArtboardListParams) =>
    ["artboards", "list", params] as const,
};

/* ------------------------------------------------------------------ */
/* Queries                                                             */
/* ------------------------------------------------------------------ */

/** Paginated artboard index (rows carry the full drawing content). */
export function useArtboardsList(params: ArtboardListParams) {
  return useQuery({
    queryKey: artboardKeys.list(params),
    queryFn: () => fetchArtboardPage(params),
  });
}

/* ------------------------------------------------------------------ */
/* Mutations                                                           */
/* ------------------------------------------------------------------ */

function invalidateLists(queryClient: ReturnType<typeof useQueryClient>) {
  // Broad list invalidation: create/rename/delete change every page of
  // every search/sort shape.
  queryClient.invalidateQueries({ queryKey: artboardKeys.all() });
}

/** Create an artboard (select it via the returned row). */
export function useCreateArtboard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateArtboardInput) => createArtboard(input),
    onSettled: () => invalidateLists(queryClient),
  });
}

/**
 * Rename and/or replace the drawing. Content edits stay authoritative in
 * page-level drafts; this just persists and refreshes the lists.
 */
export function useUpdateArtboard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateArtboardPatch }) =>
      updateArtboard(id, patch),
    onSettled: () => invalidateLists(queryClient),
  });
}

/** Delete an artboard. Callers drop the selection if it pointed at it. */
export function useDeleteArtboard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteArtboard(id),
    onSettled: () => invalidateLists(queryClient),
  });
}
