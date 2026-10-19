"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

import { AuthCard, errorMessage } from "@/components/auth/auth-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Runbook §3.4: the backend GET endpoint redirects here with ?token=...
  const token = searchParams.get("token")

  const [password, setPassword] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState("")
  const [done, setDone] = React.useState(false)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError("")
    if (!token) {
      setError("Reset token is missing. Request a new reset link.")
      return
    }
    if (password !== confirm) {
      setError("Passwords don't match.")
      return
    }
    setPending(true)
    const { error: authError } = await authClient.resetPassword({
      newPassword: password,
      token,
    })
    setPending(false)
    if (authError) {
      setError(errorMessage(authError))
      return
    }
    // Runbook: all existing sessions are revoked on success.
    setDone(true)
    router.replace("/auth/sign-in")
  }

  if (!token) {
    return (
      <AuthCard
        title="Reset password"
        description="This reset link is missing its token. Request a fresh link and open it from your email."
      >
        <Link
          href="/auth/forgot-password"
          className="text-center text-sm text-foreground underline-offset-4 hover:underline"
        >
          Request a new reset link
        </Link>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Reset password"
      description="Choose a new password. You will be signed out on all devices."
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="confirm">Confirm new password</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={pending || done}>
          {(pending || done) && <Loader2 className="animate-spin" />}
          {done ? "Password reset" : "Reset password"}
        </Button>
      </form>
    </AuthCard>
  )
}

export default function ResetPasswordPage() {
  // Suspense wrapper required: static prerender + useSearchParams.
  return (
    <React.Suspense>
      <ResetPasswordForm />
    </React.Suspense>
  )
}
