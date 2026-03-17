// Storage Utilities
// Provides localStorage and sessionStorage wrappers with error handling and type safety

/**
 * Generic storage interface
 */
interface StorageInterface {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
  clear(): void
  length: number
}

/**
 * Create typed storage wrapper
 */
function createStorage(storage: StorageInterface) {
  return {
    /**
     * Get item from storage
     */
    get<T>(key: string, defaultValue: T | null = null): T | null {
      try {
        const item = storage.getItem(key)
        if (item === null) return defaultValue
        return JSON.parse(item) as T
      } catch (error) {
        console.error(`Error reading from storage key "${key}":`, error)
        return defaultValue
      }
    },

    /**
     * Set item in storage
     */
    set<T>(key: string, value: T): boolean {
      try {
        storage.setItem(key, JSON.stringify(value))
        return true
      } catch (error) {
        console.error(`Error writing to storage key "${key}":`, error)
        // Handle quota exceeded error
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.warn('Storage quota exceeded')
        }
        return false
      }
    },

    /**
     * Remove item from storage
     */
    remove(key: string): void {
      try {
        storage.removeItem(key)
      } catch (error) {
        console.error(`Error removing storage key "${key}":`, error)
      }
    },

    /**
     * Clear all items from storage
     */
    clear(): void {
      try {
        storage.clear()
      } catch (error) {
        console.error('Error clearing storage:', error)
      }
    },

    /**
     * Check if key exists in storage
     */
    has(key: string): boolean {
      return storage.getItem(key) !== null
    },

    /**
     * Get all keys from storage
     */
    keys(): string[] {
      const keys: string[] = []
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i)
        if (key) keys.push(key)
      }
      return keys
    },

    /**
     * Get size of storage in bytes (approximate)
     */
    getSize(): number {
      let size = 0
      for (const key of this.keys()) {
        const value = storage.getItem(key)
        if (value) {
          size += key.length + value.length
        }
      }
      return size
    },

    /**
     * Check if storage is available
     */
    isAvailable(): boolean {
      try {
        const test = '__storage_test__'
        storage.setItem(test, test)
        storage.removeItem(test)
        return true
      } catch {
        return false
      }
    },

    /**
     * Subscribe to storage changes (for localStorage)
     */
    subscribe(callback: (key: string, newValue: any, oldValue: any) => void): () => void {
      if (!this.isAvailable() || typeof window === 'undefined') {
        return () => {}
      }

      const handleStorageChange = (e: StorageEvent) => {
        if (e.key && e.newValue !== e.oldValue) {
          try {
            const newValue = e.newValue ? JSON.parse(e.newValue) : null
            const oldValue = e.oldValue ? JSON.parse(e.oldValue) : null
            callback(e.key, newValue, oldValue)
          } catch (error) {
            console.error('Error parsing storage change:', error)
          }
        }
      }

      window.addEventListener('storage', handleStorageChange)

      return () => {
        window.removeEventListener('storage', handleStorageChange)
      }
    },
  }
}

/**
 * localStorage wrapper with type safety
 */
export const localStorage = typeof window !== 'undefined'
  ? createStorage(window.localStorage)
  : {
      get: () => null,
      set: () => false,
      remove: () => {},
      clear: () => {},
      has: () => false,
      keys: () => [],
      getSize: () => 0,
      isAvailable: () => false,
      subscribe: () => () => {},
    }

/**
 * sessionStorage wrapper with type safety
 */
export const sessionStorage = typeof window !== 'undefined'
  ? createStorage(window.sessionStorage)
  : {
      get: () => null,
      set: () => false,
      remove: () => {},
      clear: () => {},
      has: () => false,
      keys: () => [],
      getSize: () => 0,
      isAvailable: () => false,
      subscribe: () => () => {},
    }
