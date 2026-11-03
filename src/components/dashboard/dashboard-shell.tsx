"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import {
  AppSidebar,
  type User,
} from "@/components/dashboard/app-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ChatWidget } from "@/components/chat/chat-widget"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { authClient } from "@/lib/auth-client"

type DashboardShellProps = {
  /** Title rendered at the top-left of the header. */
  title?: React.ReactNode
  children: React.ReactNode
  /** Optional right side panel content; toggled from the header. */
  rightPanel?: React.ReactNode
  user?: User
}

/**
 * Application layout wrapper: fixed left sidebar (brand, grouped nav, user
 * footer) + top header (breadcrumb/title, centered search, actions) + content
 * area. Drop any page content into `children`.
 *
 * Auth (Backend RUNBOOK §5): the session is an httpOnly cookie on the API
 * origin, so Next.js middleware can't see it — gating happens client-side via
 * `authClient.useSession()`. Anonymous visitors are redirected to
 * /auth/sign-in; the signed-in user is passed into the sidebar footer.
 */
export function DashboardShell({
  title = "Dashboard",
  children,
  rightPanel,
  user: userProp,
}: DashboardShellProps) {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [panelOpen, setPanelOpen] = React.useState(false)

  React.useEffect(() => {
    if (!isPending && !session) {
      router.replace("/auth/sign-in")
    }
  }, [isPending, session, router])

  if (isPending || !session) {
    return <AuthGateLoading />
  }

  const user: User = {
    name: userProp?.name ?? session.user.name ?? "Signed in user",
    email: userProp?.email ?? session.user.email ?? "",
    image: userProp?.image ?? session.user.image ?? undefined,
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar user={user} />
        <SidebarInset className="flex min-h-svh flex-col">
          <DashboardHeader
            title={title}
            showPanelToggle={rightPanel !== undefined}
            panelOpen={panelOpen}
            onPanelToggle={() => setPanelOpen((prev) => !prev)}
          />
          <div className="flex min-w-0 flex-1">
            <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
            {rightPanel && panelOpen && (
              <aside className="hidden w-72 shrink-0 border-l p-4 lg:block">
                {rightPanel}
              </aside>
            )}
          </div>
        </SidebarInset>
        <ChatWidget />
      </SidebarProvider>
    </TooltipProvider>
  )
}

function AuthGateLoading() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  )
}
