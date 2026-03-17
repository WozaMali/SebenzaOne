import { createClient } from '@supabase/supabase-js'

export type ProjectColumn = {
  id: string
  project_id: string
  title: string
  color: string
  order_index: number
  created_at: string
  updated_at: string
}

export type ProjectTask = {
  id: string
  project_id: string
  column_id: string
  title: string
  description: string
  assignee: string
  due_date: string | null
  start_date: string | null
  estimate_hours: number | null
  priority: 'low' | 'medium' | 'high'
  labels: string[]
  status: 'todo' | 'inprogress' | 'review' | 'done'
  order_index: number
  created_at: string
  updated_at: string
}

let supabase: any = null
let supabaseConfig: { url: string; anonKey: string } | null = null

export const initSupabaseProjects = (url: string, anonKey: string) => {
  // Avoid creating multiple clients (can cause GoTrueClient storage-key warnings and duplicate listeners)
  if (supabase && supabaseConfig?.url === url && supabaseConfig?.anonKey === anonKey) {
    return supabase
  }

  supabaseConfig = { url, anonKey }
  // Use a distinct storage key to avoid collisions with other Supabase clients in the same app
  // while still persisting sessions.
  supabase = createClient(url, anonKey, {
    auth: {
      storageKey: 'sb-projects-auth-token',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
  return supabase
}

const requireSupabase = () => {
  if (!supabase) throw new Error('Supabase not initialized')
  return supabase
}

export const fetchBoard = async (projectId = 'default') => {
  const sb = requireSupabase()
  try {
    await ensureDefaultBoard(projectId)
    const [{ data: columns, error: colError }, { data: tasks, error: taskError }] = await Promise.all([
      sb.from('project_columns').select('*').eq('project_id', projectId).order('order_index', { ascending: true }),
      sb.from('project_tasks').select('*').eq('project_id', projectId).order('order_index', { ascending: true })
    ])
    if (colError && isNetworkError(colError)) throw new Error('NETWORK_ERROR')
    if (taskError && isNetworkError(taskError)) throw new Error('NETWORK_ERROR')
    if (colError) throw colError
    if (taskError) throw taskError
    return { columns: (columns || []) as ProjectColumn[], tasks: (tasks || []) as ProjectTask[] }
  } catch (err: any) {
    if (isNetworkError(err) || err?.message === 'NETWORK_ERROR') {
      throw new Error('NETWORK_ERROR')
    }
    throw err
  }
}

export const listProjectIds = async (): Promise<string[]> => {
  const sb = requireSupabase()
  try {
    const { data, error } = await sb.from('project_columns').select('project_id')
    if (error) {
      if (isNetworkError(error)) throw new Error('NETWORK_ERROR')
      throw error
    }
    const ids = (data || []).map((r: any) => String(r.project_id)).filter(Boolean)
    return Array.from(new Set(ids)).sort()
  } catch (err: any) {
    if (isNetworkError(err) || err?.message === 'NETWORK_ERROR') {
      throw new Error('NETWORK_ERROR')
    }
    throw err
  }
}

const isNetworkError = (error: any): boolean => {
  if (!error) return false
  const msg = String(error.message || error).toLowerCase()
  return (
    msg.includes('err_name_not_resolved') ||
    msg.includes('networkerror') ||
    msg.includes('failed to fetch') ||
    msg.includes('network request failed') ||
    error.code === 'ENOTFOUND' ||
    error.code === 'ECONNREFUSED'
  )
}

export const ensureDefaultBoard = async (projectId: string) => {
  const sb = requireSupabase()
  try {
    // Check if ANY columns exist for this project (not just one)
    const { data: existing, error: existingError } = await sb
      .from('project_columns')
      .select('id, title')
      .eq('project_id', projectId)
    if (existingError) {
      if (isNetworkError(existingError)) throw new Error('NETWORK_ERROR')
      throw existingError
    }
    // If we already have columns, don't create defaults
    if (existing && existing.length > 0) return
  } catch (err: any) {
    if (isNetworkError(err) || err?.message === 'NETWORK_ERROR') {
      throw new Error('NETWORK_ERROR')
    }
    throw err
  }

  const defaults = [
    { project_id: projectId, title: 'To Do', color: 'bg-slate-100', order_index: 0 },
    { project_id: projectId, title: 'In Progress', color: 'bg-blue-100', order_index: 1 },
    { project_id: projectId, title: 'Review', color: 'bg-amber-100', order_index: 2 },
    { project_id: projectId, title: 'Done', color: 'bg-green-100', order_index: 3 },
  ]

  try {
    const { error } = await sb.from('project_columns').insert(defaults)
    if (error) {
      if (isNetworkError(error)) throw new Error('NETWORK_ERROR')
      throw error
    }
  } catch (err: any) {
    if (isNetworkError(err) || err?.message === 'NETWORK_ERROR') {
      throw new Error('NETWORK_ERROR')
    }
    throw err
  }
}

export const addColumn = async (column: Omit<ProjectColumn, 'id' | 'created_at' | 'updated_at'>) => {
  const sb = requireSupabase()
  try {
    const { data, error } = await sb.from('project_columns').insert([column]).select().single()
    if (error) {
      if (isNetworkError(error)) throw new Error('NETWORK_ERROR')
      throw error
    }
    return data as ProjectColumn
  } catch (err: any) {
    if (isNetworkError(err) || err?.message === 'NETWORK_ERROR') {
      throw new Error('NETWORK_ERROR')
    }
    throw err
  }
}

export const updateColumn = async (columnId: string, updates: Partial<Pick<ProjectColumn, 'title' | 'color' | 'order_index'>>) => {
  const sb = requireSupabase()
  try {
    const { data, error } = await sb.from('project_columns').update(updates).eq('id', columnId).select().single()
    if (error) {
      if (isNetworkError(error)) throw new Error('NETWORK_ERROR')
      throw error
    }
    return data as ProjectColumn
  } catch (err: any) {
    if (isNetworkError(err) || err?.message === 'NETWORK_ERROR') {
      throw new Error('NETWORK_ERROR')
    }
    throw err
  }
}

export const deleteColumn = async (columnId: string) => {
  const sb = requireSupabase()
  try {
    const { error } = await sb.from('project_columns').delete().eq('id', columnId)
    if (error) {
      if (isNetworkError(error)) throw new Error('NETWORK_ERROR')
      throw error
    }
  } catch (err: any) {
    if (isNetworkError(err) || err?.message === 'NETWORK_ERROR') {
      throw new Error('NETWORK_ERROR')
    }
    throw err
  }
}

export const addTask = async (task: Omit<ProjectTask, 'id' | 'created_at' | 'updated_at'>) => {
  const sb = requireSupabase()
  const { data, error } = await sb
    .from('project_tasks')
    .insert([task])
    .select()
    .single()
  if (error) throw error
  return data as ProjectTask
}

export const moveTask = async (taskId: string, toColumnId: string, toOrderIndex: number) => {
  const sb = requireSupabase()
  const { error } = await sb
    .from('project_tasks')
    .update({ column_id: toColumnId, order_index: toOrderIndex })
    .eq('id', taskId)
  if (error) throw error
}

export const updateTask = async (taskId: string, updates: Partial<Pick<ProjectTask, 'title' | 'description' | 'assignee' | 'due_date' | 'start_date' | 'estimate_hours' | 'priority' | 'labels' | 'status' | 'column_id' | 'order_index'>>) => {
  const sb = requireSupabase()
  try {
    const { data, error } = await sb.from('project_tasks').update(updates).eq('id', taskId).select().single()
    if (error) {
      if (isNetworkError(error)) throw new Error('NETWORK_ERROR')
      throw error
    }
    return data as ProjectTask
  } catch (err: any) {
    if (isNetworkError(err) || err?.message === 'NETWORK_ERROR') {
      throw new Error('NETWORK_ERROR')
    }
    throw err
  }
}

export const deleteTask = async (taskId: string) => {
  const sb = requireSupabase()
  try {
    const { error } = await sb.from('project_tasks').delete().eq('id', taskId)
    if (error) {
      if (isNetworkError(error)) throw new Error('NETWORK_ERROR')
      throw error
    }
  } catch (err: any) {
    if (isNetworkError(err) || err?.message === 'NETWORK_ERROR') {
      throw new Error('NETWORK_ERROR')
    }
    throw err
  }
}

export const reorderColumnTasks = async (columnId: string, orderedTaskIds: string[]) => {
  // Batch update order_index for tasks in a column
  const updates = orderedTaskIds.map((id, idx) => ({ id, order_index: idx }))
  const sb = requireSupabase()
  const { error } = await sb
    .from('project_tasks')
    .upsert(updates, { onConflict: 'id' })
  if (error) throw error
}

/**
 * Get Supabase configuration from environment variables (adapted for Next.js)
 */
export function getSupabaseConfig(): { url: string; key: string } | null {
  const url = typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_SUPABASE_URL : undefined
  const key = typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined

  if (!url || !key) return null
  if (url === 'https://your-project.supabase.co' || key === 'your-anon-key') return null
  return { url, key }
}
