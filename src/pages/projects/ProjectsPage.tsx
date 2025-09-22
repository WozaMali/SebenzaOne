import { useState } from "react"
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
    color: "bg-slate-100",
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
    color: "bg-blue-100",
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
    color: "bg-amber-100",
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
    color: "bg-green-100",
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

  const TaskCard = ({ task }: { task: Task }) => (
    <div className="enterprise-card p-4 mb-3 bg-white">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm">{task.title}</h4>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="dropdown-3d">
            <DropdownMenuItem>Edit Task</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
        {task.description}
      </p>
      
      <div className="flex flex-wrap gap-1 mb-3">
        {task.labels.map((label) => (
          <Badge key={label} variant="secondary" className="text-xs">
            {label}
          </Badge>
        ))}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">
              {task.assignee.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{task.assignee}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {task.dueDate}
          </div>
          <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      {/* Project Header */}
      <div className="enterprise-card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">Website Redesign Project</h1>
            <p className="text-muted-foreground">Complete redesign of company website with modern UI/UX</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-green-100 text-green-800">Active</Badge>
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
      <div className="flex-1 flex gap-6 overflow-x-auto pb-6">
        {columns.map((column) => (
          <div key={column.id} className="w-80 flex-shrink-0">
            <div className={`${column.color} rounded-lg p-3 mb-4`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{column.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {column.tasks.length}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              {column.tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              
              <Button 
                variant="outline" 
                className="w-full border-dashed hover:bg-muted/50"
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
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Column
          </Button>
        </div>
      </div>
    </div>
  )
}