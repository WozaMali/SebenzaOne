import { createSupabaseClient } from '@sebenza/supabase-config'

export function getSupabaseClient() {
  return createSupabaseClient({
    storageKey: 'sb-projects-auth'
  })
}
