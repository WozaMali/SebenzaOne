// CRM Service for managing CRM data
import { supabase, isSupabaseEnabled } from '@/lib/supabase-client'
import { 
  Contact, Company, Deal, Activity, EmailThread, EmailMessage, 
  DealStage, DealStageConfig, CRMAnalytics, CRMSearchQuery, 
  CRMSearchResult, CRMImportResult, Task, Communication,
  ImportError, ImportWarning
} from '@/types/crm'

class CRMService {
  private contacts: Contact[] = []
  private companies: Company[] = []
  private deals: Deal[] = []
  private activities: Activity[] = []
  private emailThreads: EmailThread[] = []
  private tasks: Task[] = []
  private communications: Communication[] = []

  // Default deal stages configuration
  private dealStages: DealStageConfig[] = [
    { id: 'lead', name: 'Lead', description: 'Initial contact made', color: '#3b82f6', order: 1, isWon: false, isLost: false, isActive: true, probability: 10, requirements: [] },
    { id: 'qualified', name: 'Qualified', description: 'Lead qualified and interested', color: '#8b5cf6', order: 2, isWon: false, isLost: false, isActive: true, probability: 25, requirements: [] },
    { id: 'proposal', name: 'Proposal', description: 'Proposal sent to client', color: '#f59e0b', order: 3, isWon: false, isLost: false, isActive: true, probability: 50, requirements: [] },
    { id: 'negotiation', name: 'Negotiation', description: 'Negotiating terms and pricing', color: '#ef4444', order: 4, isWon: false, isLost: false, isActive: true, probability: 75, requirements: [] },
    { id: 'closed-won', name: 'Closed Won', description: 'Deal successfully closed', color: '#10b981', order: 5, isWon: true, isLost: false, isActive: true, probability: 100, requirements: [] },
    { id: 'closed-lost', name: 'Closed Lost', description: 'Deal lost or cancelled', color: '#6b7280', order: 6, isWon: false, isLost: true, isActive: true, probability: 0, requirements: [] }
  ]

  constructor() {
    // Don't load from Supabase during construction - do it lazily
    // This prevents SSR issues
  }

  private async loadFromSupabase() {
    if (!isSupabaseEnabled() || !supabase) {
      console.log('Supabase is not configured. CRM data will be stored locally.')
      return
    }
    
    // Only load in browser environment
    if (typeof window === 'undefined') {
      return
    }

    try {
      // Load contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('crm_contacts')
        .select('*')
        .order('created_at', { ascending: true })

      if (contactsError) throw contactsError
      if (contactsData) {
        this.contacts = contactsData.map(this.transformContactFromSupabase)
      }

      // Load companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('crm_companies')
        .select('*')
        .order('created_at', { ascending: true })

      if (companiesError) throw companiesError
      if (companiesData) {
        this.companies = companiesData.map(this.transformCompanyFromSupabase)
      }

      // Load deals
      const { data: dealsData, error: dealsError } = await supabase
        .from('crm_deals')
        .select('*')
        .order('created_at', { ascending: false })

      if (dealsError) throw dealsError
      if (dealsData) {
        this.deals = dealsData.map(this.transformDealFromSupabase)
      }

      // Load activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('crm_activities')
        .select('*')
        .order('date', { ascending: false })

      if (activitiesError) throw activitiesError
      if (activitiesData) {
        this.activities = activitiesData.map(this.transformActivityFromSupabase)
      }

      // Load email threads
      const { data: threadsData, error: threadsError } = await supabase
        .from('crm_email_threads')
        .select('*')
        .order('last_message_date', { ascending: false })

      if (threadsError) throw threadsError
      if (threadsData) {
        this.emailThreads = threadsData.map(this.transformEmailThreadFromSupabase)
      }

    } catch (error) {
      console.error('Error loading data from Supabase:', error)
    }
  }

  private transformContactFromSupabase(data: any): Contact {
    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      title: data.title,
      companyId: data.company_id,
      avatar: data.avatar,
      notes: data.notes,
      tags: data.tags || [],
      isFavorite: data.is_favorite,
      source: data.source,
      status: data.status,
      lastContactDate: data.last_contact_date ? new Date(data.last_contact_date) : undefined,
      nextFollowUp: data.next_follow_up ? new Date(data.next_follow_up) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      createdBy: data.created_by,
      assignedTo: data.assigned_to,
      customFields: data.custom_fields || {},
      socialProfiles: data.social_profiles || [],
      addresses: data.addresses || [],
      communicationHistory: []
    }
  }

  private transformCompanyFromSupabase(data: any): Company {
    return {
      id: data.id,
      name: data.name,
      website: data.website,
      industry: data.industry,
      size: data.size,
      description: data.description,
      logo: data.logo,
      phone: data.phone,
      email: data.email,
      address: data.address,
      tags: data.tags || [],
      isFavorite: data.is_favorite,
      status: data.status,
      annualRevenue: data.annual_revenue,
      employeeCount: data.employee_count,
      foundedYear: data.founded_year,
      lastContactDate: data.last_contact_date ? new Date(data.last_contact_date) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      createdBy: data.created_by,
      assignedTo: data.assigned_to,
      customFields: data.custom_fields || {},
      socialProfiles: data.social_profiles || [],
      contacts: [],
      deals: []
    }
  }

  private transformDealFromSupabase(data: any): Deal {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      value: data.value,
      currency: data.currency,
      stage: data.stage,
      probability: data.probability,
      closeDate: data.close_date ? new Date(data.close_date) : undefined,
      expectedCloseDate: data.expected_close_date ? new Date(data.expected_close_date) : undefined,
      contactId: data.contact_id,
      companyId: data.company_id,
      ownerId: data.owner_id,
      source: data.source,
      priority: data.priority,
      status: data.status,
      tags: data.tags || [],
      notes: data.notes,
      activities: [],
      attachments: [],
      customFields: data.custom_fields || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      lastActivityAt: data.last_activity_at ? new Date(data.last_activity_at) : undefined,
      wonDate: data.won_date ? new Date(data.won_date) : undefined,
      lostDate: data.lost_date ? new Date(data.lost_date) : undefined,
      lostReason: data.lost_reason,
      nextFollowUp: data.next_follow_up ? new Date(data.next_follow_up) : undefined,
      emailThreads: []
    }
  }

  private transformActivityFromSupabase(data: any): Activity {
    return {
      id: data.id,
      type: data.type,
      title: data.title,
      description: data.description,
      date: new Date(data.date),
      duration: data.duration,
      contactId: data.contact_id,
      companyId: data.company_id,
      dealId: data.deal_id,
      userId: data.user_id,
      isCompleted: data.is_completed,
      priority: data.priority,
      tags: data.tags || [],
      attachments: [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      emailThreadId: data.email_thread_id
    }
  }

  private transformEmailThreadFromSupabase(data: any): EmailThread {
    return {
      id: data.id,
      subject: data.subject,
      participants: data.participants || [],
      lastMessageDate: new Date(data.last_message_date),
      messageCount: data.message_count,
      isRead: data.is_read,
      isImportant: data.is_important,
      isStarred: data.is_starred,
      folder: data.folder,
      labels: data.labels || [],
      contactId: data.contact_id,
      companyId: data.company_id,
      dealId: data.deal_id,
      activityId: data.activity_id,
      messages: [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }


  private dataLoaded = false
  
  private ensureDataLoaded() {
    // Lazy load data from Supabase on first access (fire and forget)
    if (typeof window !== 'undefined' && !this.dataLoaded && this.contacts.length === 0 && this.companies.length === 0) {
      this.dataLoaded = true
      this.loadFromSupabase().catch(err => {
        console.error('Error loading data from Supabase:', err)
        this.dataLoaded = false // Allow retry
      })
    }
  }

  // Contact methods
  getContacts(): Contact[] {
    this.ensureDataLoaded()
    return [...this.contacts]
  }

  getContact(id: string): Contact | undefined {
    return this.contacts.find(c => c.id === id)
  }

  async createContact(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
    const newContact: Contact = {
      ...contact,
      id: `contact-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // Save to Supabase if enabled
    if (isSupabaseEnabled && supabase) {
      try {
        const { data, error } = await supabase
          .from('crm_contacts')
          .insert({
            id: newContact.id,
            first_name: newContact.firstName,
            last_name: newContact.lastName,
            email: newContact.email,
            phone: newContact.phone,
            title: newContact.title,
            company_id: newContact.companyId,
            avatar: newContact.avatar,
            notes: newContact.notes,
            tags: newContact.tags,
            is_favorite: newContact.isFavorite,
            source: newContact.source,
            status: newContact.status,
            last_contact_date: newContact.lastContactDate?.toISOString(),
            next_follow_up: newContact.nextFollowUp?.toISOString(),
            created_by: newContact.createdBy,
            assigned_to: newContact.assignedTo,
            custom_fields: newContact.customFields,
            social_profiles: newContact.socialProfiles,
            addresses: newContact.addresses,
            created_at: newContact.createdAt.toISOString(),
            updated_at: newContact.updatedAt.toISOString()
          })
          .select()
          .single()
        
        if (error) throw error
      } catch (error) {
        console.error('Error creating contact in Supabase:', error)
      }
    }
    
    this.contacts.push(newContact)
    return newContact
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact | null> {
    const index = this.contacts.findIndex(c => c.id === id)
    if (index !== -1) {
      const updatedContact = { ...this.contacts[index], ...updates, updatedAt: new Date() }
      
      // Update in Supabase if enabled
      if (isSupabaseEnabled && supabase) {
        try {
          const { error } = await supabase
            .from('crm_contacts')
            .update({
              first_name: updatedContact.firstName,
              last_name: updatedContact.lastName,
              email: updatedContact.email,
              phone: updatedContact.phone,
              title: updatedContact.title,
              company_id: updatedContact.companyId,
              avatar: updatedContact.avatar,
              notes: updatedContact.notes,
              tags: updatedContact.tags,
              is_favorite: updatedContact.isFavorite,
              source: updatedContact.source,
              status: updatedContact.status,
              last_contact_date: updatedContact.lastContactDate?.toISOString(),
              next_follow_up: updatedContact.nextFollowUp?.toISOString(),
              assigned_to: updatedContact.assignedTo,
              custom_fields: updatedContact.customFields,
              social_profiles: updatedContact.socialProfiles,
              addresses: updatedContact.addresses,
              updated_at: updatedContact.updatedAt.toISOString()
            })
            .eq('id', id)
          
          if (error) throw error
        } catch (error) {
          console.error('Error updating contact in Supabase:', error)
        }
      }
      
      this.contacts[index] = updatedContact
      return updatedContact
    }
    return null
  }

  async deleteContact(id: string): Promise<boolean> {
    const index = this.contacts.findIndex(c => c.id === id)
    if (index !== -1) {
      // Delete from Supabase if enabled
      if (isSupabaseEnabled && supabase) {
        try {
          const { error } = await supabase
            .from('crm_contacts')
            .delete()
            .eq('id', id)
          
          if (error) throw error
        } catch (error) {
          console.error('Error deleting contact from Supabase:', error)
        }
      }
      
      this.contacts.splice(index, 1)
      return true
    }
    return false
  }

  // Company methods
  getCompanies(): Company[] {
    this.ensureDataLoaded()
    return [...this.companies]
  }

  getCompany(id: string): Company | undefined {
    return this.companies.find(c => c.id === id)
  }

  createCompany(company: Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'contacts' | 'deals'>): Company {
    const newCompany: Company = {
      ...company,
      id: `company-${Date.now()}`,
      contacts: [],
      deals: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.companies.push(newCompany)
    return newCompany
  }

  updateCompany(id: string, updates: Partial<Company>): Company | null {
    const index = this.companies.findIndex(c => c.id === id)
    if (index !== -1) {
      this.companies[index] = { ...this.companies[index], ...updates, updatedAt: new Date() }
      return this.companies[index]
    }
    return null
  }

  deleteCompany(id: string): boolean {
    const index = this.companies.findIndex(c => c.id === id)
    if (index !== -1) {
      this.companies.splice(index, 1)
      return true
    }
    return false
  }

  // Deal methods
  getDeals(): Deal[] {
    this.ensureDataLoaded()
    return [...this.deals]
  }

  getDeal(id: string): Deal | undefined {
    return this.deals.find(d => d.id === id)
  }

  getDealsByStage(stage: DealStage): Deal[] {
    return this.deals.filter(d => d.stage === stage)
  }

  createDeal(deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'activities' | 'attachments' | 'emailThreads'>): Deal {
    const newDeal: Deal = {
      ...deal,
      id: `deal-${Date.now()}`,
      activities: [],
      attachments: [],
      emailThreads: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.deals.push(newDeal)
    return newDeal
  }

  updateDeal(id: string, updates: Partial<Deal>): Deal | null {
    const index = this.deals.findIndex(d => d.id === id)
    if (index !== -1) {
      this.deals[index] = { ...this.deals[index], ...updates, updatedAt: new Date() }
      return this.deals[index]
    }
    return null
  }

  moveDealToStage(dealId: string, stage: DealStage): Deal | null {
    const deal = this.getDeal(dealId)
    if (deal) {
      deal.stage = stage
      deal.updatedAt = new Date()
      
      if (stage === 'closed-won') {
        deal.status = 'won'
        deal.wonDate = new Date()
      } else if (stage === 'closed-lost') {
        deal.status = 'lost'
        deal.lostDate = new Date()
      }
      
      return deal
    }
    return null
  }

  deleteDeal(id: string): boolean {
    const index = this.deals.findIndex(d => d.id === id)
    if (index !== -1) {
      this.deals.splice(index, 1)
      return true
    }
    return false
  }

  // Activity methods
  getActivities(): Activity[] {
    this.ensureDataLoaded()
    return [...this.activities]
  }

  getActivity(id: string): Activity | undefined {
    return this.activities.find(a => a.id === id)
  }

  createActivity(activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt' | 'attachments'>): Activity {
    const newActivity: Activity = {
      ...activity,
      id: `activity-${Date.now()}`,
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.activities.push(newActivity)
    return newActivity
  }

  updateActivity(id: string, updates: Partial<Activity>): Activity | null {
    const index = this.activities.findIndex(a => a.id === id)
    if (index !== -1) {
      this.activities[index] = { ...this.activities[index], ...updates, updatedAt: new Date() }
      return this.activities[index]
    }
    return null
  }

  deleteActivity(id: string): boolean {
    const index = this.activities.findIndex(a => a.id === id)
    if (index !== -1) {
      this.activities.splice(index, 1)
      return true
    }
    return false
  }

  // Email Thread methods
  getEmailThreads(): EmailThread[] {
    return [...this.emailThreads]
  }

  getEmailThread(id: string): EmailThread | undefined {
    return this.emailThreads.find(t => t.id === id)
  }

  getEmailThreadsForEntity(entityType: 'contact' | 'company' | 'deal', entityId: string): EmailThread[] {
    return this.emailThreads.filter(t => {
      switch (entityType) {
        case 'contact':
          return t.contactId === entityId
        case 'company':
          return t.companyId === entityId
        case 'deal':
          return t.dealId === entityId
        default:
          return false
      }
    })
  }

  // Deal Stages methods
  getDealStages(): DealStageConfig[] {
    return [...this.dealStages]
  }

  getDealStage(id: DealStage): DealStageConfig | undefined {
    return this.dealStages.find(s => s.id === id)
  }

  // Search methods
  search(query: CRMSearchQuery): CRMSearchResult {
    const { query: searchQuery, entity, filters, sortBy, sortOrder, page, limit } = query
    
    let results = {
      contacts: [] as Contact[],
      companies: [] as Company[],
      deals: [] as Deal[],
      activities: [] as Activity[],
      total: 0,
      page,
      limit,
      hasMore: false
    }

    if (entity === 'all' || entity === 'contacts') {
      results.contacts = this.searchContacts(searchQuery, filters)
    }
    
    if (entity === 'all' || entity === 'companies') {
      results.companies = this.searchCompanies(searchQuery, filters)
    }
    
    if (entity === 'all' || entity === 'deals') {
      results.deals = this.searchDeals(searchQuery, filters)
    }
    
    if (entity === 'all' || entity === 'activities') {
      results.activities = this.searchActivities(searchQuery, filters)
    }

    // Apply sorting
    if (sortBy && sortOrder) {
      results.contacts = this.sortEntities(results.contacts, sortBy, sortOrder)
      results.companies = this.sortEntities(results.companies, sortBy, sortOrder)
      results.deals = this.sortEntities(results.deals, sortBy, sortOrder)
      results.activities = this.sortEntities(results.activities, sortBy, sortOrder)
    }

    // Calculate totals
    results.total = results.contacts.length + results.companies.length + results.deals.length + results.activities.length

    return results
  }

  private searchContacts(query: string, filters: any[]): Contact[] {
    let contacts = this.contacts

    if (query) {
      const q = query.toLowerCase()
      contacts = contacts.filter(c => 
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.title?.toLowerCase().includes(q) ||
        c.company?.name.toLowerCase().includes(q)
      )
    }

    // Apply filters
    contacts = this.applyFilters(contacts, filters)

    return contacts
  }

  private searchCompanies(query: string, filters: any[]): Company[] {
    let companies = this.companies

    if (query) {
      const q = query.toLowerCase()
      companies = companies.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.industry?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      )
    }

    // Apply filters
    companies = this.applyFilters(companies, filters)

    return companies
  }

  private searchDeals(query: string, filters: any[]): Deal[] {
    let deals = this.deals

    if (query) {
      const q = query.toLowerCase()
      deals = deals.filter(d => 
        d.name.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.contact?.firstName.toLowerCase().includes(q) ||
        d.contact?.lastName.toLowerCase().includes(q) ||
        d.company?.name.toLowerCase().includes(q)
      )
    }

    // Apply filters
    deals = this.applyFilters(deals, filters)

    return deals
  }

  private searchActivities(query: string, filters: any[]): Activity[] {
    let activities = this.activities

    if (query) {
      const q = query.toLowerCase()
      activities = activities.filter(a => 
        a.title.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.contact?.firstName.toLowerCase().includes(q) ||
        a.contact?.lastName.toLowerCase().includes(q) ||
        a.company?.name.toLowerCase().includes(q)
      )
    }

    // Apply filters
    activities = this.applyFilters(activities, filters)

    return activities
  }

  private applyFilters<T>(entities: T[], filters: any[]): T[] {
    return entities.filter(entity => {
      return filters.every(filter => {
        const value = (entity as any)[filter.field]
        switch (filter.operator) {
          case 'equals':
            return value === filter.value
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase())
          case 'startsWith':
            return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase())
          case 'endsWith':
            return String(value).toLowerCase().endsWith(String(filter.value).toLowerCase())
          case 'greaterThan':
            return Number(value) > Number(filter.value)
          case 'lessThan':
            return Number(value) < Number(filter.value)
          case 'in':
            return filter.values?.includes(value)
          case 'notIn':
            return !filter.values?.includes(value)
          default:
            return true
        }
      })
    })
  }

  private sortEntities<T>(entities: T[], sortBy: string, sortOrder: 'asc' | 'desc'): T[] {
    return entities.sort((a, b) => {
      const aValue = (a as any)[sortBy]
      const bValue = (b as any)[sortBy]
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }

  // Analytics methods
  getAnalytics(): CRMAnalytics {
    return {
      deals: this.getDealAnalytics(),
      contacts: this.getContactAnalytics(),
      companies: this.getCompanyAnalytics(),
      activities: this.getActivityAnalytics(),
      pipeline: this.getPipelineAnalytics(),
      performance: this.getPerformanceAnalytics()
    }
  }

  private getDealAnalytics() {
    const total = this.deals.length
    const active = this.deals.filter(d => d.status === 'active').length
    const won = this.deals.filter(d => d.status === 'won').length
    const lost = this.deals.filter(d => d.status === 'lost').length
    const totalValue = this.deals.reduce((sum, d) => sum + d.value, 0)
    const averageValue = total > 0 ? totalValue / total : 0
    const winRate = total > 0 ? (won / total) * 100 : 0

    // Calculate average sales cycle (days from creation to close for won deals)
    const wonDealsWithDates = this.deals.filter(d => d.status === 'won' && d.wonDate && d.createdAt)
    const averageSalesCycle = wonDealsWithDates.length > 0
      ? wonDealsWithDates.reduce((sum, d) => {
          const days = Math.floor((d.wonDate!.getTime() - d.createdAt.getTime()) / (1000 * 60 * 60 * 24))
          return sum + days
        }, 0) / wonDealsWithDates.length
      : 0

    // Calculate deals by source
    const dealsBySource = this.deals.reduce((acc, d) => {
      acc[d.source] = (acc[d.source] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate deals by owner
    const dealsByOwner = this.deals.reduce((acc, d) => {
      acc[d.ownerId] = (acc[d.ownerId] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate monthly trends (last 12 months)
    const monthlyTrends = this.calculateMonthlyTrends(this.deals, d => d.createdAt, d => d.value)

    // Calculate quarterly trends
    const quarterlyTrends = this.calculateQuarterlyTrends(this.deals, d => d.createdAt, d => d.value)

    return {
      total,
      active,
      won,
      lost,
      totalValue,
      averageValue,
      averageDealSize: averageValue,
      winRate,
      conversionRate: winRate,
      averageSalesCycle: Math.round(averageSalesCycle),
      dealsByStage: this.dealStages.reduce((acc, stage) => {
        acc[stage.id] = this.deals.filter(d => d.stage === stage.id).length
        return acc
      }, {} as Record<DealStage, number>),
      dealsBySource,
      dealsByOwner,
      monthlyTrends,
      quarterlyTrends
    }
  }

  private getContactAnalytics() {
    const total = this.contacts.length
    const active = this.contacts.filter(c => c.status === 'active').length
    const now = new Date()
    const newThisMonth = this.contacts.filter(c => 
      c.createdAt.getMonth() === now.getMonth() && 
      c.createdAt.getFullYear() === now.getFullYear()
    ).length

    // Calculate new this quarter
    const currentQuarter = Math.floor(now.getMonth() / 3)
    const newThisQuarter = this.contacts.filter(c => {
      const contactQuarter = Math.floor(c.createdAt.getMonth() / 3)
      return contactQuarter === currentQuarter && c.createdAt.getFullYear() === now.getFullYear()
    }).length

    // Calculate by status
    const byStatus = this.contacts.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate by source
    const bySource = this.contacts.reduce((acc, c) => {
      acc[c.source] = (acc[c.source] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate by owner
    const byOwner = this.contacts.reduce((acc, c) => {
      if (c.assignedTo) {
        acc[c.assignedTo] = (acc[c.assignedTo] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    // Calculate average lifetime value (sum of all deal values for contacts)
    const contactDealValues = this.contacts.map(contact => {
      const contactDeals = this.deals.filter(d => d.contactId === contact.id && d.status === 'won')
      return contactDeals.reduce((sum, d) => sum + d.value, 0)
    }).filter(v => v > 0)
    const averageLifetimeValue = contactDealValues.length > 0
      ? contactDealValues.reduce((sum, v) => sum + v, 0) / contactDealValues.length
      : 0

    // Calculate engagement score (based on activities, emails, and last contact date)
    const engagementScores = this.contacts.map(contact => {
      let score = 0
      // Activities count (max 40 points)
      const activitiesCount = this.activities.filter(a => a.contactId === contact.id).length
      score += Math.min(activitiesCount * 2, 40)
      // Email threads count (max 30 points)
      const emailThreadsCount = this.emailThreads.filter(t => t.contactId === contact.id).length
      score += Math.min(emailThreadsCount * 3, 30)
      // Recent contact (max 30 points)
      if (contact.lastContactDate) {
        const daysSinceContact = Math.floor((now.getTime() - contact.lastContactDate.getTime()) / (1000 * 60 * 60 * 24))
        if (daysSinceContact <= 7) score += 30
        else if (daysSinceContact <= 30) score += 20
        else if (daysSinceContact <= 90) score += 10
      }
      return score
    })
    const averageEngagementScore = engagementScores.length > 0
      ? engagementScores.reduce((sum, s) => sum + s, 0) / engagementScores.length
      : 0

    // Calculate monthly trends
    const monthlyTrends = this.calculateMonthlyTrends(this.contacts, c => c.createdAt, () => 1)

    return {
      total,
      active,
      newThisMonth,
      newThisQuarter,
      byStatus,
      bySource,
      byOwner,
      averageLifetimeValue: Math.round(averageLifetimeValue),
      engagementScore: Math.round(averageEngagementScore),
      monthlyTrends
    }
  }

  private getCompanyAnalytics() {
    const total = this.companies.length
    const active = this.companies.filter(c => c.status === 'active').length
    const now = new Date()
    const newThisMonth = this.companies.filter(c => 
      c.createdAt.getMonth() === now.getMonth() && 
      c.createdAt.getFullYear() === now.getFullYear()
    ).length

    // Calculate by industry
    const byIndustry = this.companies.reduce((acc, c) => {
      if (c.industry) {
        acc[c.industry] = (acc[c.industry] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    // Calculate by size
    const bySize = this.companies.reduce((acc, c) => {
      if (c.size) {
        acc[c.size] = (acc[c.size] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    // Calculate by status
    const byStatus = this.companies.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate average deals per company
    const companiesWithDeals = this.companies.map(company => {
      return this.deals.filter(d => d.companyId === company.id).length
    }).filter(count => count > 0)
    const averageDealsPerCompany = companiesWithDeals.length > 0
      ? companiesWithDeals.reduce((sum, count) => sum + count, 0) / companiesWithDeals.length
      : 0

    // Calculate average value per company (sum of all deal values)
    const companyDealValues = this.companies.map(company => {
      const companyDeals = this.deals.filter(d => d.companyId === company.id)
      return companyDeals.reduce((sum, d) => sum + d.value, 0)
    }).filter(v => v > 0)
    const averageValuePerCompany = companyDealValues.length > 0
      ? companyDealValues.reduce((sum, v) => sum + v, 0) / companyDealValues.length
      : 0

    // Calculate monthly trends
    const monthlyTrends = this.calculateMonthlyTrends(this.companies, c => c.createdAt, () => 1)

    return {
      total,
      active,
      newThisMonth,
      byIndustry,
      bySize,
      byStatus,
      averageDealsPerCompany: Math.round(averageDealsPerCompany * 100) / 100,
      averageValuePerCompany: Math.round(averageValuePerCompany),
      monthlyTrends
    }
  }

  private getActivityAnalytics() {
    const total = this.activities.length
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisWeek = this.activities.filter(a => a.date >= weekAgo).length
    const thisMonth = this.activities.filter(a => 
      a.date.getMonth() === now.getMonth() && 
      a.date.getFullYear() === now.getFullYear()
    ).length

    // Calculate by type
    const byType = this.activities.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate by user
    const byUser = this.activities.reduce((acc, a) => {
      acc[a.userId] = (acc[a.userId] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate average per day (last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const activitiesLast30Days = this.activities.filter(a => a.date >= thirtyDaysAgo).length
    const averagePerDay = activitiesLast30Days / 30

    // Calculate completion rate
    const completed = this.activities.filter(a => a.isCompleted).length
    const completionRate = total > 0 ? (completed / total) * 100 : 0

    // Calculate monthly trends
    const monthlyTrends = this.calculateMonthlyTrends(this.activities, a => a.date, () => 1)

    return {
      total,
      thisWeek,
      thisMonth,
      byType,
      byUser,
      averagePerDay: Math.round(averagePerDay * 100) / 100,
      completionRate: Math.round(completionRate * 100) / 100,
      monthlyTrends
    }
  }

  private getPipelineAnalytics() {
    const activeDeals = this.deals.filter(d => d.status === 'active')
    const now = new Date()
    const totalValue = activeDeals.reduce((sum, d) => sum + d.value, 0)
    const weightedValue = activeDeals.reduce((sum, d) => sum + (d.value * d.probability / 100), 0)

    // Calculate stage transitions for conversion rates and average stage time
    const stageTransitions: Record<DealStage, { entered: Date[], exited: Date[] }> = {} as any
    this.dealStages.forEach(stage => {
      stageTransitions[stage.id] = { entered: [], exited: [] }
    })

    // Track deal stage history (simplified - in real app, would use audit log)
    // For now, calculate based on deal age and current stage
    const dealsByStage = this.dealStages.reduce((acc, stage) => {
      const stageDeals = activeDeals.filter(d => d.stage === stage.id)
      const stageValues = stageDeals.reduce((sum, d) => sum + d.value, 0)
      const stageWeightedValue = stageDeals.reduce((sum, d) => sum + (d.value * d.probability / 100), 0)
      const averageValue = stageDeals.length > 0 ? stageValues / stageDeals.length : 0

      // Calculate average age (days in current stage, approximated from deal age)
      const averageAge = stageDeals.length > 0
        ? stageDeals.reduce((sum, d) => {
            const daysInStage = Math.floor((now.getTime() - d.createdAt.getTime()) / (1000 * 60 * 60 * 24))
            return sum + daysInStage
          }, 0) / stageDeals.length
        : 0

      // Calculate conversion rate to next stage (simplified - would need stage history)
      // For now, estimate based on deals that progressed from this stage
      const dealsInThisStage = this.deals.filter(d => d.stage === stage.id)
      const dealsInNextStage = stage.order < 5 
        ? this.deals.filter(d => {
            const nextStage = this.dealStages.find(s => s.order === stage.order + 1)
            return nextStage && d.stage === nextStage.id
          }).length
        : 0
      const conversionRate = dealsInThisStage.length > 0
        ? (dealsInNextStage / dealsInThisStage.length) * 100
        : 0

      acc[stage.id] = {
        count: stageDeals.length,
        value: stageValues,
        weightedValue: stageWeightedValue,
        averageValue: Math.round(averageValue),
        averageAge: Math.round(averageAge),
        conversionRate: Math.round(conversionRate * 100) / 100
      }
      return acc
    }, {} as Record<DealStage, any>)

    // Calculate conversion rates between stages
    const conversionRates: Record<DealStage, number> = {} as any
    this.dealStages.forEach(stage => {
      if (stage.order < 5) {
        const dealsInStage = this.deals.filter(d => d.stage === stage.id).length
        const nextStage = this.dealStages.find(s => s.order === stage.order + 1)
        if (nextStage) {
          const dealsInNextStage = this.deals.filter(d => d.stage === nextStage.id).length
          conversionRates[stage.id] = dealsInStage > 0
            ? (dealsInNextStage / dealsInStage) * 100
            : 0
        }
      }
    })

    // Calculate average time in each stage (simplified - would need stage history)
    const averageStageTime: Record<DealStage, number> = {} as any
    this.dealStages.forEach(stage => {
      const dealsInStage = this.deals.filter(d => d.stage === stage.id)
      if (dealsInStage.length > 0) {
        const totalDays = dealsInStage.reduce((sum, d) => {
          const days = Math.floor((now.getTime() - d.createdAt.getTime()) / (1000 * 60 * 60 * 24))
          return sum + days
        }, 0)
        averageStageTime[stage.id] = Math.round(totalDays / dealsInStage.length)
      } else {
        averageStageTime[stage.id] = 0
      }
    })

    // Calculate pipeline velocity (value moved through pipeline per month)
    const wonDealsLastMonth = this.deals.filter(d => {
      if (d.status !== 'won' || !d.wonDate) return false
      const daysAgo = Math.floor((now.getTime() - d.wonDate.getTime()) / (1000 * 60 * 60 * 24))
      return daysAgo <= 30
    })
    const velocity = wonDealsLastMonth.reduce((sum, d) => sum + d.value, 0)

    // Calculate forecast (based on weighted pipeline value)
    const forecast = {
      optimistic: weightedValue * 1.2, // 20% above weighted
      realistic: weightedValue,
      pessimistic: weightedValue * 0.8, // 20% below weighted
      confidence: activeDeals.length > 0 ? Math.min((activeDeals.length / 10) * 100, 100) : 0,
      lastUpdated: now
    }

    return {
      totalValue,
      weightedValue,
      dealsByStage,
      velocity: Math.round(velocity),
      conversionRates,
      averageStageTime,
      forecast
    }
  }

  private getPerformanceAnalytics() {
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
    const thisQuarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
    const lastQuarterStart = new Date(now.getFullYear(), (Math.floor(now.getMonth() / 3) - 1) * 3, 1)
    const lastQuarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 0)
    const thisYearStart = new Date(now.getFullYear(), 0, 1)
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1)
    const lastYearEnd = new Date(now.getFullYear(), 0, 0)

    // Calculate revenue from won deals
    const calculateRevenue = (startDate: Date, endDate: Date) => {
      return this.deals
        .filter(d => d.status === 'won' && d.wonDate && d.wonDate >= startDate && d.wonDate <= endDate)
        .reduce((sum, d) => sum + d.value, 0)
    }

    const thisMonthRevenue = calculateRevenue(thisMonthStart, now)
    const lastMonthRevenue = calculateRevenue(lastMonthStart, lastMonthEnd)
    const thisQuarterRevenue = calculateRevenue(thisQuarterStart, now)
    const lastQuarterRevenue = calculateRevenue(lastQuarterStart, lastQuarterEnd)
    const thisYearRevenue = calculateRevenue(thisYearStart, now)
    const lastYearRevenue = calculateRevenue(lastYearStart, lastYearEnd)
    const totalRevenue = this.deals
      .filter(d => d.status === 'won')
      .reduce((sum, d) => sum + d.value, 0)

    const monthlyGrowth = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0

    // Set target (can be configured, for now use 120% of last year's revenue / 12)
    const target = lastYearRevenue > 0 ? (lastYearRevenue / 12) * 1.2 : 0
    const achievement = target > 0 ? (thisMonthRevenue / target) * 100 : 0

    // Calculate revenue trends (monthly for last 12 months)
    const trends: Array<{ month: string, revenue: number }> = []
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const monthRevenue = calculateRevenue(monthStart, monthEnd)
      trends.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: Math.round(monthRevenue)
      })
    }

    // Calculate user rankings by deal value
    const rankings = Object.entries(
      this.deals
        .filter(d => d.status === 'won')
        .reduce((acc, d) => {
          acc[d.ownerId] = (acc[d.ownerId] || 0) + d.value
          return acc
        }, {} as Record<string, number>)
    )
      .map(([userId, revenue]) => ({ userId, revenue: Math.round(revenue) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    return {
      revenue: {
        total: Math.round(totalRevenue),
        thisMonth: Math.round(thisMonthRevenue),
        lastMonth: Math.round(lastMonthRevenue),
        thisQuarter: Math.round(thisQuarterRevenue),
        lastQuarter: Math.round(lastQuarterRevenue),
        thisYear: Math.round(thisYearRevenue),
        lastYear: Math.round(lastYearRevenue),
        growth: Math.round(monthlyGrowth * 100) / 100,
        target: Math.round(target),
        achievement: Math.round(achievement * 100) / 100
      },
      goals: [], // Can be populated from goals module
      achievements: [], // Can be populated from achievements
      rankings,
      trends
    }
  }

  // Helper method to calculate monthly trends
  private calculateMonthlyTrends<T>(
    items: T[],
    getDate: (item: T) => Date,
    getValue: (item: T) => number
  ): Array<{ month: string, count: number, value: number }> {
    const now = new Date()
    const trends: Array<{ month: string, count: number, value: number }> = []
    
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const monthItems = items.filter(item => {
        const itemDate = getDate(item)
        return itemDate >= monthStart && itemDate <= monthEnd
      })
      
      trends.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count: monthItems.length,
        value: monthItems.reduce((sum, item) => sum + getValue(item), 0)
      })
    }
    
    return trends
  }

  // Helper method to calculate quarterly trends
  private calculateQuarterlyTrends<T>(
    items: T[],
    getDate: (item: T) => Date,
    getValue: (item: T) => number
  ): Array<{ quarter: string, count: number, value: number }> {
    const now = new Date()
    const trends: Array<{ quarter: string, count: number, value: number }> = []
    
    for (let i = 3; i >= 0; i--) {
      const quarter = Math.floor(now.getMonth() / 3) - i
      const year = quarter < 0 ? now.getFullYear() - 1 : now.getFullYear()
      const adjustedQuarter = quarter < 0 ? quarter + 4 : quarter
      const quarterStart = new Date(year, adjustedQuarter * 3, 1)
      const quarterEnd = new Date(year, (adjustedQuarter + 1) * 3, 0)
      
      const quarterItems = items.filter(item => {
        const itemDate = getDate(item)
        return itemDate >= quarterStart && itemDate <= quarterEnd
      })
      
      trends.push({
        quarter: `Q${adjustedQuarter + 1} ${year}`,
        count: quarterItems.length,
        value: quarterItems.reduce((sum, item) => sum + getValue(item), 0)
      })
    }
    
    return trends
  }

  // Import/Export methods
  async importData(data: {
    contacts?: Partial<Contact>[]
    companies?: Partial<Company>[]
    deals?: Partial<Deal>[]
    activities?: Partial<Activity>[]
  }, options: {
    skipDuplicates?: boolean
    updateExisting?: boolean
    validateEmail?: boolean
  } = {}): Promise<CRMImportResult> {
    const { skipDuplicates = true, updateExisting = false, validateEmail = true } = options
    const errors: ImportError[] = []
    const warnings: ImportWarning[] = []
    let imported = 0
    let failed = 0

    // Validate email format
    const isValidEmail = (email: string): boolean => {
      if (!validateEmail) return true
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    }

    // Import contacts
    if (data.contacts) {
      data.contacts.forEach((contactData, index) => {
        try {
          // Validate required fields
          if (!contactData.firstName || !contactData.lastName || !contactData.email) {
            errors.push({
              row: index + 1,
              field: 'contact',
              message: 'Missing required fields: firstName, lastName, or email'
            })
            failed++
            return
          }

          // Validate email format
          if (!isValidEmail(contactData.email)) {
            errors.push({
              row: index + 1,
              field: 'email',
              message: `Invalid email format: ${contactData.email}`
            })
            failed++
            return
          }

          // Check for duplicates
          const existingContact = this.contacts.find(c => c.email === contactData.email)
          if (existingContact) {
            if (skipDuplicates) {
              warnings.push({
                row: index + 1,
                field: 'email',
                message: `Contact with email ${contactData.email} already exists, skipping`
              })
              return
            }
            if (updateExisting) {
              // Update existing contact
              Object.assign(existingContact, {
                ...contactData,
                id: existingContact.id,
                updatedAt: new Date(),
                source: contactData.source || 'import'
              } as Contact)
              imported++
              return
            }
          }

          // Create new contact
          const newContact: Contact = {
            id: `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            firstName: contactData.firstName!,
            lastName: contactData.lastName!,
            email: contactData.email!,
            phone: contactData.phone,
            title: contactData.title,
            companyId: contactData.companyId,
            avatar: contactData.avatar,
            notes: contactData.notes,
            tags: contactData.tags || [],
            isFavorite: contactData.isFavorite || false,
            source: contactData.source || 'import',
            status: contactData.status || 'lead',
            lastContactDate: contactData.lastContactDate,
            nextFollowUp: contactData.nextFollowUp,
            createdAt: contactData.createdAt || new Date(),
            updatedAt: new Date(),
            createdBy: contactData.createdBy || 'system',
            assignedTo: contactData.assignedTo,
            customFields: contactData.customFields || {},
            socialProfiles: contactData.socialProfiles || [],
            addresses: contactData.addresses || [],
            communicationHistory: contactData.communicationHistory || []
          }
          this.contacts.push(newContact)
          imported++
        } catch (error) {
          errors.push({
            row: index + 1,
            field: 'contact',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
          })
          failed++
        }
      })
    }

    // Import companies
    if (data.companies) {
      data.companies.forEach((companyData, index) => {
        try {
          if (!companyData.name) {
            errors.push({
              row: index + 1,
              field: 'company',
              message: 'Missing required field: name'
            })
            failed++
            return
          }

          const existingCompany = this.companies.find(c => c.name === companyData.name)
          if (existingCompany) {
            if (skipDuplicates) {
              warnings.push({
                row: index + 1,
                field: 'name',
                message: `Company ${companyData.name} already exists, skipping`
              })
              return
            }
            if (updateExisting) {
              Object.assign(existingCompany, {
                ...companyData,
                id: existingCompany.id,
                updatedAt: new Date()
              } as Company)
              imported++
              return
            }
          }

          const newCompany: Company = {
            id: `company-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: companyData.name!,
            website: companyData.website,
            industry: companyData.industry,
            size: companyData.size,
            description: companyData.description,
            logo: companyData.logo,
            phone: companyData.phone,
            email: companyData.email,
            address: companyData.address,
            tags: companyData.tags || [],
            isFavorite: companyData.isFavorite || false,
            status: companyData.status || 'prospect',
            annualRevenue: companyData.annualRevenue,
            employeeCount: companyData.employeeCount,
            foundedYear: companyData.foundedYear,
            lastContactDate: companyData.lastContactDate,
            nextFollowUp: companyData.nextFollowUp,
            createdAt: companyData.createdAt || new Date(),
            updatedAt: new Date(),
            createdBy: companyData.createdBy || 'system',
            assignedTo: companyData.assignedTo,
            customFields: companyData.customFields || {},
            socialProfiles: companyData.socialProfiles || [],
            contacts: companyData.contacts || [],
            deals: companyData.deals || []
          }
          this.companies.push(newCompany)
          imported++
        } catch (error) {
          errors.push({
            row: index + 1,
            field: 'company',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
          })
          failed++
        }
      })
    }

    // Import deals
    if (data.deals) {
      data.deals.forEach((dealData, index) => {
        try {
          if (!dealData.name || !dealData.value || dealData.value <= 0) {
            errors.push({
              row: index + 1,
              field: 'deal',
              message: 'Missing required fields or invalid value'
            })
            failed++
            return
          }

          const newDeal: Deal = {
            id: `deal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: dealData.name!,
            description: dealData.description,
            value: dealData.value!,
            currency: dealData.currency || 'USD',
            stage: dealData.stage || 'lead',
            probability: dealData.probability || 0,
            closeDate: dealData.closeDate,
            expectedCloseDate: dealData.expectedCloseDate,
            contactId: dealData.contactId,
            companyId: dealData.companyId,
            ownerId: dealData.ownerId || 'system',
            source: dealData.source || 'other',
            priority: dealData.priority || 'medium',
            status: dealData.status || 'active',
            tags: dealData.tags || [],
            notes: dealData.notes || '',
            activities: dealData.activities || [],
            attachments: dealData.attachments || [],
            customFields: dealData.customFields || {},
            createdAt: dealData.createdAt || new Date(),
            updatedAt: new Date(),
            lastActivityAt: dealData.lastActivityAt,
            wonDate: dealData.wonDate,
            lostDate: dealData.lostDate,
            lostReason: dealData.lostReason,
            nextFollowUp: dealData.nextFollowUp,
            emailThreads: dealData.emailThreads || []
          }
          this.deals.push(newDeal)
          imported++
        } catch (error) {
          errors.push({
            row: index + 1,
            field: 'deal',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
          })
          failed++
        }
      })
    }

    // Import activities
    if (data.activities) {
      data.activities.forEach((activityData, index) => {
        try {
          if (!activityData.type || !activityData.title || !activityData.date) {
            errors.push({
              row: index + 1,
              field: 'activity',
              message: 'Missing required fields: type, title, or date'
            })
            failed++
            return
          }

          const newActivity: Activity = {
            id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: activityData.type!,
            title: activityData.title!,
            description: activityData.description,
            date: activityData.date instanceof Date ? activityData.date : new Date(activityData.date!),
            duration: activityData.duration,
            contactId: activityData.contactId,
            companyId: activityData.companyId,
            dealId: activityData.dealId,
            userId: activityData.userId || 'system',
            isCompleted: activityData.isCompleted || false,
            priority: activityData.priority || 'medium',
            tags: activityData.tags || [],
            attachments: activityData.attachments || [],
            createdAt: activityData.createdAt || new Date(),
            updatedAt: new Date(),
            emailThreadId: activityData.emailThreadId
          }
          this.activities.push(newActivity)
          imported++
        } catch (error) {
          errors.push({
            row: index + 1,
            field: 'activity',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
          })
          failed++
        }
      })
    }

    // Data persisted via Supabase or in-memory

    return {
      imported,
      failed,
      errors,
      warnings
    }
  }

  async exportData(options: {
    contacts?: boolean
    companies?: boolean
    deals?: boolean
    activities?: boolean
    emailThreads?: boolean
    format?: 'json' | 'csv'
    includeMetadata?: boolean
  } = {}): Promise<{
    data: any
    format: string
    filename: string
    mimeType: string
  }> {
    const {
      contacts = true,
      companies = true,
      deals = true,
      activities = true,
      emailThreads = false,
      format = 'json',
      includeMetadata = true
    } = options

    const exportData: any = {}

    if (contacts) {
      exportData.contacts = this.contacts.map(c => ({
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        phone: c.phone,
        title: c.title,
        companyId: c.companyId,
        notes: c.notes,
        tags: c.tags,
        status: c.status,
        source: c.source,
        ...(includeMetadata && {
          id: c.id,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString()
        })
      }))
    }

    if (companies) {
      exportData.companies = this.companies.map(c => ({
        name: c.name,
        website: c.website,
        industry: c.industry,
        size: c.size,
        description: c.description,
        phone: c.phone,
        email: c.email,
        tags: c.tags,
        status: c.status,
        annualRevenue: c.annualRevenue,
        employeeCount: c.employeeCount,
        ...(includeMetadata && {
          id: c.id,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString()
        })
      }))
    }

    if (deals) {
      exportData.deals = this.deals.map(d => ({
        name: d.name,
        description: d.description,
        value: d.value,
        currency: d.currency,
        stage: d.stage,
        probability: d.probability,
        contactId: d.contactId,
        companyId: d.companyId,
        ownerId: d.ownerId,
        source: d.source,
        status: d.status,
        tags: d.tags,
        notes: d.notes,
        closeDate: d.closeDate?.toISOString(),
        expectedCloseDate: d.expectedCloseDate?.toISOString(),
        ...(includeMetadata && {
          id: d.id,
          createdAt: d.createdAt.toISOString(),
          updatedAt: d.updatedAt.toISOString()
        })
      }))
    }

    if (activities) {
      exportData.activities = this.activities.map(a => ({
        type: a.type,
        title: a.title,
        description: a.description,
        date: a.date.toISOString(),
        duration: a.duration,
        contactId: a.contactId,
        companyId: a.companyId,
        dealId: a.dealId,
        userId: a.userId,
        isCompleted: a.isCompleted,
        priority: a.priority,
        tags: a.tags,
        ...(includeMetadata && {
          id: a.id,
          createdAt: a.createdAt.toISOString(),
          updatedAt: a.updatedAt.toISOString()
        })
      }))
    }

    if (emailThreads) {
      exportData.emailThreads = this.emailThreads.map(t => ({
        subject: t.subject,
        participants: t.participants,
        lastMessageDate: t.lastMessageDate.toISOString(),
        messageCount: t.messageCount,
        contactId: t.contactId,
        companyId: t.companyId,
        dealId: t.dealId,
        ...(includeMetadata && {
          id: t.id,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString()
        })
      }))
    }

    if (includeMetadata) {
      exportData.metadata = {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        totalContacts: this.contacts.length,
        totalCompanies: this.companies.length,
        totalDeals: this.deals.length,
        totalActivities: this.activities.length
      }
    }

    const timestamp = new Date().toISOString().split('T')[0]
    let filename = `crm-export-${timestamp}`
    let mimeType = 'application/json'
    let data = exportData

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = this.convertToCSV(exportData)
      filename = `${filename}.csv`
      mimeType = 'text/csv'
      data = csvData
    } else {
      filename = `${filename}.json`
      data = JSON.stringify(exportData, null, 2)
    }

    return {
      data,
      format,
      filename,
      mimeType
    }
  }

  // Helper method to convert data to CSV
  private convertToCSV(data: any): string {
    const csvRows: string[] = []

    // Process each entity type
    Object.keys(data).forEach(key => {
      if (key === 'metadata') return // Skip metadata

      const items = data[key]
      if (!Array.isArray(items) || items.length === 0) return

      // Get headers from first item
      const headers = Object.keys(items[0])
      csvRows.push(`\n=== ${key.toUpperCase()} ===`)
      csvRows.push(headers.join(','))
      
      // Add rows
      items.forEach(item => {
        const values = headers.map(header => {
          const value = item[header]
          if (value === null || value === undefined) return ''
          // Escape commas and quotes in CSV
          if (typeof value === 'string') {
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          }
          if (Array.isArray(value)) {
            return `"${value.join('; ')}"`
          }
          return String(value)
        })
        csvRows.push(values.join(','))
      })
    })

    return csvRows.join('\n')
  }
}

// Create singleton instance
let crmServiceInstance: CRMService | null = null

const createCRMService = () => {
  if (typeof window === 'undefined') {
    // Return a mock service for SSR
    return {
      getContacts: () => [],
      getCompanies: () => [],
      getDeals: () => [],
      getActivities: () => [],
      getEmailThreads: () => [],
      getDealStages: () => [],
      search: () => ({ contacts: [], companies: [], deals: [], activities: [], total: 0, page: 1, limit: 10, hasMore: false }),
      getAnalytics: () => ({} as CRMAnalytics),
      createContact: () => ({} as Contact),
      createCompany: () => ({} as Company),
      createDeal: () => ({} as Deal),
      createActivity: () => ({} as Activity),
      updateContact: () => null,
      updateCompany: () => null,
      updateDeal: () => null,
      updateActivity: () => null,
      deleteContact: () => false,
      deleteCompany: () => false,
      deleteDeal: () => false,
      deleteActivity: () => false,
      moveDealToStage: () => null,
      importData: async () => ({ imported: 0, failed: 0, errors: [], warnings: [] }),
      exportData: async () => ({})
    }
  }
  
  if (!crmServiceInstance) {
    crmServiceInstance = new CRMService()
  }
  return crmServiceInstance
}

export const crmService = {
  get instance() {
    return createCRMService()
  },
  
  // Proxy methods
  getContacts: () => createCRMService().getContacts(),
  getCompanies: () => createCRMService().getCompanies(),
  getDeals: () => createCRMService().getDeals(),
  getActivities: () => createCRMService().getActivities(),
  getEmailThreads: () => createCRMService().getEmailThreads(),
  getDealStages: () => createCRMService().getDealStages(),
  search: (query: CRMSearchQuery) => createCRMService().search(query),
  getAnalytics: () => createCRMService().getAnalytics(),
  createContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => createCRMService().createContact(contact),
  createCompany: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'contacts' | 'deals'>) => createCRMService().createCompany(company),
  createDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'activities' | 'attachments' | 'emailThreads'>) => createCRMService().createDeal(deal),
  createActivity: (activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt' | 'attachments'>) => createCRMService().createActivity(activity),
  updateContact: (id: string, updates: Partial<Contact>) => createCRMService().updateContact(id, updates),
  updateCompany: (id: string, updates: Partial<Company>) => createCRMService().updateCompany(id, updates),
  updateDeal: (id: string, updates: Partial<Deal>) => createCRMService().updateDeal(id, updates),
  updateActivity: (id: string, updates: Partial<Activity>) => createCRMService().updateActivity(id, updates),
  deleteContact: (id: string) => createCRMService().deleteContact(id),
  deleteCompany: (id: string) => createCRMService().deleteCompany(id),
  deleteDeal: (id: string) => createCRMService().deleteDeal(id),
  deleteActivity: (id: string) => createCRMService().deleteActivity(id),
  moveDealToStage: (dealId: string, stage: DealStage) => createCRMService().moveDealToStage(dealId, stage),
  importData: (data: any) => createCRMService().importData(data),
  exportData: (options: any) => createCRMService().exportData(options)
}
