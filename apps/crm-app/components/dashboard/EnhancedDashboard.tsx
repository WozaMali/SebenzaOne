'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, TrendingDown, Users, DollarSign, Target, Package,
  Activity, Zap, Award, Clock, AlertCircle, CheckCircle, BarChart3,
  PieChart, LineChart, ArrowUpRight, ArrowDownRight, Calendar,
  Mail, Phone, MessageSquare, FileText, Star, RefreshCw, UserPlus
} from 'lucide-react'
import { recyclingService } from '@/lib/recycling-service'
import { crmService } from '@/lib/crm-service'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'

interface DashboardMetrics {
  totalRevenue: number
  revenueGrowth: number
  totalCustomers: number
  customerGrowth: number
  totalCollections: number
  collectionGrowth: number
  materialCollected: number
  materialGrowth: number
  completionRate: number
  rateChange: number
  activeDeals: number
  dealsValue: number
  winRate: number
  avgDealSize: number
}

export function EnhancedDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'quarter'>('month')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadMetrics = () => {
      setIsLoading(true)
      
      // Load recycling data
      const customers = recyclingService.getCustomers()
      const collections = recyclingService.getCollections()
      const dateRange = {
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date())
      }
      const kpis = recyclingService.getKPIs(dateRange)
      const deals = crmService.getDeals()
      
      // Calculate metrics
      const completedCollections = collections.filter(c => c.status === 'completed')
      const totalMaterial = completedCollections.reduce((sum, c) => sum + (c.totalWeight || 0), 0)
      const totalRevenue = kpis?.revenue || 0
      const activeDeals = deals.filter(d => d.stage !== 'closed-won' && d.stage !== 'closed-lost')
      const dealsValue = activeDeals.reduce((sum, d) => sum + (d.value || 0), 0)
      const wonDeals = deals.filter(d => d.stage === 'closed-won').length
      const totalClosed = deals.filter(d => d.stage === 'closed-won' || d.stage === 'closed-lost').length
      const winRate = totalClosed > 0 ? (wonDeals / totalClosed) * 100 : 0
      const avgDealSize = deals.length > 0 
        ? deals.reduce((sum, d) => sum + (d.value || 0), 0) / deals.length 
        : 0
      
      setMetrics({
        totalRevenue,
        revenueGrowth: 12.5, // Mock growth
        totalCustomers: customers.length,
        customerGrowth: 8.3,
        totalCollections: collections.length,
        collectionGrowth: 15.2,
        materialCollected: totalMaterial,
        materialGrowth: 10.5,
        completionRate: collections.length > 0 
          ? (completedCollections.length / collections.length) * 100 
          : 0,
        rateChange: 2.3,
        activeDeals: activeDeals.length,
        dealsValue,
        winRate,
        avgDealSize
      })
      
      setIsLoading(false)
    }
    
    loadMetrics()
    // Refresh every 30 seconds
    const interval = setInterval(loadMetrics, 30000)
    return () => clearInterval(interval)
  }, [timeRange])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  if (isLoading || !metrics) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-32 mb-2"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const MetricCard = ({ 
    title, 
    value, 
    growth, 
    icon: Icon, 
    trend = 'up',
    formatValue = (v: any) => v,
    subtitle 
  }: {
    title: string
    value: number
    growth?: number
    icon: any
    trend?: 'up' | 'down'
    formatValue?: (v: number) => string
    subtitle?: string
  }) => (
    <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {growth !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            {trend === 'up' ? (
              <ArrowUpRight className="h-3 w-3 text-green-600" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-red-600" />
            )}
            <span className={`text-xs font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(growth)}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">vs last period</span>
          </div>
        )}
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time overview of your recycling business
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <TabsList>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="quarter">Quarter</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={metrics.totalRevenue}
          growth={metrics.revenueGrowth}
          icon={DollarSign}
          formatValue={formatCurrency}
          subtitle="From all operations"
        />
        <MetricCard
          title="Total Customers"
          value={metrics.totalCustomers}
          growth={metrics.customerGrowth}
          icon={Users}
          subtitle="Active customers"
        />
        <MetricCard
          title="Material Collected"
          value={metrics.materialCollected}
          growth={metrics.materialGrowth}
          icon={Package}
          formatValue={(v) => `${formatNumber(v)} kg`}
          subtitle="This month"
        />
        <MetricCard
          title="Completion Rate"
          value={metrics.completionRate}
          growth={metrics.rateChange}
          icon={CheckCircle}
          formatValue={(v) => `${v.toFixed(1)}%`}
          subtitle="Collection success"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Deals"
          value={metrics.activeDeals}
          icon={Target}
          formatValue={(v) => v.toString()}
          subtitle={formatCurrency(metrics.dealsValue)}
        />
        <MetricCard
          title="Win Rate"
          value={metrics.winRate}
          icon={Award}
          formatValue={(v) => `${v.toFixed(1)}%`}
          subtitle="Deal success rate"
        />
        <MetricCard
          title="Avg Deal Size"
          value={metrics.avgDealSize}
          icon={BarChart3}
          formatValue={formatCurrency}
          subtitle="Per deal"
        />
        <MetricCard
          title="Collections"
          value={metrics.totalCollections}
          growth={metrics.collectionGrowth}
          icon={Activity}
          formatValue={(v) => v.toString()}
          subtitle="Scheduled this month"
        />
      </div>

      {/* Charts and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <LineChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Chart visualization coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Material Breakdown</CardTitle>
            <CardDescription>Collection by material type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Chart visualization coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <Button variant="outline" className="flex flex-col h-auto py-4">
              <UserPlus className="h-5 w-5 mb-2" />
              <span className="text-xs">Add Customer</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-auto py-4">
              <Calendar className="h-5 w-5 mb-2" />
              <span className="text-xs">Schedule</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-auto py-4">
              <FileText className="h-5 w-5 mb-2" />
              <span className="text-xs">Create Invoice</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-auto py-4">
              <Mail className="h-5 w-5 mb-2" />
              <span className="text-xs">Send Email</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-auto py-4">
              <Phone className="h-5 w-5 mb-2" />
              <span className="text-xs">Log Call</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-auto py-4">
              <BarChart3 className="h-5 w-5 mb-2" />
              <span className="text-xs">View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates and actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-full bg-primary/10">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Collection completed for Customer #{i + 1}</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
                <Badge variant="outline">Completed</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
