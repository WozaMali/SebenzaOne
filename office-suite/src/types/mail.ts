// SebenzaMail Core Types
export interface Message {
  id: string
  threadId: string
  headers: MessageHeaders
  from: EmailAddress
  to: EmailAddress[]
  cc: EmailAddress[]
  bcc: EmailAddress[]
  date: Date
  bodyParts: BodyPart[]
  size: number
  flags: MessageFlags
  labels: string[]
  folder: string
  dlpVerdict?: DLPVerdict
  spamScore?: number
  attachments: Attachment[]
  isEncrypted: boolean
  isSigned: boolean
  readReceipt?: ReadReceipt
  priority: MessagePriority
}

export interface Thread {
  id: string
  messageIds: string[]
  participants: EmailAddress[]
  lastUpdated: Date
  labels: string[]
  subject: string
  snippet: string
  isRead: boolean
  isStarred: boolean
  isImportant: boolean
  isPinned: boolean
  snoozedUntil?: Date
}

export interface EmailAddress {
  name?: string
  email: string
  displayName: string
}

export interface MessageHeaders {
  messageId: string
  inReplyTo?: string
  references?: string[]
  subject: string
  date: string
  from: string
  to: string
  cc?: string
  bcc?: string
  replyTo?: string
  returnPath?: string
  xOriginalSender?: string
  xSpamScore?: string
  xSpamFlags?: string
  xMailer?: string
  [key: string]: string | undefined
}

export interface BodyPart {
  id: string
  contentType: string
  content: string
  isHtml: boolean
  charset?: string
  encoding?: string
  size: number
}

export interface Attachment {
  id: string
  filename: string
  contentType: string
  size: number
  isInline: boolean
  contentId?: string
  downloadUrl?: string
  thumbnailUrl?: string
  isMalwareScanned: boolean
  isMalwareFree: boolean
}

export interface MessageFlags {
  isRead: boolean
  isStarred: boolean
  isImportant: boolean
  isPinned: boolean
  isSnoozed: boolean
  isArchived: boolean
  isDeleted: boolean
  isDraft: boolean
  isSent: boolean
  isSpam: boolean
  isPhishing: boolean
  hasAttachments: boolean
  isEncrypted: boolean
  isSigned: boolean
}

export interface DLPVerdict {
  level: 'low' | 'medium' | 'high' | 'critical'
  rules: string[]
  actions: string[]
  confidence: number
}

export interface ReadReceipt {
  requested: boolean
  delivered: boolean
  readAt?: Date
  readBy?: string
}

export type MessagePriority = 'low' | 'normal' | 'high'

// Folder and Label Types
export interface Folder {
  id: string
  name: string
  type: 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam' | 'archive' | 'custom'
  parentId?: string
  path: string
  unreadCount: number
  totalCount: number
  isSystem: boolean
  color?: string
  icon?: string
  syncEnabled: boolean
  permissions: FolderPermissions
}

export interface Label {
  id: string
  name: string
  color: string
  isSystem: boolean
  isVisible: boolean
  parentId?: string
  messageCount: number
}

export interface FolderPermissions {
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
  canManage: boolean
  canShare: boolean
}

// Search and Filter Types
export interface SearchQuery {
  query: string
  from?: string
  to?: string
  subject?: string
  body?: string
  hasAttachment?: boolean
  labels?: string[]
  folders?: string[]
  dateFrom?: Date
  dateTo?: Date
  sizeFrom?: number
  sizeTo?: number
  isRead?: boolean
  isStarred?: boolean
  isImportant?: boolean
  isEncrypted?: boolean
  isSigned?: boolean
  operators: SearchOperator[]
}

export interface SearchOperator {
  field: string
  operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'regex' | 'has' | 'before' | 'after' | 'between'
  value: string | number | Date | boolean
  logic?: 'AND' | 'OR' | 'NOT'
}

export interface SavedSearch {
  id: string
  name: string
  query: SearchQuery
  isPublic: boolean
  createdBy: string
  createdAt: Date
  lastUsed?: Date
  useCount: number
}

// Filter and Rules Types
export interface Filter {
  id: string
  name: string
  ownerId: string
  conditions: FilterCondition[]
  actions: FilterAction[]
  order: number
  enabled: boolean
  createdAt: Date
  lastModified: Date
}

export interface FilterCondition {
  field: string
  operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'regex' | 'has' | 'before' | 'after' | 'between'
  value: string | number | Date | boolean
  caseSensitive?: boolean
}

export interface FilterAction {
  type: 'move' | 'copy' | 'label' | 'star' | 'markRead' | 'markUnread' | 'forward' | 'reply' | 'delete' | 'archive'
  value: string
  parameters?: Record<string, any>
}

// Compose and Send Types
export interface ComposeMessage {
  to: EmailAddress[]
  cc: EmailAddress[]
  bcc: EmailAddress[]
  subject: string
  body: string
  isHtml: boolean
  attachments: Attachment[]
  priority: MessagePriority
  requestReadReceipt: boolean
  sendLater?: Date
  templateId?: string
  signatureId?: string
  isEncrypted: boolean
  isSigned: boolean
  replyToMessageId?: string
  forwardMessageId?: string
}

export interface Template {
  id: string
  name: string
  subject: string
  body: string
  isHtml: boolean
  variables: TemplateVariable[]
  category: string
  isPublic: boolean
  createdBy: string
  createdAt: Date
  lastModified: Date
}

export interface TemplateVariable {
  name: string
  type: 'text' | 'email' | 'date' | 'number'
  defaultValue?: string
  required: boolean
  description?: string
}

export interface Signature {
  id: string
  name: string
  content: string
  isHtml: boolean
  isDefault: boolean
  createdBy: string
  createdAt: Date
  lastModified: Date
}

// Security Types
export interface SecuritySettings {
  sMimeEnabled: boolean
  sMimeCertificates: SMimeCertificate[]
  tlsEnforcement: boolean
  phishingProtection: boolean
  linkProtection: boolean
  attachmentScanning: boolean
  twoFactorRequired: boolean
  sessionTimeout: number
  allowedClients: string[]
  blockedDomains: string[]
  allowedDomains: string[]
}

export interface SMimeCertificate {
  id: string
  userId: string
  type: 'signing' | 'encryption' | 'both'
  publicKey: string
  privateKeyRef: string
  status: 'active' | 'expired' | 'revoked'
  validFrom: Date
  validTo: Date
  issuer: string
  subject: string
  fingerprint: string
}

// Admin and Compliance Types
export interface Domain {
  id: string
  name: string
  status: 'pending' | 'verified' | 'failed' | 'suspended'
  spfStatus: 'none' | 'pass' | 'fail' | 'softfail' | 'neutral'
  dkimKeys: DKIMKey[]
  dmarcPolicy: DMARCPolicy
  mxRecords: MXRecord[]
  createdAt: Date
  verifiedAt?: Date
}

export interface DKIMKey {
  id: string
  selector: string
  publicKey: string
  privateKey: string
  status: 'active' | 'pending' | 'revoked'
  createdAt: Date
  lastUsed?: Date
}

export interface DMARCPolicy {
  policy: 'none' | 'quarantine' | 'reject'
  percentage: number
  rua: string[]
  ruf: string[]
  reportInterval: number
  lastReport?: Date
}

export interface MXRecord {
  priority: number
  hostname: string
  status: 'active' | 'pending' | 'failed'
}

export interface User {
  id: string
  email: string
  displayName: string
  firstName: string
  lastName: string
  role: UserRole
  status: 'active' | 'suspended' | 'pending'
  twoFactorEnabled: boolean
  lastLogin?: Date
  createdAt: Date
  permissions: UserPermissions
  quota: QuotaSettings
}

export interface UserRole {
  id: string
  name: string
  permissions: string[]
  isSystem: boolean
}

export interface UserPermissions {
  canSend: boolean
  canReceive: boolean
  canCompose: boolean
  canDelete: boolean
  canArchive: boolean
  canCreateFolders: boolean
  canCreateLabels: boolean
  canCreateFilters: boolean
  canUseTemplates: boolean
  canUseSignatures: boolean
  canEncrypt: boolean
  canSign: boolean
  maxAttachmentSize: number
  maxDailySend: number
}

export interface QuotaSettings {
  storageLimit: number
  storageUsed: number
  messageLimit: number
  messageCount: number
  attachmentLimit: number
  attachmentCount: number
}

// Audit and Compliance Types
export interface AuditLog {
  id: string
  actor: string
  action: string
  target: string
  targetType: 'message' | 'folder' | 'label' | 'filter' | 'user' | 'domain' | 'admin'
  timestamp: Date
  ipAddress: string
  userAgent: string
  details: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface RetentionPolicy {
  id: string
  name: string
  scope: 'all' | 'folder' | 'label' | 'user'
  scopeValue: string
  duration: number // in days
  legalHoldFlag: boolean
  actions: ('delete' | 'archive' | 'encrypt')[]
  enabled: boolean
  createdAt: Date
  lastModified: Date
}

// Migration Types
export interface MigrationJob {
  id: string
  type: 'imap' | 'pop' | 'exchange' | 'gmail' | 'outlook'
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused'
  source: MigrationSource
  target: MigrationTarget
  progress: MigrationProgress
  settings: MigrationSettings
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  errorMessage?: string
}

export interface MigrationSource {
  type: string
  hostname: string
  port: number
  username: string
  password: string
  useSSL: boolean
  folders: string[]
  dateFrom?: Date
  dateTo?: Date
}

export interface MigrationTarget {
  userId: string
  folderMapping: Record<string, string>
  labelMapping: Record<string, string>
}

export interface MigrationProgress {
  totalMessages: number
  processedMessages: number
  successfulMessages: number
  failedMessages: number
  currentFolder: string
  estimatedTimeRemaining: number
  bytesTransferred: number
  totalBytes: number
}

export interface MigrationSettings {
  batchSize: number
  throttleDelay: number
  skipDuplicates: boolean
  preserveTimestamps: boolean
  includeAttachments: boolean
  maxAttachmentSize: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: PaginationInfo
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// UI State Types
export interface MailViewState {
  currentFolder: string
  selectedThreads: string[]
  selectedMessage?: string
  searchQuery?: SearchQuery
  viewMode: 'list' | 'thread' | 'split'
  sortBy: 'date' | 'from' | 'subject' | 'size'
  sortOrder: 'asc' | 'desc'
  filterBy: Partial<MessageFlags>
  groupBy?: 'date' | 'sender' | 'subject' | 'label'
}

export interface ComposeState {
  isOpen: boolean
  message: Partial<ComposeMessage>
  isDraft: boolean
  draftId?: string
  replyToMessageId?: string
  forwardMessageId?: string
  templateId?: string
}

// Notification Types
export interface Notification {
  id: string
  type: 'new_message' | 'delivery_failed' | 'quota_warning' | 'security_alert' | 'migration_complete'
  title: string
  message: string
  isRead: boolean
  createdAt: Date
  actionUrl?: string
  priority: 'low' | 'medium' | 'high'
}

// Contact Types
export interface Contact {
  id: string
  name: string
  email: string
  avatar?: string
  department?: string
  phone?: string
  title?: string
  company?: string
  notes?: string
  tags?: string[]
  isFavorite: boolean
  createdAt: Date
  lastModified: Date
}

// Task Types
export interface Task {
  id: string
  title: string
  description?: string
  assignedTo: string
  createdBy: string
  dueDate?: Date
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  tags?: string[]
  attachments?: Attachment[]
  relatedMessageId?: string
  createdAt: Date
  lastModified: Date
}

// Note Types
export interface Note {
  id: string
  title: string
  content: string
  isHtml: boolean
  tags?: string[]
  isShared: boolean
  sharedWith?: string[]
  createdBy: string
  createdAt: Date
  lastModified: Date
}

// Bookmark Types
export interface Bookmark {
  id: string
  title: string
  url: string
  description?: string
  tags?: string[]
  isPublic: boolean
  createdBy: string
  createdAt: Date
  lastModified: Date
}

// Calendar Event Types
export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  location?: string
  attendees: EmailAddress[]
  organizer: EmailAddress
  isAllDay: boolean
  isRecurring: boolean
  recurrenceRule?: string
  status: 'tentative' | 'confirmed' | 'cancelled'
  visibility: 'public' | 'private' | 'confidential'
  createdAt: Date
  lastModified: Date
}

// Draft Types
export interface Draft {
  id: string
  message: ComposeMessage
  createdAt: Date
  lastModified: Date
  version: number
  isAutoSaved: boolean
  conflictVersion?: number
}

// Compose State Types
export interface ComposeSettings {
  autoSave: boolean
  autoSaveInterval: number
  spellCheck: boolean
  grammarCheck: boolean
  smartQuotes: boolean
  autoLink: boolean
  showWordCount: boolean
  defaultFont: string
  defaultFontSize: string
  defaultTextColor: string
  defaultBackgroundColor: string
}

// Keyboard Shortcuts
export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  action: string
  description: string
}

// Offline Support
export interface OfflineQueue {
  id: string
  type: 'send' | 'save_draft' | 'upload_attachment'
  data: any
  timestamp: Date
  retryCount: number
  maxRetries: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

// Service Worker Types
export interface ServiceWorkerMessage {
  type: 'CACHE_UPDATE' | 'OFFLINE_QUEUE' | 'SYNC_COMPLETE' | 'NOTIFICATION'
  payload?: any
}

// DLP (Data Loss Prevention) Types
export interface DLPRule {
  id: string
  name: string
  description: string
  pattern: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  action: 'warn' | 'block' | 'encrypt' | 'audit'
  isEnabled: boolean
  createdAt: Date
  lastModified: Date
}

export interface DLPViolation {
  id: string
  ruleId: string
  messageId: string
  severity: string
  action: string
  detectedAt: Date
  resolvedAt?: Date
  resolvedBy?: string
}

// Phishing Protection
export interface PhishingRule {
  id: string
  name: string
  pattern: string
  confidence: number
  action: 'warn' | 'block' | 'quarantine'
  isEnabled: boolean
}

export interface PhishingDetection {
  id: string
  messageId: string
  ruleId: string
  confidence: number
  detectedAt: Date
  action: string
  falsePositive: boolean
}

// Audit Trail
export interface AuditEvent {
  id: string
  actor: string
  action: string
  target: string
  targetType: 'message' | 'draft' | 'attachment' | 'template' | 'signature'
  details: Record<string, any>
  timestamp: Date
  ipAddress: string
  userAgent: string
  sessionId: string
}

// Performance Metrics
export interface PerformanceMetrics {
  composeLoadTime: number
  editorResponseTime: number
  autoSaveTime: number
  attachmentUploadTime: number
  searchResponseTime: number
  renderTime: number
}

// Accessibility Features
export interface AccessibilitySettings {
  highContrast: boolean
  largeText: boolean
  screenReader: boolean
  keyboardNavigation: boolean
  focusIndicators: boolean
  reducedMotion: boolean
  colorBlindSupport: boolean
}
