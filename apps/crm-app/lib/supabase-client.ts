// Supabase Client Configuration for CRM App
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Get environment variables (Next.js uses process.env)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined

// Create Supabase client if environment variables are properly configured
export const supabase: SupabaseClient | null = (
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key'
)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null

// Check if Supabase is enabled
export function isSupabaseEnabled(): boolean {
  return supabase !== null
}
