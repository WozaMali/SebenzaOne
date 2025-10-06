// ============================================================================
// SUPABASE CONNECTION TEST
// ============================================================================

import { supabase } from './supabase-client'

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase
      .from('admin_users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Supabase connection failed:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Supabase connection successful!')
    return { success: true, data }
  } catch (error) {
    console.error('❌ Supabase connection error:', error)
    return { success: false, error: 'Connection failed' }
  }
}

export const testDatabaseSchema = async () => {
  try {
    console.log('🔍 Testing database schema...')
    
    const tables = [
      'admin_users',
      'email_servers', 
      'email_templates',
      'email_rules',
      'email_quotas',
      'system_metrics',
      'audit_logs',
      'alerts',
      'domains',
      'integrations'
    ]
    
    const results = []
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          results.push({ table, exists: false, error: error.message })
        } else {
          results.push({ table, exists: true, count: data?.length || 0 })
        }
      } catch (err) {
        results.push({ table, exists: false, error: 'Table not found' })
      }
    }
    
    console.log('📊 Database schema test results:', results)
    return { success: true, results }
  } catch (error) {
    console.error('❌ Database schema test failed:', error)
    return { success: false, error: 'Schema test failed' }
  }
}

export const testAPIEndpoints = async () => {
  try {
    console.log('🔍 Testing API endpoints...')
    
    // Test user creation
    const testUser = {
      name: 'Test User',
      email: 'test@sebenza.co.za',
      role: 'user' as const,
      status: 'active' as const,
      quota: 1000,
      used_quota: 0,
      aliases: [],
      permissions: ['mail']
    }
    
    const { data: userData, error: userError } = await supabase
      .from('admin_users')
      .insert([testUser])
      .select()
      .single()
    
    if (userError) {
      console.error('❌ User creation failed:', userError)
      return { success: false, error: userError.message }
    }
    
    console.log('✅ User created successfully:', userData)
    
    // Clean up test user
    await supabase
      .from('admin_users')
      .delete()
      .eq('id', userData.id)
    
    console.log('🧹 Test user cleaned up')
    return { success: true, data: userData }
  } catch (error) {
    console.error('❌ API endpoints test failed:', error)
    return { success: false, error: 'API test failed' }
  }
}

// ============================================================================
// COMPREHENSIVE TEST
// ============================================================================

export const runAllTests = async () => {
  console.log('🚀 Starting comprehensive Supabase tests...')
  
  const results = {
    connection: await testSupabaseConnection(),
    schema: await testDatabaseSchema(),
    api: await testAPIEndpoints()
  }
  
  const allPassed = Object.values(results).every(result => result.success)
  
  if (allPassed) {
    console.log('🎉 All tests passed! Your Supabase setup is working correctly.')
  } else {
    console.log('⚠️ Some tests failed. Check the results above for details.')
  }
  
  return results
}

// ============================================================================
// USAGE
// ============================================================================

// To run tests in browser console:
// import { runAllTests } from './lib/test-supabase'
// runAllTests()

// To run individual tests:
// import { testSupabaseConnection } from './lib/test-supabase'
// testSupabaseConnection()
