"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
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
  ArrowRight, Trash2, Edit, Eye, Star, MessageSquare, FileText, Copy,
  Table, List,
  TrendingUp, Target, Clock, CheckCircle, AlertCircle, XCircle, X, HelpCircle,
  Search, Filter, Download, Upload, Settings, Bell, UserPlus,
  Building, Briefcase, Activity as ActivityLucideIcon, Mail as MailIcon, Phone as PhoneIcon,
  ChevronDown, PieChart, LineChart, Zap, Brain, Shield, Globe, LayoutGrid, 
  Video, Mic, Send, FileSpreadsheet, Award, TrendingDown, 
  RefreshCw, Recycle, Package, Truck, Wallet, CreditCard, Route as RouteIcon,
  Smartphone, Laptop, Monitor, Headphones, Camera, MapPin, Menu,
  Tag, Hash, Percent, Calculator, Clock3, Timer, PlayCircle,
  PauseCircle, StopCircle, Volume2, VolumeX, Wifi, WifiOff,
  Battery, BatteryLow, Signal, SignalHigh, SignalLow, SignalZero,
  Database
} from "lucide-react"
import { crmService } from "@/lib/crm-service"
import { integrationService } from "@/lib/integration-service"
import { recyclingService } from "@/lib/recycling-service"
import { Contact, Company, Deal, Activity, DealStage, CRMAnalytics } from "@/types/crm"
import KanbanBoard from "@/components/crm/KanbanBoard"
import { ContactProfile } from "@/components/crm/ContactProfile"
import { EmailIntegration } from "@/components/crm/EmailIntegration"
import { AnalyticsPage } from "@/components/analytics/AnalyticsPage"
import { AutomationPage } from "@/components/automation/AutomationPage"
import { LeadsPage } from "@/components/leads/LeadsPage"
import { CalendarPage } from "@/components/calendar/CalendarPage"
import { AdvancedSearchPage } from "@/components/search/AdvancedSearchPage"
import { CollaborationPage } from "@/components/collaboration/CollaborationPage"
import { DataManagementPage } from "@/components/data/DataManagementPage"
import { SettingsPage } from "@/components/settings/SettingsPage"
import { CommunicationPage } from "@/components/communication/CommunicationPage"
import { CollectionsPage } from "@/components/collections/CollectionsPage"
import { CustomerProfilePage } from "@/components/customers/CustomerProfilePage"
import { CustomersSegmentationPage } from "@/components/customers/CustomersSegmentationPage"
import { PartnersPage } from "@/components/partners/PartnersPage"
import { MaterialsInventoryPage } from "@/components/materials/MaterialsInventoryPage"
import { RoutesPage } from "@/components/routes/RoutesPage"
import { RecyclingAnalyticsPage } from "@/components/analytics/RecyclingAnalyticsPage"
import { InvoicingPage } from "@/components/invoicing/InvoicingPage"
import { EnhancedDashboard } from "@/components/dashboard/EnhancedDashboard"
import { NotificationCenter } from "@/components/notifications/NotificationCenter"
import { CommandPalette } from "@/components/command/CommandPalette"

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
  revenueForecast: number
  sponsorEngagementScore: number
  qualifiedLeads: number
  conversionRate: number
  topPerformer: string
  topDeal: string
  recentActivities: EnhancedActivity[]
  upcomingTasks: any[]
  alerts: any[]
}

export default function CRMPage() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
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
  const [pwaSyncStatus, setPwaSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')

  // Data state
  const [contacts, setContacts] = useState<EnhancedContact[]>([])
  const [companies, setCompanies] = useState<EnhancedCompany[]>([])
  const [deals, setDeals] = useState<EnhancedDeal[]>([])
  const [activities, setActivities] = useState<EnhancedActivity[]>([])
  const [dealStages, setDealStages] = useState<DealStage[]>([])
  
  // Recycling data state
  const [recyclingCustomers, setRecyclingCustomers] = useState<any[]>([])
  const [recyclingCollections, setRecyclingCollections] = useState<any[]>([])
  const [recyclingKPIs, setRecyclingKPIs] = useState<any>(null)

  // Mock data removed - data will be loaded from database or API

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Load real data from CRM service
        try {
          const [contactsData, companiesData, dealsData, activitiesData] = await Promise.all([
            Promise.resolve(crmService.getContacts()),
            Promise.resolve(crmService.getCompanies()),
            Promise.resolve(crmService.getDeals()),
            Promise.resolve(crmService.getActivities())
          ])
          
          const analyticsData = crmService.getAnalytics()
          const stagesData = crmService.getDealStages()
          
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
          
          if (companiesData.length > 0) {
            setCompanies(companiesData.map(c => ({
              ...c,
              revenue: 0,
              employees: 0
            })))
          }
          
          if (dealsData.length > 0) {
            setDeals(dealsData.map(d => ({
              ...d,
              competitor: '',
              nextAction: '',
              nextActionDate: '',
              lastActivity: new Date().toISOString(),
              assignedTo: 'Unassigned'
            })))
          }
          
          if (activitiesData.length > 0) {
            setActivities(activitiesData.map(a => ({
              ...a,
              channel: 'email' as CommunicationChannel,
              duration: 0,
              outcome: '',
              nextAction: '',
              attachments: [],
              location: '',
              participants: []
            })))
          }
          
          if (stagesData.length > 0) {
            setDealStages(stagesData.map(s => s.id as DealStage))
          }
          
          if (analyticsData) {
            setDashboard({
              totalRevenue: analyticsData.totalRevenue || 0,
              monthlyRevenue: analyticsData.monthlyRevenue || 0,
              quarterlyRevenue: analyticsData.quarterlyRevenue || 0,
              yearlyRevenue: analyticsData.yearlyRevenue || 0,
              revenueGrowth: analyticsData.revenueGrowth || 0,
              totalDeals: analyticsData.totalDeals || 0,
              openDeals: analyticsData.openDeals || 0,
              closedDeals: analyticsData.closedDeals || 0,
              wonDeals: analyticsData.wonDeals || 0,
              lostDeals: analyticsData.lostDeals || 0,
              winRate: analyticsData.winRate || 0,
              averageDealSize: analyticsData.averageDealSize || 0,
              pipelineValue: analyticsData.pipelineValue || 0,
              averageSalesCycle: analyticsData.averageSalesCycle || 0
            })
          }

          // Load recycling data
          const recyclingCustomersData = recyclingService.getCustomers()
          const recyclingCollectionsData = recyclingService.getCollections()
          const dateRange = {
            start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            end: new Date()
          }
          const recyclingKPIData = recyclingService.getKPIs(dateRange)
          
          setRecyclingCustomers(recyclingCustomersData)
          setRecyclingCollections(recyclingCollectionsData)
          setRecyclingKPIs(recyclingKPIData)
        } catch (error) {
          console.error('Error loading CRM data:', error)
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
    // Minimal stub – keep hooks for future integrations but avoid heavy listeners
    // Don't call syncWithOtherModules here to avoid potential SSR issues
    // It will be called when needed
  }

  // Content Components
  const DashboardContent = ({ dashboard }: { dashboard: CRMDashboard | null }) => {
    if (!dashboard) return <div>Loading...</div>

    // Calculate recycling metrics
    const totalCustomers = recyclingCustomers.length
    const totalCollections = recyclingCollections.length
    const completedCollections = recyclingCollections.filter(c => c.status === 'completed').length
    const totalMaterialCollected = recyclingKPIs?.totalMaterialCollected || 0
    const totalRevenue = recyclingKPIs?.revenue || dashboard.totalRevenue || 0

  return (
    <div className="space-y-6">
      {/* Recycling Business Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card to-card/80 shadow-card dark:border-white/10 dark:bg-sidebar-accent dark:from-sidebar-accent dark:to-sidebar-accent/80 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <BarChart3 className="h-4 w-4 text-primary" strokeWidth={2.5} />
            </div>
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
                Recycling operations revenue
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card to-card/80 shadow-card dark:border-white/10 dark:bg-sidebar-accent dark:from-sidebar-accent dark:to-sidebar-accent/80 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-info" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
            <div className="p-1.5 rounded-lg bg-info/10 border border-info/20">
              <Users className="h-4 w-4 text-info" strokeWidth={2.5} />
            </div>
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">
                Active recycling customers
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card to-card/80 shadow-card dark:border-white/10 dark:bg-sidebar-accent dark:from-sidebar-accent dark:to-sidebar-accent/80 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-success" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Material Collected</CardTitle>
            <div className="p-1.5 rounded-lg bg-success/10 border border-success/20">
              <Package className="h-4 w-4 text-success" strokeWidth={2.5} />
            </div>
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatNumber(totalMaterialCollected)} kg</div>
            <p className="text-xs text-muted-foreground mt-1">
                {completedCollections} completed collections
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card to-card/80 shadow-card dark:border-white/10 dark:bg-sidebar-accent dark:from-sidebar-accent dark:to-sidebar-accent/80 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-warning" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Collection Rate</CardTitle>
              <div className="p-1.5 rounded-lg bg-warning/10 border border-warning/20">
                <CheckCircle className="h-4 w-4 text-warning" strokeWidth={2.5} />
              </div>
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {totalCollections > 0 ? Math.round((completedCollections / totalCollections) * 100) : 0}%
              </div>
            <p className="text-xs text-muted-foreground mt-1">
                {completedCollections} / {totalCollections} collections
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Forecast & Sponsor Engagement */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <Card className="overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card to-card/80 shadow-card dark:border-white/10 dark:bg-sidebar-accent dark:from-sidebar-accent dark:to-sidebar-accent/80 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-accent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue Forecast</CardTitle>
            <div className="p-1.5 rounded-lg bg-accent/10 border border-accent/20">
              <LineChart className="h-4 w-4 text-accent" strokeWidth={2.5} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(dashboard.revenueForecast)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Next 90 days based on weighted pipeline and trends
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card to-card/80 shadow-card dark:border-white/10 dark:bg-sidebar-accent dark:from-sidebar-accent dark:to-sidebar-accent/80 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sponsor Engagement Score</CardTitle>
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Users className="h-4 w-4 text-primary" strokeWidth={2.5} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {dashboard.sponsorEngagementScore}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Composite score from sponsor touchpoints and activities
            </p>
          </CardContent>
        </Card>
      </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card to-card/80 shadow-card dark:border-white/10 dark:bg-sidebar-accent dark:from-sidebar-accent dark:to-sidebar-accent/80 relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-info" />
        <CardHeader className="pt-4">
              <CardTitle className="text-base font-semibold text-foreground">Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Revenue chart placeholder
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card to-card/80 shadow-card dark:border-white/10 dark:bg-sidebar-accent dark:from-sidebar-accent dark:to-sidebar-accent/80 relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-accent" />
            <CardHeader className="pt-4">
              <CardTitle className="text-base font-semibold text-foreground">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activities. Log calls, emails, and meetings to see them here.</p>
            ) : (
              activities.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{a.type} - {a.description?.slice(0, 50)}{(a.description?.length || 0) > 50 ? '...' : ''}</p>
                    <p className="text-xs text-muted-foreground">{a.outcome || 'No outcome'}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}</span>
                </div>
              ))
            )}
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
          <Card key={contact.id} className="overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card to-card/80 shadow-card hover:shadow-lg transition-all dark:border-white/10 dark:bg-sidebar-accent dark:from-sidebar-accent dark:to-sidebar-accent/80 relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary/60" />
            <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="border border-border/50">
                  <AvatarFallback className="bg-primary/10 text-primary">{contact.firstName[0]}{contact.lastName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground">{contact.firstName} {contact.lastName}</h3>
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
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  const KanbanContent = ({ deals }: { deals: EnhancedDeal[] }) => {
    const stages = crmService.getDealStages()
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Deal Pipeline</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Drag and drop deals to move them between stages
            </p>
          </div>
          <Button onClick={() => {
            setEditingDeal(null)
            setShowDealDialog(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            New Deal
          </Button>
        </div>
        <KanbanBoard
          deals={deals}
          stages={stages}
          onMoveDeal={handleMoveDeal}
          onEditDeal={(deal) => {
            setEditingDeal(deal as any)
            setShowDealDialog(true)
          }}
          onSelectDeal={(deal) => setSelectedDeal(deal as any)}
          onDeleteDeal={(dealId) => {
            if (confirm('Are you sure you want to delete this deal?')) {
              crmService.deleteDeal(dealId)
              setDeals(prev => prev.filter(d => d.id !== dealId))
            }
          }}
        />
      </div>
    )
  }

  const DealsContent = ({ deals }: { deals: EnhancedDeal[] }) => {
    const [viewMode, setViewMode] = useState<'table' | 'kanban' | 'list'>('table')
    const [filterStage, setFilterStage] = useState<string>('all')
    const [sortBy, setSortBy] = useState<'value' | 'date' | 'probability' | 'name'>('value')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedDeals, setSelectedDeals] = useState<Set<string>>(new Set())
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
    const [filterOwner, setFilterOwner] = useState<string>('all')
    const [filterSource, setFilterSource] = useState<string>('all')
    const [filterPriority, setFilterPriority] = useState<string>('all')
    const [filterValueRange, setFilterValueRange] = useState<'all' | 'high' | 'medium' | 'low'>('all')
    const [quickFilter, setQuickFilter] = useState<string>('all')

    const filteredDeals = useMemo(() => {
      let filtered = deals
      
      // Apply quick filters
      if (quickFilter !== 'all') {
        const now = new Date()
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        
        switch (quickFilter) {
          case 'my-deals':
            filtered = filtered.filter(d => d.assignedTo === 'current-user') // TODO: Get actual user
            break
          case 'overdue':
            filtered = filtered.filter(d => 
              d.expectedCloseDate && new Date(d.expectedCloseDate) < now && d.status === 'active'
            )
            break
          case 'this-month':
            filtered = filtered.filter(d => 
              d.expectedCloseDate && new Date(d.expectedCloseDate) >= thisMonth && new Date(d.expectedCloseDate) <= now
            )
            break
          case 'next-week':
            filtered = filtered.filter(d => 
              d.expectedCloseDate && new Date(d.expectedCloseDate) <= nextWeek && new Date(d.expectedCloseDate) >= now
            )
            break
          case 'high-value':
            const avgValue = deals.length > 0 ? deals.reduce((sum, d) => sum + d.value, 0) / deals.length : 0
            filtered = filtered.filter(d => d.value >= avgValue * 1.5)
            break
          case 'won-this-month':
            filtered = filtered.filter(d => 
              d.status === 'won' && d.wonDate && new Date(d.wonDate) >= thisMonth
            )
            break
          case 'lost-this-month':
            filtered = filtered.filter(d => 
              d.status === 'lost' && d.lostDate && new Date(d.lostDate) >= thisMonth
            )
            break
        }
      }
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter(d => 
          d.name.toLowerCase().includes(query) ||
          d.company?.name?.toLowerCase().includes(query) ||
          d.contact?.firstName?.toLowerCase().includes(query) ||
          d.contact?.lastName?.toLowerCase().includes(query) ||
          d.description?.toLowerCase().includes(query)
        )
      }
      
      // Apply stage filter
      if (filterStage !== 'all') {
        filtered = filtered.filter(d => d.stage === filterStage)
      }
      
      // Apply owner filter
      if (filterOwner !== 'all') {
        filtered = filtered.filter(d => d.assignedTo === filterOwner)
      }
      
      // Apply source filter
      if (filterSource !== 'all') {
        filtered = filtered.filter(d => d.source === filterSource)
      }
      
      // Apply priority filter
      if (filterPriority !== 'all') {
        filtered = filtered.filter(d => d.priority === filterPriority)
      }
      
      // Apply value range filter
      if (filterValueRange !== 'all') {
        const avgValue = deals.length > 0 ? deals.reduce((sum, d) => sum + d.value, 0) / deals.length : 0
        switch (filterValueRange) {
          case 'high':
            filtered = filtered.filter(d => d.value >= avgValue * 1.5)
            break
          case 'medium':
            filtered = filtered.filter(d => d.value >= avgValue * 0.5 && d.value < avgValue * 1.5)
            break
          case 'low':
            filtered = filtered.filter(d => d.value < avgValue * 0.5)
            break
        }
      }
      
      // Apply sorting
      return filtered.sort((a, b) => {
        if (sortBy === 'value') return b.value - a.value
        if (sortBy === 'date') return (b.expectedCloseDate?.getTime() || 0) - (a.expectedCloseDate?.getTime() || 0)
        if (sortBy === 'probability') return b.probability - a.probability
        if (sortBy === 'name') return a.name.localeCompare(b.name)
        return 0
      })
    }, [deals, filterStage, sortBy, searchQuery, quickFilter, filterOwner, filterSource, filterPriority, filterValueRange])

    const totalValue = filteredDeals.reduce((sum, d) => sum + d.value, 0)
    const weightedValue = filteredDeals.reduce((sum, d) => sum + (d.value * d.probability / 100), 0)
    const activeDeals = filteredDeals.filter(d => d.status === 'active').length
    const wonDeals = filteredDeals.filter(d => d.status === 'won').length
    const avgDealSize = filteredDeals.length > 0 ? totalValue / filteredDeals.length : 0
    const avgProbability = filteredDeals.length > 0 
      ? Math.round(filteredDeals.reduce((sum, d) => sum + d.probability, 0) / filteredDeals.length)
      : 0

    const handleBulkDelete = () => {
      if (selectedDeals.size === 0) return
      if (confirm(`Are you sure you want to delete ${selectedDeals.size} deal(s)?`)) {
        selectedDeals.forEach(dealId => {
          crmService.deleteDeal(dealId)
          setDeals(prev => prev.filter(d => d.id !== dealId))
        })
        setSelectedDeals(new Set())
      }
    }

    const toggleDealSelection = (dealId: string) => {
      setSelectedDeals(prev => {
        const newSet = new Set(prev)
        if (newSet.has(dealId)) {
          newSet.delete(dealId)
        } else {
          newSet.add(dealId)
        }
        return newSet
      })
    }

    const selectAll = () => {
      if (selectedDeals.size === filteredDeals.length) {
        setSelectedDeals(new Set())
      } else {
        setSelectedDeals(new Set(filteredDeals.map(d => d.id)))
      }
    }

    const handleBulkStageChange = (newStage: DealStage) => {
      if (selectedDeals.size === 0) return
      selectedDeals.forEach(dealId => {
        const updated = crmService.moveDealToStage(dealId, newStage)
        if (updated) {
          setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: newStage as SalesStage, status: updated.status as any } : d))
        }
      })
      setSelectedDeals(new Set())
    }

    const handleExport = async () => {
      const exportData = filteredDeals.map(deal => ({
        Name: deal.name,
        Company: deal.company?.name || '',
        Stage: deal.stage,
        Value: deal.value,
        Currency: deal.currency,
        Probability: deal.probability,
        'Expected Close': deal.expectedCloseDate?.toLocaleDateString() || '',
        Owner: deal.assignedTo || '',
        Source: deal.source,
        Priority: deal.priority,
        Status: deal.status,
        'Created Date': deal.createdAt.toLocaleDateString()
      }))

      const csv = [
        Object.keys(exportData[0] || {}).join(','),
        ...exportData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
      ].join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `deals-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    const handleDuplicateDeal = (deal: EnhancedDeal) => {
      const newDeal = crmService.createDeal({
        name: `${deal.name} (Copy)`,
        description: deal.description,
        value: deal.value,
        currency: deal.currency,
        stage: 'lead' as DealStage,
        probability: 10,
        expectedCloseDate: undefined,
        contactId: deal.contactId,
        companyId: deal.companyId,
        ownerId: deal.ownerId,
        source: deal.source,
        priority: deal.priority,
        notes: deal.notes,
        tags: deal.tags,
        status: 'active',
        activities: [],
        attachments: [],
        customFields: {},
        emailThreads: []
      })
      if (newDeal) {
        setDeals(prev => [...prev, {
          ...newDeal,
          leadScore: 'warm' as LeadScore,
          competitor: '',
          assignedTo: deal.assignedTo || 'Unassigned',
          lastActivity: new Date().toISOString(),
          communicationPreference: 'email' as CommunicationChannel
        } as EnhancedDeal])
      }
    }

    // Calculate additional metrics
    const wonThisMonth = deals.filter(d => {
      if (d.status !== 'won' || !d.wonDate) return false
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      return new Date(d.wonDate) >= thisMonth
    }).length

    const lostThisMonth = deals.filter(d => {
      if (d.status !== 'lost' || !d.lostDate) return false
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      return new Date(d.lostDate) >= thisMonth
    }).length

    const winRate = deals.filter(d => d.status === 'won' || d.status === 'lost').length > 0
      ? (wonDeals / (wonDeals + lostThisMonth)) * 100
      : 0

    const overdueDeals = deals.filter(d => 
      d.expectedCloseDate && new Date(d.expectedCloseDate) < new Date() && d.status === 'active'
    ).length

    const uniqueOwners = Array.from(new Set(deals.map(d => d.assignedTo).filter(Boolean)))
    const uniqueSources = Array.from(new Set(deals.map(d => d.source).filter(Boolean)))

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Deals ({deals.length})</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Total Value: {formatCurrency(totalValue)} • Weighted: {formatCurrency(weightedValue)}
              {searchQuery && ` • ${filteredDeals.length} found`}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search deals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <Select value={filterStage} onValueChange={setFilterStage}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
                <SelectItem value="closed-won">Closed Won</SelectItem>
                <SelectItem value="closed-lost">Closed Lost</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="value">Value</SelectItem>
                <SelectItem value="date">Close Date</SelectItem>
                <SelectItem value="probability">Probability</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-r-none"
                onClick={() => setViewMode('table')}
              >
                <Table className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none border-x"
                onClick={() => setViewMode('kanban')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-l-none"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            {selectedDeals.size > 0 && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <MoreHorizontal className="h-4 w-4 mr-2" />
                      Bulk Actions ({selectedDeals.size})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => {
                      const stage = prompt('Enter stage (lead, qualified, proposal, negotiation, closed-won, closed-lost):')
                      if (stage && ['lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'].includes(stage)) {
                        handleBulkStageChange(stage as DealStage)
                      }
                    }}>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Change Stage
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleBulkDelete}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExport}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Selected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            <Button onClick={() => {
              setEditingDeal(null)
              setShowDealDialog(true)
            }}>
              <Plus className="h-4 w-4 mr-2" />
              New Deal
            </Button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={quickFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setQuickFilter('all')}
          >
            All Deals
          </Button>
          <Button
            variant={quickFilter === 'my-deals' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setQuickFilter('my-deals')}
          >
            My Deals
          </Button>
          <Button
            variant={quickFilter === 'overdue' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setQuickFilter('overdue')}
          >
            Overdue ({overdueDeals})
          </Button>
          <Button
            variant={quickFilter === 'this-month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setQuickFilter('this-month')}
          >
            Closing This Month
          </Button>
          <Button
            variant={quickFilter === 'next-week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setQuickFilter('next-week')}
          >
            Closing Next Week
          </Button>
          <Button
            variant={quickFilter === 'high-value' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setQuickFilter('high-value')}
          >
            High Value
          </Button>
          <Button
            variant={quickFilter === 'won-this-month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setQuickFilter('won-this-month')}
          >
            Won This Month ({wonThisMonth})
          </Button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <Card>
            <CardHeader>
              <CardTitle>Advanced Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Owner</Label>
                  <Select value={filterOwner} onValueChange={setFilterOwner}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Owners" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Owners</SelectItem>
                      {uniqueOwners.map((owner) => (
                        <SelectItem key={owner} value={owner}>
                          {owner}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Source</Label>
                  <Select value={filterSource} onValueChange={setFilterSource}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Sources" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      {uniqueSources.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Value Range</Label>
                  <Select value={filterValueRange} onValueChange={(v) => setFilterValueRange(v as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Values" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Values</SelectItem>
                      <SelectItem value="high">High Value</SelectItem>
                      <SelectItem value="medium">Medium Value</SelectItem>
                      <SelectItem value="low">Low Value</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => {
                  setFilterOwner('all')
                  setFilterSource('all')
                  setFilterPriority('all')
                  setFilterValueRange('all')
                  setShowAdvancedFilters(false)
                }}>
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Deal Statistics - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card to-card/80 shadow-card dark:border-white/10 dark:bg-sidebar-accent dark:from-sidebar-accent dark:to-sidebar-accent/80 relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatCurrency(totalValue)}</div>
              <p className="text-xs text-muted-foreground mt-1">{activeDeals} active deals</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card to-card/80 shadow-card dark:border-white/10 dark:bg-sidebar-accent dark:from-sidebar-accent dark:to-sidebar-accent/80 relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-info" />
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Weighted Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatCurrency(weightedValue)}</div>
              <p className="text-xs text-muted-foreground mt-1">Probability-adjusted</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card to-card/80 shadow-card dark:border-white/10 dark:bg-sidebar-accent dark:from-sidebar-accent dark:to-sidebar-accent/80 relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-warning" />
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Deal Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(avgDealSize)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Per deal</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card to-card/80 shadow-card dark:border-white/10 dark:bg-sidebar-accent dark:from-sidebar-accent dark:to-sidebar-accent/80 relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-success" />
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Probability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {avgProbability}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Win likelihood</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{winRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {wonThisMonth} won, {lostThisMonth} lost this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overdue Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{overdueDeals}</div>
              <p className="text-xs text-muted-foreground mt-1">Past expected close date</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Won This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground text-green-600">{wonThisMonth}</div>
              <p className="text-xs text-muted-foreground mt-1">Successful closures</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{activeDeals}</div>
              <p className="text-xs text-muted-foreground mt-1">Deals in progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Deals View - Table/Kanban/List */}
        {viewMode === 'kanban' ? (
          <KanbanContent deals={filteredDeals} />
        ) : viewMode === 'list' ? (
          <Card>
            <CardHeader>
              <CardTitle>Deals List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredDeals.map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-4 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedDeals.has(deal.id)}
                        onChange={() => toggleDealSelection(deal.id)}
                        className="rounded border-gray-300"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{deal.name}</h4>
                          <Badge className={getStageColor(deal.stage as SalesStage)}>{deal.stage}</Badge>
                          <Badge variant="outline">{formatCurrency(deal.value)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {deal.company?.name || 'No company'} • {deal.probability}% probability
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => {
                        setEditingDeal(deal)
                        setShowDealDialog(true)
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card to-card/80 shadow-card dark:border-white/10 dark:bg-sidebar-accent dark:from-sidebar-accent dark:to-sidebar-accent/80 relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-foreground w-12">
                      <input
                        type="checkbox"
                        checked={selectedDeals.size === filteredDeals.length && filteredDeals.length > 0}
                        onChange={selectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Deal Name</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Company</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Stage</th>
                    <th className="text-right p-4 text-sm font-semibold text-foreground">Value</th>
                    <th className="text-center p-4 text-sm font-semibold text-foreground">Probability</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Expected Close</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Owner</th>
                    <th className="text-right p-4 text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeals.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Briefcase className="h-16 w-16 text-muted-foreground/50 mb-4" />
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            {searchQuery || filterStage !== 'all' ? 'No deals found' : 'No deals yet'}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4 max-w-md">
                            {searchQuery || filterStage !== 'all' 
                              ? 'Try adjusting your search or filters to find deals.'
                              : 'Get started by creating your first deal. Track your sales pipeline and manage opportunities effectively.'}
                          </p>
                          {!searchQuery && filterStage === 'all' && (
                            <Button onClick={() => {
                              setEditingDeal(null)
                              setShowDealDialog(true)
                            }}>
                              <Plus className="h-4 w-4 mr-2" />
                              Create Your First Deal
                            </Button>
                          )}
                          {(searchQuery || filterStage !== 'all') && (
                            <Button variant="outline" onClick={() => {
                              setSearchQuery('')
                              setFilterStage('all')
                            }}>
                              Clear Filters
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredDeals.map((deal) => (
                    <tr key={deal.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${selectedDeals.has(deal.id) ? 'bg-muted/50' : ''}`}>
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedDeals.has(deal.id)}
                          onChange={() => toggleDealSelection(deal.id)}
                          className="rounded border-gray-300"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{deal.name}</p>
                            {(() => {
                              const daysSinceCreated = Math.floor((Date.now() - deal.createdAt.getTime()) / (1000 * 60 * 60 * 24))
                              const daysToClose = deal.expectedCloseDate 
                                ? Math.floor((new Date(deal.expectedCloseDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                                : null
                              const isOverdue = daysToClose !== null && daysToClose < 0
                              const isUrgent = daysToClose !== null && daysToClose <= 7 && daysToClose >= 0
                              
                              if (isOverdue) {
                                return <Badge variant="destructive" className="text-xs">Overdue</Badge>
                              } else if (isUrgent) {
                                return <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800">Urgent</Badge>
                              } else if (deal.priority === 'urgent') {
                                return <Badge variant="outline" className="text-xs bg-red-100 text-red-800">High Priority</Badge>
                              }
                              return null
                            })()}
                          </div>
                          {deal.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{deal.description}</p>
                          )}
                          {deal.competitor && (
                            <p className="text-xs text-muted-foreground mt-1">vs. {deal.competitor}</p>
                          )}
                          {deal.tags && deal.tags.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {deal.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {deal.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{deal.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{deal.company?.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Badge className={getStageColor(deal.stage as SalesStage)}>
                            {deal.stage}
                          </Badge>
                          {deal.priority === 'urgent' && (
                            <Badge variant="outline" className="text-xs bg-red-100 text-red-800">
                              Urgent
                            </Badge>
                          )}
                          {deal.priority === 'high' && (
                            <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800">
                              High
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-semibold text-foreground">{formatCurrency(deal.value)}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all"
                              style={{ width: `${deal.probability}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-foreground w-10">{deal.probability}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <span className="text-sm text-foreground">
                              {deal.expectedCloseDate?.toLocaleDateString() || 'Not set'}
                            </span>
                            {deal.expectedCloseDate && (() => {
                              const daysToClose = Math.floor((new Date(deal.expectedCloseDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                              if (daysToClose < 0) {
                                return <p className="text-xs text-red-600">Overdue by {Math.abs(daysToClose)} days</p>
                              } else if (daysToClose <= 7) {
                                return <p className="text-xs text-orange-600">{daysToClose} days left</p>
                              } else {
                                return <p className="text-xs text-muted-foreground">{daysToClose} days left</p>
                              }
                            })()}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {deal.assignedTo?.split(' ').map(n => n[0]).join('') || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-foreground">{deal.assignedTo || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDeal(deal)
                              setEditingDeal(deal)
                              setShowDealDialog(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDeal(deal)
                              setEditingDeal(deal)
                              setShowDealDialog(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDuplicateDeal(deal)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate Deal
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                const newStage = prompt('Enter new stage (lead, qualified, proposal, negotiation, closed-won, closed-lost):')
                                if (newStage && ['lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'].includes(newStage)) {
                                  handleBulkStageChange(newStage as DealStage)
                                }
                              }}>
                                <ArrowRight className="h-4 w-4 mr-2" />
                                Change Stage
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <LinkIcon className="h-4 w-4 mr-2" />
                                Link to Campaign
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                Link to Invoice
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this deal?')) {
                                    crmService.deleteDeal(deal.id)
                                    setDeals(prev => prev.filter(d => d.id !== deal.id))
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Pipeline Visualization & Stage Conversion Funnel */}
        {filteredDeals.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="overflow-hidden rounded-2xl border border-border/70">
              <CardHeader>
                <CardTitle>Pipeline by Stage</CardTitle>
                <CardDescription>Deal distribution across pipeline stages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {crmService.getDealStages().filter(stage => stage.isActive).map((stage) => {
                    const stageDeals = filteredDeals.filter(d => d.stage === stage.id)
                    const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0)
                    const stageWeighted = stageDeals.reduce((sum, d) => sum + (d.value * d.probability / 100), 0)
                    const percentage = totalValue > 0 ? (stageValue / totalValue) * 100 : 0
                    
                    return (
                      <div key={stage.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: stage.color }}
                            />
                            <span className="font-medium">{stage.name}</span>
                            <Badge variant="secondary">{stageDeals.length}</Badge>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold">{formatCurrency(stageValue)}</span>
                            <span className="text-muted-foreground ml-2">
                              ({formatCurrency(stageWeighted)} weighted)
                            </span>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: stage.color
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-2xl border border-border/70">
              <CardHeader>
                <CardTitle>Stage Conversion Funnel</CardTitle>
                <CardDescription>Deal flow through pipeline stages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {crmService.getDealStages()
                    .filter(stage => stage.isActive && !stage.isWon && !stage.isLost)
                    .map((stage, index, array) => {
                      const stageDeals = filteredDeals.filter(d => d.stage === stage.id)
                      const nextStage = array[index + 1]
                      const nextStageDeals = nextStage ? filteredDeals.filter(d => d.stage === nextStage.id) : []
                      const conversionRate = stageDeals.length > 0 
                        ? ((nextStageDeals.length / stageDeals.length) * 100).toFixed(1)
                        : '0'
                      
                      return (
                        <div key={stage.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: stage.color }}
                              />
                              <span className="text-sm font-medium">{stage.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-muted-foreground">
                                {stageDeals.length} deals
                              </span>
                              {nextStage && (
                                <div className="flex items-center gap-1">
                                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {conversionRate}% →
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          {index < array.length - 1 && (
                            <div className="ml-4 border-l-2 border-dashed border-muted-foreground/30 h-4" />
                          )}
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    )
  }

  const ForecastingContent = ({ dashboard }: { dashboard: CRMDashboard | null }) => {
    const [scenario, setScenario] = useState<'best' | 'expected' | 'worst'>('expected')
    const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year'>('quarter')
    const [showExportDialog, setShowExportDialog] = useState(false)

    // Calculate forecasts based on pipeline
    const calculateForecast = (scenarioType: 'best' | 'expected' | 'worst', period: 'month' | 'quarter' | 'year') => {
      const activeDeals = deals.filter(d => !d.stage.includes('closed'))
      const daysInPeriod = period === 'month' ? 30 : period === 'quarter' ? 90 : 365
      
      let forecastValue = 0
      activeDeals.forEach(deal => {
        const daysToClose = deal.expectedCloseDate 
          ? Math.max(0, Math.ceil((deal.expectedCloseDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
          : 45
        
        if (daysToClose <= daysInPeriod) {
          let probability = deal.probability
          if (scenarioType === 'best') probability = Math.min(100, probability + 20)
          if (scenarioType === 'worst') probability = Math.max(0, probability - 20)
          
          forecastValue += deal.value * (probability / 100)
        }
      })
      
      // Add historical trend
      const historicalMultiplier = scenarioType === 'best' ? 1.15 : scenarioType === 'worst' ? 0.85 : 1.0
      return forecastValue * historicalMultiplier
    }

    const bestCase = calculateForecast('best', timeframe)
    const expectedCase = calculateForecast('expected', timeframe)
    const worstCase = calculateForecast('worst', timeframe)

    const handleExport = () => {
      const data = {
        timeframe,
        scenario,
        forecasts: {
          best: bestCase,
          expected: expectedCase,
          worst: worstCase
        },
        generated: new Date().toISOString()
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `forecast-${timeframe}-${scenario}-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
      setShowExportDialog(false)
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Revenue Forecasting</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Predict revenue based on pipeline, historical sales, and seasonal trends
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeframe} onValueChange={(v) => setTimeframe(v as any)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="quarter">Quarterly</SelectItem>
                <SelectItem value="year">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setShowExportDialog(true)}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Scenario Planning */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className={`cursor-pointer transition-all ${scenario === 'best' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setScenario('best')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-foreground">Best Case</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatCurrency(bestCase)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Optimistic scenario (+20% probability)
              </p>
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Assumes: Higher win rates, faster closes, new deals
                </p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${scenario === 'expected' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setScenario('expected')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-foreground">Expected Case</CardTitle>
                <Target className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatCurrency(expectedCase)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Most likely scenario (current probabilities)
              </p>
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Based on: Current pipeline, historical trends
                </p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${scenario === 'worst' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setScenario('worst')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-foreground">Worst Case</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatCurrency(worstCase)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Conservative scenario (-20% probability)
              </p>
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Assumes: Lower win rates, delays, lost deals
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Forecast Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Forecast Breakdown - {scenario.charAt(0).toUpperCase() + scenario.slice(1)} Case</CardTitle>
            <CardDescription>
              Revenue prediction for {timeframe === 'month' ? 'this month' : timeframe === 'quarter' ? 'this quarter' : 'this year'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pipeline Value</p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatCurrency(deals.filter(d => !d.stage.includes('closed')).reduce((sum, d) => sum + d.value, 0))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Weighted Forecast</p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatCurrency(
                      deals.filter(d => !d.stage.includes('closed')).reduce((sum, d) => {
                        let prob = d.probability
                        if (scenario === 'best') prob = Math.min(100, prob + 20)
                        if (scenario === 'worst') prob = Math.max(0, prob - 20)
                        return sum + (d.value * prob / 100)
                      }, 0)
                    )}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium text-foreground mb-2">Deals Contributing to Forecast</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {deals
                    .filter(d => !d.stage.includes('closed'))
                    .map(deal => {
                      let prob = deal.probability
                      if (scenario === 'best') prob = Math.min(100, prob + 20)
                      if (scenario === 'worst') prob = Math.max(0, prob - 20)
                      const contribution = deal.value * (prob / 100)
                      return (
                        <div key={deal.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                          <span className="text-foreground">{deal.name}</span>
                          <span className="font-semibold text-foreground">{formatCurrency(contribution)}</span>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Forecast</DialogTitle>
              <DialogDescription>
                Export forecast data for funder packs or compliance reporting
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Format</Label>
                <Select defaultValue="json">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="pdf">PDF Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Include</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked id="include-scenarios" />
                    <Label htmlFor="include-scenarios" className="font-normal">All scenarios</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked id="include-deals" />
                    <Label htmlFor="include-deals" className="font-normal">Deal breakdown</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="include-historical" />
                    <Label htmlFor="include-historical" className="font-normal">Historical data</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

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

  const ActivitiesContent = ({ activities }: { activities: EnhancedActivity[] }) => {
    const [activityType, setActivityType] = useState<ActivityType | 'all'>('all')
    const [showActivityDialog, setShowActivityDialog] = useState(false)

    const displayActivities = activities
    const filteredActivities = activityType === 'all' 
      ? displayActivities 
      : displayActivities.filter(a => a.type === activityType)

    const getActivityIcon = (type: ActivityType) => {
      switch (type) {
        case 'call': return Phone
        case 'email': return Mail
        case 'meeting': return Video
        case 'demo': return PlayCircle
        case 'proposal': return FileText
        case 'follow-up': return Clock
        default: return ActivityLucideIcon
      }
    }

    const getActivityColor = (type: ActivityType) => {
      switch (type) {
        case 'call': return 'bg-blue-500'
        case 'email': return 'bg-green-500'
        case 'meeting': return 'bg-purple-500'
        case 'demo': return 'bg-orange-500'
        case 'proposal': return 'bg-yellow-500'
        case 'follow-up': return 'bg-gray-500'
        default: return 'bg-primary'
      }
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Activities ({filteredActivities.length})</h2>
            <p className="text-sm text-muted-foreground mt-1">Log all interactions with contacts and companies</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={activityType} onValueChange={(v) => setActivityType(v as any)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="call">Calls</SelectItem>
                <SelectItem value="email">Emails</SelectItem>
                <SelectItem value="meeting">Meetings</SelectItem>
                <SelectItem value="demo">Demos</SelectItem>
                <SelectItem value="proposal">Proposals</SelectItem>
                <SelectItem value="follow-up">Follow-ups</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setShowActivityDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Log Activity
            </Button>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="space-y-4">
          {filteredActivities.length === 0 ? (
            <Card className="p-8 text-center">
              <ActivityLucideIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2 text-foreground">No activities yet</h3>
              <p className="text-muted-foreground mb-4">Start by logging your first activity</p>
              <Button onClick={() => setShowActivityDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Log Activity
              </Button>
            </Card>
          ) : (
            filteredActivities.map((activity) => {
              const Icon = getActivityIcon(activity.type)
              const color = getActivityColor(activity.type)
              
              return (
                <Card key={activity.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`${color} p-2 rounded-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground capitalize">{activity.type}</h4>
                          <p className="text-sm text-foreground mt-1">{activity.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                          {activity.createdAt.toLocaleDateString()} {activity.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {activity.duration > 0 && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{activity.duration} minutes</span>
                          </div>
                        )}
                        {activity.location && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{activity.location}</span>
                          </div>
                        )}
                        {activity.participants.length > 0 && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{activity.participants.join(', ')}</span>
                          </div>
                        )}
                        {activity.channel && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="capitalize">{activity.channel}</span>
                          </div>
                        )}
                      </div>

                      {activity.outcome && (
                        <div className="p-2 bg-muted/50 rounded text-sm">
                          <span className="font-medium text-foreground">Outcome: </span>
                          <span className="text-foreground">{activity.outcome}</span>
                        </div>
                      )}

                      {activity.nextAction && (
                        <div className="flex items-center gap-2 p-2 bg-primary/5 border border-primary/20 rounded text-sm">
                          <Target className="h-4 w-4 text-primary" />
                          <span className="text-foreground">
                            <span className="font-medium">Next Action: </span>
                            {activity.nextAction}
                          </span>
                        </div>
                      )}

                      {activity.attachments.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span>{activity.attachments.length} attachment(s)</span>
                        </div>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Link to Deal
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>
    )
  }

  const EmailContent = () => {
    const [emailConnected, setEmailConnected] = useState(false)
    const [selectedThread, setSelectedThread] = useState<string | null>(null)

    const emailThreads = [
      {
        id: '1',
        subject: 'Enterprise Software License Proposal',
        contact: 'John Smith',
        company: 'TechCorp Inc.',
        deal: 'Enterprise Software License',
        lastMessage: 'Thank you for the proposal. We will review and get back to you.',
        timestamp: new Date('2024-01-15'),
        unread: 2,
        status: 'active'
      },
      {
        id: '2',
        subject: 'Follow-up: Marketing Campaign Discussion',
        contact: 'Emily Davis',
        company: 'StartupXYZ',
        deal: 'Marketing Campaign',
        lastMessage: 'Looking forward to our call next week.',
        timestamp: new Date('2024-01-14'),
        unread: 0,
        status: 'active'
      }
    ]

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Email Integration</h2>
            <p className="text-sm text-muted-foreground mt-1">Integrated inbox for sponsor/client communication</p>
          </div>
          <Button onClick={() => setEmailConnected(!emailConnected)}>
            {emailConnected ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Connected
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Connect Email
              </>
            )}
          </Button>
        </div>

        {!emailConnected ? (
          <Card className="p-8 text-center">
            <MailIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2 text-foreground">Email Integration</h3>
            <p className="text-muted-foreground mb-4">Connect your email to sync conversations and track communications</p>
            <Button onClick={() => setEmailConnected(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Configure Email
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Email Threads List */}
            <Card className="lg:col-span-1">
              <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-foreground">Email Threads</CardTitle>
                  <Badge variant="secondary">{emailThreads.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-1">
                    {emailThreads.map((thread) => (
                      <div
                        key={thread.id}
                        className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border ${
                          selectedThread === thread.id ? 'bg-muted' : ''
                        }`}
                        onClick={() => setSelectedThread(thread.id)}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-medium text-sm text-foreground line-clamp-1">{thread.subject}</h4>
                          {thread.unread > 0 && (
                            <Badge className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                              {thread.unread}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{thread.contact} • {thread.company}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{thread.lastMessage}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {thread.timestamp.toLocaleDateString()}
                        </p>
                        {thread.deal && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            <LinkIcon className="h-3 w-3 mr-1" />
                            {thread.deal}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Email Thread View */}
            <Card className="lg:col-span-2">
              <CardHeader className="border-b border-border">
                {selectedThread ? (
                  <div>
                    <CardTitle className="text-foreground">
                      {emailThreads.find(t => t.id === selectedThread)?.subject}
                    </CardTitle>
                    <CardDescription>
                      {emailThreads.find(t => t.id === selectedThread)?.contact} • {emailThreads.find(t => t.id === selectedThread)?.company}
                    </CardDescription>
                  </div>
                ) : (
                  <CardTitle className="text-foreground">Select an email thread</CardTitle>
                )}
              </CardHeader>
              <CardContent className="p-6">
                {selectedThread ? (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 border border-border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {i % 2 === 0 ? 'JS' : 'SJ'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {i % 2 === 0 ? 'John Smith' : 'Sarah Johnson'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(Date.now() - i * 86400000).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-foreground">
                            {i === 1 
                              ? 'Thank you for the proposal. We will review and get back to you by end of week.'
                              : i === 2
                              ? 'Here is the proposal for the Enterprise Software License as discussed.'
                              : 'Great speaking with you today. I will send over the proposal shortly.'}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-border">
                      <Textarea 
                        placeholder="Reply to this email thread..."
                        className="min-h-[100px] mb-2"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            Attach
                          </Button>
                          <Button variant="outline" size="sm">
                            <LinkIcon className="h-4 w-4 mr-2" />
                            Link to Deal
                          </Button>
                        </div>
                        <Button>
                          <Send className="h-4 w-4 mr-2" />
                          Send Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <MailIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select an email thread to view messages</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    )
  }

  const CallsContent = () => {
    const [calls, setCalls] = useState([
      {
        id: '1',
        contact: 'John Smith',
        company: 'TechCorp Inc.',
        phone: '+1-555-0123',
        type: 'outbound',
        duration: 30,
        timestamp: new Date('2024-01-15T14:30:00'),
        outcome: 'Positive response, proposal requested',
        recording: true,
        notes: 'Discussed enterprise license options. Very interested in premium features.',
        deal: 'Enterprise Software License'
      },
      {
        id: '2',
        contact: 'Emily Davis',
        company: 'StartupXYZ',
        phone: '+1-555-0124',
        type: 'inbound',
        duration: 15,
        timestamp: new Date('2024-01-14T10:15:00'),
        outcome: 'Follow-up scheduled',
        recording: false,
        notes: 'Called to discuss pricing. Budget-conscious but interested.',
        deal: 'Marketing Campaign'
      }
    ])

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Call Management</h2>
            <p className="text-sm text-muted-foreground mt-1">Call logs with notes and follow-ups</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
            <Button>
              <Phone className="h-4 w-4 mr-2" />
              Make Call
            </Button>
          </div>
        </div>

        {/* Call Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="stats-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Calls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{calls.length}</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>
          <Card className="stats-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {calls.reduce((sum, c) => sum + c.duration, 0)} min
              </div>
              <p className="text-xs text-muted-foreground mt-1">Call time</p>
            </CardContent>
          </Card>
          <Card className="stats-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Outbound</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {calls.filter(c => c.type === 'outbound').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Made</p>
            </CardContent>
          </Card>
          <Card className="stats-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Inbound</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {calls.filter(c => c.type === 'inbound').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Received</p>
            </CardContent>
          </Card>
        </div>

        {/* Call Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Call Logs</CardTitle>
            <CardDescription>All call interactions with contacts and companies</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {calls.map((call) => (
                <div key={call.id} className="p-4 border-b border-border hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-2 rounded-lg ${call.type === 'outbound' ? 'bg-blue-500' : 'bg-green-500'}`}>
                        <Phone className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-foreground">{call.contact}</h4>
                            <p className="text-sm text-muted-foreground">{call.company}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">
                              {call.timestamp.toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {call.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            <span>{call.phone}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{call.duration} minutes</span>
                          </div>
                          {call.recording && (
                            <Badge variant="outline" className="text-xs">
                              <Mic className="h-3 w-3 mr-1" />
                              Recorded
                            </Badge>
                          )}
                        </div>
                        {call.outcome && (
                          <div className="p-2 bg-muted/50 rounded text-sm">
                            <span className="font-medium text-foreground">Outcome: </span>
                            <span className="text-foreground">{call.outcome}</span>
                          </div>
                        )}
                        {call.notes && (
                          <p className="text-sm text-foreground">{call.notes}</p>
                        )}
                        {call.deal && (
                          <Badge variant="outline" className="text-xs">
                            <LinkIcon className="h-3 w-3 mr-1" />
                            {call.deal}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {call.recording && (
                        <Button variant="ghost" size="sm">
                          <PlayCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Notes
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <LinkIcon className="h-4 w-4 mr-2" />
                            Link to Deal
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const MeetingsContent = () => {
    const [meetings, setMeetings] = useState([
      {
        id: '1',
        title: 'Product Demo - TechCorp',
        contact: 'John Smith',
        company: 'TechCorp Inc.',
        date: new Date('2024-01-22T14:00:00'),
        duration: 60,
        type: 'video',
        location: 'Zoom',
        status: 'scheduled',
        participants: ['John Smith', 'Sarah Johnson', 'Tech Team'],
        agenda: 'Product demonstration and Q&A session',
        deal: 'Enterprise Software License'
      },
      {
        id: '2',
        title: 'Follow-up Call - StartupXYZ',
        contact: 'Emily Davis',
        company: 'StartupXYZ',
        date: new Date('2024-01-20T10:00:00'),
        duration: 30,
        type: 'phone',
        location: 'Phone',
        status: 'scheduled',
        participants: ['Emily Davis', 'Sarah Johnson'],
        agenda: 'Discuss pricing and implementation timeline',
        deal: 'Marketing Campaign'
      }
    ])

    const upcomingMeetings = meetings.filter(m => m.date > new Date())
    const pastMeetings = meetings.filter(m => m.date <= new Date())

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Meeting Management</h2>
            <p className="text-sm text-muted-foreground mt-1">Calendar integration for co-op reviews, sponsor check-ins</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
            <Button>
              <CalendarIcon className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
          </div>
        </div>

        {/* Meeting Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="stats-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{upcomingMeetings.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Scheduled meetings</p>
            </CardContent>
          </Card>
          <Card className="stats-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {upcomingMeetings.filter(m => {
                  const weekFromNow = new Date()
                  weekFromNow.setDate(weekFromNow.getDate() + 7)
                  return m.date <= weekFromNow
                }).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Next 7 days</p>
            </CardContent>
          </Card>
          <Card className="stats-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {Math.round(meetings.reduce((sum, m) => sum + m.duration, 0) / 60)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Meeting time</p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Meetings */}
        {upcomingMeetings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Upcoming Meetings</CardTitle>
              <CardDescription>Scheduled meetings and appointments</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="p-4 border-b border-border hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-2 rounded-lg ${meeting.type === 'video' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                          <Video className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-foreground">{meeting.title}</h4>
                              <p className="text-sm text-muted-foreground">{meeting.contact} • {meeting.company}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-foreground">
                                {meeting.date.toLocaleDateString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {meeting.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{meeting.duration} minutes</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{meeting.location}</span>
                            </div>
                            <Badge variant={meeting.status === 'scheduled' ? 'default' : 'secondary'}>
                              {meeting.status}
                            </Badge>
                          </div>
                          {meeting.agenda && (
                            <p className="text-sm text-foreground">{meeting.agenda}</p>
                          )}
                          {meeting.participants.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {meeting.participants.join(', ')}
                              </span>
                            </div>
                          )}
                          {meeting.deal && (
                            <Badge variant="outline" className="text-xs">
                              <LinkIcon className="h-3 w-3 mr-1" />
                              {meeting.deal}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {meeting.type === 'video' && (
                          <Button variant="outline" size="sm">
                            <Video className="h-4 w-4 mr-2" />
                            Join
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <LinkIcon className="h-4 w-4 mr-2" />
                              Link to Deal
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Cancel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Past Meetings */}
        {pastMeetings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Past Meetings</CardTitle>
              <CardDescription>Completed meetings and appointments</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {pastMeetings.map((meeting) => (
                  <div key={meeting.id} className="p-4 border-b border-border hover:bg-muted/30 transition-colors opacity-75">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-2 rounded-lg bg-gray-500">
                          <Video className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{meeting.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {meeting.contact} • {meeting.date.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

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

  const IntegrationsContent = () => {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-muted-foreground mt-1">
            Connect your CRM with external services and tools
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Email</CardTitle>
              <CardDescription>Connect your email account</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Configure</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>Sync with Google Calendar or Outlook</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Configure</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>LinkedIn</CardTitle>
              <CardDescription>Import contacts from LinkedIn</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Configure</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Phone</CardTitle>
              <CardDescription>Connect phone system for call logging</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Configure</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp</CardTitle>
              <CardDescription>Connect WhatsApp Business</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Configure</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Zapier</CardTitle>
              <CardDescription>Connect with Zapier for automation</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Configure</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading CRM data...</p>
        </div>
      </div>
    )
  }

  // Map activeSection to Zoho module
  const getZohoModule = () => {
    const mapping: Record<string, string> = {
      'dashboard': 'dashboard',
      'leads': 'leads',
      'contacts': 'contacts',
      'companies': 'accounts',
      'deals': 'deals',
      'customers': 'customers',
      'partners': 'partners',
      'collections': 'collections',
      'materials': 'materials',
      'routes': 'routes',
      'invoicing': 'invoices',
      'recycling-analytics': 'analytics',
      'analytics': 'analytics',
      'reports': 'reports',
    }
    return mapping[activeSection] || 'dashboard'
  }

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Zoho-Style Sidebar */}
      <aside
        className={`${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col`}
      >
        <div className="flex-1 overflow-y-auto max-h-screen scrollbar-thin scrollbar-thumb-muted-foreground scrollbar-track-muted" style={{
          maxHeight: '100vh', 
          overflowY: 'auto', 
          scrollbarWidth: 'thin',
          scrollbarColor: 'hsl(var(--muted-foreground)) hsl(var(--muted))'
        }}>
          {/* Zoho-Style Logo Area */}
        <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">Z</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">CRM</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-8 w-8 p-0 text-gray-600 dark:text-gray-300"
          >
            {sidebarCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="flex-1 p-4 space-y-2">
          {/* Dashboard */}
          <div className="space-y-1">
            <button
              onClick={() => handleSectionClick('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative group ${
                activeSection === 'dashboard'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title={sidebarCollapsed ? 'Dashboard' : undefined}
            >
              <BarChart3 className={`h-5 w-5 flex-shrink-0 ${
                activeSection === 'dashboard' ? 'text-blue-600 dark:text-blue-400' : ''
              }`} />
              {!sidebarCollapsed && <span className="flex-1 text-left">Home</span>}
              {activeSection === 'dashboard' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
              )}
            </button>
          </div>

          {/* Sales Management */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Sales</span>}
            </div>
            <button
              onClick={() => handleSectionClick('deals')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative group ${
                activeSection === 'deals'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title={sidebarCollapsed ? 'Deals' : undefined}
            >
              <Target className={`h-5 w-5 flex-shrink-0 ${
                activeSection === 'deals' ? 'text-blue-600 dark:text-blue-400' : ''
              }`} />
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 text-left">Deals</span>
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">New</span>
                </>
              )}
              {activeSection === 'deals' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
              )}
            </button>
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
              variant={activeSection === 'recycling-analytics' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'recycling-analytics' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('recycling-analytics')}
            >
              <BarChart3 className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Reports</span>}
            </Button>
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
          </div>

          {/* Customer & Partner Management */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Customers & Partners</span>}
            </div>
            <button
              onClick={() => handleSectionClick('customers')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative group ${
                activeSection === 'customers'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title={sidebarCollapsed ? 'Customers' : undefined}
            >
              <Users className={`h-5 w-5 flex-shrink-0 ${
                activeSection === 'customers' ? 'text-blue-600 dark:text-blue-400' : ''
              }`} />
              {!sidebarCollapsed && <span className="flex-1 text-left">Customers</span>}
              {activeSection === 'customers' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
              )}
            </button>
            <Button
              variant={activeSection === 'partners' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'partners' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('partners')}
            >
              <Building2 className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Partners</span>}
            </Button>
            <Button
              variant={activeSection === 'collections' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'collections' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('collections')}
            >
              <Truck className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Maintenance Requests</span>}
            </Button>
          </div>

          {/* Operations */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Operations</span>}
            </div>
            <Button
              variant={activeSection === 'materials' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'materials' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('materials')}
            >
              <Package className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Maintenance</span>}
            </Button>
            <Button
              variant={activeSection === 'routes' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'routes' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('routes')}
            >
              <RouteIcon className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Work Orders</span>}
            </Button>
            <Button
              variant={activeSection === 'invoicing' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'invoicing' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('invoicing')}
            >
              <FileText className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Invoicing</span>}
            </Button>
          </div>

          {/* Activities & Communication */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Activities</span>}
            </div>
            <Button
              variant={activeSection === 'calendar' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'calendar' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('calendar')}
            >
              <CalendarIcon className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Calendar</span>}
            </Button>
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
              variant={activeSection === 'communication' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'communication' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('communication')}
            >
              <PhoneIcon className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Communication</span>}
            </Button>
          </div>

          {/* Tools & Features */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Tools</span>}
            </div>
            <Button
              variant={activeSection === 'search' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'search' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('search')}
            >
              <Search className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Search</span>}
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
            <Button
              variant={activeSection === 'collaboration' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'collaboration' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('collaboration')}
            >
              <MessageSquare className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Collaboration</span>}
            </Button>
            <Button
              variant={activeSection === 'data' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'data' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('data')}
            >
              <Database className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Data Management</span>}
            </Button>
            <Button
              variant={activeSection === 'reports' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'reports' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
              }`}
              onClick={() => handleSectionClick('reports')}
            >
              <FileText className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Reports</span>}
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
        </div>
        </div>
      </aside>

      {/* Zoho-Style Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Zoho-Style Top Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-4 flex-1">
            {/* Search */}
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search anything in CRM..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <CommandPalette onAction={(action) => {
              if (action === 'dashboard') handleSectionClick('dashboard')
              else if (action === 'customers') handleSectionClick('customers')
              else if (action === 'partners') handleSectionClick('partners')
              else if (action === 'deals') handleSectionClick('deals')
              else if (action === 'collections') handleSectionClick('collections')
              else if (action === 'materials') handleSectionClick('materials')
              else if (action === 'invoicing') handleSectionClick('invoicing')
              else if (action === 'recycling-analytics') handleSectionClick('recycling-analytics')
              else if (action === 'settings') handleSectionClick('settings')
              else if (action === 'add-customer') setShowContactDialog(true)
            }} />
            <NotificationCenter />
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <Settings className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200 dark:border-gray-700">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-600 text-white">U</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          {activeSection === 'dashboard' && (
            <EnhancedDashboard />
          )}
          {activeSection === 'deals' && (
            <DealsContent deals={deals} />
          )}
          {activeSection === 'customers' && selectedCustomerId ? (
            <CustomerProfilePage 
              customerId={selectedCustomerId} 
              onBack={() => {
                setSelectedCustomerId(null)
                setActiveSection('customers')
              }}
            />
          ) : activeSection === 'customers' ? (
            <CustomersSegmentationPage />
          ) : null}
          {activeSection === 'partners' && (
            <PartnersPage />
          )}
          {activeSection === 'collections' && (
            <CollectionsPage />
          )}
          {activeSection === 'materials' && (
            <MaterialsInventoryPage />
          )}
          {activeSection === 'routes' && (
            <RoutesPage />
          )}
          {activeSection === 'invoicing' && (
            <InvoicingPage />
          )}
          {activeSection === 'recycling-analytics' && (
            <RecyclingAnalyticsPage />
          )}
          {activeSection === 'contacts' && (
            <ContactsContent contacts={contacts} />
          )}
          {activeSection === 'companies' && (
            <CompaniesContent companies={companies} />
          )}
          {activeSection === 'analytics' && (
            <AnalyticsPage />
          )}
          {activeSection === 'leads' && (
            <LeadsPage />
          )}
          {activeSection === 'calendar' && (
            <CalendarPage />
          )}
          {activeSection === 'activities' && (
            <ActivitiesContent activities={activities} />
          )}
          {activeSection === 'email' && (
            <EmailContent />
          )}
          {activeSection === 'communication' && (
            <CommunicationPage />
          )}
          {activeSection === 'search' && (
            <AdvancedSearchPage />
          )}
          {activeSection === 'automation' && (
            <AutomationPage />
          )}
          {activeSection === 'collaboration' && (
            <CollaborationPage />
          )}
          {activeSection === 'data' && (
            <DataManagementPage />
          )}
          {activeSection === 'reports' && (
            <AnalyticsPage />
          )}
          {activeSection === 'integrations' && (
            <IntegrationsContent />
          )}
          {activeSection === 'settings' && (
            <SettingsPage />
          )}
        </div>
      </div>

      {/* Deal Dialog */}
      <Dialog open={showDealDialog} onOpenChange={setShowDealDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDeal ? 'Edit Deal' : 'Create New Deal'}</DialogTitle>
            <DialogDescription>
              {editingDeal ? 'Update deal information' : 'Add a new deal to your pipeline'}
            </DialogDescription>
          </DialogHeader>
          <DealForm
            deal={editingDeal}
            contacts={contacts}
            companies={companies}
            onSave={(dealData) => {
              if (editingDeal) {
                // Update existing deal
                const updated = crmService.updateDeal(editingDeal.id, dealData)
                if (updated) {
                  setDeals(prev => prev.map(d => d.id === editingDeal.id ? { ...d, ...dealData } as EnhancedDeal : d))
                }
              } else {
                // Create new deal
                const newDeal = crmService.createDeal({
                  ...dealData,
                  ownerId: 'current-user', // TODO: Get from auth
                  status: 'active',
                  activities: [],
                  attachments: [],
                  customFields: {},
                  emailThreads: []
                })
                if (newDeal) {
                  setDeals(prev => [...prev, {
                    ...newDeal,
                    leadScore: 'warm' as LeadScore,
                    competitor: '',
                    assignedTo: 'Unassigned',
                    lastActivity: new Date().toISOString(),
                    communicationPreference: 'email' as CommunicationChannel
                  } as EnhancedDeal])
                }
              }
              setShowDealDialog(false)
              setEditingDeal(null)
            }}
            onCancel={() => {
              setShowDealDialog(false)
              setEditingDeal(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Deal Form Component
function DealForm({
  deal,
  contacts,
  companies,
  onSave,
  onCancel
}: {
  deal: EnhancedDeal | null
  contacts: EnhancedContact[]
  companies: EnhancedCompany[]
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: deal?.name || '',
    description: deal?.description || '',
    value: deal?.value || 0,
    currency: deal?.currency || 'ZAR',
    stage: deal?.stage || 'lead' as DealStage,
    probability: deal?.probability || 10,
    expectedCloseDate: deal?.expectedCloseDate ? deal.expectedCloseDate.toISOString().split('T')[0] : '',
    contactId: deal?.contactId || '',
    companyId: deal?.companyId || '',
    source: deal?.source || 'website' as const,
    priority: deal?.priority || 'medium' as const,
    notes: deal?.notes || '',
    tags: deal?.tags?.join(', ') || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || formData.value <= 0) {
      alert('Please fill in deal name and value')
      return
    }

    const dealData = {
      name: formData.name,
      description: formData.description,
      value: formData.value,
      currency: formData.currency,
      stage: formData.stage,
      probability: formData.probability,
      expectedCloseDate: formData.expectedCloseDate ? new Date(formData.expectedCloseDate) : undefined,
      contactId: formData.contactId || undefined,
      companyId: formData.companyId || undefined,
      source: formData.source,
      priority: formData.priority,
      notes: formData.notes,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : []
    }

    onSave(dealData)
  }

  // Update probability based on stage
  useEffect(() => {
    const stageProbabilities: Record<DealStage, number> = {
      'lead': 10,
      'qualified': 25,
      'proposal': 50,
      'negotiation': 75,
      'closed-won': 100,
      'closed-lost': 0
    }
    if (!deal) {
      setFormData(prev => ({ ...prev, probability: stageProbabilities[formData.stage] || 10 }))
    }
  }, [formData.stage])

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Deal Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Enterprise Software License"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="value">Deal Value (ZAR) *</Label>
          <Input
            id="value"
            type="number"
            min="0"
            step="0.01"
            value={formData.value}
            onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe the deal opportunity..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stage">Stage</Label>
          <Select value={formData.stage} onValueChange={(v) => setFormData(prev => ({ ...prev, stage: v as DealStage }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
              <SelectItem value="negotiation">Negotiation</SelectItem>
              <SelectItem value="closed-won">Closed Won</SelectItem>
              <SelectItem value="closed-lost">Closed Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="probability">Probability (%)</Label>
          <Input
            id="probability"
            type="number"
            min="0"
            max="100"
            value={formData.probability}
            onChange={(e) => setFormData(prev => ({ ...prev, probability: parseInt(e.target.value) || 0 }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="companyId">Company</Label>
          <Select value={formData.companyId || 'none'} onValueChange={(v) => setFormData(prev => ({ ...prev, companyId: v === 'none' ? '' : v }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactId">Contact</Label>
          <Select value={formData.contactId || 'none'} onValueChange={(v) => setFormData(prev => ({ ...prev, contactId: v === 'none' ? '' : v }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select contact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {contacts.map((contact) => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.firstName} {contact.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
          <Input
            id="expectedCloseDate"
            type="date"
            value={formData.expectedCloseDate}
            onChange={(e) => setFormData(prev => ({ ...prev, expectedCloseDate: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="source">Source</Label>
          <Select value={formData.source} onValueChange={(v) => setFormData(prev => ({ ...prev, source: v as any }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="cold_call">Cold Call</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="social">Social Media</SelectItem>
              <SelectItem value="advertisement">Advertisement</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(v) => setFormData(prev => ({ ...prev, priority: v as any }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
          placeholder="e.g., enterprise, software, license"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Additional notes about this deal..."
          rows={4}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {deal ? 'Update Deal' : 'Create Deal'}
        </Button>
      </DialogFooter>
    </form>
  )
}
