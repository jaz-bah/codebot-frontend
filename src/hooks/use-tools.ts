"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createTool,
  deleteTool,
  fetchToolPage,
  updateTool,
} from "@/services/tool.service";
import type {
  CreateToolInput,
  ToolListParams,
  ToolPage,
  UpdateToolPatch,
} from "@/types/tool.type";

/* ------------------------------------------------------------------ */
/* Query keys                                                          */
/* ------------------------------------------------------------------ */

export const toolKeys = {
  all: () => ["tools"] as const,
  lists: () => ["tools", "list"] as const,
  list: (params: ToolListParams) => ["tools", "list", params] as const,
  detail: (id: string) => ["tools", "detail", id] as const,
};

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

/** Paginated tool list for the current filters/page. */
export function useToolsList(params: ToolListParams) {
  return useQuery({
    queryKey: toolKeys.list(params),
    queryFn: () => fetchToolPage(params),
    // Pages render instantly on page param switches; refetch truth.
    placeholderData: keepPreviousData,
  });
}

export function useCreateTool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateToolInput) => createTool(input),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: toolKeys.lists() });
    },
  });
}

export function useUpdateTool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateToolPatch }) =>
      updateTool(id, patch),
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: toolKeys.lists() });
      queryClient.invalidateQueries({ queryKey: toolKeys.detail(id) });
    },
  });
}

export function useDeleteTool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTool(id),
    // Optimistic: drop the tool from every cached list and decrement
    // the totals so the pager stays in sync with the server.
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: toolKeys.lists() });
      const snapshots = queryClient.getQueriesData<ToolPage>({
        queryKey: toolKeys.lists(),
      });
      for (const [key, page] of snapshots) {
        if (!page) continue;
        const total = Math.max(0, page.total - 1);
        queryClient.setQueryData<ToolPage>(key, {
          ...page,
          items: page.items.filter((tool) => tool.id !== id),
          total,
          totalPages: Math.max(1, Math.ceil(total / (page.limit || 1))),
        });
      }
      // Prune single-tool caches as well.
      queryClient.removeQueries({ queryKey: toolKeys.detail(id) });
      return { snapshots };
    },
    onError: (_error, _id, context) => {
      context?.snapshots.forEach(([key, data]) =>
        queryClient.setQueryData(key, data)
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: toolKeys.lists() });
    },
  });
}
