// Remote Email Service for connecting to local server
export interface Email {
  id: string
  subject: string
  from: { name: string; email: string; displayName: string }
  to: { name: string; email: string; displayName: string }[]
  cc?: { name: string; email: string; displayName: string }[]
  bcc?: { name: string; email: string; displayName: string }[]
  body: string
  isHtml: boolean
  date: string
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

class RemoteEmailService {
  private baseUrl: string
  private folders: Folder[] = []

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
    this.initializeFolders()
  }

  private async initializeFolders() {
    try {
      const response = await fetch(`${this.baseUrl}/folders`)
      if (response.ok) {
        this.folders = await response.json()
      }
    } catch (error) {
      console.error('Failed to load folders:', error)
      // Fallback to default folders
      this.folders = [
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
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
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
      throw error
    }
  }

  // Get emails for a specific folder
  async getEmailsForFolder(folderId: string): Promise<Email[]> {
    try {
      const emails = await this.makeRequest(`/emails?folder=${folderId}`)
      return emails.map(this.transformEmail)
    } catch (error) {
      console.error('Failed to get emails for folder:', error)
      return []
    }
  }

  // Get all folders
  async getFolders(): Promise<Folder[]> {
    try {
      const folders = await this.makeRequest('/folders')
      this.folders = folders
      return folders
    } catch (error) {
      console.error('Failed to get folders:', error)
      return this.folders
    }
  }

  // Get a specific email
  async getEmail(id: string): Promise<Email | undefined> {
    try {
      const email = await this.makeRequest(`/emails/${id}`)
      return this.transformEmail(email)
    } catch (error) {
      console.error('Failed to get email:', error)
      return undefined
    }
  }

  // Mark email as read/unread
  async markAsRead(id: string, isRead: boolean = true): Promise<void> {
    try {
      await this.makeRequest(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_read: isRead })
      })
    } catch (error) {
      console.error('Failed to mark email as read:', error)
    }
  }

  // Star/unstar email
  async toggleStar(id: string): Promise<void> {
    try {
      const email = await this.getEmail(id)
      if (email) {
        await this.makeRequest(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ is_starred: !email.isStarred })
        })
      }
    } catch (error) {
      console.error('Failed to toggle star:', error)
    }
  }

  // Move email to folder
  async moveToFolder(id: string, folderId: string): Promise<void> {
    try {
      await this.makeRequest(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ folder: folderId })
      })
    } catch (error) {
      console.error('Failed to move email to folder:', error)
    }
  }

  // Delete email (move to trash)
  async deleteEmail(id: string): Promise<void> {
    try {
      await this.makeRequest(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ folder: 'trash', is_deleted: true })
      })
    } catch (error) {
      console.error('Failed to delete email:', error)
    }
  }

  // Permanently delete email
  async permanentlyDeleteEmail(id: string): Promise<void> {
    try {
      await this.makeRequest(`/emails/${id}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Failed to permanently delete email:', error)
    }
  }

  // Restore email from trash
  async restoreEmail(id: string): Promise<void> {
    try {
      await this.makeRequest(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ folder: 'inbox', is_deleted: false })
      })
    } catch (error) {
      console.error('Failed to restore email:', error)
    }
  }

  // Mark as spam
  async markAsSpam(id: string): Promise<void> {
    try {
      await this.makeRequest(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ folder: 'spam', is_spam: true })
      })
    } catch (error) {
      console.error('Failed to mark as spam:', error)
    }
  }

  // Archive email
  async archiveEmail(id: string): Promise<void> {
    try {
      await this.makeRequest(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ folder: 'archive' })
      })
    } catch (error) {
      console.error('Failed to archive email:', error)
    }
  }

  // Create new email
  async createEmail(email: Omit<Email, 'id' | 'date'>): Promise<Email> {
    try {
      const response = await this.makeRequest('/emails', {
        method: 'POST',
        body: JSON.stringify({
          subject: email.subject,
          from_name: email.from.name,
          from_email: email.from.email,
          to_emails: email.to,
          cc_emails: email.cc,
          bcc_emails: email.bcc,
          body: email.body,
          is_html: email.isHtml,
          folder: email.folder,
          is_draft: email.isDraft,
          labels: email.labels,
          priority: email.priority
        })
      })
      
      return {
        ...email,
        id: response.id,
        date: new Date().toISOString()
      }
    } catch (error) {
      console.error('Failed to create email:', error)
      throw error
    }
  }

  // Update email
  async updateEmail(id: string, updates: Partial<Email>): Promise<void> {
    try {
      await this.makeRequest(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      })
    } catch (error) {
      console.error('Failed to update email:', error)
    }
  }

  // Search emails
  async searchEmails(query: string, folderId?: string): Promise<Email[]> {
    try {
      const params = new URLSearchParams({ search: query })
      if (folderId) params.append('folder', folderId)
      
      const emails = await this.makeRequest(`/emails?${params}`)
      return emails.map(this.transformEmail)
    } catch (error) {
      console.error('Failed to search emails:', error)
      return []
    }
  }

  // Get starred emails
  async getStarredEmails(): Promise<Email[]> {
    try {
      const emails = await this.makeRequest('/emails?starred=true')
      return emails.map(this.transformEmail)
    } catch (error) {
      console.error('Failed to get starred emails:', error)
      return []
    }
  }

  // Get emails with attachments
  async getEmailsWithAttachments(): Promise<Email[]> {
    try {
      const emails = await this.makeRequest('/emails?attachments=true')
      return emails.map(this.transformEmail)
    } catch (error) {
      console.error('Failed to get emails with attachments:', error)
      return []
    }
  }

  // Get unread emails
  async getUnreadEmails(): Promise<Email[]> {
    try {
      const emails = await this.makeRequest('/emails?unread=true')
      return emails.map(this.transformEmail)
    } catch (error) {
      console.error('Failed to get unread emails:', error)
      return []
    }
  }

  // Import emails from backup data
  async importEmails(emails: Email[]): Promise<void> {
    try {
      await this.makeRequest('/emails/import', {
        method: 'POST',
        body: JSON.stringify({ emails })
      })
    } catch (error) {
      console.error('Failed to import emails:', error)
      throw error
    }
  }

  // Clear all emails
  async clearAllEmails(): Promise<void> {
    try {
      // This would need to be implemented on the server
      console.log('Clear all emails not implemented on server yet')
    } catch (error) {
      console.error('Failed to clear all emails:', error)
    }
  }

  // Import from JSON backup
  async importFromJSON(jsonData: any): Promise<void> {
    if (jsonData.emails && Array.isArray(jsonData.emails)) {
      await this.importEmails(jsonData.emails)
    }
  }

  // Transform server email format to client format
  private transformEmail(serverEmail: any): Email {
    return {
      id: serverEmail.id,
      subject: serverEmail.subject,
      from: {
        name: serverEmail.from_name,
        email: serverEmail.from_email,
        displayName: serverEmail.from_name
      },
      to: JSON.parse(serverEmail.to_emails || '[]'),
      cc: serverEmail.cc_emails ? JSON.parse(serverEmail.cc_emails) : undefined,
      bcc: serverEmail.bcc_emails ? JSON.parse(serverEmail.bcc_emails) : undefined,
      body: serverEmail.body,
      isHtml: Boolean(serverEmail.is_html),
      date: serverEmail.date,
      folder: serverEmail.folder,
      isRead: Boolean(serverEmail.is_read),
      isStarred: Boolean(serverEmail.is_starred),
      isImportant: Boolean(serverEmail.is_important),
      isPinned: Boolean(serverEmail.is_pinned),
      isDraft: Boolean(serverEmail.is_draft),
      isSent: Boolean(serverEmail.is_sent),
      isDeleted: Boolean(serverEmail.is_deleted),
      isSpam: Boolean(serverEmail.is_spam),
      hasAttachments: Boolean(serverEmail.has_attachments),
      labels: serverEmail.labels ? JSON.parse(serverEmail.labels) : [],
      priority: serverEmail.priority || 'normal'
    }
  }
}

// Export singleton instance
export const remoteEmailService = new RemoteEmailService()
