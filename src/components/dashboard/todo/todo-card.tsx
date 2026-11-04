"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays, Circle, CircleCheck, GripVertical, Pencil, Trash2 } from "lucide-react";

import { SectionCard } from "@/components/shared/Section";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/dashboard/posts/share-button";
import {
  PRIORITY_LABELS,
  PRIORITY_STYLES,
} from "@/components/dashboard/todo/priority-meta";
import type { Todo } from "@/types/todo.type";
import { cn } from "cn";

export type TodoCardProps = {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
};

/** One todo as a draggable card in the dashboard grid. */
export function TodoCard({ todo, onToggle, onDelete, onEdit }: TodoCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const isDone = todo.status === "done";
  const due = todo.dueDate ? new Date(todo.dueDate) : null;
  // Captured once per card mount; good enough for "overdue" display and
  // keeps render impurity-free (react-hooks/purity).
  const [now] = React.useState(() => Date.now());
  const isOverdue = !!due && !isDone && due.getTime() < now;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn("group/card h-full", isDragging && "z-10 opacity-70 shadow-md")}
    >
      <SectionCard
        size="sm"
        className={cn(
          "h-full transition-colors duration-200",
          isDone && "opacity-75"
        )}
        title={
          <button
            type="button"
            onClick={() => onEdit(todo)}
            className={cn(
              "block w-full max-w-[calc(100%-1rem)] truncate text-left font-medium hover:underline hover:underline-offset-4",
              isDone && "text-muted-foreground line-through"
            )}
          >
            {todo.title}
          </button>
        }
        action={
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-xs font-medium",
              PRIORITY_STYLES[todo.priority]
            )}
          >
            {PRIORITY_LABELS[todo.priority]}
          </span>
        }
        footer={
          <div className="-mx-2 -my-2 flex flex-wrap items-center gap-1 px-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(event) => {
                event.stopPropagation();
                onToggle(todo);
              }}
              aria-label={isDone ? "Mark as pending" : "Mark as done"}
              className={cn(
                "transition-colors duration-200",
                isDone && "text-success"
              )}
            >
              {isDone ? <CircleCheck /> : <Circle />}
            </Button>
            {due && (
              <span
                className={cn(
                  "flex items-center gap-1 text-xs text-muted-foreground",
                  isOverdue && "font-medium text-destructive"
                )}
              >
                <CalendarDays className="size-3.5" />
                {due.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
            <span className="flex-1" />
            <ShareButton
              resourceType="todo"
              resourceId={todo.id}
              defaultTitle={todo.title}
              size="icon-sm"
              className="text-muted-foreground opacity-0 transition-opacity duration-150 hover:text-foreground group-hover/card:opacity-100 focus-visible:opacity-100"
            />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onEdit(todo)}
              aria-label={`Edit ${todo.title}`}
              className="text-muted-foreground opacity-0 transition-opacity duration-150 group-hover/card:opacity-100 focus-visible:opacity-100"
            >
              <Pencil />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDelete(todo)}
              aria-label={`Delete ${todo.title}`}
              className="text-muted-foreground opacity-0 transition-opacity duration-150 hover:text-destructive group-hover/card:opacity-100 focus-visible:opacity-100"
            >
              <Trash2 />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="cursor-grab touch-none text-muted-foreground"
              aria-label={`Reorder ${todo.title}`}
              {...attributes}
              {...listeners}
            >
              <GripVertical />
            </Button>
          </div>
        }
      >
        <p
          className={cn(
            "line-clamp-3 text-sm whitespace-pre-line text-muted-foreground",
            isDone && "line-through opacity-70"
          )}
        >
          {todo.description?.trim() ? todo.description : "No description."}
        </p>
      </SectionCard>
    </div>
  );
}
