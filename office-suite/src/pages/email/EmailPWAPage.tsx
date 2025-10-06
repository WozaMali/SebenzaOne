// Enhanced Email PWA Page
// Provides full PWA functionality with cross-module integration

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
  CloudOff,
  Users,
  Building2,
  Target,
  FileText,
  BarChart3,
  Folder,
  Plus,
  X,
  ArrowLeft,
  ArrowRight,
  Reply,
  ReplyAll,
  Forward,
  Edit,
  Save,
  Share,
  Copy,
  Move,
  Tag,
  Flag,
  Bookmark,
  BookmarkCheck,
  Heart,
  HeartOff,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Phone,
  Calendar,
  MapPin,
  Globe,
  ExternalLink
} from 'lucide-react'
import { Message, Thread, Folder, Label, ComposeMessage } from '@/types/mail'
import { integrationService } from '@/lib/integration-service'
import EmailPWA from '@/components/email/EmailPWA'
import PWARegistration from '@/components/pwa/PWARegistration'
import CrossModuleSearch from '@/components/search/CrossModuleSearch'

interface EmailPWAPageProps {
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
  cacheSize: number
  unreadCount: number
}

interface PendingAction {
  id: string
  type: 'send' | 'delete' | 'archive' | 'star' | 'move'
  data: any
  timestamp: Date
  retryCount: number
}

const EmailPWAPage: React.FC<EmailPWAPageProps> = ({ className = '' }) => {
  const [pwaState, setPwaState] = useState<PWAState>({
    isOnline: navigator.onLine,
    isInstalled: false,
    canInstall: false,
    isServiceWorkerRegistered: false,
    notificationsEnabled: false,
    offlineMode: false,
    syncStatus: 'idle',
    lastSyncTime: null,
    pendingActions: [],
    cacheSize: 0,
    unreadCount: 0
  })

  const [activeTab, setActiveTab] = useState('inbox')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedThreads, setSelectedThreads] = useState<string[]>([])
  const [showCompose, setShowCompose] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showCrossModuleSearch, setShowCrossModuleSearch] = useState(false)
  const [showPWASettings, setShowPWASettings] = useState(false)
  const [composeMessage, setComposeMessage] = useState<ComposeMessage | null>(null)
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
  const [folders, setFolders] = useState<Folder[]>([])
  const [labels, setLabels] = useState<Label[]>([])
  const [threads, setThreads] = useState<Thread[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initializePWA()
    setupEventListeners()
    loadEmailData()
    checkInstallability()
    requestNotificationPermission()
    registerServiceWorker()
    startPeriodicSync()

    return () => {
      cleanup()
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
    // Online/offline status
    const handleOnline = () => {
      setPwaState(prev => ({ ...prev, isOnline: true, offlineMode: false }))
      processPendingActions()
    }

    const handleOffline = () => {
      setPwaState(prev => ({ ...prev, isOnline: false, offlineMode: true }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Before install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setPwaState(prev => ({ 
        ...prev, 
        canInstall: true 
      }))
    })

    // App installed
    window.addEventListener('appinstalled', () => {
      setPwaState(prev => ({ 
        ...prev, 
        isInstalled: true, 
        canInstall: false 
      }))
    })

    // Listen for integration events
    integrationService.addEventListener('email_received', handleEmailReceived)
    integrationService.addEventListener('email_sent', handleEmailSent)
  }

  const loadEmailData = async () => {
    try {
      setIsLoading(true)
      
      // Load folders, labels, and threads
      const [foldersData, labelsData, threadsData] = await Promise.all([
        loadFolders(),
        loadLabels(),
        loadThreads()
      ])
      
      setFolders(foldersData)
      setLabels(labelsData)
      setThreads(threadsData)
      
      // Calculate unread count
      const unreadCount = threadsData.reduce((count, thread) => 
        count + thread.messages.filter(msg => !msg.isRead).length, 0
      )
      
      setPwaState(prev => ({ ...prev, unreadCount }))
      
    } catch (error) {
      console.error('Error loading email data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadFolders = async (): Promise<Folder[]> => {
    // Mock data - replace with actual API call
    return [
      { id: 'inbox', name: 'Inbox', unreadCount: 5, color: '#3b82f6' },
      { id: 'sent', name: 'Sent', unreadCount: 0, color: '#10b981' },
      { id: 'drafts', name: 'Drafts', unreadCount: 2, color: '#f59e0b' },
      { id: 'archive', name: 'Archive', unreadCount: 0, color: '#6b7280' },
      { id: 'trash', name: 'Trash', unreadCount: 0, color: '#ef4444' }
    ]
  }

  const loadLabels = async (): Promise<Label[]> => {
    // Mock data - replace with actual API call
    return [
      { id: 'important', name: 'Important', color: '#ef4444' },
      { id: 'work', name: 'Work', color: '#3b82f6' },
      { id: 'personal', name: 'Personal', color: '#10b981' },
      { id: 'finance', name: 'Finance', color: '#f59e0b' },
      { id: 'travel', name: 'Travel', color: '#8b5cf6' }
    ]
  }

  const loadThreads = async (): Promise<Thread[]> => {
    // Mock data - replace with actual API call
    return [
      {
        id: 'thread-1',
        subject: 'Project Update - Q4 Planning',
        participants: [
          { name: 'John Doe', email: 'john@example.com' },
          { name: 'Jane Smith', email: 'jane@example.com' }
        ],
        messages: [
          {
            id: 'msg-1',
            from: { name: 'John Doe', email: 'john@example.com' },
            to: [{ name: 'Jane Smith', email: 'jane@example.com' }],
            subject: 'Project Update - Q4 Planning',
            body: 'Hi Jane, I wanted to update you on our Q4 planning progress...',
            date: new Date('2024-01-15T10:30:00Z'),
            isRead: false,
            isStarred: false,
            labels: ['work'],
            attachments: []
          }
        ],
        isRead: false,
        isStarred: false,
        labels: ['work'],
        lastMessageDate: new Date('2024-01-15T10:30:00Z')
      }
    ]
  }

  const checkInstallability = () => {
    const canInstall = 'serviceWorker' in navigator && 
                      'PushManager' in window && 
                      !pwaState.isInstalled

    setPwaState(prev => ({ ...prev, canInstall }))
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission()
        setPwaState(prev => ({ 
          ...prev, 
          notificationsEnabled: permission === 'granted' 
        }))
      } catch (error) {
        console.error('Error requesting notification permission:', error)
      }
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
      } catch (error) {
        console.error('Service worker registration failed:', error)
      }
    }
  }

  const startPeriodicSync = () => {
    // Sync every 5 minutes when online
    setInterval(() => {
      if (pwaState.isOnline) {
        syncData()
      }
    }, 5 * 60 * 1000)
  }

  const cleanup = () => {
    integrationService.removeEventListener('email_received', handleEmailReceived)
    integrationService.removeEventListener('email_sent', handleEmailSent)
  }

  // Event handlers
  const handleEmailReceived = (event: any) => {
    console.log('Email received:', event)
    
    // Update unread count
    setPwaState(prev => ({ 
      ...prev, 
      unreadCount: prev.unreadCount + 1 
    }))
    
    // Show notification
    if (pwaState.notificationsEnabled) {
      showNotification('New Email', event.data.subject || 'You have a new email')
    }
    
    // Refresh threads
    loadThreads()
  }

  const handleEmailSent = (event: any) => {
    console.log('Email sent:', event)
    
    // Refresh threads
    loadThreads()
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
        if (action.retryCount < 3) {
          action.retryCount++
        } else {
          processedActions.push(action)
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

  const handleCompose = (message?: ComposeMessage) => {
    setComposeMessage(message || {
      to: [],
      cc: [],
      bcc: [],
      subject: '',
      body: '',
      attachments: []
    })
    setShowCompose(true)
  }

  const handleThreadSelect = (thread: Thread) => {
    setSelectedThread(thread)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // Implement search logic
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
    <div className={`email-pwa-page ${className}`}>
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
          {pwaState.unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {pwaState.unreadCount} unread
            </Badge>
          )}
          
          {pwaState.pendingActions.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {pwaState.pendingActions.length} pending
            </Badge>
          )}
          
          {pwaState.canInstall && !pwaState.isInstalled && (
            <Button size="sm" variant="outline">
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
            onClick={() => setShowCrossModuleSearch(true)}
          >
            <Search className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowPWASettings(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Email Interface */}
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">SebenzaMail PWA</h1>
            <div className="flex items-center gap-2">
              <Button onClick={() => handleCompose()} className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Compose
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-2">
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
        </div>

        {/* Email Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-5">
              {folders.map(folder => (
                <TabsTrigger key={folder.id} value={folder.id} className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {folder.name}
                  {folder.unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {folder.unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeTab} className="flex-1 overflow-hidden">
              <EmailPWA
                onCompose={handleCompose}
                onSelectThread={handleThreadSelect}
                onSelectMessage={(message) => console.log('Selected message:', message)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* PWA Settings Dialog */}
      <Dialog open={showPWASettings} onOpenChange={setShowPWASettings}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>PWA Settings & Integration</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <PWARegistration />
          </div>
        </DialogContent>
      </Dialog>

      {/* Cross-Module Search Dialog */}
      <Dialog open={showCrossModuleSearch} onOpenChange={setShowCrossModuleSearch}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cross-Module Search</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <CrossModuleSearch onResultClick={(result) => {
              console.log('Search result clicked:', result)
              setShowCrossModuleSearch(false)
            }} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Compose Dialog */}
      <Dialog open={showCompose} onOpenChange={setShowCompose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compose Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {composeMessage && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">To</label>
                  <Input placeholder="Enter recipients" />
                </div>
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <Input placeholder="Enter subject" />
                </div>
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <textarea 
                    className="w-full h-64 p-3 border rounded-md resize-none"
                    placeholder="Enter your message..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCompose(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    // Handle send
                    setShowCompose(false)
                  }}>
                    Send
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EmailPWAPage



