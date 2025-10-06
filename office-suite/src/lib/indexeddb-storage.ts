// IndexedDB Storage for large email data
export interface Email {
  id: string
  subject: string
  from: { name: string; email: string; displayName: string }
  to: { name: string; email: string; displayName: string }[]
  cc?: { name: string; email: string; displayName: string }[]
  bcc?: { name: string; email: string; displayName: string }[]
  body: string
  isHtml: boolean
  date: Date
  folder: string
  isRead: boolean
  isStarred: boolean
  isImportant: boolean
  isPinned: boolean
  isDraft: boolean
  isSent: boolean
  isDeleted: boolean
  isSpam: boolean
  hasAttachments: boolean
  attachments?: Array<{
    id: string
    filename: string
    contentType: string
    size: number
  }>
  labels: string[]
  priority: 'low' | 'normal' | 'high'
  threadId?: string
}

export interface Folder {
  id: string
  name: string
  type: 'inbox' | 'sent' | 'drafts' | 'starred' | 'archive' | 'spam' | 'trash' | 'custom'
  unreadCount: number
  totalCount: number
  color?: string
  isSystem: boolean
  path: string
  syncEnabled: boolean
  permissions: {
    read: boolean
    write: boolean
    delete: boolean
  }
}

class IndexedDBStorage {
  private dbName = 'SebenzaEmailDB'
  private dbVersion = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    // Only run on client-side
    if (typeof window === 'undefined') return Promise.resolve()
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create emails store
        if (!db.objectStoreNames.contains('emails')) {
          const emailStore = db.createObjectStore('emails', { keyPath: 'id' })
          emailStore.createIndex('folder', 'folder', { unique: false })
          emailStore.createIndex('isRead', 'isRead', { unique: false })
          emailStore.createIndex('isStarred', 'isStarred', { unique: false })
        }

        // Create folders store
        if (!db.objectStoreNames.contains('folders')) {
          db.createObjectStore('folders', { keyPath: 'id' })
        }
      }
    })
  }

  async saveEmails(emails: Email[]): Promise<void> {
    if (typeof window === 'undefined') return
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['emails'], 'readwrite')
      const store = transaction.objectStore('emails')

      // Clear existing emails first
      store.clear()

      // Add all emails
      let completed = 0
      const total = emails.length

      if (total === 0) {
        resolve()
        return
      }

      emails.forEach((email, index) => {
        const request = store.add(email)
        request.onsuccess = () => {
          completed++
          if (completed === total) {
            resolve()
          }
        }
        request.onerror = () => reject(request.error)
      })
    })
  }

  async loadEmails(): Promise<Email[]> {
    if (typeof window === 'undefined') return []
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['emails'], 'readonly')
      const store = transaction.objectStore('emails')
      const request = store.getAll()

      request.onsuccess = () => {
        const emails = request.result.map((email: any) => ({
          ...email,
          date: new Date(email.date)
        }))
        resolve(emails)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async saveFolders(folders: Folder[]): Promise<void> {
    if (typeof window === 'undefined') return
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['folders'], 'readwrite')
      const store = transaction.objectStore('folders')

      // Clear existing folders first
      store.clear()

      // Add all folders
      let completed = 0
      const total = folders.length

      if (total === 0) {
        resolve()
        return
      }

      folders.forEach((folder, index) => {
        const request = store.add(folder)
        request.onsuccess = () => {
          completed++
          if (completed === total) {
            resolve()
          }
        }
        request.onerror = () => reject(request.error)
      })
    })
  }

  async loadFolders(): Promise<Folder[]> {
    if (typeof window === 'undefined') return []
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['folders'], 'readonly')
      const store = transaction.objectStore('folders')
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async addEmail(email: Email): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['emails'], 'readwrite')
      const store = transaction.objectStore('emails')
      const request = store.add(email)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async updateEmail(email: Email): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['emails'], 'readwrite')
      const store = transaction.objectStore('emails')
      const request = store.put(email)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async deleteEmail(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['emails'], 'readwrite')
      const store = transaction.objectStore('emails')
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clearAllEmails(): Promise<void> {
    if (typeof window === 'undefined') return
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['emails'], 'readwrite')
      const store = transaction.objectStore('emails')
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getStorageSize(): Promise<{ used: number; available: number }> {
    if (!navigator.storage || !navigator.storage.estimate) {
      return { used: 0, available: 0 }
    }

    try {
      const estimate = await navigator.storage.estimate()
      return {
        used: estimate.usage || 0,
        available: estimate.quota || 0
      }
    } catch (error) {
      console.error('Error getting storage size:', error)
      return { used: 0, available: 0 }
    }
  }
}

export const indexedDBStorage = new IndexedDBStorage()
