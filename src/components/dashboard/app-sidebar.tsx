"use client"

import * as React from "react"

import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bot,
  Circle,
  Code,
  EllipsisVertical,
  FileCode,
  FileText,
  Globe,
  LayoutGrid,
  ListTodo,
  LogOut,
  Minus,
  NotepadText,
  Plus,
  Presentation,
  Settings,
  Terminal,
  UserRound,
  Wrench,
} from "lucide-react"

import { ROUTES } from "@/constants/routes"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { authClient } from "@/lib/auth-client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"

export type User = {
  name: string
  email: string
  image?: string
}

type NavSubItem = {
  title: string
  href: string
}

type NavItem = {
  title: string
  icon: LucideIcon
  href: string
  /** Renders a "+" action on hover. */
  action?: "add"
  /** Sub-items rendered in a collapsible group below the item. */
  sub?: NavSubItem[]
}

const NAV_ITEMS: NavItem[] = [
  // Community feed (/dashboard)
  { title: "Feed", icon: Globe, href: ROUTES.dashboard.root },
  // Existing page: /dashboard/note
  { title: "Notepad", icon: NotepadText, href: ROUTES.dashboard.note },
  { title: "Todo", icon: ListTodo, href: ROUTES.dashboard.todo },
  { title: "Blackboard", icon: Presentation, href: ROUTES.dashboard.blackboard },
  { title: "Experts", icon: Globe, href: ROUTES.dashboard.experts },
  { title: "Files", icon: FileText, href: ROUTES.dashboard.files },
  { title: "Components", icon: LayoutGrid, href: ROUTES.dashboard.components },
  { title: "Presets", icon: Code, href: ROUTES.dashboard.presets },
  { title: "Tools", icon: Wrench, href: ROUTES.dashboard.tools },
  { title: "IDE Snippet", icon: FileCode, href: ROUTES.dashboard.ideSnippet },
  { title: "Commands", icon: Terminal, href: ROUTES.dashboard.commands.root, sub: [
    { title: "GitHub", href: ROUTES.dashboard.commands.github },
    { title: "Linux", href: ROUTES.dashboard.commands.linux },
    { title: "VPS", href: ROUTES.dashboard.commands.vps },
    { title: "Server", href: ROUTES.dashboard.commands.server },
    { title: "Next.js", href: ROUTES.dashboard.commands.nextjs },
    { title: "Node.js", href: ROUTES.dashboard.commands.nodejs },
    { title: "Shopify", href: ROUTES.dashboard.commands.shopify },
  ] },
  { title: "MVC", icon: Circle, href: ROUTES.dashboard.mvc.root, sub: [
    { title: "Next.js", href: ROUTES.dashboard.mvc.nextjs },
    { title: "Remix.js", href: ROUTES.dashboard.mvc.remixjs },
    { title: "Nest.js", href: ROUTES.dashboard.mvc.nestjs },
    { title: "Express.js", href: ROUTES.dashboard.mvc.expressjs },
    { title: "WXT", href: ROUTES.dashboard.mvc.wxt },
    { title: "React Native", href: ROUTES.dashboard.mvc.reactNative },
  ] },
]

export function AppSidebar({
  user = { name: "Beats", email: "beats8792@gmail.com" },
  ...props
}: React.ComponentProps<typeof Sidebar> & { user?: User }) {
  const pathname = usePathname()
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  // Collapsible sections start open when the current page lives inside them.
  const [openSections, setOpenSections] = React.useState<
    Record<string, boolean>
  >(() => {
    const initial: Record<string, boolean> = {}
    for (const item of NAV_ITEMS) {
      if (item.sub) {
        initial[item.title] =
          pathname === item.href || pathname.startsWith(item.href + "/")
      }
    }
    return initial
  })

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Brand */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href={ROUTES.home} />}>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Bot />
              </span>
              <span className="font-heading text-base font-semibold tracking-widest uppercase group-data-[collapsible=icon]:hidden">
                Codebot
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={
                      pathname === item.href ||
                      pathname.startsWith(item.href + "/")
                    }
                    tooltip={item.title}
                    onClick={
                      item.sub ? () => toggleSection(item.title) : undefined
                    }
                    render={item.sub ? undefined : <Link href={item.href} />}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                    {item.sub && (
                      <span className="relative ml-auto size-4 shrink-0 group-data-[collapsible=icon]:hidden">
                        <Plus className="absolute inset-0 size-4 transition-opacity duration-150" />
                        <Minus
                          className={`absolute inset-0 size-4 transition-opacity duration-150 ${
                            openSections[item.title]
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        />
                      </span>
                    )}
                  </SidebarMenuButton>
                  {item.action === "add" && !item.sub && (
                    <SidebarMenuAction className="cursor-pointer">
                      <Plus />
                      <span className="sr-only">Add {item.title}</span>
                    </SidebarMenuAction>
                  )}
                  {item.sub && openSections[item.title] && (
                    <SidebarMenuSub>
                      {item.sub.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.href}>
                          <SidebarMenuSubButton
                            isActive={
                              pathname === subItem.href ||
                              pathname.startsWith(subItem.href + "/")
                            }
                            render={<Link href={subItem.href} />}
                          >
                            <span>{subItem.title}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}>
                <Avatar>
                  {user.image && <AvatarImage src={user.image} alt={user.name} />}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </span>
                <EllipsisVertical className="ml-auto group-data-[collapsible=icon]:hidden" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-(--anchor-width)">
                <DropdownMenuItem render={<Link href={ROUTES.dashboard.profile} />}>
                  <UserRound />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href={ROUTES.dashboard.settings} />}>
                  <Settings />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={async () => {
                  // Full reload on purpose: clears all cached session state.
                  await authClient.signOut()
                  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
                  window.location.href = ROUTES.auth.signIn
                }}>
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
