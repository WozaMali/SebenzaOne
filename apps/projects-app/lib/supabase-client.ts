// Supabase client for projects app
// This provides compatibility with office-suite code patterns

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Get environment variables (Next.js uses process.env)
const supabaseUrl = typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_SUPABASE_URL : undefined
const supabaseAnonKey = typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined

// Only create Supabase client if environment variables are properly configured
// Otherwise, set to null - all usages should check first
export const supabase: SupabaseClient | null = (supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key')
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null
