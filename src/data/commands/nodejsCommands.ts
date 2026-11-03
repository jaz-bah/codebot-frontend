import { ICommandCard } from "@/types/global.type";


export const nodejsCommands : ICommandCard[] = [
    {
        title: "Version Management (nvm / fnm)",
        commands: [
            { cmd: "node -v && npm -v", desc: "# Check Node and npm versions" },
            { cmd: "nvm install --lts", desc: "# Install the latest LTS version" },
            { cmd: "nvm install 24", desc: "# Install a specific major version" },
            { cmd: "nvm use 24", desc: "# Switch to a version" },
            { cmd: "nvm use", desc: "# Switch to the version in .nvmrc" },
            { cmd: "nvm ls", desc: "# List installed versions" },
            { cmd: "nvm ls-remote --lts", desc: "# List available LTS versions" },
            { cmd: "nvm alias default 24", desc: "# Set the default version" },
            { cmd: "nvm current", desc: "# Show the active version" },
            { cmd: "nvm uninstall <version>", desc: "# Remove a version" },
            { cmd: "node -v > .nvmrc", desc: "# Pin the project's Node version" },
            { cmd: "fnm install --lts", desc: "# fnm: install the latest LTS" },
            { cmd: "fnm use <version>", desc: "# fnm: switch version" },
            { cmd: "fnm default <version>", desc: "# fnm: set the default version" }
        ]
    },
    {
        title: "Running Node",
        commands: [
            { cmd: "node <file>.js", desc: "# Run a script" },
            { cmd: "node <file>.ts", desc: "# Run TypeScript directly (type stripping, Node 22.18+ / 24)" },
            { cmd: "node --watch <file>.js", desc: "# Restart on file changes" },
            { cmd: "node --env-file=.env <file>.js", desc: "# Load environment variables from a file" },
            { cmd: "node --run <script>", desc: "# Run a package.json script (faster than npm run)" },
            { cmd: "node -e \"console.log(1 + 1)\"", desc: "# Run an inline snippet" },
            { cmd: "node -p \"process.version\"", desc: "# Evaluate and print an expression" },
            { cmd: "node --test", desc: "# Run tests with the built-in test runner" },
            { cmd: "node --inspect <file>.js", desc: "# Start with the debugger (open chrome://inspect)" },
            { cmd: "node --inspect-brk <file>.js", desc: "# Debugger that pauses on the first line" },
            { cmd: "node --max-old-space-size=4096 <file>.js", desc: "# Increase memory limit to 4GB" },
            { cmd: "node --trace-warnings <file>.js", desc: "# Show stack traces for warnings" },
            { cmd: "node --enable-source-maps <file>.js", desc: "# Map errors back to source files" },
            { cmd: "node", desc: "# Open the REPL (.help, .load, .exit)" },
            { cmd: "NODE_ENV=production node <file>.js", desc: "# Run in production mode" }
        ]
    },
    {
        title: "npm - Packages",
        commands: [
            { cmd: "npm init -y", desc: "# Create a package.json with defaults" },
            { cmd: "npm install", desc: "# Install all dependencies" },
            { cmd: "npm install <package>", desc: "# Install a dependency" },
            { cmd: "npm install -D <package>", desc: "# Install a dev dependency" },
            { cmd: "npm install -g <package>", desc: "# Install globally" },
            { cmd: "npm install <package>@<version>", desc: "# Install a specific version" },
            { cmd: "npm install --save-exact <package>", desc: "# Pin the exact version" },
            { cmd: "npm ci", desc: "# Clean install from lockfile (CI/deploy)" },
            { cmd: "npm ci --omit=dev", desc: "# Clean install of production dependencies only" },
            { cmd: "npm uninstall <package>", desc: "# Remove a package" },
            { cmd: "npm update", desc: "# Update packages within semver ranges" },
            { cmd: "npm outdated", desc: "# Show outdated packages" },
            { cmd: "npm ls --depth=0", desc: "# List top-level installed packages" },
            { cmd: "npm ls -g --depth=0", desc: "# List global packages" },
            { cmd: "npm ls <package>", desc: "# See where a package is used in the tree" },
            { cmd: "npm explain <package>", desc: "# Why is this package installed?" },
            { cmd: "npm view <package> versions", desc: "# List published versions" },
            { cmd: "npm info <package>", desc: "# Show package details" },
            { cmd: "npm search <keyword>", desc: "# Search the registry" },
            { cmd: "npm prune", desc: "# Remove extraneous packages" },
            { cmd: "npm dedupe", desc: "# Reduce duplicate packages" }
        ]
    },
    {
        title: "npm - Scripts & npx",
        commands: [
            { cmd: "npm run", desc: "# List available scripts" },
            { cmd: "npm run <script>", desc: "# Run a script" },
            { cmd: "npm start", desc: "# Run the start script" },
            { cmd: "npm test", desc: "# Run the test script" },
            { cmd: "npm run <script> -- --flag", desc: "# Pass arguments to a script" },
            { cmd: "npx <package>", desc: "# Run a package without installing it globally" },
            { cmd: "npx <package>@latest", desc: "# Run the latest version of a package" },
            { cmd: "npm exec -- <command>", desc: "# Run a local binary" },
            { cmd: "npm link", desc: "# Link a local package globally (for development)" },
            { cmd: "npm link <package>", desc: "# Use a linked package in another project" },
            { cmd: "npm pkg set scripts.dev='node --watch index.js'", desc: "# Edit package.json from the CLI" },
            { cmd: "npm pkg get version", desc: "# Read a package.json field" }
        ]
    },
    {
        title: "npm - Config & Cache",
        commands: [
            { cmd: "npm config list", desc: "# Show npm config" },
            { cmd: "npm config get registry", desc: "# Show the current registry" },
            { cmd: "npm config set registry <url>", desc: "# Change the registry" },
            { cmd: "npm root -g", desc: "# Show the global modules folder" },
            { cmd: "npm cache verify", desc: "# Verify the npm cache" },
            { cmd: "npm cache clean --force", desc: "# Clear the npm cache" },
            { cmd: "npm doctor", desc: "# Check your npm environment" },
            { cmd: "npm install -g npm@latest", desc: "# Update npm itself" },
            { cmd: "rm -rf node_modules package-lock.json && npm install", desc: "# Full clean reinstall" }
        ]
    },
    {
        title: "Security & Updates",
        commands: [
            { cmd: "npm audit", desc: "# Check for known vulnerabilities" },
            { cmd: "npm audit --omit=dev", desc: "# Audit production dependencies only" },
            { cmd: "npm audit fix", desc: "# Auto-fix vulnerabilities (safe updates)" },
            { cmd: "npm audit fix --force", desc: "# Fix with breaking changes (review afterwards)" },
            { cmd: "npm audit signatures", desc: "# Verify registry signatures and provenance" },
            { cmd: "npx npm-check-updates", desc: "# Show newer versions available" },
            { cmd: "npx npm-check-updates -u && npm install", desc: "# Upgrade package.json to latest versions" },
            { cmd: "npx depcheck", desc: "# Find unused dependencies" }
        ]
    },
    {
        title: "Publishing",
        commands: [
            { cmd: "npm login", desc: "# Log in to npm" },
            { cmd: "npm whoami", desc: "# Show the logged-in user" },
            { cmd: "npm version patch", desc: "# Bump patch version (also: minor, major)" },
            { cmd: "npm pack --dry-run", desc: "# Preview what would be published" },
            { cmd: "npm publish --dry-run", desc: "# Test a publish without uploading" },
            { cmd: "npm publish", desc: "# Publish a package" },
            { cmd: "npm publish --access public", desc: "# Publish a scoped package publicly" },
            { cmd: "npm dist-tag add <package>@<version> <tag>", desc: "# Tag a version (e.g. beta)" },
            { cmd: "npm deprecate <package>@<version> 'message'", desc: "# Mark a version as deprecated" },
            { cmd: "npm logout", desc: "# Log out of npm" }
        ]
    },
    {
        title: "pnpm",
        commands: [
            { cmd: "npm install -g pnpm", desc: "# Install pnpm (or use corepack)" },
            { cmd: "pnpm install", desc: "# Install dependencies" },
            { cmd: "pnpm install --frozen-lockfile", desc: "# Install exactly from lockfile (CI)" },
            { cmd: "pnpm add <package>", desc: "# Add a dependency" },
            { cmd: "pnpm add -D <package>", desc: "# Add a dev dependency" },
            { cmd: "pnpm add -g <package>", desc: "# Add a global package" },
            { cmd: "pnpm remove <package>", desc: "# Remove a package" },
            { cmd: "pnpm update --interactive --latest", desc: "# Interactively upgrade to latest versions" },
            { cmd: "pnpm outdated", desc: "# Show outdated packages" },
            { cmd: "pnpm run <script>", desc: "# Run a script" },
            { cmd: "pnpm dlx <package>", desc: "# Run a package without installing (like npx)" },
            { cmd: "pnpm why <package>", desc: "# Why is a package installed?" },
            { cmd: "pnpm store prune", desc: "# Clean unreferenced packages from the store" },
            { cmd: "pnpm approve-builds", desc: "# Approve dependency install scripts (pnpm 10+)" },
            { cmd: "pnpm --filter <package-name> dev", desc: "# Run a script in one workspace package" },
            { cmd: "pnpm -r build", desc: "# Run a script in all workspace packages" }
        ]
    },
    {
        title: "Yarn & Corepack",
        commands: [
            { cmd: "corepack enable", desc: "# Enable pnpm/yarn shims bundled with Node" },
            { cmd: "corepack use pnpm@latest", desc: "# Pin the package manager in package.json" },
            { cmd: "yarn install", desc: "# Install dependencies" },
            { cmd: "yarn install --frozen-lockfile", desc: "# Install from lockfile (Yarn 1 / CI)" },
            { cmd: "yarn install --immutable", desc: "# Install from lockfile (Yarn Berry / CI)" },
            { cmd: "yarn add <package>", desc: "# Add a dependency" },
            { cmd: "yarn add -D <package>", desc: "# Add a dev dependency" },
            { cmd: "yarn remove <package>", desc: "# Remove a package" },
            { cmd: "yarn upgrade-interactive", desc: "# Interactively upgrade packages" },
            { cmd: "yarn why <package>", desc: "# Why is a package installed?" },
            { cmd: "yarn <script>", desc: "# Run a script" },
            { cmd: "yarn cache clean", desc: "# Clear the Yarn cache" }
        ]
    },
    {
        title: "Bun",
        commands: [
            { cmd: "bun install", desc: "# Install dependencies" },
            { cmd: "bun add <package>", desc: "# Add a dependency" },
            { cmd: "bun run <script>", desc: "# Run a script or file" },
            { cmd: "bun --watch <file>.ts", desc: "# Run with auto-restart" },
            { cmd: "bunx <package>", desc: "# Run a package (like npx)" },
            { cmd: "bun test", desc: "# Run tests" }
        ]
    },
    {
        title: "package.json Essentials",
        commands: [
            { cmd: "\"type\": \"module\"", desc: "# Use ES modules (import/export) by default" },
            { cmd: "\"scripts\": { \"dev\": \"node --watch index.js\", \"start\": \"node index.js\" }", desc: "# Define scripts" },
            { cmd: "\"engines\": { \"node\": \">=22\" }", desc: "# Declare supported Node versions" },
            { cmd: "\"packageManager\": \"pnpm@10.0.0\"", desc: "# Pin the package manager (used by corepack)" },
            { cmd: "\"main\": \"dist/index.js\"", desc: "# Entry point for CommonJS consumers" },
            { cmd: "\"exports\": { \".\": { \"import\": \"./dist/index.js\", \"require\": \"./dist/index.cjs\" } }", desc: "# Modern entry points (ESM + CJS)" },
            { cmd: "\"files\": [\"dist\"]", desc: "# Limit what gets published" },
            { cmd: "\"bin\": { \"my-cli\": \"./bin/cli.js\" }", desc: "# Expose a CLI command" },
            { cmd: "\"overrides\": { \"<package>\": \"<version>\" }", desc: "# Force a nested dependency version (npm)" },
            { cmd: "\"workspaces\": [\"packages/*\"]", desc: "# Monorepo workspaces" },
            { cmd: "\"prebuild\" / \"postbuild\"", desc: "# Scripts that auto-run before/after a script with the same name" }
        ]
    },
    {
        title: "TypeScript & Dev Tools",
        commands: [
            { cmd: "npm install -D typescript @types/node", desc: "# Add TypeScript and Node types" },
            { cmd: "npx tsc --init", desc: "# Create tsconfig.json" },
            { cmd: "npx tsc", desc: "# Compile TypeScript" },
            { cmd: "npx tsc --watch", desc: "# Compile on changes" },
            { cmd: "npx tsc --noEmit", desc: "# Type-check only" },
            { cmd: "npx tsx <file>.ts", desc: "# Run a TypeScript file directly" },
            { cmd: "npx tsx watch <file>.ts", desc: "# Run TypeScript with auto-restart" },
            { cmd: "npx nodemon <file>.js", desc: "# Restart on changes (older alternative to --watch)" },
            { cmd: "npm install -D concurrently", desc: "# Run multiple scripts at once" },
            { cmd: "npm install -D cross-env", desc: "# Set env variables cross-platform in scripts" },
            { cmd: "npm install dotenv", desc: "# Load .env files (or use node --env-file)" }
        ]
    },
    {
        title: "Debugging & Performance",
        commands: [
            { cmd: "node --inspect <file>.js", desc: "# Debug in Chrome DevTools (chrome://inspect)" },
            { cmd: "node --cpu-prof <file>.js", desc: "# Generate a CPU profile" },
            { cmd: "node --heap-prof <file>.js", desc: "# Generate a heap profile" },
            { cmd: "DEBUG=express:* node <file>.js", desc: "# Enable debug logs for a library" },
            { cmd: "npx autocannon -c 100 -d 30 http://localhost:3000", desc: "# HTTP load test" },
            { cmd: "npx clinic doctor -- node <file>.js", desc: "# Diagnose performance issues" },
            { cmd: "lsof -i :3000", desc: "# See what is using port 3000" },
            { cmd: "kill -9 $(lsof -t -i:3000)", desc: "# Free port 3000" },
            { cmd: "npx kill-port 3000", desc: "# Free a port (cross-platform)" },
            { cmd: "npx wait-on http://localhost:3000", desc: "# Wait until a service is ready" }
        ]
    },
    {
        title: "Built-in Modules & Snippets",
        commands: [
            { cmd: "import fs from 'node:fs/promises'", desc: "# File system (promise API)" },
            { cmd: "import path from 'node:path'", desc: "# Path helpers" },
            { cmd: "import { fileURLToPath } from 'node:url'", desc: "# Convert import.meta.url to a path" },
            { cmd: "const __dirname = import.meta.dirname", desc: "# __dirname in ES modules (Node 20.11+)" },
            { cmd: "await fs.readFile(filePath, 'utf8')", desc: "# Read a file" },
            { cmd: "await fs.writeFile(filePath, data)", desc: "# Write a file" },
            { cmd: "await fs.mkdir(dir, { recursive: true })", desc: "# Create nested folders" },
            { cmd: "process.argv.slice(2)", desc: "# Command-line arguments" },
            { cmd: "process.env.MY_VAR", desc: "# Read an environment variable" },
            { cmd: "process.exit(1)", desc: "# Exit with an error code" },
            { cmd: "process.on('SIGTERM', () => { /* cleanup */ })", desc: "# Graceful shutdown handler" },
            { cmd: "crypto.randomUUID()", desc: "# Generate a UUID" },
            { cmd: "const res = await fetch(url)", desc: "# Built-in fetch (Node 18+)" },
            { cmd: "structuredClone(obj)", desc: "# Deep clone an object" },
            { cmd: "import { pipeline } from 'node:stream/promises'", desc: "# Safely pipe streams" },
            { cmd: "import { describe, it } from 'node:test'", desc: "# Built-in test runner" }
        ]
    },
    {
        title: "NestJS CLI",
        commands: [
            { cmd: "npm install -g @nestjs/cli", desc: "# Install the Nest CLI" },
            { cmd: "nest new <project-name>", desc: "# Create a new Nest project" },
            { cmd: "nest generate module <name>", desc: "# Generate a module (alias: nest g mo)" },
            { cmd: "nest generate controller <name>", desc: "# Generate a controller (alias: nest g co)" },
            { cmd: "nest generate service <name>", desc: "# Generate a service (alias: nest g s)" },
            { cmd: "nest generate resource <name>", desc: "# Generate a full CRUD resource" },
            { cmd: "nest generate guard <name>", desc: "# Generate a guard" },
            { cmd: "nest generate interceptor <name>", desc: "# Generate an interceptor" },
            { cmd: "nest generate pipe <name>", desc: "# Generate a pipe" },
            { cmd: "nest generate middleware <name>", desc: "# Generate middleware" },
            { cmd: "nest generate filter <name>", desc: "# Generate an exception filter" },
            { cmd: "nest g resource <name> --no-spec", desc: "# Generate without test files" },
            { cmd: "nest g resource <name> --dry-run", desc: "# Preview generated files" },
            { cmd: "npm run start:dev", desc: "# Start in watch mode" },
            { cmd: "npm run start:debug", desc: "# Start with debugger in watch mode" },
            { cmd: "npm run build", desc: "# Compile to dist/" },
            { cmd: "npm run start:prod", desc: "# Run the compiled build" },
            { cmd: "nest info", desc: "# Show Nest and system info" },
            { cmd: "npm install @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt", desc: "# Common packages for config and JWT auth" },
            { cmd: "npm install class-validator class-transformer", desc: "# DTO validation and transformation" },
            { cmd: "npm install @nestjs/swagger", desc: "# OpenAPI / Swagger docs" }
        ]
    }
];
