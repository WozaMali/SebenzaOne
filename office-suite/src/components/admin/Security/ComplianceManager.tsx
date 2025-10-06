'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
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
  Shield, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Settings,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  Database,
  Lock,
  Key,
  Globe,
  AlertCircle,
  Info,
  Calendar,
  Activity,
  Zap
} from 'lucide-react'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ComplianceStandard {
  id: string
  name: string
  description: string
  version: string
  region: string
  requirements: ComplianceRequirement[]
  lastUpdated: string
  status: 'active' | 'inactive' | 'deprecated'
}

interface ComplianceRequirement {
  id: string
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'compliant' | 'non_compliant' | 'partial' | 'not_applicable'
  evidence: string[]
  lastChecked: string
  nextReview: string
  responsible: string
}

interface ComplianceAudit {
  id: string
  name: string
  standard: string
  auditor: string
  startDate: string
  endDate: string
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  findings: ComplianceFinding[]
  score: number
  recommendations: string[]
}

interface ComplianceFinding {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk'
  evidence: string[]
  remediation: string
  dueDate: string
  assignedTo: string
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

const sampleStandards: ComplianceStandard[] = [
  {
    id: '1',
    name: 'Protection of Personal Information Act (POPI)',
    description: 'South African data protection legislation',
    version: '2020',
    region: 'South Africa',
    lastUpdated: '2024-01-15T10:00:00Z',
    status: 'active',
    requirements: [
      {
        id: '1',
        title: 'Data Minimization',
        description: 'Collect only necessary personal information',
        category: 'Data Collection',
        priority: 'high',
        status: 'compliant',
        evidence: ['Data collection forms', 'Privacy policy'],
        lastChecked: '2024-01-15T10:00:00Z',
        nextReview: '2024-04-15T10:00:00Z',
        responsible: 'Data Protection Officer'
      },
      {
        id: '2',
        title: 'Consent Management',
        description: 'Obtain explicit consent for data processing',
        category: 'Consent',
        priority: 'critical',
        status: 'partial',
        evidence: ['Consent forms'],
        lastChecked: '2024-01-15T10:00:00Z',
        nextReview: '2024-02-15T10:00:00Z',
        responsible: 'Legal Team'
      }
    ]
  },
  {
    id: '2',
    name: 'General Data Protection Regulation (GDPR)',
    description: 'EU data protection regulation',
    version: '2018',
    region: 'European Union',
    lastUpdated: '2024-01-14T16:00:00Z',
    status: 'active',
    requirements: [
      {
        id: '3',
        title: 'Right to Erasure',
        description: 'Implement data deletion upon request',
        category: 'Data Rights',
        priority: 'high',
        status: 'compliant',
        evidence: ['Deletion procedures', 'User interface'],
        lastChecked: '2024-01-14T16:00:00Z',
        nextReview: '2024-04-14T16:00:00Z',
        responsible: 'Technical Team'
      }
    ]
  },
  {
    id: '3',
    name: 'ISO 27001',
    description: 'Information security management system',
    version: '2022',
    region: 'Global',
    lastUpdated: '2024-01-13T09:00:00Z',
    status: 'active',
    requirements: [
      {
        id: '4',
        title: 'Security Risk Assessment',
        description: 'Regular security risk assessments',
        category: 'Risk Management',
        priority: 'critical',
        status: 'non_compliant',
        evidence: [],
        lastChecked: '2024-01-13T09:00:00Z',
        nextReview: '2024-02-13T09:00:00Z',
        responsible: 'Security Team'
      }
    ]
  }
]

const sampleAudits: ComplianceAudit[] = [
  {
    id: '1',
    name: 'POPI Compliance Audit 2024',
    standard: 'POPI',
    auditor: 'External Auditor',
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-01-20T00:00:00Z',
    status: 'in_progress',
    score: 85,
    findings: [
      {
        id: '1',
        title: 'Missing Data Retention Policy',
        description: 'No formal data retention policy documented',
        severity: 'high',
        status: 'open',
        evidence: ['Policy review'],
        remediation: 'Create and implement data retention policy',
        dueDate: '2024-02-15T00:00:00Z',
        assignedTo: 'Data Protection Officer'
      }
    ],
    recommendations: [
      'Implement automated data retention',
      'Regular compliance training',
      'Enhanced monitoring systems'
    ]
  },
  {
    id: '2',
    name: 'ISO 27001 Internal Audit',
    standard: 'ISO 27001',
    auditor: 'Internal Audit Team',
    startDate: '2024-01-10T00:00:00Z',
    endDate: '2024-01-12T00:00:00Z',
    status: 'completed',
    score: 92,
    findings: [],
    recommendations: [
      'Maintain current security posture',
      'Continue regular monitoring'
    ]
  }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'compliant': return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'non_compliant': return <XCircle className="h-4 w-4 text-red-500" />
    case 'partial': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    case 'not_applicable': return <Info className="h-4 w-4 text-gray-500" />
    default: return <Info className="h-4 w-4 text-gray-500" />
  }
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical': return <AlertCircle className="h-4 w-4 text-red-500" />
    case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />
    case 'medium': return <Info className="h-4 w-4 text-yellow-500" />
    case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />
    default: return <Info className="h-4 w-4 text-gray-500" />
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
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

const calculateComplianceScore = (requirements: ComplianceRequirement[]) => {
  if (requirements.length === 0) return 0
  const compliant = requirements.filter(r => r.status === 'compliant').length
  return Math.round((compliant / requirements.length) * 100)
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ComplianceManager() {
  const [activeTab, setActiveTab] = useState('standards')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')

  // ============================================================================
  // FILTERED DATA
  // ============================================================================
  
  const filteredStandards = sampleStandards.filter(standard =>
    standard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    standard.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredAudits = sampleAudits.filter(audit =>
    audit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    audit.standard.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h2 className="text-2xl font-bold text-foreground">Compliance Management</h2>
          <p className="text-muted-foreground">Monitor compliance standards, requirements, and audits</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            New Audit
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
                  placeholder="Search compliance standards, requirements, and audits..."
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
                <SelectItem value="compliant">Compliant</SelectItem>
                <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="not_applicable">Not Applicable</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="standards">Compliance Standards</TabsTrigger>
          <TabsTrigger value="audits">Audits & Assessments</TabsTrigger>
          <TabsTrigger value="dashboard">Compliance Dashboard</TabsTrigger>
        </TabsList>

        {/* Compliance Standards */}
        <TabsContent value="standards" className="space-y-6">
          {/* Standards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStandards.map((standard) => (
              <Card key={standard.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{standard.name}</CardTitle>
                    <Badge variant={standard.status === 'active' ? 'default' : 'secondary'}>
                      {standard.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{standard.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Version:</span>
                    <span>{standard.version}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Region:</span>
                    <span>{standard.region}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Requirements:</span>
                    <span>{standard.requirements.length}</span>
                  </div>
                  
                  {/* Compliance Score */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Compliance Score:</span>
                      <span className="font-medium">
                        {calculateComplianceScore(standard.requirements)}%
                      </span>
                    </div>
                    <Progress 
                      value={calculateComplianceScore(standard.requirements)} 
                      className="h-2"
                    />
                  </div>

                  {/* Requirements Status */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Requirements Status:</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>
                          {standard.requirements.filter(r => r.status === 'compliant').length} Compliant
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <XCircle className="h-3 w-3 text-red-500" />
                        <span>
                          {standard.requirements.filter(r => r.status === 'non_compliant').length} Non-Compliant
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-yellow-500" />
                        <span>
                          {standard.requirements.filter(r => r.status === 'partial').length} Partial
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Info className="h-3 w-3 text-gray-500" />
                        <span>
                          {standard.requirements.filter(r => r.status === 'not_applicable').length} N/A
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Audits & Assessments */}
        <TabsContent value="audits" className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="p-4 text-left">
                        <Checkbox
                          checked={selectedItems.size === filteredAudits.length && filteredAudits.length > 0}
                          onCheckedChange={() => handleSelectAll(filteredAudits)}
                        />
                      </th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Audit</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Standard</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Auditor</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Period</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Score</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Status</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAudits.map((audit) => (
                      <tr key={audit.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-4">
                          <Checkbox
                            checked={selectedItems.has(audit.id)}
                            onCheckedChange={() => handleSelectItem(audit.id)}
                          />
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-foreground">{audit.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {audit.findings.length} finding{audit.findings.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{audit.standard}</Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{audit.auditor}</td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {formatDate(audit.startDate)} - {formatDate(audit.endDate)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium">{audit.score}%</div>
                            <Progress value={audit.score} className="w-16 h-2" />
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge 
                            variant={audit.status === 'completed' ? 'default' : 'secondary'}
                            className="capitalize"
                          >
                            {audit.status.replace('_', ' ')}
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

        {/* Compliance Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {sampleStandards.reduce((acc, standard) => 
                        acc + standard.requirements.filter(r => r.status === 'compliant').length, 0
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">Compliant Requirements</div>
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
                      {sampleStandards.reduce((acc, standard) => 
                        acc + standard.requirements.filter(r => r.status === 'non_compliant').length, 0
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">Non-Compliant</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {sampleStandards.reduce((acc, standard) => 
                        acc + standard.requirements.filter(r => r.status === 'partial').length, 0
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">Partial Compliance</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {Math.round(sampleStandards.reduce((acc, standard) => 
                        acc + calculateComplianceScore(standard.requirements), 0
                      ) / sampleStandards.length)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compliance by Standard */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance by Standard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleStandards.map((standard) => (
                  <div key={standard.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{standard.name}</div>
                        <div className="text-sm text-muted-foreground">{standard.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {calculateComplianceScore(standard.requirements)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {standard.requirements.filter(r => r.status === 'compliant').length}/
                          {standard.requirements.length} requirements
                        </div>
                      </div>
                    </div>
                    <Progress 
                      value={calculateComplianceScore(standard.requirements)} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Audits */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Audits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleAudits.map((audit) => (
                  <div key={audit.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <div className="font-medium">{audit.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {audit.standard} • {audit.auditor} • {formatDate(audit.startDate)}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold">{audit.score}%</div>
                        <div className="text-sm text-muted-foreground">Score</div>
                      </div>
                      <Badge 
                        variant={audit.status === 'completed' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {audit.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
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
                <div className="text-2xl font-bold">{sampleStandards.length}</div>
                <div className="text-sm text-muted-foreground">Compliance Standards</div>
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
                  {sampleStandards.reduce((acc, standard) => 
                    acc + standard.requirements.length, 0
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Total Requirements</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{sampleAudits.length}</div>
                <div className="text-sm text-muted-foreground">Audits Conducted</div>
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
                  {sampleAudits.reduce((acc, audit) => acc + audit.findings.length, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Open Findings</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
