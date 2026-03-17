'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Package, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Search,
  Download,
  Plus,
  Filter,
  BarChart3,
  Warehouse,
  FileText
} from 'lucide-react'
import { recyclingService } from '@/lib/recycling-service'
import { MaterialInventory, MaterialType, MATERIAL_LABELS } from '@/types/recycling'

export function MaterialsInventoryPage() {
  const [inventory, setInventory] = useState<MaterialInventory[]>([])
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('inventory')

  useEffect(() => {
    const loaded = recyclingService.getInventory()
    setInventory(loaded)
  }, [])

  const filteredInventory = useMemo(() => {
    let filtered = inventory

    if (selectedMaterial !== 'all') {
      filtered = filtered.filter(i => i.materialType === selectedMaterial)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(i =>
        i.materialType.toLowerCase().includes(query) ||
        i.location.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [inventory, selectedMaterial, searchQuery])

  const getMaterialColor = (material: MaterialType) => {
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

  const totalStock = filteredInventory.reduce((sum, i) => sum + i.currentStock, 0)
  const totalValue = filteredInventory.reduce((sum, i) => sum + (i.totalValue || 0), 0)
  const lowStockItems = filteredInventory.filter(i => i.availableStock < 100) // Less than 100kg

  // Material type statistics
  const materialStats = useMemo(() => {
    const stats: Record<MaterialType, { total: number; locations: number; value: number }> = {} as any
    
    filteredInventory.forEach(item => {
      if (!stats[item.materialType]) {
        stats[item.materialType] = { total: 0, locations: 0, value: 0 }
      }
      stats[item.materialType].total += item.currentStock
      stats[item.materialType].locations += 1
      stats[item.materialType].value += item.totalValue || 0
    })
    
    return stats
  }, [filteredInventory])

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Maintenance & Facilities</h1>
          <p className="text-muted-foreground mt-1">
            Manage maintenance work, facilities, and property services
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Material
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock.toLocaleString()} kg</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all materials
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R {totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Inventory value
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Material Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(materialStats).length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Different materials tracked
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Items below threshold
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="materials">Material Breakdown</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Records</TabsTrigger>
        </TabsList>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Material Inventory</CardTitle>
                  <CardDescription>Current stock levels by material type and location</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search materials..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Select value={selectedMaterial} onValueChange={(v) => setSelectedMaterial(v as any)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Material Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Materials</SelectItem>
                      <SelectItem value="aluminium_cans">Aluminium Cans</SelectItem>
                      <SelectItem value="cardboard">Cardboard</SelectItem>
                      <SelectItem value="glass">Glass</SelectItem>
                      <SelectItem value="glass_bottles">Glass Bottles</SelectItem>
                      <SelectItem value="hdpe_containers">HDPE Containers</SelectItem>
                      <SelectItem value="paper">Paper</SelectItem>
                      <SelectItem value="pet_bottles">PET Bottles</SelectItem>
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
              {filteredInventory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No inventory records found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Quality</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Badge className={getMaterialColor(item.materialType)}>
                            {MATERIAL_LABELS[item.materialType] ?? item.materialType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Warehouse className="h-4 w-4 text-muted-foreground" />
                            {item.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{item.currentStock.toLocaleString()} kg</span>
                        </TableCell>
                        <TableCell>
                          <span className={item.availableStock < 100 ? 'text-orange-600 font-medium' : ''}>
                            {item.availableStock.toLocaleString()} kg
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            Grade {item.averageQuality}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.totalValue ? (
                            <span className="font-medium">R {item.totalValue.toLocaleString()}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.availableStock < 100 ? (
                            <Badge className="bg-orange-100 text-orange-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Low Stock
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              In Stock
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Material Breakdown Tab */}
        <TabsContent value="materials" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(materialStats).map(([material, stats]) => (
              <Card key={material}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge className={getMaterialColor(material as MaterialType)}>
                      {MATERIAL_LABELS[material as MaterialType] ?? material}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Stock</span>
                    <span className="font-semibold">{stats.total.toLocaleString()} kg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Locations</span>
                    <span className="font-semibold">{stats.locations}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Value</span>
                    <span className="font-semibold">R {stats.value.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${(stats.total / totalStock) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {((stats.total / totalStock) * 100).toFixed(1)}% of total inventory
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Compliance Records Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Records</CardTitle>
              <CardDescription>Track regulatory compliance for material handling</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Compliance records will be displayed here</p>
                <Button variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Compliance Record
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
