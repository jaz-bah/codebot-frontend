"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { AuthCard, AuthError, AuthLink, AuthSocialButtons, errorMessage } from "@/components/auth/auth-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { authClient } from "@/lib/auth-client"

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const [socialPending, setSocialPending] = React.useState<string | null>(null)
  const [error, setError] = React.useState("")
  const [needsVerification, setNeedsVerification] = React.useState(false)
  const [resent, setResent] = React.useState(false)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError("")
    setResent(false)
    setPending(true)
    try {
      const { error: authError } = await authClient.signIn.email({
        email,
        password,
        // Must be an ABSOLUTE frontend URL — a relative value resolves against
        // the BACKEND origin and lands users on codebot-backend-aued.onrender.com.
        callbackURL: `${window.location.origin}/dashboard`,
      })

      if (authError) {
        const message = errorMessage(authError)
        // Runbook §6: 403 EMAIL_NOT_VERIFIED → verification screen with resend.
        const status = (authError as { status?: number }).status
        const notVerified =
          status === 403 && /verif/i.test(message || String((authError as { code?: string }).code))
        if (notVerified || /EMAIL_NOT_VERIFIED/i.test(String((authError as { code?: string }).code ?? message))) {
          setNeedsVerification(true)
        } else {
          setError(message)
        }
        return
      }
      // Already signed in: landing page calls get-session → session established.
      router.replace("/dashboard")
    } catch (caught) {
      // Transport failures reject instead of returning `{ error }`.
      setError(errorMessage(caught))
    } finally {
      setPending(false)
    }
  }

  async function onSocial(provider: "google" | "github") {
    setError("")
    setSocialPending(provider)
    try {
      const { data, error: authError } = await authClient.signIn.social({
        provider,
        // Must be an ABSOLUTE frontend URL — a relative value resolves against
        // the BACKEND origin and lands users on codebot-backend-aued.onrender.com.
        callbackURL: `${window.location.origin}/dashboard`,
        newUserCallbackURL: `${window.location.origin}/auth/sign-up`,
        errorCallbackURL: `${window.location.origin}/auth/sign-in`,
      })
      if (authError) {
        setError(errorMessage(authError))
        return
      }
      // Runbook §3.3: client receives { url, redirect: true }; redirect manually.
      if (data?.redirect && data.url) {
        window.location.href = data.url
      }
    } catch (caught) {
      setError(errorMessage(caught))
    } finally {
      setSocialPending(null)
    }
  }

  async function resendVerification() {
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
  }

  return (
    <AuthCard
      title="Sign in"
      description="Enter your credentials to access your account."
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

      {needsVerification ? (
        <div className="flex flex-col gap-2 text-sm">
          <p className="text-foreground">
            Your email isn&apos;t verified yet. Check your inbox for the
            verification link.
          </p>
          <Button type="button" variant="secondary" onClick={resendVerification}>
            Resend verification email
          </Button>
          {resent && (
            <p className="text-muted-foreground">Verification email sent.</p>
          )}
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
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <AuthError message={error} />
          <Button
            type="submit"
            size="lg"
            disabled={pending}
            className="mt-1 h-10"
          >
            {pending && <Loader2 className="animate-spin" />}
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account? <AuthLink href="/auth/sign-up">Sign up</AuthLink>
      </p>
    </AuthCard>
  )
}
