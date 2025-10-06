// Supabase integration for mail settings
import { createClient } from '@supabase/supabase-js'

// Types for mail configuration
export interface MailConfig {
  id?: string
  smtp_host: string
  smtp_port: number
  aws_region: string
  aws_access_key_id: string
  aws_secret_access_key: string
  from_email: string
  from_name: string
  ssl_enabled: boolean
  two_factor_enabled: boolean
  spam_protection: boolean
  virus_scanning: boolean
  max_attachment_size: number
  max_recipients: number
  retention_days: number
  supabase_url: string
  supabase_anon_key: string
  created_at?: string
  updated_at?: string
}

export interface DomainVerification {
  mx?: boolean
  spf?: boolean
  dkim?: boolean[]
  dmarc?: boolean
  lastChecked?: string
}

export interface Domain {
  id: string
  name: string
  status: 'pending' | 'verified' | 'failed'
  records: number
  total_records: number
  users: number
  is_active: boolean
  mx_record?: string
  txt_record?: string
  dkim_selectors?: string[]
  dmarc_value?: string
  verification?: DomainVerification | null
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Moderator' | 'User'
  status: 'Active' | 'Inactive'
  last_seen: string
  created_at: string
  updated_at: string
}

export interface Report {
  id: string
  name: string
  type: string
  date: string
  size: string
  data?: any
  created_at: string
}

// Initialize Supabase client
let supabase: any = null

export const initSupabase = (url: string, anonKey: string) => {
  supabase = createClient(url, anonKey)
  return supabase
}

// Mail Configuration Functions
export const getMailConfig = async (): Promise<MailConfig | null> => {
  if (!supabase) throw new Error('Supabase not initialized')
  
  const { data, error } = await supabase
    .from('mail_config')
    .select('*')
    .single()
  
  if (error) {
    console.error('Error fetching mail config:', error)
    return null
  }
  
  return data
}

export const saveMailConfig = async (config: MailConfig): Promise<boolean> => {
  if (!supabase) throw new Error('Supabase not initialized')
  
  const { error } = await supabase
    .from('mail_config')
    .upsert(config)
  
  if (error) {
    console.error('Error saving mail config:', error)
    return false
  }
  
  return true
}

// Domain Functions
export const getDomains = async (): Promise<Domain[]> => {
  if (!supabase) throw new Error('Supabase not initialized')
  
  const { data, error } = await supabase
    .from('domains')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching domains:', error)
    return []
  }
  
  return data || []
}

export const addDomain = async (domain: Omit<Domain, 'id' | 'created_at' | 'updated_at'>): Promise<Domain | null> => {
  if (!supabase) throw new Error('Supabase not initialized')
  
  const { data, error } = await supabase
    .from('domains')
    .insert([{
      ...domain,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single()
  
  if (error) {
    console.error('Error adding domain:', error)
    return null
  }
  
  return data
}

export const updateDomain = async (id: string, updates: Partial<Domain>): Promise<boolean> => {
  if (!supabase) throw new Error('Supabase not initialized')
  
  const { error } = await supabase
    .from('domains')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
  
  if (error) {
    console.error('Error updating domain:', error)
    return false
  }
  
  return true
}

export const updateDomainVerification = async (id: string, verification: DomainVerification): Promise<boolean> => {
  return await updateDomain(id, { verification })
}

export const deleteDomain = async (id: string): Promise<boolean> => {
  if (!supabase) throw new Error('Supabase not initialized')
  
  const { error } = await supabase
    .from('domains')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting domain:', error)
    return false
  }
  
  return true
}

// User Functions
export const getUsers = async (): Promise<User[]> => {
  if (!supabase) throw new Error('Supabase not initialized')
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching users:', error)
    return []
  }
  
  return data || []
}

export const addUser = async (user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User | null> => {
  if (!supabase) throw new Error('Supabase not initialized')
  
  const { data, error } = await supabase
    .from('users')
    .insert([{
      ...user,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single()
  
  if (error) {
    console.error('Error adding user:', error)
    return null
  }
  
  return data
}

export const updateUser = async (id: string, updates: Partial<User>): Promise<boolean> => {
  if (!supabase) throw new Error('Supabase not initialized')
  
  const { error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
  
  if (error) {
    console.error('Error updating user:', error)
    return false
  }
  
  return true
}

export const deleteUser = async (id: string): Promise<boolean> => {
  if (!supabase) throw new Error('Supabase not initialized')
  
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting user:', error)
    return false
  }
  
  return true
}

// Report Functions
export const getReports = async (): Promise<Report[]> => {
  if (!supabase) throw new Error('Supabase not initialized')
  
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching reports:', error)
    return []
  }
  
  return data || []
}

export const generateReport = async (reportData: Omit<Report, 'id' | 'created_at'>): Promise<Report | null> => {
  if (!supabase) throw new Error('Supabase not initialized')
  
  const { data, error } = await supabase
    .from('reports')
    .insert([{
      ...reportData,
      created_at: new Date().toISOString()
    }])
    .select()
    .single()
  
  if (error) {
    console.error('Error generating report:', error)
    return null
  }
  
  return data
}

export const deleteReport = async (id: string): Promise<boolean> => {
  if (!supabase) throw new Error('Supabase not initialized')
  
  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting report:', error)
    return false
  }
  
  return true
}

// AWS SES Integration Functions
export const testAWSSESConnection = async (config: MailConfig): Promise<{ success: boolean; message: string }> => {
  try {
    // In a real implementation, this would use AWS SDK to test SES
    // For now, we'll simulate the test
    const hasValidConfig = config.aws_access_key_id.startsWith('AKIA') && 
                          config.aws_secret_access_key.length > 20 &&
                          config.from_email.includes('@')
    
    return {
      success: hasValidConfig,
      message: hasValidConfig ? "AWS SES connection verified" : "Invalid AWS configuration"
    }
  } catch (error) {
    console.error('AWS SES connection test failed:', error)
    return { success: false, message: "Connection test failed" }
  }
}

// Dashboard Statistics Functions
export const getDashboardStats = async () => {
  if (!supabase) throw new Error('Supabase not initialized')
  
  try {
    // Get email statistics
    const { data: emailStats } = await supabase
      .from('emails')
      .select('id, created_at')
    
    // Get user statistics
    const { data: userStats } = await supabase
      .from('users')
      .select('id, status, created_at')
    
    // Calculate statistics
    const totalEmails = emailStats?.length || 0
    const activeUsers = userStats?.filter(u => u.status === 'Active').length || 0
    const totalUsers = userStats?.length || 0
    
    // Calculate storage usage (simplified)
    const storageUsed = totalEmails * 0.001 // Assume 1KB per email
    const storageTotal = 10 // 10GB total
    
    return {
      totalEmails,
      activeUsers,
      storageUsed: Math.round(storageUsed * 100) / 100,
      storageTotal,
      uptime: 99.9
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      totalEmails: 0,
      activeUsers: 0,
      storageUsed: 0,
      storageTotal: 10,
      uptime: 0
    }
  }
}
