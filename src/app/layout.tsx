import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { QueryProvider } from "@/components/shared/query-provider";
import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/* Display voice: geometric, slightly techy — the dashed-square logo's
 * typographic cousin. Body stays Geist; code stays Geist Mono. */
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_FRONTEND_URL ?? "http://localhost:3001"
  ),
  title: {
    default: "Codebot — your coding workspace",
    template: "%s · Codebot",
  },
  description:
    "Notes, todos, files, components, presets, experts, tools and code snippets — one dark, quiet workspace, all searchable.",
  applicationName: "Codebot",
  keywords: [
    "codebot",
    "coding workspace",
    "snippets",
    "components",
    "presets",
    "developer tools",
    "notes",
    "todo",
  ],
  openGraph: {
    type: "website",
    siteName: "Codebot",
    locale: "en_US",
    title: "Codebot — your coding workspace",
    description:
      "Notes, todos, files, components, presets, experts, tools and code snippets — one dark, quiet workspace, all searchable.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Codebot — your coding workspace",
    description:
      "Notes, todos, files, components, presets, experts, tools and code snippets — one dark, quiet workspace, all searchable.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
