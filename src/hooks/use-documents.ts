"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createDocument,
  deleteDocument,
  fetchDocumentPage,
  updateDocument,
} from "@/services/document.service";
import type {
  DocumentListParams,
  DocumentPage,
  CreateDocumentInput,
  UpdateDocumentPatch,
} from "@/types/document.type";

/* ------------------------------------------------------------------ */
/* Query keys                                                          */
/* ------------------------------------------------------------------ */

export const documentKeys = {
  all: () => ["documents"] as const,
  lists: () => ["documents", "list"] as const,
  list: (params: DocumentListParams) =>
    ["documents", "list", params] as const,
  detail: (id: string) => ["documents", "detail", id] as const,
};

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

/** Paginated document list for the current filters/page. */
export function useDocumentsList(params: DocumentListParams) {
  return useQuery({
    queryKey: documentKeys.list(params),
    queryFn: () => fetchDocumentPage(params),
    // Pages render instantly on page/search switches; refetch truth.
    placeholderData: keepPreviousData,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDocumentInput) => createDocument(input),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateDocumentPatch }) =>
      updateDocument(id, patch),
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(id) });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    // Optimistic: drop the document from every cached list and decrement
    // the totals so the pager stays in sync with the server.
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: documentKeys.lists() });
      const snapshots = queryClient.getQueriesData<DocumentPage>({
        queryKey: documentKeys.lists(),
      });
      for (const [key, page] of snapshots) {
        if (!page) continue;
        const total = Math.max(0, page.total - 1);
        queryClient.setQueryData<DocumentPage>(key, {
          ...page,
          items: page.items.filter((document) => document.id !== id),
          total,
          totalPages: Math.max(1, Math.ceil(total / (page.limit || 1))),
        });
      }
      // Prune single-document caches as well.
      queryClient.removeQueries({ queryKey: documentKeys.detail(id) });
      return { snapshots };
    },
    onError: (_error, _id, context) => {
      context?.snapshots.forEach(([key, data]) =>
        queryClient.setQueryData(key, data)
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
  });
}
