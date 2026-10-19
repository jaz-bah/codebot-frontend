import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "cn"

/**
 * Minimal wrapper for auth pages: a centered card with a title, optional
 * description and footer content (e.g. "Don't have an account? Sign up").
 */
export function AuthCard({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={cn("w-full max-w-sm py-6", className)}>
      <CardHeader className="text-center">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  )
}

/** Maps better-auth client errors to readable messages. */
export function errorMessage(error: unknown): string {
  if (!error) return ""
  if (typeof error === "string") return error
  const err = error as { message?: string; code?: string; status?: number }
  return err.message ?? `Something went wrong${err.status ? ` (${err.status})` : ""}`
}
