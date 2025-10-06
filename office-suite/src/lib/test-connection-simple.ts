// ============================================================================
// SIMPLE CONNECTION TEST UTILITIES
// ============================================================================

import { supabase } from './supabase-client'

// ============================================================================
// ENVIRONMENT VARIABLES TEST
// ============================================================================

export const testEnvironmentVariables = async () => {
  try {
    console.log('🔍 Testing environment variables...')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    // Check if variables exist
    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        success: false,
        error: 'Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
      }
    }
    
    // Check if variables are not default values
    if (supabaseUrl === 'https://your-project.supabase.co' || supabaseAnonKey === 'your-anon-key') {
      return {
        success: false,
        error: 'Environment variables contain default placeholder values. Please set your actual Supabase credentials.'
      }
    }
    
    // Check URL format
    try {
      new URL(supabaseUrl)
    } catch {
      return {
        success: false,
        error: 'Invalid Supabase URL format'
      }
    }
    
    console.log('✅ Environment variables are properly configured')
    return {
      success: true,
      data: {
        url: supabaseUrl,
        hasKey: !!supabaseAnonKey,
        keyLength: supabaseAnonKey?.length || 0
      }
    }
  } catch (error: any) {
    console.error('❌ Environment variables test failed:', error)
    return {
      success: false,
      error: error.message || 'Environment variables test failed'
    }
  }
}

// ============================================================================
// NETWORK CONNECTIVITY TEST
// ============================================================================

export const testNetworkConnectivity = async () => {
  try {
    console.log('🔍 Testing network connectivity...')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
      return {
        success: false,
        error: 'Supabase URL not configured'
      }
    }
    
    // Test basic connectivity to Supabase
    const startTime = Date.now()
    
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`
        }
      })
      
      const responseTime = Date.now() - startTime
      
      if (response.ok) {
        console.log(`✅ Network connectivity successful (${responseTime}ms)`)
        return {
          success: true,
          data: {
            responseTime,
            status: response.status,
            statusText: response.statusText
          }
        }
      } else {
        return {
          success: false,
          error: `Network request failed with status ${response.status}: ${response.statusText}`
        }
      }
    } catch (fetchError: any) {
      return {
        success: false,
        error: `Network request failed: ${fetchError.message}`
      }
    }
  } catch (error: any) {
    console.error('❌ Network connectivity test failed:', error)
    return {
      success: false,
      error: error.message || 'Network connectivity test failed'
    }
  }
}

// ============================================================================
// SIMPLE DATABASE CONNECTION TEST
// ============================================================================

export const testSimpleConnection = async () => {
  try {
    console.log('🔍 Testing simple database connection...')
    
    // Test basic connection with a simple query
    const { data, error } = await supabase
      .from('admin_users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Database connection failed:', error.message)
      return {
        success: false,
        error: `Database connection failed: ${error.message}`
      }
    }
    
    console.log('✅ Simple database connection successful!')
    return {
      success: true,
      data: {
        message: 'Database connection successful',
        canQuery: true,
        response: data
      }
    }
  } catch (error: any) {
    console.error('❌ Simple database connection test failed:', error)
    return {
      success: false,
      error: error.message || 'Simple database connection test failed'
    }
  }
}

// ============================================================================
// COMPREHENSIVE CONNECTION TEST
// ============================================================================

export const testComprehensiveConnection = async () => {
  try {
    console.log('🔍 Running comprehensive connection test...')
    
    const results = {
      environment: await testEnvironmentVariables(),
      network: await testNetworkConnectivity(),
      database: await testSimpleConnection()
    }
    
    const allSuccessful = Object.values(results).every(result => result.success)
    
    return {
      success: allSuccessful,
      results,
      summary: {
        environment: results.environment.success ? '✅' : '❌',
        network: results.network.success ? '✅' : '❌',
        database: results.database.success ? '✅' : '❌'
      }
    }
  } catch (error: any) {
    console.error('❌ Comprehensive connection test failed:', error)
    return {
      success: false,
      error: error.message || 'Comprehensive connection test failed'
    }
  }
}
