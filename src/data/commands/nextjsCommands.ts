import { ICommandCard } from "@/types/global.type";


export const nextjsCommands : ICommandCard[] = [
    {
        title: "Create a Project",
        commands: [
            { cmd: "npx create-next-app@latest", desc: "# Create a new Next.js app (interactive)" },
            { cmd: "npx create-next-app@latest <name> --typescript --tailwind --eslint --app --src-dir --import-alias '@/*'", desc: "# Create with common options preset" },
            { cmd: "npx create-next-app@latest <name> --use-pnpm", desc: "# Create using pnpm (also --use-npm, --use-yarn, --use-bun)" },
            { cmd: "npx create-next-app@latest -e <example-name>", desc: "# Start from an official example" },
            { cmd: "npm install next@latest react@latest react-dom@latest", desc: "# Install into an existing project" }
        ]
    },
    {
        title: "Dev & Build",
        commands: [
            { cmd: "npm run dev", desc: "# Start the dev server (http://localhost:3000)" },
            { cmd: "next dev -p 4000", desc: "# Dev server on a custom port" },
            { cmd: "next dev -H 0.0.0.0", desc: "# Expose dev server to your local network" },
            { cmd: "next dev --turbopack", desc: "# Dev with Turbopack (default in Next 16)" },
            { cmd: "next dev --webpack", desc: "# Opt out of Turbopack and use webpack" },
            { cmd: "next dev --experimental-https", desc: "# Run dev server over HTTPS locally" },
            { cmd: "next build", desc: "# Create an optimized production build" },
            { cmd: "next build --profile", desc: "# Build with React profiling enabled" },
            { cmd: "next start", desc: "# Start the production server" },
            { cmd: "next start -p 4000", desc: "# Production server on a custom port" },
            { cmd: "ANALYZE=true npm run build", desc: "# Bundle analysis (needs @next/bundle-analyzer)" }
        ]
    },
    {
        title: "Maintenance & Upgrades",
        commands: [
            { cmd: "rm -rf .next", desc: "# Clear the build cache" },
            { cmd: "rm -rf node_modules .next && npm install", desc: "# Full clean reinstall" },
            { cmd: "npx next info", desc: "# Print env info for bug reports" },
            { cmd: "npx next telemetry status", desc: "# Check telemetry status" },
            { cmd: "npx next telemetry disable", desc: "# Disable telemetry" },
            { cmd: "npx @next/codemod@canary upgrade latest", desc: "# Upgrade Next.js and run codemods" },
            { cmd: "npx @next/codemod@latest <transform> <path>", desc: "# Run a specific codemod" },
            { cmd: "npx next typegen", desc: "# Generate route types without a full build" },
            { cmd: "npm outdated", desc: "# See outdated dependencies" }
        ]
    },
    {
        title: "Lint, Format & Types",
        commands: [
            { cmd: "npx eslint .", desc: "# Lint the project (next lint was removed in Next 16)" },
            { cmd: "npx eslint . --fix", desc: "# Lint and auto-fix" },
            { cmd: "npx prettier --write .", desc: "# Format all files" },
            { cmd: "npx tsc --noEmit", desc: "# Type-check without emitting files" }
        ]
    },
    {
        title: "App Router File Conventions",
        commands: [
            { cmd: "app/layout.tsx", desc: "# Root layout (required, wraps every page)" },
            { cmd: "app/page.tsx", desc: "# Page for a route" },
            { cmd: "app/loading.tsx", desc: "# Loading UI (Suspense fallback)" },
            { cmd: "app/error.tsx", desc: "# Error boundary UI (must be a Client Component)" },
            { cmd: "app/global-error.tsx", desc: "# Root-level error boundary" },
            { cmd: "app/not-found.tsx", desc: "# 404 UI" },
            { cmd: "app/template.tsx", desc: "# Like layout but remounts on navigation" },
            { cmd: "app/api/<name>/route.ts", desc: "# Route handler (GET, POST, ...)" },
            { cmd: "app/[slug]/page.tsx", desc: "# Dynamic route segment" },
            { cmd: "app/[...slug]/page.tsx", desc: "# Catch-all route" },
            { cmd: "app/[[...slug]]/page.tsx", desc: "# Optional catch-all route" },
            { cmd: "app/(group)/page.tsx", desc: "# Route group (not part of the URL)" },
            { cmd: "app/@modal/page.tsx", desc: "# Parallel route slot" },
            { cmd: "app/_components/", desc: "# Private folder (ignored by routing)" },
            { cmd: "proxy.ts", desc: "# Runs before requests (renamed from middleware.ts in Next 16)" },
            { cmd: "next.config.ts", desc: "# Next.js configuration" },
            { cmd: "app/sitemap.ts", desc: "# Generate sitemap.xml" },
            { cmd: "app/robots.ts", desc: "# Generate robots.txt" },
            { cmd: "app/opengraph-image.tsx", desc: "# Generate an OG image" }
        ]
    },
    {
        title: "Data Fetching, Caching & Rendering",
        commands: [
            { cmd: "const res = await fetch(url, { cache: 'no-store' })", desc: "# Always fetch fresh data (dynamic)" },
            { cmd: "const res = await fetch(url, { next: { revalidate: 3600, tags: ['posts'] } })", desc: "# Time-based revalidation with a cache tag" },
            { cmd: "export const dynamic = 'force-dynamic'", desc: "# Force dynamic rendering for a route" },
            { cmd: "export const revalidate = 60", desc: "# Revalidate a route every 60 seconds" },
            { cmd: "'use cache'", desc: "# Cache a function or component (Cache Components, Next 16)" },
            { cmd: "revalidateTag('posts', 'max')", desc: "# Revalidate by tag (Next 16 signature)" },
            { cmd: "updateTag('posts')", desc: "# Expire a tag immediately from a Server Action" },
            { cmd: "revalidatePath('/blog')", desc: "# Revalidate a specific path" },
            { cmd: "export async function generateStaticParams()", desc: "# Pre-render dynamic routes at build time" },
            { cmd: "export async function generateMetadata({ params })", desc: "# Dynamic SEO metadata" },
            { cmd: "export const metadata: Metadata = { title: '...' }", desc: "# Static SEO metadata" },
            { cmd: "const { slug } = await params", desc: "# params/searchParams are async (Next 15+)" },
            { cmd: "const cookieStore = await cookies()", desc: "# Read cookies on the server (async in Next 15+)" },
            { cmd: "const headersList = await headers()", desc: "# Read request headers on the server" }
        ]
    },
    {
        title: "Client, Server & Navigation",
        commands: [
            { cmd: "'use client'", desc: "# Mark a file as a Client Component" },
            { cmd: "'use server'", desc: "# Mark Server Actions" },
            { cmd: "import Link from 'next/link'", desc: "# Client-side navigation link" },
            { cmd: "import Image from 'next/image'", desc: "# Optimized images" },
            { cmd: "import { Inter } from 'next/font/google'", desc: "# Self-hosted Google fonts" },
            { cmd: "import Script from 'next/script'", desc: "# Load third-party scripts" },
            { cmd: "import dynamic from 'next/dynamic'", desc: "# Lazy-load components" },
            { cmd: "const Comp = dynamic(() => import('./Comp'), { ssr: false })", desc: "# Client-only component (no SSR)" },
            { cmd: "import { useRouter, usePathname, useSearchParams, useParams } from 'next/navigation'", desc: "# Navigation hooks (Client Components)" },
            { cmd: "router.push('/path')", desc: "# Navigate programmatically" },
            { cmd: "router.refresh()", desc: "# Re-fetch server data for the current route" },
            { cmd: "import { redirect, notFound } from 'next/navigation'", desc: "# Server-side redirect / 404" },
            { cmd: "import { NextResponse } from 'next/server'", desc: "# Build responses in route handlers / proxy" },
            { cmd: "import { after } from 'next/server'", desc: "# Run work after the response is sent" }
        ]
    },
    {
        title: "Environment Variables",
        commands: [
            { cmd: ".env.local", desc: "# Local secrets (never commit)" },
            { cmd: ".env.development / .env.production", desc: "# Per-environment values" },
            { cmd: "NEXT_PUBLIC_API_URL=https://api.example.com", desc: "# Exposed to the browser (NEXT_PUBLIC_ prefix)" },
            { cmd: "process.env.DATABASE_URL", desc: "# Read a server-only variable" },
            { cmd: "vercel env pull .env.local", desc: "# Pull Vercel env vars to your machine" },
            { cmd: "NEXT_TELEMETRY_DISABLED=1 next build", desc: "# Disable telemetry for one command" }
        ]
    },
    {
        title: "Vercel CLI",
        commands: [
            { cmd: "npm install -g vercel", desc: "# Install the Vercel CLI" },
            { cmd: "vercel login", desc: "# Log in to Vercel" },
            { cmd: "vercel link", desc: "# Link the folder to a Vercel project" },
            { cmd: "vercel", desc: "# Deploy a preview" },
            { cmd: "vercel --prod", desc: "# Deploy to production" },
            { cmd: "vercel dev", desc: "# Run locally with Vercel environment" },
            { cmd: "vercel env add <NAME>", desc: "# Add an environment variable" },
            { cmd: "vercel env ls", desc: "# List environment variables" },
            { cmd: "vercel logs <deployment-url>", desc: "# View deployment logs" },
            { cmd: "vercel ls", desc: "# List deployments" },
            { cmd: "vercel domains add <domain>", desc: "# Add a domain" },
            { cmd: "vercel rollback", desc: "# Roll back to the previous deployment" },
            { cmd: "vercel build && vercel deploy --prebuilt", desc: "# Build locally, then deploy the output" }
        ]
    },
    {
        title: "Self-Hosting (VPS / Docker)",
        commands: [
            { cmd: "output: 'standalone'", desc: "# next.config.ts: build a minimal self-contained server" },
            { cmd: "node .next/standalone/server.js", desc: "# Run the standalone build" },
            { cmd: "cp -r public .next/standalone/public", desc: "# Copy public assets next to the standalone server" },
            { cmd: "cp -r .next/static .next/standalone/.next/static", desc: "# Copy static assets next to the standalone server" },
            { cmd: "PORT=3000 HOSTNAME=0.0.0.0 node server.js", desc: "# Set port and host for the standalone server" },
            { cmd: "pm2 start npm --name <app> -- start", desc: "# Run `next start` under PM2" },
            { cmd: "docker build -t <app> . && docker run -d -p 3000:3000 <app>", desc: "# Build and run with Docker" }
        ]
    },
    {
        title: "Common Add-ons",
        commands: [
            { cmd: "npm install tailwindcss @tailwindcss/postcss postcss", desc: "# Add Tailwind CSS" },
            { cmd: "npx shadcn@latest init", desc: "# Set up shadcn/ui" },
            { cmd: "npx shadcn@latest add button", desc: "# Add a shadcn/ui component" },
            { cmd: "npm install @tanstack/react-query", desc: "# Server state / data fetching" },
            { cmd: "npm install zod", desc: "# Schema validation" },
            { cmd: "npm install next-themes", desc: "# Dark/light theme support" },
            { cmd: "npm install lenis", desc: "# Smooth scrolling" },
            { cmd: "npm install gsap", desc: "# Animations" },
            { cmd: "npm install prisma @prisma/client", desc: "# Prisma ORM" },
            { cmd: "npx prisma init", desc: "# Initialize Prisma" },
            { cmd: "npx prisma migrate dev --name <name>", desc: "# Create and apply a migration" },
            { cmd: "npx prisma generate", desc: "# Regenerate the Prisma client" },
            { cmd: "npx prisma studio", desc: "# Open the database GUI" }
        ]
    },
    {
        title: "Testing",
        commands: [
            { cmd: "npm install -D vitest @testing-library/react jsdom", desc: "# Unit/component testing setup" },
            { cmd: "npx vitest", desc: "# Run unit tests in watch mode" },
            { cmd: "npm init playwright@latest", desc: "# Set up Playwright for e2e tests" },
            { cmd: "npx playwright test", desc: "# Run e2e tests" },
            { cmd: "npx playwright test --ui", desc: "# Run tests in UI mode" },
            { cmd: "npx playwright codegen http://localhost:3000", desc: "# Record a test by clicking through the app" }
        ]
    },
    {
        title: "Debugging",
        commands: [
            { cmd: "NODE_OPTIONS='--inspect' next dev", desc: "# Attach a Node debugger to the dev server" },
            { cmd: "lsof -i :3000", desc: "# See what is using port 3000" },
            { cmd: "kill -9 $(lsof -t -i:3000)", desc: "# Free port 3000" },
            { cmd: "npx next build --debug-prerender", desc: "# More detail on prerender errors" },
            { cmd: "npx tsc --noEmit", desc: "# Find type errors that break the build" }
        ]
    }
];
