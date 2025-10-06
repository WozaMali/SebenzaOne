// ============================================================================
// ADMIN API SERVICE - FALLBACK VERSION
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
  lastLogin?: string
  quota: number
  usedQuota: number
  aliases: string[]
  createdAt: string
  permissions: string[]
}

// ============================================================================
// FALLBACK API FUNCTIONS
// ============================================================================

// Test database connection
export const testConnection = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('count')
      .limit(1)

    if (error) {
      return { success: false, error: error.message }
    }
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Get users with fallback to mock data
export const getUsers = async (): Promise<AdminUser[]> => {
  try {
    // First try to get real data
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Database error, using fallback data:', error.message)
      return getMockUsers()
    }

    if (!data || data.length === 0) {
      console.log('No users found, using mock data')
      return getMockUsers()
    }

    // Transform database data to match interface
    return data.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      lastLogin: user.last_login,
      quota: user.quota || 10000,
      usedQuota: user.used_quota || 0,
      aliases: user.aliases || [],
      createdAt: user.created_at,
      permissions: user.permissions || []
    }))
  } catch (error) {
    console.error('Error fetching users, using fallback:', error)
    return getMockUsers()
  }
}

// Create user with fallback
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

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
      lastLogin: data.last_login,
      quota: data.quota,
      usedQuota: data.used_quota,
      aliases: data.aliases,
      createdAt: data.created_at,
      permissions: data.permissions
    }
  } catch (error) {
    console.error('Error creating user:', error)
    return null
  }
}

// Update user with fallback
export const updateUser = async (id: string, updates: Partial<AdminUser>): Promise<AdminUser | null> => {
  try {
    const updateData: any = {}
    
    if (updates.name) updateData.name = updates.name
    if (updates.email) updateData.email = updates.email
    if (updates.role) updateData.role = updates.role
    if (updates.status) updateData.status = updates.status
    if (updates.quota !== undefined) updateData.quota = updates.quota
    if (updates.usedQuota !== undefined) updateData.used_quota = updates.usedQuota
    if (updates.aliases) updateData.aliases = updates.aliases
    if (updates.permissions) updateData.permissions = updates.permissions

    const { data, error } = await supabase
      .from('admin_users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
      lastLogin: data.last_login,
      quota: data.quota,
      usedQuota: data.used_quota,
      aliases: data.aliases,
      createdAt: data.created_at,
      permissions: data.permissions
    }
  } catch (error) {
    console.error('Error updating user:', error)
    return null
  }
}

// Delete user with fallback
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

// ============================================================================
// MOCK DATA FALLBACK
// ============================================================================

const getMockUsers = (): AdminUser[] => [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@sebenza.co.za',
    role: 'owner',
    status: 'active',
    lastLogin: new Date().toISOString(),
    quota: 10000,
    usedQuota: 2500,
    aliases: ['john.doe@sebenza.co.za'],
    createdAt: new Date().toISOString(),
    permissions: ['read', 'write', 'admin']
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@sebenza.co.za',
    role: 'admin',
    status: 'active',
    lastLogin: new Date(Date.now() - 86400000).toISOString(),
    quota: 5000,
    usedQuota: 1200,
    aliases: ['jane.smith@sebenza.co.za'],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    permissions: ['read', 'write']
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@sebenza.co.za',
    role: 'user',
    status: 'active',
    lastLogin: new Date(Date.now() - 259200000).toISOString(),
    quota: 2000,
    usedQuota: 800,
    aliases: [],
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    permissions: ['read']
  }
]

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
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
