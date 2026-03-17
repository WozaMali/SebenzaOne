'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  MapPin, 
  Truck, 
  Route as RouteIcon,
  Navigation,
  Fuel,
  Clock,
  CheckCircle,
  PlayCircle,
  Plus,
  Search,
  Download,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { recyclingService } from '@/lib/recycling-service'
import { Route } from '@/types/recycling'
import { format } from 'date-fns'

export function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'planned' | 'in_progress' | 'completed' | 'cancelled'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  useEffect(() => {
    const loaded = recyclingService.getRoutes()
    setRoutes(loaded)
  }, [])

  const filteredRoutes = useMemo(() => {
    let filtered = routes

    // Filter by date
    const dateStr = selectedDate.toISOString().split('T')[0]
    filtered = filtered.filter(r => {
      const routeDate = r.date.toISOString().split('T')[0]
      return routeDate === dateStr
    })

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(query) ||
        r.driverId?.toLowerCase().includes(query) ||
        r.vehicleId?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [routes, selectedDate, statusFilter, searchQuery])

  const getStatusColor = (status: Route['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'planned': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalCollections = filteredRoutes.reduce((sum, r) => sum + r.collections.length, 0)
  const totalDistance = filteredRoutes.reduce((sum, r) => sum + (r.actualDistance || r.estimatedDistance || 0), 0)
  const totalFuelCost = filteredRoutes.reduce((sum, r) => sum + (r.actualFuelCost || r.estimatedFuelCost || 0), 0)
  const completedRoutes = filteredRoutes.filter(r => r.status === 'completed').length

  const averageEfficiency = filteredRoutes.length > 0
    ? filteredRoutes.reduce((sum, r) => {
        if (r.actualDuration && r.collections.length > 0) {
          return sum + (r.collections.length / (r.actualDuration / 60)) // collections per hour
        }
        return sum
      }, 0) / filteredRoutes.length
    : 0

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Work Orders & Inspections</h1>
          <p className="text-muted-foreground mt-1">
            Manage work orders, inspections, and maintenance scheduling
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Route
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Routes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredRoutes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {format(selectedDate, 'MMM dd, yyyy')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Collections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCollections}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Scheduled pickups
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Distance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDistance.toFixed(1)} km</div>
            <p className="text-xs text-muted-foreground mt-1">
              Estimated fuel cost: R {totalFuelCost.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageEfficiency.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Collections per hour
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Routes List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Routes</CardTitle>
                  <CardDescription>Collection routes for selected date</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search routes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredRoutes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <RouteIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No routes found for {format(selectedDate, 'MMM dd, yyyy')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredRoutes.map((route) => (
                    <Card
                      key={route.id}
                      className={`hover:bg-muted/50 transition-colors cursor-pointer ${
                        selectedRoute?.id === route.id ? 'border-primary' : ''
                      }`}
                      onClick={() => setSelectedRoute(route)}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <RouteIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">{route.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {route.collections.length} collections
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {route.actualDistance || route.estimatedDistance} km
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {route.actualDuration || route.estimatedDuration} min
                              </p>
                            </div>
                            <Badge className={getStatusColor(route.status)}>
                              {route.status}
                            </Badge>
                          </div>
                        </div>
                        {route.driverId && (
                          <div className="mt-3 pt-3 border-t flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4" />
                              <span>Driver: {route.driverId}</span>
                            </div>
                            {route.vehicleId && (
                              <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                <span>Vehicle: {route.vehicleId}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Route Detail & Date Selector */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
              <CardDescription>Choose a date to view routes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="w-full"
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelectedDate(new Date())}
              >
                Today
              </Button>
            </CardContent>
          </Card>

          {selectedRoute && (
            <Card>
              <CardHeader>
                <CardTitle>Route Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold text-lg">{selectedRoute.name}</p>
                  <Badge className={getStatusColor(selectedRoute.status)}>
                    {selectedRoute.status}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Collections</p>
                    <p className="font-semibold">{selectedRoute.collections.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Distance</p>
                    <p className="font-semibold">
                      {selectedRoute.actualDistance || selectedRoute.estimatedDistance} km
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-semibold">
                      {selectedRoute.actualDuration || selectedRoute.estimatedDuration} minutes
                    </p>
                  </div>
                  {selectedRoute.actualFuelCost && (
                    <div>
                      <p className="text-sm text-muted-foreground">Fuel Cost</p>
                      <p className="font-semibold">R {selectedRoute.actualFuelCost.toFixed(2)}</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Route Stops</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedRoute.collections.map((collection, index) => (
                      <div key={collection.id} className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {collection.customer?.businessName || 
                             `${collection.customer?.firstName || ''} ${collection.customer?.lastName || ''}`.trim() ||
                             'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {collection.customer?.address?.city || 'N/A'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full">
                    <Navigation className="h-4 w-4 mr-2" />
                    View on Map
                  </Button>
                  {selectedRoute.status === 'planned' && (
                    <Button className="w-full mt-2">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Start Route
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
