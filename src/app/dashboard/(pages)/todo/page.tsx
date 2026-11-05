"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Plus, RotateCcw, TriangleAlert } from "lucide-react";

import { TodoCard } from "@/components/dashboard/todo/todo-card";
import {
  TodoFormDialog,
  type TodoFormValues,
} from "@/components/dashboard/todo/todo-form-dialog";
import { TodoCardSkeleton } from "@/components/skeletons/todo-card-skeleton";
import { Section, SectionCard } from "@/components/shared/Section";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete";
import { Button } from "@/components/ui/button";
import {
  useCreateTodo,
  useDeleteTodo,
  useReorderTodos,
  useTodosList,
  useUpdateTodo,
  todoKeys,
} from "@/hooks/use-todos";
import type {
  Todo,
  TodoListParams,
  TodoPage,
  UpdateTodoPatch,
} from "@/types/todo.type";

const PAGE_SIZE = 20;

/* The list is always shown in the manual (drag & drop) order. */
const listParams: TodoListParams = {
  page: 1,
  limit: PAGE_SIZE,
  sortBy: "position",
  sortOrder: "asc",
};

/* ================================================================== */

export default function TodoPage() {
  const [page, setPage] = React.useState(1);
  const query = useTodosList({ ...listParams, page });
  const data = query.data;

  const queryClient = useQueryClient();
  const createTodoMutation = useCreateTodo();
  const updateTodoMutation = useUpdateTodo();
  const deleteTodoMutation = useDeleteTodo();
  const reorderMutation = useReorderTodos();

  /* Add / edit dialog state: null = closed. */
  const [dialog, setDialog] = React.useState<
    { mode: "create" } | { mode: "edit"; todo: Todo } | null
  >(null);
  const closeDialog = () => setDialog(null);

  /* Pending destructive action: the todo awaiting its confirm. */
  const [deleteTarget, setDeleteTarget] = React.useState<Todo | null>(null);

  /* DnD sensors ----------------------------------------------------- */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const toggleStatus = (todo: Todo) => {
    updateTodoMutation.mutate({
      id: todo.id,
      patch: { status: todo.status === "done" ? "pending" : "done" },
    });
  };

  const removeTodo = (todo: Todo) => {
    setDeleteTarget(todo);
  };

  /* One-click delete routed through a shared confirm so destructive
   * actions never fire on a stray click. Success closes the dialog. */
  const confirmRemoveTodo = () => {
    if (!deleteTarget) return;
    deleteTodoMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const onDragEnd = (event: DragEndEvent) => {
    if (!data) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = data.items.findIndex((t) => t.id === active.id);
    const newIndex = data.items.findIndex((t) => t.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reorderedItems = arrayMove(data.items, oldIndex, newIndex);
    const offset = (page - 1) * PAGE_SIZE;

    // Optimistic: bake the new absolute positions into the cached page.
    const optimistic: TodoPage = {
      ...data,
      items: reorderedItems.map((todo, index) => ({
        ...todo,
        position: offset + index,
      })),
    };
    queryClient.setQueryData(
      todoKeys.list({ ...listParams, page }),
      optimistic,
    );

    // Send the whole visible page with absolute positions (0 … total − 1),
    // matching the /todos/reorder semantics from the API guide.
    reorderMutation.mutate(
      reorderedItems.map((todo, index) => ({
        id: todo.id,
        position: offset + index,
      })),
    );
  };

  const submitDialog = (values: TodoFormValues) => {
    if (dialog?.mode === "edit") {
      const { title, description, priority, dueDate } = values;
      const patch: UpdateTodoPatch = { title, description, priority, dueDate };
      updateTodoMutation.mutate(
        { id: dialog.todo.id, patch },
        { onSuccess: closeDialog },
      );
    } else {
      createTodoMutation.mutate(values, { onSuccess: closeDialog });
    }
  };

  const dialogBusy =
    dialog?.mode === "edit" ? updateTodoMutation : createTodoMutation;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <Section
        title="Todo"
        description="Drag tasks by the grip handle to reorder them."
        action={
          <>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setDialog({ mode: "create" })}
            >
              <Plus className="size-4" />
              Add todo
            </Button>
            <TodoFormDialog
              open={dialog !== null}
              onOpenChange={(open) => !open && closeDialog()}
              todo={dialog?.mode === "edit" ? dialog.todo : undefined}
              isPending={dialogBusy.isPending}
              error={dialogBusy.error?.message ?? undefined}
              onSubmit={submitDialog}
            />
          </>
        }
        totalItems={data?.total ?? 0}
        pageSize={PAGE_SIZE}
        page={page}
        onPageChange={setPage}
        columns={4}
        emptyState={
          <SectionCard
            title="No tasks yet"
            description="Add your first task with the button above."
            className="justify-center py-8 text-center"
          />
        }
      >
        {query.error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <TriangleAlert className="size-4 shrink-0" />
            <span>
              {(query.error as { message?: string } | null)?.message ??
                "Something went wrong."}
            </span>
            <Button
              variant="ghost"
              size="xs"
              className="ml-auto gap-1.5"
              onClick={() => query.refetch()}
            >
              <RotateCcw className="size-3" />
              Retry
            </Button>
          </div>
        )}

        {query.isPending ? (
          Array.from({ length: 8 }, (_, i) => <TodoCardSkeleton key={i} />)
        ) : (
          <SortableContext
            items={data?.items.map((todo) => todo.id) ?? []}
            strategy={rectSortingStrategy}
          >
            {data?.items.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onToggle={toggleStatus}
                onDelete={removeTodo}
                onEdit={(t) => setDialog({ mode: "edit", todo: t })}
              />
            ))}
          </SortableContext>
        )}
      </Section>

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        label={deleteTarget ? `“${deleteTarget.title}”` : "this task"}
        error={deleteTodoMutation.error?.message}
        isPending={deleteTodoMutation.isPending}
        onSubmit={confirmRemoveTodo}
      />
    </DndContext>
  );
}
