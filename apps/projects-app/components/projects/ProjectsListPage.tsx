import { useState, useEffect } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProjectsTable } from './ProjectsTable'
import { ProjectsFilters } from './ProjectsFilters'
import { CreateProjectDialog } from './CreateProjectDialog'
import { EditProjectDialog } from './EditProjectDialog'
import { DeleteProjectDialog } from './DeleteProjectDialog'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { supabase } from '@/lib/supabase-client'

export interface Project {
  id: string
  code: string
  name: string
  owner: { id: string; name: string }
  status: 'ACTIVE' | 'ON_HOLD' | 'ARCHIVED'
  startDate: string | null
  endDate: string | null
  tasks: { done: number; total: number }
  percent: number
}

export interface ProjectFilters {
  status?: string
  ownerId?: string
  companyId?: string
  from?: string
  to?: string
  search?: string
  page: number
  size: number
}

interface ProjectsListPageProps {
  projectViewTab?: "active" | "templates" | "groups" | "public" | "archived"
  onProjectClick?: (projectId: string) => void
}

export function ProjectsListPage({ projectViewTab = "active", onProjectClick }: ProjectsListPageProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ProjectFilters>({
    page: 1,
    size: 25
  })
  const [total, setTotal] = useState(0)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [localProjectsCount, setLocalProjectsCount] = useState(0)

  // Function to sync localStorage projects to database
  const syncLocalProjectsToDatabase = async () => {
    if (!supabase) {
      alert('Supabase is not configured')
      return
    }

    try {
      setSyncing(true)
      const localProjects = typeof window !== 'undefined' ? window.localStorage.getItem('projects.meta') : null
      if (!localProjects) {
        alert('No local projects found to sync')
        return
      }

      const parsed = JSON.parse(localProjects)
      if (!Array.isArray(parsed) || parsed.length === 0) {
        alert('No local projects found to sync')
        return
      }

      // Get existing projects from database to avoid duplicates
      const { data: existingProjects } = await supabase
        .from('projects')
        .select('id, code')

      const existingIds = new Set(existingProjects?.map((p: any) => p.id) || [])
      const existingCodes = new Set(existingProjects?.map((p: any) => p.code) || [])

      // Default owner and company IDs
      const defaultOwnerId = '00000000-0000-0000-0000-000000000000'
      const defaultCompanyId = '00000000-0000-0000-0000-000000000000'

      // Helper function to check if a string is a valid UUID
      const isValidUUID = (str: string): boolean => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        return uuidRegex.test(str)
      }

      // Helper function to generate a UUID v4
      const generateUUID = (): string => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
          return crypto.randomUUID()
        }
        // Fallback UUID generator
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0
          const v = c === 'x' ? r : (r & 0x3 | 0x8)
          return v.toString(16)
        })
      }

      // Sync projects that don't exist in database
      let synced = 0
      let errors: string[] = []
      
      for (const localProject of parsed) {
        // Check if the ID is a valid UUID, if not generate one
        let projectId = localProject.id
        if (!isValidUUID(projectId)) {
          // Generate a new UUID for projects with non-UUID IDs
          projectId = generateUUID()
          console.log(`Generated UUID ${projectId} for project with non-UUID ID: ${localProject.id}`)
        }

        // Check if this UUID already exists in database
        if (existingIds.has(projectId)) {
          console.log(`Project ${projectId} (${localProject.name}) already exists in database, skipping`)
          continue // Already exists
        }

        // Generate a code from the project name or ID
        let code = localProject.name
          ? localProject.name
              .substring(0, 10)
              .toUpperCase()
              .replace(/[^A-Z0-9]/g, '')
              .padEnd(4, 'X')
          : localProject.id.substring(0, 4).toUpperCase()
        
        if (!code || code.length < 2) {
          code = localProject.id.substring(0, 4).toUpperCase() || 'PROJ'
        }

        // Make sure code is unique
        let uniqueCode = code
        let counter = 1
        while (existingCodes.has(uniqueCode)) {
          uniqueCode = `${code.substring(0, Math.max(1, code.length - 1))}${counter}`
          counter++
          if (counter > 999) {
            // Fallback to UUID-based code if we can't find a unique one
            uniqueCode = projectId.substring(0, 4).toUpperCase()
            break
          }
        }

        console.log(`Syncing project: ${localProject.name} (${localProject.id} -> ${projectId}) with code: ${uniqueCode}`)

        try {
          const { error } = await supabase
            .from('projects')
            .insert({
              id: projectId, // Use the UUID
              code: uniqueCode,
              name: isValidUUID(localProject.name) ? (uniqueCode || 'Unnamed Project') : (localProject.name || 'Unnamed Project'),
              description: null,
              status: localProject.archived ? 'ARCHIVED' : 'ACTIVE',
              owner_id: defaultOwnerId,
              company_id: defaultCompanyId,
              start_date: localProject.createdAt ? new Date(localProject.createdAt).toISOString().split('T')[0] : null,
              end_date: null,
            })

          if (error) {
            console.error(`Error syncing project ${localProject.id} (${localProject.name}):`, error)
            errors.push(`${localProject.name}: ${error.message}`)
          } else {
            synced++
            existingIds.add(projectId)
            existingCodes.add(uniqueCode)
            console.log(`Successfully synced project: ${localProject.name}`)
          }
        } catch (err: any) {
          console.error(`Exception syncing project ${localProject.id}:`, err)
          errors.push(`${localProject.name}: ${err.message}`)
        }
      }

      if (synced > 0) {
        const message = errors.length > 0
          ? `Successfully synced ${synced} project(s). ${errors.length} project(s) had errors:\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? `\n...and ${errors.length - 3} more` : ''}`
          : `Successfully synced ${synced} project(s) to database`
        alert(message)
        fetchProjects() // Refresh the list
      } else if (errors.length > 0) {
        alert(`Failed to sync projects:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n...and ${errors.length - 5} more` : ''}`)
      } else {
        alert('All local projects are already in the database')
      }
    } catch (err: any) {
      console.error('Error syncing projects:', err)
      alert(`Error syncing projects: ${err.message}`)
    } finally {
      setSyncing(false)
    }
  }

  // Helper to format project row with metrics
  const formatProjectRow = async (project: any, owner: any) => {
    if (!supabase) {
      return {
        id: project.id,
        code: project.code,
        name: project.name,
        owner: { id: project.owner_id, name: owner?.name || 'Unknown' },
        status: project.status,
        startDate: project.start_date,
        endDate: project.end_date,
        tasks: { done: 0, total: 0 },
        percent: 0
      }
    }

    const [doneResult, totalResult] = await Promise.all([
      supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('project_id', project.id).eq('status', 'CLOSED'),
      supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('project_id', project.id)
    ])
    
    const done = doneResult.count || 0
    const total = totalResult.count || 0
    const percent = total === 0 ? 0 : Math.round((done / total) * 100)
    
    return {
      id: project.id,
      code: project.code,
      name: project.name,
      owner: { id: project.owner_id, name: owner?.name || 'Unknown' },
      status: project.status,
      startDate: project.start_date,
      endDate: project.end_date,
      tasks: { done, total },
      percent
    }
  }

  const fetchProjects = async () => {
    if (!supabase) {
      console.error('Supabase client is not available')
      setError('Supabase is not configured. Please check your environment variables.')
      setLoading(false)
      return
    }

    console.log('Fetching projects with tab:', projectViewTab, 'filters:', filters)
    setLoading(true)
    setError(null)
    
    try {
      // First, let's check if we can query projects at all (diagnostic)
      const testQuery = await supabase
        .from('projects')
        .select('id, status', { count: 'exact' })
        .limit(1)
      
      console.log('Test query result:', testQuery.data?.length || 0, 'count:', testQuery.count, 'error:', testQuery.error)
      
      // Build query
      let query = supabase
        .from('projects')
        .select(`
          id,
          code,
          name,
          description,
          status,
          owner_id,
          company_id,
          start_date,
          end_date,
          created_at,
          updated_at
        `, { count: 'exact' })
      
      // Apply filters based on projectViewTab first
      // Tab filter takes precedence over status filter
      if (projectViewTab === "active") {
        // Show all non-archived projects (ACTIVE and ON_HOLD)
        query = query.neq('status', 'ARCHIVED')
      } else if (projectViewTab === "archived") {
        // Show only archived projects
        query = query.eq('status', 'ARCHIVED')
      } else if (projectViewTab === "public") {
        // For now, show all non-archived projects (public projects logic can be added later)
        // You might want to add a 'is_public' column to filter by
        query = query.neq('status', 'ARCHIVED')
      }
      // groups and templates are handled elsewhere
      
      // Apply additional status filter only if no tab filter is applied
      // (Tab filter takes precedence)
      if (!projectViewTab || projectViewTab === "public") {
        if (filters.status) {
          query = query.eq('status', filters.status)
        }
      }
      if (filters.ownerId) {
        query = query.eq('owner_id', filters.ownerId)
      }
      if (filters.companyId) {
        query = query.eq('company_id', filters.companyId)
      }
      if (filters.from) {
        query = query.gte('start_date', filters.from)
      }
      if (filters.to) {
        query = query.lte('end_date', filters.to)
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`)
      }
      
      // Pagination
      const fromIndex = (filters.page - 1) * filters.size
      const toIndex = fromIndex + filters.size - 1
      query = query.range(fromIndex, toIndex)
      
      // Order by
      query = query.order('created_at', { ascending: false })
      
      const { data: projects, error, count } = await query
      
      if (error) {
        console.error('Supabase query error:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        throw new Error(`Database error: ${error.message}. Check browser console for details.`)
      }
      
      console.log('Fetched projects:', projects?.length || 0, 'Total count:', count)
      console.log('Project statuses:', projects?.map((p: any) => ({ id: p.id, name: p.name, status: p.status })))
      
      // If we got a count but no projects, there might be a data issue
      if (count && count > 0 && (!projects || projects.length === 0)) {
        console.warn('Count indicates projects exist but query returned none. Possible RLS policy issue.')
      }
      
      // Get owner information for each project
      const ownerIds = [...new Set(projects?.map((p: any) => p.owner_id).filter(Boolean) || [])]
      let ownersMap = new Map()
      
      if (ownerIds.length > 0) {
        const { data: owners, error: ownersError } = await supabase
          .from('users')
          .select('id, name, email')
          .in('id', ownerIds)
        
        if (ownersError) {
          console.warn('Error fetching owners:', ownersError)
        }
        
        ownersMap = new Map(owners?.map((o: any) => [o.id, o]) || [])
      }
      
      // Format projects with metrics
      const formattedProjects = await Promise.all(
        (projects || []).map((project: any) => 
          formatProjectRow(project, ownersMap.get(project.owner_id))
        )
      )
      
      console.log('Formatted projects:', formattedProjects.length)
      
      // Check if there are localStorage projects that need syncing
      if (typeof window !== 'undefined') {
        try {
          const localProjects = window.localStorage.getItem('projects.meta')
          if (localProjects) {
            const parsed = JSON.parse(localProjects)
            if (Array.isArray(parsed)) {
              const localCount = parsed.filter((p: any) => !p.archived || projectViewTab === 'archived').length
              setLocalProjectsCount(localCount)
              if (localCount > (count || 0)) {
                console.log(`Found ${localCount} local projects but only ${count || 0} in database`)
              }
            }
          }
        } catch (e) {
          // Ignore localStorage errors
        }
      }
      
      setProjects(formattedProjects)
      setTotal(count || 0)
    } catch (err: any) {
      console.error('Error fetching projects:', err)
      setError(err.message || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
    checkAdminStatus()
  }, [filters, projectViewTab])

  const checkAdminStatus = async () => {
    if (!supabase) return
    
    try {
      // Check if current user is admin
      // In a real app, you'd get this from the auth session
      // For now, we'll check if there's an admin user in the database
      const { data: adminUsers } = await supabase
        .from('admin_users')
        .select('id, role, email')
        .in('role', ['admin', 'owner'])
        .limit(1)
      
      // Simple check: if admin_users table exists and has admins, require approval
      // In production, check the current user's role from auth session
      const userEmail = typeof window !== 'undefined' 
        ? window.localStorage.getItem('user.email') || ''
        : ''
      
      if (userEmail && adminUsers && adminUsers.length > 0) {
        const { data: user } = await supabase
          .from('admin_users')
          .select('role')
          .eq('email', userEmail)
          .in('role', ['admin', 'owner'])
          .single()
        
        setIsAdmin(!!user)
      } else {
        // If no admin_users table or no admins, allow deletion (for development)
        setIsAdmin(true)
      }
    } catch (err: any) {
      console.warn('Could not check admin status:', err)
      // If table doesn't exist (404), allow deletion for development
      if (err?.code === 'PGRST116' || err?.message?.includes('does not exist')) {
        setIsAdmin(true)
      } else {
        // Default to requiring approval if check fails
        setIsAdmin(false)
      }
    }
  }

  const handleCreateProject = () => {
    setShowCreateDialog(true)
  }

  const handleProjectCreated = () => {
    setShowCreateDialog(false)
    fetchProjects()
  }

  const handleDeleteProject = (id: string) => {
    const project = projects.find(p => p.id === id)
    if (project) {
      setDeletingProject(project)
      setShowDeleteDialog(true)
    }
  }

  const handleProjectDeleted = () => {
    setShowDeleteDialog(false)
    setDeletingProject(null)
    fetchProjects()
  }

  const handleArchiveProject = async (id: string) => {
    if (!supabase) {
      alert('Supabase is not configured')
      return
    }
    
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: 'ARCHIVED' })
        .eq('id', id)
      
      if (error) {
        throw new Error(error.message)
      }
      
      fetchProjects()
    } catch (err: any) {
      alert(err.message || 'Failed to archive project')
    }
  }

  const handleViewProject = (project: Project) => {
    if (onProjectClick) {
      onProjectClick(project.id)
    }
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setShowEditDialog(true)
  }

  const handleProjectUpdated = () => {
    setShowEditDialog(false)
    setEditingProject(null)
    fetchProjects()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your projects, track progress, and automate workflows
          </p>
        </div>
        <Button onClick={handleCreateProject}>
          <Plus className="mr-2 h-4 w-4" />
          Create Project
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Projects List</CardTitle>
              <CardDescription>
                {total} project{total !== 1 ? 's' : ''} total
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showFilters && (
            <ProjectsFilters
              filters={filters}
              onChange={(newFilters) => setFilters({ ...filters, ...newFilters, page: 1 })}
            />
          )}
          
          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md">
              <p className="font-semibold">Error loading projects:</p>
              <p>{error}</p>
              <p className="text-sm mt-2">Please check the browser console for more details.</p>
            </div>
          )}

          {localProjectsCount > total && total > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-100">
                    Local projects detected
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    You have {localProjectsCount} project(s) in local storage but only {total} in the database.
                    Sync them to see all projects here.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={syncLocalProjectsToDatabase}
                  disabled={syncing}
                >
                  {syncing ? 'Syncing...' : 'Sync Projects'}
                </Button>
              </div>
            </div>
          )}

          {total === 0 && localProjectsCount > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-100">
                    Projects found in local storage
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    You have {localProjectsCount} project(s) stored locally. Sync them to the database to view them here.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={syncLocalProjectsToDatabase}
                  disabled={syncing}
                >
                  {syncing ? 'Syncing...' : 'Sync Projects'}
                </Button>
              </div>
            </div>
          )}
          
          <ProjectsTable
            projects={projects}
            loading={loading}
            onDelete={handleDeleteProject}
            onArchive={handleArchiveProject}
            onProjectClick={onProjectClick ? (project) => onProjectClick(project.id) : undefined}
            onView={handleViewProject}
            onEdit={handleEditProject}
          />
          
          {total > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(filters.page - 1) * filters.size + 1} to{' '}
                {Math.min(filters.page * filters.size, total)} of {total} projects
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (filters.page > 1) {
                          setFilters({ ...filters, page: filters.page - 1 })
                        }
                      }}
                      className={filters.page === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.ceil(total / filters.size) }, (_, i) => i + 1)
                    .filter((page) => {
                      const current = filters.page
                      return page === 1 || page === Math.ceil(total / filters.size) || Math.abs(page - current) <= 1
                    })
                    .map((page, idx, arr) => (
                      <div key={page} className="flex items-center">
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <PaginationItem>
                            <span className="px-2">...</span>
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              setFilters({ ...filters, page })
                            }}
                            isActive={filters.page === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      </div>
                    ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        const maxPage = Math.ceil(total / filters.size)
                        if (filters.page < maxPage) {
                          setFilters({ ...filters, page: filters.page + 1 })
                        }
                      }}
                      className={filters.page >= Math.ceil(total / filters.size) ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateProjectDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreated={handleProjectCreated}
      />

      <EditProjectDialog
        open={showEditDialog}
        onClose={() => {
          setShowEditDialog(false)
          setEditingProject(null)
        }}
        onUpdated={handleProjectUpdated}
        project={editingProject}
      />

      <DeleteProjectDialog
        open={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setDeletingProject(null)
        }}
        onDeleted={handleProjectDeleted}
        project={deletingProject ? {
          id: deletingProject.id,
          name: deletingProject.name,
          code: deletingProject.code
        } : null}
        isAdmin={isAdmin}
      />
    </div>
  )
}
