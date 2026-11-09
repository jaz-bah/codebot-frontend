"use client"

import { Trash2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

/**
 * Shared delete-confirmation dialog. Used by every list page (todos,
 * files, components, experts, tools) — the `label` prop names the item so
 * the confirmation line reads "Delete <label>?".
 *
 * The parent owns the delete target and mutation state; this component
 * only renders the confirm/cancel chrome.
 */
export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  label,
  consequence,
  error,
  isPending,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  label: React.ReactNode
  consequence?: React.ReactNode
  error?: string
  isPending?: boolean
  onSubmit: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="size-4 text-destructive" />
            Delete {label}?
          </DialogTitle>
          <DialogDescription>
            {consequence ?? "This action cannot be undone. The item will be permanently removed."}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onSubmit}
            disabled={isPending}
          >
            {isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}