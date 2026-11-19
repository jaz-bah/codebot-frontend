import { DashboardShell } from "@/components/dashboard/dashboard-shell";

/**
 * /dev-tools layout: same sidebar + header chrome as the dashboard, so the
 * utilities feel like part of the workspace instead of a bare page. The shell
 * also owns the client-side auth gate (session cookie → redirect to sign-in).
 */
export default function DevToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell title="Dev Tools">{children}</DashboardShell>;
}
