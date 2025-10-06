"use client"

import { useState, useEffect, useCallback } from 'react'
import { OfflineQueue, ServiceWorkerMessage } from '@/types/mail'

interface UseOfflineManagerProps {
  onSyncComplete?: (success: boolean) => void
  onQueueUpdate?: (queue: OfflineQueue[]) => void
}

export function useOfflineManager({ 
  onSyncComplete, 
  onQueueUpdate 
}: UseOfflineManagerProps = {}) {
  const [isOnline, setIsOnline] = useState(true)
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false)
  const [offlineQueue, setOfflineQueue] = useState<OfflineQueue[]>([])
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  // Check online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Trigger sync when back online
      if (isServiceWorkerReady) {
        syncOfflineQueue()
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial check
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isServiceWorkerReady])

  // Register service worker
	useEffect(() => {
		// Only register in production to avoid dev cache issues
		if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js')
				.then((registration) => {
					console.log('Service Worker registered:', registration)
					setIsServiceWorkerReady(true)
					
					// Listen for messages from service worker
					navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage)
				})
				.catch((error) => {
					console.error('Service Worker registration failed:', error)
				})
		}
	}, [])

	// Ensure no service worker is active in development
	useEffect(() => {
		if (process.env.NODE_ENV !== 'production' && 'serviceWorker' in navigator) {
			navigator.serviceWorker.getRegistrations()
				.then((registrations) => {
					registrations.forEach((registration) => {
						registration.unregister()
					})
				})
				.catch(() => {})
		}
	}, [])

  // Handle messages from service worker
  const handleServiceWorkerMessage = useCallback((event: MessageEvent<ServiceWorkerMessage>) => {
    const { type, payload } = event.data

    switch (type) {
      case 'SYNC_COMPLETE':
        setLastSyncTime(new Date())
        onSyncComplete?.(payload.success)
        break
      case 'OFFLINE_QUEUE':
        if (payload.queue) {
          setOfflineQueue(payload.queue)
          onQueueUpdate?.(payload.queue)
        }
        break
      case 'NOTIFICATION':
        // Handle notifications
        console.log('Notification from service worker:', payload)
        break
      default:
        console.log('Unknown message from service worker:', type)
    }
  }, [onSyncComplete, onQueueUpdate])

  // Add item to offline queue
  const addToOfflineQueue = useCallback((item: Omit<OfflineQueue, 'id' | 'timestamp' | 'status'>) => {
    if (!isServiceWorkerReady) {
      console.warn('Service worker not ready')
      return
    }

    const queueItem: OfflineQueue = {
      ...item,
      id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      status: 'pending'
    }

    // Send to service worker
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'OFFLINE_QUEUE',
        payload: {
          action: 'ADD',
          data: queueItem
        }
      })
    }

    // Update local state
    setOfflineQueue(prev => [...prev, queueItem])
  }, [isServiceWorkerReady])

  // Remove item from offline queue
  const removeFromOfflineQueue = useCallback((id: string) => {
    if (!isServiceWorkerReady) return

    // Send to service worker
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'OFFLINE_QUEUE',
        payload: {
          action: 'REMOVE',
          data: { id }
        }
      })
    }

    // Update local state
    setOfflineQueue(prev => prev.filter(item => item.id !== id))
  }, [isServiceWorkerReady])

  // Clear offline queue
  const clearOfflineQueue = useCallback(() => {
    if (!isServiceWorkerReady) return

    // Send to service worker
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'OFFLINE_QUEUE',
        payload: {
          action: 'CLEAR',
          data: {}
        }
      })
    }

    // Update local state
    setOfflineQueue([])
  }, [isServiceWorkerReady])

  // Sync offline queue
  const syncOfflineQueue = useCallback(() => {
    if (!isServiceWorkerReady || !isOnline) return

    // Send to service worker
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'OFFLINE_QUEUE',
        payload: {
          action: 'PROCESS',
          data: {}
        }
      })
    }
  }, [isServiceWorkerReady, isOnline])

  // Get queue status
  const getQueueStatus = useCallback(() => {
    const pending = offlineQueue.filter(item => item.status === 'pending').length
    const processing = offlineQueue.filter(item => item.status === 'processing').length
    const failed = offlineQueue.filter(item => item.status === 'failed').length
    const completed = offlineQueue.filter(item => item.status === 'completed').length

    return {
      total: offlineQueue.length,
      pending,
      processing,
      failed,
      completed
    }
  }, [offlineQueue])

  // Retry failed items
  const retryFailedItems = useCallback(() => {
    const failedItems = offlineQueue.filter(item => item.status === 'failed')
    
    failedItems.forEach(item => {
      // Reset status to pending
      const updatedItem = { ...item, status: 'pending' as const, retryCount: 0 }
      
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'OFFLINE_QUEUE',
          payload: {
            action: 'ADD',
            data: updatedItem
          }
        })
      }
    })

    // Update local state
    setOfflineQueue(prev => 
      prev.map(item => 
        item.status === 'failed' 
          ? { ...item, status: 'pending' as const, retryCount: 0 }
          : item
      )
    )
  }, [offlineQueue])

  // Send message (with offline support)
  const sendMessage = useCallback((messageData: any) => {
    if (isOnline) {
      // Send immediately if online
      return fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData)
      })
    } else {
      // Add to offline queue if offline
      addToOfflineQueue({
        type: 'send',
        data: messageData,
        retryCount: 0,
        maxRetries: 3
      })
      return Promise.resolve({ status: 'queued' })
    }
  }, [isOnline, addToOfflineQueue])

  // Save draft (with offline support)
  const saveDraft = useCallback((draftData: any) => {
    if (isOnline) {
      // Save immediately if online
      return fetch('/api/drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(draftData)
      })
    } else {
      // Add to offline queue if offline
      addToOfflineQueue({
        type: 'save_draft',
        data: draftData,
        retryCount: 0,
        maxRetries: 5
      })
      return Promise.resolve({ status: 'queued' })
    }
  }, [isOnline, addToOfflineQueue])

  // Upload attachment (with offline support)
  const uploadAttachment = useCallback((attachmentData: any) => {
    if (isOnline) {
      // Upload immediately if online
      return fetch('/api/attachments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attachmentData)
      })
    } else {
      // Add to offline queue if offline
      addToOfflineQueue({
        type: 'upload_attachment',
        data: attachmentData,
        retryCount: 0,
        maxRetries: 3
      })
      return Promise.resolve({ status: 'queued' })
    }
  }, [isOnline, addToOfflineQueue])

  return {
    isOnline,
    isServiceWorkerReady,
    offlineQueue,
    lastSyncTime,
    addToOfflineQueue,
    removeFromOfflineQueue,
    clearOfflineQueue,
    syncOfflineQueue,
    getQueueStatus,
    retryFailedItems,
    sendMessage,
    saveDraft,
    uploadAttachment
  }
}

