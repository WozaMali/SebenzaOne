// Local Storage Email Service for immediate testing
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

class LocalStorageEmailService {
  private storageKey = 'sebenza-emails'
  private foldersKey = 'sebenza-folders'
  private emails: Email[] = []
  private folders: Folder[] = [
    { 
      id: 'inbox', name: 'Inbox', type: 'inbox', unreadCount: 0, totalCount: 0, isSystem: true,
      path: '/inbox', syncEnabled: true, permissions: { read: true, write: true, delete: true }
    },
    { 
      id: 'sent', name: 'Sent', type: 'sent', unreadCount: 0, totalCount: 0, isSystem: true,
      path: '/sent', syncEnabled: true, permissions: { read: true, write: false, delete: true }
    },
    { 
      id: 'drafts', name: 'Drafts', type: 'drafts', unreadCount: 0, totalCount: 0, isSystem: true,
      path: '/drafts', syncEnabled: true, permissions: { read: true, write: true, delete: true }
    },
    { 
      id: 'starred', name: 'Starred', type: 'starred', unreadCount: 0, totalCount: 0, isSystem: true,
      path: '/starred', syncEnabled: true, permissions: { read: true, write: true, delete: true }
    },
    { 
      id: 'archive', name: 'Archive', type: 'archive', unreadCount: 0, totalCount: 0, isSystem: true,
      path: '/archive', syncEnabled: true, permissions: { read: true, write: true, delete: true }
    },
    { 
      id: 'spam', name: 'Spam', type: 'spam', unreadCount: 0, totalCount: 0, isSystem: true,
      path: '/spam', syncEnabled: true, permissions: { read: true, write: false, delete: true }
    },
    { 
      id: 'trash', name: 'Trash', type: 'trash', unreadCount: 0, totalCount: 0, isSystem: true,
      path: '/trash', syncEnabled: true, permissions: { read: true, write: false, delete: true }
    },
  ]

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage() {
    try {
      // Load emails
      const emailsData = localStorage.getItem(this.storageKey)
      if (emailsData) {
        const parsed = JSON.parse(emailsData)
        this.emails = parsed.map((email: any) => ({
          ...email,
          date: new Date(email.date)
        }))
      }

      // Load folders
      const foldersData = localStorage.getItem(this.foldersKey)
      if (foldersData) {
        this.folders = JSON.parse(foldersData)
      }

      this.updateFolderCounts()
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
      this.emails = []
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.emails))
      localStorage.setItem(this.foldersKey, JSON.stringify(this.folders))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }

  private updateFolderCounts() {
    this.folders.forEach(folder => {
      const folderEmails = this.emails.filter(email => email.folder === folder.id)
      folder.totalCount = folderEmails.length
      folder.unreadCount = folderEmails.filter(email => !email.isRead).length
    })
    this.saveToStorage()
  }

  // Get emails for a specific folder
  getEmailsForFolder(folderId: string): Email[] {
    return this.emails.filter(email => email.folder === folderId)
  }

  // Get all folders
  getFolders(): Folder[] {
    return [...this.folders]
  }

  // Get a specific email
  getEmail(id: string): Email | undefined {
    return this.emails.find(email => email.id === id)
  }

  // Mark email as read/unread
  markAsRead(id: string, isRead: boolean = true) {
    const email = this.emails.find(e => e.id === id)
    if (email) {
      email.isRead = isRead
      this.updateFolderCounts()
    }
  }

  // Star/unstar email
  toggleStar(id: string) {
    const email = this.emails.find(e => e.id === id)
    if (email) {
      email.isStarred = !email.isStarred
      this.updateFolderCounts()
    }
  }

  // Move email to folder
  moveToFolder(id: string, folderId: string) {
    const email = this.emails.find(e => e.id === id)
    if (email) {
      email.folder = folderId
      this.updateFolderCounts()
    }
  }

  // Delete email (move to trash)
  deleteEmail(id: string) {
    const email = this.emails.find(e => e.id === id)
    if (email) {
      email.folder = 'trash'
      email.isDeleted = true
      this.updateFolderCounts()
    }
  }

  // Permanently delete email
  permanentlyDeleteEmail(id: string) {
    this.emails = this.emails.filter(e => e.id !== id)
    this.updateFolderCounts()
  }

  // Restore email from trash
  restoreEmail(id: string) {
    const email = this.emails.find(e => e.id === id)
    if (email) {
      email.folder = 'inbox'
      email.isDeleted = false
      this.updateFolderCounts()
    }
  }

  // Mark as spam
  markAsSpam(id: string) {
    const email = this.emails.find(e => e.id === id)
    if (email) {
      email.folder = 'spam'
      email.isSpam = true
      this.updateFolderCounts()
    }
  }

  // Archive email
  archiveEmail(id: string) {
    const email = this.emails.find(e => e.id === id)
    if (email) {
      email.folder = 'archive'
      this.updateFolderCounts()
    }
  }

  // Create new email
  createEmail(email: Omit<Email, 'id' | 'date'>): Email {
    const newEmail: Email = {
      ...email,
      id: `email-${Date.now()}`,
      date: new Date()
    }
    this.emails.push(newEmail)
    this.updateFolderCounts()
    return newEmail
  }

  // Update email
  updateEmail(id: string, updates: Partial<Email>) {
    const emailIndex = this.emails.findIndex(e => e.id === id)
    if (emailIndex !== -1) {
      this.emails[emailIndex] = { ...this.emails[emailIndex], ...updates }
      this.updateFolderCounts()
    }
  }

  // Search emails
  searchEmails(query: string, folderId?: string): Email[] {
    let emails = folderId ? this.getEmailsForFolder(folderId) : this.emails
    
    return emails.filter(email => 
      email.subject.toLowerCase().includes(query.toLowerCase()) ||
      email.body.toLowerCase().includes(query.toLowerCase()) ||
      email.from.name.toLowerCase().includes(query.toLowerCase()) ||
      email.from.email.toLowerCase().includes(query.toLowerCase()) ||
      email.to.some(to => 
        to.name.toLowerCase().includes(query.toLowerCase()) ||
        to.email.toLowerCase().includes(query.toLowerCase())
      )
    )
  }

  // Get starred emails
  getStarredEmails(): Email[] {
    return this.emails.filter(email => email.isStarred)
  }

  // Get emails with attachments
  getEmailsWithAttachments(): Email[] {
    return this.emails.filter(email => email.hasAttachments)
  }

  // Get unread emails
  getUnreadEmails(): Email[] {
    return this.emails.filter(email => !email.isRead)
  }

  // Import emails from backup data
  importEmails(emails: any[]) {
    let imported = 0
    let failed = 0
    
    emails.forEach((emailData, index) => {
      try {
        const email = this.transformToEmailFormat(emailData)
        if (email) {
          this.emails.push(email)
          imported++
        } else {
          console.warn(`Failed to transform email at index ${index}:`, emailData)
          failed++
        }
      } catch (error) {
        console.error(`Error importing email at index ${index}:`, error)
        failed++
      }
    })
    
    this.updateFolderCounts()
    console.log(`Import complete: ${imported} imported, ${failed} failed`)
    return { imported, failed }
  }

  // Transform various email formats to our Email interface
  private transformToEmailFormat(data: any): Email | null {
    try {
      const email: Email = {
        id: data.id || data.messageId || `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        subject: data.subject || data.Subject || data.headers?.subject || 'No Subject',
        from: this.parseEmailAddress(data.from || data.From || data.headers?.from || data.sender),
        to: this.parseEmailAddresses(data.to || data.To || data.headers?.to || data.recipients || []),
        cc: data.cc || data.Cc || data.headers?.cc ? this.parseEmailAddresses(data.cc || data.Cc || data.headers?.cc) : undefined,
        bcc: data.bcc || data.Bcc || data.headers?.bcc ? this.parseEmailAddresses(data.bcc || data.Bcc || data.headers?.bcc) : undefined,
        body: data.body || data.Body || data.content || data.text || data.html || '',
        isHtml: this.determineIfHtml(data),
        date: this.parseDate(data.date || data.Date || data.timestamp || data.time || new Date()),
        folder: data.folder || data.Folder || data.mailbox || 'inbox',
        isRead: Boolean(data.isRead || data.is_read || data.read || data.flags?.isRead),
        isStarred: Boolean(data.isStarred || data.is_starred || data.starred || data.flags?.isStarred),
        isImportant: Boolean(data.isImportant || data.is_important || data.important || data.flags?.isImportant),
        isPinned: Boolean(data.isPinned || data.is_pinned || data.pinned || data.flags?.isPinned),
        isDraft: Boolean(data.isDraft || data.is_draft || data.draft || data.flags?.isDraft),
        isSent: Boolean(data.isSent || data.is_sent || data.sent || data.flags?.isSent),
        isDeleted: Boolean(data.isDeleted || data.is_deleted || data.deleted || data.flags?.isDeleted),
        isSpam: Boolean(data.isSpam || data.is_spam || data.spam || data.flags?.isSpam),
        hasAttachments: Boolean(data.hasAttachments || data.has_attachments || data.attachments?.length > 0),
        attachments: this.parseAttachments(data.attachments || data.Attachments || []),
        labels: this.parseLabels(data.labels || data.Labels || data.tags || data.Tags || []),
        priority: this.parsePriority(data.priority || data.Priority || data.importance || 'normal')
      }
      
      return email
    } catch (error) {
      console.error('Error transforming email data:', error)
      return null
    }
  }

  private parseEmailAddress(address: any): { name: string; email: string; displayName: string } {
    if (!address) return { name: 'Unknown', email: 'unknown@example.com', displayName: 'Unknown' }
    
    if (typeof address === 'string') {
      const match = address.match(/^(.+?)\s*<(.+?)>$/)
      if (match) {
        return {
          name: match[1].trim(),
          email: match[2].trim(),
          displayName: match[1].trim()
        }
      }
      return {
        name: address,
        email: address,
        displayName: address
      }
    }
    
    if (typeof address === 'object') {
      return {
        name: address.name || address.displayName || address.email || 'Unknown',
        email: address.email || address.address || 'unknown@example.com',
        displayName: address.displayName || address.name || address.email || 'Unknown'
      }
    }
    
    return { name: 'Unknown', email: 'unknown@example.com', displayName: 'Unknown' }
  }

  private parseEmailAddresses(addresses: any): { name: string; email: string; displayName: string }[] {
    if (!addresses) return []
    
    if (Array.isArray(addresses)) {
      return addresses.map(addr => this.parseEmailAddress(addr))
    }
    
    if (typeof addresses === 'string') {
      return addresses.split(',').map(addr => this.parseEmailAddress(addr.trim()))
    }
    
    return [this.parseEmailAddress(addresses)]
  }

  private determineIfHtml(data: any): boolean {
    if (typeof data.isHtml === 'boolean') return data.isHtml
    if (typeof data.is_html === 'boolean') return data.is_html
    if (typeof data.html === 'string') return true
    if (typeof data.body === 'string' && data.body.includes('<')) return true
    return false
  }

  private parseDate(dateInput: any): Date {
    if (dateInput instanceof Date) return dateInput
    if (typeof dateInput === 'string') return new Date(dateInput)
    if (typeof dateInput === 'number') return new Date(dateInput)
    return new Date()
  }

  private parseAttachments(attachments: any): Array<{ id: string; filename: string; contentType: string; size: number }> {
    if (!Array.isArray(attachments)) return []
    
    return attachments.map((att, index) => ({
      id: att.id || `att-${index}`,
      filename: att.filename || att.name || att.fileName || `attachment-${index}`,
      contentType: att.contentType || att.type || att.mimeType || 'application/octet-stream',
      size: att.size || att.fileSize || 0
    }))
  }

  private parseLabels(labels: any): string[] {
    if (Array.isArray(labels)) return labels.map(l => String(l))
    if (typeof labels === 'string') return labels.split(',').map(l => l.trim())
    return []
  }

  private parsePriority(priority: any): 'low' | 'normal' | 'high' {
    if (typeof priority === 'string') {
      const p = priority.toLowerCase()
      if (p === 'high' || p === 'urgent' || p === 'important') return 'high'
      if (p === 'low' || p === 'low-priority') return 'low'
    }
    return 'normal'
  }

  // Clear all emails
  clearAllEmails() {
    this.emails = []
    this.updateFolderCounts()
  }

  // Import from JSON backup
  importFromJSON(jsonData: any) {
    if (jsonData.emails && Array.isArray(jsonData.emails)) {
      return this.importEmails(jsonData.emails)
    }
    return { imported: 0, failed: 0 }
  }
}

// Export singleton instance
export const localStorageEmailService = new LocalStorageEmailService()
