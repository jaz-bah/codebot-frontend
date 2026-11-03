"use client"

import * as React from "react"
import { Moon, PanelRight, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { GlobalSearch } from "@/components/dashboard/global-search"

export function ThemeToggle({ className }: { className?: string }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      className={className}
      onClick={() => {
        const dark = document.documentElement.classList.toggle("dark")
        try {
          localStorage.setItem("theme", dark ? "dark" : "light")
        } catch {}
      }}
    >
      <Moon className="dark:hidden" />
      <Sun className="hidden dark:block" />
    </Button>
  )
}

type DashboardHeaderProps = {
  title: React.ReactNode
  /** Renders a right side panel toggle. Only show when a panel is provided. */
  showPanelToggle?: boolean
  panelOpen?: boolean
  onPanelToggle?: () => void
}

export function DashboardHeader({
  title,
  showPanelToggle = false,
  panelOpen = false,
  onPanelToggle,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <h1 className="font-heading text-lg font-semibold tracking-tight">{title}</h1>

      {/* Centered workspace-wide search portal (GET /search) */}
      <GlobalSearch />

      {/* Right actions */}
      <div className="flex items-center gap-1">
        <ThemeToggle className="cursor-pointer" />
        <SidebarTrigger className="cursor-pointer" />
        {showPanelToggle && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle panel"
            aria-expanded={panelOpen}
            onClick={onPanelToggle}
          >
            <PanelRight />
          </Button>
        )}
      </div>
    </header>
  )
}
