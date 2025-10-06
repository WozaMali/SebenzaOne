"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Mail, Phone, MapPin, Calendar, Building, Star, 
  Edit, MoreHorizontal, MessageSquare, Phone as PhoneIcon,
  Mail as MailIcon, FileText, Activity, BarChart3,
  Plus, X, Link as LinkIcon, Globe, Linkedin, Twitter,
  Facebook, Instagram, Github, User, Clock, Tag
} from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Contact, Deal, Activity as ActivityType, EmailThread, Company } from "@/types/crm"
import { crmService } from "@/lib/crm-service"

interface ContactProfileProps {
  contact: Contact
  onEdit: (contact: Contact) => void
  onClose: () => void
}

export function ContactProfile({ contact, onEdit, onClose }: ContactProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContact, setEditedContact] = useState<Contact>(contact)
  const [deals, setDeals] = useState<Deal[]>([])
  const [activities, setActivities] = useState<ActivityType[]>([])
  const [emailThreads, setEmailThreads] = useState<EmailThread[]>([])
  const [company, setCompany] = useState<Company | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadContactData = async () => {
      try {
        setIsLoading(true)
        
        // Load related data
        const [dealsData, activitiesData, emailThreadsData, companyData] = await Promise.all([
          crmService.getDeals().then(ds => ds.filter(d => d.contactId === contact.id)),
          crmService.getActivities().then(acts => acts.filter(a => a.contactId === contact.id)),
          crmService.getEmailThreads().then(threads => threads.filter(t => t.contactId === contact.id)),
          contact.companyId ? crmService.getCompanies().then(companies => companies.find(c => c.id === contact.companyId)) : null
        ])
        
        setDeals(dealsData)
        setActivities(activitiesData)
        setEmailThreads(emailThreadsData)
        setCompany(companyData || null)
      } catch (error) {
        console.error('Error loading contact data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadContactData()
  }, [contact.id])

  const handleSave = () => {
    // TODO: Implement save logic
    onEdit(editedContact)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedContact(contact)
    setIsEditing(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'prospect':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'customer':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'lead':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return <Linkedin className="h-4 w-4" />
      case 'twitter':
        return <Twitter className="h-4 w-4" />
      case 'facebook':
        return <Facebook className="h-4 w-4" />
      case 'instagram':
        return <Instagram className="h-4 w-4" />
      case 'github':
        return <Github className="h-4 w-4" />
      case 'website':
        return <Globe className="h-4 w-4" />
      default:
        return <LinkIcon className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={editedContact.avatar} />
              <AvatarFallback className="text-lg">
                {editedContact.firstName[0]}{editedContact.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editedContact.firstName}
                      onChange={(e) => setEditedContact({ ...editedContact, firstName: e.target.value })}
                      className="w-32"
                    />
                    <Input
                      value={editedContact.lastName}
                      onChange={(e) => setEditedContact({ ...editedContact, lastName: e.target.value })}
                      className="w-32"
                    />
                  </div>
                ) : (
                  `${editedContact.firstName} ${editedContact.lastName}`
                )}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {isEditing ? (
                  <Input
                    value={editedContact.title || ''}
                    onChange={(e) => setEditedContact({ ...editedContact, title: e.target.value })}
                    placeholder="Job title"
                    className="w-48"
                  />
                ) : (
                  editedContact.title
                )}
              </p>
              {company && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEditing ? (
                    <select
                      value={editedContact.companyId || ''}
                      onChange={(e) => setEditedContact({ ...editedContact, companyId: e.target.value })}
                      className="mt-1 block w-48 px-3 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Select company</option>
                      {/* TODO: Add company options */}
                    </select>
                  ) : (
                    company.name
                  )}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(editedContact.status)}>
              {editedContact.status}
            </Badge>
            {editedContact.isFavorite && (
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(!isEditing)}>
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? 'Cancel Edit' : 'Edit Contact'}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MailIcon className="h-4 w-4 mr-2" />
                  Send Email
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  Call
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  Delete Contact
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-4">
          <Button size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button size="sm" variant="outline">
            <Phone className="h-4 w-4 mr-2" />
            Call
          </Button>
          <Button size="sm" variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Message
          </Button>
          {isEditing && (
            <>
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="deals">Deals</TabsTrigger>
            <TabsTrigger value="emails">Emails</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">Email</div>
                        {isEditing ? (
                          <Input
                            value={editedContact.email}
                            onChange={(e) => setEditedContact({ ...editedContact, email: e.target.value })}
                            type="email"
                          />
                        ) : (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {editedContact.email}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">Phone</div>
                        {isEditing ? (
                          <Input
                            value={editedContact.phone || ''}
                            onChange={(e) => setEditedContact({ ...editedContact, phone: e.target.value })}
                            type="tel"
                          />
                        ) : (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {editedContact.phone || 'No phone number'}
                          </div>
                        )}
                      </div>
                    </div>

                    {editedContact.addresses.length > 0 && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                        <div>
                          <div className="font-medium">Address</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {editedContact.addresses[0].street}<br />
                            {editedContact.addresses[0].city}, {editedContact.addresses[0].state} {editedContact.addresses[0].postalCode}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Social Profiles */}
                  {editedContact.socialProfiles.length > 0 && (
                    <div className="space-y-2">
                      <div className="font-medium">Social Profiles</div>
                      <div className="space-y-1">
                        {editedContact.socialProfiles.map((profile, index) => (
                          <div key={index} className="flex items-center gap-2">
                            {getSocialIcon(profile.platform)}
                            <a 
                              href={profile.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {profile.username || profile.url}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="space-y-2">
                    <div className="font-medium">Tags</div>
                    <div className="flex flex-wrap gap-1">
                      {editedContact.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Information */}
              {company && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Company</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Building className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">{company.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {company.industry}
                        </div>
                      </div>
                    </div>
                    
                    {company.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="h-4 w-4 text-gray-500" />
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {company.website}
                        </a>
                      </div>
                    )}

                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <div>Size: {company.size}</div>
                      <div>Employees: {company.employeeCount?.toLocaleString()}</div>
                      {company.annualRevenue && (
                        <div>Revenue: {formatCurrency(company.annualRevenue)}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {deals.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Deals
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(deals.reduce((sum, deal) => sum + deal.value, 0))}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total Value
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {activities.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Activities
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {emailThreads.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Email Threads
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editedContact.notes || ''}
                    onChange={(e) => setEditedContact({ ...editedContact, notes: e.target.value })}
                    placeholder="Add notes about this contact..."
                    rows={4}
                  />
                ) : (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {editedContact.notes || 'No notes available'}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            <div className="space-y-4">
              {activities.map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                        {activity.type === 'call' && <Phone className="h-4 w-4 text-orange-600" />}
                        {activity.type === 'email' && <Mail className="h-4 w-4 text-orange-600" />}
                        {activity.type === 'meeting' && <Calendar className="h-4 w-4 text-orange-600" />}
                        {activity.type === 'note' && <FileText className="h-4 w-4 text-orange-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{activity.title}</h4>
                          <span className="text-sm text-gray-500">
                            {formatDate(new Date(activity.date))}
                          </span>
                        </div>
                        {activity.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {activity.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {activity.priority}
                          </Badge>
                          {activity.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="deals" className="space-y-4">
            <div className="space-y-4">
              {deals.map((deal) => (
                <Card key={deal.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{deal.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {deal.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(deal.value)}</div>
                        <Badge variant="outline" className="text-xs">
                          {deal.stage}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="emails" className="space-y-4">
            <div className="space-y-4">
              {emailThreads.map((thread) => (
                <Card key={thread.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{thread.subject}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {thread.messageCount} messages
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {formatDate(new Date(thread.lastMessageDate))}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {thread.folder}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  Notes feature coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ContactProfile
