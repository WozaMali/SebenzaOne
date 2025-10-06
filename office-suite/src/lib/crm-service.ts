// CRM Service for managing CRM data
import { supabase, isSupabaseEnabled } from './supabase-client'
import { 
  Contact, Company, Deal, Activity, EmailThread, EmailMessage, 
  DealStage, DealStageConfig, CRMAnalytics, CRMSearchQuery, 
  CRMSearchResult, CRMImportResult, Task, Communication 
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
    this.loadInitialData()
    this.loadFromSupabase()
  }

  private async loadFromSupabase() {
    if (!isSupabaseEnabled || !supabase) return

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

  private loadInitialData() {
    // Load sample data for demonstration
    this.loadSampleContacts()
    this.loadSampleCompanies()
    this.loadSampleDeals()
    this.loadSampleActivities()
    this.loadSampleEmailThreads()
  }

  private loadSampleContacts() {
    this.contacts = [
      {
        id: 'contact-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@acme.com',
        phone: '+1-555-0101',
        title: 'CTO',
        companyId: 'company-1',
        avatar: '/api/placeholder/40/40',
        notes: 'Very interested in our enterprise solution. Prefers email communication.',
        tags: ['enterprise', 'decision-maker', 'hot-lead'],
        isFavorite: true,
        source: 'website',
        status: 'lead',
        lastContactDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        nextFollowUp: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdBy: 'user-1',
        assignedTo: 'user-1',
        customFields: {},
        socialProfiles: [
          { platform: 'linkedin', url: 'https://linkedin.com/in/johndoe', username: 'johndoe', isVerified: true }
        ],
        addresses: [
          {
            type: 'work',
            street: '123 Business Ave',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94105',
            country: 'USA',
            isPrimary: true
          }
        ],
        communicationHistory: []
      },
      {
        id: 'contact-2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@techcorp.com',
        phone: '+1-555-0102',
        title: 'VP of Sales',
        companyId: 'company-2',
        avatar: '/api/placeholder/40/40',
        notes: 'Looking for CRM solution for their sales team. Budget approved.',
        tags: ['crm', 'sales', 'budget-approved'],
        isFavorite: false,
        source: 'referral',
        status: 'customer',
        lastContactDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdBy: 'user-1',
        assignedTo: 'user-2',
        customFields: {},
        socialProfiles: [],
        addresses: [],
        communicationHistory: []
      }
    ]
  }

  private loadSampleCompanies() {
    this.companies = [
      {
        id: 'company-1',
        name: 'Acme Corporation',
        website: 'https://acme.com',
        industry: 'Technology',
        size: 'large',
        description: 'Leading technology company specializing in enterprise solutions.',
        logo: '/api/placeholder/60/60',
        phone: '+1-555-1000',
        email: 'info@acme.com',
        address: {
          type: 'work',
          street: '123 Business Ave',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94105',
          country: 'USA',
          isPrimary: true
        },
        tags: ['enterprise', 'technology', 'fortune-500'],
        isFavorite: true,
        status: 'customer',
        annualRevenue: 50000000,
        employeeCount: 500,
        foundedYear: 2010,
        lastContactDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdBy: 'user-1',
        assignedTo: 'user-1',
        customFields: {},
        socialProfiles: [
          { platform: 'linkedin', url: 'https://linkedin.com/company/acme-corp', username: 'acme-corp', isVerified: true }
        ],
        contacts: [],
        deals: []
      },
      {
        id: 'company-2',
        name: 'TechCorp Solutions',
        website: 'https://techcorp.com',
        industry: 'Software',
        size: 'medium',
        description: 'Software development company focused on CRM solutions.',
        logo: '/api/placeholder/60/60',
        phone: '+1-555-2000',
        email: 'contact@techcorp.com',
        address: {
          type: 'work',
          street: '456 Innovation Blvd',
          city: 'Austin',
          state: 'TX',
          postalCode: '78701',
          country: 'USA',
          isPrimary: true
        },
        tags: ['software', 'crm', 'mid-market'],
        isFavorite: false,
        status: 'prospect',
        annualRevenue: 10000000,
        employeeCount: 100,
        foundedYear: 2015,
        lastContactDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdBy: 'user-1',
        assignedTo: 'user-2',
        customFields: {},
        socialProfiles: [],
        contacts: [],
        deals: []
      }
    ]
  }

  private loadSampleDeals() {
    this.deals = [
      {
        id: 'deal-1',
        name: 'Acme Enterprise License',
        description: 'Enterprise license for 500 users with premium support',
        value: 250000,
        currency: 'ZAR',
        stage: 'proposal',
        probability: 50,
        closeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        contactId: 'contact-1',
        companyId: 'company-1',
        ownerId: 'user-1',
        source: 'website',
        priority: 'high',
        status: 'active',
        tags: ['enterprise', 'license', 'high-value'],
        notes: 'Client is very interested. Waiting for budget approval from board.',
        activities: [],
        attachments: [],
        customFields: {},
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        lastActivityAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        nextFollowUp: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        emailThreads: []
      },
      {
        id: 'deal-2',
        name: 'TechCorp CRM Implementation',
        description: 'Full CRM implementation with custom integrations',
        value: 75000,
        currency: 'ZAR',
        stage: 'qualified',
        probability: 25,
        closeDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        expectedCloseDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        contactId: 'contact-2',
        companyId: 'company-2',
        ownerId: 'user-2',
        source: 'referral',
        priority: 'medium',
        status: 'active',
        tags: ['crm', 'implementation', 'custom'],
        notes: 'Initial discovery call completed. Technical requirements being gathered.',
        activities: [],
        attachments: [],
        customFields: {},
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        lastActivityAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        nextFollowUp: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        emailThreads: []
      }
    ]
  }

  private loadSampleActivities() {
    this.activities = [
      {
        id: 'activity-1',
        type: 'call',
        title: 'Discovery Call with John Doe',
        description: 'Initial discovery call to understand requirements and pain points.',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        duration: 45,
        contactId: 'contact-1',
        companyId: 'company-1',
        dealId: 'deal-1',
        userId: 'user-1',
        isCompleted: true,
        priority: 'high',
        tags: ['discovery', 'requirements'],
        attachments: [],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'activity-2',
        type: 'email',
        title: 'Proposal Sent to Sarah Johnson',
        description: 'Sent detailed proposal with pricing and implementation timeline.',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        contactId: 'contact-2',
        companyId: 'company-2',
        dealId: 'deal-2',
        userId: 'user-2',
        isCompleted: true,
        priority: 'medium',
        tags: ['proposal', 'pricing'],
        attachments: [],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ]
  }

  private loadSampleEmailThreads() {
    this.emailThreads = [
      {
        id: 'thread-1',
        subject: 'Re: Enterprise Solution Discussion',
        participants: [
          { name: 'John Doe', email: 'john.doe@acme.com', displayName: 'John Doe' },
          { name: 'Sales Team', email: 'sales@sebenza.com', displayName: 'Sales Team' }
        ],
        lastMessageDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        messageCount: 3,
        isRead: true,
        isImportant: true,
        isStarred: false,
        folder: 'inbox',
        labels: ['crm', 'enterprise'],
        contactId: 'contact-1',
        companyId: 'company-1',
        dealId: 'deal-1',
        messages: [],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ]
  }

  // Contact methods
  getContacts(): Contact[] {
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
      averageSalesCycle: 0, // TODO: Calculate based on actual data
      dealsByStage: this.dealStages.reduce((acc, stage) => {
        acc[stage.id] = this.deals.filter(d => d.stage === stage.id).length
        return acc
      }, {} as Record<DealStage, number>),
      dealsBySource: {},
      dealsByOwner: {},
      monthlyTrends: [],
      quarterlyTrends: []
    }
  }

  private getContactAnalytics() {
    const total = this.contacts.length
    const active = this.contacts.filter(c => c.status === 'active').length
    const newThisMonth = this.contacts.filter(c => 
      c.createdAt.getMonth() === new Date().getMonth() && 
      c.createdAt.getFullYear() === new Date().getFullYear()
    ).length

    return {
      total,
      active,
      newThisMonth,
      newThisQuarter: 0, // TODO: Calculate
      byStatus: {},
      bySource: {},
      byOwner: {},
      averageLifetimeValue: 0, // TODO: Calculate
      engagementScore: 0, // TODO: Calculate
      monthlyTrends: []
    }
  }

  private getCompanyAnalytics() {
    const total = this.companies.length
    const active = this.companies.filter(c => c.status === 'active').length
    const newThisMonth = this.companies.filter(c => 
      c.createdAt.getMonth() === new Date().getMonth() && 
      c.createdAt.getFullYear() === new Date().getFullYear()
    ).length

    return {
      total,
      active,
      newThisMonth,
      byIndustry: {},
      bySize: {},
      byStatus: {},
      averageDealsPerCompany: 0, // TODO: Calculate
      averageValuePerCompany: 0, // TODO: Calculate
      monthlyTrends: []
    }
  }

  private getActivityAnalytics() {
    const total = this.activities.length
    const thisWeek = this.activities.filter(a => 
      a.date >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length
    const thisMonth = this.activities.filter(a => 
      a.date.getMonth() === new Date().getMonth() && 
      a.date.getFullYear() === new Date().getFullYear()
    ).length

    return {
      total,
      thisWeek,
      thisMonth,
      byType: {},
      byUser: {},
      averagePerDay: 0, // TODO: Calculate
      completionRate: 0, // TODO: Calculate
      monthlyTrends: []
    }
  }

  private getPipelineAnalytics() {
    const activeDeals = this.deals.filter(d => d.status === 'active')
    const totalValue = activeDeals.reduce((sum, d) => sum + d.value, 0)
    const weightedValue = activeDeals.reduce((sum, d) => sum + (d.value * d.probability / 100), 0)

    return {
      totalValue,
      weightedValue,
      dealsByStage: this.dealStages.reduce((acc, stage) => {
        const stageDeals = activeDeals.filter(d => d.stage === stage.id)
        acc[stage.id] = {
          count: stageDeals.length,
          value: stageDeals.reduce((sum, d) => sum + d.value, 0),
          weightedValue: stageDeals.reduce((sum, d) => sum + (d.value * d.probability / 100), 0),
          averageValue: stageDeals.length > 0 ? stageDeals.reduce((sum, d) => sum + d.value, 0) / stageDeals.length : 0,
          averageAge: 0, // TODO: Calculate
          conversionRate: 0 // TODO: Calculate
        }
        return acc
      }, {} as Record<DealStage, any>),
      velocity: 0, // TODO: Calculate
      conversionRates: {} as Record<DealStage, number>,
      averageStageTime: {} as Record<DealStage, number>,
      forecast: {
        optimistic: 0,
        realistic: 0,
        pessimistic: 0,
        confidence: 0,
        lastUpdated: new Date()
      }
    }
  }

  private getPerformanceAnalytics() {
    return {
      revenue: {
        total: 0,
        thisMonth: 0,
        lastMonth: 0,
        thisQuarter: 0,
        lastQuarter: 0,
        thisYear: 0,
        lastYear: 0,
        growth: 0,
        target: 0,
        achievement: 0
      },
      goals: [],
      achievements: [],
      rankings: [],
      trends: []
    }
  }

  // Import/Export methods
  async importData(data: any): Promise<CRMImportResult> {
    // TODO: Implement data import
    return {
      imported: 0,
      failed: 0,
      errors: [],
      warnings: []
    }
  }

  async exportData(options: any): Promise<any> {
    // TODO: Implement data export
    return {}
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
