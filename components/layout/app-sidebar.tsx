"use client"

import { BarChart3, FolderOpen, Package, Rocket, Settings, Shield } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { getRoleDisplayName, type UserRole } from "@/lib/permissions"

const navigation = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart3,
    roles: ["PRODUCT_MANAGER", "PROJECT_MANAGER", "ENGINEER"] as UserRole[],
    description: "Overview of production metrics and activity",
  },
  {
    title: "Products",
    url: "/products",
    icon: Package,
    roles: ["PRODUCT_MANAGER", "PROJECT_MANAGER", "ENGINEER"] as UserRole[],
    description: "Manage product catalog and specifications",
  },
  {
    title: "Projects",
    url: "/projects",
    icon: FolderOpen,
    roles: ["PRODUCT_MANAGER", "PROJECT_MANAGER", "ENGINEER"] as UserRole[],
    description: "Track project progress and milestones",
  },
  {
    title: "Product Items",
    url: "/items",
    icon: Shield,
    roles: ["PRODUCT_MANAGER", "PROJECT_MANAGER", "ENGINEER"] as UserRole[],
    description: "Monitor individual item production status",
  }
]

export function AppSidebar() {
  const { user } = useAuth()
  const pathname = usePathname()

  const filteredNavigation = navigation.filter((item) => item.roles.includes(user?.role as UserRole))

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="p-2 bg-primary rounded-xl shadow-lg">
            <Rocket className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Osilion X
            </h2>
            <p className="text-sm text-muted-foreground">Production Platform</p>
          </div>
        </div>

        {/* Role Badge */}
        <div className="px-4 pb-2">
          <Badge variant="outline" className="w-full justify-center border-primary/20 bg-primary/5 text-primary">
            {getRoleDisplayName(user?.role as UserRole)}
          </Badge>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary/70 font-semibold">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.description}
                    className="hover:bg-primary/10 data-[active=true]:bg-primary/15 data-[active=true]:text-primary data-[active=true]:border-r-2 data-[active=true]:border-primary"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Role Permissions Info */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary/70 font-semibold">Your Permissions</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2 py-1 text-xs text-muted-foreground space-y-1">
              {user?.role === "PRODUCT_MANAGER" && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Manage Products & Projects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>View Product Items</span>
                  </div>
                </>
              )}
              {user?.role === "PROJECT_MANAGER" && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Manage Projects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>View Products & Items</span>
                  </div>
                </>
              )}
              {user?.role === "ENGINEER" && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Manage Product Items</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>View Products & Projects</span>
                  </div>
                </>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-4 py-3 border-t border-border/50">
          <div className="text-xs text-muted-foreground text-center">
            <p className="font-medium text-primary">© 2025 Osilion Technologies</p>
            <p>Aerospace Production Platform</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
