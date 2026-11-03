"use client"

import * as React from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"

import { AuthCard, AuthError, errorMessage } from "@/components/auth/auth-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { authClient } from "@/lib/auth-client"

export default function SignUpPage() {
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const [socialPending, setSocialPending] = React.useState<string | null>(null)
  const [error, setError] = React.useState("")
  const [checkInbox, setCheckInbox] = React.useState(false)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError("")
    setPending(true)
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
    setPending(false)
    if (authError) {
      setError(errorMessage(authError))
      return
    }
    setCheckInbox(true)
  }

  async function onSocial(provider: "google" | "github") {
    setError("")
    setSocialPending(provider)
    const { data, error: authError } = await authClient.signIn.social({
      provider,
      callbackURL: "/dashboard",
    })
    setSocialPending(null)
    if (authError) {
      setError(errorMessage(authError))
      return
    }
    if (data?.redirect && data.url) {
      window.location.href = data.url
    }
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
        <Button
          variant="outline"
          type="button"
          onClick={async () => {
            await authClient.sendVerificationEmail({
              email,
              callbackURL: `${window.location.origin}/auth/sign-in`,
            })
          }}
        >
          Resend verification email
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already verified?{" "}
          <Link
            href="/auth/sign-in"
            className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Sign in
          </Link>
        </p>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Create your account"
      description="Sign up with a provider, or use email + password."
    >
      <div className="grid gap-2 sm:grid-cols-2">
        <Button
          variant="outline"
          type="button"
          disabled={socialPending !== null}
          onClick={() => onSocial("google")}
        >
          {socialPending === "google" && <Loader2 className="animate-spin" />}
          Google
        </Button>
        <Button
          variant="outline"
          type="button"
          disabled={socialPending !== null}
          onClick={() => onSocial("github")}
        >
          {socialPending === "github" && <Loader2 className="animate-spin" />}
          GitHub
        </Button>
      </div>
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
        <Button type="submit" size="lg" disabled={pending}>
          {pending && <Loader2 className="animate-spin" />}
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/auth/sign-in"
          className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  )
}
