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
  priority: 'low' | 'medium' | 'high'
  labels: string[]
  order_index: number
  created_at: string
  updated_at: string
}

let supabase: any = null

export const initSupabaseProjects = (url: string, anonKey: string) => {
  supabase = createClient(url, anonKey)
  return supabase
}

export const fetchBoard = async (projectId = 'default') => {
  if (!supabase) throw new Error('Supabase not initialized')
  const [{ data: columns }, { data: tasks }] = await Promise.all([
    supabase.from('project_columns').select('*').eq('project_id', projectId).order('order_index', { ascending: true }),
    supabase.from('project_tasks').select('*').eq('project_id', projectId).order('order_index', { ascending: true })
  ])
  return { columns: (columns || []) as ProjectColumn[], tasks: (tasks || []) as ProjectTask[] }
}

export const addTask = async (task: Omit<ProjectTask, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('project_tasks')
    .insert([task])
    .select()
    .single()
  if (error) throw error
  return data as ProjectTask
}

export const moveTask = async (taskId: string, toColumnId: string, toOrderIndex: number) => {
  const { error } = await supabase
    .from('project_tasks')
    .update({ column_id: toColumnId, order_index: toOrderIndex })
    .eq('id', taskId)
  if (error) throw error
}

export const reorderColumnTasks = async (columnId: string, orderedTaskIds: string[]) => {
  // Batch update order_index for tasks in a column
  const updates = orderedTaskIds.map((id, idx) => ({ id, order_index: idx }))
  const { error } = await supabase
    .from('project_tasks')
    .upsert(updates, { onConflict: 'id' })
  if (error) throw error
}


