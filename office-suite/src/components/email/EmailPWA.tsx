// Enhanced Email PWA Component
// Provides offline capabilities, push notifications, and cross-module integration

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  Mail, 
  MailOpen, 
  Star, 
  StarOff, 
  Archive, 
  Trash2, 
  Send, 
  Download, 
  Upload, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Bell, 
  BellOff, 
  Settings, 
  Search, 
  Filter, 
  MoreVertical,
  Paperclip,
  Eye,
  EyeOff,
  Clock,
  CheckCircle,
  AlertCircle,
  Cloud,
  CloudOff
} from 'lucide-react'
import { Message, Thread, Folder, Label, ComposeMessage } from '@/types/mail'
import { integrationService } from '@/lib/integration-service'

interface EmailPWAProps {
  onCompose?: (message?: ComposeMessage) => void
  onSelectThread?: (thread: Thread) => void
  onSelectMessage?: (message: Message) => void
  className?: string
}

interface PWAState {
  isOnline: boolean
  isInstalled: boolean
  canInstall: boolean
  isServiceWorkerRegistered: boolean
  notificationsEnabled: boolean
  offlineMode: boolean
  syncStatus: 'idle' | 'syncing' | 'error' | 'success'
  lastSyncTime: Date | null
  pendingActions: PendingAction[]
}

interface PendingAction {
  id: string
  type: 'send' | 'delete' | 'archive' | 'star' | 'move'
  data: any
  timestamp: Date
  retryCount: number
}

const EmailPWA: React.FC<EmailPWAProps> = ({
  onCompose,
  onSelectThread,
  onSelectMessage,
  className = ''
}) => {
  const [pwaState, setPwaState] = useState<PWAState>({
    isOnline: navigator.onLine,
    isInstalled: false,
    canInstall: false,
    isServiceWorkerRegistered: false,
    notificationsEnabled: false,
    offlineMode: false,
    syncStatus: 'idle',
    lastSyncTime: null,
    pendingActions: []
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState('inbox')
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [showOfflineDialog, setShowOfflineDialog] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize PWA features
  useEffect(() => {
    initializePWA()
    setupEventListeners()
    checkInstallability()
    requestNotificationPermission()
    registerServiceWorker()
    startPeriodicSync()

    return () => {
      cleanup()
    }
  }, [])

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setPwaState(prev => ({ ...prev, isOnline: true, offlineMode: false }))
      processPendingActions()
    }

    const handleOffline = () => {
      setPwaState(prev => ({ ...prev, isOnline: false, offlineMode: true }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const initializePWA = async () => {
    try {
      // Check if app is already installed
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true

      setPwaState(prev => ({ ...prev, isInstalled }))
    } catch (error) {
      console.error('Error initializing PWA:', error)
    }
  }

  const setupEventListeners = () => {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setPwaState(prev => ({ ...prev, canInstall: true }))
    })

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      setPwaState(prev => ({ ...prev, isInstalled: true, canInstall: false }))
      setDeferredPrompt(null)
    })

    // Listen for integration events
    integrationService.addEventListener('email_received', handleEmailReceived)
    integrationService.addEventListener('email_sent', handleEmailSent)
  }

  const checkInstallability = () => {
    // Check if PWA can be installed
    const canInstall = 'serviceWorker' in navigator && 'PushManager' in window
    setPwaState(prev => ({ ...prev, canInstall }))
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setPwaState(prev => ({ 
        ...prev, 
        notificationsEnabled: permission === 'granted' 
      }))
    }
  }

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        setPwaState(prev => ({ 
          ...prev, 
          isServiceWorkerRegistered: true 
        }))
        
        // Listen for service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, show update notification
                showUpdateNotification()
              }
            })
          }
        })
      } catch (error) {
        console.error('Service worker registration failed:', error)
      }
    }
  }

  const startPeriodicSync = () => {
    // Sync every 5 minutes when online
    syncIntervalRef.current = setInterval(() => {
      if (pwaState.isOnline) {
        syncData()
      }
    }, 5 * 60 * 1000)
  }

  const cleanup = () => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current)
    }
    integrationService.removeEventListener('email_received', handleEmailReceived)
    integrationService.removeEventListener('email_sent', handleEmailSent)
  }

  // PWA Actions
  const installPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('PWA installed successfully')
      } else {
        console.log('PWA installation declined')
      }
      
      setDeferredPrompt(null)
      setPwaState(prev => ({ ...prev, canInstall: false }))
    }
  }

  const syncData = async () => {
    if (!pwaState.isOnline) return

    setPwaState(prev => ({ ...prev, syncStatus: 'syncing' }))

    try {
      await integrationService.syncAllModules()
      setPwaState(prev => ({ 
        ...prev, 
        syncStatus: 'success',
        lastSyncTime: new Date()
      }))
    } catch (error) {
      console.error('Sync failed:', error)
      setPwaState(prev => ({ ...prev, syncStatus: 'error' }))
    }
  }

  const processPendingActions = async () => {
    if (!pwaState.isOnline) return

    const actions = [...pwaState.pendingActions]
    const processedActions: PendingAction[] = []

    for (const action of actions) {
      try {
        await executeAction(action)
        processedActions.push(action)
      } catch (error) {
        console.error('Failed to process action:', action, error)
        // Retry logic
        if (action.retryCount < 3) {
          action.retryCount++
        } else {
          processedActions.push(action) // Remove after max retries
        }
      }
    }

    setPwaState(prev => ({
      ...prev,
      pendingActions: prev.pendingActions.filter(
        action => !processedActions.some(pa => pa.id === action.id)
      )
    }))
  }

  const executeAction = async (action: PendingAction) => {
    // Execute the pending action
    switch (action.type) {
      case 'send':
        // Send email
        break
      case 'delete':
        // Delete email
        break
      case 'archive':
        // Archive email
        break
      case 'star':
        // Star/unstar email
        break
      case 'move':
        // Move email to folder
        break
    }
  }

  const queueAction = (type: PendingAction['type'], data: any) => {
    const action: PendingAction = {
      id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: new Date(),
      retryCount: 0
    }

    setPwaState(prev => ({
      ...prev,
      pendingActions: [...prev.pendingActions, action]
    }))

    // Try to execute immediately if online
    if (pwaState.isOnline) {
      executeAction(action)
    }
  }

  // Event handlers
  const handleEmailReceived = (event: any) => {
    if (pwaState.notificationsEnabled) {
      showNotification('New Email', event.data.subject || 'You have a new email')
    }
  }

  const handleEmailSent = (event: any) => {
    console.log('Email sent:', event.data)
  }

  const showNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'email-notification',
        requireInteraction: true
      })
    }
  }

  const showUpdateNotification = () => {
    if (pwaState.notificationsEnabled) {
      showNotification('Update Available', 'A new version of Sebenza Suite is available. Refresh to update.')
    }
  }

  // UI Handlers
  const handleCompose = () => {
    onCompose?.()
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // Implement search logic
  }

  const handleFolderChange = (folder: string) => {
    setSelectedFolder(folder)
  }

  const handleLabelToggle = (label: string) => {
    setSelectedLabels(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label)
        : [...prev, label]
    )
  }

  const handleOfflineAction = (action: PendingAction['type'], data: any) => {
    if (pwaState.isOnline) {
      // Execute immediately
      queueAction(action, data)
    } else {
      // Queue for later
      queueAction(action, data)
      setShowOfflineDialog(true)
    }
  }

  const getSyncStatusIcon = () => {
    switch (pwaState.syncStatus) {
      case 'syncing':
        return <RefreshCw className="h-4 w-4 animate-spin" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return pwaState.isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />
    }
  }

  const getSyncStatusText = () => {
    if (pwaState.syncStatus === 'syncing') return 'Syncing...'
    if (pwaState.syncStatus === 'success') return 'Synced'
    if (pwaState.syncStatus === 'error') return 'Sync failed'
    return pwaState.isOnline ? 'Online' : 'Offline'
  }

  return (
    <div className={`email-pwa ${className}`}>
      {/* PWA Status Bar */}
      <div className="flex items-center justify-between p-2 bg-muted/50 border-b">
        <div className="flex items-center gap-2">
          {getSyncStatusIcon()}
          <span className="text-sm text-muted-foreground">
            {getSyncStatusText()}
          </span>
          {pwaState.lastSyncTime && (
            <span className="text-xs text-muted-foreground">
              Last sync: {pwaState.lastSyncTime.toLocaleTimeString()}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {pwaState.pendingActions.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {pwaState.pendingActions.length} pending
            </Badge>
          )}
          
          {pwaState.canInstall && !pwaState.isInstalled && (
            <Button size="sm" onClick={installPWA}>
              Install App
            </Button>
          )}
          
          <Button
            size="sm"
            variant="ghost"
            onClick={syncData}
            disabled={!pwaState.isOnline || pwaState.syncStatus === 'syncing'}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Email Interface */}
      <div className="flex flex-col h-full">
        {/* Search and Filters */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Folder and Label Filters */}
          <div className="flex items-center gap-4">
            <Select value={selectedFolder} onValueChange={handleFolderChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inbox">Inbox</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="drafts">Drafts</SelectItem>
                <SelectItem value="archive">Archive</SelectItem>
                <SelectItem value="trash">Trash</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Labels:</span>
              {['Important', 'Work', 'Personal'].map(label => (
                <Button
                  key={label}
                  variant={selectedLabels.includes(label) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleLabelToggle(label)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Email List */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {/* Sample email items */}
            {[1, 2, 3, 4, 5].map(i => (
              <Card key={i} className="cursor-pointer hover:bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox />
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">John Doe</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Work</Badge>
                      <span className="text-sm text-muted-foreground">2 min ago</span>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <h4 className="font-medium">Meeting Tomorrow</h4>
                    <p className="text-sm text-muted-foreground">
                      Let's discuss the project updates and next steps...
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Action Bar */}
        <div className="p-4 border-t bg-muted/25">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button onClick={handleCompose} className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Compose
              </Button>
              
              <Button variant="outline" size="sm">
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </Button>
              
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Offline Dialog */}
      <Dialog open={showOfflineDialog} onOpenChange={setShowOfflineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <WifiOff className="h-5 w-5" />
              Offline Mode
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You're currently offline. Your actions will be queued and synced when you're back online.
            </p>
            <div className="space-y-2">
              <h4 className="font-medium">Pending Actions:</h4>
              {pwaState.pendingActions.map(action => (
                <div key={action.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm capitalize">{action.type}</span>
                  <span className="text-xs text-muted-foreground">
                    {action.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
            <Button onClick={() => setShowOfflineDialog(false)} className="w-full">
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Push Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  Get notified about new emails
                </p>
              </div>
              <Checkbox
                checked={pwaState.notificationsEnabled}
                onCheckedChange={(checked) => {
                  if (checked) {
                    requestNotificationPermission()
                  } else {
                    setPwaState(prev => ({ ...prev, notificationsEnabled: false }))
                  }
                }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Offline Mode</h4>
                <p className="text-sm text-muted-foreground">
                  Enable offline email access
                </p>
              </div>
              <Checkbox
                checked={pwaState.offlineMode}
                onCheckedChange={(checked) => 
                  setPwaState(prev => ({ ...prev, offlineMode: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Auto Sync</h4>
                <p className="text-sm text-muted-foreground">
                  Automatically sync every 5 minutes
                </p>
              </div>
              <Checkbox defaultChecked />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EmailPWA



