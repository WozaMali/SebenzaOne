"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Search, Filter, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  searchPlaceholder?: string
}

export interface SearchFilters {
  query: string
  dateFrom?: string
  dateTo?: string
  category?: string
  status?: string
  minAmount?: number
  maxAmount?: number
}

export function AdvancedSearch({ onSearch, searchPlaceholder = "Search..." }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    dateFrom: '',
    dateTo: '',
    category: '',
    status: '',
    minAmount: undefined,
    maxAmount: undefined
  })
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSearch = () => {
    onSearch(filters)
  }

  const handleReset = () => {
    const emptyFilters: SearchFilters = {
      query: '',
      dateFrom: '',
      dateTo: '',
      category: '',
      status: '',
      minAmount: undefined,
      maxAmount: undefined
    }
    setFilters(emptyFilters)
    onSearch(emptyFilters)
  }

  const activeFiltersCount = Object.values(filters).filter(v => 
    v !== '' && v !== undefined && v !== null
  ).length - 1 // Subtract 1 for query which is always there

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Search & Filter</CardTitle>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount} active</Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showAdvanced ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Search */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
          {activeFiltersCount > 0 && (
            <Button variant="outline" onClick={handleReset}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-4 border-t">
            <div>
              <Label>Date From</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div>
              <Label>Date To</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Input
                placeholder="Category"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Min Amount (R)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={filters.minAmount || ''}
                onChange={(e) => setFilters({ ...filters, minAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </div>
            <div>
              <Label>Max Amount (R)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={filters.maxAmount || ''}
                onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
