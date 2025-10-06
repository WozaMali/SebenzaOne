"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
import Image from "next/image"
import SNWLogo from "../../Images/Logo/SNW LOGO.png"

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
  const pathname = usePathname()
  const currentPath = pathname ?? ""

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + "/")
  const collapsed = state === "collapsed"

  return (
    <TooltipProvider>
      <Sidebar
        className={`${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}
        group-data-[side=left]:border-r group-data-[side=right]:border-l border-border
        [&_[data-sidebar=sidebar]]:bg-background [&_[data-sidebar=sidebar]]:text-foreground`}
        collapsible="icon"
      >
		{/* Sidebar Header */}
		<div className={`flex items-center justify-between ${collapsed ? 'p-3' : 'p-4'}`}>
			{!collapsed ? (
				<div className="flex items-center gap-2">
					<Image src={SNWLogo} alt="SNW Logo" className="rounded-md" width={32} height={32} />
					<span className="font-semibold text-foreground">Sebenza One</span>
				</div>
			) : (
				<div className="flex items-center justify-center w-full">
					<Image src={SNWLogo} alt="SNW Logo" className="rounded-md" width={32} height={32} />
				</div>
			)}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="h-8 w-8 p-0 hover:bg-accent/50 hover:text-primary"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

		<SidebarContent className={`${collapsed ? 'px-2 py-3' : 'px-3 py-6'}`}>
          <SidebarGroup>
            <SidebarGroupContent>
						<SidebarMenu className={`${collapsed ? 'space-y-1' : 'space-y-2'}`}>
                {modules.map((module) => (
                  <SidebarMenuItem key={module.title}>
                    {collapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
										<SidebarMenuButton asChild className="justify-center p-2">
                            <Link 
                              href={module.url} 
												className={`flex flex-col items-center justify-center rounded-lg transition-all duration-200 ${collapsed ? 'p-2' : 'p-3'} ${
                                isActive(module.url)
                                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg' 
                                  : 'hover:bg-accent/50 text-foreground hover:text-primary'
                              }`}
                            >
													<module.icon className={`${collapsed ? 'h-6 w-6' : 'h-7 w-7'}`} />
                              <span className={`text-xs font-medium mt-1 ${collapsed ? 'block' : 'hidden'}`}>
                                {module.title}
                              </span>
                            </Link>
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
                        <Link 
                          href={module.url}
                          className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
                            isActive(module.url)
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-lg' 
                              : 'hover:bg-accent/50 text-foreground hover:text-primary'
                          }`}
                        >
                          <module.icon className="h-7 w-7" />
                          <span className="font-semibold text-base">{module.title}</span>
                        </Link>
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