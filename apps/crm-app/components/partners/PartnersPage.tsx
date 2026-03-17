'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Plus, 
  Edit, 
  Archive, 
  Building2, 
  Truck, 
  Shield,
  Search,
  Phone,
  Mail,
  MapPin,
  FileText,
  Star,
  X
} from 'lucide-react'
import { recyclingService } from '@/lib/recycling-service'
import { RecyclingPartner, PartnerType } from '@/types/recycling'

export function PartnersPage() {
  const [partners, setPartners] = useState<RecyclingPartner[]>([])
  const [selectedPartner, setSelectedPartner] = useState<RecyclingPartner | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<PartnerType | 'all'>('all')
  const [newPartner, setNewPartner] = useState({
    name: '',
    partnerType: 'recycling_center' as PartnerType,
    email: '',
    phone: '',
    street: '',
    city: '',
    postalCode: '',
  })

  useEffect(() => {
    const loaded = recyclingService.getPartners()
    setPartners(loaded)
  }, [])

  const filteredPartners = partners.filter(p => {
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || p.partnerType === filterType
    return matchesSearch && matchesType
  })

  const getPartnerTypeIcon = (type: PartnerType) => {
    switch (type) {
      case 'recycling_center': return <Building2 className="h-5 w-5" />
      case 'logistics_provider': return <Truck className="h-5 w-5" />
      case 'government_agency': return <Shield className="h-5 w-5" />
      case 'supplier': return <Building2 className="h-5 w-5" />
      default: return <Building2 className="h-5 w-5" />
    }
  }

  const getPartnerTypeLabel = (type: PartnerType) => {
    switch (type) {
      case 'recycling_center': return 'Recycling Center'
      case 'logistics_provider': return 'Logistics Provider'
      case 'government_agency': return 'Government Agency'
      case 'supplier': return 'Supplier'
      default: return type
    }
  }

  const getPartnerTypeColor = (type: PartnerType) => {
    switch (type) {
      case 'recycling_center': return 'bg-green-100 text-green-800'
      case 'logistics_provider': return 'bg-blue-100 text-blue-800'
      case 'government_agency': return 'bg-purple-100 text-purple-800'
      case 'supplier': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Partnership Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Manage relationships with recycling centers, logistics providers, and government agencies
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Partner
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search partners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="recycling_center">Recycling Center</SelectItem>
                <SelectItem value="logistics_provider">Logistics Provider</SelectItem>
                <SelectItem value="government_agency">Government Agency</SelectItem>
                <SelectItem value="supplier">Supplier</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Partner List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Partners ({filteredPartners.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredPartners.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No partners found
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredPartners.map((partner) => (
                    <Card 
                      key={partner.id} 
                      className={`hover:bg-muted/50 transition-colors cursor-pointer ${
                        selectedPartner?.id === partner.id ? 'border-primary' : ''
                      }`}
                      onClick={() => setSelectedPartner(partner)}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getPartnerTypeIcon(partner.partnerType)}
                            <div>
                              <p className="font-medium">{partner.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {getPartnerTypeLabel(partner.partnerType)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {partner.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm">{partner.rating}</span>
                              </div>
                            )}
                            <Badge className={getPartnerTypeColor(partner.partnerType)}>
                              {partner.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Partner Detail */}
        <Card>
          <CardHeader>
            <CardTitle>Partner Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPartner ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {getPartnerTypeIcon(selectedPartner.partnerType)}
                    <h3 className="text-lg font-semibold">{selectedPartner.name}</h3>
                  </div>
                  <Badge className={getPartnerTypeColor(selectedPartner.partnerType)}>
                    {getPartnerTypeLabel(selectedPartner.partnerType)}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {selectedPartner.email && (
                    <div>
                      <Label className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <p className="mt-1">{selectedPartner.email}</p>
                    </div>
                  )}
                  {selectedPartner.phone && (
                    <div>
                      <Label className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone
                      </Label>
                      <p className="mt-1">{selectedPartner.phone}</p>
                    </div>
                  )}
                  {selectedPartner.address && (
                    <div>
                      <Label className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Address
                      </Label>
                      <p className="mt-1">
                        {selectedPartner.address.street}, {selectedPartner.address.city}
                      </p>
                    </div>
                  )}
                </div>

                {selectedPartner.acceptedMaterials && selectedPartner.acceptedMaterials.length > 0 && (
                  <div>
                    <Label>Accepted Materials</Label>
                    <div className="flex gap-1 flex-wrap mt-1">
                      {selectedPartner.acceptedMaterials.map((material) => (
                        <Badge key={material} variant="outline">
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPartner.certifications && selectedPartner.certifications.length > 0 && (
                  <div>
                    <Label className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Certifications
                    </Label>
                    <div className="space-y-1 mt-1">
                      {selectedPartner.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPartner.notes && (
                  <div>
                    <Label>Notes</Label>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedPartner.notes}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setSelectedPartner(selectedPartner)
                      setShowEditDialog(true)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Partner
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowArchiveDialog(true)}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive Partner
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Select a partner to view details
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Partner Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) setNewPartner({ name: '', partnerType: 'recycling_center', email: '', phone: '', street: '', city: '', postalCode: '' }) }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Partner</DialogTitle>
            <DialogDescription>
              Add a new recycling partner to your network
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Partner Name</Label>
              <Input
                placeholder="Enter partner name"
                value={newPartner.name}
                onChange={(e) => setNewPartner((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Partner Type</Label>
              <Select value={newPartner.partnerType} onValueChange={(v) => setNewPartner((p) => ({ ...p, partnerType: v as PartnerType }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recycling_center">Recycling Center</SelectItem>
                  <SelectItem value="logistics_provider">Logistics Provider</SelectItem>
                  <SelectItem value="government_agency">Government Agency</SelectItem>
                  <SelectItem value="supplier">Supplier</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={newPartner.email}
                  onChange={(e) => setNewPartner((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  type="tel"
                  placeholder="+27..."
                  value={newPartner.phone}
                  onChange={(e) => setNewPartner((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Input
                placeholder="Street address"
                className="mb-2"
                value={newPartner.street}
                onChange={(e) => setNewPartner((p) => ({ ...p, street: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="City"
                  value={newPartner.city}
                  onChange={(e) => setNewPartner((p) => ({ ...p, city: e.target.value }))}
                />
                <Input
                  placeholder="Postal Code"
                  value={newPartner.postalCode}
                  onChange={(e) => setNewPartner((p) => ({ ...p, postalCode: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!newPartner.name.trim()) return
                const partner = recyclingService.createPartner({
                  name: newPartner.name.trim(),
                  partnerType: newPartner.partnerType,
                  email: newPartner.email.trim() || undefined,
                  phone: newPartner.phone.trim() || undefined,
                  address: (newPartner.street || newPartner.city || newPartner.postalCode) ? {
                    street: newPartner.street,
                    city: newPartner.city,
                    state: '',
                    postalCode: newPartner.postalCode,
                    country: 'South Africa',
                  } : undefined,
                  acceptedMaterials: [],
                  status: 'active',
                  tags: [],
                })
                setPartners((prev) => [partner, ...prev])
                setNewPartner({ name: '', partnerType: 'recycling_center', email: '', phone: '', street: '', city: '', postalCode: '' })
                setShowAddDialog(false)
              }}
            >
              Add Partner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Dialog */}
      <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Partner</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive {selectedPartner?.name}? This will mark them as inactive.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowArchiveDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => {
              if (selectedPartner) {
                recyclingService.updatePartner(selectedPartner.id, { status: 'inactive' })
                setPartners(recyclingService.getPartners())
                setShowArchiveDialog(false)
                setSelectedPartner(null)
              }
            }}>
              Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
