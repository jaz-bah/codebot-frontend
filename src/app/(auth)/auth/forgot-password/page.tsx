"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import { AuthCard, AuthError, AuthLink, errorMessage } from "@/components/auth/auth-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const [sent, setSent] = React.useState(false)
  const [error, setError] = React.useState("")

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError("")
    setPending(true)
    try {
      const { error: authError } = await authClient.requestPasswordReset({
        email,
        // Runbook: mail link GET redirects to this page with ?token=...
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (authError) {
        setError(errorMessage(authError))
        return
      }
      // Runbook §3.4: always 200 for unknown emails — show generic confirmation.
      setSent(true)
    } catch (caught) {
      setError(errorMessage(caught))
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthCard
      title="Forgot password"
      description={
        sent
          ? undefined
          : "Enter your email and we'll send you a reset link."
      }
    >
      {sent ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            If an account exists for <strong>{email}</strong>, a password reset
            link is on its way. The link is valid for one hour.
          </p>
          <p className="text-center text-sm text-muted-foreground">
            <AuthLink href="/auth/sign-in">Back to sign in</AuthLink>
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          {error && <AuthError message={error} />}
          <Button type="submit" size="lg" disabled={pending} className="mt-1 h-10">
            {pending && <Loader2 className="animate-spin" />}
            {pending ? "Sending…" : "Send reset link"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <AuthLink href="/auth/sign-in">Back to sign in</AuthLink>
          </p>
        </form>
      )}
    </AuthCard>
  )
}
