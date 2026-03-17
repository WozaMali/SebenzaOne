"use client"

import { useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import { downloadReportElementPdf, downloadReportCsv } from "@/lib/pdf-export"

interface FinancialReportsProps {
  invoices: any[]
  expenses: any[]
  bills: any[]
  payments: any[]
  dateFrom?: string
  dateTo?: string
}

export function FinancialReports({
  invoices,
  expenses,
  bills,
  payments,
  dateFrom,
  dateTo
}: FinancialReportsProps) {
  const reportData = useMemo(() => {
    const filteredInvoices = invoices.filter(inv => {
      if (!dateFrom && !dateTo) return true
      const invDate = new Date(inv.createdDate || inv.dueDate)
      if (dateFrom && invDate < new Date(dateFrom)) return false
      if (dateTo && invDate > new Date(dateTo)) return false
      return true
    })

    const filteredExpenses = expenses.filter(exp => {
      if (!dateFrom && !dateTo) return true
      const expDate = new Date(exp.date)
      if (dateFrom && expDate < new Date(dateFrom)) return false
      if (dateTo && expDate > new Date(dateTo)) return false
      return true
    })

    const revenue = filteredInvoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + (i.amount || 0), 0)

    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)

    const netIncome = revenue - totalExpenses

    // Expense breakdown by category
    const expenseByCategory = filteredExpenses.reduce((acc, exp) => {
      const category = exp.category || 'Uncategorized'
      acc[category] = (acc[category] || 0) + (exp.amount || 0)
      return acc
    }, {} as Record<string, number>)

    // Revenue by month
    const revenueByMonth = filteredInvoices
      .filter(i => i.status === 'paid')
      .reduce((acc, inv) => {
        const date = new Date(inv.createdDate || inv.dueDate)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        acc[monthKey] = (acc[monthKey] || 0) + (inv.amount || 0)
        return acc
      }, {} as Record<string, number>)

    return {
      revenue,
      totalExpenses,
      netIncome,
      expenseByCategory,
      revenueByMonth,
      invoiceCount: filteredInvoices.length,
      expenseCount: filteredExpenses.length
    }
  }, [invoices, expenses, dateFrom, dateTo])

  const handleExportPDF = async () => {
    await downloadReportElementPdf({ elementId: "financial-report-content", filename: `financial-report-${dateFrom || "all"}-${dateTo || "all"}.pdf` })
  }

  const handleExportExcel = () => {
    const fmt = (n: number) => n.toFixed(2)
    const headers = ["Metric", "Value"]
    const rows = [
      ["Total Revenue", fmt(reportData.revenue)],
      ["Total Expenses", fmt(reportData.totalExpenses)],
      ["Net Income", fmt(reportData.netIncome)],
      ["Invoice Count", String(reportData.invoiceCount)],
      ["Expense Count", String(reportData.expenseCount)],
      ...Object.entries(reportData.expenseByCategory).map(([cat, amt]) => [`Expense: ${cat}`, fmt(Number(amt) || 0)]),
      ...Object.entries(reportData.revenueByMonth).map(([month, amt]) => [`Revenue: ${month}`, fmt(Number(amt) || 0)]),
    ]
    downloadReportCsv(`financial-report-${dateFrom || "all"}-${dateTo || "all"}.csv`, headers, rows)
  }

  return (
    <div className="space-y-6" id="financial-report-content">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>
                Comprehensive financial analysis and reporting
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportExcel}>
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profit & Loss Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R {reportData.revenue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {reportData.invoiceCount} invoices
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  R {reportData.totalExpenses.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {reportData.expenseCount} transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Net Income</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${reportData.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R {reportData.netIncome.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {((reportData.revenue > 0 ? reportData.netIncome / reportData.revenue : 0) * 100).toFixed(1)}% margin
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Expense Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(Object.entries(reportData.expenseByCategory) as Array<[string, number]>)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, amount]) => {
                    const percentage = reportData.totalExpenses > 0
                      ? (amount / reportData.totalExpenses) * 100
                      : 0
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{category}</span>
                          <span>R {amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(Object.entries(reportData.revenueByMonth) as Array<[string, number]>)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([month, revenue]) => (
                    <div key={month} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{month}</span>
                      <span className="text-sm">R {revenue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
