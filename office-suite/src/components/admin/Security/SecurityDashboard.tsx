'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Shield, 
  Lock, 
  Unlock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  Key,
  UserCheck,
  Globe,
  Database,
  FileText,
  Settings,
  Bell,
  Mail,
  Download,
  Upload,
  RefreshCw,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  AlertCircle,
  Info,
  Zap,
  Target,
  Users,
  Server,
  Network,
  HardDrive
} from 'lucide-react'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface SecurityPolicy {
  id: string
  name: string
  description: string
  type: 'password' | 'mfa' | 'access' | 'data' | 'network' | 'compliance'
  status: 'active' | 'inactive' | 'pending'
  severity: 'low' | 'medium' | 'high' | 'critical'
  lastModified: string
  createdBy: string
  rules: SecurityRule[]
}

interface SecurityRule {
  id: string
  name: string
  description: string
  condition: string
  action: string
  isActive: boolean
}

interface SecurityEvent {
  id: string
  type: 'login' | 'failed_login' | 'password_change' | 'mfa_enabled' | 'access_denied' | 'data_breach' | 'suspicious_activity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  user: string
  ip: string
  location: string
  timestamp: string
  description: string
  status: 'resolved' | 'investigating' | 'escalated' | 'closed'
}

interface ComplianceCheck {
  id: string
  name: string
  description: string
  standard: 'GDPR' | 'POPI' | 'ISO27001' | 'SOC2' | 'HIPAA' | 'PCI-DSS'
  status: 'pass' | 'fail' | 'warning' | 'not_applicable'
  lastChecked: string
  nextCheck: string
  details: string
}

interface DataClassification {
  id: string
  name: string
  level: 'public' | 'internal' | 'confidential' | 'restricted'
  description: string
  retentionPeriod: number
  encryptionRequired: boolean
  accessLevel: string[]
  createdAt: string
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

const samplePolicies: SecurityPolicy[] = [
  {
    id: '1',
    name: 'Password Policy',
    description: 'Strong password requirements and rotation policies',
    type: 'password',
    status: 'active',
    severity: 'high',
    lastModified: '2024-01-15T10:30:00Z',
    createdBy: 'admin@sebenza.co.za',
    rules: [
      { id: '1', name: 'Minimum Length', description: 'Passwords must be at least 12 characters', condition: 'length >= 12', action: 'enforce', isActive: true },
      { id: '2', name: 'Complexity', description: 'Must contain uppercase, lowercase, numbers, and symbols', condition: 'complexity >= 4', action: 'enforce', isActive: true },
      { id: '3', name: 'Rotation', description: 'Passwords must be changed every 90 days', condition: 'age >= 90', action: 'force_change', isActive: true }
    ]
  },
  {
    id: '2',
    name: 'Multi-Factor Authentication',
    description: 'MFA requirements for all users',
    type: 'mfa',
    status: 'active',
    severity: 'critical',
    lastModified: '2024-01-14T16:45:00Z',
    createdBy: 'admin@sebenza.co.za',
    rules: [
      { id: '4', name: 'MFA Required', description: 'All users must enable MFA', condition: 'user_type == all', action: 'enforce', isActive: true },
      { id: '5', name: 'Backup Codes', description: 'Generate backup codes for recovery', condition: 'mfa_enabled == true', action: 'generate_backup', isActive: true }
    ]
  },
  {
    id: '3',
    name: 'Data Access Control',
    description: 'Controls for data access and sharing',
    type: 'data',
    status: 'active',
    severity: 'high',
    lastModified: '2024-01-13T09:15:00Z',
    createdBy: 'admin@sebenza.co.za',
    rules: [
      { id: '6', name: 'Email Encryption', description: 'Encrypt all outgoing emails', condition: 'email_type == external', action: 'encrypt', isActive: true },
      { id: '7', name: 'Attachment Scanning', description: 'Scan all attachments for malware', condition: 'attachment == true', action: 'scan', isActive: true }
    ]
  }
]

const sampleEvents: SecurityEvent[] = [
  {
    id: '1',
    type: 'failed_login',
    severity: 'medium',
    user: 'unknown@external.com',
    ip: '192.168.1.100',
    location: 'Cape Town, South Africa',
    timestamp: '2024-01-15T14:30:00Z',
    description: 'Multiple failed login attempts from external IP',
    status: 'investigating'
  },
  {
    id: '2',
    type: 'mfa_enabled',
    severity: 'low',
    user: 'thabo@sebenza.co.za',
    ip: '192.168.1.50',
    location: 'Johannesburg, South Africa',
    timestamp: '2024-01-15T13:45:00Z',
    description: 'User enabled MFA for their account',
    status: 'resolved'
  },
  {
    id: '3',
    type: 'suspicious_activity',
    severity: 'high',
    user: 'nomsa@sebenza.co.za',
    ip: '192.168.1.75',
    location: 'Durban, South Africa',
    timestamp: '2024-01-15T12:20:00Z',
    description: 'Unusual email sending patterns detected',
    status: 'escalated'
  }
]

const sampleComplianceChecks: ComplianceCheck[] = [
  {
    id: '1',
    name: 'Data Encryption',
    description: 'All sensitive data must be encrypted at rest and in transit',
    standard: 'POPI',
    status: 'pass',
    lastChecked: '2024-01-15T10:00:00Z',
    nextCheck: '2024-02-15T10:00:00Z',
    details: 'All email data is encrypted using AES-256'
  },
  {
    id: '2',
    name: 'Access Logging',
    description: 'All data access must be logged and monitored',
    standard: 'GDPR',
    status: 'pass',
    lastChecked: '2024-01-15T10:00:00Z',
    nextCheck: '2024-02-15T10:00:00Z',
    details: 'Comprehensive logging implemented across all systems'
  },
  {
    id: '3',
    name: 'Data Retention',
    description: 'Data retention policies must be enforced',
    standard: 'POPI',
    status: 'warning',
    lastChecked: '2024-01-15T10:00:00Z',
    nextCheck: '2024-02-15T10:00:00Z',
    details: 'Some old emails exceed retention period'
  }
]

const sampleDataClassifications: DataClassification[] = [
  {
    id: '1',
    name: 'Public Information',
    level: 'public',
    description: 'Information that can be freely shared',
    retentionPeriod: 365,
    encryptionRequired: false,
    accessLevel: ['all'],
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Internal Communications',
    level: 'internal',
    description: 'Internal company communications',
    retentionPeriod: 2555, // 7 years
    encryptionRequired: true,
    accessLevel: ['employees', 'contractors'],
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Confidential Data',
    level: 'confidential',
    description: 'Sensitive business information',
    retentionPeriod: 2555, // 7 years
    encryptionRequired: true,
    accessLevel: ['management', 'authorized'],
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Restricted Information',
    level: 'restricted',
    description: 'Highly sensitive information requiring special handling',
    retentionPeriod: 3650, // 10 years
    encryptionRequired: true,
    accessLevel: ['executives', 'security'],
    createdAt: '2023-01-01T00:00:00Z'
  }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />
    case 'high': return <AlertCircle className="h-4 w-4 text-orange-500" />
    case 'medium': return <Info className="h-4 w-4 text-yellow-500" />
    case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />
    default: return <Info className="h-4 w-4 text-gray-500" />
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'inactive': return <XCircle className="h-4 w-4 text-red-500" />
    case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
    default: return <Info className="h-4 w-4 text-gray-500" />
  }
}

const getComplianceStatusIcon = (status: string) => {
  switch (status) {
    case 'pass': return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'fail': return <XCircle className="h-4 w-4 text-red-500" />
    case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    case 'not_applicable': return <Info className="h-4 w-4 text-gray-500" />
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

const getLevelColor = (level: string) => {
  switch (level) {
    case 'public': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'internal': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'confidential': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    case 'restricted': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SecurityDashboard() {
  const [activeTab, setActiveTab] = useState('policies')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  // ============================================================================
  // FILTERED DATA
  // ============================================================================
  
  const filteredPolicies = samplePolicies.filter(policy =>
    policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    policy.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredEvents = sampleEvents.filter(event =>
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.user.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredComplianceChecks = sampleComplianceChecks.filter(check =>
    check.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    check.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredDataClassifications = sampleDataClassifications.filter(classification =>
    classification.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classification.description.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h2 className="text-2xl font-bold text-foreground">Security & Compliance</h2>
          <p className="text-muted-foreground">Manage security policies, monitor events, and ensure compliance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            New Policy
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
                  placeholder="Search security policies, events, and compliance..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="policies">Security Policies</TabsTrigger>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="data-classification">Data Classification</TabsTrigger>
        </TabsList>

        {/* Security Policies */}
        <TabsContent value="policies" className="space-y-6">
          {/* Bulk Actions */}
          {selectedItems.size > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleBulkAction('activate')}>
                      Activate
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleBulkAction('deactivate')}>
                      Deactivate
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleBulkAction('delete')}>
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Policies Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="p-4 text-left">
                        <Checkbox
                          checked={selectedItems.size === filteredPolicies.length && filteredPolicies.length > 0}
                          onCheckedChange={() => handleSelectAll(filteredPolicies)}
                        />
                      </th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Policy</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Type</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Severity</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Rules</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPolicies.map((policy) => (
                      <tr key={policy.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-4">
                          <Checkbox
                            checked={selectedItems.has(policy.id)}
                            onCheckedChange={() => handleSelectItem(policy.id)}
                          />
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-foreground">{policy.name}</div>
                            <div className="text-sm text-muted-foreground">{policy.description}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Modified: {formatDate(policy.lastModified)}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary" className="capitalize">
                            {policy.type}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getSeverityIcon(policy.severity)}
                            <span className="capitalize">{policy.severity}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(policy.status)}
                            <span className="capitalize">{policy.status}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-muted-foreground">
                            {policy.rules.length} rule{policy.rules.length !== 1 ? 's' : ''}
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

        {/* Security Events */}
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="p-4 text-left font-medium text-muted-foreground">Event</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Severity</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">User</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Location</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Time</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map((event) => (
                      <tr key={event.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-foreground capitalize">
                              {event.type.replace('_', ' ')}
                            </div>
                            <div className="text-sm text-muted-foreground">{event.description}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getSeverityIcon(event.severity)}
                            <span className="capitalize">{event.severity}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{event.user}</td>
                        <td className="p-4 text-sm text-muted-foreground">{event.location}</td>
                        <td className="p-4 text-sm text-muted-foreground">{formatDate(event.timestamp)}</td>
                        <td className="p-4">
                          <Badge 
                            variant={event.status === 'resolved' ? 'default' : 'secondary'}
                            className="capitalize"
                          >
                            {event.status}
                          </Badge>
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

        {/* Compliance */}
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="p-4 text-left font-medium text-muted-foreground">Check</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Standard</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Last Checked</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Next Check</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplianceChecks.map((check) => (
                      <tr key={check.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-foreground">{check.name}</div>
                            <div className="text-sm text-muted-foreground">{check.description}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{check.standard}</Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getComplianceStatusIcon(check.status)}
                            <span className="capitalize">{check.status}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{formatDate(check.lastChecked)}</td>
                        <td className="p-4 text-sm text-muted-foreground">{formatDate(check.nextCheck)}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
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

        {/* Data Classification */}
        <TabsContent value="data-classification" className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="p-4 text-left font-medium text-muted-foreground">Classification</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Level</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Retention</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Encryption</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Access Level</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDataClassifications.map((classification) => (
                      <tr key={classification.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-foreground">{classification.name}</div>
                            <div className="text-sm text-muted-foreground">{classification.description}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={getLevelColor(classification.level)}>
                            {classification.level}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {classification.retentionPeriod} days
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {classification.encryptionRequired ? (
                              <Lock className="h-4 w-4 text-green-500" />
                            ) : (
                              <Unlock className="h-4 w-4 text-gray-500" />
                            )}
                            <span className="text-sm">
                              {classification.encryptionRequired ? 'Required' : 'Not Required'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {classification.accessLevel.join(', ')}
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
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{samplePolicies.length}</div>
                <div className="text-sm text-muted-foreground">Security Policies</div>
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
                  {sampleComplianceChecks.filter(c => c.status === 'pass').length}
                </div>
                <div className="text-sm text-muted-foreground">Compliance Passed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {sampleEvents.filter(e => e.severity === 'high' || e.severity === 'critical').length}
                </div>
                <div className="text-sm text-muted-foreground">High Priority Events</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Database className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{sampleDataClassifications.length}</div>
                <div className="text-sm text-muted-foreground">Data Classifications</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
