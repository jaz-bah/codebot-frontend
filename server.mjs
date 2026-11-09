/**
 * Custom Next.js server (single public entrypoint for the Render deployment).
 *
 * WHY (cross-domain cookies): the backend used to live on a separate origin
 * (`codebot-backend-aued.onrender.com`) while the frontend was on Vercel —
 * browsers treated every auth/session cookie set by the backend as
 * third-party and blocked it. Now the frontend on Render is the ONLY host
 * the browser talks to:
 *
 *   browser → codebotapp.onrender.com (this server)
 *       ├── /api/**        → proxied to the backend service (cookies become
 *       │                    first-party on this host — OAuth + sessions work)
 *       ├── /socket.io/**  → proxied, incl. the WebSocket upgrade (Render
 *       │                    supports WS passthrough) — the chat gateway auths
 *       │                    off the session cookie, which now flows too
 *       └── everything else → Next.js renders
 *
 * - BetterAuth `baseURL` (backend env `APP_URL`) must equal THIS origin so
 *   OAuth callbacks / verify-email / reset links all land here.
 * - No CORS involvement anywhere: same-origin from the browser's view.
 * - Dev keeps `next dev -p 3001` (backend on localhost:3000 is same-origin
 *   enough for cookies — no proxy needed locally).
 *
 * See Next.js docs: 01-app/02-guides/custom-server.md.
 */
import { createServer } from 'node:http'
import next from 'next'
import httpProxy from 'http-proxy'

const port = Number(process.env.PORT || 3000)
const dev = process.env.NODE_ENV === 'development'
const backend = (process.env.BACKEND_URL ?? 'http://localhost:3000').replace(/\/+$/, '')

const app = next({ dev })
const handle = app.getRequestHandler()

const proxy = httpProxy.createProxyServer({
  target: backend,
  // Rewrite the Host header to the backend host (Render routes by Host).
  changeOrigin: true,
  // Add x-forwarded-* so the backend sees the real client/protocol info.
  xfwd: true,
})

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const url = req.url ?? ''
    if (url.startsWith('/api/') || url === '/api' || url.startsWith('/socket.io/')) {
      proxy.web(req, res)
    } else {
      handle(req, res)
    }
  })

  // WebSocket upgrades (Socket.IO transport=websocket) must be relayed
  // frame-agnostically — http-proxy pipes the raw socket both ways.
  server.on('upgrade', (req, socket, head) => {
    if (req.url?.startsWith('/socket.io/')) {
      proxy.ws(req, socket, head)
    } else {
      socket.destroy()
    }
  })

  proxy.on('error', (err, req, res) => {
    // Surface backend unreachability as a clean 502 instead of a hanging req.
    if ('writeHead' in res && typeof res.writeHead === 'function') {
      const headers = { 'content-type': 'application/json' }
      if (!res.headersSent) res.writeHead(502, headers)
      res.end(
        JSON.stringify({
          statusCode: 502,
          message: 'Backend unreachable via proxy',
          detail: err.code ?? err.message,
        }),
      )
    } else if ('destroy' in res && typeof res.destroy === 'function') {
      // WebSocket / upgrade target errors: no HTTP response object.
      res.destroy()
    }
  })

  server.listen(port, () => {
    console.log(
      `> codebot frontend on :${port} (dev: ${dev}, backend proxy target: ${backend})`,
    )
  })
})
