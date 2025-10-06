'use client'

import React, { useState, useCallback } from 'react'
import { 
  Settings, 
  Users, 
  Shield, 
  Database, 
  Mail, 
  Globe, 
  Users2, 
  ArrowRightLeft, 
  Lock, 
  FileText, 
  Zap, 
  BarChart3,
  Menu,
  X,
  Search,
  Bell,
  User,
  LogOut,
  ChevronDown,
  ChevronRight,
  Home,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DomainWizard } from '@/components/admin/DomainWizard'
import { MigrationDashboard } from '@/components/admin/MigrationDashboard'
import { InfoRail } from '@/components/admin/Help/InfoRail'
import UsersList from '@/components/admin/Users/UsersList'
import UserEditor from '@/components/admin/Users/UserEditor'
import GroupsDashboard from '@/components/admin/Routing/GroupsDashboard'
import RoutingRules from '@/components/admin/Routing/RoutingRules'
import SecurityDashboard from '@/components/admin/Security/SecurityDashboard'
import ComplianceManager from '@/components/admin/Security/ComplianceManager'
import EmailConfiguration from '@/components/admin/Email/EmailConfiguration'
import EmailSettings from '@/components/admin/Email/EmailSettings'
import IntegrationsDashboard from '@/components/admin/Integrations/IntegrationsDashboard'
import MonitoringDashboard from '@/components/admin/Monitoring/MonitoringDashboard'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AdminUser {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'helpdesk' | 'auditor' | 'user'
  status: 'active' | 'suspended' | 'pending'
  lastLogin: string
  permissions: string[]
}

interface Domain {
  id: string
  name: string
  status: 'verified' | 'pending' | 'failed'
  dnsHealth: 'healthy' | 'warning' | 'critical'
  lastSync: string
  mxRecords: number
  spfRecord: boolean
  dkimRecord: boolean
  dmarcRecord: boolean
}

interface Migration {
  id: string
  name: string
  source: string
  destination: string
  status: 'running' | 'completed' | 'failed' | 'paused'
  progress: number
  usersTotal: number
  usersCompleted: number
  startTime: string
  estimatedCompletion: string
}

interface SecurityPolicy {
  id: string
  name: string
  type: 'spam' | 'dlp' | 'encryption' | 'auth'
  status: 'active' | 'disabled'
  rules: number
  lastModified: string
}

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<any>
  href: string
  badge?: number
  children?: NavItem[]
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

const sampleAdminUser: AdminUser = {
  id: '1',
  name: 'Sebenza Admin',
  email: 'admin@sebenza.co.za',
  role: 'owner',
  status: 'active',
  lastLogin: new Date().toISOString(),
  permissions: ['all']
}

const sampleDomains: Domain[] = [
  {
    id: '1',
    name: 'sebenza.co.za',
    status: 'verified',
    dnsHealth: 'healthy',
    lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    mxRecords: 3,
    spfRecord: true,
    dkimRecord: true,
    dmarcRecord: true
  },
  {
    id: '2',
    name: 'partners.sebenza.co.za',
    status: 'pending',
    dnsHealth: 'warning',
    lastSync: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    mxRecords: 1,
    spfRecord: false,
    dkimRecord: true,
    dmarcRecord: false
  }
]

const sampleMigrations: Migration[] = [
  {
    id: '1',
    name: 'Legacy Gmail Migration',
    source: 'Gmail IMAP',
    destination: 'Sebenza Mail',
    status: 'running',
    progress: 65,
    usersTotal: 150,
    usersCompleted: 98,
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedCompletion: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
  }
]

const sampleSecurityPolicies: SecurityPolicy[] = [
  {
    id: '1',
    name: 'Anti-Spam Policy',
    type: 'spam',
    status: 'active',
    rules: 12,
    lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    name: 'PII Protection',
    type: 'dlp',
    status: 'active',
    rules: 8,
    lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
]

const navigationItems: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: Home,
    href: '/admin/overview'
  },
  {
    id: 'domains',
    label: 'Domains & DNS',
    icon: Globe,
    href: '/admin/domains',
    badge: 1
  },
  {
    id: 'users',
    label: 'Users & Roles',
    icon: Users,
    href: '/admin/users',
    badge: 3
  },
  {
    id: 'groups',
    label: 'Groups & Routing',
    icon: Users2,
    href: '/admin/groups'
  },
  {
    id: 'security',
    label: 'Security & Policies',
    icon: Shield,
    href: '/admin/security'
  },
  {
    id: 'compliance',
    label: 'Compliance',
    icon: CheckCircle,
    href: '/admin/compliance'
  },
  {
    id: 'migrations',
    label: 'Migrations',
    icon: ArrowRightLeft,
    href: '/admin/migrations',
    badge: 2
  },
  {
    id: 'email-config',
    label: 'Email Configuration',
    icon: Mail,
    href: '/admin/email-config'
  },
  {
    id: 'integrations',
    label: 'Integrations & APIs',
    icon: Zap,
    href: '/admin/integrations'
  },
  {
    id: 'monitoring',
    label: 'Monitoring & Audit',
    icon: BarChart3,
    href: '/admin/monitoring'
  }
]

// ============================================================================
// COMPONENTS
// ============================================================================

const HeaderBar = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <header className="bg-surface border-b border-border/50 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Mail className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Sebenza Mail Admin</h1>
              <p className="text-xs text-muted-foreground">Production Environment</p>
            </div>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search domains, users, policies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-border/50 focus:bg-background"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Environment Badge */}
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Live
          </Badge>

          {/* Notifications */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-4 w-4" />
                  {showNotifications && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{sampleAdminUser.name}</p>
              <p className="text-xs text-muted-foreground">{sampleAdminUser.role}</p>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

const SidebarNav = ({ activeSection, onSectionChange }: { activeSection: string, onSectionChange: (section: string) => void }) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupId)) {
        newSet.delete(groupId)
      } else {
        newSet.add(groupId)
      }
      return newSet
    })
  }

  return (
    <nav className="w-64 bg-surface border-r border-border/50 h-full overflow-y-auto">
      <div className="p-4">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "secondary" : "ghost"}
              className={`w-full justify-start h-10 px-3 ${
                activeSection === item.id 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              onClick={() => onSectionChange(item.id)}
            >
              <item.icon className="h-4 w-4 mr-3" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {item.badge}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>
    </nav>
  )
}

const OverviewDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-surface border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Domains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{sampleDomains.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {sampleDomains.filter(d => d.status === 'verified').length} verified
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">1,247</div>
            <p className="text-xs text-muted-foreground mt-1">+12 this week</p>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Running Migrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{sampleMigrations.filter(m => m.status === 'running').length}</div>
            <p className="text-xs text-muted-foreground mt-1">2 pending approval</p>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Security Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{sampleSecurityPolicies.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All active</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-surface border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Domain verification completed</p>
                <p className="text-xs text-muted-foreground">sebenza.co.za • 2 minutes ago</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                <RefreshCw className="h-4 w-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Migration progress updated</p>
                <p className="text-xs text-muted-foreground">Legacy Gmail Migration • 15 minutes ago</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="w-8 h-8 bg-yellow-500/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">DNS health warning</p>
                <p className="text-xs text-muted-foreground">partners.sebenza.co.za • 1 hour ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const DomainsDashboard = ({ onAddDomain }: { onAddDomain: () => void }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Domains & DNS</h2>
          <p className="text-muted-foreground">Manage your email domains and DNS configuration</p>
        </div>
        <Button 
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
          onClick={onAddDomain}
        >
          <Globe className="h-4 w-4 mr-2" />
          Add Domain
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sampleDomains.map((domain) => (
          <Card key={domain.id} className="bg-surface border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-foreground">{domain.name}</CardTitle>
                <Badge 
                  variant={domain.status === 'verified' ? 'default' : 'secondary'}
                  className={domain.status === 'verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}
                >
                  {domain.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">DNS Health</span>
                  <Badge 
                    variant={domain.dnsHealth === 'healthy' ? 'default' : 'destructive'}
                    className={domain.dnsHealth === 'healthy' ? 'bg-emerald-500/10 text-emerald-400' : ''}
                  >
                    {domain.dnsHealth}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`h-4 w-4 ${domain.spfRecord ? 'text-emerald-400' : 'text-red-400'}`} />
                    <span className="text-muted-foreground">SPF</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`h-4 w-4 ${domain.dkimRecord ? 'text-emerald-400' : 'text-red-400'}`} />
                    <span className="text-muted-foreground">DKIM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`h-4 w-4 ${domain.dmarcRecord ? 'text-emerald-400' : 'text-red-400'}`} />
                    <span className="text-muted-foreground">DMARC</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">MX Records: {domain.mxRecords}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Last sync: {new Date(domain.lastSync).toLocaleString()}</span>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Recheck
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

const UsersDashboard = () => {
  return (
    <UsersList 
      onAddUser={() => {
        setEditingUser(null)
        setShowUserEditor(true)
      }}
      onEditUser={(user) => {
        setEditingUser(user)
        setShowUserEditor(true)
      }}
    />
  )
}

const MigrationsDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Migrations</h2>
          <p className="text-muted-foreground">Monitor and manage email migrations</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
          <ArrowRightLeft className="h-4 w-4 mr-2" />
          New Migration
        </Button>
      </div>

      <div className="space-y-4">
        {sampleMigrations.map((migration) => (
          <Card key={migration.id} className="bg-surface border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-foreground">{migration.name}</CardTitle>
                <Badge 
                  variant={migration.status === 'running' ? 'default' : 'secondary'}
                  className={migration.status === 'running' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}
                >
                  {migration.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Source: {migration.source}</span>
                  <span className="text-muted-foreground">Destination: {migration.destination}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground font-medium">{migration.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${migration.progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Users: </span>
                    <span className="text-foreground">{migration.usersCompleted}/{migration.usersTotal}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Started: </span>
                    <span className="text-foreground">{new Date(migration.startTime).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MailAdminConsole() {
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showDomainWizard, setShowDomainWizard] = useState(false)
  const [showInfoRail, setShowInfoRail] = useState(true)
  const [showUserEditor, setShowUserEditor] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewDashboard />
      case 'domains':
        return <DomainsDashboard onAddDomain={() => setShowDomainWizard(true)} />
      case 'users':
        return <UsersDashboard />
      case 'groups':
        return <GroupsDashboard />
      case 'routing':
        return <RoutingRules />
      case 'security':
        return <SecurityDashboard />
      case 'compliance':
        return <ComplianceManager />
      case 'email-config':
        return <EmailConfiguration />
      case 'email-settings':
        return <EmailSettings />
      case 'integrations':
        return <IntegrationsDashboard />
      case 'monitoring':
        return <MonitoringDashboard />
      case 'migrations':
        return <MigrationDashboard />
      default:
        return <OverviewDashboard />
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-charcoal text-foreground">
        <style jsx>{`
          .bg-charcoal {
            background-color: #0f1115;
          }
          .bg-surface {
            background-color: #151822;
          }
          .text-emerald-400 {
            color: #10b981;
          }
          .text-copper-400 {
            color: #b87333;
          }
          .text-slate-400 {
            color: #94a3b8;
          }
        `}</style>
        
        <HeaderBar />
        
        <div className="flex h-[calc(100vh-80px)]">
          <SidebarNav 
            activeSection={activeSection} 
            onSectionChange={setActiveSection}
          />
          
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">
              {renderContent()}
            </div>
          </main>
          
          {showInfoRail && (
            <InfoRail />
          )}
        </div>
        
        <DomainWizard 
          isOpen={showDomainWizard}
          onClose={() => setShowDomainWizard(false)}
          onComplete={(domain) => {
            console.log('Domain setup completed:', domain)
            setShowDomainWizard(false)
          }}
        />

        {/* User Editor Modal */}
        {showUserEditor && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-6xl h-[90vh] overflow-hidden">
                <div className="h-full overflow-y-auto">
                  <UserEditor
                    user={editingUser}
                    onSave={(userData) => {
                      console.log('User saved:', userData)
                      setShowUserEditor(false)
                      setEditingUser(null)
                    }}
                    onCancel={() => {
                      setShowUserEditor(false)
                      setEditingUser(null)
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
