import { useState, useEffect } from "react"
import { Search, Plus, Bell, Settings, User, Sun, Moon } from "lucide-react"
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
  const [isDark, setIsDark] = useState(false)

  // Initialize dark mode from localStorage
  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true'
    setIsDark(darkMode)
    if (darkMode) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDark
    setIsDark(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const quickAddItems = [
    { label: "New Email", action: () => console.log("New Email") },
    { label: "New Project", action: () => console.log("New Project") },
    { label: "Upload File", action: () => console.log("Upload File") },
    { label: "Create Note", action: () => console.log("Create Note") },
    { label: "New Event", action: () => console.log("New Event") },
    { label: "Add Contact", action: () => console.log("Add Contact") },
  ]

  return (
    <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border/50 flex items-center px-6 gap-4 sticky top-0 z-50">
      {/* Global Search - Zoho-style omnibox */}
      <div className="flex-1 max-w-2xl relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="search"
          placeholder="Search across all modules..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-primary rounded-full backdrop-blur-sm hover:bg-muted/50 transition-all duration-200"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2">
        {/* Quick Add Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-gradient-primary hover:bg-primary-hover text-primary-foreground rounded-full btn-glow shadow-glow">
              <Plus className="h-4 w-4 mr-2" />
              Quick Add
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="dropdown-3d w-48">
            {quickAddItems.map((item, index) => (
              <DropdownMenuItem key={index} onClick={item.action} className="cursor-pointer hover:bg-accent/80 transition-colors">
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleDarkMode}
          className="hover:bg-accent/50 transition-all duration-200"
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-yellow-500" />
          ) : (
            <Moon className="h-4 w-4 text-slate-600" />
          )}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative hover:bg-accent/50 transition-all duration-200">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-primary text-primary-foreground animate-pulse">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="dropdown-3d w-80">
            <div className="p-4 border-b bg-gradient-secondary">
              <h4 className="font-semibold gradient-text">Notifications</h4>
            </div>
            <div className="p-2">
              <div className="space-y-2">
                <div className="activity-item">
                  <p className="text-sm font-medium">New email from John Doe</p>
                  <p className="text-xs text-muted-foreground">5 minutes ago</p>
                </div>
                <div className="activity-item">
                  <p className="text-sm font-medium">Project "Website Redesign" updated</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
                <div className="activity-item">
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
            <Button variant="ghost" size="sm" className="hover:bg-accent/50 transition-all duration-200">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="dropdown-3d">
            <DropdownMenuItem className="hover:bg-accent/80">Preferences</DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-accent/80">Integrations</DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-accent/80">Security</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="hover:bg-accent/80">Help & Support</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 hover:bg-accent/50 transition-all duration-200">
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block font-medium">John Doe</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="dropdown-3d">
            <div className="p-2 bg-gradient-secondary">
              <p className="font-medium">John Doe</p>
              <p className="text-sm text-muted-foreground">john@company.com</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="hover:bg-accent/80">Profile Settings</DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-accent/80">Switch Organization</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="hover:bg-accent/80">Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}