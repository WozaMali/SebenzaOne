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
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Settings,
  Zap,
  Globe,
  Database,
  Shield,
  Key,
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
  Bell,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Activity,
  TrendingUp,
  BarChart3,
  Users,
  Mail,
  Send,
  Archive,
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

interface Integration {
  id: string
  name: string
  description: string
  type: 'oauth' | 'api' | 'webhook' | 'smtp' | 'imap' | 'pop3' | 'exchange'
  provider: string
  status: 'active' | 'inactive' | 'error' | 'testing'
  lastSync: string
  syncCount: number
  configuration: IntegrationConfig
}

interface IntegrationConfig {
  endpoint: string
  apiKey?: string
  secret?: string
  scope: string[]
  rateLimit: number
  timeout: number
  retryAttempts: number
  isSecure: boolean
}

interface APIDocumentation {
  id: string
  name: string
  description: string
  version: string
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  parameters: APIParameter[]
  responses: APIResponse[]
  examples: APIExample[]
}

interface APIParameter {
  name: string
  type: string
  required: boolean
  description: string
  example: any
}

interface APIResponse {
  code: number
  description: string
  schema: any
}

interface APIExample {
  name: string
  request: any
  response: any
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

const sampleIntegrations: Integration[] = [
  {
    id: '1',
    name: 'Google Workspace',
    description: 'Sync with Google Workspace for calendar and contacts',
    type: 'oauth',
    provider: 'Google',
    status: 'active',
    lastSync: '2024-01-15T10:30:00Z',
    syncCount: 1247,
    configuration: {
      endpoint: 'https://www.googleapis.com/',
      scope: ['calendar', 'contacts', 'gmail'],
      rateLimit: 100,
      timeout: 30,
      retryAttempts: 3,
      isSecure: true
    }
  },
  {
    id: '2',
    name: 'Microsoft 365',
    description: 'Integration with Microsoft 365 for email and calendar',
    type: 'oauth',
    provider: 'Microsoft',
    status: 'active',
    lastSync: '2024-01-15T10:25:00Z',
    syncCount: 892,
    configuration: {
      endpoint: 'https://graph.microsoft.com/',
      scope: ['mail', 'calendar', 'contacts'],
      rateLimit: 50,
      timeout: 45,
      retryAttempts: 2,
      isSecure: true
    }
  },
  {
    id: '3',
    name: 'Slack Webhook',
    description: 'Send notifications to Slack channels',
    type: 'webhook',
    provider: 'Slack',
    status: 'testing',
    lastSync: '2024-01-15T10:20:00Z',
    syncCount: 0,
    configuration: {
      endpoint: 'https://hooks.slack.com/services/...',
      rateLimit: 10,
      timeout: 15,
      retryAttempts: 1,
      isSecure: true
    }
  }
]

const sampleAPIs: APIDocumentation[] = [
  {
    id: '1',
    name: 'Email API',
    description: 'Send and manage emails programmatically',
    version: 'v1.0',
    endpoint: '/api/email',
    method: 'POST',
    parameters: [
      {
        name: 'to',
        type: 'string',
        required: true,
        description: 'Recipient email address',
        example: 'user@example.com'
      },
      {
        name: 'subject',
        type: 'string',
        required: true,
        description: 'Email subject line',
        example: 'Hello World'
      },
      {
        name: 'body',
        type: 'string',
        required: true,
        description: 'Email body content',
        example: 'This is the email content'
      }
    ],
    responses: [
      {
        code: 200,
        description: 'Email sent successfully',
        schema: { messageId: 'string', status: 'string' }
      },
      {
        code: 400,
        description: 'Invalid request parameters',
        schema: { error: 'string', details: 'string' }
      }
    ],
    examples: [
      {
        name: 'Basic Email',
        request: {
          to: 'user@example.com',
          subject: 'Hello',
          body: 'Hello World!'
        },
        response: {
          messageId: 'msg_123',
          status: 'sent'
        }
      }
    ]
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function IntegrationsDashboard() {
  const [activeTab, setActiveTab] = useState('integrations')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  const filteredIntegrations = sampleIntegrations.filter(integration =>
    integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    integration.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    integration.provider.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredAPIs = sampleAPIs.filter(api =>
    api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    api.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Integrations & APIs</h2>
          <p className="text-muted-foreground">Manage external integrations and API documentation</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
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
                  placeholder="Search integrations and APIs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="apis">API Documentation</TabsTrigger>
        </TabsList>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="p-4 text-left">
                        <Checkbox
                          checked={selectedItems.size === filteredIntegrations.length && filteredIntegrations.length > 0}
                          onCheckedChange={() => handleSelectAll(filteredIntegrations)}
                        />
                      </th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Integration</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Provider</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Type</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Last Sync</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIntegrations.map((integration) => (
                      <tr key={integration.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-4">
                          <Checkbox
                            checked={selectedItems.has(integration.id)}
                            onCheckedChange={() => handleSelectItem(integration.id)}
                          />
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-foreground">{integration.name}</div>
                            <div className="text-sm text-muted-foreground">{integration.description}</div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{integration.provider}</td>
                        <td className="p-4">
                          <Badge variant="secondary" className="uppercase">
                            {integration.type}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(integration.status)}
                            <span className="capitalize">{integration.status}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">
                              {formatDate(integration.lastSync)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {integration.syncCount} syncs
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
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

        {/* API Documentation */}
        <TabsContent value="apis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAPIs.map((api) => (
              <Card key={api.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{api.name}</CardTitle>
                    <Badge variant="outline">{api.version}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{api.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Endpoint</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="uppercase">
                        {api.method}
                      </Badge>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {api.endpoint}
                      </code>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Parameters</Label>
                    <div className="space-y-1">
                      {api.parameters.slice(0, 3).map((param, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <span className="font-medium">{param.name}</span>
                          <span className="text-muted-foreground">({param.type})</span>
                          {param.required && (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          )}
                        </div>
                      ))}
                      {api.parameters.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{api.parameters.length - 3} more parameters
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View Docs
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{sampleIntegrations.length}</div>
                <div className="text-sm text-muted-foreground">Active Integrations</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{sampleAPIs.length}</div>
                <div className="text-sm text-muted-foreground">API Endpoints</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {sampleIntegrations.reduce((sum, integration) => sum + integration.syncCount, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Syncs</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {sampleIntegrations.filter(i => i.status === 'active').length}
                </div>
                <div className="text-sm text-muted-foreground">Secure Connections</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
