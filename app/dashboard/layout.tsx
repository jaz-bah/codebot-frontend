import { DashboardShell } from "@/components/dashboard/dashboard-shell";
export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell title="Dashboard">
      {children}
    </DashboardShell>
  );
}
