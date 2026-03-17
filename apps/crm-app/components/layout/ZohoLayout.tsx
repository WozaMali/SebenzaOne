'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Search,
  Bell,
  Settings,
  Menu,
  X,
  ChevronDown,
  Home,
  Users,
  Building2,
  Target,
  Truck,
  Package,
  DollarSign,
  BarChart3,
  FileText,
  Calendar,
  Mail,
  Phone,
  PieChart,
  Route as RouteIcon,
  Zap,
  Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ZohoLayoutProps {
  children: ReactNode
  activeModule: string
  onModuleChange: (module: string) => void
  sidebarCollapsed?: boolean
  onSidebarToggle?: () => void
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

const modules = [
  { id: 'dashboard', label: 'Home', icon: Home, badge: null },
  { id: 'leads', label: 'Leads', icon: Users, badge: null },
  { id: 'contacts', label: 'Contacts', icon: Users, badge: null },
  { id: 'accounts', label: 'Accounts', icon: Building2, badge: null },
  { id: 'deals', label: 'Deals', icon: Target, badge: 'New' },
  { id: 'customers', label: 'Customers', icon: Users, badge: null },
  { id: 'partners', label: 'Partners', icon: Building2, badge: null },
  { id: 'collections', label: 'Collections', icon: Truck, badge: null },
  { id: 'materials', label: 'Materials', icon: Package, badge: null },
  { id: 'routes', label: 'Routes', icon: RouteIcon, badge: null },
  { id: 'invoices', label: 'Invoices', icon: FileText, badge: null },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
  { id: 'reports', label: 'Reports', icon: PieChart, badge: null },
]

export function ZohoLayout({
  children,
  activeModule,
  onModuleChange,
  sidebarCollapsed = false,
  onSidebarToggle,
  user
}: ZohoLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={cn(
          'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo Area */}
        <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">Z</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">CRM</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSidebarToggle}
            className="h-8 w-8 p-0"
          >
            {sidebarCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-1">
            {modules.map((module) => {
              const Icon = module.icon
              const isActive = activeModule === module.id
              return (
                <button
                  key={module.id}
                  onClick={() => onModuleChange(module.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative group',
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                  title={sidebarCollapsed ? module.label : undefined}
                >
                  <Icon className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isActive ? 'text-blue-600 dark:text-blue-400' : ''
                  )} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">{module.label}</span>
                      {module.badge && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                          {module.badge}
                        </span>
                      )}
                    </>
                  )}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
                  )}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Bottom Actions */}
        {!sidebarCollapsed && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-700 dark:text-gray-300"
            >
              <Settings className="h-4 w-4 mr-2" />
              Setup
            </Button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-4 flex-1">
            {/* Search */}
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search anything in CRM..."
                className="pl-9 h-9 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800" />
            </Button>
            
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <Settings className="h-5 w-5" />
            </Button>

            {/* User Menu */}
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200 dark:border-gray-700">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-blue-600 text-white">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              {user && (
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
              )}
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  )
}
