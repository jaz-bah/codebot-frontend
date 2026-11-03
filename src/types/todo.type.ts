/**
 * Todo domain types (see Brain/api-guide/todo-api-guide.md).
 * Transport lives in services/todo.service.ts; react-query wiring in
 * hooks/use-todos.ts.
 */

export const TODO_STATUSES = ["pending", "in_progress", "done"] as const;
export type TodoStatus = (typeof TODO_STATUSES)[number];

export const TODO_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type TodoPriority = (typeof TODO_PRIORITIES)[number];

export type Todo = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type TodoSortBy = "createdAt" | "dueDate" | "priority" | "position";
export type TodoSortOrder = "asc" | "desc";

export type TodoListParams = {
  page: number;
  limit: number;
  search?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  sortBy: TodoSortBy;
  sortOrder: TodoSortOrder;
};

export type TodoPage = {
  items: Todo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateTodoInput = {
  title: string;
  priority?: TodoPriority;
};

export type UpdateTodoPatch = Partial<
  Pick<Todo, "title" | "description" | "status" | "priority" | "dueDate" | "position">
>;
