"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Upload, Download, FileSpreadsheet, FileText, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BulkImportExportProps {
  onImport?: (data: any[]) => void
  onExport?: () => any[]
  dataType: 'invoices' | 'expenses' | 'suppliers' | 'weighbridge'
}

export function BulkImportExport({ onImport, onExport, dataType }: BulkImportExportProps) {
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const { toast } = useToast()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to import",
        variant: "destructive"
      })
      return
    }

    try {
      const text = await file.text()
      const lines = text.split('\n')
      const headers = lines[0].split(',').map(h => h.trim())
      const data = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',').map(v => v.trim())
          const obj: any = {}
          headers.forEach((header, index) => {
            obj[header] = values[index] || ''
          })
          return obj
        })

      if (onImport) {
        onImport(data)
        toast({
          title: "Import successful",
          description: `Imported ${data.length} ${dataType} records`,
        })
        setImportDialogOpen(false)
        setFile(null)
      }
    } catch (error) {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import file",
        variant: "destructive"
      })
    }
  }

  const handleExport = () => {
    if (!onExport) return

    try {
      const data = onExport()
      if (!data || data.length === 0) {
        toast({
          title: "No data to export",
          description: `No ${dataType} records found`,
          variant: "destructive"
        })
        return
      }

      // Convert to CSV
      const headers = Object.keys(data[0])
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
          const value = row[header]
          // Handle values with commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value ?? ''
        }).join(','))
      ].join('\n')

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${dataType}_export_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export successful",
        description: `Exported ${data.length} ${dataType} records`,
      })
      setExportDialogOpen(false)
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export data",
        variant: "destructive"
      })
    }
  }

  const exportToExcel = () => {
    // For Excel export, you would use a library like xlsx
    // This is a placeholder for the functionality
    toast({
      title: "Excel export",
      description: "Excel export feature coming soon. Use CSV export for now.",
    })
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setImportDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Import
        </Button>
        <Button
          variant="outline"
          onClick={() => setExportDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import {dataType}</DialogTitle>
            <DialogDescription>
              Upload a CSV file to import {dataType} records. The first row should contain column headers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Select CSV File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="mt-2"
              />
            </div>
            {file && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                {file.name} selected
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={!file}>
                Import
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export {dataType}</DialogTitle>
            <DialogDescription>
              Choose a format to export your {dataType} data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Button
                variant="outline"
                onClick={handleExport}
                className="justify-start"
              >
                <FileText className="h-4 w-4 mr-2" />
                Export as CSV
              </Button>
              <Button
                variant="outline"
                onClick={exportToExcel}
                className="justify-start"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export as Excel (Coming Soon)
              </Button>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
