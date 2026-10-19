"use client"

import * as React from "react"
import { Moon, PanelRight, Search, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  SidebarTrigger,
} from "@/components/ui/sidebar"

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
  searchPlaceholder?: string
  onSearchChange?: (value: string) => void
  /** Renders a right side panel toggle. Only show when a panel is provided. */
  showPanelToggle?: boolean
  panelOpen?: boolean
  onPanelToggle?: () => void
}

export function DashboardHeader({
  title,
  searchPlaceholder = "Search...",
  onSearchChange,
  showPanelToggle = false,
  panelOpen = false,
  onPanelToggle,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <h1 className="text-lg font-medium">{title}</h1>

      {/* Centered search bar */}
      <div className="flex min-w-0 flex-1 justify-center px-2">
        <div className="relative w-full max-w-sm min-w-0">
          <Input
            type="search"
            placeholder={searchPlaceholder}
            aria-label="Search"
            onChange={(event) => onSearchChange?.(event.target.value)}
            className="pr-8 bg-accent dark:bg-input/30"
          />
          <Search className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

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
