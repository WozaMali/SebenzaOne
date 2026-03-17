"use client"

import { useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, TrendingDown, DollarSign, Receipt, 
  CreditCard, AlertCircle, ArrowUpRight, ArrowDownRight,
  BarChart3, PieChart, Calendar, Target, Users, FileText, Download
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface EnhancedDashboardProps {
  invoices: any[]
  expenses: any[]
  bills: any[]
  payments: any[]
  bankAccounts: any[]
  weighbridgeTickets?: any[]
  suppliers?: any[]
}

export function EnhancedDashboard({
  invoices,
  expenses,
  bills,
  payments,
  bankAccounts,
  weighbridgeTickets = [],
  suppliers = []
}: EnhancedDashboardProps) {
  // Enhanced KPI Calculations
  const metrics = useMemo(() => {
    const revenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
    const outstanding = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.amount, 0)
    const spend = expenses.reduce((s, e) => s + e.amount, 0)
    const totalPayables = bills.filter(b => b.status === 'unpaid').reduce((s, b) => s + b.amount, 0)
    const cashflow = revenue - spend
    const bankBalance = bankAccounts.reduce((s, b) => s + b.balance, 0)
    
    // Waste-specific metrics
    const totalWeight = weighbridgeTickets.reduce((s, t) => s + (t.netWeight || 0), 0)
    const totalPayouts = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0)
    const activeSuppliers = suppliers.filter(s => s.status === 'active').length
    
    // Monthly trends
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const thisMonthRevenue = invoices
      .filter(i => {
        const date = new Date(i.createdDate || i.dueDate)
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear && i.status === 'paid'
      })
      .reduce((s, i) => s + i.amount, 0)
    
    const lastMonthRevenue = invoices
      .filter(i => {
        const date = new Date(i.createdDate || i.dueDate)
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
        const year = currentMonth === 0 ? currentYear - 1 : currentYear
        return date.getMonth() === lastMonth && date.getFullYear() === year && i.status === 'paid'
      })
      .reduce((s, i) => s + i.amount, 0)
    
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0

    return {
      revenue,
      outstanding,
      spend,
      totalPayables,
      cashflow,
      bankBalance,
      totalWeight,
      totalPayouts,
      activeSuppliers,
      thisMonthRevenue,
      lastMonthRevenue,
      revenueGrowth
    }
  }, [invoices, expenses, bills, bankAccounts, weighbridgeTickets, suppliers, payments])

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    trend,
    subtitle 
  }: { 
    title: string
    value: string | number
    change?: number
    icon: any
    trend?: 'up' | 'down' | 'neutral'
    subtitle?: string
  }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{typeof value === 'number' ? `R ${value.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}` : value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {change !== undefined && (
          <div className={`flex items-center text-xs mt-1 ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
            {trend === 'up' && <ArrowUpRight className="h-3 w-3 mr-1" />}
            {trend === 'down' && <ArrowDownRight className="h-3 w-3 mr-1" />}
            {change > 0 ? '+' : ''}{change.toFixed(1)}% from last month
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={metrics.revenue}
          change={metrics.revenueGrowth}
          trend={metrics.revenueGrowth >= 0 ? 'up' : 'down'}
          icon={DollarSign}
          subtitle={`This month: R ${metrics.thisMonthRevenue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`}
        />
        <MetricCard
          title="Outstanding Invoices"
          value={metrics.outstanding}
          icon={Receipt}
          subtitle={`${invoices.filter(i => i.status === 'sent' || i.status === 'overdue').length} invoices`}
        />
        <MetricCard
          title="Total Expenses"
          value={metrics.spend}
          icon={CreditCard}
          subtitle={`${expenses.length} transactions`}
        />
        <MetricCard
          title="Cash Flow"
          value={metrics.cashflow}
          trend={metrics.cashflow >= 0 ? 'up' : 'down'}
          icon={TrendingUp}
          subtitle={`Bank: R ${metrics.bankBalance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`}
        />
      </div>

      {/* Waste Management Metrics */}
      {weighbridgeTickets.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Material Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalWeight.toLocaleString('en-ZA')} kg</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total weight processed
              </p>
              <p className="text-xs text-muted-foreground">
                {weighbridgeTickets.length} weighbridge tickets
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center">
                <Receipt className="h-4 w-4 mr-2" />
                Supplier Payouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R {metrics.totalPayouts.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total paid to suppliers
              </p>
              <p className="text-xs text-muted-foreground">
                {payments.filter(p => p.status === 'completed').length} payments
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Active Suppliers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeSuppliers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active supplier accounts
              </p>
              <p className="text-xs text-muted-foreground">
                {suppliers.length} total suppliers
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts & Warnings */}
      <div className="grid gap-4 md:grid-cols-2">
        {metrics.outstanding > 10000 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center text-orange-800">
                <AlertCircle className="h-4 w-4 mr-2" />
                High Outstanding Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-700">
                You have R {metrics.outstanding.toLocaleString('en-ZA', { minimumFractionDigits: 2 })} in outstanding invoices. 
                Consider following up on overdue payments.
              </p>
            </CardContent>
          </Card>
        )}
        
        {metrics.cashflow < 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center text-red-800">
                <TrendingDown className="h-4 w-4 mr-2" />
                Negative Cash Flow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-700">
                Your expenses exceed revenue this period. Review spending and consider increasing revenue streams.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common accounting tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-4">
            <Button variant="outline" className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              New Invoice
            </Button>
            <Button variant="outline" className="justify-start">
              <CreditCard className="h-4 w-4 mr-2" />
              Record Expense
            </Button>
            <Button variant="outline" className="justify-start">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" className="justify-start">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
