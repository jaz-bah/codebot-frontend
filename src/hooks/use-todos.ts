"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createTodo,
  deleteTodo,
  fetchTodoPage,
  reorderTodos,
  updateTodo,
} from "@/services/todo.service";
import type {
  CreateTodoInput,
  TodoListParams,
  TodoPage,
  UpdateTodoPatch,
} from "@/types/todo.type";

/* ------------------------------------------------------------------ */
/* Query keys                                                          */
/* ------------------------------------------------------------------ */

export const todoKeys = {
  all: () => ["todos"] as const,
  lists: () => ["todos", "list"] as const,
  list: (params: TodoListParams) => ["todos", "list", params] as const,
  detail: (id: string) => ["todos", "detail", id] as const,
};

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

/** Paginated todo list for the current filters/page. */
export function useTodosList(params: TodoListParams) {
  return useQuery({
    queryKey: todoKeys.list(params),
    queryFn: () => fetchTodoPage(params),
    // Pages render instantly on filter/page param switches; refetch truth.
    placeholderData: keepPreviousData,
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTodoInput) => createTodo(input),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateTodoPatch }) =>
      updateTodo(id, patch),
    // Optimistic: patch the todo inside every cached list.
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: todoKeys.lists() });
      const snapshots = queryClient.getQueriesData<TodoPage>({
        queryKey: todoKeys.lists(),
      });
      for (const [key, page] of snapshots) {
        if (!page) continue;
        queryClient.setQueryData<TodoPage>(key, {
          ...page,
          items: page.items.map((todo) =>
            todo.id === id ? { ...todo, ...patch } : todo
          ),
        });
      }
      return { snapshots };
    },
    onError: (_error, _variables, context) => {
      context?.snapshots.forEach(([key, data]) =>
        queryClient.setQueryData(key, data)
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    // Optimistic: drop the todo from every cached list and decrement
    // the totals so the pager stays in sync with the server.
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: todoKeys.lists() });
      const snapshots = queryClient.getQueriesData<TodoPage>({
        queryKey: todoKeys.lists(),
      });
      for (const [key, page] of snapshots) {
        if (!page) continue;
        queryClient.setQueryData<TodoPage>(key, {
          ...page,
          items: page.items.filter((todo) => todo.id !== id),
          total: Math.max(0, page.total - 1),
          totalPages: Math.max(1, Math.ceil(Math.max(0, page.total - 1) / (page.limit || 1))),
        });
      }
      // Prune single-todo caches as well.
      queryClient.removeQueries({ queryKey: todoKeys.detail(id) });
      return { snapshots };
    },
    onError: (_error, _id, context) => {
      context?.snapshots.forEach(([key, data]) =>
        queryClient.setQueryData(key, data)
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
}

export function useReorderTodos() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: { id: string; position: number }[]) =>
      reorderTodos(items),
    /**
     * Snapshot + transactional rollback. The caller applies the optimistic
     * ordering to the cache *before* calling `mutate`, so on error we roll
     * back to the last server truth kept behind by `getQueriesData`.
     * onSettled resyncs with the authoritative `order` via refetch.
     */
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: todoKeys.lists() });
      const snapshots = queryClient.getQueriesData<TodoPage>({
        queryKey: todoKeys.lists(),
      });
      return { snapshots };
    },
    onError: (_error, _variables, context) => {
      context?.snapshots.forEach(([key, data]) =>
        queryClient.setQueryData(key, data)
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
}
