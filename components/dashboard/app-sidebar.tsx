"use client"

import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Archive,
  Bot,
  Circle,
  Code,
  Database,
  EllipsisVertical,
  FileCode,
  FileText,
  Globe,
  LayoutGrid,
  ListTodo,
  LogOut,
  NotepadText,
  Plus,
  Presentation,
  Puzzle,
  Settings,
  Terminal,
  Wrench,
} from "lucide-react"

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
  SidebarRail,
} from "@/components/ui/sidebar"

export type User = {
  name: string
  email: string
  image?: string
}

type NavItem = {
  title: string
  icon: LucideIcon
  href: string
  /** Renders a "+" action on hover. */
  action?: "add"
}

const NAV_ITEMS: NavItem[] = [
  { title: "Notepad", icon: NotepadText, href: "/notepad" },
  { title: "Todo", icon: ListTodo, href: "/todo" },
  { title: "Blackboard", icon: Presentation, href: "/blackboard" },
  { title: "Database", icon: Database, href: "/database" },
  { title: "Experts", icon: Globe, href: "/experts" },
  { title: "Files", icon: FileText, href: "/files" },
  { title: "Components", icon: LayoutGrid, href: "/components" },
  { title: "Presets", icon: Code, href: "/presets" },
  { title: "Storage", icon: Archive, href: "/storage" },
  { title: "Tools", icon: Wrench, href: "/tools" },
  { title: "Extensions", icon: Puzzle, href: "/extensions" },
  { title: "IDE Snippet", icon: FileCode, href: "/ide-snippet" },
  { title: "Commands", icon: Terminal, href: "/commands", action: "add" },
  { title: "MVC", icon: Circle, href: "/mvc", action: "add" },
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

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Brand */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
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
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    render={<Link href={item.href} />}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                  {item.action === "add" && (
                    <SidebarMenuAction className="cursor-pointer">
                      <Plus />
                      <span className="sr-only">Add {item.title}</span>
                    </SidebarMenuAction>
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
                <DropdownMenuItem>
                  <Settings />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={async () => {
                  // Full reload on purpose: clears all cached session state.
                  await authClient.signOut()
                  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
                  window.location.href = "/auth/sign-in"
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
