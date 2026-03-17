'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Plus, Search, Download, Upload, Star, User, Edit, Eye, Trash2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { crmService } from '@/lib/crm-service'
import { Contact } from '@/types/crm'

export function LeadsPage() {
  const [leads, setLeads] = useState<Contact[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newLead, setNewLead] = useState({ firstName: '', lastName: '', email: '', phone: '', company: '' })

  useEffect(() => {
    loadLeads()
  }, [])

  const loadLeads = () => {
    setIsLoading(true)
    try {
      // Get contacts that are leads or prospects
      const allContacts = crmService.getContacts()
      const leadContacts = allContacts.filter(c => 
        c.status === 'lead' || c.status === 'prospect' || !c.status
      )
      setLeads(leadContacts)
    } catch (error) {
      console.error('Error loading leads:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredLeads = useMemo(() => {
    let filtered = leads
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(lead =>
        `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        lead.company?.name?.toLowerCase().includes(query) ||
        lead.phone?.toLowerCase().includes(query)
      )
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(lead => lead.status === filterStatus)
    }
    
    return filtered
  }, [leads, searchQuery, filterStatus])

  const getLeadScore = (contact: Contact): string => {
    // Simple scoring based on status and activity
    if (contact.status === 'customer') return 'hot'
    if (contact.status === 'prospect') return 'warm'
    if (contact.status === 'lead') return 'cold'
    return 'cold'
  }

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'hot': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'warm': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'cold': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lead Management</h1>
          <p className="text-muted-foreground mt-1">
            Capture, qualify, and convert leads into customers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Leads
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Leads</CardTitle>
              <CardDescription>Manage and track your leads</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading leads...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No leads found</p>
              <p className="text-sm mb-4">
                {searchQuery || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Start by adding your first lead'}
              </p>
              <Button className="mt-4" variant="outline" onClick={() => {/* TODO: Open add lead dialog */}}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Lead
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Showing {filteredLeads.length} of {leads.length} leads
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => {
                    const score = getLeadScore(lead)
                    return (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">
                          {lead.firstName} {lead.lastName}
                        </TableCell>
                        <TableCell>{lead.email}</TableCell>
                        <TableCell>{lead.phone || '-'}</TableCell>
                        <TableCell>{lead.company?.name || '-'}</TableCell>
                        <TableCell>
                          <Badge className={getScoreColor(score)}>{score}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{lead.status || 'lead'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{lead.source || 'manual'}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Lead</DialogTitle>
            <DialogDescription>Create a new lead to track and qualify</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input
                  value={newLead.firstName}
                  onChange={(e) => setNewLead((p) => ({ ...p, firstName: e.target.value }))}
                  placeholder="First name"
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={newLead.lastName}
                  onChange={(e) => setNewLead((p) => ({ ...p, lastName: e.target.value }))}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={newLead.email}
                onChange={(e) => setNewLead((p) => ({ ...p, email: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={newLead.phone}
                onChange={(e) => setNewLead((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+27..."
              />
            </div>
            <div>
              <Label>Company</Label>
              <Input
                value={newLead.company}
                onChange={(e) => setNewLead((p) => ({ ...p, company: e.target.value }))}
                placeholder="Company name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                if (!newLead.firstName.trim() || !newLead.email.trim()) return
                const contact = await crmService.createContact({
                  firstName: newLead.firstName.trim(),
                  lastName: newLead.lastName.trim(),
                  email: newLead.email.trim(),
                  phone: newLead.phone.trim() || undefined,
                  notes: newLead.company.trim() ? `Company: ${newLead.company.trim()}` : undefined,
                  tags: [],
                  isFavorite: false,
                  source: 'manual',
                  status: 'lead',
                  createdBy: '',
                  customFields: {},
                  socialProfiles: [],
                  addresses: [],
                  communicationHistory: [],
                })
                setLeads((prev) => [contact, ...prev])
                setNewLead({ firstName: '', lastName: '', email: '', phone: '', company: '' })
                setShowAddDialog(false)
              }}
            >
              Add Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
