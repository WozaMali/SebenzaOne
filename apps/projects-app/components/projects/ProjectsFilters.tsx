import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ProjectFilters } from './ProjectsListPage'

interface ProjectsFiltersProps {
  filters: ProjectFilters
  onChange: (filters: Partial<ProjectFilters>) => void
}

export function ProjectsFilters({ filters, onChange }: ProjectsFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Search projects..."
            value={filters.search || ''}
            onChange={(e) => onChange({ search: e.target.value || undefined })}
            className="pl-8"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => onChange({ status: value === 'all' ? undefined : value })}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="ON_HOLD">On Hold</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="from">Start Date From</Label>
        <Input
          id="from"
          type="date"
          value={filters.from || ''}
          onChange={(e) => onChange({ from: e.target.value || undefined })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="to">End Date To</Label>
        <Input
          id="to"
          type="date"
          value={filters.to || ''}
          onChange={(e) => onChange({ to: e.target.value || undefined })}
        />
      </div>
    </div>
  )
}
