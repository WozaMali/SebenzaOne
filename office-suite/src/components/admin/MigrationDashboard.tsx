'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowRightLeft, 
  Play, 
  Pause, 
  Square, 
  RefreshCw, 
  Download, 
  Upload,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
  Mail,
  Database,
  Settings,
  BarChart3,
  FileText,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Migration {
  id: string
  name: string
  source: string
  destination: string
  status: 'running' | 'completed' | 'failed' | 'paused' | 'pending'
  progress: number
  usersTotal: number
  usersCompleted: number
  usersFailed: number
  startTime: string
  estimatedCompletion: string
  lastSync: string
  errors: number
  warnings: number
}

interface MigrationStep {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  startTime?: string
  endTime?: string
  error?: string
}

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
    usersFailed: 2,
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedCompletion: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    lastSync: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    errors: 2,
    warnings: 5
  },
  {
    id: '2',
    name: 'Office 365 Migration',
    source: 'Microsoft 365',
    destination: 'Sebenza Mail',
    status: 'completed',
    progress: 100,
    usersTotal: 75,
    usersCompleted: 75,
    usersFailed: 0,
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedCompletion: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastSync: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    errors: 0,
    warnings: 0
  },
  {
    id: '3',
    name: 'cPanel Email Migration',
    source: 'cPanel Email',
    destination: 'Sebenza Mail',
    status: 'paused',
    progress: 30,
    usersTotal: 200,
    usersCompleted: 60,
    usersFailed: 5,
    startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedCompletion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    errors: 5,
    warnings: 12
  }
]

const migrationSteps: MigrationStep[] = [
  {
    id: '1',
    name: 'Connection Test',
    status: 'completed',
    progress: 100,
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    name: 'User Mapping',
    status: 'completed',
    progress: 100,
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    name: 'Email Migration',
    status: 'running',
    progress: 65,
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    name: 'Folder Structure',
    status: 'pending',
    progress: 0
  },
  {
    id: '5',
    name: 'Final Sync',
    status: 'pending',
    progress: 0
  }
]

export function MigrationDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedMigration, setSelectedMigration] = useState<Migration | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'failed':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'paused':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'pending':
        return 'bg-muted text-muted-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-emerald-400" />
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-400" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : new Date()
    const diffMs = end.getTime() - start.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h`
    if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m`
    return `${diffMins}m`
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-surface border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Migrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{sampleMigrations.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {sampleMigrations.filter(m => m.status === 'running').length} active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Users Migrated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {sampleMigrations.reduce((sum, m) => sum + m.usersCompleted, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {sampleMigrations.reduce((sum, m) => sum + m.usersTotal, 0)} total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">98.2%</div>
            <p className="text-xs text-muted-foreground mt-1">Average across all migrations</p>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {sampleMigrations.reduce((sum, m) => sum + m.errors, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {sampleMigrations.reduce((sum, m) => sum + m.warnings, 0)} warnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Migration List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Recent Migrations</h3>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            New Migration
          </Button>
        </div>

        {sampleMigrations.map((migration) => (
          <Card key={migration.id} className="bg-surface border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <ArrowRightLeft className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-foreground">
                      {migration.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {migration.source} → {migration.destination}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(migration.status)}>
                  {migration.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-foreground font-medium">{migration.progress}%</span>
                </div>
                <Progress value={migration.progress} className="h-2" />
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Users: </span>
                    <span className="text-foreground">{migration.usersCompleted}/{migration.usersTotal}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Failed: </span>
                    <span className="text-red-400">{migration.usersFailed}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Started: </span>
                    <span className="text-foreground">{new Date(migration.startTime).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Sync: </span>
                    <span className="text-foreground">{new Date(migration.lastSync).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Report
                  </Button>
                  {migration.status === 'running' && (
                    <Button variant="outline" size="sm">
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </Button>
                  )}
                  {migration.status === 'paused' && (
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4 mr-1" />
                      Resume
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderDetails = () => (
    <div className="space-y-6">
      {selectedMigration ? (
        <div className="space-y-6">
          {/* Migration Header */}
          <Card className="bg-surface border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <ArrowRightLeft className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-foreground">
                      {selectedMigration.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedMigration.source} → {selectedMigration.destination}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(selectedMigration.status)}>
                  {selectedMigration.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground font-medium">{selectedMigration.progress}%</span>
                  </div>
                  <Progress value={selectedMigration.progress} className="h-2" />
                </div>
                
                <div className="text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Users Completed:</span>
                    <span className="text-foreground">{selectedMigration.usersCompleted}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Users Failed:</span>
                    <span className="text-red-400">{selectedMigration.usersFailed}</span>
                  </div>
                </div>
                
                <div className="text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Errors:</span>
                    <span className="text-red-400">{selectedMigration.errors}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Warnings:</span>
                    <span className="text-yellow-400">{selectedMigration.warnings}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Migration Steps */}
          <Card className="bg-surface border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">Migration Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {migrationSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      {getStepStatusIcon(step.status)}
                      <span className="text-sm font-medium text-foreground">{step.name}</span>
                    </div>
                    
                    <div className="flex-1">
                      {step.status === 'running' && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="text-foreground">{step.progress}%</span>
                          </div>
                          <Progress value={step.progress} className="h-1" />
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {step.startTime && (
                        <div>
                          Started: {new Date(step.startTime).toLocaleTimeString()}
                        </div>
                      )}
                      {step.endTime && (
                        <div>
                          Duration: {formatDuration(step.startTime!, step.endTime)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12">
          <ArrowRightLeft className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Select a Migration</h3>
          <p className="text-muted-foreground">
            Choose a migration from the overview to view detailed information.
          </p>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Migration Dashboard</h2>
          <p className="text-muted-foreground">Monitor and manage email migrations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            New Migration
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          {renderOverview()}
        </TabsContent>
        
        <TabsContent value="details" className="mt-6">
          {renderDetails()}
        </TabsContent>
      </Tabs>
    </div>
  )
}
