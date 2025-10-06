// CRM Core Types
export interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  title?: string
  companyId?: string
  company?: Company
  avatar?: string
  notes?: string
  tags: string[]
  isFavorite: boolean
  source: 'manual' | 'import' | 'email' | 'website'
  status: 'active' | 'inactive' | 'prospect' | 'customer' | 'lead'
  lastContactDate?: Date
  nextFollowUp?: Date
  createdAt: Date
  updatedAt: Date
  createdBy: string
  assignedTo?: string
  customFields: Record<string, any>
  socialProfiles: SocialProfile[]
  addresses: Address[]
  communicationHistory: Communication[]
}

export interface Company {
  id: string
  name: string
  website?: string
  industry?: string
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  description?: string
  logo?: string
  phone?: string
  email?: string
  address?: Address
  tags: string[]
  isFavorite: boolean
  status: 'active' | 'inactive' | 'prospect' | 'customer' | 'competitor'
  annualRevenue?: number
  employeeCount?: number
  foundedYear?: number
  lastContactDate?: Date
  nextFollowUp?: Date
  createdAt: Date
  updatedAt: Date
  createdBy: string
  assignedTo?: string
  customFields: Record<string, any>
  socialProfiles: SocialProfile[]
  contacts: Contact[]
  deals: Deal[]
}

export interface Deal {
  id: string
  name: string
  description?: string
  value: number
  currency: string
  stage: DealStage
  probability: number
  closeDate?: Date
  expectedCloseDate?: Date
  contactId?: string
  contact?: Contact
  companyId?: string
  company?: Company
  ownerId: string
  owner?: User
  source: 'website' | 'referral' | 'cold_call' | 'email' | 'social' | 'advertisement' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'active' | 'won' | 'lost' | 'paused' | 'cancelled'
  tags: string[]
  notes: string
  activities: Activity[]
  attachments: Attachment[]
  customFields: Record<string, any>
  createdAt: Date
  updatedAt: Date
  lastActivityAt?: Date
  wonDate?: Date
  lostDate?: Date
  lostReason?: string
  nextFollowUp?: Date
  emailThreads: EmailThread[]
}

export type DealStage = 
  | 'lead' 
  | 'qualified' 
  | 'proposal' 
  | 'negotiation' 
  | 'closed-won' 
  | 'closed-lost'

export interface DealStageConfig {
  id: DealStage
  name: string
  description: string
  color: string
  order: number
  isWon: boolean
  isLost: boolean
  isActive: boolean
  probability: number
  requirements: string[]
}

export interface Activity {
  id: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'file' | 'deal_update'
  title: string
  description?: string
  date: Date
  duration?: number // in minutes
  contactId?: string
  contact?: Contact
  companyId?: string
  company?: Company
  dealId?: string
  deal?: Deal
  userId: string
  user?: User
  isCompleted: boolean
  priority: 'low' | 'medium' | 'high'
  tags: string[]
  attachments: Attachment[]
  createdAt: Date
  updatedAt: Date
  emailThreadId?: string
  emailThread?: EmailThread
}

export interface EmailThread {
  id: string
  subject: string
  participants: EmailAddress[]
  lastMessageDate: Date
  messageCount: number
  isRead: boolean
  isImportant: boolean
  isStarred: boolean
  folder: string
  labels: string[]
  contactId?: string
  contact?: Contact
  companyId?: string
  company?: Company
  dealId?: string
  deal?: Deal
  activityId?: string
  activity?: Activity
  messages: EmailMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface EmailMessage {
  id: string
  threadId: string
  from: EmailAddress
  to: EmailAddress[]
  cc?: EmailAddress[]
  bcc?: EmailAddress[]
  subject: string
  body: string
  isHtml: boolean
  date: Date
  isRead: boolean
  isImportant: boolean
  isStarred: boolean
  hasAttachments: boolean
  attachments: Attachment[]
  labels: string[]
  folder: string
  priority: 'low' | 'normal' | 'high'
  inReplyTo?: string
  references?: string[]
  messageId: string
  size: number
  isEncrypted: boolean
  isSigned: boolean
}

export interface EmailAddress {
  name?: string
  email: string
  displayName: string
}

export interface Attachment {
  id: string
  filename: string
  contentType: string
  size: number
  url?: string
  thumbnailUrl?: string
  isInline: boolean
  contentId?: string
  uploadedAt: Date
  uploadedBy: string
}

export interface SocialProfile {
  platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'github' | 'website'
  url: string
  username?: string
  isVerified: boolean
}

export interface Address {
  type: 'work' | 'home' | 'billing' | 'shipping' | 'other'
  street: string
  city: string
  state?: string
  postalCode?: string
  country: string
  isPrimary: boolean
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  avatar?: string
  role: UserRole
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface UserRole {
  id: string
  name: string
  permissions: string[]
  isSystem: boolean
}

// CRM Analytics Types
export interface CRMAnalytics {
  deals: DealAnalytics
  contacts: ContactAnalytics
  companies: CompanyAnalytics
  activities: ActivityAnalytics
  pipeline: PipelineAnalytics
  performance: PerformanceAnalytics
}

export interface DealAnalytics {
  total: number
  active: number
  won: number
  lost: number
  totalValue: number
  averageValue: number
  averageDealSize: number
  winRate: number
  conversionRate: number
  averageSalesCycle: number
  dealsByStage: Record<DealStage, number>
  dealsBySource: Record<string, number>
  dealsByOwner: Record<string, number>
  monthlyTrends: MonthlyTrend[]
  quarterlyTrends: QuarterlyTrend[]
}

export interface ContactAnalytics {
  total: number
  active: number
  newThisMonth: number
  newThisQuarter: number
  byStatus: Record<string, number>
  bySource: Record<string, number>
  byOwner: Record<string, number>
  averageLifetimeValue: number
  engagementScore: number
  monthlyTrends: MonthlyTrend[]
}

export interface CompanyAnalytics {
  total: number
  active: number
  newThisMonth: number
  byIndustry: Record<string, number>
  bySize: Record<string, number>
  byStatus: Record<string, number>
  averageDealsPerCompany: number
  averageValuePerCompany: number
  monthlyTrends: MonthlyTrend[]
}

export interface ActivityAnalytics {
  total: number
  thisWeek: number
  thisMonth: number
  byType: Record<string, number>
  byUser: Record<string, number>
  averagePerDay: number
  completionRate: number
  monthlyTrends: MonthlyTrend[]
}

export interface PipelineAnalytics {
  totalValue: number
  weightedValue: number
  dealsByStage: Record<DealStage, PipelineStageData>
  velocity: number
  conversionRates: Record<DealStage, number>
  averageStageTime: Record<DealStage, number>
  forecast: ForecastData
}

export interface PipelineStageData {
  count: number
  value: number
  weightedValue: number
  averageValue: number
  averageAge: number
  conversionRate: number
}

export interface ForecastData {
  optimistic: number
  realistic: number
  pessimistic: number
  confidence: number
  lastUpdated: Date
}

export interface PerformanceAnalytics {
  revenue: RevenueData
  goals: GoalData[]
  achievements: AchievementData[]
  rankings: RankingData[]
  trends: TrendData[]
}

export interface RevenueData {
  total: number
  thisMonth: number
  lastMonth: number
  thisQuarter: number
  lastQuarter: number
  thisYear: number
  lastYear: number
  growth: number
  target: number
  achievement: number
}

export interface GoalData {
  id: string
  name: string
  type: 'revenue' | 'deals' | 'activities' | 'contacts'
  target: number
  current: number
  period: 'monthly' | 'quarterly' | 'yearly'
  startDate: Date
  endDate: Date
  isAchieved: boolean
  progress: number
}

export interface AchievementData {
  id: string
  name: string
  description: string
  type: 'milestone' | 'record' | 'goal' | 'special'
  value: number
  date: Date
  isPublic: boolean
}

export interface RankingData {
  userId: string
  userName: string
  metric: string
  value: number
  rank: number
  change: number
}

export interface TrendData {
  metric: string
  period: string
  values: number[]
  dates: Date[]
  trend: 'up' | 'down' | 'stable'
  change: number
}

export interface MonthlyTrend {
  month: string
  value: number
  change: number
}

export interface QuarterlyTrend {
  quarter: string
  value: number
  change: number
}

// CRM Search and Filter Types
export interface CRMSearchQuery {
  query: string
  entity: 'all' | 'contacts' | 'companies' | 'deals' | 'activities'
  filters: CRMFilter[]
  sortBy: string
  sortOrder: 'asc' | 'desc'
  page: number
  limit: number
}

export interface CRMFilter {
  field: string
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between' | 'in' | 'notIn'
  value: any
  values?: any[]
  logic?: 'AND' | 'OR'
}

export interface CRMSearchResult {
  contacts: Contact[]
  companies: Company[]
  deals: Deal[]
  activities: Activity[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// CRM Settings Types
export interface CRMSettings {
  dealStages: DealStageConfig[]
  customFields: CustomField[]
  emailTemplates: EmailTemplate[]
  automationRules: AutomationRule[]
  integrations: Integration[]
  notifications: NotificationSettings
  permissions: PermissionSettings
  appearance: AppearanceSettings
}

export interface CustomField {
  id: string
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect' | 'textarea'
  entity: 'contact' | 'company' | 'deal' | 'activity'
  isRequired: boolean
  isVisible: boolean
  options?: string[]
  defaultValue?: any
  validation?: ValidationRule[]
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'custom'
  value?: any
  message: string
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  isHtml: boolean
  category: string
  tags: string[]
  isPublic: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
  useCount: number
  variables: TemplateVariable[]
}

export interface TemplateVariable {
  name: string
  label: string
  type: 'text' | 'email' | 'date' | 'number' | 'select'
  defaultValue?: string
  required: boolean
  options?: string[]
}

export interface AutomationRule {
  id: string
  name: string
  description: string
  trigger: AutomationTrigger
  conditions: AutomationCondition[]
  actions: AutomationAction[]
  isActive: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface AutomationTrigger {
  type: 'contact_created' | 'contact_updated' | 'deal_created' | 'deal_updated' | 'deal_stage_changed' | 'activity_created' | 'email_received'
  entity: string
  conditions?: AutomationCondition[]
}

export interface AutomationCondition {
  field: string
  operator: string
  value: any
}

export interface AutomationAction {
  type: 'send_email' | 'create_task' | 'update_field' | 'add_tag' | 'assign_user' | 'create_activity'
  parameters: Record<string, any>
}

export interface Integration {
  id: string
  name: string
  type: 'email' | 'calendar' | 'crm' | 'marketing' | 'support' | 'social'
  provider: string
  isActive: boolean
  config: Record<string, any>
  lastSync?: Date
  createdAt: Date
  updatedAt: Date
}

export interface NotificationSettings {
  email: boolean
  inApp: boolean
  push: boolean
  types: NotificationType[]
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly'
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
}

export interface NotificationType {
  id: string
  name: string
  description: string
  isEnabled: boolean
  channels: ('email' | 'inApp' | 'push')[]
}

export interface PermissionSettings {
  roles: UserRole[]
  permissions: Permission[]
  defaultRole: string
}

export interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
  conditions?: string[]
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto'
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  fontSize: 'small' | 'medium' | 'large'
  density: 'compact' | 'comfortable' | 'spacious'
  sidebarCollapsed: boolean
  showAvatars: boolean
  showTimestamps: boolean
  dateFormat: string
  timeFormat: '12h' | '24h'
  timezone: string
}

// CRM State Types
export interface CRMViewState {
  currentView: 'dashboard' | 'contacts' | 'companies' | 'deals' | 'activities' | 'analytics'
  selectedEntity?: string
  selectedEntityType?: 'contact' | 'company' | 'deal' | 'activity'
  searchQuery: string
  filters: CRMFilter[]
  sortBy: string
  sortOrder: 'asc' | 'desc'
  viewMode: 'list' | 'grid' | 'kanban'
  page: number
  limit: number
  sidebarCollapsed: boolean
  selectedDealStage?: DealStage
  selectedContactStatus?: string
  selectedCompanyStatus?: string
}

export interface CRMComposeState {
  isOpen: boolean
  type: 'email' | 'note' | 'task' | 'call' | 'meeting'
  entityType?: 'contact' | 'company' | 'deal'
  entityId?: string
  templateId?: string
  data: Record<string, any>
  isDraft: boolean
  draftId?: string
}

// CRM API Types
export interface CRMAPIResponse<T> {
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

// CRM Import/Export Types
export interface CRMImportResult {
  imported: number
  failed: number
  errors: ImportError[]
  warnings: ImportWarning[]
}

export interface ImportError {
  row: number
  field: string
  message: string
  value: any
}

export interface ImportWarning {
  row: number
  field: string
  message: string
  value: any
}

export interface CRMExportOptions {
  format: 'csv' | 'xlsx' | 'json'
  entities: ('contacts' | 'companies' | 'deals' | 'activities')[]
  fields: string[]
  filters?: CRMFilter[]
  dateRange?: {
    start: Date
    end: Date
  }
}

// CRM Communication Types
export interface Communication {
  id: string
  type: 'email' | 'call' | 'meeting' | 'note' | 'task' | 'file'
  subject: string
  content: string
  date: Date
  direction: 'inbound' | 'outbound'
  contactId?: string
  companyId?: string
  dealId?: string
  userId: string
  isImportant: boolean
  isStarred: boolean
  tags: string[]
  attachments: Attachment[]
  emailThreadId?: string
  createdAt: Date
  updatedAt: Date
}

// CRM Task Types
export interface Task {
  id: string
  title: string
  description?: string
  type: 'call' | 'email' | 'meeting' | 'follow_up' | 'proposal' | 'demo' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  dueDate?: Date
  completedDate?: Date
  assignedTo: string
  createdBy: string
  contactId?: string
  companyId?: string
  dealId?: string
  activityId?: string
  tags: string[]
  isRecurring: boolean
  recurrencePattern?: RecurrencePattern
  createdAt: Date
  updatedAt: Date
}

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  daysOfWeek?: number[]
  dayOfMonth?: number
  endDate?: Date
  maxOccurrences?: number
}

// CRM Report Types
export interface CRMReport {
  id: string
  name: string
  description: string
  type: 'analytics' | 'forecast' | 'performance' | 'custom'
  entity: 'contacts' | 'companies' | 'deals' | 'activities' | 'all'
  filters: CRMFilter[]
  groupBy: string[]
  metrics: string[]
  chartType: 'bar' | 'line' | 'pie' | 'table' | 'funnel'
  isPublic: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
  lastRun?: Date
  schedule?: ReportSchedule
}

export interface ReportSchedule {
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  dayOfWeek?: number
  dayOfMonth?: number
  time: string
  recipients: string[]
  format: 'pdf' | 'excel' | 'csv'
}

// CRM Webhook Types
export interface CRMWebhook {
  id: string
  name: string
  url: string
  events: string[]
  isActive: boolean
  secret?: string
  headers?: Record<string, string>
  retryCount: number
  lastTriggered?: Date
  createdAt: Date
  updatedAt: Date
}

export interface WebhookEvent {
  id: string
  webhookId: string
  event: string
  entity: string
  entityId: string
  data: any
  status: 'pending' | 'sent' | 'failed' | 'retrying'
  attempts: number
  lastAttempt?: Date
  nextAttempt?: Date
  response?: string
  createdAt: Date
  updatedAt: Date
}
