'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown,
  Leaf,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Calendar,
  Package,
  DollarSign,
  Users,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { recyclingService } from '@/lib/recycling-service'
import { OperationalKPI, EnvironmentalImpact, MaterialType, MATERIAL_LABELS } from '@/types/recycling'
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns'

export function RecyclingAnalyticsPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  const [kpis, setKPIs] = useState<OperationalKPI | null>(null)
  const [impacts, setImpacts] = useState<EnvironmentalImpact[]>([])
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const dateRange = getDateRange(period)
    const kpiData = recyclingService.getKPIs(dateRange)
    setKPIs(kpiData)
    
    const impactData = recyclingService.getEnvironmentalImpacts()
    setImpacts(impactData)
  }, [period])

  const getDateRange = (periodType: 'week' | 'month' | 'quarter' | 'year') => {
    const end = new Date()
    let start: Date

    switch (periodType) {
      case 'week':
        start = subDays(end, 7)
        break
      case 'month':
        start = startOfMonth(end)
        break
      case 'quarter':
        start = subMonths(end, 3)
        break
      case 'year':
        start = subMonths(end, 12)
        break
      default:
        start = startOfMonth(end)
    }

    return { start, end }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-ZA').format(num)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground mt-1">
            Property performance, operational KPIs, and financial reports for Co-Ops, Buildings & Malls
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="environmental">Property Performance</TabsTrigger>
          <TabsTrigger value="operational">Operational KPIs</TabsTrigger>
          <TabsTrigger value="regulatory">Financial Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Occupancy Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kpis ? ((kpis.totalMaterialCollected / 1000) * 10).toFixed(1) : '0'}%
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-600">+12% vs last period</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kpis ? formatCurrency(kpis.revenue) : 'R 0'}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-600">+8% vs last period</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Rent Collection Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kpis ? kpis.onTimeRate.toFixed(1) : '0'}%
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-muted-foreground">
                    {kpis ? kpis.completedCollections : 0} units collected
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tenant Satisfaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kpis ? kpis.customerSatisfaction.toFixed(1) : '0'}/5
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-muted-foreground">Average rating</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Unit Type Breakdown */}
          {kpis && (
            <Card>
              <CardHeader>
                <CardTitle>Property Unit Breakdown</CardTitle>
                <CardDescription>Units by type (Residential, Commercial, Retail, etc.)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(kpis.materialByType).map(([material, weight]) => (
                    <div key={material}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{MATERIAL_LABELS[material as MaterialType] ?? material}</span>
                        <span className="text-sm font-semibold">{formatNumber(weight)} kg</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ 
                            width: `${(weight / kpis.totalMaterialCollected) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Environmental Impact Tab */}
        <TabsContent value="environmental" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-green-600" />
                  Waste Diverted
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {impacts.length > 0 
                    ? formatNumber(impacts.reduce((sum, i) => sum + i.totalWasteDiverted, 0))
                    : '0'} kg
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  From landfills
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  CO₂ Saved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {impacts.length > 0 
                    ? formatNumber(impacts.reduce((sum, i) => sum + i.co2EquivalentSaved, 0))
                    : '0'} kg
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  CO₂ equivalent
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Energy Saved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {impacts.length > 0 
                    ? formatNumber(impacts.reduce((sum, i) => sum + i.energySaved, 0))
                    : '0'} kWh
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Energy equivalent
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Water Saved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {impacts.length > 0 
                    ? formatNumber(impacts.reduce((sum, i) => sum + i.waterSaved, 0))
                    : '0'} L
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Water equivalent
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Environmental Impact Report</CardTitle>
              <CardDescription>Detailed breakdown of environmental benefits</CardDescription>
            </CardHeader>
            <CardContent>
              {impacts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Leaf className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No environmental impact data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {impacts.map((impact) => (
                    <Card key={impact.id}>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Period</p>
                            <p className="font-medium">
                              {format(impact.period.start, 'MMM dd')} - {format(impact.period.end, 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Waste Diverted</p>
                            <p className="font-medium">{formatNumber(impact.totalWasteDiverted)} kg</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">CO₂ Saved</p>
                            <p className="font-medium">{formatNumber(impact.co2EquivalentSaved)} kg</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Energy Saved</p>
                            <p className="font-medium">{formatNumber(impact.energySaved)} kWh</p>
                          </div>
                        </div>
                        {impact.certificatesGenerated && (
                          <div className="mt-4 pt-4 border-t">
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Certificate Generated
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operational KPIs Tab */}
        <TabsContent value="operational" className="space-y-4">
          {kpis ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Collection Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Collections</p>
                    <p className="text-2xl font-bold">{kpis.totalCollections}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{kpis.completedCollections}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Missed</p>
                    <p className="text-2xl font-bold text-red-600">{kpis.missedCollections}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">On-Time Rate</p>
                    <p className="text-2xl font-bold">{kpis.onTimeRate.toFixed(1)}%</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Efficiency Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Collection Weight</p>
                    <p className="text-2xl font-bold">{formatNumber(kpis.averageCollectionWeight)} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contamination Rate</p>
                    <p className="text-2xl font-bold">{kpis.contaminationRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Route Efficiency</p>
                    <p className="text-2xl font-bold">{kpis.averageRouteEfficiency.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">Collections per hour</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fuel Efficiency</p>
                    <p className="text-2xl font-bold">{kpis.fuelEfficiency.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">km per liter</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Financial Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(kpis.revenue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cost Per Collection</p>
                    <p className="text-2xl font-bold">
                      {kpis.costPerCollection > 0 ? formatCurrency(kpis.costPerCollection) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Profit Margin</p>
                    <p className="text-2xl font-bold">{kpis.profitMargin.toFixed(1)}%</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
                    <p className="text-2xl font-bold">{kpis.customerSatisfaction.toFixed(1)}/5</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Customer Retention</p>
                    <p className="text-2xl font-bold">{kpis.customerRetention.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">New Customers</p>
                    <p className="text-2xl font-bold">{kpis.newCustomers}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>No KPI data available for selected period</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Regulatory Reports Tab */}
        <TabsContent value="regulatory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regulatory Compliance Reports</CardTitle>
              <CardDescription>Generate compliance-ready documents for audits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Collection Report</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Detailed report of all collections with material types and weights
                      </p>
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Environmental Impact Report</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Environmental benefits and waste diversion metrics
                      </p>
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Compliance Audit Report</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Full compliance documentation for regulatory audits
                      </p>
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Material Tracking Report</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Complete material inventory and tracking documentation
                      </p>
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
