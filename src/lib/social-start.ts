/**
 * Starts the Google/GitHub OAuth flow via a TOP-LEVEL navigation to the
 * backend's GET bridge (`/api/auth/sign-in/social/start`), which creates the
 * BetterAuth state cookie and 302s to the provider.
 *
 * WHY not authClient.signIn.social (an XHR POST to /sign-in/social): on
 * *.onrender.com the platform's Cloudflare edge can gate POST requests with a
 * managed challenge (`Cf-Mitigated: challenge` → 429). A challenge inside an
 * XHR cannot be rendered or solved, so the button dead-ended with "Something
 * went wrong (429)". As a document navigation, the same challenge renders in
 * the tab, gets solved, and the flow continues to the provider.
 */
export function beginSocialSignIn(provider: "google" | "github"): void {
  const params = new URLSearchParams({
    provider,
    // Must be ABSOLUTE frontend URLs — relative values resolve against the
    // BACKEND origin and land users on the backend onrender.com subdomain.
    callbackURL: `${window.location.origin}/dashboard`,
    newUserCallbackURL: `${window.location.origin}/auth/sign-up`,
    errorCallbackURL: `${window.location.origin}/auth/sign-in`,
  })
  const url = `${window.location.origin}/api/auth/sign-in/social/start?${params}`
  // A full DOCUMENT navigation to an API URL is deliberate: router.push would
  // turn this into a client-side RSC fetch, which the Cloudflare edge would
  // challenge exactly like the old XHR — defeating the purpose. The eslint
  // rule assumes internal *pages*; this is an API endpoint handoff.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign(url)
}
