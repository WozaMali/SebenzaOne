// Recycling Business CRM Service
import { supabase, isSupabaseEnabled } from './supabase-client'
import {
  RecyclingCustomer,
  RecyclingPartner,
  CollectionSchedule,
  MaterialCollection,
  Route,
  MaterialInventory,
  RecyclingInvoice,
  EnvironmentalImpact,
  ComplianceRecord,
  CustomerFeedback,
  OperationalKPI,
  CustomerType,
  PartnerType,
  MaterialType,
  CollectionStatus,
  PricingModel
} from '@/types/recycling'

class RecyclingService {
  private customers: RecyclingCustomer[] = []
  private partners: RecyclingPartner[] = []
  private collections: CollectionSchedule[] = []
  private routes: Route[] = []
  private inventory: MaterialInventory[] = []
  private invoices: RecyclingInvoice[] = []
  private impacts: EnvironmentalImpact[] = []
  private compliance: ComplianceRecord[] = []
  private feedback: CustomerFeedback[] = []
  private kpis: OperationalKPI[] = []

  private dataLoaded = false

  constructor() {
    // Don't load during construction to avoid SSR issues
  }

  private ensureDataLoaded() {
    if (typeof window !== 'undefined' && !this.dataLoaded) {
      this.dataLoaded = true
      this.loadFromSupabase().catch(err => {
        console.error('Error loading recycling data:', err)
        this.dataLoaded = false
      })
    }
  }

  private async loadFromSupabase() {
    if (!isSupabaseEnabled() || !supabase || typeof window === 'undefined') {
      return
    }

    try {
      // Load customers
      const { data: customersData } = await supabase
        .from('recycling_customers')
        .select('*')
      
      if (customersData) {
        this.customers = customersData.map(this.transformCustomer)
      }

      // Load partners
      const { data: partnersData } = await supabase
        .from('recycling_partners')
        .select('*')
      
      if (partnersData) {
        this.partners = partnersData.map(this.transformPartner)
      }

      // Load collections
      const { data: collectionsData } = await supabase
        .from('recycling_collections')
        .select('*')
      
      if (collectionsData) {
        this.collections = collectionsData.map(this.transformCollection)
      }
    } catch (error) {
      console.error('Error loading from Supabase:', error)
    }
  }

  private transformCustomer(data: any): RecyclingCustomer {
    return {
      ...data,
      scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : new Date(),
      createdAt: new Date(data.created_at || data.createdAt),
      updatedAt: new Date(data.updated_at || data.updatedAt)
    }
  }

  private transformPartner(data: any): RecyclingPartner {
    return {
      ...data,
      createdAt: new Date(data.created_at || data.createdAt),
      updatedAt: new Date(data.updated_at || data.updatedAt)
    }
  }

  private transformCollection(data: any): CollectionSchedule {
    return {
      ...data,
      scheduledDate: new Date(data.scheduledDate),
      estimatedArrival: data.estimatedArrival ? new Date(data.estimatedArrival) : undefined,
      actualArrival: data.actualArrival ? new Date(data.actualArrival) : undefined,
      actualDeparture: data.actualDeparture ? new Date(data.actualDeparture) : undefined,
      createdAt: new Date(data.created_at || data.createdAt),
      updatedAt: new Date(data.updated_at || data.updatedAt)
    }
  }

  // Customer Methods
  getCustomers(): RecyclingCustomer[] {
    this.ensureDataLoaded()
    return [...this.customers]
  }

  getCustomer(id: string): RecyclingCustomer | undefined {
    return this.customers.find(c => c.id === id)
  }

  getCustomersByType(type: CustomerType): RecyclingCustomer[] {
    return this.customers.filter(c => c.customerType === type)
  }

  createCustomer(customer: Omit<RecyclingCustomer, 'id' | 'createdAt' | 'updatedAt'>): RecyclingCustomer {
    const newCustomer: RecyclingCustomer = {
      ...customer,
      id: `customer-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.customers.push(newCustomer)
    return newCustomer
  }

  updateCustomer(id: string, updates: Partial<RecyclingCustomer>): RecyclingCustomer | null {
    const index = this.customers.findIndex(c => c.id === id)
    if (index !== -1) {
      this.customers[index] = { ...this.customers[index], ...updates, updatedAt: new Date() }
      return this.customers[index]
    }
    return null
  }

  deleteCustomer(id: string): boolean {
    const index = this.customers.findIndex(c => c.id === id)
    if (index !== -1) {
      this.customers.splice(index, 1)
      return true
    }
    return false
  }

  // Partner Methods
  getPartners(): RecyclingPartner[] {
    this.ensureDataLoaded()
    return [...this.partners]
  }

  getPartner(id: string): RecyclingPartner | undefined {
    return this.partners.find(p => p.id === id)
  }

  getPartnersByType(type: PartnerType): RecyclingPartner[] {
    return this.partners.filter(p => p.partnerType === type)
  }

  createPartner(partner: Omit<RecyclingPartner, 'id' | 'createdAt' | 'updatedAt'>): RecyclingPartner {
    const newPartner: RecyclingPartner = {
      ...partner,
      id: `partner-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.partners.push(newPartner)
    if (isSupabaseEnabled() && supabase && typeof window !== 'undefined') {
      supabase.from('recycling_partners').insert({
        id: newPartner.id,
        name: newPartner.name,
        partner_type: newPartner.partnerType,
        email: newPartner.email ?? null,
        phone: newPartner.phone ?? null,
        address: newPartner.address ? JSON.stringify(newPartner.address) : null,
        accepted_materials: newPartner.acceptedMaterials ?? [],
        status: newPartner.status ?? 'active',
        tags: newPartner.tags ?? [],
        created_at: newPartner.createdAt.toISOString(),
        updated_at: newPartner.updatedAt.toISOString(),
      }).then(() => {}).catch((e) => console.error('Supabase partner insert:', e))
    }
    return newPartner
  }

  updatePartner(id: string, updates: Partial<RecyclingPartner>): RecyclingPartner | null {
    const index = this.partners.findIndex(p => p.id === id)
    if (index !== -1) {
      this.partners[index] = { ...this.partners[index], ...updates, updatedAt: new Date() }
      return this.partners[index]
    }
    return null
  }

  // Collection Methods
  getCollections(): CollectionSchedule[] {
    this.ensureDataLoaded()
    return [...this.collections]
  }

  getCollection(id: string): CollectionSchedule | undefined {
    return this.collections.find(c => c.id === id)
  }

  getCollectionsByDate(date: Date): CollectionSchedule[] {
    const dateStr = date.toISOString().split('T')[0]
    return this.collections.filter(c => {
      const collectionDate = c.scheduledDate.toISOString().split('T')[0]
      return collectionDate === dateStr
    })
  }

  getCollectionsByStatus(status: CollectionStatus): CollectionSchedule[] {
    return this.collections.filter(c => c.status === status)
  }

  createCollection(collection: Omit<CollectionSchedule, 'id' | 'createdAt' | 'updatedAt'>): CollectionSchedule {
    const newCollection: CollectionSchedule = {
      ...collection,
      id: `collection-${Date.now()}`,
      materials: collection.materials || [],
      complianceChecked: collection.complianceChecked || false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.collections.push(newCollection)
    return newCollection
  }

  updateCollection(id: string, updates: Partial<CollectionSchedule>): CollectionSchedule | null {
    const index = this.collections.findIndex(c => c.id === id)
    if (index !== -1) {
      this.collections[index] = { ...this.collections[index], ...updates, updatedAt: new Date() }
      return this.collections[index]
    }
    return null
  }

  // Route Methods
  getRoutes(): Route[] {
    this.ensureDataLoaded()
    return [...this.routes]
  }

  createRoute(route: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>): Route {
    const newRoute: Route = {
      ...route,
      id: `route-${Date.now()}`,
      collections: route.collections || [],
      status: route.status || 'planned',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.routes.push(newRoute)
    return newRoute
  }

  // Inventory Methods
  getInventory(): MaterialInventory[] {
    this.ensureDataLoaded()
    return [...this.inventory]
  }

  getInventoryByMaterial(materialType: MaterialType): MaterialInventory[] {
    return this.inventory.filter(i => i.materialType === materialType)
  }

  // Invoice Methods
  getInvoices(): RecyclingInvoice[] {
    this.ensureDataLoaded()
    return [...this.invoices]
  }

  createInvoice(invoice: Omit<RecyclingInvoice, 'id' | 'createdAt' | 'updatedAt'>): RecyclingInvoice {
    const newInvoice: RecyclingInvoice = {
      ...invoice,
      id: `invoice-${Date.now()}`,
      invoiceNumber: invoice.invoiceNumber || `INV-${Date.now()}`,
      lineItems: invoice.lineItems || [],
      collectionIds: invoice.collectionIds || [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.invoices.push(newInvoice)
    return newInvoice
  }

  // Environmental Impact Methods
  getEnvironmentalImpacts(): EnvironmentalImpact[] {
    this.ensureDataLoaded()
    return [...this.impacts]
  }

  calculateImpact(customerId: string, period: { start: Date; end: Date }): EnvironmentalImpact {
    const customerCollections = this.collections.filter(
      c => c.customerId === customerId &&
      c.scheduledDate >= period.start &&
      c.scheduledDate <= period.end &&
      c.status === 'completed'
    )

    let totalWasteDiverted = 0
    const materialsDiverted: Record<MaterialType, number> = {} as Record<MaterialType, number>

    customerCollections.forEach(collection => {
      collection.materials.forEach(material => {
        totalWasteDiverted += material.weight
        materialsDiverted[material.materialType] = 
          (materialsDiverted[material.materialType] || 0) + material.weight
      })
    })

    // Calculate CO2 equivalent (rough estimates)
    const co2EquivalentSaved = totalWasteDiverted * 2.5 // kg CO2 per kg waste diverted
    const energySaved = totalWasteDiverted * 10 // kWh per kg
    const waterSaved = totalWasteDiverted * 5 // liters per kg

    const impact: EnvironmentalImpact = {
      id: `impact-${Date.now()}`,
      customerId,
      period,
      totalWasteDiverted,
      landfillDiverted: totalWasteDiverted,
      co2EquivalentSaved,
      energySaved,
      waterSaved,
      materialsDiverted,
      certificatesGenerated: false,
      createdAt: new Date()
    }

    this.impacts.push(impact)
    return impact
  }

  // KPI Methods
  getKPIs(period: { start: Date; end: Date }): OperationalKPI {
    const periodCollections = this.collections.filter(
      c => c.scheduledDate >= period.start && c.scheduledDate <= period.end
    )

    const completed = periodCollections.filter(c => c.status === 'completed').length
    const missed = periodCollections.filter(c => c.status === 'missed').length
    const total = periodCollections.length

    let totalMaterialCollected = 0
    const materialByType: Record<MaterialType, number> = {} as Record<MaterialType, number>

    periodCollections.forEach(collection => {
      if (collection.status === 'completed' && collection.totalWeight) {
        totalMaterialCollected += collection.totalWeight
        collection.materials.forEach(material => {
          materialByType[material.materialType] = 
            (materialByType[material.materialType] || 0) + material.weight
        })
      }
    })

    const periodInvoices = this.invoices.filter(
      i => i.issueDate >= period.start && i.issueDate <= period.end
    )
    const revenue = periodInvoices.reduce((sum, inv) => sum + inv.total, 0)

    const kpi: OperationalKPI = {
      id: `kpi-${Date.now()}`,
      period,
      totalCollections: total,
      completedCollections: completed,
      missedCollections: missed,
      onTimeRate: total > 0 ? (completed / total) * 100 : 0,
      totalMaterialCollected,
      materialByType,
      averageCollectionWeight: completed > 0 ? totalMaterialCollected / completed : 0,
      contaminationRate: 0, // Would need to calculate from material quality
      averageRouteEfficiency: 0, // Would need route data
      fuelEfficiency: 0, // Would need vehicle data
      driverProductivity: 0, // Would need driver data
      revenue,
      costPerCollection: 0, // Would need cost data
      profitMargin: 0, // Would need cost data
      customerSatisfaction: 0, // Would need feedback data
      customerRetention: 0, // Would need historical data
      newCustomers: 0, // Would need historical data
      createdAt: new Date()
    }

    return kpi
  }
}

// Create singleton instance
let recyclingServiceInstance: RecyclingService | null = null

const createRecyclingService = () => {
  if (typeof window === 'undefined') {
    // Return empty service for SSR (no data on server)
    return {
      getCustomers: () => [],
      getPartners: () => [],
      getCollections: () => [],
      getRoutes: () => [],
      getInventory: () => [],
      getInvoices: () => [],
      getEnvironmentalImpacts: () => [],
      getKPIs: () => ({} as OperationalKPI),
      createCustomer: () => ({} as RecyclingCustomer),
      createPartner: () => ({} as RecyclingPartner),
      updatePartner: () => ({} as RecyclingPartner),
      createCollection: () => ({} as CollectionSchedule),
      createRoute: () => ({} as Route),
      createInvoice: () => ({} as RecyclingInvoice),
      calculateImpact: () => ({} as EnvironmentalImpact)
    }
  }

  if (!recyclingServiceInstance) {
    recyclingServiceInstance = new RecyclingService()
  }
  return recyclingServiceInstance
}

export const recyclingService = {
  get instance() {
    return createRecyclingService()
  },
  
  // Proxy methods
  getCustomers: () => createRecyclingService().getCustomers(),
  getPartners: () => createRecyclingService().getPartners(),
  getCollections: () => createRecyclingService().getCollections(),
  getRoutes: () => createRecyclingService().getRoutes(),
  getInventory: () => createRecyclingService().getInventory(),
  getInvoices: () => createRecyclingService().getInvoices(),
  getEnvironmentalImpacts: () => createRecyclingService().getEnvironmentalImpacts(),
  getKPIs: (period: { start: Date; end: Date }) => createRecyclingService().getKPIs(period),
  getCustomer: (id: string) => createRecyclingService().getCustomer(id),
  getPartner: (id: string) => createRecyclingService().getPartner(id),
  getCollection: (id: string) => createRecyclingService().getCollection(id),
  createCustomer: (customer: Omit<RecyclingCustomer, 'id' | 'createdAt' | 'updatedAt'>) => 
    createRecyclingService().createCustomer(customer),
  createPartner: (partner: Omit<RecyclingPartner, 'id' | 'createdAt' | 'updatedAt'>) => 
    createRecyclingService().createPartner(partner),
  updatePartner: (id: string, updates: Partial<RecyclingPartner>) => 
    createRecyclingService().updatePartner(id, updates),
  createCollection: (collection: Omit<CollectionSchedule, 'id' | 'createdAt' | 'updatedAt'>) => 
    createRecyclingService().createCollection(collection),
  createRoute: (route: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>) => 
    createRecyclingService().createRoute(route),
  createInvoice: (invoice: Omit<RecyclingInvoice, 'id' | 'createdAt' | 'updatedAt'>) => 
    createRecyclingService().createInvoice(invoice),
  calculateImpact: (customerId: string, period: { start: Date; end: Date }) => 
    createRecyclingService().calculateImpact(customerId, period),
  updateCustomer: (id: string, updates: Partial<RecyclingCustomer>) => 
    createRecyclingService().updateCustomer(id, updates),
  updateCollection: (id: string, updates: Partial<CollectionSchedule>) => 
    createRecyclingService().updateCollection(id, updates),
  deleteCustomer: (id: string) => createRecyclingService().deleteCustomer(id)
}
