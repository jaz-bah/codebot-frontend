"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import { AuthCard, AuthError, AuthLink, AuthSocialButtons, errorMessage } from "@/components/auth/auth-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { authClient } from "@/lib/auth-client"
import { beginSocialSignIn } from "@/lib/social-start"

export default function SignUpPage() {
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const [socialPending, setSocialPending] = React.useState<string | null>(null)
  const [error, setError] = React.useState("")
  const [checkInbox, setCheckInbox] = React.useState(false)
  const [resent, setResent] = React.useState(false)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError("")
    setPending(true)
    try {
      // Runbook §3.1: sign-up issues NO session; a verification mail goes out.
      const { error: authError } = await authClient.signUp.email({
        name,
        email,
        password,
        // After the verify-email link is clicked, BetterAuth redirects here.
        // Must be an ABSOLUTE frontend URL — a relative value ("/" by default)
        // resolves against the BACKEND origin (NestJS root → 404 Cannot GET /).
        callbackURL: `${window.location.origin}/auth/sign-in`,
      })
      if (authError) {
        setError(errorMessage(authError))
        return
      }
      setCheckInbox(true)
    } catch (caught) {
      setError(errorMessage(caught))
    } finally {
      setPending(false)
    }
  }

  function onSocial(provider: "google" | "github") {
    setError("")
    setSocialPending(provider)
    // Full-page navigation (GET bridge) — survives Render's Cloudflare edge
    // challenging the request (the old XHR POST died with a 429 there).
    beginSocialSignIn(provider)
  }

  if (checkInbox) {
    // Runbook §5: after sign-up don't poll — show "check your inbox". The
    // verify link signs the user in automatically on its callback.
    return (
      <AuthCard
        title="Check your inbox"
        description={`We sent a verification link to ${email}. Open it to activate your account — you'll be signed in automatically.`}
      >
        {error && <AuthError message={error} />}
        {resent && (
          <p role="status" className="text-sm text-muted-foreground">
            Verification email sent.
          </p>
        )}
        <Button
          variant="outline"
          type="button"
          className="h-10"
          onClick={async () => {
            setError("")
            setResent(false)
            try {
              await authClient.sendVerificationEmail({
                email,
                callbackURL: `${window.location.origin}/auth/sign-in`,
              })
              setResent(true)
            } catch (caught) {
              setError(errorMessage(caught))
            }
          }}
        >
          Resend verification email
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already verified? <AuthLink href="/auth/sign-in">Sign in</AuthLink>
        </p>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Create your account"
      description="Sign up with a provider, or use email + password."
    >
      <AuthSocialButtons
        pending={socialPending}
        onSelect={(provider) => onSocial(provider)}
      />
      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            autoComplete="name"
            autoFocus
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        {error && <AuthError message={error} />}
        <Button type="submit" size="lg" disabled={pending} className="mt-1 h-10">
          {pending && <Loader2 className="animate-spin" />}
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account? <AuthLink href="/auth/sign-in">Sign in</AuthLink>
      </p>
    </AuthCard>
  )
}
