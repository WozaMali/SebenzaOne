// Email Service for managing emails and folders
import { indexedDBStorage } from './indexeddb-storage'
import { supabase, isSupabaseEnabled } from './supabase-client'

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

class EmailService {
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
    // Initialize with default folders first
    this.updateFolderCounts()
    
    // Only load data in browser environment
    if (typeof window !== 'undefined') {
      // Load data from Supabase first, then fall back to IndexedDB
      this.loadFromSupabase()
    }
  }

  private async loadFromSupabase() {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.log('Server-side rendering, skipping Supabase load')
      return
    }

    if (!isSupabaseEnabled() || !supabase) {
      console.log('Supabase not enabled, falling back to IndexedDB')
      this.loadFromStorage()
      return
    }

    try {
      // Load emails from Supabase
      const { data: emailsData, error: emailsError } = await supabase
        .from('emails')
        .select('*')
        .order('date', { ascending: false })

      if (emailsError) {
        console.warn('Error loading emails from Supabase:', emailsError.message)
        this.loadFromStorage()
        return
      }

      if (emailsData && emailsData.length > 0) {
        this.emails = emailsData.map(this.transformEmailFromSupabase)
        console.log(`Loaded ${this.emails.length} emails from Supabase`)
      }

      // Load folders from Supabase
      const { data: foldersData, error: foldersError } = await supabase
        .from('email_folders')
        .select('*')
        .order('name', { ascending: true })

      if (foldersError) {
        console.warn('Error loading folders from Supabase:', foldersError.message)
      } else if (foldersData && foldersData.length > 0) {
        this.folders = [...this.folders.filter(f => f.isSystem), ...foldersData.map(this.transformFolderFromSupabase)]
        console.log(`Loaded ${foldersData.length} custom folders from Supabase`)
      }

      this.updateFolderCounts()
    } catch (error) {
      console.error('Error loading from Supabase, falling back to IndexedDB:', error)
      this.loadFromStorage()
    }
  }

  private async loadFromStorage() {
    try {
      await indexedDBStorage.init()
      const loadedEmails = await indexedDBStorage.loadEmails()
      const loadedFolders = await indexedDBStorage.loadFolders()
      
      if (loadedEmails.length > 0) {
        this.emails = loadedEmails
      }
      
      if (loadedFolders.length > 0) {
        this.folders = loadedFolders
      }
      
      this.updateFolderCounts()
    } catch (error) {
      console.error('Error loading from IndexedDB:', error)
      // Keep default folders and empty emails
      this.emails = []
      this.updateFolderCounts()
    }
  }

  private async saveToStorage() {
    try {
      await indexedDBStorage.saveEmails(this.emails)
      await indexedDBStorage.saveFolders(this.folders)
    } catch (error) {
      console.error('Error saving to IndexedDB:', error)
    }
  }

  private updateFolderCounts() {
    this.folders.forEach(folder => {
      const folderEmails = this.emails.filter(email => email.folder === folder.id)
      folder.totalCount = folderEmails.length
      folder.unreadCount = folderEmails.filter(email => !email.isRead).length
    })
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

  // Update an email
  async updateEmail(updatedEmail: Email) {
    const index = this.emails.findIndex(email => email.id === updatedEmail.id)
    if (index !== -1) {
      this.emails[index] = updatedEmail
      this.updateFolderCounts()
      await this.saveToStorage()
    }
  }

  // Mark email as read/unread
  async markAsRead(id: string, isRead: boolean = true) {
    const email = this.emails.find(e => e.id === id)
    if (email) {
      email.isRead = isRead
      this.updateFolderCounts()
      await this.saveToStorage()
    }
  }

  // Star/unstar email
  async toggleStar(id: string) {
    const email = this.emails.find(e => e.id === id)
    if (email) {
      email.isStarred = !email.isStarred
      this.updateFolderCounts()
      await this.saveToStorage()
    }
  }

  // Move email to folder
  async moveToFolder(id: string, folderId: string) {
    const email = this.emails.find(e => e.id === id)
    if (email) {
      email.folder = folderId
      this.updateFolderCounts()
      await this.saveToStorage()
    }
  }

  // Delete email (move to trash)
  async deleteEmail(id: string) {
    const email = this.emails.find(e => e.id === id)
    if (email) {
      email.folder = 'trash'
      email.isDeleted = true
      this.updateFolderCounts()
      await this.saveToStorage()
    }
  }

  // Permanently delete email
  async permanentlyDeleteEmail(id: string) {
    this.emails = this.emails.filter(e => e.id !== id)
    this.updateFolderCounts()
    await this.saveToStorage()
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
  async importEmails(emails: any[]) {
    let imported = 0
    let failed = 0
    
    console.log(`Starting import of ${emails.length} emails...`)
    console.log('Sample email data (first 3):', emails.slice(0, 3))
    
    emails.forEach((emailData, index) => {
      try {
        const email = this.transformToEmailFormat(emailData)
        if (email) {
          this.emails.push(email)
          imported++
          if (imported % 10 === 0) {
            console.log(`Imported ${imported} emails so far...`)
          }
        } else {
          console.warn(`Failed to transform email at index ${index}:`, {
            data: emailData,
            keys: Object.keys(emailData),
            hasSubject: !!(emailData.subject || emailData.Subject || emailData.headers?.subject),
            hasFrom: !!(emailData.from || emailData.From || emailData.headers?.from || emailData.sender),
            hasTo: !!(emailData.to || emailData.To || emailData.headers?.to || emailData.recipients)
          })
          failed++
        }
      } catch (error) {
        console.error(`Error importing email at index ${index}:`, error, 'Data:', emailData)
        failed++
      }
    })
    
    this.updateFolderCounts()
    await this.saveToStorage()
    console.log(`Import complete: ${imported} imported, ${failed} failed`)
    return { imported, failed }
  }

  // Transform various email formats to our Email interface
  private transformToEmailFormat(data: any): Email | null {
    try {
      // Handle different possible formats
      const email: Email = {
        id: data.id || data.messageId || `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        subject: data.subject || data.Subject || data.headers?.subject || 'No Subject',
        from: this.parseEmailAddress(data.from || data.From || data.headers?.from || data.sender),
        to: this.parseEmailAddresses(data.to || data.To || data.headers?.to || data.recipients || []),
        cc: data.cc || data.Cc || data.headers?.cc ? this.parseEmailAddresses(data.cc || data.Cc || data.headers?.cc) : undefined,
        bcc: data.bcc || data.Bcc || data.headers?.bcc ? this.parseEmailAddresses(data.bcc || data.Bcc || data.headers?.bcc) : undefined,
        body: this.sanitizeEmailBody(data.body || data.Body || data.content || data.text || data.html || ''),
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
      
      // Debug logging
      console.log('Transforming email data:', {
        hasSubject: !!(data.subject || data.Subject || data.headers?.subject),
        hasFrom: !!(data.from || data.From || data.headers?.from || data.sender),
        hasTo: !!(data.to || data.To || data.headers?.to || data.recipients),
        hasBody: !!(data.body || data.Body || data.content || data.text || data.html),
        keys: Object.keys(data),
        sample: {
          subject: data.subject || data.Subject || data.headers?.subject,
          from: data.from || data.From || data.headers?.from || data.sender,
          to: data.to || data.To || data.headers?.to || data.recipients
        }
      })
      
      // Validate required fields
      if (!email.subject || !email.from || !email.to || email.to.length === 0) {
        console.warn('Email missing required fields:', {
          subject: email.subject,
          from: email.from,
          to: email.to
        })
        return null
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
      // Parse "Name <email@domain.com>" format
      const match = address.match(/^(.+?)\s*<(.+?)>$/)
      if (match) {
        return {
          name: match[1].trim(),
          email: match[2].trim(),
          displayName: match[1].trim()
        }
      }
      // Just email address
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
      // Split by comma and parse each
      return addresses.split(',').map(addr => this.parseEmailAddress(addr.trim()))
    }
    
    return [this.parseEmailAddress(addresses)]
  }

  private determineIfHtml(data: any): boolean {
    // Check if the content contains HTML tags
    if (typeof data === 'string') {
      // Look for HTML tags in the content
      const htmlTagRegex = /<[^>]+>/g
      const hasHtmlTags = htmlTagRegex.test(data)
      
      // Also check for common HTML patterns
      const hasHtmlPatterns = /<(p|div|br|strong|em|ul|ol|li|h[1-6]|table|tr|td|th|img|a|span|font|b|i|u)[^>]*>/i.test(data)
      
      return hasHtmlTags || hasHtmlPatterns
    }
    
    // Check if it's an object with HTML content
    if (typeof data === 'object' && data !== null) {
      if (data.html) return true
      if (data.contentType && data.contentType.includes('text/html')) return true
      if (data.type && data.type === 'html') return true
    }
    
    return false
  }

  private sanitizeEmailBody(body: string): string {
    if (!body) return ''
    
    // EXTRACT ONLY THE CLEAN EMAIL CONTENT
    // Look for the clean email content pattern - try multiple patterns
    let cleanEmailMatch = body.match(/Dear [A-Za-z ]+[\s\S]*?Disclaimer: Transmission Confidentiality Notice/)
    
    // If not found, try with "Dear:" pattern
    if (!cleanEmailMatch) {
      cleanEmailMatch = body.match(/Dear:[A-Za-z ]+[\s\S]*?Disclaimer: Transmission Confidentiality Notice/)
    }
    
    // If still not found, try to find HTML content between DOCTYPE and closing body
    if (!cleanEmailMatch && body.includes('<!DOCTYPE html')) {
      const htmlMatch = body.match(/<!DOCTYPE html[\s\S]*?<\/body><\/html>/)
      if (htmlMatch) {
        cleanEmailMatch = htmlMatch
      }
    }
    
    // If still not found, try to find content between "Dear" and "Disclaimer"
    if (!cleanEmailMatch) {
      cleanEmailMatch = body.match(/Dear[:\s][A-Za-z ]+[\s\S]*?Disclaimer/)
    }
    
    if (cleanEmailMatch) {
      // Found the clean email content, extract it
      let cleanContent = cleanEmailMatch[0]
      
      // Remove the disclaimer part
      cleanContent = cleanContent.replace(/Disclaimer: Transmission Confidentiality Notice[\s\S]*$/, '')
      cleanContent = cleanContent.replace(/Disclaimer[\s\S]*$/, '')
      
      // Clean up any remaining artifacts
      cleanContent = cleanContent
        // Remove MIME artifacts
        .replace(/<0\.\.\.\d+>/g, '')
        .replace(/67741447\.--\.--/g, '')
        .replace(/\.--\.--/g, '')
        .replace(/--\.--/g, '')
        .replace(/\.--/g, '')
        .replace(/--/g, '')
        
        // Remove technical artifacts
        .replace(/[0-9]{10,}/g, '')
        .replace(/[a-f0-9]{20,}/gi, '')
        
        // Fix encoding issues
        .replace(/Â/g, '')
        .replace(/\u00A0/g, ' ')
        .replace(/\u200B/g, '')
        .replace(/\u200C/g, '')
        .replace(/\u200D/g, '')
        .replace(/\uFEFF/g, '')
        
        // Clean up spacing
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        .replace(/^\s+|\s+$/g, '')
        .trim()
      
      return cleanContent
    }
    
    // If no clean pattern found, try to extract any readable content
    let fallbackContent = body
      // Remove MIME headers and boundaries
      .replace(/------=_Part_\d+_\.Content-Type:[\s\S]*?------=_Part_\d+_\./g, '')
      .replace(/------=_Part_\d+_\.Content-Type:[\s\S]*?$/g, '')
      .replace(/Content-Type:[\s\S]*?Content-Transfer-Encoding:[\s\S]*?/g, '')
      .replace(/Content-Transfer-Encoding:[\s\S]*?/g, '')
      .replace(/Content-Disposition:[\s\S]*?/g, '')
      .replace(/Content-ID:[\s\S]*?/g, '')
      .replace(/boundary="[^"]*"/g, '')
      .replace(/charset="[^"]*"/g, '')
      .replace(/name="[^"]*"/g, '')
      .replace(/filename="[^"]*"/g, '')
      
      // Remove MIME boundaries
      .replace(/------=_Part_\d+_\./g, '')
      .replace(/------=_Part_\d+_/g, '')
      .replace(/^--.*$/gm, '')
      .replace(/^Content-.*$/gm, '')
      
      // Remove artifacts
      .replace(/quoted-printable/g, '')
      .replace(/base64/g, '')
      .replace(/inline; filename[\s\S]*?\.png/g, '')
      .replace(/67741447\.--\.--/g, '')
      .replace(/\.--\.--/g, '')
      .replace(/<0\.\.\.\d+>/g, '')
      .replace(/\.--\.--/g, '')
      .replace(/--\.--/g, '')
      .replace(/\.--/g, '')
      .replace(/--/g, '')
      
      // Convert quoted-printable
      .replace(/=\r?\n/g, '')
      .replace(/=([0-9A-F]{2})/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
      
      // Remove malformed URLs
      .replace(/3D%22[^"'\s>]*/g, '')
      .replace(/cid:[^"'\s>]+/g, '')
      .replace(/__inline__img__src[^"'\s>]*/g, '')
      .replace(/javascript:[^"'\s>]*/g, '')
      .replace(/data:[^"'\s>]*/g, '')
      .replace(/vbscript:[^"'\s>]*/g, '')
      
      // Remove base64 and long strings
      .replace(/[A-Za-z0-9+/]{50,}={0,2}/g, '')
      .replace(/[A-Za-z0-9+/]{20,}={0,2}/g, '')
      .replace(/[0-9]{10,}/g, '')
      .replace(/[a-f0-9]{20,}/gi, '')
      
      // Fix encoding
      .replace(/Â/g, '')
      .replace(/\u00A0/g, ' ')
      .replace(/\u200B/g, '')
      .replace(/\u200C/g, '')
      .replace(/\u200D/g, '')
      .replace(/\uFEFF/g, '')
      
      // Clean up
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .replace(/^\s+|\s+$/g, '')
      .trim()
    
    return fallbackContent
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

  // Clear all emails (for fresh start)
  async clearAllEmails() {
    this.emails = []
    this.updateFolderCounts()
    await this.saveToStorage()
  }

  // Import from JSON backup
  importFromJSON(jsonData: any) {
    if (jsonData.emails && Array.isArray(jsonData.emails)) {
      return this.importEmails(jsonData.emails)
    }
    return { imported: 0, failed: 0 }
  }

  // Transform Supabase email data to local format
  private transformEmailFromSupabase = (data: any): Email => {
    return {
      id: data.id,
      subject: data.subject || '',
      from: data.from || { name: '', email: '', displayName: '' },
      to: data.to || [],
      cc: data.cc,
      bcc: data.bcc,
      body: data.body || '',
      isHtml: data.is_html || false,
      date: new Date(data.date || data.created_at),
      folder: data.folder || 'inbox',
      isRead: data.is_read || false,
      isStarred: data.is_starred || false,
      isImportant: data.is_important || false,
      isPinned: data.is_pinned || false,
      isDraft: data.is_draft || false,
      isSent: data.is_sent || false,
      isDeleted: data.is_deleted || false,
      isSpam: data.is_spam || false,
      hasAttachments: data.has_attachments || false,
      attachments: data.attachments,
      labels: data.labels || [],
      priority: data.priority || 'normal',
      threadId: data.thread_id
    }
  }

  // Transform Supabase folder data to local format
  private transformFolderFromSupabase = (data: any): Folder => {
    return {
      id: data.id,
      name: data.name,
      type: data.type || 'custom',
      unreadCount: data.unread_count || 0,
      totalCount: data.total_count || 0,
      color: data.color,
      isSystem: data.is_system || false,
      path: data.path || `/${data.name.toLowerCase()}`,
      syncEnabled: data.sync_enabled !== false,
      permissions: {
        read: data.permissions?.read !== false,
        write: data.permissions?.write !== false,
        delete: data.permissions?.delete !== false
      }
    }
  }
}

// Export singleton instance
// Only create service on client-side
let emailServiceInstance: EmailService | null = null

// Create a safe service wrapper that only works on client-side
const createEmailService = () => {
  if (typeof window === 'undefined') {
    // Return a mock service for SSR
    return {
      getEmailsForFolder: () => [],
      getFolders: () => [],
      searchEmails: () => [],
      markAsRead: async () => Promise.resolve(),
      updateEmail: async () => Promise.resolve(),
      importEmails: async () => Promise.resolve({ imported: 0, failed: 0 }),
      clearAllEmails: async () => Promise.resolve(),
      toggleStar: async () => Promise.resolve(),
      moveToFolder: async () => Promise.resolve(),
      deleteEmail: async () => Promise.resolve(),
      permanentlyDeleteEmail: async () => Promise.resolve(),
      restoreEmail: () => {},
      markAsSpam: () => {},
      archiveEmail: () => {}
    }
  }
  
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService()
  }
  return emailServiceInstance
}

export const emailService = {
  get instance() {
    return createEmailService()
  },
  
  // Proxy methods to make it easier to use
  getEmailsForFolder: (folderId: string) => {
    return createEmailService().getEmailsForFolder(folderId)
  },
  
  getFolders: () => {
    return createEmailService().getFolders()
  },
  
  searchEmails: (query: string, folderId: string) => {
    return createEmailService().searchEmails(query, folderId)
  },
  
  markAsRead: async (id: string, isRead: boolean) => {
    return createEmailService().markAsRead(id, isRead)
  },
  
  updateEmail: async (email: Email) => {
    return createEmailService().updateEmail(email)
  },
  
  importEmails: async (emails: any[]) => {
    return createEmailService().importEmails(emails)
  },
  
  clearAllEmails: async () => {
    return createEmailService().clearAllEmails()
  },
  
  toggleStar: async (id: string) => {
    return createEmailService().toggleStar(id)
  },
  
  moveToFolder: async (id: string, folderId: string) => {
    return createEmailService().moveToFolder(id, folderId)
  },
  
  deleteEmail: async (id: string) => {
    return createEmailService().deleteEmail(id)
  },
  
  permanentlyDeleteEmail: async (id: string) => {
    return createEmailService().permanentlyDeleteEmail(id)
  },
  
  restoreEmail: (id: string) => {
    return createEmailService().restoreEmail(id)
  },
  
  markAsSpam: (id: string) => {
    return createEmailService().markAsSpam(id)
  },
  
  archiveEmail: (id: string) => {
    return createEmailService().archiveEmail(id)
  }
}

// Test server configuration
const TEST_SERVER_URL = 'http://localhost:3002/api'

// Enhanced email service with API integration
class APIIntegratedEmailService extends EmailService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${TEST_SERVER_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      // Fallback to local storage
      return null
    }
  }

  // Override importEmails to use API
  async importEmails(emails: any[]) {
    try {
      const result = await this.makeRequest('/emails/import', {
        method: 'POST',
        body: JSON.stringify({ emails })
      })
      
      if (result) {
        console.log(`API Import complete: ${result.imported} imported, ${result.failed} failed`)
        // Refresh local data
        this.loadFromAPI()
        return result
      }
    } catch (error) {
      console.error('API import failed, falling back to local:', error)
    }
    
    // Fallback to local import
    return super.importEmails(emails)
  }

  private async loadFromAPI() {
    try {
      const emails = await this.makeRequest('/emails')
      if (emails) {
        this.emails = emails.map((email: any) => ({
          ...email,
          date: new Date(email.date),
          from: JSON.parse(email.from_emails || '{}'),
          to: JSON.parse(email.to_emails || '[]'),
          cc: email.cc_emails ? JSON.parse(email.cc_emails) : undefined,
          bcc: email.bcc_emails ? JSON.parse(email.bcc_emails) : undefined,
          labels: email.labels ? JSON.parse(email.labels) : []
        }))
        this.updateFolderCounts()
      }
    } catch (error) {
      console.error('Failed to load from API:', error)
    }
  }
}

// Export API-integrated service
export const apiEmailService = new APIIntegratedEmailService()
