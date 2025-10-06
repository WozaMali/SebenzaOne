// ============================================================================
// ADMIN API SERVICE
// ============================================================================

import { supabase } from '../supabase-client'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'helpdesk' | 'user' | 'auditor'
  status: 'active' | 'inactive' | 'suspended'
  lastLogin: string
  quota: number
  usedQuota: number
  aliases: string[]
  createdAt: string
  permissions: string[]
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
  lastTested: string
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
}

export interface SystemMetric {
  id: string
  name: string
  value: number
  unit: string
  status: 'normal' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
  lastUpdated: string
  threshold: {
    warning: number
    critical: number
  }
}

export interface AuditLog {
  id: string
  timestamp: string
  user: string
  action: string
  resource: string
  status: 'success' | 'failure' | 'warning'
  ipAddress: string
  userAgent: string
  details: string
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

// Users API
export const getUsers = async (): Promise<AdminUser[]> => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export const createUser = async (user: Omit<AdminUser, 'id' | 'createdAt'>): Promise<AdminUser | null> => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .insert([{
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        quota: user.quota,
        used_quota: user.usedQuota,
        aliases: user.aliases,
        permissions: user.permissions
      }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating user:', error)
    return null
  }
}

export const updateUser = async (id: string, updates: Partial<AdminUser>): Promise<AdminUser | null> => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .update({
        name: updates.name,
        email: updates.email,
        role: updates.role,
        status: updates.status,
        quota: updates.quota,
        used_quota: updates.usedQuota,
        aliases: updates.aliases,
        permissions: updates.permissions
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating user:', error)
    return null
  }
}

export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting user:', error)
    return false
  }
}

// Email Servers API
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

export const createEmailServer = async (server: Omit<EmailServer, 'id'>): Promise<EmailServer | null> => {
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

export const testEmailServer = async (id: string): Promise<{ success: boolean; responseTime?: number; error?: string }> => {
  try {
    // This would call your backend API to test the server
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

// System Metrics API
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

// Audit Logs API
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

export const createAuditLog = async (log: Omit<AuditLog, 'id'>): Promise<AuditLog | null> => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert([{
        timestamp: log.timestamp,
        user: log.user,
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
      return '✅'
    case 'inactive':
    case 'failure':
    case 'critical':
      return '❌'
    case 'warning':
      return '⚠️'
    case 'testing':
      return '🔄'
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
