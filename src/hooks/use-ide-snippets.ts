"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createIdeSnippet,
  deleteIdeSnippet,
  fetchIdeSnippetPage,
  updateIdeSnippet,
} from "@/services/ide-snippet.service";
import type {
  CreateIdeSnippetInput,
  IdeSnippetListParams,
  IdeSnippetPage,
  UpdateIdeSnippetPatch,
} from "@/types/ide-snippet.type";

/* ------------------------------------------------------------------ */
/* Query keys                                                          */
/* ------------------------------------------------------------------ */

export const ideSnippetKeys = {
  all: () => ["ide-snippets"] as const,
  lists: () => ["ide-snippets", "list"] as const,
  list: (params: IdeSnippetListParams) =>
    ["ide-snippets", "list", params] as const,
  detail: (id: string) => ["ide-snippets", "detail", id] as const,
};

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

/** Paginated snippet list for the current filters/page. */
export function useIdeSnippetsList(params: IdeSnippetListParams) {
  return useQuery({
    queryKey: ideSnippetKeys.list(params),
    queryFn: () => fetchIdeSnippetPage(params),
    // Pages render instantly on page param switches; refetch truth.
    placeholderData: keepPreviousData,
  });
}

export function useCreateIdeSnippet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateIdeSnippetInput) => createIdeSnippet(input),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ideSnippetKeys.lists() });
    },
  });
}

export function useUpdateIdeSnippet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateIdeSnippetPatch }) =>
      updateIdeSnippet(id, patch),
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: ideSnippetKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ideSnippetKeys.detail(id) });
    },
  });
}

export function useDeleteIdeSnippet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteIdeSnippet(id),
    // Optimistic: drop the snippet from every cached list and decrement
    // the totals so the pager stays in sync with the server.
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ideSnippetKeys.lists() });
      const snapshots = queryClient.getQueriesData<IdeSnippetPage>({
        queryKey: ideSnippetKeys.lists(),
      });
      for (const [key, page] of snapshots) {
        if (!page) continue;
        const total = Math.max(0, page.total - 1);
        queryClient.setQueryData<IdeSnippetPage>(key, {
          ...page,
          items: page.items.filter((snippet) => snippet.id !== id),
          total,
          totalPages: Math.max(1, Math.ceil(total / (page.limit || 1))),
        });
      }
      // Prune single-snippet caches as well.
      queryClient.removeQueries({ queryKey: ideSnippetKeys.detail(id) });
      return { snapshots };
    },
    onError: (_error, _id, context) => {
      context?.snapshots.forEach(([key, data]) =>
        queryClient.setQueryData(key, data)
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ideSnippetKeys.lists() });
    },
  });
}
