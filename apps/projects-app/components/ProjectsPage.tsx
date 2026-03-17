'use client'

import { useState, useEffect, useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { useSearchParams } from 'next/navigation'
import {
  Plus, 
  MoreHorizontal, 
  ArrowRight,
  Flag,
  FolderKanban,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  UserPlus,
  Trash2,
  Sparkles,
  Layers,
  Search,
  Check,
  X,
  LayoutGrid,
  List,
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  Copy,
  Recycle,
  Truck,
  Factory,
  Leaf,
  BarChart3,
  Zap,
  Target,
  FileDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { WorkloadReport } from "@/components/workload/WorkloadReport"
import { CollaborationFeed } from "@/components/collaboration/CollaborationFeed"
import {
  addColumn,
  addTask,
  deleteColumn,
  deleteTask,
  ensureDefaultBoard,
  fetchBoard,
  initSupabaseProjects,
  listProjectIds,
  updateColumn,
  updateTask,
  getSupabaseConfig,
} from "@/lib/supabase-projects"
import { ProjectsListPage } from './projects/ProjectsListPage'
import CoverPage from './projects/CoverPage'

interface Task {
  id: string
  title: string
  description: string
  assignee: string
  dueDate: string
  priority: "low" | "medium" | "high"
  labels: string[]
  status?: "todo" | "inprogress" | "review" | "done"
  lastUpdatedBy?: string
  lastUpdatedAt?: string
}

interface Column {
  id: string
  title: string
  tasks: Task[]
  color: string
}

type ProjectMeta = {
  id: string
  name: string
  archived?: boolean
  createdAt: string
}

type ProjectTemplate = {
  id: string
  name: string
  description?: string
  columns: Column[]
  createdAt: string
  createdFrom?: string // ID of project this template was created from
}

type OrgPerson = {
  id: string
  name: string
  email?: string
  role?: string
}


// Mock data removed - data will be loaded from database/API
const getDefaultColumns = (): Column[] => [
  {
    id: "todo",
    title: "To Do",
    color: "bg-slate-100 dark:bg-slate-800",
    tasks: []
  },
  {
    id: "inprogress",
    title: "In Progress",
    color: "bg-blue-100 dark:bg-blue-900",
    tasks: []
  },
  {
    id: "review",
    title: "Review",
    color: "bg-amber-100 dark:bg-amber-900",
    tasks: []
  },
  {
    id: "done",
    title: "Done",
    color: "bg-green-100 dark:bg-green-900",
    tasks: []
  },
  {
    id: "testing",
    title: "Testing",
    color: "bg-purple-100 dark:bg-purple-900",
    tasks: []
  },
  {
    id: "deployment",
    title: "Deployment",
    color: "bg-orange-100 dark:bg-orange-900",
    tasks: []
  },
  {
    id: "monitoring",
    title: "Monitoring",
    color: "bg-indigo-100 dark:bg-indigo-900",
    tasks: []
  }
]

// Minimal templates - no mock data; load from project_templates table when available
const getDefaultTemplates = (): ProjectTemplate[] => [
  {
    id: "template-blank",
    name: "Blank Project",
    description: "Empty project template - add your own columns and tasks",
    columns: [
      {
        id: "todo",
        title: "To Do",
        color: "bg-slate-100 dark:bg-slate-800",
        tasks: []
      },
      {
        id: "inprogress",
        title: "In Progress",
        color: "bg-blue-100 dark:bg-blue-900",
        tasks: []
      },
      {
        id: "done",
        title: "Done",
        color: "bg-green-100 dark:bg-green-900",
        tasks: []
      },
    ],
    createdAt: new Date().toISOString()
  }
]

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high": return "bg-red-500"
    case "medium": return "bg-yellow-500"
    case "low": return "bg-green-500"
    default: return "bg-gray-500"
  }
}

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "high": return "bg-red-500/15 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400"
    case "medium": return "bg-yellow-500/15 text-yellow-600 border-yellow-500/20 dark:bg-yellow-500/20 dark:text-yellow-400"
    case "low": return "bg-green-500/15 text-green-600 border-green-500/20 dark:bg-green-500/20 dark:text-green-400"
    default: return "bg-gray-500/15 text-gray-600 border-gray-500/20"
  }
}

// Get template icon based on template ID
const getTemplateIcon = (templateId: string) => {
  if (templateId.includes("blank")) return FolderKanban
  return FolderKanban
}

// Get template color based on template ID
const getTemplateColor = (templateId: string) => {
  return "from-gray-500/20 to-gray-600/10 border-gray-500/30"
}

interface ProjectsPageProps {
  /** When true, only render the Kanban board section (project header + columns) */
  compactMode?: boolean
  /** When provided, set as active project on mount (used with compactMode for embedding) */
  initialProjectId?: string
  /** When true, hide header and tabs but show all board sections (task cards, stats, etc.) */
  embedMode?: boolean
}

function ProjectsPage({ compactMode = false, initialProjectId, embedMode = false }: ProjectsPageProps = {}) {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  
  const supabaseConfig = getSupabaseConfig()
  const [supabaseDisabledReason, setSupabaseDisabledReason] = useState<string | null>(null)
  const supabaseEnabled = !!supabaseConfig && !supabaseDisabledReason
  
  // Get current user name (you can replace this with actual user context)
  const currentUserName = typeof window !== 'undefined' 
    ? (localStorage.getItem('user.name') || 'You') 
    : 'You'

  const [projectMeta, setProjectMeta] = useLocalStorage<ProjectMeta[]>("projects.meta", [
    { id: "default", name: "Default Project", createdAt: new Date().toISOString() },
  ])
  const [activeProjectId, setActiveProjectId] = useLocalStorage<string>("projects.activeProjectId", "default")
  const [localBoards, setLocalBoards] = useLocalStorage<Record<string, Column[]>>("projects.localBoards", {})

  // When embedding with initialProjectId, sync active project on mount
  useEffect(() => {
    if ((compactMode || embedMode) && initialProjectId) {
      setActiveProjectId(initialProjectId)
    }
    if (embedMode) {
      setViewMode("board")
    }
  }, [compactMode, embedMode, initialProjectId]) // eslint-disable-line react-hooks/exhaustive-deps
  const [orgPeople, setOrgPeople] = useLocalStorage<OrgPerson[]>("org.people", [])
  const [projectTemplates, setProjectTemplates] = useLocalStorage<ProjectTemplate[]>("projects.templates", [])
  
  const activeProject =
    projectMeta.find((p) => p.id === activeProjectId) ??
    { id: activeProjectId, name: activeProjectId, createdAt: new Date().toISOString() }
  
  const componentRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Workflow Board - ${activeProject.name}`,
    pageStyle: `@page { size: A4 portrait; margin: 10mm; }`, // Example A4 portrait with 10mm margins
    documentBuilder: (pageContent) => {
      return (
        <>
          <CoverPage 
            ourCompanyName="Sebenza One" 
            clientCompanyName={activeProject.name} 
            // Add logo URLs here if available
            // ourCompanyLogo="/path/to/our-logo.png"
            // clientCompanyLogo="/path/to/client-logo.png"
          />
          {pageContent}
        </>
      )
    }
  })

  const [peopleDialogOpen, setPeopleDialogOpen] = useState(false)
  const [personDraft, setPersonDraft] = useState<{ name: string; email: string; role: string }>({
    name: "",
    email: "",
    role: "",
  })

  const [columns, setColumns] = useState<Column[]>(getDefaultColumns())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<"all" | "low" | "medium" | "high">("all")
  const [assigneeFilter, setAssigneeFilter] = useState("")
  const [labelFilter, setLabelFilter] = useState("")

  const [createProjectOpen, setCreateProjectOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [createTemplateOpen, setCreateTemplateOpen] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [templateDescription, setTemplateDescription] = useState("")
  const [createFromTemplateOpen, setCreateFromTemplateOpen] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)

  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"board" | "list" | "projects" | "workload" | "collaboration">(
    tabParam === 'collaboration' ? 'collaboration' : 
    tabParam === 'workload' ? 'workload' :
    tabParam === 'board' ? 'board' :
    tabParam === 'list' ? 'list' :
    tabParam === 'projects' ? 'projects' :
    'projects' // Default to projects list when visiting /projects
  )
  
  // Update view mode when tab parameter changes
  useEffect(() => {
    if (tabParam === 'collaboration') {
      setViewMode('collaboration')
    } else if (tabParam === 'workload') {
      setViewMode('workload')
    } else if (tabParam === 'board') {
      setViewMode('board')
    } else if (tabParam === 'list') {
      setViewMode('list')
    } else if (tabParam === 'projects') {
      setViewMode('projects')
    } else if (!tabParam) {
      // Default to projects list when no tab parameter (visiting /projects directly)
      setViewMode('projects')
    }
  }, [tabParam])
  const [projectViewTab, setProjectViewTab] = useState<"active" | "templates" | "groups" | "public" | "archived">("active")
  const [taskDialogMode, setTaskDialogMode] = useState<"create" | "edit">("create")
  const [taskDialogColumnId, setTaskDialogColumnId] = useState<string | null>(null)
  const [taskDialogOriginalColumnId, setTaskDialogOriginalColumnId] = useState<string | null>(null)
  const [taskDialogTaskId, setTaskDialogTaskId] = useState<string | null>(null)
  const [taskDraft, setTaskDraft] = useState<{
    title: string
    description: string
    assignee: string
    dueDate: string
    startDate: string
    estimateHours: string
    priority: "low" | "medium" | "high"
    labels: string
  }>({
    title: "",
    description: "",
    assignee: "",
    dueDate: "",
    startDate: "",
    estimateHours: "",
    priority: "medium",
    labels: "",
  })

  const deduplicateColumns = (cols: Column[]): Column[] => {
    const seenIds = new Set<string>()
    return cols.filter((col) => {
      if (seenIds.has(col.id)) return false
      seenIds.add(col.id)
      return true
    })
  }

  const deriveStatusForColumn = (column: Pick<Column, "id" | "title">): Task["status"] => {
    const id = (column.id || "").toLowerCase()
    const title = (column.title || "").toLowerCase()
    if (id.includes("inprogress") || title.includes("in progress")) return "inprogress"
    if (id.includes("review") || title.includes("review")) return "review"
    if (id.includes("done") || title.includes("done")) return "done"
    return "todo"
  }

  const getColumnTheme = (column: Pick<Column, "id" | "title">, columnIndex: number = 0) => {
    const key = `${column.id} ${column.title}`.toLowerCase()

    const theme = (bar: string, from: string) => ({
      bar,
      gradientFrom: from,
    })

    // Status-based columns
    if (key.includes("inprogress") || key.includes("in progress") || key.includes("working") || key.includes("active")) return theme("bg-blue-500", "from-blue-500/10 dark:from-blue-500/15")
    if (key.includes("review") || key.includes("qa") || key.includes("quality")) return theme("bg-amber-500", "from-amber-500/10 dark:from-amber-500/15")
    if (key.includes("done") || key.includes("complete") || key.includes("finished") || key.includes("closed")) return theme("bg-emerald-500", "from-emerald-500/10 dark:from-emerald-500/15")
    if (key.includes("test") || key.includes("testing")) return theme("bg-purple-500", "from-purple-500/10 dark:from-purple-500/15")
    if (key.includes("deploy") || key.includes("deployment") || key.includes("release")) return theme("bg-orange-500", "from-orange-500/10 dark:from-orange-500/15")
    if (key.includes("monitor") || key.includes("monitoring") || key.includes("watch")) return theme("bg-indigo-500", "from-indigo-500/10 dark:from-indigo-500/15")
    if (key.includes("todo") || key.includes("to do") || key.includes("backlog") || key.includes("pending")) return theme("bg-slate-500", "from-slate-500/10 dark:from-slate-500/15")
    
    // Action-based columns
    if (key.includes("blocked") || key.includes("waiting") || key.includes("on hold")) return theme("bg-red-500", "from-red-500/10 dark:from-red-500/15")
    if (key.includes("ready") || key.includes("prepared")) return theme("bg-teal-500", "from-teal-500/10 dark:from-teal-500/15")
    if (key.includes("cancel") || key.includes("cancelled")) return theme("bg-gray-500", "from-gray-500/10 dark:from-gray-500/15")

    // Default: use a rotating color based on column index to give variety
    // This ensures new columns get different colors even if they don't match keywords
    const defaultThemes = [
      theme("bg-cyan-500", "from-cyan-500/10 dark:from-cyan-500/15"),
      theme("bg-pink-500", "from-pink-500/10 dark:from-pink-500/15"),
      theme("bg-violet-500", "from-violet-500/10 dark:from-violet-500/15"),
      theme("bg-rose-500", "from-rose-500/10 dark:from-rose-500/15"),
      theme("bg-lime-500", "from-lime-500/10 dark:from-lime-500/15"),
    ]
    return defaultThemes[columnIndex % defaultThemes.length] || theme("bg-zinc-500", "from-zinc-500/10 dark:from-zinc-500/15")
  }

  const handleAddPerson = () => {
    const name = personDraft.name.trim()
    if (!name) return

    const baseId = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")

    const existing = new Set(orgPeople.map((p) => p.id))
    const safeBase = baseId || `person-${Date.now()}`
    let id = safeBase
    let i = 2
    while (existing.has(id)) {
      id = `${safeBase}-${i}`
      i += 1
    }

    const next: OrgPerson = {
      id,
      name,
      email: personDraft.email.trim() || undefined,
      role: personDraft.role.trim() || undefined,
    }

    setOrgPeople((prev) => [next, ...prev])
    setPersonDraft({ name: "", email: "", role: "" })
  }

  const handleRemovePerson = (id: string) => {
    setOrgPeople((prev) => prev.filter((p) => p.id !== id))
  }

  // Initialize default templates if none exist
  useEffect(() => {
    if (projectTemplates.length === 0) {
      const defaultTemplates = getDefaultTemplates()
      setProjectTemplates(defaultTemplates)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setError(null)
        setLoading(true)

        if (supabaseEnabled && supabaseConfig) {
          try {
            initSupabaseProjects(supabaseConfig.url, supabaseConfig.key)
            // fetchBoard already calls ensureDefaultBoard internally, so we don't need to call it twice
            const [{ columns: cols, tasks }] = await Promise.all([
              fetchBoard(activeProjectId),
            ])

            // Fetch projects from the projects table to get names
            let dbProjects: any[] = []
            try {
              const { createClient } = await import('@supabase/supabase-js')
              const client = createClient(supabaseConfig.url, supabaseConfig.key)
              const { data: projects } = await client
                .from('projects')
                .select('id, name, created_at')
              dbProjects = projects || []
            } catch (err) {
              // projects table might not exist, that's okay
              console.warn('Could not fetch projects from database:', err)
            }

            if (!mounted) return

            // Update projectMeta with projects from database (with proper names)
            if (dbProjects && dbProjects.length > 0) {
              setProjectMeta((prev) => {
                const existing = new Map(prev.map((p) => [p.id, p]))
                const next = [...prev]
                
                // Update existing projects with names from database
                dbProjects.forEach((dbProject: any) => {
                  const existingProject = existing.get(dbProject.id)
                  if (existingProject) {
                    // Update name if it's different (e.g., was a UUID)
                    const index = next.findIndex(p => p.id === dbProject.id)
                    if (index >= 0 && (next[index].name === dbProject.id || !next[index].name)) {
                      next[index] = {
                        ...next[index],
                        name: dbProject.name || dbProject.id,
                        createdAt: dbProject.created_at || next[index].createdAt
                      }
                    }
                  } else {
                    // Add new project from database
                    next.push({
                      id: dbProject.id,
                      name: dbProject.name || dbProject.id,
                      createdAt: dbProject.created_at || new Date().toISOString()
                    })
                  }
                })
                
                // Always ensure default exists
                if (!next.some((p) => p.id === "default")) {
                  next.unshift({ id: "default", name: "Default Project", createdAt: new Date().toISOString() })
                }
                
                return next
              })
            } else {
              // Fallback to old method if projects table doesn't exist
              const ids = await listProjectIds().catch(() => [] as string[])
              if (ids.length) {
                setProjectMeta((prev) => {
                  const existing = new Map(prev.map((p) => [p.id, p]))
                  const next = [...prev]
                  ids.forEach((id) => {
                    if (!existing.has(id)) next.push({ id, name: id, createdAt: new Date().toISOString() })
                  })
                  // Always ensure default exists
                  if (!next.some((p) => p.id === "default")) {
                    next.unshift({ id: "default", name: "Default Project", createdAt: new Date().toISOString() })
                  }
                  return next
                })
              }
            }

            // Deduplicate columns by ID (in case of race conditions)
            const uniqueCols = deduplicateColumns((cols || []).map((c) => ({ id: c.id, title: c.title, color: c.color, tasks: [] })))

          const mapped: Column[] = uniqueCols.map((c) => {
            const dbCol = (cols || []).find((dc) => dc.id === c.id)
            return {
              id: dbCol?.id || c.id,
              title: dbCol?.title || c.title,
              color: dbCol?.color || c.color,
              tasks: (tasks || [])
                .filter((t) => t.column_id === (dbCol?.id || c.id))
                .map((t) => ({
                  id: t.id,
                  title: t.title,
                  description: t.description || "",
                  assignee: t.assignee || "Unassigned",
                  dueDate: t.due_date || "",
                  priority: (t.priority as any) || "medium",
                  labels: (t.labels || []) as string[],
                  status: (t.status as any) || undefined,
                })),
            }
          })

          setColumns(mapped.length ? mapped : getDefaultColumns())
          return
          } catch (networkErr: any) {
            // Network/DNS error detected - disable Supabase and fall back to local
            if (!mounted) return
            if (networkErr?.message === 'NETWORK_ERROR' || String(networkErr?.message || '').includes('ERR_NAME_NOT_RESOLVED') || String(networkErr?.message || '').includes('Failed to fetch')) {
              setSupabaseDisabledReason('Network unreachable (DNS/offline)')
              const local = localBoards[activeProjectId]
              if (local && local.length > 0) {
                setColumns(deduplicateColumns(local))
              } else {
                setColumns(getDefaultColumns())
              }
              return
            }
            throw networkErr
          }
        }

        const local = localBoards[activeProjectId]
        if (local && local.length > 0) {
          setColumns(deduplicateColumns(local))
        } else {
          setColumns(getDefaultColumns())
        }
      } catch (e: any) {
        if (!mounted) return
        const msg = e?.message || "Failed to load projects"
        setError(msg)

        // If Supabase is configured but unreachable (DNS/offline), stop retrying and fall back to local mode.
        if (supabaseConfig && (msg.includes('NETWORK_ERROR') || msg.includes('ERR_NAME_NOT_RESOLVED') || msg.includes('Failed to fetch'))) {
          setSupabaseDisabledReason('Network unreachable (DNS/offline)')
          const local = localBoards[activeProjectId]
          if (local && local.length > 0) {
            setColumns(deduplicateColumns(local))
          } else {
            setColumns(getDefaultColumns())
          }
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProjectId, supabaseConfig?.url, supabaseConfig?.key, supabaseEnabled])

  useEffect(() => {
    if (supabaseEnabled || loading) return
    // Debounce local storage saves to prevent excessive writes
    const timeoutId = setTimeout(() => {
      setLocalBoards((prev) => ({ ...prev, [activeProjectId]: columns }))
    }, 500)
    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProjectId, columns, supabaseEnabled, loading])

  const openCreateTask = (columnId: string) => {
    setTaskDialogMode("create")
    setTaskDialogColumnId(columnId)
    setTaskDialogOriginalColumnId(columnId)
    setTaskDialogTaskId(null)
    setTaskDraft({
      title: "",
      description: "",
      assignee: "",
      dueDate: "",
      startDate: "",
      estimateHours: "",
      priority: "medium",
      labels: "",
    })
    setTaskDialogOpen(true)
  }

  const openEditTask = (taskId: string, columnId: string) => {
    const column = columns.find((c) => c.id === columnId)
    const task = column?.tasks.find((t) => t.id === taskId)
    if (!task) return

    setTaskDialogMode("edit")
    setTaskDialogColumnId(columnId)
    setTaskDialogOriginalColumnId(columnId)
    setTaskDialogTaskId(taskId)
    setTaskDraft({
      title: task.title,
      description: task.description || "",
      assignee: task.assignee === "Unassigned" ? "" : task.assignee,
      dueDate: task.dueDate || "",
      startDate: (task as any).startDate || "",
      estimateHours: (task as any).estimateHours?.toString() || "",
      priority: task.priority,
      labels: (task.labels || []).join(", "),
    })
    setTaskDialogOpen(true)
  }

  const createProjectIdFromName = (name: string) => {
    const base = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")

    const safeBase = base || `project-${Date.now()}`
    const existing = new Set(projectMeta.map((p) => p.id))
    if (!existing.has(safeBase)) return safeBase

    let i = 2
    while (existing.has(`${safeBase}-${i}`)) i += 1
    return `${safeBase}-${i}`
  }

  const handleCreateProject = async (templateId?: string) => {
    const name = newProjectName.trim()
    if (!name) return

    const id = createProjectIdFromName(name)
    const meta: ProjectMeta = { id, name, createdAt: new Date().toISOString() }

    setProjectMeta((prev) => (prev.some((p) => p.id === id) ? prev : [meta, ...prev]))
    setActiveProjectId(id)
    setCreateProjectOpen(false)
    setCreateFromTemplateOpen(false)
    setNewProjectName("")
    setSelectedTemplateId(null)

    // If creating from template, use template columns, otherwise use default
    let initialColumns = getDefaultColumns()
    if (templateId) {
      const template = projectTemplates.find(t => t.id === templateId)
      if (template) {
        // Deep clone the template columns and reset task IDs
        initialColumns = template.columns.map(col => ({
          ...col,
          tasks: col.tasks.map(task => ({
            ...task,
            id: `${task.id}-${Date.now()}-${Math.random()}`,
            assignee: "Unassigned",
            dueDate: "",
            lastUpdatedBy: undefined,
            lastUpdatedAt: undefined
          }))
        }))
      }
    }

    if (supabaseEnabled && supabaseConfig) {
      try {
        initSupabaseProjects(supabaseConfig.url, supabaseConfig.key)
        await ensureDefaultBoard(id)
        // Update with template columns if using template
        if (templateId && initialColumns.length > 0) {
          setLocalBoards((prev) => ({ ...prev, [id]: initialColumns }))
        }
      } catch (e: any) {
        setError(e?.message || "Failed to create project in Supabase")
      }
    } else {
      setLocalBoards((prev) => ({ ...prev, [id]: initialColumns }))
    }
  }

  const handleCreateTemplate = () => {
    const name = templateName.trim()
    if (!name) return

    const currentColumns = localBoards[activeProjectId] || columns
    if (currentColumns.length === 0) {
      alert("Cannot create template: No columns/tasks to save")
      return
    }

    // Create template from current project structure
    const template: ProjectTemplate = {
      id: `template-${Date.now()}`,
      name,
      description: templateDescription.trim() || undefined,
      columns: currentColumns.map(col => ({
        ...col,
        tasks: col.tasks.map(task => ({
          ...task,
          assignee: "Unassigned", // Remove specific assignees
          dueDate: "", // Remove specific dates
          lastUpdatedBy: undefined,
          lastUpdatedAt: undefined
        }))
      })),
      createdAt: new Date().toISOString(),
      createdFrom: activeProjectId
    }

    setProjectTemplates((prev) => [template, ...prev])
    setCreateTemplateOpen(false)
    setTemplateName("")
    setTemplateDescription("")
  }

  const handleDeleteTemplate = (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return
    setProjectTemplates((prev) => prev.filter(t => t.id !== templateId))
  }

  const handleAddTask = async (columnId: string, draft: typeof taskDraft) => {
    if (!draft.title.trim()) return

    if (!supabaseEnabled || !supabaseConfig) {
      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId
            ? {
                ...col,
                tasks: col.tasks.concat({
                  id: Date.now().toString(),
                  title: draft.title.trim(),
                  description: draft.description || "",
                  assignee: draft.assignee.trim() || "Unassigned",
                  dueDate: draft.dueDate || "",
                  priority: draft.priority,
                  labels: draft.labels
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                  status: deriveStatusForColumn(col),
                }),
              }
            : col
        )
      )
      return
    }

    initSupabaseProjects(supabaseConfig.url, supabaseConfig.key)
    const orderIndex = columns.find((c) => c.id === columnId)?.tasks.length || 0
    const status = deriveStatusForColumn({ id: columnId, title: columns.find((c) => c.id === columnId)?.title || "" }) || "todo"

    const created = await addTask({
      project_id: activeProjectId,
      column_id: columnId,
      title: draft.title.trim(),
      description: draft.description || "",
      assignee: draft.assignee.trim() || "Unassigned",
      due_date: draft.dueDate ? draft.dueDate : null,
      start_date: draft.startDate ? draft.startDate : null,
      estimate_hours: draft.estimateHours ? parseFloat(draft.estimateHours) : null,
      priority: draft.priority,
      labels: draft.labels
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      status: status as any,
      order_index: orderIndex,
    } as any)

    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? {
              ...col,
              tasks: col.tasks.concat({
                id: created.id,
                title: created.title,
                description: created.description || "",
                assignee: created.assignee || "Unassigned",
                dueDate: created.due_date || "",
                priority: (created.priority as any) || "medium",
                labels: created.labels || [],
                status: created.status,
              }),
            }
          : col
      )
    )
  }

  const handleSubmitTaskDialog = async () => {
    const columnId = taskDialogColumnId
    if (!columnId) return

    if (taskDialogMode === "create") {
      await handleAddTask(columnId, taskDraft)
      setTaskDialogOpen(false)
      return
    }

    const taskId = taskDialogTaskId
    if (!taskId) return

    const originalColumnId = taskDialogOriginalColumnId || columnId
    if (originalColumnId !== columnId) {
      await handleMoveTask(taskId, originalColumnId, columnId)
    }

    const targetColumn = columns.find((c) => c.id === columnId) || { id: columnId, title: "" }
    const labels = taskDraft.labels
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    await handleEditTask(taskId, columnId, {
      title: taskDraft.title.trim(),
      description: taskDraft.description || "",
      assignee: taskDraft.assignee.trim() || "Unassigned",
      dueDate: taskDraft.dueDate || "",
      priority: taskDraft.priority,
      labels,
      status: deriveStatusForColumn(targetColumn),
    } as any)

    setTaskDialogOpen(false)
  }

  const handleMoveTask = async (taskId: string, fromColumnId: string, toColumnId: string) => {
    if (fromColumnId === toColumnId) return

    let movedTask: Task | null = null
    let toOrderIndex = 0
    let toStatus: Task["status"] = "todo"

    setColumns((prev) => {
      const next = prev.map((col) => {
        if (col.id === fromColumnId) {
          const found = col.tasks.find((t) => t.id === taskId) || null
          if (found) movedTask = found
          return { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) }
        }
        return col
      })

      const toCol = next.find((c) => c.id === toColumnId)
      if (!toCol || !movedTask) return next

      toOrderIndex = toCol.tasks.length
      toStatus = deriveStatusForColumn(toCol) || "todo"

      return next.map((col) =>
        col.id === toColumnId
          ? { ...col, tasks: col.tasks.concat({ ...movedTask!, status: toStatus }) }
          : col
      )
    })

    if (!movedTask) return

    if (supabaseEnabled && supabaseConfig) {
      try {
        initSupabaseProjects(supabaseConfig.url, supabaseConfig.key)
        await updateTask(taskId, { column_id: toColumnId, order_index: toOrderIndex, status: (toStatus || "todo") as any })
      } catch {
        // best-effort; UI already updated
      }
    }
  }

  const handleAddColumn = async () => {
    const title = prompt("Enter column title:", "New Column")
    if (!title || !title.trim()) return

    const fallbackColor = "bg-gray-100 dark:bg-gray-800"

    if (!supabaseEnabled || !supabaseConfig) {
      const newColumnId = `column-${Date.now()}`
      const newColumn: Column = {
        id: newColumnId,
        title: title.trim(),
        color: fallbackColor,
        tasks: [],
      }
      setColumns((prev) => [...prev, newColumn])
      return
    }

    initSupabaseProjects(supabaseConfig.url, supabaseConfig.key)
    const created = await addColumn({
      project_id: activeProjectId,
      title: title.trim(),
      color: "bg-slate-100",
      order_index: columns.length,
    } as any)

    setColumns((prev) => [...prev, { id: created.id, title: created.title, color: created.color, tasks: [] }])
  }

  const handleDeleteTask = async (taskId: string, columnId: string) => {
    setColumns((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) } : col))
    )

    if (supabaseEnabled && supabaseConfig) {
      try {
        initSupabaseProjects(supabaseConfig.url, supabaseConfig.key)
        await deleteTask(taskId)
      } catch {
        // best-effort
      }
    }
  }

  const handleEditTask = async (taskId: string, columnId: string, updates: Partial<Task>) => {
    const updateWithMetadata = {
      ...updates,
      lastUpdatedBy: currentUserName,
      lastUpdatedAt: new Date().toISOString(),
    }
    
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, tasks: col.tasks.map((t) => (t.id === taskId ? { ...t, ...updateWithMetadata } : t)) } : col
      )
    )

    if (supabaseEnabled && supabaseConfig) {
      try {
        initSupabaseProjects(supabaseConfig.url, supabaseConfig.key)
        await updateTask(taskId, {
          title: updates.title,
          description: updates.description,
          assignee: updates.assignee,
          due_date: updates.dueDate ? updates.dueDate : null,
          start_date: (updates as any).startDate ? (updates as any).startDate : null,
          estimate_hours: (updates as any).estimateHours !== undefined ? (updates as any).estimateHours : null,
          priority: updates.priority,
          labels: updates.labels,
          status: updates.status as any,
        } as any)
      } catch {
        // best-effort
      }
    }
  }

  const handleDeleteColumn = async (columnId: string) => {
    if (columns.length <= 1) return // Don't delete the last column
    setColumns((prev) => prev.filter((col) => col.id !== columnId))

    if (supabaseEnabled && supabaseConfig) {
      try {
        initSupabaseProjects(supabaseConfig.url, supabaseConfig.key)
        await deleteColumn(columnId)
      } catch {
        // best-effort
      }
    }
  }

  const handleEditColumn = async (columnId: string, title: string, color: string) => {
    setColumns((prev) => prev.map((col) => (col.id === columnId ? { ...col, title, color } : col)))

    if (supabaseEnabled && supabaseConfig) {
      try {
        initSupabaseProjects(supabaseConfig.url, supabaseConfig.key)
        await updateColumn(columnId, { title, color } as any)
      } catch {
        // best-effort
      }
    }
  }

  const totalTasks = columns.reduce((acc, col) => acc + col.tasks.length, 0)
  const inProgressTasks = columns
    .filter((c) => deriveStatusForColumn(c) === "inprogress")
    .reduce((acc, c) => acc + c.tasks.length, 0)
  const completedTasks = columns
    .filter((c) => deriveStatusForColumn(c) === "done")
    .reduce((acc, c) => acc + c.tasks.length, 0)
  
  // Calculate task statistics for Zoho-style view
  const allTasks = columns.flatMap((col) => col.tasks.map((task) => ({ ...task, columnId: col.id, columnTitle: col.title })))
  const openTasks = allTasks.filter((t) => {
    const col = columns.find((c) => c.id === t.columnId)
    return col && deriveStatusForColumn(col) !== "done"
  })
  const closedTasks = allTasks.filter((t) => {
    const col = columns.find((c) => c.id === t.columnId)
    return col && deriveStatusForColumn(col) === "done"
  })
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tasksDueToday = allTasks.filter((task) => {
    if (!task.dueDate) return false
    const dueDate = new Date(task.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate.getTime() === today.getTime()
  })
  
  const overdueTasks = allTasks.filter((task) => {
    if (!task.dueDate) return false
    const dueDate = new Date(task.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate.getTime() < today.getTime() && deriveStatusForColumn(columns.find((c) => c.id === task.columnId) || columns[0]) !== "done"
  })
  
  const myTasks = allTasks.filter((task) => {
    const userName = currentUserName.toLowerCase()
    return task.assignee.toLowerCase().includes(userName) || userName === "you"
  }).sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })
  
  const getDaysLate = (dueDate: string): number => {
    const due = new Date(dueDate)
    due.setHours(0, 0, 0, 0)
    const diff = today.getTime() - due.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }
  
  // Calculate progress based on column stages: each stage = 25% progress
  // To Do = 0%, In Progress = 25%, Review = 50%, Done = 100%
  // Each column represents a 25% increment, with the last column always being 100%
  const calculateStageProgress = (columnIndex: number, totalColumns: number): number => {
    if (totalColumns <= 1) return 0
    if (columnIndex === totalColumns - 1) return 100 // Last column (Done) = 100%
    // Each stage = 25% increment: 0%, 25%, 50%, 75%...
    return Math.min(columnIndex * 25, 100)
  }
  
  const completionPct = totalTasks > 0 
    ? Math.round(
        columns.reduce((totalProgress, col, colIndex) => {
          const stageProgress = calculateStageProgress(colIndex, columns.length)
          const taskProgress = col.tasks.length * stageProgress
          return totalProgress + taskProgress
        }, 0) / totalTasks
      )
    : 0
  const activeProjectsCount = projectMeta.filter((p) => !p.archived).length
  const totalColumns = columns.length

  const TaskCard = ({ task, columnId }: { task: Task; columnId: string }) => {
    const [editingField, setEditingField] = useState<'title' | 'description' | 'assignee' | 'dueDate' | 'priority' | null>(null)
    const [editValue, setEditValue] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    
    // Ensure orgPeople is available (closure from parent)
    const peopleList = orgPeople || []

    const handleDragStart = (e: React.DragEvent) => {
      e.dataTransfer.setData('text/plain', JSON.stringify({ taskId: task.id, fromColumnId: columnId }))
    }

    const currentIdx = columns.findIndex((c) => c.id === columnId)
    const nextColumn = currentIdx >= 0 ? columns[currentIdx + 1] : undefined

    const startEdit = (field: 'title' | 'description' | 'assignee' | 'dueDate' | 'priority', currentValue: string) => {
      setEditingField(field)
      setEditValue(currentValue)
    }

    const saveEdit = async () => {
      if (!editingField) return
      setIsSaving(true)
      try {
        const updates: Partial<Task> = {}
        if (editingField === 'title') updates.title = editValue.trim()
        else if (editingField === 'description') updates.description = editValue.trim()
        else if (editingField === 'assignee') updates.assignee = editValue.trim() || 'Unassigned'
        else if (editingField === 'dueDate') updates.dueDate = editValue
        else if (editingField === 'priority') updates.priority = editValue as any

        await handleEditTask(task.id, columnId, updates)
        setEditingField(null)
        setEditValue('')
      } finally {
        setIsSaving(false)
      }
    }

    const cancelEdit = () => {
      setEditingField(null)
      setEditValue('')
    }

    return (
      <div 
        className="group overflow-hidden rounded-xl border border-border/70 bg-gradient-to-br from-card to-card/80 shadow-card hover:shadow-lg transition-all cursor-move dark:border-white/10 dark:bg-sidebar-accent dark:from-sidebar-accent dark:to-sidebar-accent/80 relative mb-3"
        draggable
        onDragStart={handleDragStart}
      >
        {/* Subtle top accent */}
        <div className={`absolute top-0 left-0 right-0 h-0.5 ${getPriorityColor(task.priority)} opacity-60`} />
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            {editingField === 'title' ? (
              <div className="flex-1 flex items-center gap-1 pr-2">
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit()
                    if (e.key === 'Escape') cancelEdit()
                  }}
                  className="h-7 text-sm font-semibold"
                  autoFocus
                />
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={saveEdit} disabled={isSaving}>
                  <Check className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={cancelEdit}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <h4 
                className="font-semibold text-sm text-foreground cursor-pointer hover:text-primary transition-colors flex-1 pr-2"
                onClick={() => startEdit('title', task.title)}
                title="Click to edit"
              >
                {task.title}
              </h4>
            )}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={!nextColumn}
                onClick={() => {
                  if (nextColumn) handleMoveTask(task.id, columnId, nextColumn.id)
                }}
                title={nextColumn ? `Move to ${nextColumn.title}` : "Already in last column"}
              >
                <ArrowRight className="h-3 w-3" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="dropdown-3d">
                  <DropdownMenuItem onClick={() => openEditTask(task.id, columnId)}>
                    Edit Task
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={!nextColumn}
                    onClick={() => {
                      if (nextColumn) handleMoveTask(task.id, columnId, nextColumn.id)
                    }}
                  >
                    Move to next
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => handleDeleteTask(task.id, columnId)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {editingField === 'description' ? (
            <div className="mb-3 flex items-start gap-1">
              <Textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="text-xs min-h-[60px] flex-1"
                autoFocus
              />
              <div className="flex flex-col gap-1">
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={saveEdit} disabled={isSaving}>
                  <Check className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={cancelEdit}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            <p 
              className="text-xs text-muted-foreground mb-3 line-clamp-2 cursor-pointer hover:text-foreground transition-colors"
              onClick={() => startEdit('description', task.description)}
              title="Click to edit"
            >
              {task.description || 'No description (click to add)'}
            </p>
          )}
          
          <div className="flex flex-wrap gap-1.5 mb-3">
            {task.labels.map((label: string) => (
              <Badge key={label} variant="outline" className="text-xs border-border/50 bg-muted/30">
                {label}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-2 flex-1">
              <Avatar className="h-6 w-6 border border-border/50">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {task.assignee.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {editingField === 'assignee' ? (
                <div className="flex items-center gap-1 flex-1">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit()
                      if (e.key === 'Escape') cancelEdit()
                    }}
                    className="h-6 text-xs flex-1"
                    placeholder="Assignee name"
                    list="people-list"
                    autoFocus
                  />
                  <datalist id="people-list">
                    {peopleList.map((p) => (
                      <option key={p.id} value={p.name} />
                    ))}
                  </datalist>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={saveEdit} disabled={isSaving}>
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={cancelEdit}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <span 
                  className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => startEdit('assignee', task.assignee === 'Unassigned' ? '' : task.assignee)}
                  title="Click to edit"
                >
                  {task.assignee}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {editingField === 'dueDate' ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="date"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit()
                      if (e.key === 'Escape') cancelEdit()
                    }}
                    className="h-6 text-xs w-32"
                    autoFocus
                  />
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={saveEdit} disabled={isSaving}>
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={cancelEdit}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div 
                  className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => startEdit('dueDate', task.dueDate || '')}
                  title="Click to edit"
                >
                  <Clock className="h-3 w-3" />
                  {task.dueDate || 'No due date'}
                </div>
              )}
              {editingField === 'priority' ? (
                <div className="flex items-center gap-1">
                  <Select value={editValue} onValueChange={setEditValue}>
                    <SelectTrigger className="h-6 text-xs w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={saveEdit} disabled={isSaving}>
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={cancelEdit}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Badge 
                  className={`text-xs px-2 py-0.5 border ${getPriorityBadge(task.priority)} cursor-pointer hover:opacity-80 transition-opacity`}
                  onClick={() => startEdit('priority', task.priority)}
                  title="Click to edit"
                >
                  {task.priority}
                </Badge>
              )}
            </div>
          </div>
          
          {task.lastUpdatedBy && (
            <div className="mt-2 pt-2 border-t border-border/30">
              <p className="text-[10px] text-muted-foreground">
                Last updated by {task.lastUpdatedBy}
                {task.lastUpdatedAt && ` • ${new Date(task.lastUpdatedAt).toLocaleString()}`}
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const normalizedAssignee = assigneeFilter.trim().toLowerCase()
  const normalizedLabel = labelFilter.trim().toLowerCase()
  const isFiltering = !!(normalizedQuery || normalizedAssignee || normalizedLabel || priorityFilter !== "all")

  const matchesFilters = (task: Task) => {
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false
    if (normalizedAssignee && !(task.assignee || "").toLowerCase().includes(normalizedAssignee)) return false
    if (normalizedLabel) {
      const labels = (task.labels || []).map((l) => l.toLowerCase())
      if (!labels.some((l) => l.includes(normalizedLabel))) return false
    }
    if (normalizedQuery) {
      const haystack = `${task.title} ${task.description} ${(task.labels || []).join(" ")} ${task.assignee}`.toLowerCase()
      if (!haystack.includes(normalizedQuery)) return false
    }
    return true
  }

  return (
    <div className="min-h-full bg-background">
      {/* Zoho-style Header - hidden in compact mode or embed mode */}
      {!compactMode && !embedMode && (
      <div className="border-b border-border/70 bg-card/50 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Projects</h1>
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="list">
                <SelectTrigger className="w-32 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="list">List</SelectItem>
                  <SelectItem value="board">Board</SelectItem>
                  <SelectItem value="gantt">Gantt</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-9">
                Automation
              </Button>
              <Button size="sm" className="h-9 bg-blue-600 hover:bg-blue-700" onClick={() => setCreateProjectOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Project View Tabs */}
          <div className="mt-4 flex items-center gap-1 border-b border-border/70">
            <button
              onClick={() => setProjectViewTab("active")}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                projectViewTab === "active"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Active Projects
            </button>
            <button
              onClick={() => setProjectViewTab("templates")}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                projectViewTab === "templates"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Project Templates
            </button>
            <button
              onClick={() => setProjectViewTab("groups")}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                projectViewTab === "groups"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Project Groups
            </button>
            <button
              onClick={() => setProjectViewTab("public")}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                projectViewTab === "public"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Public Projects
            </button>
            <button
              onClick={() => setProjectViewTab("archived")}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                projectViewTab === "archived"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Archived Projects
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Main Content */}
      {!compactMode && (viewMode === "projects" && projectViewTab !== "templates" ? (
        <ProjectsListPage 
          projectViewTab={projectViewTab}
          onProjectClick={(projectId) => {
            setActiveProjectId(projectId)
            setViewMode("board")
          }}
        />
      ) : (
        <div className="px-6 py-4">
        {/* Projects/Templates Table - Zoho Style */}
        <div className="bg-white dark:bg-card rounded-lg border border-border/70 shadow-sm">
          <div className="p-4 border-b border-border/70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {projectViewTab === "templates" ? "Project Templates" : "All Projects"}
                </span>
                <Badge variant="outline" className="text-xs">
                  {projectViewTab === "templates" 
                    ? projectTemplates.length 
                    : projectMeta.filter((p) => !p.archived).length}
                </Badge>
              </div>
              {projectViewTab === "templates" && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setTemplateName("")
                    setTemplateDescription("")
                    setCreateTemplateOpen(true)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              )}
            </div>
          </div>
          
          {projectViewTab === "templates" ? (
            // Templates Card View
            projectTemplates.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FolderKanban className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm mb-4">No templates found</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCreateTemplateOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Template
                </Button>
              </div>
            ) : (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectTemplates.map((template) => {
                  const totalTasks = template.columns.reduce((acc, col) => acc + (col.tasks?.length || 0), 0)
                  const totalColumns = template.columns.length
                  const TemplateIcon = getTemplateIcon(template.id)
                  const templateColor = getTemplateColor(template.id)
                  
                  return (
                    <Card
                      key={template.id}
                      className={`overflow-hidden rounded-xl border bg-gradient-to-br ${templateColor} shadow-md hover:shadow-xl transition-all cursor-pointer group relative`}
                      onClick={() => {
                        setSelectedTemplateId(template.id)
                        setCreateFromTemplateOpen(true)
                      }}
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-3 rounded-lg bg-gradient-to-br ${templateColor.split(' ')[0]} ${templateColor.split(' ')[1]} border ${templateColor.split(' ')[2]}`}>
                            <TemplateIcon className="h-6 w-6 text-foreground" />
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedTemplateId(template.id)
                                setCreateFromTemplateOpen(true)
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteTemplate(template.id)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                          {template.name}
                        </h3>
                        
                        {template.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {template.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <Layers className="h-3 w-3" />
                            <span>{totalColumns} stages</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{totalTasks} tasks</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-border/50">
                          <Badge variant="outline" className="text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Ready to Use
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedTemplateId(template.id)
                              setCreateFromTemplateOpen(true)
                            }}
                          >
                            Use Template
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-muted/30 hover:bg-gray-50 dark:hover:bg-muted/30">
                    <TableHead className="w-20 font-semibold text-gray-700 dark:text-foreground">ID</TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-foreground">Project Name</TableHead>
                    <TableHead className="w-16 font-semibold text-center text-gray-700 dark:text-foreground">%</TableHead>
                    <TableHead className="w-32 font-semibold text-gray-700 dark:text-foreground">Owner</TableHead>
                    <TableHead className="w-24 font-semibold text-gray-700 dark:text-foreground">Status</TableHead>
                    <TableHead className="w-32 font-semibold text-gray-700 dark:text-foreground">Tasks</TableHead>
                    <TableHead className="w-32 font-semibold text-gray-700 dark:text-foreground">Start Date</TableHead>
                    <TableHead className="w-32 font-semibold text-gray-700 dark:text-foreground">End Date</TableHead>
                    <TableHead className="w-32 font-semibold text-gray-700 dark:text-foreground">Tags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectMeta
                  .filter((p) => {
                    if (projectViewTab === "active") return !p.archived
                    if (projectViewTab === "archived") return p.archived
                    if (projectViewTab === "groups") return false // Groups not implemented yet
                    if (projectViewTab === "public") return false // Public not implemented yet
                    return true
                  })
                  .length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                        <FolderKanban className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No projects found</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4"
                          onClick={() => setCreateProjectOpen(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Project
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                  projectMeta
                  .filter((p) => {
                    if (projectViewTab === "active") return !p.archived
                    if (projectViewTab === "archived") return p.archived
                    if (projectViewTab === "groups") return false
                    if (projectViewTab === "public") return false
                    return true
                  })
                  .map((project) => {
                    const projectColumns = localBoards[project.id] || []
                    const projectTasks = projectColumns.flatMap((col) => col.tasks || [])
                    const projectCompleted = projectColumns
                      .filter((c) => deriveStatusForColumn(c) === "done")
                      .reduce((acc, c) => acc + (c.tasks?.length || 0), 0)
                    const projectTotal = projectTasks.length
                    const projectProgress = projectTotal > 0 ? Math.round((projectCompleted / projectTotal) * 100) : 0
                    
                    return (
                      <TableRow 
                        key={project.id} 
                        className="hover:bg-blue-50/50 dark:hover:bg-muted/50 cursor-pointer border-b border-gray-100 dark:border-border/50"
                        onClick={() => {
                          setActiveProjectId(project.id)
                          setViewMode("board")
                        }}
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {project.id.length > 4 ? project.id.toUpperCase().substring(0, 4) : project.id.toUpperCase()}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {project.name}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm font-medium">{projectProgress}%</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                {currentUserName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-foreground">{currentUserName.split(' ')[0]} {currentUserName.split(' ')[1]?.[0] || ''}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-500/15 text-green-600 border-green-500/20 dark:bg-green-500/20 dark:text-green-400 text-xs">
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-foreground">
                            {projectCompleted} {projectProgress}% {projectTotal}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') : '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') : '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">-</TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
            </div>
          )}
          
          {/* Bottom Bar - Zoho Style */}
          {projectViewTab !== "templates" && (
            <div className="px-4 py-2 border-t border-border/70 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>Total Count: {
                  projectMeta.filter((p) => projectViewTab === "active" ? !p.archived : projectViewTab === "archived" ? p.archived : true).length
                }</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <ChevronsLeft className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <span className="px-2">1-{projectMeta.length}</span>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <ChevronRight className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <ChevronsRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      ))}

      {/* Board/List View - Show when not in projects view (or compact mode shows board only) */}
      {(compactMode || viewMode !== "projects") && (
        <div className="space-y-6 pb-6 min-h-full px-2 md:px-4 lg:px-6">
          {/* Back to Projects Button - hidden in compact mode or embed mode */}
          {!compactMode && !embedMode && (
          <div className="px-6 pt-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewMode("projects")}
              className="gap-2"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back to Projects
            </Button>
          </div>
          )}
          
          {/* Header Section - hidden in compact mode, shown in embed mode */}
          {!compactMode && (
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mt-2 md:mt-4">
            <div className="ml-4 md:ml-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <FolderKanban className="h-6 w-6 text-primary" strokeWidth={2.5} />
                </div>
                <h1 className="text-4xl font-bold text-foreground">{activeProject.name}</h1>
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              </div>
              <p className="text-muted-foreground ml-12">Manage your projects and track progress</p>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto ml-4 md:ml-8">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="w-full md:w-72">
              <Select value={activeProjectId} onValueChange={setActiveProjectId}>
                <SelectTrigger className="bg-background/60">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projectMeta
                    .filter((p) => !p.archived)
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="bg-primary hover:bg-primary/90" onClick={() => setCreateProjectOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
            <Button variant="outline" className="bg-background/40" onClick={() => setPeopleDialogOpen(true)}>
              <Users className="h-4 w-4 mr-2" />
              People
            </Button>
            <Button variant="outline" className="bg-background/40" onClick={() => {
              setTemplateName(`${activeProject.name} Template`)
              setTemplateDescription(`Template created from ${activeProject.name}`)
              setCreateTemplateOpen(true)
            }}>
              <Copy className="h-4 w-4 mr-2" />
              Save as Template
            </Button>
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="pl-9 bg-background/60"
              />
            </div>

            <div className="w-full md:w-40">
              <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as any)}>
                <SelectTrigger className="bg-background/60">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Input
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              placeholder="Assignee..."
              className="w-full md:w-44 bg-background/60"
            />
            <Input
              value={labelFilter}
              onChange={(e) => setLabelFilter(e.target.value)}
              placeholder="Label..."
              className="w-full md:w-44 bg-background/60"
            />

            {isFiltering && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setPriorityFilter("all")
                  setAssigneeFilter("")
                  setLabelFilter("")
                }}
              >
                Clear
              </Button>
            )}
          </div>

          {supabaseDisabledReason ? (
            <div className="text-sm text-amber-600 dark:text-amber-400">
              Supabase unreachable — switched to Local mode. ({supabaseDisabledReason})
            </div>
          ) : (
            error && <div className="text-sm text-destructive">{error}</div>
          )}
        </div>
      </div>
          )}

      {/* View Toggle - hidden in compact mode, shown in embed mode */}
      {!compactMode && (
      <div className="flex items-center justify-between px-4 md:px-8">
        <Tabs value={viewMode} onValueChange={(v) => {
          // In embed mode, prevent switching to projects list (user is already viewing a specific project)
          if (embedMode && v === "projects") return
          setViewMode(v as any)
        }}>
          <TabsList>
            <TabsTrigger value="board">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Board
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="h-4 w-4 mr-2" />
              List
            </TabsTrigger>
            {!embedMode && (
              <TabsTrigger value="projects">
                <FolderKanban className="h-4 w-4 mr-2" />
                Projects
              </TabsTrigger>
            )}
            <TabsTrigger value="workload">
              <TrendingUp className="h-4 w-4 mr-2" />
              Workload
            </TabsTrigger>
            <TabsTrigger value="collaboration">
              <Users className="h-4 w-4 mr-2" />
              Collaboration
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      )}

      {/* Task Summary Cards - hidden in compact mode, shown in embed mode */}
      {(embedMode || (!compactMode && viewMode === "board")) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 md:px-8">
          <Card className="overflow-hidden rounded-xl border-2 border-blue-500/30 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-blue-500/20">
                  <CheckCircle2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{openTasks.length}</div>
                  <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Open Tasks</div>
                </div>
              </div>
              <div className="h-2 bg-blue-200 dark:bg-blue-900/30 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${totalTasks > 0 ? (openTasks.length / totalTasks) * 100 : 0}%` }} />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-xl border-2 border-green-500/30 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-green-500/20">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400">{closedTasks.length}</div>
                  <div className="text-sm font-medium text-green-700 dark:text-green-300">Closed Tasks</div>
                </div>
              </div>
              <div className="h-2 bg-green-200 dark:bg-green-900/30 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${totalTasks > 0 ? (closedTasks.length / totalTasks) * 100 : 0}%` }} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* My Tasks Section - hidden in compact mode, shown in embed mode */}
      {(embedMode || (!compactMode && viewMode === "board")) && myTasks.length > 0 && (
        <Card className="mx-4 md:mx-8">
          <CardHeader>
            <CardTitle className="text-lg">:: My Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {myTasks.slice(0, 10).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-border/70 hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{task.title}</span>
                      <Badge variant="outline" className="text-xs">{activeProject.name}</Badge>
                    </div>
                    {task.dueDate && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <Badge className={getPriorityBadge(task.priority)}>{task.priority}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Work Items Due Today - hidden in compact mode, shown in embed mode */}
      {(embedMode || (!compactMode && viewMode === "board")) && (
        <Card className="mx-4 md:mx-8">
          <CardHeader>
            <CardTitle className="text-lg">:: My Work Items Due Today</CardTitle>
          </CardHeader>
          <CardContent>
            {tasksDueToday.length > 0 ? (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {tasksDueToday.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-border/70 hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <span className="font-medium text-sm">{task.title}</span>
                      <Badge variant="outline" className="text-xs ml-2">{activeProject.name}</Badge>
                    </div>
                    <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/20">Due Today</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">You don't have any overdue tasks. Keep it up!</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* My Overdue Work Items - hidden in compact mode, shown in embed mode */}
      {(embedMode || (!compactMode && viewMode === "board")) && overdueTasks.length > 0 && (
        <Card className="mx-4 md:mx-8">
          <CardHeader>
            <CardTitle className="text-lg">:: My Overdue Work Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {overdueTasks.map((task) => {
                const daysLate = task.dueDate ? getDaysLate(task.dueDate) : 0
                return (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-red-500/30 bg-red-50/50 dark:bg-red-950/10 hover:bg-red-100/50 dark:hover:bg-red-950/20 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-sm">{task.title}</span>
                        <Badge variant="outline" className="text-xs">{activeProject.name}</Badge>
                      </div>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">late by {daysLate} day{daysLate !== 1 ? 's' : ''}</p>
                    </div>
                    {task.dueDate && (
                      <div className="text-xs text-muted-foreground">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Tasks > Overdue - hidden in compact mode, shown in embed mode */}
      {(embedMode || (!compactMode && viewMode === "board")) && overdueTasks.length > 0 && (
        <Card className="mx-4 md:mx-8">
          <CardHeader>
            <CardTitle className="text-lg">:: All Tasks &gt; Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {overdueTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-border/70 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <span className="font-medium text-sm">{task.title}</span>
                      <Badge variant="outline" className="text-xs ml-2">{activeProject.name}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {task.dueDate && (
                      <>
                        <Calendar className="h-3 w-3" />
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards - hidden in compact mode, shown in embed mode */}
      {(embedMode || !compactMode) && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:px-8">
        <Card className="overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card to-card/80 shadow-card dark:border-white/10 dark:bg-sidebar-accent dark:from-sidebar-accent dark:to-sidebar-accent/80 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Projects</CardTitle>
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <FolderKanban className="h-4 w-4 text-primary" strokeWidth={2.5} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activeProjectsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Tracked boards</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card to-card/80 shadow-card dark:border-white/10 dark:bg-sidebar-accent dark:from-sidebar-accent dark:to-sidebar-accent/80 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-info" />
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
              <div className="p-1.5 rounded-lg bg-info/10 border border-info/20">
                <Layers className="h-4 w-4 text-info" strokeWidth={2.5} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">Across {totalColumns} columns</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card to-card/80 shadow-card dark:border-white/10 dark:bg-sidebar-accent dark:from-sidebar-accent dark:to-sidebar-accent/80 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-warning" />
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
              <div className="p-1.5 rounded-lg bg-warning/10 border border-warning/20">
                <TrendingUp className="h-4 w-4 text-warning" strokeWidth={2.5} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{inProgressTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card to-card/80 shadow-card dark:border-white/10 dark:bg-sidebar-accent dark:from-sidebar-accent dark:to-sidebar-accent/80 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-success" />
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              <div className="p-1.5 rounded-lg bg-success/10 border border-success/20">
                <CheckCircle2 className="h-4 w-4 text-success" strokeWidth={2.5} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{completedTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">Finished tasks</p>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Kanban Board - show in board view, compact mode, or embed mode */}
      {(compactMode || embedMode || viewMode === "board") && (
        <div ref={componentRef}>
      {/* Project Header Card */}
      <Card className="overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card to-card/80 shadow-card dark:border-white/10 dark:bg-sidebar-accent dark:from-sidebar-accent dark:to-sidebar-accent/80 relative mx-4 md:mx-8">
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
        <CardHeader className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-2xl font-bold text-foreground">{activeProject.name}</CardTitle>
                <Badge variant="outline" className="border-border/50 bg-background/40">
                  {activeProjectId}
                </Badge>
                <Badge className={supabaseEnabled ? "bg-green-500/15 text-green-600 border-green-500/20 dark:bg-green-500/20 dark:text-green-400" : "bg-muted text-muted-foreground border-border/40"}>
                  {supabaseEnabled ? "Synced" : "Local"}
                </Badge>
              </div>
              <CardDescription className="text-muted-foreground">
                {loading ? "Loading board…" : `${totalTasks} tasks • ${totalColumns} columns • ${completionPct}% complete`}
              </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="flex items-center"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Export as PDF
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90"
              onClick={() => {
                const first = columns[0]
                if (first) openCreateTask(first.id)
              }}
              disabled={!columns.length}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 min-w-[240px] flex-1">
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <TrendingUp className="h-4 w-4 text-primary" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{completionPct}%</span>
                </div>
                <Progress value={completionPct} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-info/10 border border-info/20">
                <Layers className="h-4 w-4 text-info" strokeWidth={2} />
              </div>
              <span className="text-sm text-muted-foreground">{totalTasks} Tasks</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-warning/10 border border-warning/20">
                <Flag className="h-4 w-4 text-warning" strokeWidth={2} />
              </div>
              <span className="text-sm text-muted-foreground">{inProgressTasks} In Progress</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <div className="flex-1 relative px-4 md:px-8">
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/50" style={{scrollBehavior: 'smooth'}}>
        {columns.map((column, colIndex) => {
          const visibleTasks = isFiltering ? column.tasks.filter(matchesFilters) : column.tasks
          const countLabel =
            isFiltering && visibleTasks.length !== column.tasks.length
              ? `${visibleTasks.length}/${column.tasks.length}`
              : `${visibleTasks.length}`
          const theme = getColumnTheme(column, colIndex)

          return (
          <div key={column.id} className="w-80 flex-shrink-0">
            {/* Column Header */}
            <Card className={`overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br ${theme.gradientFrom} via-card to-card/80 shadow-card dark:border-white/10 dark:bg-sidebar-accent dark:to-sidebar-accent/80 relative mb-4`}>
              <div className={`absolute top-0 left-0 right-0 h-1 ${theme.bar} opacity-70`} />
              <CardHeader className="pb-3 pt-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-semibold text-sm text-foreground">{column.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs bg-background/50 border-border/50">
                      {countLabel}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="dropdown-3d">
                        <DropdownMenuItem onClick={() => {
                          const newTitle = prompt("Enter new column title:", column.title)
                          if (newTitle && newTitle.trim()) {
                            handleEditColumn(column.id, newTitle.trim(), column.color)
                          }
                        }}>
                          Edit Column
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteColumn(column.id)}
                          disabled={columns.length <= 1}
                        >
                          Delete Column
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
            </Card>
            
            {/* Tasks Container */}
            <div 
              className={`space-y-3 min-h-32 transition-all rounded-xl p-2 ${
                draggedOverColumn === column.id 
                  ? 'bg-primary/10 border-2 border-primary border-dashed' 
                  : 'bg-transparent'
              }`}
              onDragOver={(e) => {
                e.preventDefault()
                setDraggedOverColumn(column.id)
              }}
              onDragLeave={() => setDraggedOverColumn(null)}
              onDrop={(e) => {
                e.preventDefault()
                setDraggedOverColumn(null)
                try {
                  const data = JSON.parse(e.dataTransfer.getData('text/plain'))
                  if (data.taskId && data.fromColumnId && data.fromColumnId !== column.id) {
                    handleMoveTask(data.taskId, data.fromColumnId, column.id)
                  }
                } catch (error) {
                  console.error('Error handling drop:', error)
                }
              }}
            >
              {visibleTasks.map((task) => (
                <TaskCard key={task.id} task={task} columnId={column.id} />
              ))}

              {isFiltering && !visibleTasks.length && !!column.tasks.length && (
                <div className="text-xs text-muted-foreground px-2 py-3 text-center rounded-lg border border-dashed border-border/60 bg-background/40">
                  No matches in this column
                </div>
              )}
              
              <Button 
                variant="outline" 
                className="w-full border-dashed hover:bg-muted/50 hover:border-primary/50 transition-all"
                onClick={() => openCreateTask(column.id)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>
        )})}
        
        {/* Add Column Button */}
        <div className="w-80 flex-shrink-0">
          <Button 
            variant="outline" 
            className="w-full h-32 border-dashed text-muted-foreground hover:bg-muted/50 hover:border-primary/50 hover:text-foreground transition-all rounded-2xl"
            onClick={handleAddColumn}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Column
          </Button>
        </div>
        </div>
        {/* Scroll indicators */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10"></div>
        </div>
      </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <Card className="mx-4 md:mx-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Tasks</CardTitle>
              <div className="flex items-center gap-2">
                <Select defaultValue="all-open">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-open">All Open</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => {
                  const first = columns[0]
                  if (first) openCreateTask(first.id)
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Task Name</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allTasks.filter((task) => {
                    if (!matchesFilters(task)) return false
                    return true
                  }).map((task, index) => {
                    const col = columns.find((c) => c.id === task.columnId)
                    const status = col ? deriveStatusForColumn(col) : "todo"
                    const statusColors: Record<string, string> = {
                      todo: "bg-green-500/15 text-green-600 border-green-500/20",
                      inprogress: "bg-blue-500/15 text-blue-600 border-blue-500/20",
                      review: "bg-yellow-500/15 text-yellow-600 border-yellow-500/20",
                      done: "bg-gray-500/15 text-gray-600 border-gray-500/20",
                    }
                    const stageProgress = col ? calculateStageProgress(columns.indexOf(col), columns.length) : 0
                    const statusKey = status || "todo"
                    
                    return (
                      <TableRow key={task.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-xs">T{index + 1}</TableCell>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>{activeProject.name}</TableCell>
                        <TableCell>{task.assignee}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[statusKey] || "bg-muted"}>{col?.title || "To Do"}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {task.labels.slice(0, 2).map((label) => (
                              <Badge key={label} variant="outline" className="text-xs">{label}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">-</TableCell>
                        <TableCell>
                          {task.dueDate ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">-</TableCell>
                        <TableCell>
                          <Badge className={getPriorityBadge(task.priority)}>{task.priority}</Badge>
                        </TableCell>
                        <TableCell>{stageProgress}%</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workload Report View */}
      {viewMode === "workload" && (
        <div className="px-4 md:px-8 py-6">
          <WorkloadReport
            projectId={activeProjectId !== "default" ? activeProjectId : undefined}
            availableProjects={projectMeta.map(p => ({ id: p.id, name: p.name }))}
            availableOwners={orgPeople.map(p => p.name)}
          />
        </div>
      )}

      {/* Collaboration View */}
      {viewMode === "collaboration" && (
        <div className="px-4 md:px-8 py-6">
          <CollaborationFeed
            projectId={activeProjectId !== "default" ? activeProjectId : undefined}
          />
        </div>
      )}
        </div>
      )}

      {/* Create Project Dialog */}
      <Dialog open={createProjectOpen} onOpenChange={setCreateProjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
            <DialogDescription>Create a new project board (stored {supabaseEnabled ? "in Supabase" : "locally"}).</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="projectName">Project name</Label>
            <Input
              id="projectName"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="e.g. Residential Collection Expansion"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              ID preview: <span className="font-mono">{newProjectName ? createProjectIdFromName(newProjectName) : "—"}</span>
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateProjectOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleCreateProject()} disabled={!newProjectName.trim()}>
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog open={createTemplateOpen} onOpenChange={setCreateTemplateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Project Template</DialogTitle>
            <DialogDescription>
              Save the current project structure (columns and tasks) as a template for future projects.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="templateName">Template Name *</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g. Waste Collection Project Template"
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="templateDescription">Description (optional)</Label>
              <Textarea
                id="templateDescription"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Describe what this template is used for..."
                rows={3}
              />
            </div>

            <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
              <p className="text-sm font-medium mb-2">Template will include:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• {columns.length} columns</li>
                <li>• {totalTasks} tasks (without assignees or due dates)</li>
                <li>• Project structure and workflow</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateTemplateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate} disabled={!templateName.trim()}>
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Project from Template Dialog */}
      <Dialog open={createFromTemplateOpen} onOpenChange={setCreateFromTemplateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Project from Template</DialogTitle>
            <DialogDescription>
              Create a new project using the selected template structure.
            </DialogDescription>
          </DialogHeader>

          {selectedTemplateId && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
                <p className="text-sm font-medium mb-2">Template: {projectTemplates.find(t => t.id === selectedTemplateId)?.name}</p>
                {projectTemplates.find(t => t.id === selectedTemplateId)?.description && (
                  <p className="text-xs text-muted-foreground mb-2">
                    {projectTemplates.find(t => t.id === selectedTemplateId)?.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  This will create a project with {projectTemplates.find(t => t.id === selectedTemplateId)?.columns.length || 0} columns and {projectTemplates.find(t => t.id === selectedTemplateId)?.columns.reduce((acc, col) => acc + (col.tasks?.length || 0), 0) || 0} tasks.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="projectNameFromTemplate">Project Name *</Label>
                <Input
                  id="projectNameFromTemplate"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Residential Collection Expansion"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  ID preview: <span className="font-mono">{newProjectName ? createProjectIdFromName(newProjectName) : "—"}</span>
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setCreateFromTemplateOpen(false)
              setSelectedTemplateId(null)
              setNewProjectName("")
            }}>
              Cancel
            </Button>
            <Button onClick={() => selectedTemplateId && handleCreateProject(selectedTemplateId)} disabled={!newProjectName.trim() || !selectedTemplateId}>
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Dialog */}
      <Dialog
        open={taskDialogOpen}
        onOpenChange={(open) => {
          setTaskDialogOpen(open)
          if (!open) {
            setTaskDialogTaskId(null)
            setTaskDialogColumnId(null)
            setTaskDialogOriginalColumnId(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{taskDialogMode === "create" ? "New Task" : "Edit Task"}</DialogTitle>
            <DialogDescription>
              {taskDialogMode === "create" ? "Add a task to your board." : "Update task details and move it across columns."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="taskTitle">Title</Label>
              <Input
                id="taskTitle"
                value={taskDraft.title}
                onChange={(e) => setTaskDraft((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Schedule residential collection route for Zone A"
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="taskDescription">Description</Label>
              <Textarea
                id="taskDescription"
                value={taskDraft.description}
                onChange={(e) => setTaskDraft((p) => ({ ...p, description: e.target.value }))}
                placeholder="What needs to happen? Any links or context... e.g. Review route optimization for Zone A, check vehicle capacity"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="taskAssignee">Assignee</Label>
                <Input
                  id="taskAssignee"
                  list="org-people-options"
                  value={taskDraft.assignee}
                  onChange={(e) => setTaskDraft((p) => ({ ...p, assignee: e.target.value }))}
                  placeholder="Unassigned"
                />
                {!!orgPeople.length && (
                  <p className="text-xs text-muted-foreground">
                    Tip: start typing to pick from your organization people list.
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="taskDue">Due date</Label>
                <Input
                  id="taskDue"
                  type="date"
                  value={taskDraft.dueDate}
                  onChange={(e) => setTaskDraft((p) => ({ ...p, dueDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="taskStartDate">Start date (optional)</Label>
                <Input
                  id="taskStartDate"
                  type="date"
                  value={taskDraft.startDate}
                  onChange={(e) => setTaskDraft((p) => ({ ...p, startDate: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="taskEstimateHours">Estimated hours (optional)</Label>
                <Input
                  id="taskEstimateHours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={taskDraft.estimateHours}
                  onChange={(e) => setTaskDraft((p) => ({ ...p, estimateHours: e.target.value }))}
                  placeholder="e.g. 8"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select value={taskDraft.priority} onValueChange={(v) => setTaskDraft((p) => ({ ...p, priority: v as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Column</Label>
                <Select
                  value={taskDialogColumnId || (columns[0]?.id ?? "")}
                  onValueChange={(v) => setTaskDialogColumnId(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="taskLabels">Labels (comma-separated)</Label>
              <Input
                id="taskLabels"
                value={taskDraft.labels}
                onChange={(e) => setTaskDraft((p) => ({ ...p, labels: e.target.value }))}
                placeholder="Recycling, Collection, MRF"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitTaskDialog} disabled={!taskDraft.title.trim() || !taskDialogColumnId}>
              {taskDialogMode === "create" ? "Create Task" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Organization People Dialog */}
      <Dialog open={peopleDialogOpen} onOpenChange={setPeopleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Organization People</DialogTitle>
            <DialogDescription>
              Add people in your organisation so you can assign them to tasks.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-3 p-3 rounded-lg border border-border/60 bg-background/40">
              <div className="flex items-center gap-2 text-sm font-medium">
                <UserPlus className="h-4 w-4" />
                Add person
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  value={personDraft.name}
                  onChange={(e) => setPersonDraft((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Name"
                />
                <Input
                  value={personDraft.email}
                  onChange={(e) => setPersonDraft((p) => ({ ...p, email: e.target.value }))}
                  placeholder="Email (optional)"
                />
                <Input
                  value={personDraft.role}
                  onChange={(e) => setPersonDraft((p) => ({ ...p, role: e.target.value }))}
                  placeholder="Role (optional)"
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleAddPerson} disabled={!personDraft.name.trim()}>
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">People ({orgPeople.length})</div>
              {orgPeople.length === 0 ? (
                <div className="text-sm text-muted-foreground border border-dashed border-border/60 rounded-lg p-4 text-center">
                  No people yet. Add your first teammate above.
                </div>
              ) : (
                <div className="divide-y divide-border/60 border border-border/60 rounded-lg overflow-hidden">
                  {orgPeople.map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-3 p-3 bg-background/40">
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{p.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {p.role ? `${p.role}${p.email ? " • " : ""}` : ""}
                          {p.email || ""}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleRemovePerson(p.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPeopleDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Datalists */}
      <datalist id="org-people-options">
        {orgPeople.map((p) => (
          <option key={p.id} value={p.name} />
        ))}
      </datalist>
    </div>
  )
}

export default ProjectsPage

