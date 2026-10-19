"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

import { AuthCard, errorMessage } from "@/components/auth/auth-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"

function VerifyEmailNotice() {
  const searchParams = useSearchParams()
  const emailFromQuery = searchParams.get("email")

  const [email, setEmail] = React.useState(emailFromQuery ?? "")
  const [pending, setPending] = React.useState(false)
  const [sent, setSent] = React.useState(false)
  const [error, setError] = React.useState("")

  async function resend() {
    setError("")
    setPending(true)
    const { error: authError } = await authClient.sendVerificationEmail({
      email,
      callbackURL: `${window.location.origin}/auth/sign-in`,
    })
    setPending(false)
    if (authError) {
      setError(errorMessage(authError))
      return
    }
    setSent(true)
  }

  return (
    <AuthCard
      title="Verify your email"
      description="Email verification is required before you can sign in. No mail? Resend it below."
    >
      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="button" onClick={resend} disabled={pending || !email}>
        {pending && <Loader2 className="animate-spin" />}
        {sent ? "Sent again" : "Resend verification email"}
      </Button>
      {sent && (
        <p className="text-sm text-muted-foreground">Verification email sent.</p>
      )}
    </AuthCard>
  )
}

export default function VerifyEmailPage() {
  return (
    <React.Suspense>
      <VerifyEmailNotice />
    </React.Suspense>
  )
}
