// Mail API endpoints and functions
import { 
  Thread, Message, Folder, Label, ComposeMessage, Draft, 
  Contact, Task, Note, Bookmark, CalendarEvent, Template, Signature,
  SearchQuery, MailViewState, ComposeState, Notification
} from '@/types/mail'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

// Generic API request function
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Thread and Message APIs
export const threadApi = {
  // Get threads with pagination and filtering
  getThreads: async (params: {
    folder?: string
    label?: string
    search?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}): Promise<{ threads: Thread[]; total: number; page: number; limit: number }> => {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })
    
    return apiRequest(`/threads?${queryParams}`)
  },

  // Get single thread with messages
  getThread: async (threadId: string): Promise<{ thread: Thread; messages: Message[] }> => {
    return apiRequest(`/threads/${threadId}`)
  },

  // Update thread (mark as read, star, etc.)
  updateThread: async (threadId: string, updates: Partial<Thread>): Promise<Thread> => {
    return apiRequest(`/threads/${threadId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  },

  // Delete thread
  deleteThread: async (threadId: string): Promise<void> => {
    return apiRequest(`/threads/${threadId}`, {
      method: 'DELETE',
    })
  },

  // Archive thread
  archiveThread: async (threadId: string): Promise<void> => {
    return apiRequest(`/threads/${threadId}/archive`, {
      method: 'POST',
    })
  },

  // Move thread to folder
  moveThread: async (threadId: string, folderId: string): Promise<void> => {
    return apiRequest(`/threads/${threadId}/move`, {
      method: 'POST',
      body: JSON.stringify({ folderId }),
    })
  },

  // Add/remove labels
  addLabel: async (threadId: string, labelId: string): Promise<void> => {
    return apiRequest(`/threads/${threadId}/labels`, {
      method: 'POST',
      body: JSON.stringify({ labelId }),
    })
  },

  removeLabel: async (threadId: string, labelId: string): Promise<void> => {
    return apiRequest(`/threads/${threadId}/labels/${labelId}`, {
      method: 'DELETE',
    })
  },
}

// Message APIs
export const messageApi = {
  // Get single message
  getMessage: async (messageId: string): Promise<Message> => {
    return apiRequest(`/messages/${messageId}`)
  },

  // Send message
  sendMessage: async (message: ComposeMessage): Promise<{ messageId: string; threadId: string }> => {
    return apiRequest('/messages/send', {
      method: 'POST',
      body: JSON.stringify(message),
    })
  },

  // Schedule message
  scheduleMessage: async (message: ComposeMessage, sendAt: Date): Promise<{ messageId: string; scheduledFor: string }> => {
    return apiRequest('/messages/schedule', {
      method: 'POST',
      body: JSON.stringify({ message, sendAt }),
    })
  },

  // Delegate message
  delegateMessage: async (message: ComposeMessage, delegateTo: string): Promise<{ messageId: string; delegatedTo: string }> => {
    return apiRequest('/messages/delegate', {
      method: 'POST',
      body: JSON.stringify({ message, delegateTo }),
    })
  },

  // Reply to message
  replyToMessage: async (messageId: string, reply: ComposeMessage): Promise<{ messageId: string; threadId: string }> => {
    return apiRequest(`/messages/${messageId}/reply`, {
      method: 'POST',
      body: JSON.stringify(reply),
    })
  },

  // Forward message
  forwardMessage: async (messageId: string, forward: ComposeMessage): Promise<{ messageId: string; threadId: string }> => {
    return apiRequest(`/messages/${messageId}/forward`, {
      method: 'POST',
      body: JSON.stringify(forward),
    })
  },

  // Mark as read/unread
  markAsRead: async (messageId: string): Promise<void> => {
    return apiRequest(`/messages/${messageId}/read`, {
      method: 'POST',
    })
  },

  markAsUnread: async (messageId: string): Promise<void> => {
    return apiRequest(`/messages/${messageId}/unread`, {
      method: 'POST',
    })
  },

  // Star/unstar message
  starMessage: async (messageId: string): Promise<void> => {
    return apiRequest(`/messages/${messageId}/star`, {
      method: 'POST',
    })
  },

  unstarMessage: async (messageId: string): Promise<void> => {
    return apiRequest(`/messages/${messageId}/unstar`, {
      method: 'POST',
    })
  },

  // Delete message
  deleteMessage: async (messageId: string): Promise<void> => {
    return apiRequest(`/messages/${messageId}`, {
      method: 'DELETE',
    })
  },
}

// Folder APIs
export const folderApi = {
  // Get all folders
  getFolders: async (): Promise<Folder[]> => {
    return apiRequest('/folders')
  },

  // Create folder
  createFolder: async (folder: Omit<Folder, 'id' | 'unreadCount' | 'totalCount'>): Promise<Folder> => {
    return apiRequest('/folders', {
      method: 'POST',
      body: JSON.stringify(folder),
    })
  },

  // Update folder
  updateFolder: async (folderId: string, updates: Partial<Folder>): Promise<Folder> => {
    return apiRequest(`/folders/${folderId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  },

  // Delete folder
  deleteFolder: async (folderId: string): Promise<void> => {
    return apiRequest(`/folders/${folderId}`, {
      method: 'DELETE',
    })
  },

  // Get folder contents
  getFolderContents: async (folderId: string, params: {
    page?: number
    limit?: number
    search?: string
  } = {}): Promise<{ threads: Thread[]; total: number }> => {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })
    
    return apiRequest(`/folders/${folderId}/contents?${queryParams}`)
  },
}

// Label APIs
export const labelApi = {
  // Get all labels
  getLabels: async (): Promise<Label[]> => {
    return apiRequest('/labels')
  },

  // Create label
  createLabel: async (label: Omit<Label, 'id' | 'messageCount'>): Promise<Label> => {
    return apiRequest('/labels', {
      method: 'POST',
      body: JSON.stringify(label),
    })
  },

  // Update label
  updateLabel: async (labelId: string, updates: Partial<Label>): Promise<Label> => {
    return apiRequest(`/labels/${labelId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  },

  // Delete label
  deleteLabel: async (labelId: string): Promise<void> => {
    return apiRequest(`/labels/${labelId}`, {
      method: 'DELETE',
    })
  },
}

// Draft APIs
export const draftApi = {
  // Get all drafts
  getDrafts: async (): Promise<Draft[]> => {
    return apiRequest('/drafts')
  },

  // Get single draft
  getDraft: async (draftId: string): Promise<Draft> => {
    return apiRequest(`/drafts/${draftId}`)
  },

  // Save draft
  saveDraft: async (draft: Omit<Draft, 'id' | 'createdAt' | 'lastModified' | 'version'>): Promise<Draft> => {
    return apiRequest('/drafts', {
      method: 'POST',
      body: JSON.stringify(draft),
    })
  },

  // Update draft
  updateDraft: async (draftId: string, updates: Partial<Draft>): Promise<Draft> => {
    return apiRequest(`/drafts/${draftId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  },

  // Delete draft
  deleteDraft: async (draftId: string): Promise<void> => {
    return apiRequest(`/drafts/${draftId}`, {
      method: 'DELETE',
    })
  },

  // Auto-save draft
  autoSaveDraft: async (draft: Partial<Draft>): Promise<Draft> => {
    return apiRequest('/drafts/autosave', {
      method: 'POST',
      body: JSON.stringify(draft),
    })
  },
}

// Template APIs
export const templateApi = {
  // Get all templates
  getTemplates: async (): Promise<Template[]> => {
    return apiRequest('/templates')
  },

  // Get single template
  getTemplate: async (templateId: string): Promise<Template> => {
    return apiRequest(`/templates/${templateId}`)
  },

  // Create template
  createTemplate: async (template: Omit<Template, 'id' | 'createdAt' | 'lastModified'>): Promise<Template> => {
    return apiRequest('/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    })
  },

  // Update template
  updateTemplate: async (templateId: string, updates: Partial<Template>): Promise<Template> => {
    return apiRequest(`/templates/${templateId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  },

  // Delete template
  deleteTemplate: async (templateId: string): Promise<void> => {
    return apiRequest(`/templates/${templateId}`, {
      method: 'DELETE',
    })
  },

  // Process template with variables
  processTemplate: async (templateId: string, variables: Record<string, string>): Promise<{ subject: string; body: string }> => {
    return apiRequest(`/templates/${templateId}/process`, {
      method: 'POST',
      body: JSON.stringify({ variables }),
    })
  },
}

// Signature APIs
export const signatureApi = {
  // Get all signatures
  getSignatures: async (): Promise<Signature[]> => {
    return apiRequest('/signatures')
  },

  // Get single signature
  getSignature: async (signatureId: string): Promise<Signature> => {
    return apiRequest(`/signatures/${signatureId}`)
  },

  // Create signature
  createSignature: async (signature: Omit<Signature, 'id' | 'createdAt' | 'lastModified'>): Promise<Signature> => {
    return apiRequest('/signatures', {
      method: 'POST',
      body: JSON.stringify(signature),
    })
  },

  // Update signature
  updateSignature: async (signatureId: string, updates: Partial<Signature>): Promise<Signature> => {
    return apiRequest(`/signatures/${signatureId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  },

  // Delete signature
  deleteSignature: async (signatureId: string): Promise<void> => {
    return apiRequest(`/signatures/${signatureId}`, {
      method: 'DELETE',
    })
  },

  // Set default signature
  setDefaultSignature: async (signatureId: string): Promise<void> => {
    return apiRequest(`/signatures/${signatureId}/default`, {
      method: 'POST',
    })
  },
}

// Contact APIs
export const contactApi = {
  // Get all contacts
  getContacts: async (params: {
    search?: string
    page?: number
    limit?: number
  } = {}): Promise<{ contacts: Contact[]; total: number }> => {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })
    
    return apiRequest(`/contacts?${queryParams}`)
  },

  // Get single contact
  getContact: async (contactId: string): Promise<Contact> => {
    return apiRequest(`/contacts/${contactId}`)
  },

  // Create contact
  createContact: async (contact: Omit<Contact, 'id' | 'createdAt' | 'lastModified'>): Promise<Contact> => {
    return apiRequest('/contacts', {
      method: 'POST',
      body: JSON.stringify(contact),
    })
  },

  // Update contact
  updateContact: async (contactId: string, updates: Partial<Contact>): Promise<Contact> => {
    return apiRequest(`/contacts/${contactId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  },

  // Delete contact
  deleteContact: async (contactId: string): Promise<void> => {
    return apiRequest(`/contacts/${contactId}`, {
      method: 'DELETE',
    })
  },

  // Search contacts
  searchContacts: async (query: string): Promise<Contact[]> => {
    return apiRequest(`/contacts/search?q=${encodeURIComponent(query)}`)
  },
}

// Search APIs
export const searchApi = {
  // Search messages
  searchMessages: async (query: SearchQuery): Promise<{ threads: Thread[]; messages: Message[]; total: number }> => {
    return apiRequest('/search/messages', {
      method: 'POST',
      body: JSON.stringify(query),
    })
  },

  // Get saved searches
  getSavedSearches: async (): Promise<Array<{ id: string; name: string; query: SearchQuery }>> => {
    return apiRequest('/search/saved')
  },

  // Save search
  saveSearch: async (name: string, query: SearchQuery): Promise<{ id: string; name: string; query: SearchQuery }> => {
    return apiRequest('/search/saved', {
      method: 'POST',
      body: JSON.stringify({ name, query }),
    })
  },

  // Delete saved search
  deleteSavedSearch: async (searchId: string): Promise<void> => {
    return apiRequest(`/search/saved/${searchId}`, {
      method: 'DELETE',
    })
  },
}

// Notification APIs
export const notificationApi = {
  // Get notifications
  getNotifications: async (params: {
    unreadOnly?: boolean
    page?: number
    limit?: number
  } = {}): Promise<{ notifications: Notification[]; total: number }> => {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })
    
    return apiRequest(`/notifications?${queryParams}`)
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<void> => {
    return apiRequest(`/notifications/${notificationId}/read`, {
      method: 'POST',
    })
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    return apiRequest('/notifications/read-all', {
      method: 'POST',
    })
  },

  // Delete notification
  deleteNotification: async (notificationId: string): Promise<void> => {
    return apiRequest(`/notifications/${notificationId}`, {
      method: 'DELETE',
    })
  },
}

// Export all APIs
export const mailApi = {
  threads: threadApi,
  messages: messageApi,
  folders: folderApi,
  labels: labelApi,
  drafts: draftApi,
  templates: templateApi,
  signatures: signatureApi,
  contacts: contactApi,
  search: searchApi,
  notifications: notificationApi,
}

// Migration API
export async function migrateEmails(params: {
  provider?: string
  hostname: string
  port: number
  useSSL: boolean
  username: string
  password: string
  folders?: string[]
  dateFrom?: string
  dateTo?: string
}): Promise<{ processed: number; imported: number; failed: number }> {
  return apiRequest('/mail/migrate', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

