'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Users, 
  Mail, 
  Shield, 
  ArrowRightLeft,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Globe,
  UserPlus,
  MailPlus,
  Lock,
  Unlock
} from 'lucide-react'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface DistributionList {
  id: string
  name: string
  email: string
  description: string
  members: string[]
  moderators: string[]
  isModerated: boolean
  allowExternal: boolean
  status: 'active' | 'suspended' | 'pending'
  createdAt: string
  lastActivity: string
}

interface SharedMailbox {
  id: string
  name: string
  email: string
  description: string
  permissions: {
    read: string[]
    write: string[]
    admin: string[]
  }
  status: 'active' | 'suspended'
  createdAt: string
  lastActivity: string
}

interface RoutingRule {
  id: string
  name: string
  description: string
  conditions: {
    sender?: string
    recipient?: string
    domain?: string
    subject?: string
    attachmentSize?: number
  }
  actions: {
    route?: string
    quarantine?: boolean
    tag?: string[]
    bounce?: boolean
    notify?: string[]
  }
  priority: number
  isActive: boolean
  createdAt: string
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

const sampleDistributionLists: DistributionList[] = [
  {
    id: '1',
    name: 'Sebenza Team',
    email: 'team@sebenza.co.za',
    description: 'Internal team communications',
    members: ['thabo@sebenza.co.za', 'nomsa@sebenza.co.za', 'sipho@sebenza.co.za'],
    moderators: ['thabo@sebenza.co.za'],
    isModerated: false,
    allowExternal: false,
    status: 'active',
    createdAt: '2023-01-01T00:00:00Z',
    lastActivity: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Community Updates',
    email: 'updates@sebenza.co.za',
    description: 'Community newsletter and updates',
    members: ['thabo@sebenza.co.za', 'nomsa@sebenza.co.za', 'sipho@sebenza.co.za', 'lerato@sebenza.co.za', 'mandla@sebenza.co.za'],
    moderators: ['nomsa@sebenza.co.za'],
    isModerated: true,
    allowExternal: true,
    status: 'active',
    createdAt: '2023-03-15T00:00:00Z',
    lastActivity: '2024-01-14T16:45:00Z'
  },
  {
    id: '3',
    name: 'Support Team',
    email: 'support@sebenza.co.za',
    description: 'Customer support communications',
    members: ['sipho@sebenza.co.za', 'nomsa@sebenza.co.za'],
    moderators: ['nomsa@sebenza.co.za'],
    isModerated: false,
    allowExternal: true,
    status: 'active',
    createdAt: '2023-06-01T00:00:00Z',
    lastActivity: '2024-01-15T09:15:00Z'
  }
]

const sampleSharedMailboxes: SharedMailbox[] = [
  {
    id: '1',
    name: 'Sales Inbox',
    email: 'sales@sebenza.co.za',
    description: 'Shared sales inquiries mailbox',
    permissions: {
      read: ['thabo@sebenza.co.za', 'nomsa@sebenza.co.za'],
      write: ['thabo@sebenza.co.za', 'nomsa@sebenza.co.za'],
      admin: ['thabo@sebenza.co.za']
    },
    status: 'active',
    createdAt: '2023-02-01T00:00:00Z',
    lastActivity: '2024-01-15T08:30:00Z'
  },
  {
    id: '2',
    name: 'HR Communications',
    email: 'hr@sebenza.co.za',
    description: 'Human resources communications',
    permissions: {
      read: ['nomsa@sebenza.co.za', 'mandla@sebenza.co.za'],
      write: ['nomsa@sebenza.co.za'],
      admin: ['nomsa@sebenza.co.za']
    },
    status: 'active',
    createdAt: '2023-04-01T00:00:00Z',
    lastActivity: '2024-01-14T14:20:00Z'
  }
]

const sampleRoutingRules: RoutingRule[] = [
  {
    id: '1',
    name: 'Spam Filter',
    description: 'Route suspected spam to quarantine',
    conditions: {
      subject: 'spam|viagra|lottery',
      attachmentSize: 50000000 // 50MB
    },
    actions: {
      quarantine: true,
      tag: ['spam', 'quarantine'],
      notify: ['admin@sebenza.co.za']
    },
    priority: 1,
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Support Routing',
    description: 'Route support emails to support team',
    conditions: {
      recipient: 'support@sebenza.co.za',
      subject: 'help|support|issue'
    },
    actions: {
      route: 'support@sebenza.co.za',
      tag: ['support', 'urgent']
    },
    priority: 2,
    isActive: true,
    createdAt: '2023-02-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Large Attachments',
    description: 'Handle large attachment emails',
    conditions: {
      attachmentSize: 100000000 // 100MB
    },
    actions: {
      route: 'large-files@sebenza.co.za',
      tag: ['large-attachment'],
      notify: ['admin@sebenza.co.za']
    },
    priority: 3,
    isActive: true,
    createdAt: '2023-03-01T00:00:00Z'
  }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'suspended': return <XCircle className="h-4 w-4 text-red-500" />
    case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
    default: return <AlertTriangle className="h-4 w-4 text-gray-500" />
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

export default function GroupsDashboard() {
  const [activeTab, setActiveTab] = useState('distribution-lists')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  // ============================================================================
  // FILTERED DATA
  // ============================================================================
  
  const filteredDistributionLists = sampleDistributionLists.filter(list =>
    list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    list.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    list.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredSharedMailboxes = sampleSharedMailboxes.filter(mailbox =>
    mailbox.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mailbox.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mailbox.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredRoutingRules = sampleRoutingRules.filter(rule =>
    rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.description.toLowerCase().includes(searchQuery.toLowerCase())
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

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Groups & Routing</h2>
          <p className="text-muted-foreground">Manage distribution lists, shared mailboxes, and routing rules</p>
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search groups, mailboxes, and rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="distribution-lists">Distribution Lists</TabsTrigger>
          <TabsTrigger value="shared-mailboxes">Shared Mailboxes</TabsTrigger>
          <TabsTrigger value="routing-rules">Routing Rules</TabsTrigger>
        </TabsList>

        {/* Distribution Lists */}
        <TabsContent value="distribution-lists" className="space-y-6">
          {/* Bulk Actions */}
          {selectedItems.size > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleBulkAction('suspend')}>
                      Suspend
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleBulkAction('activate')}>
                      Activate
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleBulkAction('delete')}>
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Distribution Lists Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="p-4 text-left">
                        <Checkbox
                          checked={selectedItems.size === filteredDistributionLists.length && filteredDistributionLists.length > 0}
                          onCheckedChange={() => handleSelectAll(filteredDistributionLists)}
                        />
                      </th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Name</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Email</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Members</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDistributionLists.map((list) => (
                      <tr key={list.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-4">
                          <Checkbox
                            checked={selectedItems.has(list.id)}
                            onCheckedChange={() => handleSelectItem(list.id)}
                          />
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-foreground">{list.name}</div>
                            <div className="text-sm text-muted-foreground">{list.description}</div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{list.email}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{list.members.length}</span>
                            {list.isModerated && (
                              <Badge variant="secondary" className="text-xs">
                                Moderated
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(list.status)}
                            <span className="capitalize">{list.status}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
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

        {/* Shared Mailboxes */}
        <TabsContent value="shared-mailboxes" className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="p-4 text-left">
                        <Checkbox
                          checked={selectedItems.size === filteredSharedMailboxes.length && filteredSharedMailboxes.length > 0}
                          onCheckedChange={() => handleSelectAll(filteredSharedMailboxes)}
                        />
                      </th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Name</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Email</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Permissions</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSharedMailboxes.map((mailbox) => (
                      <tr key={mailbox.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-4">
                          <Checkbox
                            checked={selectedItems.has(mailbox.id)}
                            onCheckedChange={() => handleSelectItem(mailbox.id)}
                          />
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-foreground">{mailbox.name}</div>
                            <div className="text-sm text-muted-foreground">{mailbox.description}</div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{mailbox.email}</td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Shield className="h-3 w-3 text-green-500" />
                              <span className="text-xs">Read: {mailbox.permissions.read.length}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Edit className="h-3 w-3 text-blue-500" />
                              <span className="text-xs">Write: {mailbox.permissions.write.length}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Settings className="h-3 w-3 text-purple-500" />
                              <span className="text-xs">Admin: {mailbox.permissions.admin.length}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(mailbox.status)}
                            <span className="capitalize">{mailbox.status}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
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

        {/* Routing Rules */}
        <TabsContent value="routing-rules" className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="p-4 text-left">
                        <Checkbox
                          checked={selectedItems.size === filteredRoutingRules.length && filteredRoutingRules.length > 0}
                          onCheckedChange={() => handleSelectAll(filteredRoutingRules)}
                        />
                      </th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Name</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Conditions</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Actions</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Priority</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoutingRules.map((rule) => (
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
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            {rule.conditions.sender && (
                              <div className="text-xs text-muted-foreground">
                                From: {rule.conditions.sender}
                              </div>
                            )}
                            {rule.conditions.recipient && (
                              <div className="text-xs text-muted-foreground">
                                To: {rule.conditions.recipient}
                              </div>
                            )}
                            {rule.conditions.subject && (
                              <div className="text-xs text-muted-foreground">
                                Subject: {rule.conditions.subject}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            {rule.actions.route && (
                              <div className="text-xs text-muted-foreground">
                                Route: {rule.actions.route}
                              </div>
                            )}
                            {rule.actions.quarantine && (
                              <div className="text-xs text-muted-foreground">
                                Quarantine
                              </div>
                            )}
                            {rule.actions.tag && rule.actions.tag.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                Tags: {rule.actions.tag.join(', ')}
                              </div>
                            )}
                          </div>
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
                            <span className="capitalize">{rule.isActive ? 'Active' : 'Inactive'}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
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
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{sampleDistributionLists.length}</div>
                <div className="text-sm text-muted-foreground">Distribution Lists</div>
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
                <div className="text-2xl font-bold">{sampleSharedMailboxes.length}</div>
                <div className="text-sm text-muted-foreground">Shared Mailboxes</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <ArrowRightLeft className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{sampleRoutingRules.length}</div>
                <div className="text-sm text-muted-foreground">Routing Rules</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {sampleRoutingRules.filter(r => r.isActive).length}
                </div>
                <div className="text-sm text-muted-foreground">Active Rules</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
