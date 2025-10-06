// ============================================================================
// DATABASE CONNECTION TEST
// ============================================================================

import { supabase } from './supabase-client'

export const testDatabaseConnection = async () => {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test basic connection
    const { data, error } = await supabase
      .from('admin_users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Database connection failed:', error.message)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Database connection successful!')
    
    // Test if tables exist
    const tables = ['admin_users', 'email_servers', 'email_templates', 'system_metrics']
    const results = []
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          results.push({ table, status: 'error', message: error.message })
        } else {
          results.push({ table, status: 'success', count: data?.length || 0 })
        }
      } catch (err) {
        results.push({ table, status: 'error', message: 'Table not found' })
      }
    }
    
    console.log('📊 Table status:', results)
    return { success: true, tables: results }
    
  } catch (error) {
    console.error('❌ Database test error:', error)
    return { success: false, error: 'Database test failed' }
  }
}

// Auto-run test in browser
if (typeof window !== 'undefined') {
  testDatabaseConnection()
}
