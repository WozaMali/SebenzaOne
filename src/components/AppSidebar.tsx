import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { 
  Mail, 
  FolderOpen, 
  HardDrive, 
  StickyNote, 
  MessageCircle, 
  Calendar, 
  ClipboardList, 
  Users, 
  Calculator,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const modules = [
  { title: "Mail", url: "/mail", icon: Mail, description: "SebenzaMail - Email management" },
  { title: "Projects", url: "/projects", icon: FolderOpen, description: "Project management & Kanban" },
  { title: "Drive", url: "/drive", icon: HardDrive, description: "File storage & sharing" },
  { title: "Notes", url: "/notes", icon: StickyNote, description: "Sticky notes & quick capture" },
  { title: "Connect", url: "/connect", icon: MessageCircle, description: "Team collaboration & social feed" },
  { title: "Calendar", url: "/calendar", icon: Calendar, description: "Events & scheduling" },
  { title: "Planner", url: "/planner", icon: ClipboardList, description: "My Day & focus timer" },
  { title: "CRM", url: "/crm", icon: Users, description: "Customer relationship management" },
  { title: "Accounting", url: "/accounting", icon: Calculator, description: "Invoices & financial tracking" },
]

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + "/")
  const collapsed = state === "collapsed"

  return (
    <TooltipProvider>
      <Sidebar className={`${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'} border-r border-sidebar-border bg-sidebar-background`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">S1</span>
              </div>
              <span className="font-semibold text-sidebar-foreground">Sebenza One</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="h-8 w-8 p-0 hover:bg-sidebar-accent"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <SidebarContent className="px-2 py-4">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {modules.map((module) => (
                  <SidebarMenuItem key={module.title}>
                    {collapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild className="justify-center">
                            <NavLink 
                              to={module.url} 
                              className={({ isActive: navIsActive }) => 
                                `flex items-center justify-center rounded-lg transition-colors ${
                                  navIsActive || isActive(module.url)
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'hover:bg-sidebar-accent text-sidebar-foreground'
                                }`
                              }
                            >
                              <module.icon className="module-icon" />
                            </NavLink>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="dropdown-3d">
                          <div>
                            <p className="font-medium">{module.title}</p>
                            <p className="text-sm text-muted-foreground">{module.description}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={module.url}
                          className={({ isActive: navIsActive }) => 
                            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                              navIsActive || isActive(module.url)
                                ? 'bg-primary text-primary-foreground font-medium' 
                                : 'hover:bg-sidebar-accent text-sidebar-foreground'
                            }`
                          }
                        >
                          <module.icon className="module-icon" />
                          <span className="font-medium">{module.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </TooltipProvider>
  )
}