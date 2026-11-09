"use client"

import { usernameClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

/**
 * BetterAuth client for the NestJS backend auth system (Backend/Brain/RUNBOOK.md).
 *
 * - Sessions are cookie-based (httpOnly `better-auth.session_token`), 7-day
 *   sliding expiry. Never read/manipulate the cookie — call the client.
 * - Backend listens on PORT 3000, auth routes mounted under `/api/auth/**`.
 * - `credentials: 'include'` is required for cross-origin cookie sending, and
 *   this app's origin must be listed in backend `CORS_ORIGIN_URLS`.
 * - Run the frontend dev server on port 3001 (backend owns 3000).
 */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")

/** Abort an auth request after this long, so an unreachable API can't
 *  leave a form stuck on "Signing in…" forever. */
const AUTH_REQUEST_TIMEOUT_MS = 15_000

const anySignal = (
  AbortSignal as unknown as {
    any?: (signals: AbortSignal[]) => AbortSignal
  }
).any

/** fetch with a hard deadline; keeps a caller-provided signal usable when
 *  the runtime supports `AbortSignal.any`. */
const boundedFetch: typeof fetch = (input, init) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), AUTH_REQUEST_TIMEOUT_MS)
  const signal =
    init?.signal && anySignal
      ? anySignal([init.signal, controller.signal])
      : controller.signal
  return fetch(input, { ...init, signal }).finally(() => clearTimeout(timer))
}

export const authClient = createAuthClient({
  // Use a relative URL when in the browser so the Next.js rewrite (next.config.ts)
  // proxies the auth calls to the backend origin. This makes the session
  // cookie "first-party" (on the frontend domain), which avoids modern
  // browser third-party cookie blocking.
  baseURL: typeof window !== "undefined" ? "/api/auth" : `${API_URL}/api/auth`,
  cookiePrefix: 'codebot',
  fetchOptions: {
    credentials: "include",
    customFetchImpl: boundedFetch,
  },
  // Must mirror the server `username({ displayUsername: false })` plugin
  // (better-auth.instance.ts) so the `username` field is settable via
  // `updateUser` here and session types stay in sync with the server.
  plugins: [usernameClient({ displayUsername: false })],
})
