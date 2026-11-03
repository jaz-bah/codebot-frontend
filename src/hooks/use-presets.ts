"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createPreset,
  deletePreset,
  fetchPresetPage,
  updatePreset,
} from "@/services/preset.service";
import type {
  CreatePresetInput,
  PresetListParams,
  PresetPage,
  UpdatePresetPatch,
} from "@/types/preset.type";

/* ------------------------------------------------------------------ */
/* Query keys                                                          */
/* ------------------------------------------------------------------ */

export const presetKeys = {
  all: () => ["presets"] as const,
  lists: () => ["presets", "list"] as const,
  list: (params: PresetListParams) => ["presets", "list", params] as const,
  detail: (id: string) => ["presets", "detail", id] as const,
};

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

/** Paginated preset list for the current filters/page. */
export function usePresetsList(params: PresetListParams) {
  return useQuery({
    queryKey: presetKeys.list(params),
    queryFn: () => fetchPresetPage(params),
    // Pages render instantly on page param switches; refetch truth.
    placeholderData: keepPreviousData,
  });
}

export function useCreatePreset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePresetInput) => createPreset(input),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: presetKeys.lists() });
    },
  });
}

export function useUpdatePreset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdatePresetPatch }) =>
      updatePreset(id, patch),
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: presetKeys.lists() });
      queryClient.invalidateQueries({ queryKey: presetKeys.detail(id) });
    },
  });
}

export function useDeletePreset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePreset(id),
    // Optimistic: drop the preset from every cached list and decrement
    // the totals so the pager stays in sync with the server.
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: presetKeys.lists() });
      const snapshots = queryClient.getQueriesData<PresetPage>({
        queryKey: presetKeys.lists(),
      });
      for (const [key, page] of snapshots) {
        if (!page) continue;
        const total = Math.max(0, page.total - 1);
        queryClient.setQueryData<PresetPage>(key, {
          ...page,
          items: page.items.filter((preset) => preset.id !== id),
          total,
          totalPages: Math.max(1, Math.ceil(total / (page.limit || 1))),
        });
      }
      // Prune single-preset caches as well.
      queryClient.removeQueries({ queryKey: presetKeys.detail(id) });
      return { snapshots };
    },
    onError: (_error, _id, context) => {
      context?.snapshots.forEach(([key, data]) =>
        queryClient.setQueryData(key, data)
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: presetKeys.lists() });
    },
  });
}
