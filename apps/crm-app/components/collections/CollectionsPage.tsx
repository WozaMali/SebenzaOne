'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Calendar as CalendarIcon, 
  Truck, 
  MapPin, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle,
  Plus,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { recyclingService } from '@/lib/recycling-service'
import { CollectionSchedule, CollectionStatus, MaterialType, MATERIAL_LABELS } from '@/types/recycling'
import { format } from 'date-fns'

export function CollectionsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [statusFilter, setStatusFilter] = useState<CollectionStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [collections, setCollections] = useState<CollectionSchedule[]>([])

  // Load collections
  useEffect(() => {
    const loaded = recyclingService.getCollections()
    setCollections(loaded)
  }, [])

  const handleDateChange = (days: number) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + days)
    setSelectedDate(newDate)
  }

  const filteredCollections = useMemo(() => {
    let filtered = collections.filter(c => {
      const collectionDate = c.scheduledDate.toISOString().split('T')[0]
      const selectedDateStr = selectedDate.toISOString().split('T')[0]
      return collectionDate === selectedDateStr
    })

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c => 
        c.customer?.businessName?.toLowerCase().includes(query) ||
        c.customer?.firstName?.toLowerCase().includes(query) ||
        c.customer?.lastName?.toLowerCase().includes(query) ||
        c.customer?.email?.toLowerCase().includes(query)
      )
    }

    return filtered.sort((a, b) => 
      a.scheduledTime.localeCompare(b.scheduledTime)
    )
  }, [collections, selectedDate, statusFilter, searchQuery])

  const getStatusColor = (status: CollectionStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'scheduled': return 'bg-gray-100 text-gray-800'
      case 'missed': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-600'
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMaterialBadgeColor = (material: MaterialType) => {
    const colors: Record<MaterialType, string> = {
      aluminium_cans: 'bg-slate-200 text-slate-800',
      cardboard: 'bg-orange-100 text-orange-800',
      glass: 'bg-green-100 text-green-800',
      glass_bottles: 'bg-teal-100 text-teal-800',
      hdpe_containers: 'bg-blue-100 text-blue-800',
      paper: 'bg-yellow-100 text-yellow-800',
      pet_bottles: 'bg-cyan-100 text-cyan-800'
    }
    return colors[material] || 'bg-gray-100 text-gray-800'
  }

  const totalWeight = filteredCollections.reduce((sum, c) => 
    sum + (c.totalWeight || 0), 0
  )

  const completedCount = filteredCollections.filter(c => c.status === 'completed').length
  const scheduledCount = filteredCollections.filter(c => c.status === 'scheduled').length

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Collections & Scheduling</h1>
          <p className="text-muted-foreground mt-1">
            Manage pickup schedules and track collection status
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Collection
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Collections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredCollections.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {format(selectedDate, 'MMM dd, yyyy')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredCollections.length > 0 
                ? Math.round((completedCount / filteredCollections.length) * 100) 
                : 0}% completion rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{scheduledCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending pickups</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Weight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWeight.toLocaleString()} kg</div>
            <p className="text-xs text-muted-foreground mt-1">Material collected</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Collection Schedule</CardTitle>
            <CardDescription>View and manage collections for selected date</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
                <Filter className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="missed">Missed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="rescheduled">Rescheduled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Materials</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCollections.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No collections scheduled for {format(selectedDate, 'MMM dd, yyyy')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCollections.map((collection) => (
                      <TableRow key={collection.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {collection.scheduledTime}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {collection.customer?.businessName || 
                               `${collection.customer?.firstName || ''} ${collection.customer?.lastName || ''}`.trim() ||
                               'Unknown Customer'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {collection.customer?.customerType}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {collection.customer?.address?.city || 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {collection.materials.slice(0, 3).map((material) => (
                              <Badge 
                                key={material.id} 
                                className={getMaterialBadgeColor(material.materialType)}
                              >
                                {MATERIAL_LABELS[material.materialType] ?? material.materialType}
                              </Badge>
                            ))}
                            {collection.materials.length > 3 && (
                              <Badge variant="outline">
                                +{collection.materials.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {collection.totalWeight ? (
                            <span className="font-medium">{collection.totalWeight} kg</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(collection.status)}>
                            {collection.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
            <CardDescription>Choose a date to view collections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDateChange(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-center">
                <p className="text-lg font-semibold">
                  {format(selectedDate, 'MMM dd, yyyy')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(selectedDate, 'EEEE')}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDateChange(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setSelectedDate(new Date())}
              >
                Today
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  const tomorrow = new Date()
                  tomorrow.setDate(tomorrow.getDate() + 1)
                  setSelectedDate(tomorrow)
                }}
              >
                Tomorrow
              </Button>
              <Input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
