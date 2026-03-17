'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { 
  Edit, 
  Phone, 
  Mail, 
  MapPin, 
  Trash2, 
  Building2, 
  Home, 
  Factory,
  Calendar,
  Package,
  DollarSign,
  FileText,
  Save,
  X
} from 'lucide-react'
import { recyclingService } from '@/lib/recycling-service'
import { RecyclingCustomer, CustomerType, MATERIAL_LABELS } from '@/types/recycling'
import { format } from 'date-fns'

interface CustomerProfilePageProps {
  customerId: string
  onBack?: () => void
}

export function CustomerProfilePage({ customerId, onBack }: CustomerProfilePageProps) {
  const [customer, setCustomer] = useState<RecyclingCustomer | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showContactDialog, setShowContactDialog] = useState(false)
  const [contactMethod, setContactMethod] = useState<'phone' | 'email'>('phone')
  const [notes, setNotes] = useState('')
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    const loaded = recyclingService.getCustomer(customerId)
    setCustomer(loaded || null)
    if (loaded?.notes) {
      setNotes(loaded.notes)
    }
  }, [customerId])

  const getCustomerTypeIcon = (type: CustomerType) => {
    switch (type) {
      case 'residential': return <Home className="h-5 w-5" />
      case 'commercial': return <Building2 className="h-5 w-5" />
      case 'industrial': return <Factory className="h-5 w-5" />
      case 'municipality': return <Building2 className="h-5 w-5" />
      default: return <Home className="h-5 w-5" />
    }
  }

  const getCustomerTypeLabel = (type: CustomerType) => {
    switch (type) {
      case 'residential': return 'Residential'
      case 'commercial': return 'Commercial'
      case 'industrial': return 'Industrial'
      case 'municipality': return 'Municipality'
      default: return type
    }
  }

  const handleSaveNote = () => {
    if (customer) {
      recyclingService.updateCustomer(customer.id, { notes })
    }
  }

  const handleDelete = () => {
    if (customer) {
      recyclingService.deleteCustomer(customer.id)
      if (onBack) onBack()
    }
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Customer not found</p>
      </div>
    )
  }

  // Get collections for this customer
  const collections = recyclingService.getCollections().filter(c => c.customerId === customerId)
  const completedCollections = collections.filter(c => c.status === 'completed')

  // Get invoices for this customer
  const invoices = recyclingService.getInvoices().filter(i => i.customerId === customerId)
  const outstandingInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'overdue')

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              <X className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div className="flex items-center gap-3">
            {getCustomerTypeIcon(customer.customerType)}
            <div>
              <h1 className="text-3xl font-bold">
                {customer.businessName || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unnamed Customer'}
              </h1>
              <Badge className="mt-1">
                {getCustomerTypeLabel(customer.customerType)}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowContactDialog(true)}>
            <Phone className="h-4 w-4 mr-2" />
            Contact
          </Button>
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="history">Recycling History</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.email}</span>
                  </div>
                </div>
                <div>
                  <Label>Phone</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.phone}</span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label>Address</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {customer.address.street}, {customer.address.city}, {customer.address.postalCode}
                    </span>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="pt-4 border-t">
                  <Button onClick={() => setIsEditing(false)}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Service Level</Label>
                  <p className="mt-1">{customer.serviceLevel}</p>
                </div>
                <div>
                  <Label>Pickup Frequency</Label>
                  <p className="mt-1">{customer.pickupFrequency}</p>
                </div>
                <div>
                  <Label>Preferred Pickup Day</Label>
                  <p className="mt-1">{customer.preferredPickupDay || 'Not set'}</p>
                </div>
                <div>
                  <Label>Preferred Pickup Time</Label>
                  <p className="mt-1">{customer.preferredPickupTime || 'Not set'}</p>
                </div>
                <div>
                  <Label>Pricing Model</Label>
                  <p className="mt-1">{customer.pricingModel}</p>
                </div>
                <div>
                  <Label>Accepted Materials</Label>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {customer.acceptedMaterials.map((material) => (
                      <Badge key={material} variant="outline">
                        {material}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recycling History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recycling History</CardTitle>
              <CardDescription>
                {completedCollections.length} completed collections
              </CardDescription>
            </CardHeader>
            <CardContent>
              {completedCollections.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No recycling history available
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Materials</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedCollections.slice(0, 20).map((collection) => (
                      <TableRow key={collection.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(collection.scheduledDate, 'dd MMM yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {collection.materials.slice(0, 3).map((material) => (
                              <Badge key={material.id} variant="outline">
                                {MATERIAL_LABELS[material.materialType] ?? material.materialType}
                              </Badge>
                            ))}
                            {collection.materials.length > 3 && (
                              <Badge variant="outline">+{collection.materials.length - 3}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {collection.totalWeight ? `${collection.totalWeight} kg` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">
                            {collection.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {completedCollections.length > 20 && (
                <div className="mt-4 text-center">
                  <Button variant="outline">
                    View Full History ({completedCollections.length} records)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Outstanding Invoices</CardTitle>
              <CardDescription>
                {outstandingInvoices.length} unpaid invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              {outstandingInvoices.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No outstanding invoices
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outstandingInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.invoiceNumber}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            R {invoice.total.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(invoice.dueDate, 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={invoice.status === 'overdue' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'}
                          >
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Pay Now
                            </Button>
                            <Button variant="ghost" size="sm">
                              Send Reminder
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Notes</CardTitle>
              <CardDescription>Internal notes about this customer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this customer..."
                className="min-h-32"
              />
              <Button onClick={handleSaveNote}>
                <Save className="h-4 w-4 mr-2" />
                Save Note
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Customer</DialogTitle>
            <DialogDescription>Choose how to contact this customer</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={contactMethod === 'phone' ? 'default' : 'outline'}
                onClick={() => setContactMethod('phone')}
                className="flex-1"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
              <Button
                variant={contactMethod === 'email' ? 'default' : 'outline'}
                onClick={() => setContactMethod('email')}
                className="flex-1"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
            {contactMethod === 'phone' && (
              <div>
                <Label>Phone Number</Label>
                <p className="mt-1 text-lg font-medium">{customer.phone}</p>
                <Button className="mt-4 w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </Button>
              </div>
            )}
            {contactMethod === 'email' && (
              <div>
                <Label>Email Address</Label>
                <p className="mt-1 text-lg font-medium">{customer.email}</p>
                <Button className="mt-4 w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this customer? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
