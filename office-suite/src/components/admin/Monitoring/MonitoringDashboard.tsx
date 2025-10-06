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

interface SystemMetric {
  id: string
  name: string
  value: number
  unit: string
  status: 'normal' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
  lastUpdated: string
  threshold: {
    warning: number
    critical: number
  }
}

interface AuditLog {
  id: string
  timestamp: string
  user: string
  action: string
  resource: string
  status: 'success' | 'failure' | 'warning'
  ipAddress: string
  userAgent: string
  details: string
}

interface Alert {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'resolved' | 'acknowledged'
  source: string
  timestamp: string
  assignedTo?: string
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

const sampleMetrics: SystemMetric[] = [
  {
    id: '1',
    name: 'CPU Usage',
    value: 45,
    unit: '%',
    status: 'normal',
    trend: 'stable',
    lastUpdated: '2024-01-15T10:30:00Z',
    threshold: { warning: 70, critical: 90 }
  },
  {
    id: '2',
    name: 'Memory Usage',
    value: 78,
    unit: '%',
    status: 'warning',
    trend: 'up',
    lastUpdated: '2024-01-15T10:30:00Z',
    threshold: { warning: 75, critical: 90 }
  },
  {
    id: '3',
    name: 'Disk Usage',
    value: 92,
    unit: '%',
    status: 'critical',
    trend: 'up',
    lastUpdated: '2024-01-15T10:30:00Z',
    threshold: { warning: 80, critical: 90 }
  },
  {
    id: '4',
    name: 'Email Queue',
    value: 1247,
    unit: 'emails',
    status: 'normal',
    trend: 'down',
    lastUpdated: '2024-01-15T10:30:00Z',
    threshold: { warning: 1000, critical: 5000 }
  }
]

const sampleAuditLogs: AuditLog[] = [
  {
    id: '1',
    timestamp: '2024-01-15T10:30:00Z',
    user: 'admin@sebenza.co.za',
    action: 'LOGIN',
    resource: 'Mail Admin Console',
    status: 'success',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    details: 'Successful login to admin console'
  },
  {
    id: '2',
    timestamp: '2024-01-15T10:25:00Z',
    user: 'thabo@sebenza.co.za',
    action: 'EMAIL_SENT',
    resource: 'Outbox',
    status: 'success',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    details: 'Email sent to client@example.com'
  },
  {
    id: '3',
    timestamp: '2024-01-15T10:20:00Z',
    user: 'nomsa@sebenza.co.za',
    action: 'FAILED_LOGIN',
    resource: 'Mail System',
    status: 'failure',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    details: 'Failed login attempt - invalid password'
  }
]

const sampleAlerts: Alert[] = [
  {
    id: '1',
    title: 'High Memory Usage',
    description: 'Memory usage has exceeded 75% threshold',
    severity: 'medium',
    status: 'active',
    source: 'System Monitor',
    timestamp: '2024-01-15T10:30:00Z',
    assignedTo: 'admin@sebenza.co.za'
  },
  {
    id: '2',
    title: 'Disk Space Critical',
    description: 'Disk usage has reached 92% - immediate action required',
    severity: 'critical',
    status: 'active',
    source: 'System Monitor',
    timestamp: '2024-01-15T10:25:00Z',
    assignedTo: 'admin@sebenza.co.za'
  },
  {
    id: '3',
    title: 'Failed Login Attempts',
    description: 'Multiple failed login attempts detected',
    severity: 'high',
    status: 'acknowledged',
    source: 'Security Monitor',
    timestamp: '2024-01-15T10:20:00Z',
    assignedTo: 'security@sebenza.co.za'
  }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'failure': return <XCircle className="h-4 w-4 text-red-500" />
    case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    default: return <Info className="h-4 w-4 text-gray-500" />
  }
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'low': return <Info className="h-4 w-4 text-blue-500" />
    case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    case 'high': return <AlertCircle className="h-4 w-4 text-orange-500" />
    case 'critical': return <XCircle className="h-4 w-4 text-red-500" />
    default: return <Info className="h-4 w-4 text-gray-500" />
  }
}

const getMetricStatusColor = (status: string) => {
  switch (status) {
    case 'normal': return 'text-green-500'
    case 'warning': return 'text-yellow-500'
    case 'critical': return 'text-red-500'
    default: return 'text-gray-500'
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

export default function MonitoringDashboard() {
  const [activeTab, setActiveTab] = useState('metrics')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSeverity, setFilterSeverity] = useState('all')

  const filteredMetrics = sampleMetrics.filter(metric =>
    metric.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredAuditLogs = sampleAuditLogs.filter(log =>
    log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.resource.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredAlerts = sampleAlerts.filter(alert =>
    alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alert.source.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(alert => 
    filterSeverity === 'all' || alert.severity === filterSeverity
  ).filter(alert => 
    filterStatus === 'all' || alert.status === filterStatus
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
          <h2 className="text-2xl font-bold text-foreground">Monitoring & Audit</h2>
          <p className="text-muted-foreground">System metrics, audit logs, and alerts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs and alerts..."
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
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics">System Metrics</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        {/* System Metrics */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredMetrics.map((metric) => (
              <Card key={metric.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {metric.value}{metric.unit}
                      </div>
                      <div className="text-sm text-muted-foreground">{metric.name}</div>
                    </div>
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                      metric.status === 'normal' ? 'bg-green-100 dark:bg-green-900' :
                      metric.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900' :
                      'bg-red-100 dark:bg-red-900'
                    }`}>
                      {metric.status === 'normal' ? (
                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                      ) : metric.status === 'warning' ? (
                        <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Status</span>
                      <span className={`capitalize ${getMetricStatusColor(metric.status)}`}>
                        {metric.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Trend</span>
                      <span className="capitalize">{metric.trend}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span>{formatDate(metric.lastUpdated)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Audit Logs */}
        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="p-4 text-left">
                        <Checkbox
                          checked={selectedItems.size === filteredAuditLogs.length && filteredAuditLogs.length > 0}
                          onCheckedChange={() => handleSelectAll(filteredAuditLogs)}
                        />
                      </th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Timestamp</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">User</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Action</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Resource</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">IP Address</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-4">
                          <Checkbox
                            checked={selectedItems.has(log.id)}
                            onCheckedChange={() => handleSelectItem(log.id)}
                          />
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="p-4 font-medium text-foreground">{log.user}</td>
                        <td className="p-4">
                          <Badge variant="outline" className="uppercase">
                            {log.action}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{log.resource}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(log.status)}
                            <span className="capitalize">{log.status}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{log.ipAddress}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
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

        {/* Alerts */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(alert.severity)}
                        <h3 className="font-medium text-foreground">{alert.title}</h3>
                        <Badge variant="outline" className="capitalize">
                          {alert.severity}
                        </Badge>
                        <Badge variant="secondary" className="capitalize">
                          {alert.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Source: {alert.source}</span>
                        <span>Time: {formatDate(alert.timestamp)}</span>
                        {alert.assignedTo && <span>Assigned: {alert.assignedTo}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Acknowledge
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
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
                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{sampleMetrics.length}</div>
                <div className="text-sm text-muted-foreground">System Metrics</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{sampleAuditLogs.length}</div>
                <div className="text-sm text-muted-foreground">Audit Logs</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{sampleAlerts.length}</div>
                <div className="text-sm text-muted-foreground">Active Alerts</div>
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
                  {sampleAlerts.filter(a => a.severity === 'critical').length}
                </div>
                <div className="text-sm text-muted-foreground">Critical Alerts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
