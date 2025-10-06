// PWA Launcher Component
// Provides quick access to all Sebenza Suite modules with PWA features

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Mail, 
  Users, 
  CheckSquare, 
  BarChart3, 
  Folder, 
  Search, 
  Settings, 
  Bell, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Download, 
  Upload, 
  Star, 
  Clock, 
  TrendingUp, 
  Target, 
  FileText, 
  MessageSquare, 
  Phone, 
  Calendar, 
  MapPin, 
  Globe, 
  ExternalLink, 
  Plus, 
  MoreHorizontal,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Shield,
  Cloud,
  CloudOff,
  Database,
  Cpu,
  HardDrive,
  Wrench,
  HelpCircle,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Play,
  Pause,
  Stop,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Desktop
} from 'lucide-react'
import { integrationService } from '@/lib/integration-service'

interface PWALauncherProps {
  onModuleSelect?: (module: string) => void
  className?: string
}

interface ModuleInfo {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  color: string
  url: string
  status: 'online' | 'offline' | 'syncing' | 'error'
  lastSync?: Date
  unreadCount?: number
  isInstalled: boolean
  canInstall: boolean
  features: string[]
  shortcuts: Shortcut[]
}

interface Shortcut {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  action: () => void
  hotkey?: string
}

interface PWAStatus {
  isOnline: boolean
  isInstalled: boolean
  canInstall: boolean
  syncStatus: 'idle' | 'syncing' | 'success' | 'error'
  lastSyncTime: Date | null
  cacheSize: number
  notificationsEnabled: boolean
  offlineMode: boolean
}

const PWALauncher: React.FC<PWALauncherProps> = ({
  onModuleSelect,
  className = ''
}) => {
  const [pwaStatus, setPwaStatus] = useState<PWAStatus>({
    isOnline: navigator.onLine,
    isInstalled: false,
    canInstall: false,
    syncStatus: 'idle',
    lastSyncTime: null,
    cacheSize: 0,
    notificationsEnabled: false,
    offlineMode: false
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [selectedModule, setSelectedModule] = useState<string | null>(null)

  const modules: ModuleInfo[] = [
    {
      id: 'mail',
      name: 'SebenzaMail',
      description: 'Email management with PWA capabilities',
      icon: Mail,
      color: '#3b82f6',
      url: '/mail',
      status: 'online',
      unreadCount: 5,
      isInstalled: true,
      canInstall: false,
      features: ['Offline Access', 'Push Notifications', 'Cross-Module Integration'],
      shortcuts: [
        {
          id: 'compose',
          name: 'Compose Email',
          description: 'Create a new email message',
          icon: Plus,
          action: () => onModuleSelect?.('mail'),
          hotkey: 'Ctrl+N'
        },
        {
          id: 'inbox',
          name: 'Inbox',
          description: 'View incoming emails',
          icon: Mail,
          action: () => onModuleSelect?.('mail'),
          hotkey: 'Ctrl+I'
        }
      ]
    },
    {
      id: 'crm',
      name: 'CRM',
      description: 'Customer relationship management',
      icon: Users,
      color: '#10b981',
      url: '/crm',
      status: 'online',
      unreadCount: 0,
      isInstalled: true,
      canInstall: false,
      features: ['Contact Management', 'Deal Pipeline', 'Activity Tracking'],
      shortcuts: [
        {
          id: 'new-contact',
          name: 'New Contact',
          description: 'Add a new contact',
          icon: UserPlus,
          action: () => onModuleSelect?.('crm'),
          hotkey: 'Ctrl+Shift+C'
        },
        {
          id: 'new-deal',
          name: 'New Deal',
          description: 'Create a new deal',
          icon: Target,
          action: () => onModuleSelect?.('crm'),
          hotkey: 'Ctrl+Shift+D'
        }
      ]
    },
    {
      id: 'projects',
      name: 'Projects',
      description: 'Project and task management',
      icon: CheckSquare,
      color: '#f59e0b',
      url: '/projects',
      status: 'offline',
      unreadCount: 3,
      isInstalled: false,
      canInstall: true,
      features: ['Task Management', 'Project Tracking', 'Team Collaboration'],
      shortcuts: [
        {
          id: 'new-task',
          name: 'New Task',
          description: 'Create a new task',
          icon: Plus,
          action: () => onModuleSelect?.('projects'),
          hotkey: 'Ctrl+Shift+T'
        },
        {
          id: 'new-project',
          name: 'New Project',
          description: 'Start a new project',
          icon: Folder,
          action: () => onModuleSelect?.('projects'),
          hotkey: 'Ctrl+Shift+P'
        }
      ]
    },
    {
      id: 'accounting',
      name: 'Accounting',
      description: 'Financial management and invoicing',
      icon: BarChart3,
      color: '#ef4444',
      url: '/accounting',
      status: 'syncing',
      unreadCount: 0,
      isInstalled: true,
      canInstall: false,
      features: ['Invoicing', 'Expense Tracking', 'Financial Reports'],
      shortcuts: [
        {
          id: 'new-invoice',
          name: 'New Invoice',
          description: 'Create a new invoice',
          icon: FileText,
          action: () => onModuleSelect?.('accounting'),
          hotkey: 'Ctrl+Shift+I'
        },
        {
          id: 'reports',
          name: 'Reports',
          description: 'View financial reports',
          icon: BarChart3,
          action: () => onModuleSelect?.('accounting'),
          hotkey: 'Ctrl+Shift+R'
        }
      ]
    },
    {
      id: 'drive',
      name: 'Drive',
      description: 'File storage and management',
      icon: Folder,
      color: '#8b5cf6',
      url: '/drive',
      status: 'error',
      unreadCount: 0,
      isInstalled: true,
      canInstall: false,
      features: ['File Storage', 'Document Sharing', 'Version Control'],
      shortcuts: [
        {
          id: 'upload',
          name: 'Upload Files',
          description: 'Upload new files',
          icon: Upload,
          action: () => onModuleSelect?.('drive'),
          hotkey: 'Ctrl+U'
        },
        {
          id: 'recent',
          name: 'Recent Files',
          description: 'View recently accessed files',
          icon: Clock,
          action: () => onModuleSelect?.('drive'),
          hotkey: 'Ctrl+Shift+F'
        }
      ]
    }
  ]

  useEffect(() => {
    initializePWA()
    setupEventListeners()
    loadPWAStatus()
  }, [])

  const initializePWA = async () => {
    try {
      // Check if app is already installed
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true

      setPwaStatus(prev => ({ ...prev, isInstalled }))
    } catch (error) {
      console.error('Error initializing PWA:', error)
    }
  }

  const setupEventListeners = () => {
    // Online/offline status
    const handleOnline = () => {
      setPwaStatus(prev => ({ ...prev, isOnline: true, offlineMode: false }))
    }

    const handleOffline = () => {
      setPwaStatus(prev => ({ ...prev, isOnline: false, offlineMode: true }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Before install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setPwaStatus(prev => ({ ...prev, canInstall: true }))
      setShowInstallPrompt(true)
    })

    // App installed
    window.addEventListener('appinstalled', () => {
      setPwaStatus(prev => ({ ...prev, isInstalled: true, canInstall: false }))
      setShowInstallPrompt(false)
    })
  }

  const loadPWAStatus = async () => {
    try {
      // Load PWA status from integration service
      const crossModuleData = await integrationService.getCrossModuleData()
      
      // Calculate cache size and other metrics
      const cacheSize = 0 // This would be calculated from actual cache
      
      setPwaStatus(prev => ({
        ...prev,
        cacheSize,
        lastSyncTime: new Date()
      }))
    } catch (error) {
      console.error('Error loading PWA status:', error)
    }
  }

  const syncAllModules = async () => {
    setPwaStatus(prev => ({ ...prev, syncStatus: 'syncing' }))
    
    try {
      await integrationService.syncAllModules()
      setPwaStatus(prev => ({ 
        ...prev, 
        syncStatus: 'success',
        lastSyncTime: new Date()
      }))
    } catch (error) {
      console.error('Sync failed:', error)
      setPwaStatus(prev => ({ ...prev, syncStatus: 'error' }))
    }
  }

  const installPWA = async () => {
    // This would trigger the PWA installation
    console.log('Installing PWA...')
    setShowInstallPrompt(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-500'
      case 'offline':
        return 'text-red-500'
      case 'syncing':
        return 'text-blue-500'
      case 'error':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const filteredModules = modules.filter(module =>
    module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    module.features.some(feature => 
      feature.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  return (
    <div className={`pwa-launcher ${className}`}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Sebenza Suite</h1>
            <p className="text-muted-foreground">Complete office productivity platform</p>
          </div>
          
          <div className="flex items-center gap-2">
            {pwaStatus.isOnline ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            
            <Button
              variant="outline"
              onClick={syncAllModules}
              disabled={!pwaStatus.isOnline || pwaStatus.syncStatus === 'syncing'}
            >
              {pwaStatus.syncStatus === 'syncing' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {pwaStatus.syncStatus === 'syncing' ? 'Syncing...' : 'Sync All'}
            </Button>
            
            <Button variant="outline" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search modules, features, or shortcuts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* PWA Status */}
      <div className="p-4 bg-muted/50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {getStatusIcon(pwaStatus.syncStatus)}
              <span className="text-sm">
                {pwaStatus.syncStatus === 'syncing' ? 'Syncing...' : 
                 pwaStatus.syncStatus === 'success' ? 'All modules synced' :
                 pwaStatus.syncStatus === 'error' ? 'Sync failed' : 'Ready'}
              </span>
            </div>
            
            {pwaStatus.lastSyncTime && (
              <span className="text-xs text-muted-foreground">
                Last sync: {pwaStatus.lastSyncTime.toLocaleTimeString()}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-xs text-muted-foreground">
              Cache: {(pwaStatus.cacheSize / 1024 / 1024).toFixed(1)} MB
            </div>
            
            {pwaStatus.notificationsEnabled && (
              <Badge variant="secondary" className="text-xs">
                <Bell className="h-3 w-3 mr-1" />
                Notifications
              </Badge>
            )}
            
            {pwaStatus.offlineMode && (
              <Badge variant="outline" className="text-xs">
                <CloudOff className="h-3 w-3 mr-1" />
                Offline Mode
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module) => {
            const IconComponent = module.icon
            return (
              <Card 
                key={module.id} 
                className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${
                  selectedModule === module.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  setSelectedModule(module.id)
                  onModuleSelect?.(module.id)
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${module.color}20` }}
                      >
                        <IconComponent 
                          className="h-6 w-6" 
                          style={{ color: module.color }}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{module.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {module.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {module.unreadCount && module.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {module.unreadCount}
                        </Badge>
                      )}
                      {getStatusIcon(module.status)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Features */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Features</h4>
                      <div className="flex flex-wrap gap-1">
                        {module.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {/* Shortcuts */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Quick Actions</h4>
                      <div className="space-y-1">
                        {module.shortcuts.slice(0, 2).map((shortcut) => {
                          const ShortcutIcon = shortcut.icon
                          return (
                            <Button
                              key={shortcut.id}
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start h-8 text-xs"
                              onClick={(e) => {
                                e.stopPropagation()
                                shortcut.action()
                              }}
                            >
                              <ShortcutIcon className="h-3 w-3 mr-2" />
                              {shortcut.name}
                              {shortcut.hotkey && (
                                <Badge variant="outline" className="ml-auto text-xs">
                                  {shortcut.hotkey}
                                </Badge>
                              )}
                            </Button>
                          )
                        })}
                      </div>
                    </div>
                    
                    {/* Status */}
                    <div className="flex items-center justify-between text-xs">
                      <span className={`${getStatusColor(module.status)}`}>
                        {module.status.charAt(0).toUpperCase() + module.status.slice(1)}
                      </span>
                      
                      {module.lastSync && (
                        <span className="text-muted-foreground">
                          {module.lastSync.toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Install Prompt */}
      {showInstallPrompt && pwaStatus.canInstall && !pwaStatus.isInstalled && (
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="w-80 shadow-lg border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Download className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-blue-900">Install Sebenza Suite</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Install this app for a better experience with offline access and push notifications.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" onClick={installPWA}>
                      Install
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setShowInstallPrompt(false)}
                    >
                      Maybe Later
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>PWA Settings & Integration</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* PWA Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">PWA Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Installation Status</span>
                    <Badge variant={pwaStatus.isInstalled ? "default" : "secondary"}>
                      {pwaStatus.isInstalled ? 'Installed' : 'Not Installed'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Connection</span>
                    <div className="flex items-center gap-2">
                      {pwaStatus.isOnline ? (
                        <Wifi className="h-4 w-4 text-green-500" />
                      ) : (
                        <WifiOff className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm">{pwaStatus.isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Sync Status</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(pwaStatus.syncStatus)}
                      <span className="text-sm capitalize">{pwaStatus.syncStatus}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Cache Size</span>
                    <span className="text-sm text-muted-foreground">
                      {(pwaStatus.cacheSize / 1024 / 1024).toFixed(1)} MB
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Module Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Module Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {modules.map((module) => {
                    const IconComponent = module.icon
                    return (
                      <div key={module.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-5 w-5" style={{ color: module.color }} />
                          <div>
                            <div className="font-medium">{module.name}</div>
                            <div className="text-sm text-muted-foreground">{module.description}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {module.unreadCount && module.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {module.unreadCount}
                            </Badge>
                          )}
                          {getStatusIcon(module.status)}
                          <span className="text-sm capitalize">{module.status}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PWALauncher



