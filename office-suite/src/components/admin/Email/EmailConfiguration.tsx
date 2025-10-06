'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Mail, 
  Settings,
  Server,
  Database,
  Shield,
  Key,
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Save,
  RefreshCw,
  Download,
  Upload,
  TestTube,
  Zap,
  Bell,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Activity,
  TrendingUp,
  BarChart3,
  Users,
  MailPlus,
  Send,
  Archive,
  Trash2 as TrashIcon,
  Star,
  Flag,
  Tag,
  Folder,
  Inbox,
  Outbox,
  Draft,
  Spam,
  AlertCircle,
  CheckSquare,
  XSquare,
  Play,
  Pause,
  RotateCcw,
  Power,
  Wifi,
  WifiOff,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Lock,
  Unlock,
  User,
  UserCheck,
  UserX,
  MailOpen,
  MailCheck,
  MailX,
  MailWarning,
  MailClock,
  MailSearch,
  MailFilter,
  MailArchive,
  MailTrash,
  MailStar,
  MailFlag,
  MailTag,
  MailFolder,
  MailInbox,
  MailOutbox,
  MailDraft,
  MailSpam
} from 'lucide-react'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface EmailServer {
  id: string
  name: string
  type: 'smtp' | 'imap' | 'pop3' | 'exchange'
  host: string
  port: number
  encryption: 'none' | 'ssl' | 'tls' | 'starttls'
  authentication: 'none' | 'password' | 'oauth2' | 'ntlm'
  status: 'active' | 'inactive' | 'error' | 'testing'
  lastTested: string
  responseTime: number
  uptime: number
  configuration: EmailServerConfig
}

interface EmailServerConfig {
  maxConnections: number
  timeout: number
  retryAttempts: number
  queueSize: number
  rateLimit: number
  sslVerify: boolean
  allowInsecure: boolean
  compression: boolean
  keepAlive: boolean
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  type: 'welcome' | 'notification' | 'marketing' | 'system' | 'custom'
  category: string
  isActive: boolean
  variables: string[]
  lastModified: string
  createdBy: string
  usage: number
}

interface EmailRule {
  id: string
  name: string
  description: string
  condition: string
  action: string
  priority: number
  isActive: boolean
  lastTriggered: string
  triggerCount: number
  category: 'filtering' | 'routing' | 'processing' | 'security' | 'compliance'
}

interface EmailQuota {
  id: string
  user: string
  domain: string
  storageUsed: number
  storageLimit: number
  messageCount: number
  messageLimit: number
  lastReset: string
  nextReset: string
  status: 'normal' | 'warning' | 'exceeded' | 'suspended'
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

const sampleServers: EmailServer[] = [
  {
    id: '1',
    name: 'Primary SMTP Server',
    type: 'smtp',
    host: 'smtp.sebenza.co.za',
    port: 587,
    encryption: 'tls',
    authentication: 'password',
    status: 'active',
    lastTested: '2024-01-15T10:30:00Z',
    responseTime: 45,
    uptime: 99.9,
    configuration: {
      maxConnections: 100,
      timeout: 30,
      retryAttempts: 3,
      queueSize: 1000,
      rateLimit: 100,
      sslVerify: true,
      allowInsecure: false,
      compression: true,
      keepAlive: true
    }
  },
  {
    id: '2',
    name: 'IMAP Server',
    type: 'imap',
    host: 'imap.sebenza.co.za',
    port: 993,
    encryption: 'ssl',
    authentication: 'password',
    status: 'active',
    lastTested: '2024-01-15T10:25:00Z',
    responseTime: 32,
    uptime: 99.8,
    configuration: {
      maxConnections: 50,
      timeout: 60,
      retryAttempts: 2,
      queueSize: 500,
      rateLimit: 50,
      sslVerify: true,
      allowInsecure: false,
      compression: false,
      keepAlive: true
    }
  },
  {
    id: '3',
    name: 'Exchange Server',
    type: 'exchange',
    host: 'exchange.sebenza.co.za',
    port: 443,
    encryption: 'ssl',
    authentication: 'oauth2',
    status: 'testing',
    lastTested: '2024-01-15T10:20:00Z',
    responseTime: 0,
    uptime: 0,
    configuration: {
      maxConnections: 25,
      timeout: 45,
      retryAttempts: 3,
      queueSize: 250,
      rateLimit: 25,
      sslVerify: true,
      allowInsecure: false,
      compression: true,
      keepAlive: false
    }
  }
]

const sampleTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Welcome Email',
    subject: 'Welcome to Sebenza!',
    content: 'Welcome {{user_name}}! Thank you for joining Sebenza...',
    type: 'welcome',
    category: 'Onboarding',
    isActive: true,
    variables: ['user_name', 'company_name', 'login_url'],
    lastModified: '2024-01-15T10:00:00Z',
    createdBy: 'admin@sebenza.co.za',
    usage: 1247
  },
  {
    id: '2',
    name: 'Password Reset',
    subject: 'Reset Your Password',
    content: 'Click here to reset your password: {{reset_link}}...',
    type: 'system',
    category: 'Security',
    isActive: true,
    variables: ['user_name', 'reset_link', 'expiry_time'],
    lastModified: '2024-01-14T16:30:00Z',
    createdBy: 'admin@sebenza.co.za',
    usage: 892
  },
  {
    id: '3',
    name: 'Newsletter Template',
    subject: 'Sebenza Weekly Update',
    content: 'Here are this week\'s updates: {{content}}...',
    type: 'marketing',
    category: 'Newsletter',
    isActive: false,
    variables: ['content', 'unsubscribe_link'],
    lastModified: '2024-01-13T09:15:00Z',
    createdBy: 'marketing@sebenza.co.za',
    usage: 0
  }
]

const sampleRules: EmailRule[] = [
  {
    id: '1',
    name: 'Spam Filter',
    description: 'Filter out spam emails',
    condition: 'subject contains "spam" OR sender in blacklist',
    action: 'move to spam folder',
    priority: 1,
    isActive: true,
    lastTriggered: '2024-01-15T14:30:00Z',
    triggerCount: 1247,
    category: 'filtering'
  },
  {
    id: '2',
    name: 'VIP Routing',
    description: 'Route VIP emails to priority inbox',
    condition: 'sender in vip_list',
    action: 'route to priority inbox',
    priority: 2,
    isActive: true,
    lastTriggered: '2024-01-15T13:45:00Z',
    triggerCount: 234,
    category: 'routing'
  },
  {
    id: '3',
    name: 'Auto-Reply',
    description: 'Send auto-reply to external emails',
    condition: 'sender domain != sebenza.co.za',
    action: 'send auto-reply',
    priority: 3,
    isActive: false,
    lastTriggered: '2024-01-14T16:20:00Z',
    triggerCount: 0,
    category: 'processing'
  }
]

const sampleQuotas: EmailQuota[] = [
  {
    id: '1',
    user: 'thabo@sebenza.co.za',
    domain: 'sebenza.co.za',
    storageUsed: 2.5,
    storageLimit: 10,
    messageCount: 1247,
    messageLimit: 5000,
    lastReset: '2024-01-01T00:00:00Z',
    nextReset: '2024-02-01T00:00:00Z',
    status: 'normal'
  },
  {
    id: '2',
    user: 'nomsa@sebenza.co.za',
    domain: 'sebenza.co.za',
    storageUsed: 8.2,
    storageLimit: 10,
    messageCount: 3892,
    messageLimit: 5000,
    lastReset: '2024-01-01T00:00:00Z',
    nextReset: '2024-02-01T00:00:00Z',
    status: 'warning'
  },
  {
    id: '3',
    user: 'sipho@sebenza.co.za',
    domain: 'sebenza.co.za',
    storageUsed: 12.5,
    storageLimit: 10,
    messageCount: 5234,
    messageLimit: 5000,
    lastReset: '2024-01-01T00:00:00Z',
    nextReset: '2024-02-01T00:00:00Z',
    status: 'exceeded'
  }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'inactive': return <XCircle className="h-4 w-4 text-red-500" />
    case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />
    case 'testing': return <Clock className="h-4 w-4 text-yellow-500" />
    default: return <Info className="h-4 w-4 text-gray-500" />
  }
}

const getQuotaStatusIcon = (status: string) => {
  switch (status) {
    case 'normal': return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    case 'exceeded': return <XCircle className="h-4 w-4 text-red-500" />
    case 'suspended': return <AlertCircle className="h-4 w-4 text-red-500" />
    default: return <Info className="h-4 w-4 text-gray-500" />
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 GB'
  const gb = bytes / (1024 * 1024 * 1024)
  return `${gb.toFixed(1)} GB`
}

const getQuotaPercentage = (used: number, limit: number) => {
  return Math.round((used / limit) * 100)
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EmailConfiguration() {
  const [activeTab, setActiveTab] = useState('servers')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')

  // ============================================================================
  // FILTERED DATA
  // ============================================================================
  
  const filteredServers = sampleServers.filter(server =>
    server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    server.host.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredTemplates = sampleTemplates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredRules = sampleRules.filter(rule =>
    rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredQuotas = sampleQuotas.filter(quota =>
    quota.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quota.domain.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleSelectAll = (items: any[]) => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(items.map(item => item.id)))
    }
  }

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on items:`, Array.from(selectedItems))
    // Implement bulk actions here
  }

  const handleTestServer = (serverId: string) => {
    console.log(`Testing server: ${serverId}`)
    // Implement server testing here
  }

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Email Configuration</h2>
          <p className="text-muted-foreground">Configure email servers, templates, rules, and quotas</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search email configuration..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="testing">Testing</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="smtp">SMTP</SelectItem>
                <SelectItem value="imap">IMAP</SelectItem>
                <SelectItem value="pop3">POP3</SelectItem>
                <SelectItem value="exchange">Exchange</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="servers">Email Servers</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="quotas">Quotas</TabsTrigger>
        </TabsList>

        {/* Email Servers */}
        <TabsContent value="servers" className="space-y-6">
          {/* Bulk Actions */}
          {selectedItems.size > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleBulkAction('test')}>
                      <TestTube className="h-4 w-4 mr-1" />
                      Test All
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleBulkAction('activate')}>
                      <Power className="h-4 w-4 mr-1" />
                      Activate
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleBulkAction('deactivate')}>
                      <Pause className="h-4 w-4 mr-1" />
                      Deactivate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Servers Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="p-4 text-left">
                        <Checkbox
                          checked={selectedItems.size === filteredServers.length && filteredServers.length > 0}
                          onCheckedChange={() => handleSelectAll(filteredServers)}
                        />
                      </th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Server</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Type</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Host</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Performance</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredServers.map((server) => (
                      <tr key={server.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-4">
                          <Checkbox
                            checked={selectedItems.has(server.id)}
                            onCheckedChange={() => handleSelectItem(server.id)}
                          />
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-foreground">{server.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {server.host}:{server.port} ({server.encryption.toUpperCase()})
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary" className="uppercase">
                            {server.type}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{server.host}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(server.status)}
                            <span className="capitalize">{server.status}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">
                              Response: {server.responseTime}ms
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Uptime: {server.uptime}%
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Last tested: {formatDate(server.lastTested)}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTestServer(server.id)}
                            >
                              <TestTube className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="p-4 text-left">
                        <Checkbox
                          checked={selectedItems.size === filteredTemplates.length && filteredTemplates.length > 0}
                          onCheckedChange={() => handleSelectAll(filteredTemplates)}
                        />
                      </th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Template</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Type</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Category</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Usage</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTemplates.map((template) => (
                      <tr key={template.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-4">
                          <Checkbox
                            checked={selectedItems.has(template.id)}
                            onCheckedChange={() => handleSelectItem(template.id)}
                          />
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-foreground">{template.name}</div>
                            <div className="text-sm text-muted-foreground">{template.subject}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Modified: {formatDate(template.lastModified)}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary" className="capitalize">
                            {template.type}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{template.category}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {template.isActive ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="capitalize">
                              {template.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-medium text-foreground">
                            {template.usage.toLocaleString()}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rules */}
        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="p-4 text-left">
                        <Checkbox
                          checked={selectedItems.size === filteredRules.length && filteredRules.length > 0}
                          onCheckedChange={() => handleSelectAll(filteredRules)}
                        />
                      </th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Rule</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Category</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Priority</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Triggers</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRules.map((rule) => (
                      <tr key={rule.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-4">
                          <Checkbox
                            checked={selectedItems.has(rule.id)}
                            onCheckedChange={() => handleSelectItem(rule.id)}
                          />
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-foreground">{rule.name}</div>
                            <div className="text-sm text-muted-foreground">{rule.description}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Condition: {rule.condition}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Action: {rule.action}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="capitalize">
                            {rule.category}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary">
                            {rule.priority}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {rule.isActive ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="capitalize">
                              {rule.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-foreground">
                              {rule.triggerCount.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Last: {formatDate(rule.lastTriggered)}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quotas */}
        <TabsContent value="quotas" className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="p-4 text-left">
                        <Checkbox
                          checked={selectedItems.size === filteredQuotas.length && filteredQuotas.length > 0}
                          onCheckedChange={() => handleSelectAll(filteredQuotas)}
                        />
                      </th>
                      <th className="p-4 text-left font-medium text-muted-foreground">User</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Domain</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Storage</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Messages</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuotas.map((quota) => (
                      <tr key={quota.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-4">
                          <Checkbox
                            checked={selectedItems.has(quota.id)}
                            onCheckedChange={() => handleSelectItem(quota.id)}
                          />
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-foreground">{quota.user}</div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{quota.domain}</td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-foreground">
                              {formatFileSize(quota.storageUsed)} / {formatFileSize(quota.storageLimit)}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  getQuotaPercentage(quota.storageUsed, quota.storageLimit) > 90
                                    ? 'bg-red-500'
                                    : getQuotaPercentage(quota.storageUsed, quota.storageLimit) > 75
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                }`}
                                style={{
                                  width: `${Math.min(getQuotaPercentage(quota.storageUsed, quota.storageLimit), 100)}%`
                                }}
                              />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {getQuotaPercentage(quota.storageUsed, quota.storageLimit)}% used
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-foreground">
                              {quota.messageCount.toLocaleString()} / {quota.messageLimit.toLocaleString()}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  getQuotaPercentage(quota.messageCount, quota.messageLimit) > 90
                                    ? 'bg-red-500'
                                    : getQuotaPercentage(quota.messageCount, quota.messageLimit) > 75
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                }`}
                                style={{
                                  width: `${Math.min(getQuotaPercentage(quota.messageCount, quota.messageLimit), 100)}%`
                                }}
                              />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {getQuotaPercentage(quota.messageCount, quota.messageLimit)}% used
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getQuotaStatusIcon(quota.status)}
                            <span className="capitalize">{quota.status}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Server className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{sampleServers.length}</div>
                <div className="text-sm text-muted-foreground">Email Servers</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{sampleTemplates.length}</div>
                <div className="text-sm text-muted-foreground">Email Templates</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{sampleRules.length}</div>
                <div className="text-sm text-muted-foreground">Email Rules</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{sampleQuotas.length}</div>
                <div className="text-sm text-muted-foreground">User Quotas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
