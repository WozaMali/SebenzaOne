// Recycling Business CRM Types

// Customer Types
export type CustomerType = 'residential' | 'commercial' | 'industrial' | 'municipality'
export type PartnerType = 'recycling_center' | 'logistics_provider' | 'government_agency' | 'supplier'

// Material Types - Sebenza Nathi Waste collected materials
export type MaterialType = 
  | 'aluminium_cans' 
  | 'cardboard' 
  | 'glass' 
  | 'glass_bottles' 
  | 'hdpe_containers' 
  | 'paper' 
  | 'pet_bottles'

export const MATERIAL_LABELS: Record<MaterialType, string> = {
  aluminium_cans: 'Aluminium Cans',
  cardboard: 'Cardboard',
  glass: 'Glass',
  glass_bottles: 'Glass Bottles',
  hdpe_containers: 'HDPE Containers',
  paper: 'Paper',
  pet_bottles: 'PET Bottles'
}

// Pricing Models
export type PricingModel = 'per_kg' | 'per_pickup' | 'subscription' | 'flat_rate' | 'volume_based'

// Collection Status
export type CollectionStatus = 'scheduled' | 'in_progress' | 'completed' | 'missed' | 'cancelled' | 'rescheduled'

// Compliance Status
export type ComplianceStatus = 'compliant' | 'pending' | 'non_compliant' | 'under_review'

// Customer Profile (Enhanced Contact)
export interface RecyclingCustomer {
  id: string
  // Basic Info
  firstName?: string
  lastName?: string
  businessName?: string
  customerType: CustomerType
  email: string
  phone: string
  
  // Address & Location
  address: Address
  serviceArea: string
  coordinates?: {
    lat: number
    lng: number
  }
  
  // Service Details
  serviceLevel: 'standard' | 'premium' | 'enterprise'
  pickupFrequency: 'weekly' | 'bi_weekly' | 'monthly' | 'on_demand'
  preferredPickupDay?: string
  preferredPickupTime?: string
  
  // Material Preferences
  acceptedMaterials: MaterialType[]
  binSize?: string
  binCount?: number
  
  // Financial
  pricingModel: PricingModel
  ratePerKg?: number
  ratePerPickup?: number
  monthlySubscription?: number
  
  // Status
  status: 'active' | 'inactive' | 'suspended' | 'cancelled'
  accountBalance?: number
  paymentMethod?: 'credit_card' | 'bank_transfer' | 'cash' | 'check'
  
  // Metadata
  tags: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
  assignedTo?: string
}

// Partner Profile (Enhanced Company)
export interface RecyclingPartner {
  id: string
  name: string
  partnerType: PartnerType
  email?: string
  phone?: string
  website?: string
  
  // Address
  address?: Address
  
  // Partnership Details
  partnershipStartDate?: Date
  contractTerms?: string
  commissionRate?: number
  paymentTerms?: string
  
  // Capabilities
  acceptedMaterials: MaterialType[]
  processingCapacity?: number // kg per day
  certifications?: string[] // ISO, environmental certifications
  
  // Status
  status: 'active' | 'inactive' | 'pending'
  rating?: number
  
  // Metadata
  tags: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Collection Schedule
export interface CollectionSchedule {
  id: string
  customerId: string
  customer?: RecyclingCustomer
  
  // Schedule Details
  scheduledDate: Date
  scheduledTime: string
  status: CollectionStatus
  collectionType: 'recurring' | 'one_time'
  
  // Route Information
  routeId?: string
  routeOrder?: number
  estimatedArrival?: Date
  actualArrival?: Date
  actualDeparture?: Date
  
  // Materials Collected
  materials: MaterialCollection[]
  totalWeight?: number // kg
  totalVolume?: number // liters
  
  // Driver & Vehicle
  driverId?: string
  vehicleId?: string
  vehicleType?: string
  
  // Notes
  notes?: string
  customerNotes?: string
  driverNotes?: string
  
  // Compliance
  complianceChecked: boolean
  complianceNotes?: string
  
  createdAt: Date
  updatedAt: Date
}

// Material Collection Record
export interface MaterialCollection {
  id: string
  collectionId: string
  materialType: MaterialType
  
  // Quantities
  weight: number // kg
  volume?: number // liters
  count?: number // for items like batteries
  
  // Quality
  qualityGrade?: 'A' | 'B' | 'C' | 'contaminated'
  contaminationLevel?: number // percentage
  
  // Pricing
  unitPrice?: number
  totalValue?: number
  
  // Compliance
  complianceStatus: ComplianceStatus
  certificationRequired?: boolean
  
  createdAt: Date
}

// Route Optimization
export interface Route {
  id: string
  name: string
  date: Date
  
  // Route Details
  collections: CollectionSchedule[]
  startLocation: Address
  endLocation: Address
  
  // Optimization Metrics
  estimatedDistance: number // km
  estimatedDuration: number // minutes
  estimatedFuelCost?: number
  actualDistance?: number
  actualDuration?: number
  actualFuelCost?: number
  
  // Driver & Vehicle
  driverId?: string
  vehicleId?: string
  
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  
  createdAt: Date
  updatedAt: Date
}

// Material Inventory
export interface MaterialInventory {
  id: string
  materialType: MaterialType
  location: string // warehouse, facility, etc.
  
  // Quantities
  currentStock: number // kg
  reservedStock?: number
  availableStock: number
  
  // Quality
  averageQuality: 'A' | 'B' | 'C'
  
  // Financial
  averagePurchasePrice?: number
  currentMarketPrice?: number
  totalValue?: number
  
  // Tracking
  lastUpdated: Date
  lastAudit?: Date
  
  createdAt: Date
}

// Invoice & Billing
export interface RecyclingInvoice {
  id: string
  invoiceNumber: string
  customerId: string
  customer?: RecyclingCustomer
  
  // Invoice Details
  issueDate: Date
  dueDate: Date
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  
  // Line Items
  lineItems: InvoiceLineItem[]
  
  // Financial
  subtotal: number
  tax?: number
  discount?: number
  total: number
  currency: string
  
  // Payment
  paidAmount?: number
  paidDate?: Date
  paymentMethod?: string
  
  // Collections Reference
  collectionIds: string[]
  
  createdAt: Date
  updatedAt: Date
}

export interface InvoiceLineItem {
  id: string
  description: string
  materialType?: MaterialType
  quantity: number
  unit: 'kg' | 'pickup' | 'month' | 'item'
  unitPrice: number
  total: number
}

// Environmental Impact
export interface EnvironmentalImpact {
  id: string
  customerId?: string
  period: {
    start: Date
    end: Date
  }
  
  // Metrics
  totalWasteDiverted: number // kg
  landfillDiverted: number // kg
  co2EquivalentSaved: number // kg CO2
  energySaved: number // kWh
  waterSaved: number // liters
  
  // Material Breakdown
  materialsDiverted: Record<MaterialType, number>
  
  // Certificates
  certificatesGenerated: boolean
  certificateId?: string
  
  createdAt: Date
}

// Compliance Record
export interface ComplianceRecord {
  id: string
  recordType: 'collection' | 'transport' | 'processing' | 'disposal' | 'audit'
  
  // Reference
  collectionId?: string
  customerId?: string
  materialType?: MaterialType
  
  // Compliance Details
  regulation: string
  requirement: string
  status: ComplianceStatus
  complianceDate?: Date
  expiryDate?: Date
  
  // Documentation
  documents: string[] // file URLs
  inspector?: string
  inspectionDate?: Date
  
  // Notes
  notes?: string
  violations?: string[]
  
  createdAt: Date
  updatedAt: Date
}

// Customer Feedback
export interface CustomerFeedback {
  id: string
  customerId: string
  customer?: RecyclingCustomer
  
  // Feedback Details
  collectionId?: string
  rating: number // 1-5
  feedbackType: 'pickup' | 'service' | 'billing' | 'general'
  
  // Content
  comment?: string
  positiveAspects?: string[]
  negativeAspects?: string[]
  
  // Response
  responded: boolean
  response?: string
  responseDate?: Date
  
  createdAt: Date
}

// Operational KPI
export interface OperationalKPI {
  id: string
  period: {
    start: Date
    end: Date
  }
  
  // Collection Metrics
  totalCollections: number
  completedCollections: number
  missedCollections: number
  onTimeRate: number // percentage
  
  // Material Metrics
  totalMaterialCollected: number // kg
  materialByType: Record<MaterialType, number>
  averageCollectionWeight: number // kg
  contaminationRate: number // percentage
  
  // Efficiency Metrics
  averageRouteEfficiency: number // collections per hour
  fuelEfficiency: number // km per liter
  driverProductivity: number // collections per driver per day
  
  // Financial Metrics
  revenue: number
  costPerCollection: number
  profitMargin: number // percentage
  
  // Customer Metrics
  customerSatisfaction: number // average rating
  customerRetention: number // percentage
  newCustomers: number
  
  createdAt: Date
}

// Address (reused from crm.ts)
export interface Address {
  street: string
  city: string
  state?: string
  postalCode: string
  country: string
  coordinates?: {
    lat: number
    lng: number
  }
}
