// ============================================================================
// CONNECTION TEST
// ============================================================================

import { supabase } from './supabase-client'

export const testConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase
      .from('admin_users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Supabase connection successful!')
    return { success: true, data }
  } catch (error) {
    console.error('❌ Connection error:', error)
    return { success: false, error: 'Connection failed' }
  }
}

// Run test automatically
if (typeof window !== 'undefined') {
  testConnection()
}
