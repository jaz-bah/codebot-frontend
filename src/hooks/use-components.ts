"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createComponent,
  deleteComponent,
  fetchComponent,
  fetchComponentPage,
  updateComponent,
} from "@/services/component.service";
import type {
  ComponentListParams,
  ComponentPage,
  CreateComponentInput,
  UpdateComponentPatch,
} from "@/types/component.type";

/* ------------------------------------------------------------------ */
/* Query keys                                                          */
/* ------------------------------------------------------------------ */

export const componentKeys = {
  all: () => ["components"] as const,
  lists: () => ["components", "list"] as const,
  list: (params: ComponentListParams) => ["components", "list", params] as const,
  detail: (id: string) => ["components", "detail", id] as const,
};

/* ------------------------------------------------------------------ */
/* Queries                                                             */
/* ------------------------------------------------------------------ */

/** Paginated component list for the current filters/page (files included). */
export function useComponentsList(params: ComponentListParams) {
  return useQuery({
    queryKey: componentKeys.list(params),
    queryFn: () => fetchComponentPage(params),
    // Pages render instantly on page param switches; refetch truth.
    placeholderData: keepPreviousData,
  });
}

/** One component with its files. Pass "" to disable until an id exists. */
export function useComponentDetail(id: string) {
  return useQuery({
    queryKey: componentKeys.detail(id),
    queryFn: () => fetchComponent(id),
    enabled: id !== "",
    // Drafts live in page state; a re-mount within staleTime is free.
    staleTime: 60_000,
  });
}

/* ------------------------------------------------------------------ */
/* Mutations                                                           */
/* ------------------------------------------------------------------ */

/** Create a component (metadata + files in one transaction). */
export function useCreateComponent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateComponentInput) => createComponent(input),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: componentKeys.lists() });
    },
  });
}

/** Patch metadata and/or replace the whole file set. */
export function useUpdateComponent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateComponentPatch }) =>
      updateComponent(id, patch),
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: componentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: componentKeys.detail(id) });
    },
  });
}

/**
 * Delete a component (files cascade server-side). Optimistic: drop the
 * component from every cached list and decrement the totals so the pager
 * stays in sync with the server.
 */
export function useDeleteComponent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteComponent(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: componentKeys.lists() });
      const snapshots = queryClient.getQueriesData<ComponentPage>({
        queryKey: componentKeys.lists(),
      });
      for (const [key, page] of snapshots) {
        if (!page) continue;
        const total = Math.max(0, page.total - 1);
        queryClient.setQueryData<ComponentPage>(key, {
          ...page,
          items: page.items.filter((component) => component.id !== id),
          total,
          totalPages: Math.max(1, Math.ceil(total / (page.limit || 1))),
        });
      }
      // Prune the single-component cache too (the id no longer resolves).
      queryClient.removeQueries({ queryKey: componentKeys.detail(id) });
      return { snapshots };
    },
    onError: (_error, _id, context) => {
      context?.snapshots.forEach(([key, data]) =>
        queryClient.setQueryData(key, data)
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: componentKeys.lists() });
    },
  });
}
