// ============================================================================
// MAIL ADMIN API SERVICE
// ============================================================================

import { supabase } from '../supabase-client'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Domain {
  id: string
  domainName: string
  status: 'pending' | 'verified' | 'failed' | 'suspended'
  verificationToken?: string
  dnsRecords: any[]
  sslEnabled: boolean
  sslCertificate?: string
  sslExpiry?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface EmailServer {
  id: string
  name: string
  type: 'smtp' | 'imap' | 'pop3' | 'exchange'
  host: string
  port: number
  encryption: 'none' | 'ssl' | 'tls' | 'starttls'
  authentication: 'none' | 'password' | 'oauth2' | 'ntlm'
  status: 'active' | 'inactive' | 'error' | 'testing'
  lastTested?: string
  responseTime: number
  uptime: number
  configuration: {
    maxConnections: number
    timeout: number
    retryAttempts: number
    queueSize: number
    rateLimit: number
    sslVerify: boolean
    allowInsecure: boolean
    compression: boolean
    keepAlive: boolean
  }
  createdAt: string
  updatedAt: string
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  type: 'welcome' | 'notification' | 'marketing' | 'system' | 'custom'
  category: string
  isActive: boolean
  variables: string[]
  usageCount: number
  createdBy: string
  lastModified: string
  createdAt: string
}

export interface EmailRule {
  id: string
  name: string
  description?: string
  conditionText: string
  actionText: string
  priority: number
  isActive: boolean
  category: 'filtering' | 'routing' | 'processing' | 'security' | 'compliance'
  lastTriggered?: string
  triggerCount: number
  createdAt: string
  updatedAt: string
}

export interface EmailQuota {
  id: string
  userEmail: string
  domain: string
  storageUsed: number
  storageLimit: number
  messageCount: number
  messageLimit: number
  lastReset: string
  nextReset?: string
  status: 'normal' | 'warning' | 'exceeded' | 'suspended'
  createdAt: string
  updatedAt: string
}

export interface SystemMetric {
  id: string
  name: string
  value: number
  unit: string
  status: 'normal' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
  lastUpdated: string
  thresholdWarning: number
  thresholdCritical: number
  createdAt: string
}

export interface AuditLog {
  id: string
  timestamp: string
  userEmail: string
  action: string
  resource: string
  status: 'success' | 'failure' | 'warning'
  ipAddress?: string
  userAgent?: string
  details?: string
  createdAt: string
}

export interface Alert {
  id: string
  title: string
  description?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'resolved' | 'acknowledged'
  source: string
  assignedTo?: string
  createdAt: string
  resolvedAt?: string
  acknowledgedAt?: string
}

export interface Integration {
  id: string
  name: string
  description?: string
  type: 'oauth' | 'api' | 'webhook' | 'smtp' | 'imap' | 'pop3' | 'exchange'
  provider: string
  status: 'active' | 'inactive' | 'error' | 'testing'
  lastSync?: string
  syncCount: number
  configuration: any
  createdAt: string
  updatedAt: string
}

// ============================================================================
// DOMAINS API
// ============================================================================

export const getDomains = async (): Promise<Domain[]> => {
  try {
    const { data, error } = await supabase
      .from('domains')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching domains:', error)
    return []
  }
}

export const createDomain = async (domain: Omit<Domain, 'id' | 'createdAt' | 'updatedAt'>): Promise<Domain | null> => {
  try {
    const { data, error } = await supabase
      .from('domains')
      .insert([{
        domain_name: domain.domainName,
        status: domain.status,
        verification_token: domain.verificationToken,
        dns_records: domain.dnsRecords,
        ssl_enabled: domain.sslEnabled,
        ssl_certificate: domain.sslCertificate,
        ssl_expiry: domain.sslExpiry,
        created_by: domain.createdBy
      }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating domain:', error)
    return null
  }
}

export const updateDomain = async (id: string, updates: Partial<Domain>): Promise<Domain | null> => {
  try {
    const { data, error } = await supabase
      .from('domains')
      .update({
        domain_name: updates.domainName,
        status: updates.status,
        verification_token: updates.verificationToken,
        dns_records: updates.dnsRecords,
        ssl_enabled: updates.sslEnabled,
        ssl_certificate: updates.sslCertificate,
        ssl_expiry: updates.sslExpiry
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating domain:', error)
    return null
  }
}

export const deleteDomain = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('domains')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting domain:', error)
    return false
  }
}

export const verifyDomain = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`/api/domains/${id}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error verifying domain:', error)
    return { success: false, error: 'Failed to verify domain' }
  }
}

// ============================================================================
// EMAIL SERVERS API
// ============================================================================

export const getEmailServers = async (): Promise<EmailServer[]> => {
  try {
    const { data, error } = await supabase
      .from('email_servers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching email servers:', error)
    return []
  }
}

export const createEmailServer = async (server: Omit<EmailServer, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailServer | null> => {
  try {
    const { data, error } = await supabase
      .from('email_servers')
      .insert([{
        name: server.name,
        type: server.type,
        host: server.host,
        port: server.port,
        encryption: server.encryption,
        authentication: server.authentication,
        status: server.status,
        last_tested: server.lastTested,
        response_time: server.responseTime,
        uptime: server.uptime,
        configuration: server.configuration
      }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating email server:', error)
    return null
  }
}

export const updateEmailServer = async (id: string, updates: Partial<EmailServer>): Promise<EmailServer | null> => {
  try {
    const { data, error } = await supabase
      .from('email_servers')
      .update({
        name: updates.name,
        type: updates.type,
        host: updates.host,
        port: updates.port,
        encryption: updates.encryption,
        authentication: updates.authentication,
        status: updates.status,
        last_tested: updates.lastTested,
        response_time: updates.responseTime,
        uptime: updates.uptime,
        configuration: updates.configuration
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating email server:', error)
    return null
  }
}

export const deleteEmailServer = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('email_servers')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting email server:', error)
    return false
  }
}

export const testEmailServer = async (id: string): Promise<{ success: boolean; responseTime?: number; error?: string }> => {
  try {
    const response = await fetch(`/api/email-servers/${id}/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error testing email server:', error)
    return { success: false, error: 'Failed to test server' }
  }
}

// ============================================================================
// EMAIL TEMPLATES API
// ============================================================================

export const getEmailTemplates = async (): Promise<EmailTemplate[]> => {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Email templates table not found, using fallback data:', error.message)
      return getMockEmailTemplates()
    }
    return data || []
  } catch (error) {
    console.error('Error fetching email templates, using fallback:', error)
    return getMockEmailTemplates()
  }
}

export const createEmailTemplate = async (template: Omit<EmailTemplate, 'id' | 'createdAt'>): Promise<EmailTemplate | null> => {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .insert([{
        name: template.name,
        subject: template.subject,
        content: template.content,
        template_type: template.type,
        category: template.category,
        is_active: template.isActive,
        variables: template.variables,
        usage_count: template.usageCount,
        created_by: template.createdBy,
        last_modified: template.lastModified
      }])
      .select()
      .single()

    if (error) {
      console.warn('Email templates table not found, cannot create template:', error.message)
      return null
    }
    return data
  } catch (error) {
    console.error('Error creating email template:', error)
    return null
  }
}

export const updateEmailTemplate = async (id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate | null> => {
  try {
    const updateData: any = {}
    if (updates.name) updateData.name = updates.name
    if (updates.subject) updateData.subject = updates.subject
    if (updates.content) updateData.content = updates.content
    if (updates.type) updateData.template_type = updates.type
    if (updates.category) updateData.category = updates.category
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive
    if (updates.variables) updateData.variables = updates.variables
    if (updates.usageCount !== undefined) updateData.usage_count = updates.usageCount
    if (updates.lastModified) updateData.last_modified = updates.lastModified

    const { data, error } = await supabase
      .from('email_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.warn('Email templates table not found, cannot update template:', error.message)
      return null
    }
    return data
  } catch (error) {
    console.error('Error updating email template:', error)
    return null
  }
}

export const deleteEmailTemplate = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id)

    if (error) {
      console.warn('Email templates table not found, cannot delete template:', error.message)
      return false
    }
    return true
  } catch (error) {
    console.error('Error deleting email template:', error)
    return false
  }
}

// ============================================================================
// EMAIL RULES API
// ============================================================================

export const getEmailRules = async (): Promise<EmailRule[]> => {
  try {
    const { data, error } = await supabase
      .from('email_rules')
      .select('*')
      .order('priority', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching email rules:', error)
    return []
  }
}

export const createEmailRule = async (rule: Omit<EmailRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailRule | null> => {
  try {
    const { data, error } = await supabase
      .from('email_rules')
      .insert([{
        name: rule.name,
        description: rule.description,
        condition_text: rule.conditionText,
        action_text: rule.actionText,
        priority: rule.priority,
        is_active: rule.isActive,
        category: rule.category,
        last_triggered: rule.lastTriggered,
        trigger_count: rule.triggerCount
      }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating email rule:', error)
    return null
  }
}

export const updateEmailRule = async (id: string, updates: Partial<EmailRule>): Promise<EmailRule | null> => {
  try {
    const { data, error } = await supabase
      .from('email_rules')
      .update({
        name: updates.name,
        description: updates.description,
        condition_text: updates.conditionText,
        action_text: updates.actionText,
        priority: updates.priority,
        is_active: updates.isActive,
        category: updates.category,
        last_triggered: updates.lastTriggered,
        trigger_count: updates.triggerCount
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating email rule:', error)
    return null
  }
}

export const deleteEmailRule = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('email_rules')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting email rule:', error)
    return false
  }
}

// ============================================================================
// EMAIL QUOTAS API
// ============================================================================

export const getEmailQuotas = async (): Promise<EmailQuota[]> => {
  try {
    const { data, error } = await supabase
      .from('email_quotas')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching email quotas:', error)
    return []
  }
}

export const updateEmailQuota = async (id: string, updates: Partial<EmailQuota>): Promise<EmailQuota | null> => {
  try {
    const { data, error } = await supabase
      .from('email_quotas')
      .update({
        user_email: updates.userEmail,
        domain: updates.domain,
        storage_used: updates.storageUsed,
        storage_limit: updates.storageLimit,
        message_count: updates.messageCount,
        message_limit: updates.messageLimit,
        last_reset: updates.lastReset,
        next_reset: updates.nextReset,
        status: updates.status
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating email quota:', error)
    return null
  }
}

// ============================================================================
// SYSTEM METRICS API
// ============================================================================

export const getSystemMetrics = async (): Promise<SystemMetric[]> => {
  try {
    const { data, error } = await supabase
      .from('system_metrics')
      .select('*')
      .order('last_updated', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching system metrics:', error)
    return []
  }
}

export const updateSystemMetric = async (id: string, value: number): Promise<SystemMetric | null> => {
  try {
    const { data, error } = await supabase
      .from('system_metrics')
      .update({
        value,
        last_updated: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating system metric:', error)
    return null
  }
}

// ============================================================================
// AUDIT LOGS API
// ============================================================================

export const getAuditLogs = async (limit: number = 100, offset: number = 0): Promise<AuditLog[]> => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return []
  }
}

export const createAuditLog = async (log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog | null> => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert([{
        timestamp: log.timestamp,
        user_email: log.userEmail,
        action: log.action,
        resource: log.resource,
        status: log.status,
        ip_address: log.ipAddress,
        user_agent: log.userAgent,
        details: log.details
      }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating audit log:', error)
    return null
  }
}

// ============================================================================
// ALERTS API
// ============================================================================

export const getAlerts = async (): Promise<Alert[]> => {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return []
  }
}

export const createAlert = async (alert: Omit<Alert, 'id' | 'createdAt'>): Promise<Alert | null> => {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .insert([{
        title: alert.title,
        description: alert.description,
        severity: alert.severity,
        status: alert.status,
        source: alert.source,
        assigned_to: alert.assignedTo,
        resolved_at: alert.resolvedAt,
        acknowledged_at: alert.acknowledgedAt
      }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating alert:', error)
    return null
  }
}

export const updateAlert = async (id: string, updates: Partial<Alert>): Promise<Alert | null> => {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .update({
        title: updates.title,
        description: updates.description,
        severity: updates.severity,
        status: updates.status,
        source: updates.source,
        assigned_to: updates.assignedTo,
        resolved_at: updates.resolvedAt,
        acknowledged_at: updates.acknowledgedAt
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating alert:', error)
    return null
  }
}

// ============================================================================
// INTEGRATIONS API
// ============================================================================

export const getIntegrations = async (): Promise<Integration[]> => {
  try {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching integrations:', error)
    return []
  }
}

export const createIntegration = async (integration: Omit<Integration, 'id' | 'createdAt' | 'updatedAt'>): Promise<Integration | null> => {
  try {
    const { data, error } = await supabase
      .from('integrations')
      .insert([{
        name: integration.name,
        description: integration.description,
        type: integration.type,
        provider: integration.provider,
        status: integration.status,
        last_sync: integration.lastSync,
        sync_count: integration.syncCount,
        configuration: integration.configuration
      }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating integration:', error)
    return null
  }
}

export const updateIntegration = async (id: string, updates: Partial<Integration>): Promise<Integration | null> => {
  try {
    const { data, error } = await supabase
      .from('integrations')
      .update({
        name: updates.name,
        description: updates.description,
        type: updates.type,
        provider: updates.provider,
        status: updates.status,
        last_sync: updates.lastSync,
        sync_count: updates.syncCount,
        configuration: updates.configuration
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating integration:', error)
    return null
  }
}

export const deleteIntegration = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting integration:', error)
    return false
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
    case 'success':
    case 'normal':
    case 'verified':
      return '✅'
    case 'inactive':
    case 'failure':
    case 'critical':
    case 'failed':
      return '❌'
    case 'warning':
    case 'testing':
    case 'pending':
      return '⚠️'
    case 'suspended':
      return '⏸️'
    default:
      return 'ℹ️'
  }
}

export const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'low':
      return 'text-blue-500'
    case 'medium':
      return 'text-yellow-500'
    case 'high':
      return 'text-orange-500'
    case 'critical':
      return 'text-red-500'
    default:
      return 'text-gray-500'
  }
}

export const getQuotaPercentage = (used: number, limit: number) => {
  return Math.round((used / limit) * 100)
}

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 GB'
  const gb = bytes / (1024 * 1024 * 1024)
  return `${gb.toFixed(1)} GB`
}

// ============================================================================
// MOCK DATA FALLBACKS
// ============================================================================

const getMockEmailTemplates = (): EmailTemplate[] => [
  {
    id: '1',
    name: 'Welcome Email',
    subject: 'Welcome to Sebenza!',
    content: 'Welcome to our platform. We\'re excited to have you on board!',
    type: 'welcome',
    category: 'onboarding',
    isActive: true,
    variables: ['user_name', 'company_name'],
    usageCount: 45,
    createdBy: 'system',
    lastModified: new Date().toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Password Reset',
    subject: 'Reset Your Password',
    content: 'Click the link below to reset your password: {{reset_link}}',
    type: 'system',
    category: 'security',
    isActive: true,
    variables: ['reset_link', 'user_name'],
    usageCount: 23,
    createdBy: 'system',
    lastModified: new Date().toISOString(),
    createdAt: new Date().toISOString()
  }
]
