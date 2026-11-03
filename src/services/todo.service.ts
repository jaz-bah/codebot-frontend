/**
 * Todo service — the transport layer for the /todos NestJS endpoints
 * (Brain/api-guide/todo-api-guide.md). No react-query / UI code in here.
 */
import { API_URL } from "@/lib/auth-client";
import type {
  CreateTodoInput,
  Todo,
  TodoListParams,
  TodoPage,
  UpdateTodoPatch,
} from "@/types/todo.type";

/* ------------------------------------------------------------------ */
/* Transport                                                           */
/* ------------------------------------------------------------------ */

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Backend returns a uniform error envelope: { statusCode, message, ... } */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    // Session is an httpOnly cookie on the backend origin.
    credentials: "include",
    ...init,
    headers: {
      ...(init?.body !== undefined
        ? { "content-type": "application/json" }
        : {}),
      ...init?.headers,
    },
  });

  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      res.status,
      typeof payload?.message === "string"
        ? payload.message
        : `Request failed (${res.status})`
    );
  }
  return payload as T;
}

function listQuerystring(params: TodoListParams): string {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page));
  qs.set("limit", String(params.limit));
  qs.set("sortBy", params.sortBy);
  qs.set("sortOrder", params.sortOrder);
  if (params.search) qs.set("search", params.search);
  if (params.status) qs.set("status", params.status);
  if (params.priority) qs.set("priority", params.priority);
  return qs.toString();
}

/* ------------------------------------------------------------------ */
/* Endpoints                                                           */
/* ------------------------------------------------------------------ */

/** GET /todos — server-side paginated list */
export function fetchTodoPage(params: TodoListParams): Promise<TodoPage> {
  return request<TodoPage>(`/todos?${listQuerystring(params)}`);
}

/** POST /todos — created todo is appended at the end when position omitted */
export function createTodo(input: CreateTodoInput): Promise<Todo> {
  return request<Todo>("/todos", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** PATCH /todos/:id — partial update */
export function updateTodo(
  id: string,
  patch: UpdateTodoPatch
): Promise<Todo> {
  return request<Todo>(`/todos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

/** PATCH /todos/reorder — manual ordering; positions are 0-based,
 * gap-free, unique. Subset reorder (e.g. one page) is supported. */
export function reorderTodos(
  items: { id: string; position: number }[]
): Promise<{ reordered: number; order: string[] }> {
  return request("/todos/reorder", {
    method: "PATCH",
    body: JSON.stringify({ items }),
  });
}

/** DELETE /todos/:id — remaining positions compacted server-side */
export function deleteTodo(id: string): Promise<{ deleted: boolean; id: string }> {
  return request(`/todos/${id}`, { method: "DELETE" });
}
