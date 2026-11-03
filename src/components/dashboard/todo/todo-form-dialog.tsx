"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PRIORITY_LABELS,
} from "@/components/dashboard/todo/priority-meta";
import { isoToLocalInput, localInputToIso } from "@/utils/datetime";
import { TODO_PRIORITIES, type Todo, type TodoPriority } from "@/types/todo.type";
import { cn } from "cn";

/* Native selects (no ui/select wrapper exists yet). */
const selectClass =
  "h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 dark:hover:bg-input/50";

export type TodoFormValues = {
  title: string;
  description: string | null;
  priority: TodoPriority;
  dueDate: string | null;
};

export type TodoFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present in edit mode, absent in create mode. */
  todo?: Todo;
  isPending: boolean;
  error?: string;
  onSubmit: (values: TodoFormValues) => void;
};

/** Add / edit todo modal. Remounts its fields per open so the form is
 * always pristine. */
export function TodoFormDialog({
  open,
  onOpenChange,
  todo,
  isPending,
  error,
  onSubmit,
}: TodoFormDialogProps) {
  const isEdit = Boolean(todo);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Remount per open/todo so the form is always pristine. */}
      {open && (
        <TodoFormFields
          key={todo?.id ?? "create"}
          todo={todo}
          isPending={isPending}
          error={error}
          isEdit={isEdit}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      )}
    </Dialog>
  );
}

function TodoFormFields({
  todo,
  isPending,
  error,
  isEdit,
  onOpenChange,
  onSubmit,
}: {
  todo?: Todo;
  isPending: boolean;
  error?: string;
  isEdit: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TodoFormValues) => void;
}) {
  const [title, setTitle] = React.useState(todo?.title ?? "");
  const [description, setDescription] = React.useState(
    todo?.description ?? ""
  );
  const [priority, setPriority] = React.useState<TodoPriority>(
    todo?.priority ?? "medium"
  );
  const [dueDate, setDueDate] = React.useState(() =>
    isoToLocalInput(todo?.dueDate ?? null)
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || isPending) return;
    const descriptionValue = description.trim();
    onSubmit({
      title: title.trim(),
      description: descriptionValue || null,
      priority,
      dueDate: localInputToIso(dueDate),
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit todo" : "New todo"}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Update the task details below."
            : "Describe the task and set its priority."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="todo-title">Title</Label>
          <Input
            id="todo-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What needs to be done?"
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="todo-description">Description</Label>
          <textarea
            id="todo-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional details…"
            rows={3}
            className="field-sizing-content min-h-16 w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm placeholder:text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="todo-priority">Priority</Label>
            <select
              id="todo-priority"
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as TodoPriority)
              }
              className={cn(selectClass, "w-full")}
            >
              {TODO_PRIORITIES.map((value) => (
                <option key={value} value={value}>
                  {PRIORITY_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="todo-due">Due date</Label>
            <Input
              id="todo-due"
              type="datetime-local"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={!title.trim() || isPending}>
            {isEdit ? "Save changes" : "Add todo"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
