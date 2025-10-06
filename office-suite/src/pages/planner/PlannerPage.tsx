"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Plus, Timer, MoreHorizontal, Flag, Calendar as CalendarIcon, ArrowRight, ArrowLeft, Trash2, Play, Pause, RefreshCw, 
  Tag as TagIcon, User, Edit2, Save, X, Clock, BarChart3, Target, CheckCircle, AlertCircle, Coffee, Bell, 
  Users, Building2, TrendingUp, Clock3, Zap, Brain, Shield, Globe, Video, Mic, Send, FileSpreadsheet, Award, 
  TrendingDown, RefreshCw as RefreshCwIcon, Recycle, Package, Truck, Wallet, CreditCard, Smartphone, Laptop, 
  Monitor, Headphones, Camera, MapPin, Hash, Percent, Calculator, PlayCircle, PauseCircle, StopCircle, Volume2, 
  VolumeX, Wifi, WifiOff, Battery, BatteryLow, Signal, SignalHigh, SignalLow, SignalZero, ChevronDown, 
  PieChart, LineChart, Activity, Mail, Phone, Settings, Bell as BellIcon, UserPlus, Building, Briefcase, 
  Activity as ActivityLucideIcon, Mail as MailIcon, Phone as PhoneIcon, Search, Filter, Download, Upload, 
  HelpCircle, Star, Eye, MessageSquare, FileText, CheckSquare, Folder, Clock as ClockIcon, Star as StarIcon, 
  ArrowUpRight, ArrowDownRight, Package as PackageIcon, Truck as TruckIcon, RefreshCw as RefreshCwIcon2, 
  Recycle as RecycleIcon, Shield as ShieldIcon, Upload as UploadIcon, Wifi as WifiIcon, WifiOff as WifiOffIcon, 
  Battery as BatteryIcon, BatteryLow as BatteryLowIcon, Signal as SignalIcon, SignalHigh as SignalHighIcon, 
  SignalLow as SignalLowIcon, SignalZero as SignalZeroIcon, WifiIcon as WifiIcon2, WifiOffIcon as WifiOffIcon2, 
  BatteryIcon as BatteryIcon2, BatteryLowIcon as BatteryLowIcon2, SignalIcon as SignalIcon2, SignalHighIcon as SignalHighIcon2, 
  SignalLowIcon as SignalLowIcon2, SignalZeroIcon as SignalZeroIcon2, WifiIcon as WifiIcon3, WifiOffIcon as WifiOffIcon3, 
  BatteryIcon as BatteryIcon3, BatteryLowIcon as BatteryLowIcon3, SignalIcon as SignalIcon3, SignalHighIcon as SignalHighIcon3, 
  SignalLowIcon as SignalLowIcon3, SignalZeroIcon as SignalZeroIcon3
} from "lucide-react"
import { supabase, isSupabaseEnabled } from "@/lib/supabase-client"

type Priority = 'low' | 'medium' | 'high' | 'urgent'
type Status = 'todo' | 'inprogress' | 'review' | 'done'
type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled'
type HabitFrequency = 'daily' | 'weekly' | 'monthly'
type GoalType = 'personal' | 'professional' | 'health' | 'learning' | 'financial'

type Task = {
  id: string
  title: string
  description?: string
  priority: Priority
  dueDate?: string
  tags: string[]
  assignee?: string
  status: Status
  estimate?: number
  createdAt: string
  projectId?: string
  timeSpent?: number
  subtasks?: Task[]
}

type Project = {
  id: string
  name: string
  description?: string
  status: ProjectStatus
  startDate?: string
  endDate?: string
  progress: number
  team: string[]
  budget?: number
  tags: string[]
  createdAt: string
}

type Goal = {
  id: string
  title: string
  description?: string
  type: GoalType
  targetDate?: string
  progress: number
  isCompleted: boolean
  createdAt: string
}

type Habit = {
  id: string
  name: string
  description?: string
  frequency: HabitFrequency
  streak: number
  targetCount: number
  currentCount: number
  isCompleted: boolean
  createdAt: string
}

type TimeEntry = {
  id: string
  taskId: string
  startTime: string
  endTime?: string
  duration?: number
  description?: string
  createdAt: string
}

type PlannerDashboard = {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  overdueTasks: number
  completionRate: number
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalGoals: number
  achievedGoals: number
  totalHabits: number
  activeHabits: number
  totalTimeTracked: number
  productivityScore: number
  focusTime: number
  breakTime: number
  completedPomodoros: number
  weeklyProgress: number
  monthlyProgress: number
  topPerformingDay: string
  mostProductiveHour: number
  averageTaskCompletion: number
  teamCollaboration: number
  recentActivities: any[]
  upcomingDeadlines: any[]
  insights: string[]
}

const nowIso = () => new Date().toISOString()

// Sample data
const sampleDashboard: PlannerDashboard = {
  totalTasks: 47,
  completedTasks: 32,
  inProgressTasks: 8,
  overdueTasks: 3,
  completionRate: 68.1,
  totalProjects: 12,
  activeProjects: 5,
  completedProjects: 7,
  totalGoals: 8,
  achievedGoals: 3,
  totalHabits: 6,
  activeHabits: 4,
  totalTimeTracked: 142.5,
  productivityScore: 87,
  focusTime: 156,
  breakTime: 24,
  completedPomodoros: 12,
  weeklyProgress: 78,
  monthlyProgress: 65,
  topPerformingDay: 'Tuesday',
  mostProductiveHour: 10,
  averageTaskCompletion: 2.3,
  teamCollaboration: 92,
  recentActivities: [],
  upcomingDeadlines: [],
  insights: [
    'You\'re most productive in the morning',
    'Team collaboration is at an all-time high',
    'Consider taking more breaks to maintain focus'
  ]
}

const initialTasks: Task[] = [
  { id: 't-1', title: 'Finalize brand colors', description: 'Pick dark theme accents', priority: 'high', dueDate: new Date(Date.now()+86400000).toISOString(), tags: ['design'], assignee: 'Sarah', status: 'review', estimate: 2, createdAt: nowIso(), timeSpent: 1.5 },
  { id: 't-2', title: 'Wire Connect routes', priority: 'medium', tags: ['connect','routing'], assignee: 'Mike', status: 'inprogress', estimate: 3, createdAt: nowIso(), timeSpent: 2.1 },
  { id: 't-3', title: 'Implement Notes tags', priority: 'low', tags: ['notes'], assignee: 'Lisa', status: 'todo', createdAt: nowIso() },
  { id: 't-4', title: 'QA Calendar dialogs', priority: 'urgent', dueDate: new Date().toISOString(), tags: ['calendar','qa'], assignee: 'John', status: 'todo', estimate: 1, createdAt: nowIso() },
  { id: 't-5', title: 'Deploy preview env', priority: 'high', tags: ['devops'], assignee: 'Emma', status: 'inprogress', createdAt: nowIso(), timeSpent: 0.8 },
]

const sampleProjects: Project[] = [
  {
    id: 'p-1',
    name: 'Website Redesign',
    description: 'Complete overhaul of company website',
    status: 'active',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 65,
    team: ['Sarah', 'Mike', 'Lisa'],
    budget: 50000,
    tags: ['design', 'frontend'],
    createdAt: nowIso()
  },
  {
    id: 'p-2',
    name: 'Mobile App Development',
    description: 'Native mobile app for iOS and Android',
    status: 'planning',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 15,
    team: ['John', 'Emma'],
    budget: 75000,
    tags: ['mobile', 'development'],
    createdAt: nowIso()
  }
]

const sampleGoals: Goal[] = [
  {
    id: 'g-1',
    title: 'Learn React Advanced Patterns',
    description: 'Master advanced React concepts and patterns',
    type: 'learning',
    targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 40,
    isCompleted: false,
    createdAt: nowIso()
  },
  {
    id: 'g-2',
    title: 'Complete 5K Run',
    description: 'Train and complete a 5K run',
    type: 'health',
    targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 70,
    isCompleted: false,
    createdAt: nowIso()
  }
]

const sampleHabits: Habit[] = [
  {
    id: 'h-1',
    name: 'Daily Exercise',
    description: '30 minutes of physical activity',
    frequency: 'daily',
    streak: 12,
    targetCount: 1,
    currentCount: 1,
    isCompleted: true,
    createdAt: nowIso()
  },
  {
    id: 'h-2',
    name: 'Read for 30 minutes',
    description: 'Read books or articles',
    frequency: 'daily',
    streak: 8,
    targetCount: 1,
    currentCount: 0,
    isCompleted: false,
    createdAt: nowIso()
  }
]

const prioColor = (p: Priority) => ({
  low: 'bg-green-100 text-green-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-amber-100 text-amber-800',
  urgent: 'bg-red-100 text-red-800',
}[p])

export function PlannerPage() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [projects, setProjects] = useState<Project[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [dashboard, setDashboard] = useState<PlannerDashboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Task>>({})

  // Focus timer (Pomodoro-style)
  const [secondsLeft, setSecondsLeft] = useState(25*60) // 25 min
  const [running, setRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [showNotification, setShowNotification] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!running) return
    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          // Timer finished
          setRunning(false)
          if (!isBreak) {
            // Work session completed
            setCompletedPomodoros(prev => prev + 1)
            setIsBreak(true)
            setSecondsLeft(5 * 60) // 5 min break
            setShowNotification(true)
            setTimeout(() => setShowNotification(false), 3000)
          } else {
            // Break completed
            setIsBreak(false)
            setSecondsLeft(25 * 60) // 25 min work
          }
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [running, isBreak])

  // Initialize Supabase and fetch tasks
  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        // Load sample data for now
        setDashboard(sampleDashboard)
        setProjects(sampleProjects)
        setGoals(sampleGoals)
        setHabits(sampleHabits)
        
        // Try to load real data if available
        try {
          if (supabase) {
            const { data: userData } = await supabase.auth.getUser()
            setUserId(userData?.user?.id || null)
            await fetchTasks()
          }
        } catch (error) {
          console.log('Using sample data - Supabase not available')
        }
      } catch (error) {
        console.error('Error loading planner data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  async function fetchTasks() {
    if (!isSupabaseEnabled || !supabase) return
    const { data } = await supabase
      .from('planner_tasks')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) {
      setTasks(data.map((r: any) => ({
        id: r.id,
        title: r.title,
        description: r.description || '',
        priority: r.priority,
        dueDate: r.due_date ? new Date(r.due_date).toISOString() : undefined,
        tags: r.tags || [],
        assignee: r.assignee || undefined,
        status: r.status,
        estimate: r.estimate || undefined,
        createdAt: r.created_at,
      })))
    }
  }

  const resetTimer = () => {
    setSecondsLeft(isBreak ? 5*60 : 25*60)
    setRunning(false)
  }
  const fmt = (s:number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  const handleSectionClick = (section: string) => {
    setActiveSection(section)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-blue-100 text-blue-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800'
      case 'inprogress': return 'bg-blue-100 text-blue-800'
      case 'review': return 'bg-yellow-100 text-yellow-800'
      case 'done': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const startEdit = (task: Task) => {
    setEditingTask(task.id)
    setEditForm({ ...task })
  }

  const saveEdit = () => {
    if (!editingTask || !editForm.title?.trim()) return
    const updatedTask = { ...editForm, title: editForm.title!.trim() } as Task
    setTasks(prev => prev.map(t => t.id === editingTask ? updatedTask : t))
    setEditingTask(null)
    setEditForm({})
    
    if (isSupabaseEnabled && supabase) {
      supabase.from('planner_tasks').update({
        title: updatedTask.title,
        description: updatedTask.description,
        priority: updatedTask.priority,
        due_date: updatedTask.dueDate ? new Date(updatedTask.dueDate).toISOString().slice(0,10) : null,
        tags: updatedTask.tags,
        assignee: updatedTask.assignee || null,
        status: updatedTask.status,
        estimate: updatedTask.estimate || null,
      }).eq('id', editingTask).then(() => fetchTasks())
    }
  }

  const cancelEdit = () => {
    setEditingTask(null)
    setEditForm({})
  }

  const boardColumns: { key: Status; title: string }[] = [
    { key: 'todo', title: 'To Do' },
    { key: 'inprogress', title: 'In Progress' },
    { key: 'review', title: 'Review' },
    { key: 'done', title: 'Done' },
  ]

  const move = (t: Task, dir: -1 | 1) => {
    const order: Status[] = ['todo','inprogress','review','done']
    const idx = order.indexOf(t.status)
    const next = order[Math.min(Math.max(idx + dir, 0), order.length-1)]
    setTasks(prev => prev.map(x => x.id===t.id ? { ...x, status: next } : x))
    if (isSupabaseEnabled && supabase) {
      supabase.from('planner_tasks').update({ status: next }).eq('id', t.id).then(()=>fetchTasks())
    }
  }

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return q ? tasks.filter(t => t.title.toLowerCase().includes(q) || t.tags.some(tag => tag.toLowerCase().includes(q))) : tasks
  }, [tasks, searchQuery])

  const today = useMemo(() => {
    const d = new Date()
    const dStr = d.toDateString()
    return tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === dStr)
  }, [tasks])

  const analytics = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter(t => t.status === 'done').length
    const inProgress = tasks.filter(t => t.status === 'inprogress').length
    const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length
    const priorityCounts = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1
      return acc
    }, {} as Record<Priority, number>)
    
    return {
      total,
      completed,
      inProgress,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      priorityCounts
    }
  }, [tasks])

  const createTask = () => {
    // TODO: Implement task creation in the new UI
    console.log('Create task functionality to be implemented')
  }

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    if (isSupabaseEnabled && supabase) {
      supabase.from('planner_tasks').delete().eq('id', id).then(()=>fetchTasks())
    }
  }

  const TaskCard = ({ task }: { task: Task }) => {
    const isEditing = editingTask === task.id
    
    return (
      <Card className={`p-3 ${isEditing ? 'ring-2 ring-primary' : ''}`}>
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Input
                value={editForm.title || ''}
                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                className="flex-1"
                placeholder="Task title"
              />
              <Button size="sm" onClick={saveEdit}><Save className="h-4 w-4"/></Button>
              <Button size="sm" variant="outline" onClick={cancelEdit}><X className="h-4 w-4"/></Button>
            </div>
            <Textarea
              value={editForm.description || ''}
              onChange={(e) => setEditForm({...editForm, description: e.target.value})}
              placeholder="Description"
              className="text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <Select value={editForm.priority || 'medium'} onValueChange={(v) => setEditForm({...editForm, priority: v as Priority})}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={editForm.dueDate ? new Date(editForm.dueDate).toISOString().slice(0,10) : ''}
                onChange={(e) => setEditForm({...editForm, dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined})}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={editForm.assignee || ''}
                onChange={(e) => setEditForm({...editForm, assignee: e.target.value})}
                placeholder="Assignee"
              />
              <Input
                value={editForm.tags?.join(', ') || ''}
                onChange={(e) => setEditForm({...editForm, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                placeholder="Tags (comma separated)"
              />
            </div>
          </div>
        ) : (
          <>
      <div className="flex items-start justify-between">
              <div className="flex-1">
          <div className="font-medium truncate max-w-[14rem]">{task.title}</div>
          {task.description && <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{task.description}</div>}
          <div className="flex items-center gap-2 mt-2">
            <Badge className={prioColor(task.priority)}><Flag className="h-3 w-3 mr-1"/>{task.priority}</Badge>
                  {task.dueDate && (
                    <span className={`text-xs flex items-center gap-1 ${
                      new Date(task.dueDate) < new Date() && task.status !== 'done' 
                        ? 'text-red-600' 
                        : 'text-muted-foreground'
                    }`}>
                      <CalendarIcon className="h-3 w-3"/>
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  {task.estimate && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3"/>
                      {task.estimate}h
                    </span>
                  )}
          </div>
          {task.tags.length>0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.tags.map(t => <Badge key={t} variant="outline" className="text-xs"><TagIcon className="h-3 w-3 mr-1"/>{t}</Badge>)}
            </div>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4"/></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => startEdit(task)}><Edit2 className="h-4 w-4 mr-2"/>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={()=>move(task, -1)}><ArrowLeft className="h-4 w-4 mr-2"/>Move left</DropdownMenuItem>
            <DropdownMenuItem onClick={()=>move(task, 1)}><ArrowRight className="h-4 w-4 mr-2"/>Move right</DropdownMenuItem>
            <DropdownMenuSeparator/>
            <DropdownMenuItem className="text-destructive" onClick={()=>removeTask(task.id)}><Trash2 className="h-4 w-4 mr-2"/>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {task.assignee && <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><User className="h-3 w-3"/>{task.assignee}</div>}
          </>
        )}
    </Card>
  )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex bg-background">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-card border-r border-border flex flex-col shadow-lg flex-shrink-0 relative z-10`}>
        <div className="flex-1 overflow-y-auto max-h-screen scrollbar-thin scrollbar-thumb-muted-foreground scrollbar-track-muted" style={{
          maxHeight: '100vh', 
          overflowY: 'auto', 
          scrollbarWidth: 'thin',
          scrollbarColor: 'hsl(var(--muted-foreground)) hsl(var(--muted))'
        }}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && <h2 className="text-lg font-semibold text-card-foreground">Planner</h2>}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-muted-foreground hover:text-card-foreground hover:bg-muted"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${sidebarCollapsed ? 'rotate-90' : ''}`} />
            </Button>
          </div>
        </div>
        
        <div className="p-4 space-y-2">
          {/* Dashboard */}
          <div className="space-y-1">
            <Button
              variant={activeSection === 'dashboard' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'dashboard' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('dashboard')}
            >
              <BarChart3 className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Dashboard</span>}
            </Button>
          </div>

          {/* Task Management */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Tasks</span>}
            </div>
            <Button
              variant={activeSection === 'tasks' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'tasks' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('tasks')}
            >
              <CheckSquare className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Tasks</span>}
            </Button>
            <Button
              variant={activeSection === 'kanban' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'kanban' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('kanban')}
            >
              <Target className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Kanban Board</span>}
            </Button>
            <Button
              variant={activeSection === 'today' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'today' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('today')}
            >
              <CalendarIcon className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Today</span>}
            </Button>
          </div>

          {/* Project Management */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Projects</span>}
            </div>
            <Button
              variant={activeSection === 'projects' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'projects' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('projects')}
            >
              <Folder className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Projects</span>}
            </Button>
            <Button
              variant={activeSection === 'timeline' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'timeline' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('timeline')}
            >
              <ClockIcon className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Timeline</span>}
            </Button>
          </div>

          {/* Goals & Habits */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Personal</span>}
            </div>
            <Button
              variant={activeSection === 'goals' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'goals' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('goals')}
            >
              <Target className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Goals</span>}
            </Button>
            <Button
              variant={activeSection === 'habits' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'habits' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('habits')}
            >
              <Zap className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Habits</span>}
            </Button>
          </div>

          {/* Time Management */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Time</span>}
            </div>
            <Button
              variant={activeSection === 'timer' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'timer' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('timer')}
            >
              <Timer className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Focus Timer</span>}
            </Button>
            <Button
              variant={activeSection === 'timetracking' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'timetracking' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('timetracking')}
            >
              <Clock className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Time Tracking</span>}
            </Button>
          </div>

          {/* Analytics & Reports */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Analytics</span>}
            </div>
            <Button
              variant={activeSection === 'analytics' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'analytics' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('analytics')}
            >
              <PieChart className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Analytics</span>}
            </Button>
            <Button
              variant={activeSection === 'reports' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'reports' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('reports')}
            >
              <FileSpreadsheet className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Reports</span>}
            </Button>
          </div>

          {/* Settings */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Settings</span>}
            </div>
            <Button
              variant={activeSection === 'settings' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'settings' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('settings')}
            >
              <Settings className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Settings</span>}
            </Button>
          </div>
        </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-foreground">Planner Dashboard</h1>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks, projects, goals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-80"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Quick Add
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {/* Notification */}
          {showNotification && (
            <div className="fixed top-20 right-4 z-50 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg flex items-center gap-2">
              <Bell className="h-4 w-4"/>
              <span>{isBreak ? 'Break time! Take a 5-minute rest.' : 'Work session complete! Great job!'}</span>
            </div>
          )}

          {activeSection === 'dashboard' && (
            <DashboardContent dashboard={dashboard} />
          )}
          {activeSection === 'tasks' && (
            <TasksContent tasks={tasks} />
          )}
          {activeSection === 'kanban' && (
            <KanbanContent tasks={tasks} />
          )}
          {activeSection === 'today' && (
            <TodayContent tasks={tasks} />
          )}
          {activeSection === 'projects' && (
            <ProjectsContent projects={projects} />
          )}
          {activeSection === 'goals' && (
            <GoalsContent goals={goals} />
          )}
          {activeSection === 'habits' && (
            <HabitsContent habits={habits} />
          )}
          {activeSection === 'timer' && (
            <TimerContent 
              secondsLeft={secondsLeft}
              running={running}
              isBreak={isBreak}
              completedPomodoros={completedPomodoros}
              onStart={() => setRunning(true)}
              onPause={() => setRunning(false)}
              onReset={resetTimer}
            />
          )}
          {activeSection === 'analytics' && (
            <AnalyticsContent dashboard={dashboard} />
          )}
        </div>
      </div>
    </div>
  )
}

// Content Components
const DashboardContent = ({ dashboard }: { dashboard: PlannerDashboard | null }) => {
  if (!dashboard) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Productivity Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{dashboard.productivityScore}%</div>
            <p className="text-xs text-muted-foreground">
              +{dashboard.weeklyProgress}% this week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Tasks Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{dashboard.completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {dashboard.completionRate}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Focus Time</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{dashboard.focusTime}h</div>
            <p className="text-xs text-muted-foreground">
              {dashboard.completedPomodoros} pomodoros completed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Active Projects</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{dashboard.activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              {dashboard.totalProjects} total projects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Weekly Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Progress chart placeholder
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Insights & Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.insights.map((insight, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-card-foreground">{insight}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Goals Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-card-foreground">{dashboard.achievedGoals}/{dashboard.totalGoals}</div>
            <p className="text-sm text-muted-foreground">Goals achieved</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Habits Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-card-foreground">{dashboard.activeHabits}</div>
            <p className="text-sm text-muted-foreground">Active habits</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Team Collaboration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-card-foreground">{dashboard.teamCollaboration}%</div>
            <p className="text-sm text-muted-foreground">Collaboration score</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const TasksContent = ({ tasks }: { tasks: Task[] }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-foreground">All Tasks ({tasks.length})</h2>
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        New Task
      </Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <Card key={task.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-card-foreground">{task.title}</h3>
              {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
              <div className="flex items-center space-x-2 mt-2">
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
                <Badge className={getStatusColor(task.status)}>
                  {task.status}
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
)

const KanbanContent = ({ tasks }: { tasks: Task[] }) => {
  const boardColumns: { key: Status; title: string }[] = [
    { key: 'todo', title: 'To Do' },
    { key: 'inprogress', title: 'In Progress' },
    { key: 'review', title: 'Review' },
    { key: 'done', title: 'Done' },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Kanban Board</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {boardColumns.map(col => (
          <Card key={col.key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-card-foreground">{col.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.filter(t => t.status === col.key).map(t => (
                  <Card key={t.id} className="p-3">
                    <div className="font-medium text-card-foreground">{t.title}</div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={getPriorityColor(t.priority)}>
                        {t.priority}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

const TodayContent = ({ tasks }: { tasks: Task[] }) => {
  const today = tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString())
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Today's Tasks ({today.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {today.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground py-8">
            No tasks due today
          </div>
        ) : (
          today.map(task => (
            <Card key={task.id} className="p-4">
              <div className="font-medium text-card-foreground">{task.title}</div>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

const ProjectsContent = ({ projects }: { projects: Project[] }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-foreground">Projects ({projects.length})</h2>
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        New Project
      </Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <Card key={project.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-card-foreground">{project.name}</h3>
              {project.description && <p className="text-sm text-muted-foreground mt-1">{project.description}</p>}
              <div className="mt-3">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
)

const GoalsContent = ({ goals }: { goals: Goal[] }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-foreground">Goals ({goals.length})</h2>
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        New Goal
      </Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {goals.map((goal) => (
        <Card key={goal.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-card-foreground">{goal.title}</h3>
              {goal.description && <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>}
              <div className="mt-3">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{goal.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
)

const HabitsContent = ({ habits }: { habits: Habit[] }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-foreground">Habits ({habits.length})</h2>
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        New Habit
      </Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {habits.map((habit) => (
        <Card key={habit.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-card-foreground">{habit.name}</h3>
              {habit.description && <p className="text-sm text-muted-foreground mt-1">{habit.description}</p>}
              <div className="mt-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Streak: {habit.streak} days</span>
                  <span>{habit.currentCount}/{habit.targetCount}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
)

const TimerContent = ({ 
  secondsLeft, 
  running, 
  isBreak, 
  completedPomodoros, 
  onStart, 
  onPause, 
  onReset 
}: {
  secondsLeft: number
  running: boolean
  isBreak: boolean
  completedPomodoros: number
  onStart: () => void
  onPause: () => void
  onReset: () => void
}) => {
  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Focus Timer</h2>
      
      <div className="max-w-md mx-auto">
        <Card className={isBreak ? 'bg-orange-50 border-orange-200' : 'bg-card border-border'}>
          <CardHeader className="text-center">
            <CardTitle className="text-lg flex items-center justify-center gap-2">
              {isBreak ? <Coffee className="h-5 w-5"/> : <Timer className="h-5 w-5"/>}
              {isBreak ? 'Break Time' : 'Focus Time'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-6xl font-bold text-card-foreground mb-4">{fmt(secondsLeft)}</div>
            <div className="flex items-center justify-center gap-2 mb-4">
              {!running ? (
                <Button size="lg" onClick={onStart}>
                  <Play className="h-4 w-4 mr-2"/>
                  Start
                </Button>
              ) : (
                <Button size="lg" variant="outline" onClick={onPause}>
                  <Pause className="h-4 w-4 mr-2"/>
                  Pause
                </Button>
              )}
              <Button size="lg" variant="outline" onClick={onReset}>
                <RefreshCw className="h-4 w-4 mr-2"/>
                Reset
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Completed: {completedPomodoros} pomodoros
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const AnalyticsContent = ({ dashboard }: { dashboard: PlannerDashboard | null }) => {
  if (!dashboard) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Productivity Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Productivity chart placeholder
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Time Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Time distribution chart placeholder
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Goal Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Goal progress chart placeholder
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Habit Streaks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Habit streaks chart placeholder
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


