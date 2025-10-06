// Cross-Module Integration Service
// Handles seamless data flow between CRM, Mail, Projects, Accounting, and Drive

import { supabase, isSupabaseEnabled } from './supabase-client'
import { crmService } from './crm-service'
import { emailService } from './email-service'

export interface IntegrationEvent {
  id: string
  type: 'email_received' | 'email_sent' | 'deal_created' | 'deal_updated' | 'task_created' | 'task_completed' | 'invoice_created' | 'file_uploaded'
  module: 'mail' | 'crm' | 'projects' | 'accounting' | 'drive'
  entityId: string
  entityType: string
  data: any
  timestamp: Date
  userId: string
  relatedEntities: RelatedEntity[]
}

export interface RelatedEntity {
  module: 'mail' | 'crm' | 'projects' | 'accounting' | 'drive'
  entityId: string
  entityType: string
  relationship: 'contact' | 'company' | 'deal' | 'task' | 'project' | 'invoice' | 'file' | 'email'
}

export interface CrossModuleData {
  contacts: any[]
  companies: any[]
  deals: any[]
  emails: any[]
  tasks: any[]
  projects: any[]
  invoices: any[]
  files: any[]
  activities: any[]
}

class IntegrationService {
  private eventListeners: Map<string, Function[]> = new Map()
  private syncQueue: IntegrationEvent[] = []
  private isOnline: boolean = true
  private syncInterval: NodeJS.Timeout | null = null

  constructor() {
    this.initializeService()
    this.setupEventListeners()
    this.startSyncProcess()
  }

  private initializeService() {
    // Check online status
    this.isOnline = navigator.onLine
    window.addEventListener('online', () => {
      this.isOnline = true
      this.processSyncQueue()
    })
    window.addEventListener('offline', () => {
      this.isOnline = false
    })

    // Register service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event.data)
      })
    }
  }

  private setupEventListeners() {
    // Listen for changes in different modules
    this.addEventListener('email_received', this.handleEmailReceived.bind(this))
    this.addEventListener('email_sent', this.handleEmailSent.bind(this))
    this.addEventListener('deal_created', this.handleDealCreated.bind(this))
    this.addEventListener('deal_updated', this.handleDealUpdated.bind(this))
    this.addEventListener('task_created', this.handleTaskCreated.bind(this))
    this.addEventListener('task_completed', this.handleTaskCompleted.bind(this))
    this.addEventListener('invoice_created', this.handleInvoiceCreated.bind(this))
    this.addEventListener('file_uploaded', this.handleFileUploaded.bind(this))
  }

  private startSyncProcess() {
    // Sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncAllModules()
      }
    }, 30000)
  }

  // Event system
  addEventListener(eventType: string, callback: Function) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, [])
    }
    this.eventListeners.get(eventType)!.push(callback)
  }

  removeEventListener(eventType: string, callback: Function) {
    const listeners = this.eventListeners.get(eventType)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  emit(eventType: string, data: any) {
    const listeners = this.eventListeners.get(eventType)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }

  // Create integration event
  createEvent(
    type: IntegrationEvent['type'],
    module: IntegrationEvent['module'],
    entityId: string,
    entityType: string,
    data: any,
    relatedEntities: RelatedEntity[] = []
  ): IntegrationEvent {
    return {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      module,
      entityId,
      entityType,
      data,
      timestamp: new Date(),
      userId: this.getCurrentUserId(),
      relatedEntities
    }
  }

  // Event handlers
  private async handleEmailReceived(event: IntegrationEvent) {
    console.log('Integration: Email received event', event)
    
    // Extract contact information from email
    const email = event.data
    const contactInfo = this.extractContactFromEmail(email)
    
    if (contactInfo) {
      // Check if contact exists in CRM
      const existingContact = await this.findContactByEmail(contactInfo.email)
      
      if (!existingContact) {
        // Create new contact in CRM
        const newContact = await this.createContactFromEmail(contactInfo, email)
        if (newContact) {
          this.emit('contact_created', newContact)
        }
      } else {
        // Update existing contact's last contact date
        await this.updateContactLastContactDate(existingContact.id)
      }
      
      // Create activity in CRM
      await this.createEmailActivity(email, existingContact?.id || contactInfo.id)
    }
  }

  private async handleEmailSent(event: IntegrationEvent) {
    console.log('Integration: Email sent event', event)
    
    const email = event.data
    
    // Create activity in CRM if related to a deal
    if (email.dealId) {
      await this.createEmailActivity(email, email.contactId, email.dealId)
    }
    
    // Update last contact date
    if (email.contactId) {
      await this.updateContactLastContactDate(email.contactId)
    }
  }

  private async handleDealCreated(event: IntegrationEvent) {
    console.log('Integration: Deal created event', event)
    
    const deal = event.data
    
    // Create task in Projects module
    if (deal.expectedCloseDate) {
      await this.createDealTask(deal)
    }
    
    // Create activity
    await this.createDealActivity(deal, 'created')
  }

  private async handleDealUpdated(event: IntegrationEvent) {
    console.log('Integration: Deal updated event', event)
    
    const deal = event.data
    
    // Update related tasks in Projects
    await this.updateDealTasks(deal)
    
    // Create activity
    await this.createDealActivity(deal, 'updated')
    
    // If deal is won, create invoice in Accounting
    if (deal.stage === 'closed-won' && deal.status === 'won') {
      await this.createInvoiceFromDeal(deal)
    }
  }

  private async handleTaskCreated(event: IntegrationEvent) {
    console.log('Integration: Task created event', event)
    
    const task = event.data
    
    // Create activity in CRM if related to deal
    if (task.dealId) {
      await this.createTaskActivity(task)
    }
  }

  private async handleTaskCompleted(event: IntegrationEvent) {
    console.log('Integration: Task completed event', event)
    
    const task = event.data
    
    // Update deal progress if related
    if (task.dealId) {
      await this.updateDealProgress(task.dealId)
    }
    
    // Create activity
    await this.createTaskActivity(task, 'completed')
  }

  private async handleInvoiceCreated(event: IntegrationEvent) {
    console.log('Integration: Invoice created event', event)
    
    const invoice = event.data
    
    // Create activity in CRM
    if (invoice.dealId) {
      await this.createInvoiceActivity(invoice)
    }
    
    // Send email notification
    await this.sendInvoiceEmail(invoice)
  }

  private async handleFileUploaded(event: IntegrationEvent) {
    console.log('Integration: File uploaded event', event)
    
    const file = event.data
    
    // Create activity in related modules
    if (file.dealId) {
      await this.createFileActivity(file, 'deal')
    }
    if (file.projectId) {
      await this.createFileActivity(file, 'project')
    }
  }

  // Helper methods
  private extractContactFromEmail(email: any) {
    const from = email.from
    if (!from || !from.email) return null
    
    return {
      email: from.email,
      firstName: from.name?.split(' ')[0] || '',
      lastName: from.name?.split(' ').slice(1).join(' ') || '',
      source: 'email' as const,
      status: 'prospect' as const
    }
  }

  private async findContactByEmail(email: string) {
    try {
      const contacts = crmService.getContacts()
      return contacts.find(c => c.email.toLowerCase() === email.toLowerCase())
    } catch (error) {
      console.error('Error finding contact by email:', error)
      return null
    }
  }

  private async createContactFromEmail(contactInfo: any, email: any) {
    try {
      const newContact = crmService.createContact({
        ...contactInfo,
        createdBy: this.getCurrentUserId(),
        assignedTo: this.getCurrentUserId(),
        customFields: {
          lastEmailSubject: email.subject,
          lastEmailDate: email.date
        }
      })
      
      return newContact
    } catch (error) {
      console.error('Error creating contact from email:', error)
      return null
    }
  }

  private async updateContactLastContactDate(contactId: string) {
    try {
      const now = new Date()
      crmService.updateContact(contactId, { lastContactDate: now })
    } catch (error) {
      console.error('Error updating contact last contact date:', error)
    }
  }

  private async createEmailActivity(email: any, contactId?: string, dealId?: string) {
    try {
      const activity = crmService.createActivity({
        type: 'email',
        title: `Email: ${email.subject}`,
        description: `Email ${email.direction || 'received'} from ${email.from?.name || email.from?.email}`,
        date: new Date(email.date),
        contactId,
        dealId,
        userId: this.getCurrentUserId(),
        isCompleted: true,
        priority: 'medium',
        tags: ['email', 'communication'],
        emailThreadId: email.threadId
      })
      
      return activity
    } catch (error) {
      console.error('Error creating email activity:', error)
      return null
    }
  }

  private async createDealTask(deal: any) {
    try {
      // This would integrate with a projects service
      console.log('Creating deal task for:', deal.name)
      // Implementation would depend on projects service
    } catch (error) {
      console.error('Error creating deal task:', error)
    }
  }

  private async createDealActivity(deal: any, action: string) {
    try {
      const activity = crmService.createActivity({
        type: 'deal_update',
        title: `Deal ${action}: ${deal.name}`,
        description: `Deal ${action} with value ${deal.value}`,
        date: new Date(),
        dealId: deal.id,
        userId: this.getCurrentUserId(),
        isCompleted: true,
        priority: 'high',
        tags: ['deal', action]
      })
      
      return activity
    } catch (error) {
      console.error('Error creating deal activity:', error)
      return null
    }
  }

  private async updateDealTasks(deal: any) {
    try {
      // Update related tasks in projects module
      console.log('Updating deal tasks for:', deal.name)
      // Implementation would depend on projects service
    } catch (error) {
      console.error('Error updating deal tasks:', error)
    }
  }

  private async createInvoiceFromDeal(deal: any) {
    try {
      // Create invoice in accounting module
      console.log('Creating invoice from deal:', deal.name)
      // Implementation would depend on accounting service
    } catch (error) {
      console.error('Error creating invoice from deal:', error)
    }
  }

  private async createTaskActivity(task: any, action: string = 'created') {
    try {
      const activity = crmService.createActivity({
        type: 'task',
        title: `Task ${action}: ${task.title}`,
        description: task.description || `Task ${action}`,
        date: new Date(),
        dealId: task.dealId,
        userId: this.getCurrentUserId(),
        isCompleted: action === 'completed',
        priority: task.priority || 'medium',
        tags: ['task', action]
      })
      
      return activity
    } catch (error) {
      console.error('Error creating task activity:', error)
      return null
    }
  }

  private async updateDealProgress(dealId: string) {
    try {
      // Update deal progress based on completed tasks
      console.log('Updating deal progress for:', dealId)
      // Implementation would depend on projects service integration
    } catch (error) {
      console.error('Error updating deal progress:', error)
    }
  }

  private async createInvoiceActivity(invoice: any) {
    try {
      const activity = crmService.createActivity({
        type: 'file',
        title: `Invoice created: ${invoice.number}`,
        description: `Invoice created for amount ${invoice.total}`,
        date: new Date(),
        dealId: invoice.dealId,
        userId: this.getCurrentUserId(),
        isCompleted: true,
        priority: 'high',
        tags: ['invoice', 'accounting']
      })
      
      return activity
    } catch (error) {
      console.error('Error creating invoice activity:', error)
      return null
    }
  }

  private async sendInvoiceEmail(invoice: any) {
    try {
      // Send invoice email notification
      console.log('Sending invoice email for:', invoice.number)
      // Implementation would depend on email service
    } catch (error) {
      console.error('Error sending invoice email:', error)
    }
  }

  private async createFileActivity(file: any, context: string) {
    try {
      const activity = crmService.createActivity({
        type: 'file',
        title: `File uploaded: ${file.name}`,
        description: `File uploaded to ${context}`,
        date: new Date(),
        dealId: file.dealId,
        userId: this.getCurrentUserId(),
        isCompleted: true,
        priority: 'low',
        tags: ['file', 'upload', context]
      })
      
      return activity
    } catch (error) {
      console.error('Error creating file activity:', error)
      return null
    }
  }

  // Sync methods
  async syncAllModules() {
    if (!this.isOnline) {
      console.log('Integration: Offline, queuing sync')
      return
    }

    try {
      console.log('Integration: Syncing all modules...')
      
      // Sync each module
      await Promise.all([
        this.syncEmailData(),
        this.syncCRMData(),
        this.syncProjectsData(),
        this.syncAccountingData(),
        this.syncDriveData()
      ])
      
      console.log('Integration: All modules synced successfully')
    } catch (error) {
      console.error('Integration: Sync failed:', error)
    }
  }

  private async syncEmailData() {
    try {
      // Sync email data with other modules
      const emails = emailService.getEmailsForFolder('inbox')
      
      for (const email of emails) {
        // Check if email has been processed
        const event = this.createEvent('email_received', 'mail', email.id, 'email', email)
        await this.processEvent(event)
      }
    } catch (error) {
      console.error('Error syncing email data:', error)
    }
  }

  private async syncCRMData() {
    try {
      // Sync CRM data with other modules
      const deals = crmService.getDeals()
      
      for (const deal of deals) {
        if (deal.stage === 'closed-won' && !deal.wonDate) {
          const event = this.createEvent('deal_updated', 'crm', deal.id, 'deal', deal)
          await this.processEvent(event)
        }
      }
    } catch (error) {
      console.error('Error syncing CRM data:', error)
    }
  }

  private async syncProjectsData() {
    try {
      // Sync projects data
      console.log('Syncing projects data...')
      // Implementation would depend on projects service
    } catch (error) {
      console.error('Error syncing projects data:', error)
    }
  }

  private async syncAccountingData() {
    try {
      // Sync accounting data
      console.log('Syncing accounting data...')
      // Implementation would depend on accounting service
    } catch (error) {
      console.error('Error syncing accounting data:', error)
    }
  }

  private async syncDriveData() {
    try {
      // Sync drive data
      console.log('Syncing drive data...')
      // Implementation would depend on drive service
    } catch (error) {
      console.error('Error syncing drive data:', error)
    }
  }

  private async processEvent(event: IntegrationEvent) {
    try {
      if (this.isOnline) {
        // Process event immediately
        this.emit(event.type, event)
        
        // Save to database
        await this.saveEvent(event)
      } else {
        // Queue event for later processing
        this.syncQueue.push(event)
      }
    } catch (error) {
      console.error('Error processing event:', error)
    }
  }

  private async processSyncQueue() {
    console.log('Integration: Processing sync queue...')
    
    while (this.syncQueue.length > 0) {
      const event = this.syncQueue.shift()
      if (event) {
        await this.processEvent(event)
      }
    }
  }

  private async saveEvent(event: IntegrationEvent) {
    if (!isSupabaseEnabled || !supabase) return

    try {
      const { error } = await supabase
        .from('integration_events')
        .insert({
          id: event.id,
          type: event.type,
          module: event.module,
          entity_id: event.entityId,
          entity_type: event.entityType,
          data: event.data,
          timestamp: event.timestamp.toISOString(),
          user_id: event.userId,
          related_entities: event.relatedEntities
        })
      
      if (error) throw error
    } catch (error) {
      console.error('Error saving integration event:', error)
    }
  }

  private handleServiceWorkerMessage(data: any) {
    if (data.type === 'SYNC_COMPLETE') {
      console.log('Integration: Service worker sync complete')
      this.syncAllModules()
    }
  }

  private getCurrentUserId(): string {
    // Get current user ID from auth context
    return 'user-1' // This should be replaced with actual auth context
  }

  // Public API methods
  async getCrossModuleData(): Promise<CrossModuleData> {
    try {
      const [contacts, companies, deals, emails, activities] = await Promise.all([
        crmService.getContacts(),
        crmService.getCompanies(),
        crmService.getDeals(),
        emailService.getEmailsForFolder('inbox'),
        crmService.getActivities()
      ])

      return {
        contacts,
        companies,
        deals,
        emails,
        tasks: [], // Would be populated by projects service
        projects: [], // Would be populated by projects service
        invoices: [], // Would be populated by accounting service
        files: [], // Would be populated by drive service
        activities
      }
    } catch (error) {
      console.error('Error getting cross-module data:', error)
      return {
        contacts: [],
        companies: [],
        deals: [],
        emails: [],
        tasks: [],
        projects: [],
        invoices: [],
        files: [],
        activities: []
      }
    }
  }

  async searchAcrossModules(query: string) {
    try {
      const data = await this.getCrossModuleData()
      const results = {
        contacts: data.contacts.filter(c => 
          c.firstName.toLowerCase().includes(query.toLowerCase()) ||
          c.lastName.toLowerCase().includes(query.toLowerCase()) ||
          c.email.toLowerCase().includes(query.toLowerCase())
        ),
        companies: data.companies.filter(c => 
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.industry?.toLowerCase().includes(query.toLowerCase())
        ),
        deals: data.deals.filter(d => 
          d.name.toLowerCase().includes(query.toLowerCase()) ||
          d.description?.toLowerCase().includes(query.toLowerCase())
        ),
        emails: data.emails.filter(e => 
          e.subject.toLowerCase().includes(query.toLowerCase()) ||
          e.body.toLowerCase().includes(query.toLowerCase())
        ),
        activities: data.activities.filter(a => 
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.description?.toLowerCase().includes(query.toLowerCase())
        )
      }

      return results
    } catch (error) {
      console.error('Error searching across modules:', error)
      return {
        contacts: [],
        companies: [],
        deals: [],
        emails: [],
        activities: []
      }
    }
  }

  // Cleanup
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
    this.eventListeners.clear()
  }
}

// Create singleton instance
let integrationServiceInstance: IntegrationService | null = null

const createIntegrationService = () => {
  if (typeof window === 'undefined') {
    // Return a mock service for SSR
    return {
      addEventListener: () => {},
      removeEventListener: () => {},
      emit: () => {},
      createEvent: () => ({}),
      syncAllModules: async () => {},
      getCrossModuleData: async () => ({}),
      searchAcrossModules: async () => ({}),
      destroy: () => {}
    }
  }
  
  if (!integrationServiceInstance) {
    integrationServiceInstance = new IntegrationService()
  }
  return integrationServiceInstance
}

export const integrationService = {
  get instance() {
    return createIntegrationService()
  },
  
  // Proxy methods
  addEventListener: (eventType: string, callback: Function) => createIntegrationService().addEventListener(eventType, callback),
  removeEventListener: (eventType: string, callback: Function) => createIntegrationService().removeEventListener(eventType, callback),
  emit: (eventType: string, data: any) => createIntegrationService().emit(eventType, data),
  createEvent: (type: IntegrationEvent['type'], module: IntegrationEvent['module'], entityId: string, entityType: string, data: any, relatedEntities?: RelatedEntity[]) => 
    createIntegrationService().createEvent(type, module, entityId, entityType, data, relatedEntities),
  syncAllModules: () => createIntegrationService().syncAllModules(),
  getCrossModuleData: () => createIntegrationService().getCrossModuleData(),
  searchAcrossModules: (query: string) => createIntegrationService().searchAcrossModules(query),
  destroy: () => createIntegrationService().destroy()
}



