'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Play, 
  Pause, 
  ArrowRightLeft,
  Shield,
  Tag,
  Mail,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  Filter,
  Search,
  X
} from 'lucide-react'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

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
    headerContains?: string
    bodyContains?: string
  }
  actions: {
    route?: string
    quarantine?: boolean
    tag?: string[]
    bounce?: boolean
    notify?: string[]
    forward?: string
    reply?: string
  }
  priority: number
  isActive: boolean
  createdAt: string
  lastModified: string
  matchCount: number
}

interface RuleTemplate {
  id: string
  name: string
  description: string
  category: string
  conditions: any
  actions: any
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

const sampleRules: RoutingRule[] = [
  {
    id: '1',
    name: 'Spam Filter',
    description: 'Route suspected spam to quarantine',
    conditions: {
      subject: 'spam|viagra|lottery|winner|congratulations',
      attachmentSize: 50000000, // 50MB
      bodyContains: 'click here|free money|urgent action'
    },
    actions: {
      quarantine: true,
      tag: ['spam', 'quarantine'],
      notify: ['admin@sebenza.co.za']
    },
    priority: 1,
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    lastModified: '2024-01-15T10:30:00Z',
    matchCount: 1247
  },
  {
    id: '2',
    name: 'Support Routing',
    description: 'Route support emails to support team',
    conditions: {
      recipient: 'support@sebenza.co.za',
      subject: 'help|support|issue|problem|bug'
    },
    actions: {
      route: 'support@sebenza.co.za',
      tag: ['support', 'urgent'],
      notify: ['sipho@sebenza.co.za', 'nomsa@sebenza.co.za']
    },
    priority: 2,
    isActive: true,
    createdAt: '2023-02-01T00:00:00Z',
    lastModified: '2024-01-14T16:45:00Z',
    matchCount: 892
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
    createdAt: '2023-03-01T00:00:00Z',
    lastModified: '2024-01-13T09:15:00Z',
    matchCount: 156
  },
  {
    id: '4',
    name: 'Executive Emails',
    description: 'Route executive emails to priority inbox',
    conditions: {
      sender: 'ceo@|director@|manager@',
      domain: 'sebenza.co.za'
    },
    actions: {
      route: 'executive@sebenza.co.za',
      tag: ['executive', 'priority'],
      notify: ['thabo@sebenza.co.za']
    },
    priority: 4,
    isActive: true,
    createdAt: '2023-04-01T00:00:00Z',
    lastModified: '2024-01-12T14:20:00Z',
    matchCount: 234
  },
  {
    id: '5',
    name: 'Newsletter Filter',
    description: 'Filter out newsletter subscriptions',
    conditions: {
      subject: 'newsletter|unsubscribe|marketing',
      sender: 'noreply@|newsletter@|marketing@'
    },
    actions: {
      route: 'newsletters@sebenza.co.za',
      tag: ['newsletter', 'automated']
    },
    priority: 5,
    isActive: false,
    createdAt: '2023-05-01T00:00:00Z',
    lastModified: '2024-01-11T11:30:00Z',
    matchCount: 0
  }
]

const ruleTemplates: RuleTemplate[] = [
  {
    id: 'spam-filter',
    name: 'Spam Filter',
    description: 'Basic spam detection and quarantine',
    category: 'Security',
    conditions: {
      subject: 'spam|viagra|lottery',
      attachmentSize: 50000000
    },
    actions: {
      quarantine: true,
      tag: ['spam']
    }
  },
  {
    id: 'support-routing',
    name: 'Support Routing',
    description: 'Route support emails to support team',
    category: 'Routing',
    conditions: {
      recipient: 'support@',
      subject: 'help|support|issue'
    },
    actions: {
      route: 'support@sebenza.co.za',
      tag: ['support']
    }
  },
  {
    id: 'large-files',
    name: 'Large File Handler',
    description: 'Handle emails with large attachments',
    category: 'Storage',
    conditions: {
      attachmentSize: 100000000
    },
    actions: {
      route: 'large-files@sebenza.co.za',
      tag: ['large-attachment']
    }
  },
  {
    id: 'executive-priority',
    name: 'Executive Priority',
    description: 'Priority routing for executive emails',
    category: 'Priority',
    conditions: {
      sender: 'ceo@|director@|manager@'
    },
    actions: {
      route: 'executive@sebenza.co.za',
      tag: ['executive', 'priority']
    }
  }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function RoutingRules() {
  const [rules, setRules] = useState<RoutingRule[]>(sampleRules)
  const [selectedRules, setSelectedRules] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showTemplates, setShowTemplates] = useState(false)

  // ============================================================================
  // FILTERED RULES
  // ============================================================================
  
  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && rule.isActive) ||
      (filterStatus === 'inactive' && !rule.isActive)
    
    return matchesSearch && matchesStatus
  })

  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  const handleSelectRule = (ruleId: string) => {
    const newSelected = new Set(selectedRules)
    if (newSelected.has(ruleId)) {
      newSelected.delete(ruleId)
    } else {
      newSelected.add(ruleId)
    }
    setSelectedRules(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedRules.size === filteredRules.length) {
      setSelectedRules(new Set())
    } else {
      setSelectedRules(new Set(filteredRules.map(rule => rule.id)))
    }
  }

  const handleToggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, isActive: !rule.isActive }
        : rule
    ))
  }

  const handleDeleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId))
    setSelectedRules(prev => {
      const newSelected = new Set(prev)
      newSelected.delete(ruleId)
      return newSelected
    })
  }

  const handleDuplicateRule = (ruleId: string) => {
    const ruleToDuplicate = rules.find(rule => rule.id === ruleId)
    if (ruleToDuplicate) {
      const newRule = {
        ...ruleToDuplicate,
        id: Date.now().toString(),
        name: `${ruleToDuplicate.name} (Copy)`,
        isActive: false,
        matchCount: 0,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
      setRules(prev => [...prev, newRule])
    }
  }

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on rules:`, Array.from(selectedRules))
    // Implement bulk actions here
  }

  const handleCreateFromTemplate = (template: RuleTemplate) => {
    const newRule: RoutingRule = {
      id: Date.now().toString(),
      name: template.name,
      description: template.description,
      conditions: template.conditions,
      actions: template.actions,
      priority: rules.length + 1,
      isActive: false,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      matchCount: 0
    }
    setRules(prev => [...prev, newRule])
    setShowTemplates(false)
  }

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Routing Rules</h2>
          <p className="text-muted-foreground">Configure email routing, filtering, and automation rules</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowTemplates(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            From Template
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            New Rule
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search rules..."
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
                <SelectItem value="all">All Rules</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedRules.size > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedRules.size} rule{selectedRules.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('activate')}>
                  <Play className="h-4 w-4 mr-1" />
                  Activate
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('deactivate')}>
                  <Pause className="h-4 w-4 mr-1" />
                  Deactivate
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('delete')}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('duplicate')}>
                  <Copy className="h-4 w-4 mr-1" />
                  Duplicate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rules Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="p-4 text-left">
                    <Checkbox
                      checked={selectedRules.size === filteredRules.length && filteredRules.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Rule</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Conditions</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Actions</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Priority</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Matches</th>
                  <th className="p-4 text-left font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRules.map((rule) => (
                  <tr key={rule.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-4">
                      <Checkbox
                        checked={selectedRules.has(rule.id)}
                        onCheckedChange={() => handleSelectRule(rule.id)}
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-foreground">{rule.name}</div>
                        <div className="text-sm text-muted-foreground">{rule.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Modified: {formatDate(rule.lastModified)}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {rule.conditions.sender && (
                          <div className="text-xs text-muted-foreground">
                            <strong>From:</strong> {rule.conditions.sender}
                          </div>
                        )}
                        {rule.conditions.recipient && (
                          <div className="text-xs text-muted-foreground">
                            <strong>To:</strong> {rule.conditions.recipient}
                          </div>
                        )}
                        {rule.conditions.subject && (
                          <div className="text-xs text-muted-foreground">
                            <strong>Subject:</strong> {rule.conditions.subject}
                          </div>
                        )}
                        {rule.conditions.attachmentSize && (
                          <div className="text-xs text-muted-foreground">
                            <strong>Attachment:</strong> &gt; {formatFileSize(rule.conditions.attachmentSize)}
                          </div>
                        )}
                        {rule.conditions.bodyContains && (
                          <div className="text-xs text-muted-foreground">
                            <strong>Body:</strong> {rule.conditions.bodyContains}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {rule.actions.route && (
                          <div className="text-xs text-muted-foreground">
                            <strong>Route:</strong> {rule.actions.route}
                          </div>
                        )}
                        {rule.actions.quarantine && (
                          <div className="text-xs text-muted-foreground">
                            <Shield className="h-3 w-3 inline mr-1" />
                            Quarantine
                          </div>
                        )}
                        {rule.actions.tag && rule.actions.tag.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            <Tag className="h-3 w-3 inline mr-1" />
                            {rule.actions.tag.join(', ')}
                          </div>
                        )}
                        {rule.actions.notify && rule.actions.notify.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            <Mail className="h-3 w-3 inline mr-1" />
                            Notify: {rule.actions.notify.length} recipient{rule.actions.notify.length !== 1 ? 's' : ''}
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
                      <div className="text-sm font-medium text-foreground">
                        {rule.matchCount.toLocaleString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleRule(rule.id)}
                        >
                          {rule.isActive ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicateRule(rule.id)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRule(rule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Rule Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-4xl h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Rule Templates</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTemplates(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ruleTemplates.map((template) => (
                    <Card key={template.id} className="cursor-pointer hover:bg-muted/50">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-foreground">{template.name}</h4>
                            <Badge variant="secondary">{template.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                          <Button
                            size="sm"
                            onClick={() => handleCreateFromTemplate(template)}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Rule
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <ArrowRightLeft className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{rules.length}</div>
                <div className="text-sm text-muted-foreground">Total Rules</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {rules.filter(r => r.isActive).length}
                </div>
                <div className="text-sm text-muted-foreground">Active Rules</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {rules.filter(r => !r.isActive).length}
                </div>
                <div className="text-sm text-muted-foreground">Inactive Rules</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {rules.reduce((sum, rule) => sum + rule.matchCount, 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Matches</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
