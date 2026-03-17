import { MoreHorizontal, Eye, Edit, Archive, Trash2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { Project } from './ProjectsListPage'

interface ProjectsTableProps {
  projects: Project[]
  loading: boolean
  onDelete: (id: string) => void
  onArchive: (id: string) => void
  onProjectClick?: (project: Project) => void
  onView?: (project: Project) => void
  onEdit?: (project: Project) => void
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    ACTIVE: 'bg-green-500/15 text-green-600 border-green-500/20',
    ON_HOLD: 'bg-yellow-500/15 text-yellow-600 border-yellow-500/20',
    ARCHIVED: 'bg-gray-500/15 text-gray-600 border-gray-500/20',
  }
  
  return (
    <Badge className={variants[status] || variants.ARCHIVED}>
      {status.replace('_', ' ')}
    </Badge>
  )
}

function formatDate(date: string | null): string {
  if (!date) return '-'
  try {
    return new Date(date).toLocaleDateString()
  } catch {
    return date
  }
}

export function ProjectsTable({ projects, loading, onDelete, onArchive, onProjectClick, onView, onEdit }: ProjectsTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No projects found. Create your first project to get started.
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Project Name</TableHead>
            <TableHead className="text-center">% Complete</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Tasks</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow 
              key={project.id}
              className={onProjectClick ? "cursor-pointer hover:bg-muted/50" : ""}
              onClick={() => onProjectClick?.(project)}
            >
              <TableCell className="font-mono text-sm">{project.id.length > 4 ? project.id.substring(0, 4).toUpperCase() : project.id.toUpperCase()}</TableCell>
              <TableCell className="font-medium">{project.name}</TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-medium">{project.percent}%</span>
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${project.percent}%` }}
                    />
                  </div>
                </div>
              </TableCell>
              <TableCell>{project.owner.name}</TableCell>
              <TableCell>
                <StatusBadge status={project.status} />
              </TableCell>
              <TableCell className="text-center text-sm">
                {project.tasks.done} / {project.tasks.total}
              </TableCell>
              <TableCell>{formatDate(project.startDate)}</TableCell>
              <TableCell>{formatDate(project.endDate)}</TableCell>
              <TableCell 
                className="text-right"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView?.(project)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit?.(project)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    {project.status !== 'ARCHIVED' && (
                      <DropdownMenuItem onClick={() => onArchive(project.id)}>
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDelete(project.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
