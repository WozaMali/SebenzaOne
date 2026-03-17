'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, Upload, FileSpreadsheet, Database, Archive, CheckCircle, XCircle } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { crmService } from '@/lib/crm-service'
import { Badge } from '@/components/ui/badge'

export function DataManagementPage() {
  const [importType, setImportType] = useState('contacts')
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)
  const [exportResult, setExportResult] = useState<any>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setImportResult(null)

    try {
      const text = await file.text()
      let data: any

      if (file.name.endsWith('.json')) {
        data = JSON.parse(text)
      } else if (file.name.endsWith('.csv')) {
        // Simple CSV parsing (for production, use a proper CSV parser)
        const lines = text.split('\n')
        const headers = lines[0].split(',')
        data = lines.slice(1).map(line => {
          const values = line.split(',')
          const obj: any = {}
          headers.forEach((header, i) => {
            obj[header.trim()] = values[i]?.trim() || ''
          })
          return obj
        })
      }

      const result = await crmService.importData({
        [importType]: data
      })
      setImportResult(result)
    } catch (error) {
      console.error('Import error:', error)
      setImportResult({
        imported: 0,
        failed: 1,
        errors: [{ row: 0, field: 'file', message: error instanceof Error ? error.message : 'Import failed' }],
        warnings: []
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleExport = async (format: 'json' | 'csv') => {
    setIsExporting(true)
    setExportResult(null)

    try {
      const result = await crmService.exportData({
        contacts: true,
        companies: true,
        deals: true,
        activities: true,
        format,
        includeMetadata: true
      })

      // Download the file
      const blob = format === 'json' 
        ? new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
        : new Blob([result.data], { type: 'text/csv' })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = result.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setExportResult({ success: true, format, filename: result.filename })
    } catch (error) {
      console.error('Export error:', error)
      setExportResult({ success: false, error: error instanceof Error ? error.message : 'Export failed' })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Management</h1>
          <p className="text-muted-foreground mt-1">
            Import, export, and manage your CRM data
          </p>
        </div>
      </div>

      <Tabs defaultValue="import" className="space-y-4">
        <TabsList>
          <TabsTrigger value="import">Import</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="bulk-edit">Bulk Edit</TabsTrigger>
          <TabsTrigger value="archive">Archive</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Data</CardTitle>
              <CardDescription>Import contacts, companies, and deals from CSV or Excel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={importType} onValueChange={setImportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contacts">Contacts</SelectItem>
                  <SelectItem value="companies">Companies</SelectItem>
                  <SelectItem value="deals">Deals</SelectItem>
                  <SelectItem value="activities">Activities</SelectItem>
                </SelectContent>
              </Select>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop your file here, or click to browse
                </p>
                <input
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={isImporting}
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" asChild disabled={isImporting}>
                    <span>{isImporting ? 'Importing...' : 'Select File'}</span>
                  </Button>
                </label>
                <p className="text-xs text-muted-foreground mt-2">
                  Supported formats: JSON, CSV
                </p>
              </div>
              {importResult && (
                <div className={`mt-4 p-4 rounded-lg ${
                  importResult.failed === 0 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200' 
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {importResult.failed === 0 ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-yellow-600" />
                    )}
                    <p className="font-medium">
                      Imported {importResult.imported} {importResult.failed > 0 && `(${importResult.failed} failed)`}
                    </p>
                  </div>
                  {importResult.errors.length > 0 && (
                    <div className="mt-2 text-sm">
                      <p className="font-medium mb-1">Errors:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {importResult.errors.slice(0, 5).map((error: any, i: number) => (
                          <li key={i}>{error.message}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>Export your CRM data in various formats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto flex-col py-4"
                  onClick={() => handleExport('csv')}
                  disabled={isExporting}
                >
                  <FileSpreadsheet className="h-8 w-8 mb-2" />
                  <span>{isExporting ? 'Exporting...' : 'Export to CSV'}</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto flex-col py-4"
                  onClick={() => handleExport('json')}
                  disabled={isExporting}
                >
                  <Database className="h-8 w-8 mb-2" />
                  <span>{isExporting ? 'Exporting...' : 'Export to JSON'}</span>
                </Button>
              </div>
              {exportResult && (
                <div className={`mt-4 p-4 rounded-lg ${
                  exportResult.success 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200' 
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200'
                }`}>
                  {exportResult.success ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <p className="font-medium">Export successful: {exportResult.filename}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <p className="font-medium">Export failed: {exportResult.error}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk-edit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Edit</CardTitle>
              <CardDescription>Edit multiple records at once</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Bulk edit functionality will be available here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Archive</CardTitle>
              <CardDescription>Archive old or inactive records</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Archive management will be available here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
