"use client"

import { useState } from "react"
import { Search, X, Plus, Calendar, User, FileText, Tag, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { SearchQuery, SearchOperator } from "@/types/mail"

interface AdvancedSearchProps {
  onSearch: (query: SearchQuery) => void
  onClear: () => void
  savedSearches?: Array<{ id: string; name: string; query: SearchQuery }>
  onSaveSearch?: (name: string, query: SearchQuery) => void
  onFilter?: (filters: { unreadOnly: boolean; hasAttachments: boolean; important: boolean; starred: boolean }) => void
  onSort?: (sortBy: string) => void
}

const searchFields = [
  { value: "from", label: "From", icon: User },
  { value: "to", label: "To", icon: User },
  { value: "subject", label: "Subject", icon: FileText },
  { value: "body", label: "Body", icon: FileText },
  { value: "hasAttachment", label: "Has Attachment", icon: FileText },
  { value: "labels", label: "Labels", icon: Tag },
  { value: "dateFrom", label: "Date From", icon: Calendar },
  { value: "dateTo", label: "Date To", icon: Calendar },
  { value: "sizeFrom", label: "Size From", icon: FileText },
  { value: "sizeTo", label: "Size To", icon: FileText },
]

const searchOperators = [
  { value: "contains", label: "contains" },
  { value: "equals", label: "equals" },
  { value: "startsWith", label: "starts with" },
  { value: "endsWith", label: "ends with" },
  { value: "regex", label: "matches regex" },
  { value: "has", label: "has" },
  { value: "before", label: "before" },
  { value: "after", label: "after" },
  { value: "between", label: "between" },
]

export function AdvancedSearch({ onSearch, onClear, savedSearches = [], onSaveSearch, onFilter, onSort }: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    unreadOnly: false,
    hasAttachments: false,
    important: false,
    starred: false
  })
  const [sortBy, setSortBy] = useState("date-desc")
  const [operators, setOperators] = useState<SearchOperator[]>([])
  const [searchName, setSearchName] = useState("")
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  const addOperator = () => {
    setOperators(prev => [...prev, {
      field: "from",
      operator: "contains",
      value: "",
      logic: "AND"
    }])
  }

  const updateOperator = (index: number, updates: Partial<SearchOperator>) => {
    setOperators(prev => prev.map((op, i) => i === index ? { ...op, ...updates } : op))
  }

  const removeOperator = (index: number) => {
    setOperators(prev => prev.filter((_, i) => i !== index))
  }

  const handleSearch = () => {
    const query: SearchQuery = {
      query: "",
      operators: operators.filter(op => op.value !== ""),
    }
    onSearch(query)
    setIsOpen(false)
  }

  const handleSaveSearch = () => {
    if (searchName && onSaveSearch) {
      const query: SearchQuery = {
        query: "",
        operators: operators.filter(op => op.value !== ""),
      }
      onSaveSearch(searchName, query)
      setSearchName("")
      setShowSaveDialog(false)
    }
  }

  const loadSavedSearch = (query: SearchQuery) => {
    setOperators(query.operators || [])
    onSearch(query)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            <Search className="h-4 w-4 mr-2" />
            Advanced Search
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Advanced Search</h4>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Saved Searches */}
            {savedSearches.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Saved Searches</Label>
                <div className="space-y-1 mt-2">
                  {savedSearches.map((search) => (
                    <div
                      key={search.id}
                      className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                      onClick={() => loadSavedSearch(search.query)}
                    >
                      <span className="text-sm">{search.name}</span>
                      <Button variant="ghost" size="sm">
                        Load
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Operators */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Search Criteria</Label>
                <Button variant="ghost" size="sm" onClick={addOperator}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              
              <div className="space-y-3">
                {operators.map((operator, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                    <Select
                      value={operator.field}
                      onValueChange={(value) => updateOperator(index, { field: value })}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {searchFields.map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            <div className="flex items-center gap-2">
                              <field.icon className="h-3 w-3" />
                              {field.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={operator.operator}
                      onValueChange={(value) => updateOperator(index, { operator: value as any })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {searchOperators.map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="Value"
                      value={operator.value as string}
                      onChange={(e) => updateOperator(index, { value: e.target.value })}
                      className="flex-1"
                    />

                    {index > 0 && (
                      <Select
                        value={operator.logic || "AND"}
                        onValueChange={(value) => updateOperator(index, { logic: value as "AND" | "OR" | "NOT" })}
                      >
                        <SelectTrigger className="w-16">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AND">AND</SelectItem>
                          <SelectItem value="OR">OR</SelectItem>
                          <SelectItem value="NOT">NOT</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOperator(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Filter Controls */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Filter</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="unread-only"
                    checked={filters.unreadOnly}
                    onCheckedChange={(checked) => {
                      const newFilters = { ...filters, unreadOnly: checked as boolean }
                      setFilters(newFilters)
                      onFilter?.(newFilters)
                    }}
                  />
                  <Label htmlFor="unread-only" className="text-sm">Unread only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="has-attachments"
                    checked={filters.hasAttachments}
                    onCheckedChange={(checked) => {
                      const newFilters = { ...filters, hasAttachments: checked as boolean }
                      setFilters(newFilters)
                      onFilter?.(newFilters)
                    }}
                  />
                  <Label htmlFor="has-attachments" className="text-sm">Has attachments</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="important"
                    checked={filters.important}
                    onCheckedChange={(checked) => {
                      const newFilters = { ...filters, important: checked as boolean }
                      setFilters(newFilters)
                      onFilter?.(newFilters)
                    }}
                  />
                  <Label htmlFor="important" className="text-sm">Important</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="starred"
                    checked={filters.starred}
                    onCheckedChange={(checked) => {
                      const newFilters = { ...filters, starred: checked as boolean }
                      setFilters(newFilters)
                      onFilter?.(newFilters)
                    }}
                  />
                  <Label htmlFor="starred" className="text-sm">Starred</Label>
                </div>
              </div>
            </div>

            {/* Sort Controls */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Sort by Date</Label>
              <Select
                value={sortBy}
                onValueChange={(value) => {
                  setSortBy(value)
                  onSort?.(value)
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Date (newest first)</SelectItem>
                  <SelectItem value="date-asc">Date (oldest first)</SelectItem>
                  <SelectItem value="from-asc">From (A-Z)</SelectItem>
                  <SelectItem value="from-desc">From (Z-A)</SelectItem>
                  <SelectItem value="subject-asc">Subject (A-Z)</SelectItem>
                  <SelectItem value="subject-desc">Subject (Z-A)</SelectItem>
                  <SelectItem value="size-desc">Size (largest first)</SelectItem>
                  <SelectItem value="size-asc">Size (smallest first)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onClear}>
                  Clear
                </Button>
                {operators.length > 0 && (
                  <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)}>
                    Save Search
                  </Button>
                )}
              </div>
              <Button size="sm" onClick={handleSearch}>
                Search
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Save Search Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Save Search</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="search-name">Search Name</Label>
                <Input
                  id="search-name"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Enter search name"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveSearch} disabled={!searchName}>
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
