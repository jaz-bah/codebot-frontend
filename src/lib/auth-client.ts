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
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"

export const authClient = createAuthClient({
  baseURL: `${API_URL}/api/auth`,
  fetchOptions: {
    credentials: "include",
  },
  // Must mirror the server `username({ displayUsername: false })` plugin
  // (better-auth.instance.ts) so the `username` field is settable via
  // `updateUser` here and session types stay in sync with the server.
  plugins: [usernameClient({ displayUsername: false })],
})
