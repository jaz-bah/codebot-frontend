/**
 * Dummy presets for the /dashboard/presets page. Each preset is a short,
 * self-contained code snippet rendered in a read-only CodeEditor card.
 */
import type { CodeEditorLanguage } from "@/components/code-editor";

export type Preset = {
  id: string;
  title: string;
  language: CodeEditorLanguage;
  code: string;
};

export const PRESETS: Preset[] = [
  {
    id: "preset-debounce-hook",
    title: "Debounce hook",
    language: "typescript",
    code: `function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}`,
  },
  {
    id: "preset-retry-backoff",
    title: "Fetch with retry & backoff",
    language: "javascript",
    code: `async function fetchWithRetry(url, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    const response = await fetch(url);
    if (response.ok) return response.json();

    const delay = Math.pow(2, i) * 500;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  throw new Error("Request failed after " + attempts + " attempts");
}`,
  },
  {
    id: "preset-glass-card",
    title: "Glass card",
    language: "css",
    code: `.glass-card {
  padding: 1.5rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}`,
  },
  {
    id: "preset-flex-center",
    title: "Perfect flex centering",
    language: "css",
    code: `.center {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Grid alternative that never worries about overflow */
.center-grid {
  display: grid;
  place-items: center;
}`,
  },
  {
    id: "preset-html-boilerplate",
    title: "HTML boilerplate",
    language: "html",
    code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>New page</title>
  </head>
  <body>
    <main id="app"></main>
  </body>
</html>`,
  },
  {
    id: "preset-css-reset",
    title: "Modern CSS reset",
    language: "css",
    code: `*, *::before, *::after {
  box-sizing: border-box;
}

* {
  margin: 0;
}

body {
  -webkit-font-smoothing: antialiased;
}

img, video, canvas {
  display: block;
  max-width: 100%;
}`,
  },
  {
    id: "preset-deep-clone",
    title: "Deep clone shortcut",
    language: "javascript",
    code: `// Native structured cloning — handles Maps, Sets, Dates and loops.
const copy = structuredClone(original);

// JSON fallback for plain data only (no undefined, functions or Dates).
const plainCopy = JSON.parse(JSON.stringify(original));`,
  },
  {
    id: "preset-python-csv",
    title: "Read a CSV into dicts",
    language: "python",
    code: `import csv

def read_rows(path):
    with open(path, newline="", encoding="utf-8") as file:
        return list(csv.DictReader(file))

rows = read_rows("sales.csv")
total = sum(float(row["amount"]) for row in rows)
print(f"Total: {total:,.2f}")`,
  },
  {
    id: "preset-sql-upsert",
    title: "Postgres upsert",
    language: "sql",
    code: `INSERT INTO users (id, email, name)
VALUES ($1, $2, $3)
ON CONFLICT (id)
DO UPDATE
  SET email = EXCLUDED.email,
      name = EXCLUDED.name,
      updated_at = now()`,
  },
  {
    id: "preset-actions-deploy",
    title: "Deploy on push to main",
    language: "yaml",
    code: `name: Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build`,
  },
  {
    id: "preset-prune-branch",
    title: "Delete a remote branch",
    language: "shell",
    code: `git push origin --delete feature/old-branch

# Also drop every stale local reference:
git remote prune origin`,
  },
  {
    id: "preset-env-reader",
    title: "Safe env reader",
    language: "typescript",
    code: `export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error("Missing required env var: " + name);
  }
  return value;
}`,
  },
];
