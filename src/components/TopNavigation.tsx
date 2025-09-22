import { useState } from "react"
import { Search, Plus, Bell, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function TopNavigation() {
  const [searchQuery, setSearchQuery] = useState("")

  const quickAddItems = [
    { label: "New Email", action: () => console.log("New Email") },
    { label: "New Project", action: () => console.log("New Project") },
    { label: "Upload File", action: () => console.log("Upload File") },
    { label: "Create Note", action: () => console.log("Create Note") },
    { label: "New Event", action: () => console.log("New Event") },
    { label: "Add Contact", action: () => console.log("Add Contact") },
  ]

  return (
    <header className="h-16 bg-background border-b border-border flex items-center px-6 gap-4">
      {/* Global Search - Zoho-style omnibox */}
      <div className="flex-1 max-w-2xl relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="search"
          placeholder="Search across all modules..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary rounded-full"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2">
        {/* Quick Add Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary-hover text-primary-foreground rounded-full">
              <Plus className="h-4 w-4 mr-2" />
              Quick Add
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="dropdown-3d w-48">
            {quickAddItems.map((item, index) => (
              <DropdownMenuItem key={index} onClick={item.action} className="cursor-pointer">
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="dropdown-3d w-80">
            <div className="p-4 border-b">
              <h4 className="font-semibold">Notifications</h4>
            </div>
            <div className="p-2">
              <div className="space-y-2">
                <div className="p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <p className="text-sm font-medium">New email from John Doe</p>
                  <p className="text-xs text-muted-foreground">5 minutes ago</p>
                </div>
                <div className="p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <p className="text-sm font-medium">Project "Website Redesign" updated</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
                <div className="p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <p className="text-sm font-medium">Calendar reminder: Team meeting at 3 PM</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="dropdown-3d">
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuItem>Integrations</DropdownMenuItem>
            <DropdownMenuItem>Security</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Help & Support</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block font-medium">John Doe</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="dropdown-3d">
            <div className="p-2">
              <p className="font-medium">John Doe</p>
              <p className="text-sm text-muted-foreground">john@company.com</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
            <DropdownMenuItem>Switch Organization</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}