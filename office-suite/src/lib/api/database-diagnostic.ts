// ============================================================================
// DATABASE DIAGNOSTIC TOOL
// ============================================================================

import { supabase } from '../supabase-client'

export interface DatabaseDiagnostic {
  connection: boolean
  tables: string[]
  errors: string[]
  recommendations: string[]
}

export const diagnoseDatabase = async (): Promise<DatabaseDiagnostic> => {
  const diagnostic: DatabaseDiagnostic = {
    connection: false,
    tables: [],
    errors: [],
    recommendations: []
  }

  try {
    // Test basic connection
    console.log('🔍 Testing Supabase connection...')
    const { data, error } = await supabase
      .from('admin_users')
      .select('count')
      .limit(1)

    if (error) {
      diagnostic.errors.push(`Connection error: ${error.message}`)
      diagnostic.recommendations.push('Check your .env.local file has correct Supabase credentials')
      return diagnostic
    }

    diagnostic.connection = true
    console.log('✅ Supabase connection successful')

    // Check what tables exist
    const tablesToCheck = [
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

    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)

        if (error) {
          if (error.code === '42P01') {
            diagnostic.errors.push(`Table '${table}' does not exist`)
          } else {
            diagnostic.errors.push(`Table '${table}' error: ${error.message}`)
          }
        } else {
          diagnostic.tables.push(table)
        }
      } catch (err: any) {
        diagnostic.errors.push(`Table '${table}' check failed: ${err.message}`)
      }
    }

    // Generate recommendations
    if (diagnostic.tables.length === 0) {
      diagnostic.recommendations.push('No tables found. Run the database schema in Supabase SQL Editor')
    } else if (diagnostic.tables.length < 5) {
      diagnostic.recommendations.push('Some tables are missing. Consider running the full schema')
    }

    if (diagnostic.errors.length > 0) {
      diagnostic.recommendations.push('Check the SQL Editor in your Supabase dashboard for syntax errors')
    }

    return diagnostic

  } catch (error: any) {
    diagnostic.errors.push(`Diagnostic failed: ${error.message}`)
    diagnostic.recommendations.push('Check your internet connection and Supabase project status')
    return diagnostic
  }
}

// Simple table existence check
export const checkTableExists = async (tableName: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)

    return !error
  } catch {
    return false
  }
}

// Get table structure
export const getTableStructure = async (tableName: string): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)

    if (error) {
      return { error: error.message }
    }

    return { columns: data?.[0] ? Object.keys(data[0]) : [], sample: data?.[0] }
  } catch (err: any) {
    return { error: err.message }
  }
}
