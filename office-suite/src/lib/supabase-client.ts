// ============================================================================
// SUPABASE CLIENT CONFIGURATION
// ============================================================================

import { createClient } from '@supabase/supabase-js'

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

// ============================================================================
// SUPABASE CLIENT
// ============================================================================

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// ============================================================================
// TYPES FOR SUPABASE
// ============================================================================

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string
          name: string
          email: string
          role: 'owner' | 'admin' | 'helpdesk' | 'user' | 'auditor'
          status: 'active' | 'inactive' | 'suspended'
          last_login: string | null
          quota: number
          used_quota: number
          aliases: string[]
          permissions: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          role: 'owner' | 'admin' | 'helpdesk' | 'user' | 'auditor'
          status?: 'active' | 'inactive' | 'suspended'
          last_login?: string | null
          quota?: number
          used_quota?: number
          aliases?: string[]
          permissions?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'owner' | 'admin' | 'helpdesk' | 'user' | 'auditor'
          status?: 'active' | 'inactive' | 'suspended'
          last_login?: string | null
          quota?: number
          used_quota?: number
          aliases?: string[]
          permissions?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      email_servers: {
        Row: {
          id: string
          name: string
          type: 'smtp' | 'imap' | 'pop3' | 'exchange'
          host: string
          port: number
          encryption: 'none' | 'ssl' | 'tls' | 'starttls'
          authentication: 'none' | 'password' | 'oauth2' | 'ntlm'
          status: 'active' | 'inactive' | 'error' | 'testing'
          last_tested: string | null
          response_time: number
          uptime: number
          configuration: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'smtp' | 'imap' | 'pop3' | 'exchange'
          host: string
          port: number
          encryption: 'none' | 'ssl' | 'tls' | 'starttls'
          authentication: 'none' | 'password' | 'oauth2' | 'ntlm'
          status?: 'active' | 'inactive' | 'error' | 'testing'
          last_tested?: string | null
          response_time?: number
          uptime?: number
          configuration?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'smtp' | 'imap' | 'pop3' | 'exchange'
          host?: string
          port?: number
          encryption?: 'none' | 'ssl' | 'tls' | 'starttls'
          authentication?: 'none' | 'password' | 'oauth2' | 'ntlm'
          status?: 'active' | 'inactive' | 'error' | 'testing'
          last_tested?: string | null
          response_time?: number
          uptime?: number
          configuration?: any
          created_at?: string
          updated_at?: string
        }
      }
      domains: {
        Row: {
          id: string
          domain_name: string
          status: 'pending' | 'verified' | 'failed' | 'suspended'
          verification_token: string | null
          dns_records: any[]
          ssl_enabled: boolean
          ssl_certificate: string | null
          ssl_expiry: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          domain_name: string
          status?: 'pending' | 'verified' | 'failed' | 'suspended'
          verification_token?: string | null
          dns_records?: any[]
          ssl_enabled?: boolean
          ssl_certificate?: string | null
          ssl_expiry?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          domain_name?: string
          status?: 'pending' | 'verified' | 'failed' | 'suspended'
          verification_token?: string | null
          dns_records?: any[]
          ssl_enabled?: boolean
          ssl_certificate?: string | null
          ssl_expiry?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      system_metrics: {
        Row: {
          id: string
          name: string
          value: number
          unit: string
          status: 'normal' | 'warning' | 'critical'
          trend: 'up' | 'down' | 'stable'
          last_updated: string
          threshold_warning: number
          threshold_critical: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          value: number
          unit: string
          status: 'normal' | 'warning' | 'critical'
          trend: 'up' | 'down' | 'stable'
          last_updated?: string
          threshold_warning: number
          threshold_critical: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          value?: number
          unit?: string
          status?: 'normal' | 'warning' | 'critical'
          trend?: 'up' | 'down' | 'stable'
          last_updated?: string
          threshold_warning?: number
          threshold_critical?: number
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          timestamp: string
          user_email: string
          action: string
          resource: string
          status: 'success' | 'failure' | 'warning'
          ip_address: string | null
          user_agent: string | null
          details: string | null
          created_at: string
        }
        Insert: {
          id?: string
          timestamp?: string
          user_email: string
          action: string
          resource: string
          status: 'success' | 'failure' | 'warning'
          ip_address?: string | null
          user_agent?: string | null
          details?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          timestamp?: string
          user_email?: string
          action?: string
          resource?: string
          status?: 'success' | 'failure' | 'warning'
          ip_address?: string | null
          user_agent?: string | null
          details?: string | null
          created_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          title: string
          description: string | null
          severity: 'low' | 'medium' | 'high' | 'critical'
          status: 'active' | 'resolved' | 'acknowledged'
          source: string
          assigned_to: string | null
          created_at: string
          resolved_at: string | null
          acknowledged_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          severity: 'low' | 'medium' | 'high' | 'critical'
          status?: 'active' | 'resolved' | 'acknowledged'
          source: string
          assigned_to?: string | null
          created_at?: string
          resolved_at?: string | null
          acknowledged_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          severity?: 'low' | 'medium' | 'high' | 'critical'
          status?: 'active' | 'resolved' | 'acknowledged'
          source?: string
          assigned_to?: string | null
          created_at?: string
          resolved_at?: string | null
          acknowledged_at?: string | null
        }
      }
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const isSupabaseEnabled = () => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return false
  }
  
  // Check if environment variables are properly set
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return !!(url && key && url !== 'https://your-project.supabase.co' && key !== 'your-anon-key')
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const createAuditLog = async (log: {
  user_email: string
  action: string
  resource: string
  status: 'success' | 'failure' | 'warning'
  ip_address?: string
  user_agent?: string
  details?: string
}) => {
  const { data, error } = await supabase
    .from('audit_logs')
    .insert([{
      ...log,
      timestamp: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) throw error
  return data
}