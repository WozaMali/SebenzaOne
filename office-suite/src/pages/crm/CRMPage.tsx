"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, Building2, BarChart3, Plus, MoreHorizontal, Phone, Mail, 
  Link as LinkIcon, Calendar as CalendarIcon, ArrowLeft, 
  ArrowRight, Trash2, Edit, Eye, Star, MessageSquare, FileText,
  TrendingUp, Target, Clock, CheckCircle, AlertCircle, XCircle, X, HelpCircle,
  Search, Filter, Download, Upload, Settings, Bell, UserPlus,
  Building, Briefcase, Activity as ActivityLucideIcon, Mail as MailIcon, Phone as PhoneIcon,
  ChevronDown, PieChart, LineChart, Zap, Brain, Shield, Globe, 
  Video, Mic, Send, FileSpreadsheet, Award, TrendingDown, 
  RefreshCw, Recycle, Package, Truck, Wallet, CreditCard,
  Smartphone, Laptop, Monitor, Headphones, Camera, MapPin,
  Tag, Hash, Percent, Calculator, Clock3, Timer, PlayCircle,
  PauseCircle, StopCircle, Volume2, VolumeX, Wifi, WifiOff,
  Battery, BatteryLow, Signal, SignalHigh, SignalLow, SignalZero,
  WifiIcon, WifiOffIcon, BatteryIcon, BatteryLowIcon, SignalIcon,
  SignalHighIcon, SignalLowIcon, SignalZeroIcon, WifiIcon as WifiIcon2,
  WifiOffIcon as WifiOffIcon2, BatteryIcon as BatteryIcon2, BatteryLowIcon as BatteryLowIcon2,
  SignalIcon as SignalIcon2, SignalHighIcon as SignalHighIcon2, SignalLowIcon as SignalLowIcon2,
  SignalZeroIcon as SignalZeroIcon2, WifiIcon as WifiIcon3, WifiOffIcon as WifiOffIcon3,
  BatteryIcon as BatteryIcon3, BatteryLowIcon as BatteryLowIcon3, SignalIcon as SignalIcon3,
  SignalHighIcon as SignalHighIcon3, SignalLowIcon as SignalLowIcon3, SignalZeroIcon as SignalZeroIcon3
} from "lucide-react"
import { crmService } from "@/lib/crm-service"
import { integrationService } from "@/lib/integration-service"
import { Contact, Company, Deal, Activity, DealStage, CRMAnalytics } from "@/types/crm"
import KanbanBoard from "@/components/crm/KanbanBoard"
import ContactProfile from "@/components/crm/ContactProfile"
import EmailIntegration from "@/components/crm/EmailIntegration"
import PWARegistration from "@/components/pwa/PWARegistration"
import CrossModuleSearch from "@/components/search/CrossModuleSearch"

// Enhanced CRM types
type LeadScore = 'hot' | 'warm' | 'cold' | 'dead'
type CommunicationChannel = 'email' | 'phone' | 'sms' | 'linkedin' | 'whatsapp' | 'video'
type DealProbability = 0 | 25 | 50 | 75 | 90 | 100
type SalesStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost'
type ActivityType = 'call' | 'email' | 'meeting' | 'demo' | 'proposal' | 'follow-up' | 'note'
type NotificationType = 'deal_update' | 'task_due' | 'meeting_reminder' | 'lead_assigned' | 'goal_achieved'

type EnhancedContact = Contact & {
  leadScore: LeadScore
  lastActivity: string
  totalDeals: number
  totalValue: number
  communicationPreference: CommunicationChannel
}

type EnhancedCompany = Company & {
  revenue: number
  employees: number
}

type EnhancedDeal = Deal & {
  competitor: string
  nextAction: string
  nextActionDate: string
  lastActivity: string
  assignedTo: string
}

type EnhancedActivity = Activity & {
  channel: CommunicationChannel
  duration: number
  outcome: string
  nextAction: string
  attachments: string[]
  location: string
  participants: string[]
}

type CRMDashboard = {
  totalRevenue: number
  monthlyRevenue: number
  quarterlyRevenue: number
  yearlyRevenue: number
  revenueGrowth: number
  totalDeals: number
  openDeals: number
  closedDeals: number
  wonDeals: number
  lostDeals: number
  winRate: number
  averageDealSize: number
  salesCycle: number
  pipelineValue: number
  qualifiedLeads: number
  conversionRate: number
  topPerformer: string
  topDeal: string
  recentActivities: EnhancedActivity[]
  upcomingTasks: any[]
  alerts: any[]
}

export function CRMPage() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDeal, setSelectedDeal] = useState<EnhancedDeal | null>(null)
  const [selectedContact, setSelectedContact] = useState<EnhancedContact | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<EnhancedCompany | null>(null)
  const [showDealDialog, setShowDealDialog] = useState(false)
  const [showContactDialog, setShowContactDialog] = useState(false)
  const [showCompanyDialog, setShowCompanyDialog] = useState(false)
  const [editingDeal, setEditingDeal] = useState<EnhancedDeal | null>(null)
  const [editingContact, setEditingContact] = useState<EnhancedContact | null>(null)
  const [editingCompany, setEditingCompany] = useState<EnhancedCompany | null>(null)
  const [dashboard, setDashboard] = useState<CRMDashboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showContactProfile, setShowContactProfile] = useState(false)
  const [showEmailIntegration, setShowEmailIntegration] = useState(false)
  const [emailIntegrationContext, setEmailIntegrationContext] = useState<{
    contactId?: string
    companyId?: string
    dealId?: string
  }>({})
  const [showPWASettings, setShowPWASettings] = useState(false)
  const [showCrossModuleSearch, setShowCrossModuleSearch] = useState(false)
  const [pwaSyncStatus, setPwaSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')

  // Data state
  const [contacts, setContacts] = useState<EnhancedContact[]>([])
  const [companies, setCompanies] = useState<EnhancedCompany[]>([])
  const [deals, setDeals] = useState<EnhancedDeal[]>([])
  const [activities, setActivities] = useState<EnhancedActivity[]>([])
  const [dealStages, setDealStages] = useState<DealStage[]>([])

  // Sample data for enhanced CRM
  const sampleDashboard: CRMDashboard = {
    totalRevenue: 36750000, // R36.75M (converted from $2.45M)
    monthlyRevenue: 2775000, // R2.775M (converted from $185K)
    quarterlyRevenue: 7800000, // R7.8M (converted from $520K)
    yearlyRevenue: 36750000, // R36.75M (converted from $2.45M)
    revenueGrowth: 12.5,
    totalDeals: 156,
    openDeals: 42,
    closedDeals: 114,
    wonDeals: 89,
    lostDeals: 25,
    winRate: 78.1,
    averageDealSize: 235575, // R235,575 (converted from $15,705)
    salesCycle: 45,
    pipelineValue: 10200000, // R10.2M (converted from $680K)
    qualifiedLeads: 234,
    conversionRate: 18.2,
    topPerformer: "Sarah Johnson",
    topDeal: "Enterprise Software License - R1,875,000",
    recentActivities: [],
    upcomingTasks: [],
    alerts: []
  }

  const sampleContacts: EnhancedContact[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@techcorp.com',
      phone: '+1-555-0123',
      company: { 
        id: '1', 
        name: 'TechCorp Inc.',
        industry: 'Technology',
        size: 'large',
        website: 'https://techcorp.com',
        socialProfiles: [],
        tags: [],
        isFavorite: false,
        status: 'active',
        annualRevenue: 50000000,
        employeeCount: 500,
        foundedYear: 2010,
        lastContactDate: new Date('2024-01-15'),
        nextFollowUp: new Date('2024-01-22'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
        createdBy: 'system',
        assignedTo: 'Sarah Johnson',
        customFields: {},
        contacts: [],
        deals: []
      },
      title: 'CTO',
      leadScore: 'hot',
      source: 'website',
      lastActivity: '2024-01-15',
      totalDeals: 3,
      totalValue: 1875000, // R1,875,000 (converted from $125,000)
      communicationPreference: 'email',
      socialProfiles: [
        { platform: 'linkedin', url: 'https://linkedin.com/in/johnsmith', isVerified: false },
        { platform: 'twitter', url: 'https://twitter.com/johnsmith', isVerified: false }
      ],
      tags: ['enterprise', 'decision-maker', 'high-value'],
      notes: 'Interested in enterprise solution. Budget approved.',
      assignedTo: 'Sarah Johnson',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
      avatar: '',
      status: 'active',
      isFavorite: false,
      lastContactDate: new Date('2024-01-15'),
      nextFollowUp: new Date('2024-01-22'),
      createdBy: 'system',
      customFields: {},
      addresses: [],
      communicationHistory: []
    },
    {
      id: '2',
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@startup.com',
      phone: '+1-555-0124',
      company: { 
        id: '2', 
        name: 'StartupXYZ',
        industry: 'Technology',
        size: 'startup',
        website: 'https://startupxyz.com',
        socialProfiles: [],
        tags: [],
        isFavorite: false,
        status: 'active',
        annualRevenue: 15000000, // R15M (converted from $1M)
        employeeCount: 10,
        foundedYear: 2020,
        lastContactDate: new Date('2024-01-14'),
        nextFollowUp: new Date('2024-01-21'),
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-14'),
        createdBy: 'system',
        assignedTo: 'Mike Chen',
        customFields: {},
        contacts: [],
        deals: []
      },
      title: 'Founder',
      leadScore: 'warm',
      source: 'manual',
      lastActivity: '2024-01-14',
      totalDeals: 1,
      totalValue: 375000, // R375,000 (converted from $25,000)
      communicationPreference: 'phone',
      socialProfiles: [
        { platform: 'linkedin', url: 'https://linkedin.com/in/emilydavis', isVerified: false }
      ],
      tags: ['startup', 'early-stage', 'budget-conscious'],
      notes: 'Looking for cost-effective solution for small team.',
      assignedTo: 'Mike Chen',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-14'),
      avatar: '',
      status: 'active',
      isFavorite: false,
      lastContactDate: new Date('2024-01-14'),
      nextFollowUp: new Date('2024-01-21'),
      createdBy: 'system',
      customFields: {},
      addresses: [],
      communicationHistory: []
    }
  ]

  const sampleCompanies: EnhancedCompany[] = [
    {
      id: '1',
      name: 'TechCorp Inc.',
      industry: 'Technology',
      size: 'large',
      website: 'https://techcorp.com',
      socialProfiles: [
        { platform: 'linkedin', url: 'https://linkedin.com/company/techcorp', isVerified: false },
        { platform: 'twitter', url: 'https://twitter.com/techcorp', isVerified: false }
      ],
      tags: ['enterprise', 'technology', 'fortune-500'],
      isFavorite: false,
      status: 'active',
      annualRevenue: 750000000, // R750M (converted from $50M)
      employeeCount: 500,
      revenue: 750000000, // R750M (converted from $50M)
      employees: 500,
      foundedYear: 2010,
      lastContactDate: new Date('2024-01-15'),
      nextFollowUp: new Date('2024-01-22'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
      createdBy: 'system',
      assignedTo: 'Sarah Johnson',
      customFields: {},
      contacts: [],
      deals: [],
      address: {
        type: 'work',
        street: '123 Tech Street',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
        country: 'USA',
        isPrimary: true
      },
      phone: '+1-555-0123',
      email: 'info@techcorp.com',
      description: 'Large enterprise client with complex requirements.'
    }
  ]

  const sampleDeals: EnhancedDeal[] = [
    {
      id: '1',
      name: 'Enterprise Software License',
      description: 'Enterprise software license for TechCorp Inc.',
      value: 1875000, // R1,875,000 (converted from $125,000)
      currency: 'ZAR',
      stage: 'negotiation' as DealStage,
      probability: 75,
      closeDate: undefined,
      expectedCloseDate: new Date('2024-01-31'),
      contactId: '1',
      contact: undefined,
      companyId: '1',
      company: undefined,
      ownerId: 'sarah-johnson',
      owner: undefined,
      source: 'website',
      priority: 'high',
      status: 'active',
      tags: ['enterprise', 'software', 'high-value'],
      notes: 'Final negotiations in progress. Decision expected by month-end.',
      activities: [],
      attachments: [],
      customFields: {},
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
      lastActivityAt: new Date('2024-01-15'),
      wonDate: undefined,
      lostDate: undefined,
      lostReason: undefined,
      nextFollowUp: new Date('2024-01-20'),
      emailThreads: [],
      competitor: 'Salesforce',
      nextAction: 'Send final proposal',
      nextActionDate: '2024-01-20',
      lastActivity: '2024-01-15',
      assignedTo: 'Sarah Johnson'
    }
  ]

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        // Load sample data for now
        setDashboard(sampleDashboard)
        setContacts(sampleContacts)
        setCompanies(sampleCompanies)
        setDeals(sampleDeals)
        
        // Try to load real data if available
        try {
        const [contactsData, companiesData, dealsData, activitiesData, stagesData, analyticsData] = await Promise.all([
          crmService.getContacts(),
          crmService.getCompanies(),
          crmService.getDeals(),
          crmService.getActivities(),
          crmService.getDealStages(),
          crmService.getAnalytics()
        ])
        
          // Convert to enhanced types if real data exists
          if (contactsData.length > 0) {
            setContacts(contactsData.map(c => ({
              ...c,
              leadScore: 'warm' as LeadScore,
              source: 'manual',
              lastActivity: new Date().toISOString(),
              totalDeals: 0,
              totalValue: 0,
              communicationPreference: 'email' as CommunicationChannel,
              socialProfiles: [],
              tags: [],
              notes: '',
              assignedTo: 'Unassigned',
              createdAt: new Date(),
              updatedAt: new Date()
            })))
          }
        } catch (error) {
          console.log('Using sample data - CRM service not available')
        }
      } catch (error) {
        console.error('Error loading CRM data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
    setupPWAIntegration()
  }, [])

  const handleSectionClick = (section: string) => {
    setActiveSection(section)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const getLeadScoreColor = (score: LeadScore) => {
    switch (score) {
      case 'hot': return 'bg-red-100 text-red-800'
      case 'warm': return 'bg-orange-100 text-orange-800'
      case 'cold': return 'bg-blue-100 text-blue-800'
      case 'dead': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStageColor = (stage: SalesStage) => {
    switch (stage) {
      case 'lead': return 'bg-gray-100 text-gray-800'
      case 'qualified': return 'bg-blue-100 text-blue-800'
      case 'proposal': return 'bg-yellow-100 text-yellow-800'
      case 'negotiation': return 'bg-orange-100 text-orange-800'
      case 'closed-won': return 'bg-green-100 text-green-800'
      case 'closed-lost': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const setupPWAIntegration = () => {
    // Listen for integration events
    integrationService.addEventListener('email_received', handleEmailReceived)
    integrationService.addEventListener('email_sent', handleEmailSent)
    integrationService.addEventListener('deal_created', handleDealCreated)
    integrationService.addEventListener('deal_updated', handleDealUpdated)

    // Initial sync
    syncWithOtherModules()
  }

  // Content Components
  const DashboardContent = ({ dashboard }: { dashboard: CRMDashboard | null }) => {
    if (!dashboard) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{formatCurrency(dashboard.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
                +{dashboard.revenueGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Open Deals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{dashboard.openDeals}</div>
            <p className="text-xs text-muted-foreground">
                {formatCurrency(dashboard.pipelineValue)} pipeline value
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Win Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{dashboard.winRate}%</div>
            <p className="text-xs text-muted-foreground">
                {dashboard.wonDeals} won / {dashboard.lostDeals} lost
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Avg Deal Size</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{formatCurrency(dashboard.averageDealSize)}</div>
            <p className="text-xs text-muted-foreground">
                {dashboard.salesCycle} day sales cycle
            </p>
          </CardContent>
        </Card>
      </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-card border-border">
        <CardHeader>
              <CardTitle className="text-card-foreground">Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Revenue chart placeholder
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-card-foreground">New deal created</p>
                    <p className="text-xs text-muted-foreground">Enterprise Software License - R1,875,000</p>
                </div>
                  <span className="text-xs text-muted-foreground">2h ago</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-card-foreground">Deal closed</p>
                    <p className="text-xs text-muted-foreground">Marketing Campaign - R375,000</p>
              </div>
                  <span className="text-xs text-muted-foreground">4h ago</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-card-foreground">Follow-up scheduled</p>
                    <p className="text-xs text-muted-foreground">John Smith - TechCorp Inc.</p>
                  </div>
                  <span className="text-xs text-muted-foreground">6h ago</span>
                </div>
          </div>
        </CardContent>
      </Card>
        </div>
    </div>
  )
}

  const LeadsContent = ({ contacts }: { contacts: EnhancedContact[] }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Leads ({contacts.length})</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Lead
          </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((contact) => (
          <Card key={contact.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>{contact.firstName[0]}{contact.lastName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{contact.firstName} {contact.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{contact.title}</p>
                  <p className="text-sm text-muted-foreground">{contact.company?.name}</p>
                </div>
              </div>
              <Badge className={getLeadScoreColor(contact.leadScore)}>
                {contact.leadScore}
                </Badge>
              </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                {contact.email}
                    </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-3 w-3" />
                {contact.phone}
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Target className="h-3 w-3" />
                Source: {contact.source}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  const DealsContent = ({ deals }: { deals: EnhancedDeal[] }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Deals ({deals.length})</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Deal
        </Button>
                    </div>
                    
      <div className="space-y-4">
        {deals.map((deal) => (
          <Card key={deal.id} className="p-4">
                    <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium">{deal.name}</h3>
                <p className="text-sm text-muted-foreground">{deal.company?.name}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-lg font-bold">{formatCurrency(deal.value)}</span>
                  <Badge className={getStageColor(deal.stage)}>
                    {deal.stage}
                      </Badge>
                  <span className="text-sm text-muted-foreground">
                    {deal.probability}% probability
                  </span>
                    </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Next Action</p>
                <p className="text-sm font-medium">{deal.nextAction}</p>
                <p className="text-xs text-muted-foreground">{deal.nextActionDate}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  const PipelineContent = ({ deals }: { deals: EnhancedDeal[] }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Sales Pipeline</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Deal
        </Button>
                      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['lead', 'qualified', 'proposal', 'negotiation'].map((stage) => (
          <Card key={stage} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium capitalize">{stage}</h3>
              <Badge variant="secondary">
                {deals.filter(d => d.stage === stage).length}
                        </Badge>
                    </div>
            <div className="space-y-2">
              {deals.filter(d => d.stage === stage).map((deal) => (
                <div key={deal.id} className="p-2 bg-muted rounded">
                  <p className="text-sm font-medium text-card-foreground">{deal.name}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(deal.value)}</p>
                </div>
              ))}
                  </div>
                </Card>
              ))}
      </div>
    </div>
  )

  const ForecastingContent = ({ dashboard }: { dashboard: CRMDashboard | null }) => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Revenue Forecasting</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(dashboard?.monthlyRevenue || 0)}</div>
            <p className="text-sm text-muted-foreground">Expected this month</p>
            </CardContent>
          </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quarterly Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(dashboard?.quarterlyRevenue || 0)}</div>
            <p className="text-sm text-muted-foreground">Expected this quarter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Yearly Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(dashboard?.yearlyRevenue || 0)}</div>
            <p className="text-sm text-muted-foreground">Expected this year</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const ContactsContent = ({ contacts }: { contacts: EnhancedContact[] }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Contacts ({contacts.length})</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Contact
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((contact) => (
          <Card key={contact.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>{contact.firstName[0]}{contact.lastName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{contact.firstName} {contact.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{contact.title}</p>
                  <p className="text-sm text-muted-foreground">{contact.company?.name}</p>
                </div>
              </div>
              <Badge className={getLeadScoreColor(contact.leadScore)}>
                {contact.leadScore}
              </Badge>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                {contact.email}
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {contact.phone}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  const CompaniesContent = ({ companies }: { companies: EnhancedCompany[] }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Companies ({companies.length})</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Company
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map((company) => (
          <Card key={company.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>{company.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{company.name}</h3>
                  <p className="text-sm text-muted-foreground">{company.industry}</p>
                  <p className="text-sm text-muted-foreground">{company.size} • {company.employees} employees</p>
                </div>
              </div>
              <Badge variant="outline">
                {company.size}
              </Badge>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Globe className="h-3 w-3" />
                  {company.website}
                </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <BarChart3 className="h-3 w-3" />
                {formatCurrency(company.revenue)} revenue
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  const AccountsContent = ({ companies }: { companies: EnhancedCompany[] }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Accounts ({companies.length})</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Account
        </Button>
      </div>
      
      <div className="space-y-4">
        {companies.map((company) => (
          <Card key={company.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-lg">{company.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">{company.name}</h3>
                  <p className="text-sm text-muted-foreground">{company.industry} • {company.size}</p>
                  <p className="text-sm text-muted-foreground">{company.employees} employees</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{formatCurrency(company.revenue)}</p>
                <p className="text-sm text-muted-foreground">Annual Revenue</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  const ActivitiesContent = ({ activities }: { activities: EnhancedActivity[] }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Activities ({activities.length})</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Activity
        </Button>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <Card className="p-8 text-center">
            <ActivityLucideIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No activities yet</h3>
            <p className="text-muted-foreground">Start by creating your first activity</p>
          </Card>
        ) : (
          activities.map((activity) => (
          <Card key={activity.id} className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                  <p className="font-medium">{activity.description}</p>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </div>
                <span className="text-sm text-muted-foreground">{activity.createdAt.toLocaleDateString()}</span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )

  const EmailContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Email Integration</h2>
      <Card className="p-8 text-center">
        <MailIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Email Integration</h3>
        <p className="text-muted-foreground mb-4">Connect your email to sync conversations and track communications</p>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Configure Email
        </Button>
      </Card>
    </div>
  )

  const CallsContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Call Management</h2>
      <Card className="p-8 text-center">
        <PhoneIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Call Integration</h3>
        <p className="text-muted-foreground mb-4">Connect your phone system to track calls and recordings</p>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Configure Calls
        </Button>
      </Card>
    </div>
  )

  const MeetingsContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Meeting Management</h2>
      <Card className="p-8 text-center">
        <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Meeting Integration</h3>
        <p className="text-muted-foreground mb-4">Connect your calendar and video conferencing tools</p>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Configure Meetings
        </Button>
      </Card>
    </div>
  )

  const CampaignsContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Marketing Campaigns</h2>
      <Card className="p-8 text-center">
        <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Campaign Management</h3>
        <p className="text-muted-foreground mb-4">Create and track marketing campaigns</p>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </Card>
    </div>
  )

  const LeadScoringContent = ({ contacts }: { contacts: EnhancedContact[] }) => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Lead Scoring</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['hot', 'warm', 'cold', 'dead'].map((score) => (
          <Card key={score} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium capitalize">{score} leads</h3>
              <Badge className={getLeadScoreColor(score as LeadScore)}>
                {contacts.filter(c => c.leadScore === score).length}
                  </Badge>
                </div>
            <div className="space-y-2">
              {contacts.filter(c => c.leadScore === score).map((contact) => (
                <div key={contact.id} className="p-2 bg-muted rounded">
                  <p className="text-sm font-medium text-card-foreground">{contact.firstName} {contact.lastName}</p>
                  <p className="text-xs text-muted-foreground">{contact.company?.name}</p>
              </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  const AutomationContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Automation</h2>
      <Card className="p-8 text-center">
        <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Workflow Automation</h3>
        <p className="text-muted-foreground mb-4">Create automated workflows to streamline your sales process</p>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </Card>
          </div>
  )

  const ReportsContent = ({ dashboard }: { dashboard: CRMDashboard | null }) => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(dashboard?.totalRevenue || 0)}</div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Deal Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard?.totalDeals || 0}</div>
            <p className="text-sm text-muted-foreground">Total Deals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Performance Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard?.winRate || 0}%</div>
            <p className="text-sm text-muted-foreground">Win Rate</p>
          </CardContent>
        </Card>
            </div>
            </div>
  )

  const AnalyticsContent = ({ dashboard }: { dashboard: CRMDashboard | null }) => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Revenue analytics chart
          </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Deal Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Deal analytics chart
        </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const PerformanceContent = ({ dashboard }: { dashboard: CRMDashboard | null }) => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Performance</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.topPerformer || 'N/A'}</div>
            <p className="text-sm text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Deal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{dashboard?.topDeal || 'N/A'}</div>
            <p className="text-sm text-muted-foreground">Highest value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.conversionRate || 0}%</div>
            <p className="text-sm text-muted-foreground">Lead to customer</p>
          </CardContent>
        </Card>
            </div>
            </div>
  )

  const IntegrationsContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Integrations</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {['Email', 'Calendar', 'Phone', 'Social Media', 'Marketing', 'Analytics'].map((integration) => (
          <Card key={integration} className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                <Settings className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
                <h3 className="font-medium">{integration}</h3>
                <p className="text-sm text-muted-foreground">Not connected</p>
          </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-3">
              Connect
            </Button>
          </Card>
        ))}
          </div>
        </div>
  )

  const SettingsContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
          <div>
            <Label>Company Name</Label>
            <Input placeholder="Enter company name" />
          </div>
          <div>
              <Label>Default Currency</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zar">ZAR</SelectItem>
                  <SelectItem value="eur">EUR</SelectItem>
                  <SelectItem value="gbp">GBP</SelectItem>
                </SelectContent>
              </Select>
          </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>User Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="notifications" />
              <Label htmlFor="notifications">Email notifications</Label>
          </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="dark-mode" />
              <Label htmlFor="dark-mode">Dark mode</Label>
        </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const loadContacts = async () => {
    try {
      const contactsData = await crmService.getContacts()
      if (contactsData.length > 0) {
        setContacts(contactsData.map(c => ({
          ...c,
          source: 'other' as const,
          leadScore: 'warm' as LeadScore,
          lastActivity: new Date().toISOString(),
          totalDeals: 0,
          totalValue: 0,
          communicationPreference: 'email' as CommunicationChannel
        } as unknown as EnhancedContact)))
      }
    } catch (error) {
      console.error('Error loading contacts:', error)
    }
  }

  const loadDeals = async () => {
    try {
      const dealsData = await crmService.getDeals()
      if (dealsData.length > 0) {
        setDeals(dealsData.map(d => ({
          ...d,
          source: 'other' as const,
          competitor: '',
          nextAction: '',
          nextActionDate: '',
          lastActivity: new Date().toISOString(),
          assignedTo: 'Unassigned'
        } as EnhancedDeal)))
      }
    } catch (error) {
      console.error('Error loading deals:', error)
    }
  }

  const handleEmailReceived = (event: any) => {
    console.log('Email received in CRM:', event)
    // Refresh contacts to show updated last contact date
    loadContacts()
  }

  const handleEmailSent = (event: any) => {
    console.log('Email sent from CRM:', event)
    // Update contact last contact date
    if (event.data.contactId) {
      loadContacts()
    }
  }

  const handleDealCreated = (event: any) => {
    console.log('Deal created:', event)
    // Refresh deals
    loadDeals()
  }

  const handleDealUpdated = (event: any) => {
    console.log('Deal updated:', event)
    // Refresh deals
    loadDeals()
  }

  const syncWithOtherModules = async () => {
    setPwaSyncStatus('syncing')
    try {
      await integrationService.syncAllModules()
      setPwaSyncStatus('success')
    } catch (error) {
      console.error('Sync failed:', error)
      setPwaSyncStatus('error')
    }
  }

  // Filtered data based on search
  const filteredContacts = useMemo(() => {
    if (!searchQuery) return contacts
    const query = searchQuery.toLowerCase()
    return contacts.filter(c => 
      c.firstName.toLowerCase().includes(query) ||
      c.lastName.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.title?.toLowerCase().includes(query) ||
      c.company?.name.toLowerCase().includes(query)
    )
  }, [contacts, searchQuery])

  const filteredCompanies = useMemo(() => {
    if (!searchQuery) return companies
    const query = searchQuery.toLowerCase()
    return companies.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.industry?.toLowerCase().includes(query) ||
      c.description?.toLowerCase().includes(query)
    )
  }, [companies, searchQuery])

  const filteredDeals = useMemo(() => {
    if (!searchQuery) return deals
    const query = searchQuery.toLowerCase()
    return deals.filter(d => 
      d.name.toLowerCase().includes(query) ||
      d.description?.toLowerCase().includes(query) ||
      d.contact?.firstName.toLowerCase().includes(query) ||
      d.contact?.lastName.toLowerCase().includes(query) ||
      d.company?.name.toLowerCase().includes(query)
    )
  }, [deals, searchQuery])

  // Deal pipeline data
  const pipelineData = useMemo(() => {
    const stages = crmService.getDealStages()
    return stages.map(stage => ({
      ...stage,
      deals: deals.filter(d => d.stage === stage.id)
    }))
  }, [deals])

  // Event handlers
  const handleCreateDeal = () => {
    setEditingDeal(null)
    setShowDealDialog(true)
  }

  const handleEditDeal = (deal: EnhancedDeal) => {
    setEditingDeal(deal)
    setShowDealDialog(true)
  }

  const handleCreateContact = () => {
    setEditingContact(null)
    setShowContactDialog(true)
  }

  const handleEditContact = (contact: EnhancedContact) => {
    setEditingContact(contact)
    setShowContactDialog(true)
  }

  const handleSelectContact = (contact: EnhancedContact) => {
    setSelectedContact(contact)
    setShowContactProfile(true)
  }

  const handleOpenEmailIntegration = (context: { contactId?: string; companyId?: string; dealId?: string }) => {
    setEmailIntegrationContext(context)
    setShowEmailIntegration(true)
  }

  const handleCreateCompany = () => {
    setEditingCompany(null)
    setShowCompanyDialog(true)
  }

  const handleEditCompany = (company: EnhancedCompany) => {
    setEditingCompany(company)
    setShowCompanyDialog(true)
  }

  const handleMoveDeal = (dealId: string, newStage: DealStage) => {
    const updatedDeal = crmService.moveDealToStage(dealId, newStage)
    if (updatedDeal) {
      setDeals(prev => prev.map(d => d.id === dealId ? {
        ...d,
        stage: newStage as SalesStage
      } : d))
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  if (isLoading) {
  return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
    )
  }

  return (
    <div className="h-full flex bg-background">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-card border-r border-border flex flex-col shadow-lg flex-shrink-0 relative z-10`}>
        <div className="flex-1 overflow-y-auto max-h-screen scrollbar-thin scrollbar-thumb-muted-foreground scrollbar-track-muted" style={{
          maxHeight: '100vh', 
          overflowY: 'auto', 
          scrollbarWidth: 'thin',
          scrollbarColor: 'hsl(var(--muted-foreground)) hsl(var(--muted))'
        }}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && <h2 className="text-lg font-semibold text-card-foreground">CRM</h2>}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-muted-foreground hover:text-card-foreground hover:bg-muted"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${sidebarCollapsed ? 'rotate-90' : ''}`} />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 p-4 space-y-2">
          {/* Dashboard */}
          <div className="space-y-1">
            <Button
              variant={activeSection === 'dashboard' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'dashboard' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('dashboard')}
            >
              <BarChart3 className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Dashboard</span>}
            </Button>
          </div>

          {/* Sales Management */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Sales</span>}
            </div>
            <Button
              variant={activeSection === 'leads' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'leads' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('leads')}
            >
              <Target className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Leads</span>}
            </Button>
            <Button
              variant={activeSection === 'deals' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'deals' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('deals')}
            >
              <BarChart3 className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Deals</span>}
            </Button>
            <Button
              variant={activeSection === 'pipeline' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'pipeline' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('pipeline')}
            >
              <TrendingUp className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Pipeline</span>}
            </Button>
            <Button
              variant={activeSection === 'forecasting' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'forecasting' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('forecasting')}
            >
              <LineChart className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Forecasting</span>}
            </Button>
          </div>

          {/* Customer Management */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Customers</span>}
            </div>
            <Button
              variant={activeSection === 'contacts' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'contacts' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('contacts')}
            >
              <Users className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Contacts</span>}
            </Button>
            <Button
              variant={activeSection === 'companies' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'companies' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('companies')}
            >
              <Building2 className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Companies</span>}
            </Button>
            <Button
              variant={activeSection === 'accounts' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'accounts' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('accounts')}
            >
              <Building className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Accounts</span>}
            </Button>
          </div>

          {/* Communication */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Communication</span>}
            </div>
            <Button
              variant={activeSection === 'activities' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'activities' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('activities')}
            >
              <ActivityLucideIcon className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Activities</span>}
            </Button>
            <Button
              variant={activeSection === 'email' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'email' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('email')}
            >
              <MailIcon className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Email</span>}
            </Button>
            <Button
              variant={activeSection === 'calls' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'calls' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('calls')}
            >
              <PhoneIcon className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Calls</span>}
            </Button>
            <Button
              variant={activeSection === 'meetings' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'meetings' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('meetings')}
            >
              <Video className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Meetings</span>}
            </Button>
          </div>

          {/* Marketing */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Marketing</span>}
            </div>
            <Button
              variant={activeSection === 'campaigns' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'campaigns' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('campaigns')}
            >
              <Target className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Campaigns</span>}
            </Button>
            <Button
              variant={activeSection === 'leads-scoring' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'leads-scoring' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('leads-scoring')}
            >
              <Brain className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Lead Scoring</span>}
            </Button>
            <Button
              variant={activeSection === 'automation' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'automation' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('automation')}
            >
              <Zap className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Automation</span>}
            </Button>
          </div>

          {/* Analytics & Reports */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Analytics</span>}
            </div>
            <Button
              variant={activeSection === 'reports' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'reports' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('reports')}
            >
              <FileSpreadsheet className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Reports</span>}
            </Button>
            <Button
              variant={activeSection === 'analytics' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'analytics' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('analytics')}
            >
              <PieChart className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Analytics</span>}
            </Button>
            <Button
              variant={activeSection === 'performance' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'performance' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('performance')}
            >
              <Award className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Performance</span>}
            </Button>
          </div>

          {/* Settings */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Settings</span>}
            </div>
            <Button
              variant={activeSection === 'integrations' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'integrations' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('integrations')}
            >
              <Globe className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Integrations</span>}
            </Button>
            <Button
              variant={activeSection === 'settings' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'settings' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('settings')}
            >
              <Settings className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Settings</span>}
            </Button>
          </div>

          {/* Additional menu items to force scroll */}
          <div className="space-y-1 mt-4">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Tools</span>}
            </div>
            <Button
              variant="ghost"
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} text-muted-foreground hover:text-card-foreground hover:bg-muted`}
            >
              <FileText className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Reports</span>}
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} text-muted-foreground hover:text-card-foreground hover:bg-muted`}
            >
              <Download className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Export</span>}
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} text-muted-foreground hover:text-card-foreground hover:bg-muted`}
            >
              <Upload className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Import</span>}
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} text-muted-foreground hover:text-card-foreground hover:bg-muted`}
            >
              <Bell className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Notifications</span>}
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} text-muted-foreground hover:text-card-foreground hover:bg-muted`}
            >
              <UserPlus className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Users</span>}
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} text-muted-foreground hover:text-card-foreground hover:bg-muted`}
            >
              <Shield className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Security</span>}
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} text-muted-foreground hover:text-card-foreground hover:bg-muted`}
            >
              <RefreshCw className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Sync</span>}
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} text-muted-foreground hover:text-card-foreground hover:bg-muted`}
            >
              <HelpCircle className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Help</span>}
            </Button>
          </div>
        </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-foreground">CRM Dashboard</h1>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search contacts, companies, deals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-80"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowCrossModuleSearch(true)}>
                <Search className="h-4 w-4 mr-2" />
                Cross-Module Search
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowPWASettings(true)}>
                <Settings className="h-4 w-4 mr-2" />
                PWA Settings
              </Button>
              <Button onClick={() => setShowContactDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {activeSection === 'dashboard' && (
            <DashboardContent dashboard={dashboard} />
          )}
          {activeSection === 'leads' && (
            <LeadsContent contacts={contacts} />
          )}
          {activeSection === 'deals' && (
            <DealsContent deals={deals} />
          )}
          {activeSection === 'pipeline' && (
            <PipelineContent deals={deals} />
          )}
          {activeSection === 'forecasting' && (
            <ForecastingContent dashboard={dashboard} />
          )}
          {activeSection === 'contacts' && (
            <ContactsContent contacts={contacts} />
          )}
          {activeSection === 'companies' && (
            <CompaniesContent companies={companies} />
          )}
          {activeSection === 'accounts' && (
            <AccountsContent companies={companies} />
          )}
          {activeSection === 'activities' && (
            <ActivitiesContent activities={activities} />
          )}
          {activeSection === 'email' && (
            <EmailContent />
          )}
          {activeSection === 'calls' && (
            <CallsContent />
          )}
          {activeSection === 'meetings' && (
            <MeetingsContent />
          )}
          {activeSection === 'campaigns' && (
            <CampaignsContent />
          )}
          {activeSection === 'leads-scoring' && (
            <LeadScoringContent contacts={contacts} />
          )}
          {activeSection === 'automation' && (
            <AutomationContent />
          )}
          {activeSection === 'reports' && (
            <ReportsContent dashboard={dashboard} />
          )}
          {activeSection === 'analytics' && (
            <AnalyticsContent dashboard={dashboard} />
          )}
          {activeSection === 'performance' && (
            <PerformanceContent dashboard={dashboard} />
          )}
          {activeSection === 'integrations' && (
            <IntegrationsContent />
          )}
          {activeSection === 'settings' && (
            <SettingsContent />
          )}
        </div>
      </div>
    </div>
  )
}
