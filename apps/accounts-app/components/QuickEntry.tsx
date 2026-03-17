"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Zap, Receipt, CreditCard, Truck, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface QuickEntryProps {
  onSave: (type: string, data: any) => void
  /** When provided, dialog is controlled externally */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** When provided with open, shows form for this type directly */
  initialType?: 'expense' | 'payment' | 'weighbridge'
}

export function QuickEntry({ onSave, open: controlledOpen, onOpenChange, initialType }: QuickEntryProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [entryType, setEntryType] = useState<'expense' | 'payment' | 'weighbridge' | null>(null)
  const [formData, setFormData] = useState<any>({})
  const { toast } = useToast()

  const isControlled = controlledOpen !== undefined
  const dialogOpen = isControlled ? controlledOpen : internalOpen
  const setDialogOpen = (v: boolean) => {
    if (isControlled) onOpenChange?.(v)
    else setInternalOpen(v)
  }

  const quickEntryTypes = [
    { id: 'expense', label: 'Quick Expense', icon: CreditCard, color: 'text-blue-600' },
    { id: 'payment', label: 'Quick Payment', icon: Receipt, color: 'text-green-600' },
    { id: 'weighbridge', label: 'Weighbridge Entry', icon: Truck, color: 'text-orange-600' },
  ]

  // When opened with initialType, show that form directly
  const effectiveEntryType = initialType && dialogOpen ? initialType : entryType

  const handleQuickEntry = (type: string) => {
    setEntryType(type as any)
    setFormData({})
    setDialogOpen(true)
  }

  const handleSave = () => {
    const typeToSave = effectiveEntryType || entryType
    if (!typeToSave) return

    // Add current date if not provided
    if (!formData.date) {
      formData.date = new Date().toISOString().split('T')[0]
    }

    onSave(typeToSave, formData)
    toast({
      title: "Entry saved",
      description: `${quickEntryTypes.find(t => t.id === typeToSave)?.label} saved successfully`,
    })
    setDialogOpen(false)
    setFormData({})
    setEntryType(null)
  }

  const renderForm = () => {
    switch (effectiveEntryType) {
      case 'expense':
        return (
          <div className="space-y-4">
            <div>
              <Label>Vendor/Description</Label>
              <Input
                value={formData.vendor || ''}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                placeholder="e.g. Fuel, Supplies"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Amount (R)</Label>
                <Input
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={formData.category || ''}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fuel">Fuel</SelectItem>
                    <SelectItem value="supplies">Supplies</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date || new Date().toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>
        )

      case 'payment':
        return (
          <div className="space-y-4">
            <div>
              <Label>Supplier/Recipient</Label>
              <Input
                value={formData.recipient || ''}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                placeholder="Supplier name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Amount (R)</Label>
                <Input
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Payment Method</Label>
                <Select
                  value={formData.method || ''}
                  onValueChange={(value) => setFormData({ ...formData, method: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="eft">EFT</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date || new Date().toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <Label>Reference (Optional)</Label>
              <Input
                value={formData.reference || ''}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="Payment reference"
              />
            </div>
          </div>
        )

      case 'weighbridge':
        return (
          <div className="space-y-4">
            <div>
              <Label>Supplier</Label>
              <Input
                value={formData.supplier || ''}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="Supplier name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Material</Label>
                <Select
                  value={formData.material || ''}
                  onValueChange={(value) => setFormData({ ...formData, material: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aluminium Cans">Aluminium Cans</SelectItem>
                    <SelectItem value="Cardboard">Cardboard</SelectItem>
                    <SelectItem value="Glass">Glass</SelectItem>
                    <SelectItem value="Glass Bottles">Glass Bottles</SelectItem>
                    <SelectItem value="HDPE Containers">HDPE Containers</SelectItem>
                    <SelectItem value="Paper">Paper</SelectItem>
                    <SelectItem value="PET Bottles">PET Bottles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Grade</Label>
                <Select
                  value={formData.grade || ''}
                  onValueChange={(value) => setFormData({ ...formData, grade: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Grade A</SelectItem>
                    <SelectItem value="B">Grade B</SelectItem>
                    <SelectItem value="C">Grade C</SelectItem>
                    <SelectItem value="D">Grade D</SelectItem>
                    <SelectItem value="Mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Gross Weight (kg)</Label>
                <Input
                  type="number"
                  value={formData.grossWeight || ''}
                  onChange={(e) => setFormData({ ...formData, grossWeight: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Tare Weight (kg)</Label>
                <Input
                  type="number"
                  value={formData.tareWeight || ''}
                  onChange={(e) => setFormData({ ...formData, tareWeight: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>
            {formData.grossWeight && formData.tareWeight && (
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="text-sm font-medium text-blue-900">
                  Net Weight: {(formData.grossWeight - formData.tareWeight).toLocaleString('en-ZA')} kg
                </p>
              </div>
            )}
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date || new Date().toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      {!isControlled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Quick Entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-3">
              {quickEntryTypes.map((type) => {
                const Icon = type.icon
                return (
                  <Button
                    key={type.id}
                    variant="outline"
                    onClick={() => handleQuickEntry(type.id)}
                    className="flex flex-col items-center gap-2 h-auto py-4"
                  >
                    <Icon className={`h-6 w-6 ${type.color}`} />
                    <span className="text-sm">{type.label}</span>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {effectiveEntryType && quickEntryTypes.find(t => t.id === effectiveEntryType)?.label}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {renderForm()}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Entry
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
