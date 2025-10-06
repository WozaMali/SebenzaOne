// PWA Registration Component
// Handles PWA installation, service worker registration, and offline capabilities

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Settings,
  Bell,
  BellOff,
  Cloud,
  CloudOff,
  Shield,
  Zap,
  Database
} from 'lucide-react'

interface PWAState {
  isInstalled: boolean
  canInstall: boolean
  isOnline: boolean
  isServiceWorkerRegistered: boolean
  notificationsEnabled: boolean
  installPrompt: any
  updateAvailable: boolean
  syncStatus: 'idle' | 'syncing' | 'success' | 'error'
  lastSyncTime: Date | null
  cacheSize: number
  offlineDataCount: number
}

interface PWARegistrationProps {
  onInstall?: () => void
  onUpdate?: () => void
  className?: string
}

const PWARegistration: React.FC<PWARegistrationProps> = ({
  onInstall,
  onUpdate,
  className = ''
}) => {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstalled: false,
    canInstall: false,
    isOnline: navigator.onLine,
    isServiceWorkerRegistered: false,
    notificationsEnabled: false,
    installPrompt: null,
    updateAvailable: false,
    syncStatus: 'idle',
    lastSyncTime: null,
    cacheSize: 0,
    offlineDataCount: 0
  })

  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
  const [installProgress, setInstallProgress] = useState(0)

  useEffect(() => {
    initializePWA()
    setupEventListeners()
    checkInstallability()
    requestNotificationPermission()
    registerServiceWorker()
    calculateCacheSize()

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
      setPwaState(prev => ({ ...prev, isOnline: true }))
    }

    const handleOffline = () => {
      setPwaState(prev => ({ ...prev, isOnline: false }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Before install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setPwaState(prev => ({ 
        ...prev, 
        canInstall: true, 
        installPrompt: e 
      }))
      setShowInstallPrompt(true)
    })

    // App installed
    window.addEventListener('appinstalled', () => {
      setPwaState(prev => ({ 
        ...prev, 
        isInstalled: true, 
        canInstall: false 
      }))
      setShowInstallPrompt(false)
      onInstall?.()
    })

    // Service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        handleServiceWorkerMessage(event.data)
      })
    }
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
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })

        setPwaState(prev => ({ 
          ...prev, 
          isServiceWorkerRegistered: true 
        }))

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setPwaState(prev => ({ ...prev, updateAvailable: true }))
                setShowUpdatePrompt(true)
              }
            })
          }
        })

        // Handle service worker updates
        if (registration.waiting) {
          setPwaState(prev => ({ ...prev, updateAvailable: true }))
          setShowUpdatePrompt(true)
        }

      } catch (error) {
        console.error('Service worker registration failed:', error)
      }
    }
  }

  const calculateCacheSize = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate()
        const cacheSize = estimate.usage || 0
        setPwaState(prev => ({ ...prev, cacheSize }))
      } catch (error) {
        console.error('Error calculating cache size:', error)
      }
    }
  }

  const cleanup = () => {
    // Remove event listeners
    window.removeEventListener('online', () => {})
    window.removeEventListener('offline', () => {})
    window.removeEventListener('beforeinstallprompt', () => {})
    window.removeEventListener('appinstalled', () => {})
  }

  const handleServiceWorkerMessage = (data: any) => {
    switch (data.type) {
      case 'CACHE_UPDATED':
        calculateCacheSize()
        break
      case 'SYNC_COMPLETE':
        setPwaState(prev => ({ 
          ...prev, 
          syncStatus: 'success',
          lastSyncTime: new Date()
        }))
        break
      case 'SYNC_ERROR':
        setPwaState(prev => ({ ...prev, syncStatus: 'error' }))
        break
    }
  }

  // PWA Actions
  const installPWA = async () => {
    if (pwaState.installPrompt) {
      setInstallProgress(0)
      
      // Simulate installation progress
      const progressInterval = setInterval(() => {
        setInstallProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + 10
        })
      }, 100)

      try {
        pwaState.installPrompt.prompt()
        const { outcome } = await pwaState.installPrompt.userChoice
        
        clearInterval(progressInterval)
        setInstallProgress(100)
        
        if (outcome === 'accepted') {
          console.log('PWA installation accepted')
        } else {
          console.log('PWA installation declined')
        }
        
        setPwaState(prev => ({ 
          ...prev, 
          installPrompt: null,
          canInstall: false 
        }))
        setShowInstallPrompt(false)
        
      } catch (error) {
        console.error('PWA installation failed:', error)
        clearInterval(progressInterval)
        setInstallProgress(0)
      }
    }
  }

  const updatePWA = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          window.location.reload()
        }
      } catch (error) {
        console.error('PWA update failed:', error)
      }
    }
  }

  const syncData = async () => {
    if (!pwaState.isOnline) return

    setPwaState(prev => ({ ...prev, syncStatus: 'syncing' }))

    try {
      // Send sync message to service worker
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SYNC_ALL' })
      }
    } catch (error) {
      console.error('Sync failed:', error)
      setPwaState(prev => ({ ...prev, syncStatus: 'error' }))
    }
  }

  const clearCache = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        )
        calculateCacheSize()
      } catch (error) {
        console.error('Error clearing cache:', error)
      }
    }
  }

  const toggleNotifications = async () => {
    if (pwaState.notificationsEnabled) {
      setPwaState(prev => ({ ...prev, notificationsEnabled: false }))
    } else {
      await requestNotificationPermission()
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = () => {
    if (pwaState.syncStatus === 'syncing') return 'text-blue-500'
    if (pwaState.syncStatus === 'success') return 'text-green-500'
    if (pwaState.syncStatus === 'error') return 'text-red-500'
    return pwaState.isOnline ? 'text-green-500' : 'text-red-500'
  }

  const getStatusIcon = () => {
    if (pwaState.syncStatus === 'syncing') return <RefreshCw className="h-4 w-4 animate-spin" />
    if (pwaState.syncStatus === 'success') return <CheckCircle className="h-4 w-4" />
    if (pwaState.syncStatus === 'error') return <AlertCircle className="h-4 w-4" />
    return pwaState.isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />
  }

  return (
    <div className={`pwa-registration ${className}`}>
      {/* Install Prompt */}
      {showInstallPrompt && !pwaState.isInstalled && (
        <Card className="mb-4 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Download className="h-5 w-5" />
              Install Sebenza Suite
            </CardTitle>
            <CardDescription className="text-blue-700">
              Install this app on your device for a better experience with offline access and push notifications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {installProgress > 0 && installProgress < 100 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Installing...</span>
                    <span>{installProgress}%</span>
                  </div>
                  <Progress value={installProgress} className="w-full" />
                </div>
              )}
              
              <div className="flex gap-2">
                <Button onClick={installPWA} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Install App
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowInstallPrompt(false)}
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Update Prompt */}
      {showUpdatePrompt && pwaState.updateAvailable && (
        <Card className="mb-4 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <RefreshCw className="h-5 w-5" />
              Update Available
            </CardTitle>
            <CardDescription className="text-green-700">
              A new version of Sebenza Suite is available. Update now to get the latest features and improvements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={updatePWA} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Update Now
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowUpdatePrompt(false)}
              >
                Later
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PWA Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            PWA Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="font-medium">Connection</span>
            </div>
            <Badge variant={pwaState.isOnline ? "default" : "destructive"}>
              {pwaState.isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>

          {/* Installation Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {pwaState.isInstalled ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
              <span className="font-medium">Installation</span>
            </div>
            <Badge variant={pwaState.isInstalled ? "default" : "secondary"}>
              {pwaState.isInstalled ? 'Installed' : 'Not Installed'}
            </Badge>
          </div>

          {/* Service Worker Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {pwaState.isServiceWorkerRegistered ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="font-medium">Service Worker</span>
            </div>
            <Badge variant={pwaState.isServiceWorkerRegistered ? "default" : "destructive"}>
              {pwaState.isServiceWorkerRegistered ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* Notifications Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {pwaState.notificationsEnabled ? (
                <Bell className="h-4 w-4 text-green-500" />
              ) : (
                <BellOff className="h-4 w-4 text-gray-500" />
              )}
              <span className="font-medium">Notifications</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleNotifications}
            >
              {pwaState.notificationsEnabled ? 'Enabled' : 'Enable'}
            </Button>
          </div>

          {/* Sync Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              <span className="font-medium">Sync Status</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${getStatusColor()}`}>
                {pwaState.syncStatus === 'syncing' ? 'Syncing...' : 
                 pwaState.syncStatus === 'success' ? 'Synced' :
                 pwaState.syncStatus === 'error' ? 'Error' : 'Idle'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={syncData}
                disabled={!pwaState.isOnline || pwaState.syncStatus === 'syncing'}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Last Sync Time */}
          {pwaState.lastSyncTime && (
            <div className="text-sm text-muted-foreground">
              Last sync: {pwaState.lastSyncTime.toLocaleString()}
            </div>
          )}

          {/* Cache Information */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Cache Size</span>
              <span className="text-sm text-muted-foreground">
                {formatBytes(pwaState.cacheSize)}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearCache}
              className="w-full"
            >
              <Database className="h-4 w-4 mr-2" />
              Clear Cache
            </Button>
          </div>

          {/* Offline Data Count */}
          {pwaState.offlineDataCount > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {pwaState.offlineDataCount} items are queued for sync when you're back online.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PWARegistration



