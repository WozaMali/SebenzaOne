"use client"

import { useState, useEffect } from "react"
import { Plus, MoreHorizontal, Calendar, User, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { initSupabaseProjects, fetchBoard, addTask, moveTask, ProjectColumn, ProjectTask } from "@/lib/supabase-projects"

interface Task {
  id: string
  title: string
  description: string
  assignee: string
  dueDate: string
  priority: "low" | "medium" | "high"
  labels: string[]
}

interface Column {
  id: string
  title: string
  tasks: Task[]
  color: string
}

const initialColumns: Column[] = [
  {
    id: "todo",
    title: "To Do",
    color: "bg-slate-100 dark:bg-slate-800",
    tasks: [
      {
        id: "1",
        title: "Design system updates",
        description: "Update color palette and typography guidelines",
        assignee: "Sarah Johnson",
        dueDate: "2024-01-15",
        priority: "high",
        labels: ["Design", "Frontend"]
      },
      {
        id: "2",
        title: "API documentation",
        description: "Complete REST API documentation for v2.0",
        assignee: "Mike Chen",
        dueDate: "2024-01-20",
        priority: "medium",
        labels: ["Backend", "Documentation"]
      }
    ]
  },
  {
    id: "inprogress",
    title: "In Progress",
    color: "bg-blue-100 dark:bg-blue-900",
    tasks: [
      {
        id: "3",
        title: "User authentication refactor",
        description: "Implement OAuth 2.0 and JWT tokens",
        assignee: "Lisa Rodriguez",
        dueDate: "2024-01-18",
        priority: "high",
        labels: ["Backend", "Security"]
      }
    ]
  },
  {
    id: "review",
    title: "Review",
    color: "bg-amber-100 dark:bg-amber-900",
    tasks: [
      {
        id: "4",
        title: "Mobile responsive fixes",
        description: "Fix layout issues on mobile devices",
        assignee: "John Doe",
        dueDate: "2024-01-12",
        priority: "medium",
        labels: ["Frontend", "Bug Fix"]
      }
    ]
  },
  {
    id: "done",
    title: "Done",
    color: "bg-green-100 dark:bg-green-900",
    tasks: [
      {
        id: "5",
        title: "Database optimization",
        description: "Optimized slow queries and added indexes",
        assignee: "Mike Chen",
        dueDate: "2024-01-10",
        priority: "low",
        labels: ["Backend", "Performance"]
      }
    ]
  },
  {
    id: "testing",
    title: "Testing",
    color: "bg-purple-100 dark:bg-purple-900",
    tasks: [
      {
        id: "6",
        title: "Unit test coverage",
        description: "Increase test coverage to 90%",
        assignee: "Sarah Johnson",
        dueDate: "2024-01-25",
        priority: "medium",
        labels: ["Testing", "Quality"]
      },
      {
        id: "7",
        title: "Integration tests",
        description: "Add integration tests for API endpoints",
        assignee: "Mike Chen",
        dueDate: "2024-01-28",
        priority: "high",
        labels: ["Testing", "Backend"]
      }
    ]
  },
  {
    id: "deployment",
    title: "Deployment",
    color: "bg-orange-100 dark:bg-orange-900",
    tasks: [
      {
        id: "8",
        title: "Production deployment",
        description: "Deploy latest changes to production",
        assignee: "Lisa Rodriguez",
        dueDate: "2024-02-01",
        priority: "high",
        labels: ["DevOps", "Deployment"]
      }
    ]
  },
  {
    id: "monitoring",
    title: "Monitoring",
    color: "bg-indigo-100 dark:bg-indigo-900",
    tasks: [
      {
        id: "9",
        title: "Performance monitoring",
        description: "Set up application performance monitoring",
        assignee: "John Doe",
        dueDate: "2024-02-05",
        priority: "medium",
        labels: ["Monitoring", "DevOps"]
      }
    ]
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

export function ProjectsPage() {
  const [columns, setColumns] = useState(initialColumns)
  const [loading, setLoading] = useState(false)
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null)

  useEffect(() => {
    // Load from Supabase if env vars present
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined
    if (!url || !key) return

    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        initSupabaseProjects(url, key)
        const { columns: cols, tasks } = await fetchBoard('default')
        if (!mounted) return
        // Map to UI shape
        const mapped = cols.map((c) => ({
          id: c.id,
          title: c.title,
          color: c.color,
          tasks: tasks.filter(t => t.column_id === c.id).map(t => ({
            id: t.id,
            title: t.title,
            description: t.description,
            assignee: t.assignee || 'Unassigned',
            dueDate: t.due_date || '',
            priority: (t.priority as any) || 'medium',
            labels: t.labels || [],
          }))
        }))
        setColumns(mapped)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const handleAddTask = async (columnId: string) => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      // Local add
      setColumns(prev => prev.map(col => col.id === columnId ? {
        ...col,
        tasks: col.tasks.concat({
          id: Date.now().toString(),
          title: "New Task",
          description: "",
          assignee: "Unassigned",
          dueDate: "",
          priority: "medium",
          labels: []
        })
      } : col))
      return
    }

    initSupabaseProjects(url, key)
    const orderIndex = columns.find(c => c.id === columnId)?.tasks.length || 0
    const created = await addTask({
      project_id: 'default',
      column_id: columnId,
      title: 'New Task',
      description: '',
      assignee: 'Unassigned',
      due_date: null,
      priority: 'medium',
      labels: [],
      order_index: orderIndex
    } as any)
    setColumns(prev => prev.map(col => col.id === columnId ? {
      ...col,
      tasks: col.tasks.concat({
        id: created.id,
        title: created.title,
        description: created.description,
        assignee: created.assignee || 'Unassigned',
        dueDate: created.due_date || '',
        priority: (created.priority as any) || 'medium',
        labels: created.labels || []
      })
    } : col))
  }

  const handleMoveTask = async (taskId: string, fromColumnId: string, toColumnId: string) => {
    if (fromColumnId === toColumnId) return

    // Local optimistic move
    let movedTask: any = null
    setColumns(prev => prev.map(col => {
      if (col.id === fromColumnId) {
        const remaining = col.tasks.filter(t => t.id !== taskId)
        const found = col.tasks.find(t => t.id === taskId)
        if (found) movedTask = found
        return { ...col, tasks: remaining }
      }
      return col
    }))
    if (!movedTask) return
    setColumns(prev => prev.map(col => col.id === toColumnId ? {
      ...col,
      tasks: col.tasks.concat(movedTask)
    } : col))

    // Persist if configured
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (url && key) {
      initSupabaseProjects(url, key)
      const newIndex = (columns.find(c => c.id === toColumnId)?.tasks.length || 0)
      try { await moveTask(taskId, toColumnId, newIndex) } catch {}
    }
  }

  const handleAddColumn = () => {
    const newColumnId = `column-${Date.now()}`
    const newColumn: Column = {
      id: newColumnId,
      title: "New Column",
      color: "bg-gray-100 dark:bg-gray-800",
      tasks: []
    }
    setColumns(prev => [...prev, newColumn])
  }

  const handleDeleteTask = (taskId: string, columnId: string) => {
    setColumns(prev => prev.map(col => 
      col.id === columnId 
        ? { ...col, tasks: col.tasks.filter(t => t.id !== taskId) }
        : col
    ))
  }

  const handleEditTask = (taskId: string, columnId: string, updates: Partial<Task>) => {
    setColumns(prev => prev.map(col => 
      col.id === columnId 
        ? { 
            ...col, 
            tasks: col.tasks.map(t => 
              t.id === taskId ? { ...t, ...updates } : t
            )
          }
        : col
    ))
  }

  const handleDeleteColumn = (columnId: string) => {
    if (columns.length <= 1) return // Don't delete the last column
    setColumns(prev => prev.filter(col => col.id !== columnId))
  }

  const handleEditColumn = (columnId: string, title: string, color: string) => {
    setColumns(prev => prev.map(col => 
      col.id === columnId 
        ? { ...col, title, color }
        : col
    ))
  }

  const TaskCard = ({ task, columnId }: { task: any, columnId: string }) => {
    const handleDragStart = (e: React.DragEvent) => {
      e.dataTransfer.setData('text/plain', JSON.stringify({ taskId: task.id, fromColumnId: columnId }))
    }

    return (
      <div 
        className="enterprise-card p-4 mb-3 bg-white dark:bg-gray-800 cursor-move hover:shadow-md transition-shadow"
        draggable
        onDragStart={handleDragStart}
      >
        <div className="flex items-start justify-between mb-2">
          <h4 
            className="font-medium text-base text-gray-900 dark:text-white cursor-pointer hover:text-primary"
            onClick={() => {
              const newTitle = prompt("Enter new task title:", task.title)
              if (newTitle && newTitle.trim()) {
                handleEditTask(task.id, columnId, { title: newTitle.trim() })
              }
            }}
          >
            {task.title}
          </h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="dropdown-3d">
              <DropdownMenuItem onClick={() => {
                const newTitle = prompt("Enter new task title:", task.title)
                if (newTitle && newTitle.trim()) {
                  handleEditTask(task.id, columnId, { title: newTitle.trim() })
                }
              }}>
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                // quick move to next column
                const idx = columns.findIndex(c => c.id === columnId)
                const next = columns[idx + 1]
                if (next) handleMoveTask(task.id, columnId, next.id)
              }}>Move to next</DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => handleDeleteTask(task.id, columnId)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-200 mb-3 line-clamp-2">
          {task.description}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.map((label: string) => (
            <Badge key={label} variant="secondary" className="text-sm text-gray-700 dark:text-gray-200">
              {label}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-sm text-gray-700 dark:text-gray-200">
                {task.assignee.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600 dark:text-gray-200">{task.assignee}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-200">
              <Calendar className="h-4 w-4" />
              {task.dueDate}
            </div>
            <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .projects-middle, #projects-middle-panel {
            width: 168px !important;
            min-width: 168px !important;
            max-width: 168px !important;
            flex-shrink: 0 !important;
          }
          .projects-sidebar, #projects-sidebar-panel {
            width: 154px !important;
            min-width: 154px !important;
            max-width: 154px !important;
            flex-shrink: 0 !important;
          }
        `
      }} />
      <div className="projects-page-container h-full pr-6" style={{'--projects-middle-width': '168px'} as React.CSSProperties}>
      <div 
        id="projects-sidebar-panel"
        className="projects-sidebar enterprise-card card-3d p-4 flex-shrink-0"
        data-panel="projects-sidebar"
        style={{
          width: '154px',
          minWidth: '154px', 
          maxWidth: '154px',
          flexShrink: '0'
        }}
      >
        {/* Projects Sidebar Content */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">Project Tools</h3>
          <div className="space-y-1">
            <div className="p-2 rounded hover:bg-muted cursor-pointer">All Projects</div>
            <div className="p-2 rounded hover:bg-muted cursor-pointer">Active</div>
            <div className="p-2 rounded hover:bg-muted cursor-pointer">Completed</div>
            <div className="p-2 rounded hover:bg-muted cursor-pointer">Archived</div>
          </div>
        </div>
      </div>
      
      <div 
        id="projects-middle-panel"
        className="projects-middle enterprise-card card-3d flex flex-col flex-shrink-0"
        data-panel="projects-middle"
        style={{
          width: '168px',
          minWidth: '168px', 
          maxWidth: '168px',
          flexShrink: '0'
        }}
      >
        {/* Projects Middle Content */}
        <div className="p-3 border-b">
          <h2 className="text-base font-semibold">Project Board</h2>
        </div>
        <div className="flex-1 p-3">
          <div className="space-y-2">
            <div className="p-2 bg-muted rounded">
              <h3 className="text-sm font-semibold text-muted-foreground">Projects</h3>
              <p className="text-lg font-bold">{columns.length}</p>
            </div>
            <div className="p-2 bg-muted rounded">
              <h3 className="text-sm font-semibold text-muted-foreground">Tasks</h3>
              <p className="text-lg font-bold">{columns.reduce((acc, col) => acc + col.tasks.length, 0)}</p>
            </div>
            <div className="p-2 bg-muted rounded">
              <h3 className="text-sm font-semibold text-muted-foreground">In Progress</h3>
              <p className="text-lg font-bold">{columns.find(c => c.id === 'inprogress')?.tasks.length || 0}</p>
            </div>
            <div className="p-2 bg-muted rounded">
              <h3 className="text-sm font-semibold text-muted-foreground">Completed</h3>
              <p className="text-lg font-bold">{columns.find(c => c.id === 'done')?.tasks.length || 0}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="projects-right flex flex-col overflow-hidden" style={{flex: '1 1 0', minWidth: '300px'}}>
        {/* Project Header */}
        <div className="enterprise-card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">Website Redesign Project</h1>
            <p className="text-muted-foreground">Complete redesign of company website with modern UI/UX</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>
            <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-6 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">5 Team Members</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Due: February 15, 2024</span>
          </div>
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">High Priority</span>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 relative">
        <div className="flex gap-6 overflow-x-auto pb-6 px-2 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/50" style={{scrollBehavior: 'smooth'}}>
        {columns.map((column) => (
          <div key={column.id} className="w-80 flex-shrink-0">
            <div className={`${column.color} rounded-lg p-3 mb-4`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{column.title}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs text-gray-700 dark:text-gray-200">
                    {column.tasks.length}
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
            </div>
            
            <div 
              className={`space-y-3 min-h-32 transition-colors ${
                draggedOverColumn === column.id ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-600 border-dashed rounded-lg' : ''
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
              {column.tasks.map((task) => (
                <TaskCard key={task.id} task={task} columnId={column.id} />
              ))}
              
              <Button 
                variant="outline" 
                className="w-full border-dashed hover:bg-muted/50"
                onClick={() => handleAddTask(column.id)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>
        ))}
        
        <div className="w-80 flex-shrink-0">
          <Button 
            variant="outline" 
            className="w-full h-32 border-dashed text-muted-foreground hover:bg-muted/50"
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
    </div>
    </>
  )
}

export default ProjectsPage
