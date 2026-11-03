"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createExpert,
  deleteExpert,
  fetchExpertPage,
  updateExpert,
} from "@/services/expert.service";
import type {
  ExpertListParams,
  ExpertPage,
  CreateExpertInput,
  UpdateExpertPatch,
} from "@/types/expert.type";

/* ------------------------------------------------------------------ */
/* Query keys                                                          */
/* ------------------------------------------------------------------ */

export const expertKeys = {
  all: () => ["experts"] as const,
  lists: () => ["experts", "list"] as const,
  list: (params: ExpertListParams) => ["experts", "list", params] as const,
  detail: (id: string) => ["experts", "detail", id] as const,
};

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

/** Paginated expert list for the current filters/page. */
export function useExpertsList(params: ExpertListParams) {
  return useQuery({
    queryKey: expertKeys.list(params),
    queryFn: () => fetchExpertPage(params),
    // Pages render instantly on page param switches; refetch truth.
    placeholderData: keepPreviousData,
  });
}

export function useCreateExpert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExpertInput) => createExpert(input),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: expertKeys.lists() });
    },
  });
}

export function useUpdateExpert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateExpertPatch }) =>
      updateExpert(id, patch),
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: expertKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expertKeys.detail(id) });
    },
  });
}

export function useDeleteExpert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExpert(id),
    // Optimistic: drop the expert from every cached list and decrement
    // the totals so the pager stays in sync with the server.
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: expertKeys.lists() });
      const snapshots = queryClient.getQueriesData<ExpertPage>({
        queryKey: expertKeys.lists(),
      });
      for (const [key, page] of snapshots) {
        if (!page) continue;
        const total = Math.max(0, page.total - 1);
        queryClient.setQueryData<ExpertPage>(key, {
          ...page,
          items: page.items.filter((expert) => expert.id !== id),
          total,
          totalPages: Math.max(1, Math.ceil(total / (page.limit || 1))),
        });
      }
      // Prune single-expert caches as well.
      queryClient.removeQueries({ queryKey: expertKeys.detail(id) });
      return { snapshots };
    },
    onError: (_error, _id, context) => {
      context?.snapshots.forEach(([key, data]) =>
        queryClient.setQueryData(key, data)
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: expertKeys.lists() });
    },
  });
}
