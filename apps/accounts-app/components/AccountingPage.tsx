"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import SebenzaLogo from "../Sebenza Nathi Waste Logo.png"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart3, TrendingUp, TrendingDown, FileText, Plus, MoreHorizontal, 
  Calendar as CalendarIcon, Trash2, Download, CreditCard, Banknote, 
  PieChart, Receipt, Users, Settings, ChevronDown, 
  Building2, Wallet, Calculator, FileSpreadsheet, AlertCircle,
  CheckCircle, Clock, Target, ArrowUpRight, ArrowDownRight, Package, Truck,
  RefreshCw, Recycle, Shield, Upload
} from "lucide-react"
import { getSupabaseClient } from "@/app/lib/supabase"
import * as accSb from "@/lib/accounting-supabase"
import { generateInvoicePdf } from "@/lib/invoice-pdf"
import { generateTableReportPdf, type TableReportColumn } from "@/lib/pdf-export"
import { createDocument } from "@/lib/document-api"
import { useToast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { EnhancedDashboard } from "./EnhancedDashboard"
import { QuickEntry } from "./QuickEntry"
import { AdvancedSearch, SearchFilters } from "./AdvancedSearch"
import { BulkImportExport } from "./BulkImportExport"
import { FinancialReports } from "./FinancialReports"
import Documents from "@/app/documents/page"

// Types for comprehensive recycling center accounting system
type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'
type PaymentStatus = 'pending' | 'completed' | 'failed'
type AccountType = 'asset' | 'liability' | 'equity' | 'income' | 'expense'
type MaterialGrade = 'A' | 'B' | 'C' | 'D' | 'Mixed'
type PaymentMethod = 'cash' | 'eft' | 'bank_transfer' | 'cheque'
type WeighbridgeStatus = 'pending' | 'weighed' | 'processed' | 'paid'

// Core accounting types
type Invoice = { 
  id: string
  number: string
  client: string
  clientId?: string
  amount: number
  dueDate: string
  status: InvoiceStatus
  createdDate: string
  description?: string
  tax?: number
  lineItems?: { description: string; quantity: number; unitPrice: number; amount: number }[]
  clientAddress?: string
  shippingAddress?: string
  clientVatNumber?: string
  paymentMethod?: string
  poNumber?: string
  companyBankDetails?: string
}
type Expense = { 
  id: string; vendor: string; category: string; amount: number; date: string; 
  notes?: string; receipt?: string; reimbursable: boolean;
}
type Bill = {
  id: string; vendor: string; amount: number; dueDate: string; status: 'unpaid' | 'paid';
  description?: string; category: string;
}
type Payment = {
  id: string
  invoiceId?: string
  amount: number
  date: string
  method: string
  status: PaymentStatus
  reference?: string
  bankAccountId?: string
  internalNotes?: string
  attachments?: string[]
}
type BankAccount = {
  id: string
  name: string
  type: 'checking' | 'savings' | 'credit'
  balance: number
  bank: string
  accountNumber: string
  branchCode?: string
  swiftCode?: string
  openingBalance?: number
  asOfDate?: string
  lastReconciled?: string
  reconciliationFrequency?: 'daily' | 'weekly' | 'monthly'
  internalNotes?: string
  status?: 'draft' | 'active' | 'inactive'
  glAccountId?: string
}
type ChartAccount = {
  id: string; code: string; name: string; type: AccountType; parentId?: string;
  balance: number; description?: string;
}

type Client = {
  id: string
  name: string
  billingAddress?: string
  vatNumber?: string
  email?: string
  phone?: string
  defaultPaymentTerms?: string
}

// Recycling center specific types
type WeighbridgeTicket = {
  id: string; ticketNumber: string; supplierId: string; material: string; grade: MaterialGrade;
  grossWeight: number; tareWeight: number; netWeight: number; contamination: number;
  photos: string[]; status: WeighbridgeStatus; date: string; location: string;
  driverName: string; vehicleReg: string; notes?: string;
}

type Supplier = {
  id: string
  name: string
  contact: string
  email: string
  phone: string
  idNumber: string
  idType: 'ck' | 'team_code' | 'id_number'
  address: string
  bankDetails: string
  kycStatus: 'pending' | 'approved' | 'rejected'
  blacklistFlag: boolean
  paymentMethod: PaymentMethod
  creditLimit: number
  totalPayouts: number
  lastPayment: string
  status: 'active' | 'inactive'
}

type MaterialPricing = {
  id: string
  material: string
  grade: MaterialGrade
  basePrice: number
  moistureAdjustment: number
  contaminationDeduction: number
  priceTier: 'premium' | 'standard' | 'discount'
  effectiveDate: string
  reviewDate: string
  supplierId?: string
  customerId?: string
  status: 'draft' | 'active' | 'inactive' | 'expired'
  internalNotes?: string
}

type BaleLot = {
  id: string; baleId: string; material: string; grade: MaterialGrade;
  weight: number; density: number; location: string; supplierId: string;
  purchasePrice: number; processingCost: number; cogs: number;
  shrinkage: number; yield: number; date: string; status: 'pending' | 'processed' | 'sold';
}

type ComplianceFee = {
  id: string; type: 'bottle_deposit' | 'epr_eco_fee' | 'landfill_levy' | 'certificate';
  amount: number; collected: number; remitted: number; dueDate: string;
  certificateNumber?: string; chainOfCustody: string[]; status: 'pending' | 'paid';
}

type LogisticsCost = {
  id: string; type: 'gate_fee' | 'transport' | 'fuel_surcharge' | 'route_settlement';
  amount: number; vehicleReg: string; driverName: string; route: string;
  mileage: number; loadPhotos: string[]; date: string; status: 'pending' | 'paid';
}

type CashDrawer = {
  id: string; date: string; openingBalance: number; closingBalance: number;
  cashReceived: number; cashPaid: number; overShort: number;
  bankDeposit: number; depositSlip: string; reconciled: boolean;
  transactions: CashTransaction[];
}

type CashTransaction = {
  id: string; type: 'payment' | 'payout'; amount: number; supplierId?: string;
  description: string; timestamp: string; reference: string;
}

type VendorCustomer = {
  id: string; name: string; type: 'supplier' | 'customer' | 'broker';
  contact: string; email: string; phone: string; idNumber: string;
  address: string; kycStatus: 'pending' | 'approved' | 'rejected';
  blacklistFlag: boolean; creditLimit: number; paymentTerms: string;
  exportDocs: string[]; incoterms: string; fxGains: number; fxLosses: number;
}

const nowIso = () => new Date().toISOString()
const nextWeighbridgeNumber = (n: number) => `SNWB-${String(n).padStart(5, '0')}`

// Mock data removed - data will be loaded from database or API

const statusColor = (s: InvoiceStatus) => ({
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
}[s])

const paymentStatusColor = (s: PaymentStatus) => ({
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
}[s])

export default function AccountingPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [activeSubSection, setActiveSubSection] = useState('')

  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const [uploading, setUploading] = useState<{ section: 'weighbridge' | 'payments'; busy: boolean; error?: string }>({
    section: 'weighbridge',
    busy: false,
  })

  const fulfilledValue = <T,>(r: PromiseSettledResult<T>): T | null => (r.status === "fulfilled" ? r.value : null)

  const navigationSections = [
    {
      key: 'material-purchases',
      label: 'Material Purchases',
      items: [
        { key: 'material-purchases', label: 'Material Purchases', icon: Package },
        { key: 'weighbridge', label: 'Weighbridge', icon: Target },
        { key: 'suppliers', label: 'Suppliers', icon: Users },
        { key: 'pricing', label: 'Pricing', icon: BarChart3 },
      ]
    },
    {
      key: 'inventory',
      label: 'Inventory',
      items: [
        { key: 'inventory', label: 'Inventory', icon: Package },
        { key: 'bales', label: 'Bales & Lots', icon: Package },
        { key: 'invoices', label: 'Invoices', icon: FileText },
      ]
    },
    {
      key: 'compliance',
      label: 'Compliance',
      items: [
        { key: 'compliance', label: 'Fees & Compliance', icon: CheckCircle },
        { key: 'logistics', label: 'Logistics', icon: Truck },
      ]
    },
    {
      key: 'cash-management',
      label: 'Cash Management',
      items: [
        { key: 'cash-drawer', label: 'Cash Drawer', icon: Wallet },
        { key: 'banking', label: 'Banking', icon: Building2 },
      ]
    },
    {
      key: 'vendor-management',
      label: 'Vendor Management',
      items: [
        { key: 'vendors', label: 'Vendors & Customers', icon: Users },
        { key: 'bills', label: 'Bills', icon: Receipt },
        { key: 'payments', label: 'Payments', icon: CreditCard },
      ]
    },
    {
      key: 'reports',
      label: 'Reports',
      items: [
        { key: 'reports', label: 'Reports', icon: PieChart },
      ]
    },
    {
      key: 'integration',
      label: 'Integration',
      items: [
        { key: 'ocr', label: 'OCR & Scale', icon: FileSpreadsheet },
      ]
    },
    {
      key: 'settings',
      label: 'Settings',
      items: [
        { key: 'chart-of-accounts', label: 'Chart of Accounts', icon: Calculator },
        { key: 'settings', label: 'Settings', icon: Settings },
      ]
    },
  ]
  
  // Data states - initialized as empty arrays, data loaded from database/API
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [chartAccounts, setChartAccounts] = useState<ChartAccount[]>([])
  const [clients, setClients] = useState<Client[]>([])
  
  // Recycling center specific states
  const [weighbridgeTickets, setWeighbridgeTickets] = useState<WeighbridgeTicket[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [materialPricing, setMaterialPricing] = useState<MaterialPricing[]>([])
  const [baleLots, setBaleLots] = useState<BaleLot[]>([])
  const [complianceFees, setComplianceFees] = useState<ComplianceFee[]>([])
  const [logisticsCosts, setLogisticsCosts] = useState<LogisticsCost[]>([])
  const [cashDrawers, setCashDrawers] = useState<CashDrawer[]>([])
  const [vendorCustomers, setVendorCustomers] = useState<VendorCustomer[]>([])
  
  // Dialog states
  const [invDialog, setInvDialog] = useState(false)
  const [expDialog, setExpDialog] = useState(false)
  const [billDialog, setBillDialog] = useState(false)
  const [paymentDialog, setPaymentDialog] = useState(false)
  const [bankDialog, setBankDialog] = useState(false)
  const [chartDialog, setChartDialog] = useState(false)
  
  // Editing states
  const [editingInv, setEditingInv] = useState<Invoice | null>(null)
  const [editingExp, setEditingExp] = useState<Expense | null>(null)
  const [editingBill, setEditingBill] = useState<Bill | null>(null)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [editingBank, setEditingBank] = useState<BankAccount | null>(null)
  const [editingChart, setEditingChart] = useState<ChartAccount | null>(null)
  const [editingClientMaster, setEditingClientMaster] = useState<Client | null>(null)
  
  const [userId, setUserId] = useState<string | null>(null)
  const [supabase, setSupabase] = useState<any>(null)

  const attachmentsBucket = process.env.NEXT_PUBLIC_SUPABASE_ATTACHMENTS_BUCKET || "accounting-attachments"

  const uploadToStorage = async (opts: { section: 'weighbridge' | 'payments'; recordId: string; files: FileList | null }) => {
    if (!opts.files || opts.files.length === 0) return []
    if (!supabase) {
      toast({ title: "Uploads not configured", description: "Supabase client is not initialized.", variant: "destructive" as any })
      return []
    }
    const maxBytes = 10 * 1024 * 1024
    const files = Array.from(opts.files)
    const tooBig = files.find(f => f.size > maxBytes)
    if (tooBig) {
      toast({ title: "File too large", description: `"${tooBig.name}" exceeds 10MB.`, variant: "destructive" as any })
      return []
    }

    setUploading({ section: opts.section, busy: true })
    try {
      const urls: string[] = []
      for (const f of files) {
        const safeName = f.name.replace(/[^\w.\-() ]+/g, "_")
        const key = `${userId || "anon"}/${opts.section}/${opts.recordId}/${Date.now()}-${safeName}`
        const { error } = await supabase.storage.from(attachmentsBucket).upload(key, f, { upsert: true, contentType: f.type || undefined })
        if (error) throw error
        const { data } = supabase.storage.from(attachmentsBucket).getPublicUrl(key)
        if (!data?.publicUrl) throw new Error("Failed to resolve public URL")
        urls.push(data.publicUrl)
      }
      return urls
    } catch (e: any) {
      console.error(e)
      toast({ title: "Upload failed", description: e?.message || "Could not upload file(s).", variant: "destructive" as any })
      return []
    } finally {
      setUploading((prev) => ({ ...prev, busy: false }))
    }
  }

  // Form edit states for each section
  const [editingWeighbridge, setEditingWeighbridge] = useState<WeighbridgeTicket | null>(null)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [editingPricing, setEditingPricing] = useState<MaterialPricing | null>(null)
  const [editingBale, setEditingBale] = useState<BaleLot | null>(null)
  const [editingCompliance, setEditingCompliance] = useState<ComplianceFee | null>(null)
  const [editingLogistics, setEditingLogistics] = useState<LogisticsCost | null>(null)
  const [editingCashDrawer, setEditingCashDrawer] = useState<CashDrawer | null>(null)
  const [editingVendor, setEditingVendor] = useState<VendorCustomer | null>(null)

  // Form visibility states - control when forms are shown
  const [showMaterialPurchaseForm, setShowMaterialPurchaseForm] = useState(false)
  const [showWeighbridgeForm, setShowWeighbridgeForm] = useState(false)
  const [showSupplierForm, setShowSupplierForm] = useState(false)
  const [showPricingForm, setShowPricingForm] = useState(false)
  const [showInventoryForm, setShowInventoryForm] = useState(false)
  const [showBaleForm, setShowBaleForm] = useState(false)
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [showComplianceForm, setShowComplianceForm] = useState(false)
  const [showLogisticsForm, setShowLogisticsForm] = useState(false)
  const [showCashDrawerForm, setShowCashDrawerForm] = useState(false)
  const [showBankingForm, setShowBankingForm] = useState(false)
  const [showVendorForm, setShowVendorForm] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showChartForm, setShowChartForm] = useState(false)
  const [showQuickEntryDialog, setShowQuickEntryDialog] = useState(false)
  const [quickEntryType, setQuickEntryType] = useState<'expense' | 'payment' | 'weighbridge'>('expense')
  const [clientDialogOpen, setClientDialogOpen] = useState(false)

  // Invoice line items for New Invoice form (self-calculating)
  type InvoiceItemRow = { id: string; description: string; quantity: number; unitPrice: number; taxPercent: number }
  const [invoiceItemRows, setInvoiceItemRows] = useState<InvoiceItemRow[]>([
    { id: `item-${Date.now()}`, description: '', quantity: 0, unitPrice: 0, taxPercent: 15 },
  ])
  const addInvoiceItem = () => setInvoiceItemRows((prev) => [...prev, { id: `item-${Date.now()}`, description: '', quantity: 0, unitPrice: 0, taxPercent: 15 }])
  const updateInvoiceItem = (id: string, field: keyof InvoiceItemRow, value: string | number) =>
    setInvoiceItemRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  const removeInvoiceItem = (id: string) => setInvoiceItemRows((prev) => prev.filter((r) => r.id !== id))
  const invoiceItemsTotal = (r: InvoiceItemRow) => {
    const subtotal = r.quantity * r.unitPrice
    return subtotal * (1 + (r.taxPercent || 0) / 100)
  }
  const invoiceSubtotal = invoiceItemRows.reduce((s, r) => s + r.quantity * r.unitPrice, 0)
  const invoiceTaxTotal = invoiceItemRows.reduce((s, r) => s + (r.quantity * r.unitPrice * (r.taxPercent || 0)) / 100, 0)
  const invoiceGrandTotal = invoiceSubtotal + invoiceTaxTotal

  // OCR processed docs - when completed, send to Documents
  type OcrQueueItem = { id: string; name: string; status: 'processing' | 'done' | 'error'; sentToDocs?: boolean }
  const [ocrQueue, setOcrQueue] = useState<OcrQueueItem[]>([
    { id: 'q1', name: 'WT-2024-001.jpg', status: 'processing', sentToDocs: false },
    { id: 'q2', name: 'INV-2024-045.pdf', status: 'done', sentToDocs: false },
    { id: 'q3', name: 'ID-123456.jpg', status: 'error', sentToDocs: false },
  ])
  const sendProcessedToDocuments = async (item: OcrQueueItem) => {
    if (item.status !== 'done' || item.sentToDocs) return
    await createDocument({
      title: item.name,
      category: 'Processed',
      version: '1.0',
      owner: 'OCR',
      content: `Processed document: ${item.name}`,
      status: 'approved',
    })
    setOcrQueue((prev) => prev.map((r) => (r.id === item.id ? { ...r, sentToDocs: true } : r)))
    toast({ title: 'Sent to Documents', description: `${item.name} has been added to Documents.` })
    handleSectionClick('documents')
  }

  // Initialize Supabase (single source of truth: DB; no localStorage load on mount)
  useEffect(() => {
    const client = getSupabaseClient()
    setSupabase(client)
    if (client) {
      client.auth.getUser().then(({ data }) => {
        setUserId(data?.user?.id || null)
      }).catch(() => {})
    }
  }, [])

  // Fetch data after supabase is initialized
  useEffect(() => {
    if (!supabase) return
    fetchInvoices()
    fetchClients()
    fetchExpenses()
    const load = async () => {
      try {
        const [s, w, p, bl, c, l, cd, ba, vc, pm, billsRes, ca] = await Promise.allSettled([
          accSb.fetchSuppliers(),
          accSb.fetchWeighbridgeTickets(),
          accSb.fetchMaterialPricing(),
          accSb.fetchBaleLots(),
          accSb.fetchComplianceFees(),
          accSb.fetchLogisticsCosts(),
          accSb.fetchCashDrawers(),
          accSb.fetchBankAccounts(),
          accSb.fetchVendorCustomers(),
          accSb.fetchPayments(),
          accSb.fetchBills(),
          accSb.fetchChartAccounts(),
        ])
        const sv = fulfilledValue(s); if (sv) setSuppliers(sv)
        const wv = fulfilledValue(w); if (wv) setWeighbridgeTickets(wv)
        const pv = fulfilledValue(p); if (pv) setMaterialPricing(pv)
        const blv = fulfilledValue(bl); if (blv) setBaleLots(blv)
        const cv = fulfilledValue(c); if (cv) setComplianceFees(cv)
        const lv = fulfilledValue(l); if (lv) setLogisticsCosts(lv)
        const cdv = fulfilledValue(cd); if (cdv) setCashDrawers(cdv)
        const bav = fulfilledValue(ba); if (bav) setBankAccounts(bav)
        const vcv = fulfilledValue(vc); if (vcv) setVendorCustomers(vcv)
        const pmv = fulfilledValue(pm); if (pmv) setPayments(pmv)
        const billsV = fulfilledValue(billsRes); if (billsV) setBills(billsV)
        const cav = fulfilledValue(ca); if (cav) setChartAccounts(cav)
      } catch {}
    }
    load()
  }, [supabase])

  // Optional: persist to localStorage as backup only (DB is source of truth; we never load from here on init)
  useEffect(() => {
    saveDataToStorage()
  }, [weighbridgeTickets, suppliers, materialPricing, baleLots, complianceFees, logisticsCosts, cashDrawers, vendorCustomers, invoices, expenses, bills, payments, bankAccounts, chartAccounts])

  // Refresh: re-fetch all data from Supabase (single source of truth)
  const handleRefresh = async () => {
    if (!supabase) return
    fetchInvoices()
    fetchClients()
    fetchExpenses()
    try {
      const [s, w, p, bl, c, l, cd, ba, vc, pm, billsRes, ca] = await Promise.allSettled([
        accSb.fetchSuppliers(),
        accSb.fetchWeighbridgeTickets(),
        accSb.fetchMaterialPricing(),
        accSb.fetchBaleLots(),
        accSb.fetchComplianceFees(),
        accSb.fetchLogisticsCosts(),
        accSb.fetchCashDrawers(),
        accSb.fetchBankAccounts(),
        accSb.fetchVendorCustomers(),
        accSb.fetchPayments(),
        accSb.fetchBills(),
        accSb.fetchChartAccounts(),
      ])
      const sv = fulfilledValue(s); if (sv) setSuppliers(sv)
      const wv = fulfilledValue(w); if (wv) setWeighbridgeTickets(wv)
      const pv = fulfilledValue(p); if (pv) setMaterialPricing(pv)
      const blv = fulfilledValue(bl); if (blv) setBaleLots(blv)
      const cv = fulfilledValue(c); if (cv) setComplianceFees(cv)
      const lv = fulfilledValue(l); if (lv) setLogisticsCosts(lv)
      const cdv = fulfilledValue(cd); if (cdv) setCashDrawers(cdv)
      const bav = fulfilledValue(ba); if (bav) setBankAccounts(bav)
      const vcv = fulfilledValue(vc); if (vcv) setVendorCustomers(vcv)
      const pmv = fulfilledValue(pm); if (pmv) setPayments(pmv)
      const billsV = fulfilledValue(billsRes); if (billsV) setBills(billsV)
      const cav = fulfilledValue(ca); if (cav) setChartAccounts(cav)
    } catch {}
    toast({ title: "Refreshed", description: "Data reloaded from server." })
  }

  // JSON.stringify replacer that skips circular references instead of throwing
  const circularReplacer = () => {
    const seen = new WeakSet()
    return (_key: string, value: any) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) return
        seen.add(value)
      }
      return value
    }
  }

  // Helper functions for localStorage persistence
  const saveDataToStorage = () => {
    try {
      const replacer = circularReplacer()
      localStorage.setItem('accounting_weighbridgeTickets', JSON.stringify(weighbridgeTickets, replacer))
      localStorage.setItem('accounting_suppliers', JSON.stringify(suppliers, replacer))
      localStorage.setItem('accounting_materialPricing', JSON.stringify(materialPricing, replacer))
      localStorage.setItem('accounting_baleLots', JSON.stringify(baleLots, replacer))
      localStorage.setItem('accounting_complianceFees', JSON.stringify(complianceFees, replacer))
      localStorage.setItem('accounting_logisticsCosts', JSON.stringify(logisticsCosts, replacer))
      localStorage.setItem('accounting_cashDrawers', JSON.stringify(cashDrawers, replacer))
      localStorage.setItem('accounting_vendorCustomers', JSON.stringify(vendorCustomers, replacer))
      localStorage.setItem('accounting_invoices', JSON.stringify(invoices, replacer))
      localStorage.setItem('accounting_expenses', JSON.stringify(expenses, replacer))
      localStorage.setItem('accounting_bills', JSON.stringify(bills, replacer))
      localStorage.setItem('accounting_payments', JSON.stringify(payments, replacer))
      localStorage.setItem('accounting_bankAccounts', JSON.stringify(bankAccounts, replacer))
      localStorage.setItem('accounting_chartAccounts', JSON.stringify(chartAccounts, replacer))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  // Optional restore from local backup only (not used on init; DB is source of truth)
  const loadDataFromStorage = () => {
    try {
      const savedWeighbridge = localStorage.getItem('accounting_weighbridgeTickets')
      const savedSuppliers = localStorage.getItem('accounting_suppliers')
      const savedPricing = localStorage.getItem('accounting_materialPricing')
      const savedBales = localStorage.getItem('accounting_baleLots')
      const savedCompliance = localStorage.getItem('accounting_complianceFees')
      const savedLogistics = localStorage.getItem('accounting_logisticsCosts')
      const savedCashDrawers = localStorage.getItem('accounting_cashDrawers')
      const savedVendors = localStorage.getItem('accounting_vendorCustomers')
      const savedInvoices = localStorage.getItem('accounting_invoices')
      const savedExpenses = localStorage.getItem('accounting_expenses')
      const savedBills = localStorage.getItem('accounting_bills')
      const savedPayments = localStorage.getItem('accounting_payments')
      const savedBanks = localStorage.getItem('accounting_bankAccounts')
      const savedChart = localStorage.getItem('accounting_chartAccounts')

      if (savedWeighbridge) setWeighbridgeTickets(JSON.parse(savedWeighbridge))
      if (savedSuppliers) setSuppliers(JSON.parse(savedSuppliers))
      if (savedPricing) setMaterialPricing(JSON.parse(savedPricing))
      if (savedBales) setBaleLots(JSON.parse(savedBales))
      if (savedCompliance) setComplianceFees(JSON.parse(savedCompliance))
      if (savedLogistics) setLogisticsCosts(JSON.parse(savedLogistics))
      if (savedCashDrawers) setCashDrawers(JSON.parse(savedCashDrawers))
      if (savedVendors) setVendorCustomers(JSON.parse(savedVendors))
      if (savedInvoices) setInvoices(JSON.parse(savedInvoices))
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses))
      if (savedBills) setBills(JSON.parse(savedBills))
      if (savedPayments) setPayments(JSON.parse(savedPayments))
      if (savedBanks) setBankAccounts(JSON.parse(savedBanks))
      if (savedChart) setChartAccounts(JSON.parse(savedChart))
    } catch (error) {
      console.error('Error loading from localStorage:', error)
    }
  }

  async function fetchInvoices() {
    if (!supabase) return
    try {
      const { data } = await supabase.from('accounting_invoices').select('*').order('created_at', { ascending: false })
      if (data) setInvoices(data.map((r:any)=>({ 
        id: r.id,
        number: r.invoice_number ?? r.number ?? '',
        client: r.client ?? '',
        clientId: r.client_id ?? undefined,
        amount: Number(r.amount||0), 
        dueDate: (r.due_date ? new Date(r.due_date) : new Date()).toISOString(),
        status: r.status ?? 'draft',
        createdDate: (r.created_at ? new Date(r.created_at) : new Date()).toISOString(), 
        description: r.description ?? '',
        tax: Number(r.tax || 0),
        lineItems: Array.isArray(r.line_items) ? r.line_items : [],
        clientAddress: r.client_address ?? '',
        clientVatNumber: r.client_vat_number ?? '',
        paymentMethod: r.payment_method ?? '',
        poNumber: r.po_number ?? '',
        companyBankDetails: r.company_bank_details ?? '',
      })))
    } catch {
      // Table may not exist yet - data remains empty
    }
  }

  async function fetchClients() {
    if (!supabase) return
    try {
      const { data } = await supabase.from('accounting_clients').select('*').order('name', { ascending: true })
      if (data) {
        setClients(
          data.map((c: any) => ({
            id: c.id,
            name: c.name,
            billingAddress: c.billing_address ?? '',
            vatNumber: c.vat_number ?? '',
            email: c.email ?? '',
            phone: c.phone ?? '',
            defaultPaymentTerms: c.default_payment_terms ?? '',
          }))
        )
      }
    } catch {
      // table might not exist yet
    }
  }

  const openNewClientDialog = () => {
    setEditingClientMaster({
      id: '',
      name: '',
      billingAddress: '',
      vatNumber: '',
      email: '',
      phone: '',
      defaultPaymentTerms: '',
    })
    setClientDialogOpen(true)
  }

  const handleSaveClientMaster = async () => {
    if (!supabase || !editingClientMaster || !editingClientMaster.name.trim()) {
      setClientDialogOpen(false)
      return
    }
    try {
      const { data, error } = await supabase
        .from('accounting_clients')
        .insert({
          name: editingClientMaster.name.trim(),
          billing_address: editingClientMaster.billingAddress || null,
          vat_number: editingClientMaster.vatNumber || null,
          email: editingClientMaster.email || null,
          phone: editingClientMaster.phone || null,
          default_payment_terms: editingClientMaster.defaultPaymentTerms || null,
        })
        .select('*')
        .single()

      if (error) throw error
      if (data) {
        const saved: Client = {
          id: data.id,
          name: data.name,
          billingAddress: data.billing_address ?? '',
          vatNumber: data.vat_number ?? '',
          email: data.email ?? '',
          phone: data.phone ?? '',
          defaultPaymentTerms: data.default_payment_terms ?? '',
        }
        setClients(prev => [...prev, saved])
        // Auto-apply to current invoice
        setEditingInv(prev => ({
          id: prev?.id ?? `i-${Date.now()}`,
          number: prev?.number ?? generateInvoiceNumber(),
          client: saved.name,
          clientId: saved.id,
          clientAddress: saved.billingAddress ?? prev?.clientAddress ?? '',
          clientVatNumber: saved.vatNumber ?? prev?.clientVatNumber ?? '',
          amount: prev?.amount ?? 0,
          tax: prev?.tax ?? 0,
          dueDate: prev?.dueDate ?? nowIso(),
          status: prev?.status ?? 'draft',
          createdDate: prev?.createdDate ?? nowIso(),
          description: prev?.description ?? '',
          lineItems: prev?.lineItems ?? [],
          paymentMethod: prev?.paymentMethod ?? '',
          poNumber: prev?.poNumber ?? '',
          companyBankDetails: prev?.companyBankDetails ?? '',
        }))
      }
    } catch (e) {
      console.error('Failed to save client:', e)
    } finally {
      setClientDialogOpen(false)
      setEditingClientMaster(null)
    }
  }
  async function fetchExpenses() {
    if (!supabase) return
    try {
      const { data } = await supabase.from('accounting_expenses').select('*').order('date', { ascending: false })
      if (data) setExpenses(data.map((r:any)=>({ 
        id:r.id, vendor:r.vendor, category:r.category, amount:Number(r.amount||0), 
        date: new Date(r.date).toISOString(), notes:r.notes||'', reimbursable: r.reimbursable || false
      })))
    } catch {
      // Table may not exist yet - data remains empty
    }
  }

  // KPI Calculations
  const revenue = useMemo(()=> invoices.filter(i=>i.status==='paid').reduce((s,i)=>s+i.amount,0), [invoices])
  const outstanding = useMemo(()=> invoices.filter(i=>i.status==='sent' || i.status==='overdue').reduce((s,i)=>s+i.amount,0), [invoices])
  const spend = useMemo(()=> expenses.reduce((s,e)=>s+e.amount, 0), [expenses])
  const totalPayables = useMemo(()=> bills.filter(b=>b.status==='unpaid').reduce((s,b)=>s+b.amount,0), [bills])
  const cashflow = useMemo(()=> revenue - spend, [revenue, spend])
  const bankBalance = useMemo(()=> bankAccounts.reduce((s,b)=>s+b.balance,0), [bankAccounts])
  const materialProcessedKg = useMemo(()=> weighbridgeTickets.reduce((s,t)=>s+(t.netWeight||0),0), [weighbridgeTickets])
  const materialProcessedTons = materialProcessedKg / 1000
  const costPerTon = materialProcessedTons > 0 ? spend / materialProcessedTons : 0
  const materialByRevenue = useMemo(()=> {
    const byMat: Record<string, number> = {}
    weighbridgeTickets.forEach(t=> {
      const m = t.material || 'Other'
      const val = (t.netWeight||0) * (materialPricing.find(p=>p.material===m)?.basePrice || 0)
      byMat[m] = (byMat[m]||0) + val
    })
    return Object.entries(byMat).sort((a,b)=>b[1]-a[1]).slice(0,5)
  }, [weighbridgeTickets, materialPricing])
  const supplierByVolume = useMemo(()=> {
    const bySup: Record<string, {kg: number; value: number}>= {}
    weighbridgeTickets.forEach(t=> {
      const s = suppliers.find(sup=>sup.id===t.supplierId)?.name || t.supplierId || 'Unknown'
      if (!bySup[s]) bySup[s] = { kg: 0, value: 0 }
      bySup[s].kg += t.netWeight || 0
      bySup[s].value += (t.netWeight||0) * (materialPricing.find(p=>p.material===t.material)?.basePrice || 0)
    })
    return Object.entries(bySup).sort((a,b)=>b[1].kg-a[1].kg).slice(0,5)
  }, [weighbridgeTickets, suppliers, materialPricing])
  const complianceCollected = useMemo(()=> complianceFees.filter(f=>f.status==='paid').reduce((s,f)=>s+(f.amount||0),0), [complianceFees])
  // The current schema supports only 'pending'|'paid' for compliance fees.
  // Treat "remitted" as out-of-scope for now.
  const complianceRemitted = 0
  const complianceOutstanding = complianceCollected
  const cogsEstimate = useMemo(()=> weighbridgeTickets.reduce((s,t)=>s+(t.netWeight||0)*(materialPricing.find(p=>p.material===t.material)?.basePrice||0),0), [weighbridgeTickets, materialPricing])
  const operatingExpenses = spend - cogsEstimate
  const netProfit = revenue - cogsEstimate - Math.max(0, operatingExpenses)
  const cashIn = useMemo(()=> payments.filter(p=>p.status==='completed').reduce((s,p)=>s+(p.amount||0),0), [payments])
  const cashOut = spend

  // Navigation handlers
  const handleSectionClick = (section: string) => {
    setActiveSection(section)
    setActiveSubSection('')
  }

  const handleSubSectionClick = (subSection: string) => {
    setActiveSubSection(subSection)
  }

  // Invoice handlers
  const generateInvoiceNumber = () => {
    // SNW-E00001 style invoice numbers
    const prefix = 'SNW-E'
    const next = invoices.length + 1
    return `${prefix}${String(next).padStart(5, '0')}`
  }

  const openCreateInv = () => {
    setEditingInv({
      id: `i-${Date.now()}`, number: generateInvoiceNumber(), client: '', amount: 0, dueDate: nowIso(),
      status: 'draft', createdDate: nowIso(), description: '', tax: 0
    })
    setInvoiceItemRows([{ id: `item-${Date.now()}`, description: '', quantity: 0, unitPrice: 0, taxPercent: 15 }])
    setInvDialog(true)
  }
  const openEditInv = (i: Invoice) => { setEditingInv(i); setInvDialog(true) }
  const saveInv = async (override?: Partial<Invoice>) => {
    const rawInv = editingInv
      ? { ...editingInv, ...override }
      : override
      ? {
          id: `i-${Date.now()}`,
          number: generateInvoiceNumber(),
          client: '',
          amount: 0,
          tax: 0,
          dueDate: nowIso(),
          status: 'draft',
          createdDate: nowIso(),
          description: '',
          ...override,
        }
      : null
    if (!rawInv) return

    const normalizeInvoiceStatus = (s: any): InvoiceStatus => {
      const v = String(s || "draft")
      return v === "draft" || v === "sent" || v === "paid" || v === "overdue" ? (v as InvoiceStatus) : "draft"
    }

    const inv: Invoice = {
      ...(rawInv as Invoice),
      status: normalizeInvoiceStatus((rawInv as any).status),
    }
    const exists = invoices.some(i => i.id === inv.id)
    setInvoices(prev => exists ? prev.map(i => i.id === inv.id ? inv : i) : prev.concat(inv))
    if (supabase) {
      const payload = {
        invoice_number: inv.number,
        client: inv.client ?? '',
        amount: inv.amount,
        due_date: new Date(inv.dueDate).toISOString().slice(0, 10),
        status: inv.status,
        description: inv.description ?? '',
        tax: inv.tax ?? 0,
        type: 'sales',
        issue_date: inv.createdDate ? new Date(inv.createdDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        line_items: inv.lineItems ?? null,
        client_address: inv.clientAddress ?? null,
        payment_method: inv.paymentMethod ?? null,
        po_number: inv.poNumber ?? null,
        company_bank_details: inv.companyBankDetails ?? null,
      }
      try {
        if (exists && /^[0-9a-f-]{36}$/i.test(inv.id)) {
          const { error } = await supabase.from('accounting_invoices').update(payload).eq('id', inv.id)
          if (error) throw error
        } else {
          const { data: inserted, error } = await supabase.from('accounting_invoices').insert({
            ...payload,
            ...(userId ? { user_id: userId } : {}),
          }).select('id').single()
          if (error) throw error
          if (inserted?.id) setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, id: inserted.id } : i))
        }
        fetchInvoices()
      } catch (err) {
        console.error('Invoice save failed:', err)
        toast({ title: "Save failed", description: "Invoice saved locally. Check database connection.", variant: "destructive" })
      }
    }
    setInvDialog(false)
    setEditingInv(null)
  }
  const deleteInv = async (id: string) => {
    setInvoices(prev => prev.filter(i=>i.id!==id))
    if (supabase) {
      await supabase.from('accounting_invoices').delete().eq('id', id)
      fetchInvoices()
    }
  }

  // Expense handlers
  const openCreateExp = () => { 
    setEditingExp({ 
      id:`x-${Date.now()}`, vendor:'', category:'', amount:0, date: nowIso(), 
      notes: '', reimbursable: false
    }); 
    setExpDialog(true) 
  }
  const openEditExp = (e: Expense) => { setEditingExp(e); setExpDialog(true) }
  const saveExp = async () => {
    if(!editingExp) return
    const exists = expenses.some(e=>e.id===editingExp.id)
    setExpenses(prev => exists ? prev.map(e=>e.id===editingExp.id? editingExp : e) : prev.concat(editingExp))
    if (supabase) {
      try {
        if (exists && /^[0-9a-f-]{36}$/i.test(editingExp.id)) {
          await supabase.from('accounting_expenses').update({
            vendor: editingExp.vendor, category: editingExp.category, amount: editingExp.amount,
            date: new Date(editingExp.date).toISOString().slice(0, 10), notes: editingExp.notes || '',
            reimbursable: editingExp.reimbursable ?? false,
          }).eq('id', editingExp.id)
        } else {
          const { data } = await supabase.from('accounting_expenses').insert({
            vendor: editingExp.vendor, category: editingExp.category, amount: editingExp.amount,
            date: new Date(editingExp.date).toISOString().slice(0, 10), notes: editingExp.notes || '',
            reimbursable: editingExp.reimbursable ?? false,
          }).select('id').single()
          if (data?.id) setExpenses(prev => prev.map(e => e.id === editingExp.id ? { ...e, id: data.id } : e))
        }
        fetchExpenses()
      } catch (err) { console.error('Expense save failed:', err) }
    }
    setExpDialog(false); setEditingExp(null)
  }
  const deleteExp = async (id: string) => {
    setExpenses(prev => prev.filter(e=>e.id!==id))
  }

  // Toast notifications
  const { toast } = useToast()

  // Delete confirmation states
  const [deleteConfirm, setDeleteConfirm] = useState<{open: boolean, type: string, id: string | null}>({open: false, type: '', id: null})

  // ========== GENERAL BUTTON HANDLERS ==========
  // Export handler
  const handleExport = () => {
    // Export all key datasets as a JSON snapshot.
    // Report PDFs/Excels are exported from each dedicated report page.
    const data = {
      weighbridgeTickets,
      suppliers,
      materialPricing,
      baleLots,
      invoices,
      expenses,
      payments,
      bankAccounts,
      chartAccounts
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `accounting-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({ title: "Export successful", description: "Accounting data has been exported." })
  }

  // Section PDF export: same branding as invoice PDF, page-specific data
  const handleExportSectionPdf = async () => {
    const base = `Sebenza-${new Date().toISOString().slice(0, 10)}`
    switch (activeSection) {
      case "suppliers": {
        const columns: TableReportColumn[] = [
          { key: "name", label: "Name" },
          { key: "contact", label: "Contact" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "idType", label: "ID Type" },
          { key: "idNumber", label: "ID Number" },
          { key: "address", label: "Address" },
          { key: "creditLimit", label: "Credit Limit", format: "currency" },
          { key: "paymentMethod", label: "Payment" },
          { key: "kycStatus", label: "KYC" },
        ]
        await generateTableReportPdf({
          title: "Suppliers",
          subtitle: `${suppliers.length} supplier(s)`,
          columns,
          rows: suppliers.map((s) => ({
            name: s.name,
            contact: s.contact,
            email: s.email ?? "",
            phone: s.phone ?? "",
            idType: s.idType ?? "",
            idNumber: s.idNumber ?? "",
            address: (s.address ?? "").slice(0, 40),
            creditLimit: s.creditLimit ?? 0,
            paymentMethod: s.paymentMethod ?? "",
            kycStatus: s.kycStatus ?? "",
          })),
          filename: `${base}-Suppliers.pdf`,
        })
        break
      }
      case "expenses": {
        const columns: TableReportColumn[] = [
          { key: "vendor", label: "Vendor" },
          { key: "category", label: "Category" },
          { key: "amount", label: "Amount", format: "currency" },
          { key: "date", label: "Date", format: "date" },
          { key: "notes", label: "Notes" },
          { key: "reimbursable", label: "Reimbursable" },
        ]
        await generateTableReportPdf({
          title: "Expenses",
          subtitle: `${expenses.length} expense(s)`,
          columns,
          rows: expenses.map((e) => ({
            vendor: e.vendor,
            category: e.category,
            amount: e.amount,
            date: e.date,
            notes: (e.notes ?? "").slice(0, 30),
            reimbursable: e.reimbursable ? "Yes" : "No",
          })),
          filename: `${base}-Expenses.pdf`,
        })
        break
      }
      case "invoices": {
        const columns: TableReportColumn[] = [
          { key: "number", label: "Invoice #" },
          { key: "client", label: "Client" },
          { key: "amount", label: "Amount", format: "currency" },
          { key: "dueDate", label: "Due Date", format: "date" },
          { key: "status", label: "Status" },
        ]
        await generateTableReportPdf({
          title: "Invoices",
          subtitle: `${invoices.length} invoice(s)`,
          columns,
          rows: invoices.map((i) => ({
            number: i.number,
            client: i.client,
            amount: i.amount,
            dueDate: i.dueDate,
            status: i.status,
          })),
          filename: `${base}-Invoices.pdf`,
        })
        break
      }
      case "payments": {
        const columns: TableReportColumn[] = [
          { key: "invoiceId", label: "Invoice" },
          { key: "amount", label: "Amount", format: "currency" },
          { key: "date", label: "Date", format: "date" },
          { key: "method", label: "Method" },
          { key: "status", label: "Status" },
          { key: "reference", label: "Reference" },
        ]
        await generateTableReportPdf({
          title: "Payments",
          subtitle: `${payments.length} payment(s)`,
          columns,
          rows: payments.map((p) => ({
            invoiceId: p.invoiceId ?? "",
            amount: p.amount,
            date: p.date,
            method: p.method,
            status: p.status,
            reference: (p.reference ?? "").slice(0, 20),
          })),
          filename: `${base}-Payments.pdf`,
        })
        break
      }
      case "banking": {
        const columns: TableReportColumn[] = [
          { key: "name", label: "Account" },
          { key: "type", label: "Type" },
          { key: "balance", label: "Balance", format: "currency" },
          { key: "bank", label: "Bank" },
          { key: "accountNumber", label: "Account #" },
        ]
        await generateTableReportPdf({
          title: "Banking & Accounts",
          subtitle: `${bankAccounts.length} account(s)`,
          columns,
          rows: bankAccounts.map((b) => ({
            name: b.name,
            type: b.type,
            balance: b.balance,
            bank: b.bank,
            accountNumber: b.accountNumber,
          })),
          filename: `${base}-Banking.pdf`,
        })
        break
      }
      case "chart-of-accounts": {
        const columns: TableReportColumn[] = [
          { key: "code", label: "Code" },
          { key: "name", label: "Name" },
          { key: "type", label: "Type" },
          { key: "balance", label: "Balance", format: "currency" },
          { key: "description", label: "Description" },
        ]
        await generateTableReportPdf({
          title: "Chart of Accounts",
          subtitle: `${chartAccounts.length} account(s)`,
          columns,
          rows: chartAccounts.map((c) => ({
            code: c.code,
            name: c.name,
            type: c.type,
            balance: c.balance,
            description: (c.description ?? "").slice(0, 30),
          })),
          filename: `${base}-ChartOfAccounts.pdf`,
        })
        break
      }
      case "weighbridge":
      case "material-purchases": {
        const columns: TableReportColumn[] = [
          { key: "ticketNumber", label: "Ticket #" },
          { key: "supplierId", label: "Supplier" },
          { key: "material", label: "Material" },
          { key: "grade", label: "Grade" },
          { key: "netWeight", label: "Net (kg)", format: "number" },
          { key: "date", label: "Date", format: "date" },
          { key: "status", label: "Status" },
        ]
        await generateTableReportPdf({
          title: activeSection === "weighbridge" ? "Weighbridge Tickets" : "Material Purchases",
          subtitle: `${weighbridgeTickets.length} ticket(s)`,
          columns,
          rows: weighbridgeTickets.map((t) => ({
            ticketNumber: t.ticketNumber,
            supplierId: t.supplierId,
            material: t.material,
            grade: t.grade,
            netWeight: t.netWeight,
            date: t.date,
            status: t.status,
          })),
          filename: `${base}-${activeSection === "weighbridge" ? "Weighbridge" : "MaterialPurchases"}.pdf`,
        })
        break
      }
      case "bales": {
        const columns: TableReportColumn[] = [
          { key: "baleId", label: "Bale ID" },
          { key: "material", label: "Material" },
          { key: "grade", label: "Grade" },
          { key: "weight", label: "Weight", format: "number" },
          { key: "date", label: "Date", format: "date" },
          { key: "status", label: "Status" },
        ]
        await generateTableReportPdf({
          title: "Bales & Lots",
          subtitle: `${baleLots.length} bale(s)`,
          columns,
          rows: baleLots.map((b) => ({
            baleId: b.baleId,
            material: b.material,
            grade: b.grade,
            weight: b.weight,
            date: b.date,
            status: b.status,
          })),
          filename: `${base}-Bales.pdf`,
        })
        break
      }
      case "compliance": {
        const columns: TableReportColumn[] = [
          { key: "type", label: "Type" },
          { key: "amount", label: "Amount", format: "currency" },
          { key: "dueDate", label: "Due Date", format: "date" },
          { key: "status", label: "Status" },
        ]
        await generateTableReportPdf({
          title: "Compliance & Fees",
          subtitle: `${complianceFees.length} fee(s)`,
          columns,
          rows: complianceFees.map((f) => ({
            type: f.type,
            amount: f.amount,
            dueDate: f.dueDate,
            status: f.status,
          })),
          filename: `${base}-Compliance.pdf`,
        })
        break
      }
      case "logistics": {
        const columns: TableReportColumn[] = [
          { key: "type", label: "Type" },
          { key: "amount", label: "Amount", format: "currency" },
          { key: "date", label: "Date", format: "date" },
          { key: "vehicleReg", label: "Vehicle" },
          { key: "driverName", label: "Driver" },
        ]
        await generateTableReportPdf({
          title: "Logistics & Haulage",
          subtitle: `${logisticsCosts.length} record(s)`,
          columns,
          rows: logisticsCosts.map((l) => ({
            type: l.type,
            amount: l.amount,
            date: l.date,
            vehicleReg: l.vehicleReg,
            driverName: l.driverName,
          })),
          filename: `${base}-Logistics.pdf`,
        })
        break
      }
      case "cash-drawer": {
        const columns: TableReportColumn[] = [
          { key: "date", label: "Date", format: "date" },
          { key: "openingBalance", label: "Opening", format: "currency" },
          { key: "closingBalance", label: "Closing", format: "currency" },
          { key: "cashReceived", label: "Received", format: "currency" },
          { key: "cashPaid", label: "Paid", format: "currency" },
        ]
        await generateTableReportPdf({
          title: "Cash Drawer",
          subtitle: `${cashDrawers.length} session(s)`,
          columns,
          rows: cashDrawers.map((c) => ({
            date: c.date,
            openingBalance: c.openingBalance,
            closingBalance: c.closingBalance,
            cashReceived: c.cashReceived,
            cashPaid: c.cashPaid,
          })),
          filename: `${base}-CashDrawer.pdf`,
        })
        break
      }
      case "vendors": {
        const columns: TableReportColumn[] = [
          { key: "name", label: "Name" },
          { key: "type", label: "Type" },
          { key: "contact", label: "Contact" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
        ]
        await generateTableReportPdf({
          title: "Vendors & Customers",
          subtitle: `${vendorCustomers.length} record(s)`,
          columns,
          rows: vendorCustomers.map((v) => ({
            name: v.name,
            type: v.type,
            contact: v.contact,
            email: v.email,
            phone: v.phone,
          })),
          filename: `${base}-Vendors.pdf`,
        })
        break
      }
      case "pricing": {
        const columns: TableReportColumn[] = [
          { key: "material", label: "Material" },
          { key: "grade", label: "Grade" },
          { key: "basePrice", label: "Base Price", format: "currency" },
          { key: "effectiveDate", label: "Effective", format: "date" },
        ]
        await generateTableReportPdf({
          title: "Material Pricing",
          subtitle: `${materialPricing.length} price(s)`,
          columns,
          rows: materialPricing.map((p) => ({
            material: p.material,
            grade: p.grade,
            basePrice: p.basePrice,
            effectiveDate: p.effectiveDate ?? "",
          })),
          filename: `${base}-Pricing.pdf`,
        })
        break
      }
      case "bills": {
        const columns: TableReportColumn[] = [
          { key: "vendor", label: "Vendor" },
          { key: "amount", label: "Amount", format: "currency" },
          { key: "dueDate", label: "Due Date", format: "date" },
          { key: "status", label: "Status" },
        ]
        await generateTableReportPdf({
          title: "Bills",
          subtitle: `${bills.length} bill(s)`,
          columns,
          rows: bills.map((b) => ({
            vendor: b.vendor,
            amount: b.amount,
            dueDate: b.dueDate,
            status: b.status,
          })),
          filename: `${base}-Bills.pdf`,
        })
        break
      }
      default:
        toast({ title: "No PDF for this page", description: "Download PDF is available for data tables (Suppliers, Expenses, Invoices, etc.)." })
        return
    }
    toast({ title: "PDF downloaded", description: `${activeSection} report saved.` })
  }

  // Cancel form handler - closes current form based on active section
  const handleCancelForm = () => {
    switch (activeSection) {
      case 'material-purchases':
        setShowMaterialPurchaseForm(false)
        setShowWeighbridgeForm(false)
        setEditingWeighbridge(null)
        break
      case 'weighbridge':
        setShowWeighbridgeForm(false)
        setEditingWeighbridge(null)
        break
      case 'suppliers':
        setShowSupplierForm(false)
        setEditingSupplier(null)
        break
      case 'pricing':
        setShowPricingForm(false)
        setEditingPricing(null)
        break
      case 'inventory':
        setShowInventoryForm(false)
        break
      case 'bales':
        setShowBaleForm(false)
        setEditingBale(null)
        break
      case 'invoices':
        setShowInvoiceForm(false)
        setEditingInv(null)
        break
      case 'compliance':
        setShowComplianceForm(false)
        setEditingCompliance(null)
        break
      case 'logistics':
        setShowLogisticsForm(false)
        setEditingLogistics(null)
        break
      case 'cash-drawer':
        setShowCashDrawerForm(false)
        setEditingCashDrawer(null)
        break
      case 'banking':
        setShowBankingForm(false)
        setEditingBank(null)
        break
      case 'vendors':
        setShowVendorForm(false)
        setEditingVendor(null)
        break
      case 'bills':
        setBillDialog(false)
        setEditingBill(null)
        break
      case 'payments':
        setShowPaymentForm(false)
        setEditingPayment(null)
        break
      case 'chart-of-accounts':
        setShowChartForm(false)
        setEditingChart(null)
        break
    }
  }

  // Save Draft handler - saves current form as draft (calls section-specific save)
  const handleSaveDraft = () => {
    if (activeSection === 'invoices' && (editingInv || invoiceItemRows.some(r => r.quantity > 0 || r.unitPrice > 0))) {
      const inv = editingInv || { id: `i-${Date.now()}`, number: `INV-${String(invoices.length + 1).padStart(4, '0')}`, client: '', amount: 0, tax: 0, dueDate: nowIso(), status: 'draft', createdDate: nowIso(), description: '' }
      saveInv({ ...inv, amount: invoiceSubtotal, tax: invoiceTaxTotal, status: 'draft' })
      toast({ title: "Draft saved", description: "Invoice saved as draft." })
    } else if (activeSection === 'material-purchases' || activeSection === 'weighbridge') {
      if (editingWeighbridge) { handleSaveWeighbridge(); toast({ title: "Draft saved", description: "Material purchase saved." }) }
      else toast({ title: "No form open", description: "Click New Purchase to create an entry." })
    } else if (activeSection === 'suppliers' && editingSupplier) {
      handleSaveSupplier(); toast({ title: "Draft saved", description: "Supplier saved." })
    } else if (activeSection === 'pricing' && editingPricing) {
      handleSavePricing(); toast({ title: "Draft saved", description: "Pricing saved." })
    } else if (activeSection === 'bales' && editingBale) {
      handleSaveBale(); toast({ title: "Draft saved", description: "Bale lot saved." })
    } else if (activeSection === 'compliance' && editingCompliance) {
      handleSaveCompliance(); toast({ title: "Draft saved", description: "Compliance fee saved." })
    } else if (activeSection === 'logistics' && editingLogistics) {
      handleSaveLogistics(); toast({ title: "Draft saved", description: "Logistics cost saved." })
    } else if (activeSection === 'cash-drawer' && editingCashDrawer) {
      handleSaveCashDrawer(); toast({ title: "Draft saved", description: "Cash drawer saved." })
    } else if (activeSection === 'banking' && editingBank) {
      handleSaveBankAccount(); toast({ title: "Draft saved", description: "Bank account saved." })
    } else if (activeSection === 'vendors' && editingVendor) {
      handleSaveVendor(); toast({ title: "Draft saved", description: "Vendor saved." })
    } else if (activeSection === 'bills' && editingBill) {
      handleSaveBill(); toast({ title: "Saved", description: "Bill saved." })
    } else if (activeSection === 'payments' && editingPayment) {
      handleSavePayment(); toast({ title: "Draft saved", description: "Payment saved." })
    } else if (activeSection === 'chart-of-accounts' && editingChart) {
      handleSaveChartAccount(); toast({ title: "Draft saved", description: "Chart account saved." })
    } else {
      toast({ title: "Draft saved", description: "Your changes have been saved as a draft." })
    }
  }

  // Save Settings handler
  const handleSaveSettings = () => {
    toast({ title: "Settings saved", description: "Your settings have been saved successfully." })
  }

  // Quick Entry save - persists expense, payment, or weighbridge from Quick Add
  const handleQuickEntrySave = async (type: string, data: any) => {
    const date = data.date || new Date().toISOString().split('T')[0]
    if (type === 'expense') {
      const exp = { id: `x-${Date.now()}`, vendor: data.vendor || '', category: data.category || 'other', amount: Number(data.amount) || 0, date, notes: '', reimbursable: false }
      setExpenses(prev => [...prev, exp])
      if (supabase) {
        try {
          const { data: inserted } = await supabase.from('accounting_expenses').insert({ vendor: exp.vendor, category: exp.category, amount: exp.amount, date, notes: exp.notes, reimbursable: exp.reimbursable }).select('id').single()
          if (inserted?.id) setExpenses(prev => prev.map(e => e.id === exp.id ? { ...e, id: inserted.id } : e))
          fetchExpenses()
        } catch (e) { console.error(e) }
      }
    } else if (type === 'payment') {
      const pay = { id: `p-${Date.now()}`, invoiceId: '', amount: Number(data.amount) || 0, date, method: data.method || 'eft', status: 'completed' as const, reference: data.reference || '' }
      setPayments(prev => [...prev, pay])
      if (supabase) {
        try {
          const id = await accSb.upsertPayment({ ...pay, date, invoiceId: null })
          if (id) setPayments(prev => prev.map(p => p.id === pay.id ? { ...p, id } : p))
          accSb.fetchPayments().then(setPayments)
        } catch (e) { console.error(e) }
      }
    } else if (type === 'weighbridge') {
      const net = (Number(data.grossWeight) || 0) - (Number(data.tareWeight) || 0)
      const ticket = { id: `wb-${Date.now()}`, ticketNumber: nextWeighbridgeNumber(weighbridgeTickets.length + 1), supplierId: data.supplier || '', material: data.material || 'Other', grade: (data.grade || 'A') as MaterialGrade, grossWeight: Number(data.grossWeight) || 0, tareWeight: Number(data.tareWeight) || 0, netWeight: net, contamination: 0, photos: [], status: 'pending' as const, date, location: '', driverName: '', vehicleReg: '', notes: '' }
      setWeighbridgeTickets(prev => [...prev, ticket])
      if (supabase) {
        try {
          const id = await accSb.upsertWeighbridgeTicket({ ticketNumber: ticket.ticketNumber, supplierId: ticket.supplierId || undefined, material: ticket.material, grade: ticket.grade, grossWeight: ticket.grossWeight, tareWeight: ticket.tareWeight, netWeight: ticket.netWeight, contamination: ticket.contamination, photos: ticket.photos, status: ticket.status, date: ticket.date, location: ticket.location, driverName: ticket.driverName, vehicleReg: ticket.vehicleReg, notes: ticket.notes })
          if (id) setWeighbridgeTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, id } : t))
          accSb.fetchWeighbridgeTickets().then(setWeighbridgeTickets)
        } catch (e) { console.error(e) }
      }
    }
    setShowQuickEntryDialog(false)
  }

  // ========== WEIGHBRIDGE TICKETS HANDLERS ==========
  const handleCreateWeighbridge = () => {
    const newTicket: WeighbridgeTicket = {
      id: `wb-${Date.now()}`,
      ticketNumber: nextWeighbridgeNumber(weighbridgeTickets.length + 1),
      supplierId: '',
      material: '',
      grade: 'A',
      grossWeight: 0,
      tareWeight: 0,
      netWeight: 0,
      contamination: 0,
      photos: [],
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      location: 'Gate 1',
      driverName: '',
      vehicleReg: '',
      notes: ''
    }
    setEditingWeighbridge(newTicket)
    setShowWeighbridgeForm(true)
    setShowMaterialPurchaseForm(true)
  }

  // Ensure form shows when editingWeighbridge exists
  useEffect(() => {
    if (editingWeighbridge && activeSection === 'material-purchases') {
      setShowMaterialPurchaseForm(true)
      setShowWeighbridgeForm(true)
    }
  }, [editingWeighbridge, activeSection])

  const handleEditWeighbridge = (ticket: WeighbridgeTicket) => {
    setEditingWeighbridge(ticket)
    setShowWeighbridgeForm(true)
  }

  const handleSaveWeighbridge = async () => {
    if (!editingWeighbridge) return
    const netWeight = editingWeighbridge.netWeight || (editingWeighbridge.grossWeight - editingWeighbridge.tareWeight)
    const updatedTicket = { ...editingWeighbridge, netWeight }
    const exists = weighbridgeTickets.some(t => t.id === updatedTicket.id)
    try {
      if (supabase) {
        const id = await accSb.upsertWeighbridgeTicket({
          id: exists ? updatedTicket.id : undefined,
          ticketNumber: updatedTicket.ticketNumber,
          supplierId: updatedTicket.supplierId || undefined,
          material: updatedTicket.material,
          grade: updatedTicket.grade,
          grossWeight: updatedTicket.grossWeight,
          tareWeight: updatedTicket.tareWeight,
          netWeight: updatedTicket.netWeight,
          contamination: updatedTicket.contamination,
          photos: updatedTicket.photos,
          status: updatedTicket.status,
          date: updatedTicket.date,
          location: updatedTicket.location,
          driverName: updatedTicket.driverName,
          vehicleReg: updatedTicket.vehicleReg,
          notes: updatedTicket.notes,
        })
        if (!exists) updatedTicket.id = id
      }
    } catch (e) {
      console.error(e)
    }
    if (exists) {
      setWeighbridgeTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t))
      toast({ title: "Weighbridge ticket updated", description: `Ticket ${updatedTicket.ticketNumber} has been updated.` })
    } else {
      setWeighbridgeTickets(prev => [...prev, updatedTicket])
      toast({ title: "Weighbridge ticket created", description: `Ticket ${updatedTicket.ticketNumber} has been created.` })
    }
    setShowWeighbridgeForm(false)
    setEditingWeighbridge(null)
  }

  const handleDeleteWeighbridge = (id: string) => {
    setDeleteConfirm({ open: true, type: 'weighbridge', id })
  }

  // ========== SUPPLIERS HANDLERS ==========
  const handleCreateSupplier = () => {
    const newSupplier: Supplier = {
      id: `sup-${Date.now()}`,
      name: '',
      contact: '',
      email: '',
      phone: '',
      idNumber: '',
      idType: 'id_number',
      address: '',
      bankDetails: '',
      kycStatus: 'pending',
      blacklistFlag: false,
      paymentMethod: 'cash',
      creditLimit: 0,
      totalPayouts: 0,
      lastPayment: new Date().toISOString(),
      status: 'active'
    }
    setEditingSupplier(newSupplier)
    setShowSupplierForm(true)
  }

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setShowSupplierForm(true)
  }

  const handleSaveSupplier = async () => {
    if (!editingSupplier) return
    const exists = suppliers.some(s => s.id === editingSupplier.id)
    const saved = { ...editingSupplier }
    try {
      if (supabase) {
        const id = await accSb.upsertSupplier({
          id: exists ? editingSupplier.id : undefined,
          name: editingSupplier.name,
          contact: editingSupplier.contact,
          email: editingSupplier.email,
          phone: editingSupplier.phone,
          idNumber: editingSupplier.idNumber,
          address: editingSupplier.address,
          bankDetails: editingSupplier.bankDetails,
          kycStatus: editingSupplier.kycStatus,
          blacklistFlag: editingSupplier.blacklistFlag,
          paymentMethod: editingSupplier.paymentMethod,
          creditLimit: editingSupplier.creditLimit,
          totalPayouts: editingSupplier.totalPayouts,
          lastPayment: editingSupplier.lastPayment,
          status: editingSupplier.status,
        })
        if (!exists) saved.id = id
      }
    } catch (e) {
      console.error(e)
    }
    if (exists) {
      setSuppliers(prev => prev.map(s => s.id === saved.id ? saved : s))
      toast({ title: "Supplier updated", description: `${saved.name} has been updated.` })
    } else {
      setSuppliers(prev => [...prev, saved])
      toast({ title: "Supplier created", description: `${saved.name} has been created.` })
    }
    setShowSupplierForm(false)
    setEditingSupplier(null)
  }

  const handleDeleteSupplier = (id: string) => {
    setDeleteConfirm({ open: true, type: 'supplier', id })
  }

  // ========== MATERIAL PRICING HANDLERS ==========
  const handleCreatePricing = () => {
    const newPricing: MaterialPricing = {
      id: `mp-${Date.now()}`,
      material: '',
      grade: 'A',
      basePrice: 0,
      moistureAdjustment: 0,
      contaminationDeduction: 0,
      priceTier: 'standard',
      effectiveDate: new Date().toISOString().split('T')[0],
      reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft',
      internalNotes: '',
    }
    setEditingPricing(newPricing)
    setShowPricingForm(true)
  }

  const handleEditPricing = (pricing: MaterialPricing) => {
    setEditingPricing(pricing)
    setShowPricingForm(true)
  }

  const handleSavePricing = async (status: MaterialPricing['status'] = 'draft') => {
    if (!editingPricing) return
    const pricingToSave: MaterialPricing = {
      ...editingPricing,
      status,
    }
    const exists = materialPricing.some(p => p.id === pricingToSave.id)
    const saved = { ...pricingToSave }
    try {
      if (supabase) {
        const id = await accSb.upsertMaterialPricing(pricingToSave)
        if (!exists) saved.id = id
      }
    } catch (e) {
      console.error(e)
    }
    if (exists) {
      setMaterialPricing(prev => prev.map(p => p.id === saved.id ? saved : p))
      toast({ title: "Pricing updated", description: `${saved.material} Grade ${saved.grade} pricing has been updated.` })
    } else {
      setMaterialPricing(prev => [...prev, saved])
      toast({ title: "Pricing created", description: `${saved.material} Grade ${saved.grade} pricing has been created.` })
    }
    setShowPricingForm(false)
    setEditingPricing(null)
  }

  const handleDeletePricing = (id: string) => {
    setDeleteConfirm({ open: true, type: 'pricing', id })
  }

  // ========== BALES & LOTS HANDLERS ==========
  const handleCreateBale = () => {
    const newBale: BaleLot = {
      id: `bl-${Date.now()}`,
      baleId: `BALE-${String(baleLots.length + 1).padStart(3, '0')}`,
      material: '',
      grade: 'A',
      weight: 0,
      density: 0,
      location: 'Warehouse A',
      supplierId: '',
      purchasePrice: 0,
      processingCost: 0,
      cogs: 0,
      shrinkage: 0,
      yield: 1,
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    }
    setEditingBale(newBale)
    setShowBaleForm(true)
  }

  const handleEditBale = (bale: BaleLot) => {
    setEditingBale(bale)
    setShowBaleForm(true)
  }

  const handleSaveBale = async () => {
    if (!editingBale) return
    const totalCost = editingBale.purchasePrice + editingBale.processingCost
    const cogs = editingBale.weight > 0 ? totalCost / editingBale.weight : 0
    const updatedBale = { ...editingBale, cogs }
    const exists = baleLots.some(b => b.id === updatedBale.id)
    try {
      if (supabase) {
        const id = await accSb.upsertBaleLot(updatedBale)
        if (!exists) updatedBale.id = id
      }
    } catch (e) {
      console.error(e)
    }
    if (exists) {
      setBaleLots(prev => prev.map(b => b.id === updatedBale.id ? updatedBale : b))
      toast({ title: "Bale updated", description: `${updatedBale.baleId} has been updated.` })
    } else {
      setBaleLots(prev => [...prev, updatedBale])
      toast({ title: "Bale created", description: `${updatedBale.baleId} has been created.` })
    }
    setShowBaleForm(false)
    setEditingBale(null)
  }

  const handleDeleteBale = (id: string) => {
    setDeleteConfirm({ open: true, type: 'bale', id })
  }

  // ========== INVOICES HANDLERS (Enhanced) ==========
  const handleCreateInvoice = () => {
    const newInvoice: Invoice = {
      id: `i-${Date.now()}`,
      number: generateInvoiceNumber(),
      client: '',
      amount: 0,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft',
      createdDate: new Date().toISOString().split('T')[0],
      description: '',
      tax: 0
    }
    setEditingInv(newInvoice)
    setShowInvoiceForm(true)
  }

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInv(invoice)
    setShowInvoiceForm(true)
  }

  const handleSaveInvoice = async () => {
    const inv =
      editingInv ||
      {
        id: `i-${Date.now()}`,
        number: generateInvoiceNumber(),
        client: '',
        amount: 0,
        tax: 0,
        dueDate: nowIso(),
        status: 'sent',
        createdDate: nowIso(),
        description: '',
      }
    const exists = invoices.some(i => i.id === inv.id)
    if (exists) {
      toast({ title: "Invoice updated", description: `${inv.number} has been updated.` })
    } else {
      toast({ title: "Invoice created", description: `${inv.number} has been created.` })
    }
    const lineItems = invoiceItemRows
      .filter(r => (r.quantity || 0) !== 0 || (r.unitPrice || 0) !== 0 || (r.description || '').trim() !== '')
      .map(r => ({
        description: r.description || "Item",
        quantity: r.quantity || 0,
        unitPrice: r.unitPrice || 0,
        amount: (r.quantity || 0) * (r.unitPrice || 0),
      }))
    await saveInv({ ...inv, amount: invoiceSubtotal, tax: invoiceTaxTotal, status: 'sent', lineItems })
    setShowInvoiceForm(false)
    setEditingInv(null)
    setInvoiceItemRows([{ id: `item-${Date.now()}`, description: '', quantity: 0, unitPrice: 0, taxPercent: 15 }])
  }

  // ========== COMPLIANCE FEES HANDLERS ==========
  const handleCreateCompliance = () => {
    const newFee: ComplianceFee = {
      id: `cf-${Date.now()}`,
      type: 'bottle_deposit',
      amount: 0,
      collected: 0,
      remitted: 0,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      chainOfCustody: []
    }
    setEditingCompliance(newFee)
    setShowComplianceForm(true)
  }

  const handleEditCompliance = (fee: ComplianceFee) => {
    setEditingCompliance(fee)
    setShowComplianceForm(true)
  }

  const handleSaveCompliance = async () => {
    if (!editingCompliance) return
    const exists = complianceFees.some(f => f.id === editingCompliance.id)
    const saved = { ...editingCompliance }
    try {
      if (supabase) {
        const id = await accSb.upsertComplianceFee(editingCompliance)
        if (!exists) saved.id = id
      }
    } catch (e) {
      console.error(e)
    }
    if (exists) {
      setComplianceFees(prev => prev.map(f => f.id === saved.id ? saved : f))
      toast({ title: "Compliance fee updated", description: "Compliance fee has been updated." })
    } else {
      setComplianceFees(prev => [...prev, saved])
      toast({ title: "Compliance fee created", description: "Compliance fee has been created." })
    }
    setShowComplianceForm(false)
    setEditingCompliance(null)
  }

  const handleDeleteCompliance = (id: string) => {
    setDeleteConfirm({ open: true, type: 'compliance', id })
  }

  // ========== LOGISTICS COSTS HANDLERS ==========
  const handleCreateLogistics = () => {
    const newCost: LogisticsCost = {
      id: `lc-${Date.now()}`,
      type: 'transport',
      amount: 0,
      vehicleReg: '',
      driverName: '',
      route: '',
      mileage: 0,
      loadPhotos: [],
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    }
    setEditingLogistics(newCost)
    setShowLogisticsForm(true)
  }

  const handleEditLogistics = (cost: LogisticsCost) => {
    setEditingLogistics(cost)
    setShowLogisticsForm(true)
  }

  const handleSaveLogistics = async () => {
    if (!editingLogistics) return
    const exists = logisticsCosts.some(c => c.id === editingLogistics.id)
    const saved = { ...editingLogistics }
    try {
      if (supabase) {
        const id = await accSb.upsertLogisticsCost(editingLogistics)
        if (!exists) saved.id = id
      }
    } catch (e) {
      console.error(e)
    }
    if (exists) {
      setLogisticsCosts(prev => prev.map(c => c.id === saved.id ? saved : c))
      toast({ title: "Logistics cost updated", description: "Logistics cost has been updated." })
    } else {
      setLogisticsCosts(prev => [...prev, saved])
      toast({ title: "Logistics cost created", description: "Logistics cost has been created." })
    }
    setShowLogisticsForm(false)
    setEditingLogistics(null)
  }

  const handleDeleteLogistics = (id: string) => {
    setDeleteConfirm({ open: true, type: 'logistics', id })
  }

  // ========== CASH DRAWER HANDLERS ==========
  const handleCreateCashDrawer = () => {
    const newDrawer: CashDrawer = {
      id: `cd-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      openingBalance: 0,
      closingBalance: 0,
      cashReceived: 0,
      cashPaid: 0,
      overShort: 0,
      bankDeposit: 0,
      depositSlip: '',
      reconciled: false,
      transactions: []
    }
    setEditingCashDrawer(newDrawer)
    setShowCashDrawerForm(true)
  }

  const handleEditCashDrawer = (drawer: CashDrawer) => {
    setEditingCashDrawer(drawer)
    setShowCashDrawerForm(true)
  }

  const handleSaveCashDrawer = async () => {
    if (!editingCashDrawer) return
    const calculatedClosing = editingCashDrawer.openingBalance + editingCashDrawer.cashReceived - editingCashDrawer.cashPaid
    const overShort = (editingCashDrawer.closingBalance ?? calculatedClosing) - calculatedClosing
    const updatedDrawer = { ...editingCashDrawer, closingBalance: calculatedClosing, overShort }
    const exists = cashDrawers.some(d => d.id === updatedDrawer.id)
    try {
      if (supabase) {
        const id = await accSb.upsertCashDrawer(updatedDrawer)
        if (!exists) updatedDrawer.id = id
      }
    } catch (e) {
      console.error(e)
    }
    if (exists) {
      setCashDrawers(prev => prev.map(d => d.id === updatedDrawer.id ? updatedDrawer : d))
      toast({ title: "Cash drawer updated", description: `Cash drawer for ${new Date(updatedDrawer.date).toLocaleDateString()} has been updated.` })
    } else {
      setCashDrawers(prev => [...prev, updatedDrawer])
      toast({ title: "Cash drawer created", description: `Cash drawer for ${new Date(updatedDrawer.date).toLocaleDateString()} has been created.` })
    }
    setShowCashDrawerForm(false)
    setEditingCashDrawer(null)
  }

  const handleDeleteCashDrawer = (id: string) => {
    setDeleteConfirm({ open: true, type: 'cashDrawer', id })
  }

  // ========== BANKING HANDLERS ==========
  const handleCreateBankAccount = () => {
    const newAccount: BankAccount = {
      id: `ba-${Date.now()}`,
      name: '',
      type: 'checking',
      balance: 0,
      bank: '',
      accountNumber: '',
      branchCode: '',
      swiftCode: '',
      openingBalance: 0,
      asOfDate: new Date().toISOString().split('T')[0],
      lastReconciled: '',
      reconciliationFrequency: 'monthly',
      internalNotes: '',
      status: 'draft',
    }
    setEditingBank(newAccount)
    setShowBankingForm(true)
  }

  const handleEditBankAccount = (account: BankAccount) => {
    setEditingBank(account)
    setShowBankingForm(true)
  }

  const handleSaveBankAccount = async (status: BankAccount['status'] = 'draft') => {
    if (!editingBank) return
    const acctToSave = { ...editingBank, status }
    const exists = bankAccounts.some(a => a.id === acctToSave.id)
    const saved = { ...acctToSave }
    try {
      if (supabase) {
        const id = await accSb.upsertBankAccount(acctToSave)
        if (!exists) saved.id = id
      }
    } catch (e) {
      console.error(e)
    }
    if (exists) {
      setBankAccounts(prev => prev.map(a => a.id === saved.id ? saved : a))
      toast({ title: "Bank account updated", description: `${saved.name} has been updated.` })
    } else {
      setBankAccounts(prev => [...prev, saved])
      toast({ title: "Bank account created", description: `${saved.name} has been created.` })
    }
    setShowBankingForm(false)
    setEditingBank(null)
  }

  const handleDeleteBankAccount = (id: string) => {
    setDeleteConfirm({ open: true, type: 'bankAccount', id })
  }

  // ========== VENDORS HANDLERS ==========
  const handleCreateVendor = () => {
    const newVendor: VendorCustomer = {
      id: `vc-${Date.now()}`,
      name: '',
      type: 'supplier',
      contact: '',
      email: '',
      phone: '',
      idNumber: '',
      address: '',
      kycStatus: 'pending',
      blacklistFlag: false,
      creditLimit: 0,
      paymentTerms: '30 days',
      exportDocs: [],
      incoterms: 'FOB',
      fxGains: 0,
      fxLosses: 0
    }
    setEditingVendor(newVendor)
    setShowVendorForm(true)
  }

  const handleEditVendor = (vendor: VendorCustomer) => {
    setEditingVendor(vendor)
    setShowVendorForm(true)
  }

  const handleSaveVendor = async () => {
    if (!editingVendor) return
    const exists = vendorCustomers.some(v => v.id === editingVendor.id)
    const saved = { ...editingVendor }
    try {
      if (supabase) {
        const id = await accSb.upsertVendorCustomer(editingVendor)
        if (!exists) saved.id = id
      }
    } catch (e) {
      console.error(e)
    }
    if (exists) {
      setVendorCustomers(prev => prev.map(v => v.id === saved.id ? saved : v))
      toast({ title: "Vendor updated", description: `${saved.name} has been updated.` })
    } else {
      setVendorCustomers(prev => [...prev, saved])
      toast({ title: "Vendor created", description: `${saved.name} has been created.` })
    }
    setShowVendorForm(false)
    setEditingVendor(null)
  }

  const handleDeleteVendor = (id: string) => {
    setDeleteConfirm({ open: true, type: 'vendor', id })
  }

  // ========== PAYMENTS HANDLERS ==========
  const handleCreatePayment = () => {
    const newPayment: Payment = {
      id: `p-${Date.now()}`,
      invoiceId: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      method: 'eft',
      status: 'pending',
      reference: '',
      bankAccountId: '',
      internalNotes: '',
      attachments: [],
    }
    setEditingPayment(newPayment)
    setShowPaymentForm(true)
  }

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment)
    setShowPaymentForm(true)
  }

  const handleSavePayment = async () => {
    if (!editingPayment) return
    const exists = payments.some(p => p.id === editingPayment.id)
    const saved = { ...editingPayment }
    try {
      if (supabase) {
        const id = await accSb.upsertPayment(editingPayment)
        if (!exists) saved.id = id
      }
    } catch (e) {
      console.error(e)
    }
    if (exists) {
      setPayments(prev => prev.map(p => p.id === saved.id ? saved : p))
      toast({ title: "Payment updated", description: "Payment has been updated." })
    } else {
      setPayments(prev => [...prev, saved])
      toast({ title: "Payment created", description: "Payment has been created." })
    }
    setShowPaymentForm(false)
    setEditingPayment(null)
  }

  const handleDeletePayment = (id: string) => {
    setDeleteConfirm({ open: true, type: 'payment', id })
  }

  const handleSaveBill = async () => {
    if (!editingBill || !editingBill.vendor?.trim()) return
    const payload = {
      id: editingBill.id,
      vendor: editingBill.vendor.trim(),
      amount: Number(editingBill.amount) || 0,
      dueDate: editingBill.dueDate || new Date().toISOString().split("T")[0],
      status: editingBill.status ?? "unpaid",
      description: editingBill.description ?? "",
      category: editingBill.category ?? "General",
    }
    try {
      const id = await accSb.upsertBill(payload)
      const saved: Bill = { ...payload, id: payload.id && /^[0-9a-f-]{36}$/i.test(payload.id) ? payload.id : id }
      const exists = bills.some(b => b.id === editingBill.id && /^[0-9a-f-]{36}$/i.test(editingBill.id))
      if (exists) {
        setBills(prev => prev.map(b => b.id === saved.id ? saved : b))
      } else {
        setBills(prev => [...prev.filter(b => b.id !== editingBill.id), saved])
      }
      setBillDialog(false)
      setEditingBill(null)
    } catch (e) {
      console.error(e)
      toast({ title: "Error", description: "Failed to save bill.", variant: "destructive" })
    }
  }

  const handleDeleteBill = (id: string) => {
    setDeleteConfirm({ open: true, type: "bill", id })
  }

  // ========== CHART OF ACCOUNTS HANDLERS ==========
  const handleCreateChartAccount = () => {
    const newAccount: ChartAccount = {
      id: `ca-${Date.now()}`,
      code: '',
      name: '',
      type: 'asset',
      balance: 0,
      description: ''
    }
    setEditingChart(newAccount)
    setShowChartForm(true)
  }

  const handleEditChartAccount = (account: ChartAccount) => {
    setEditingChart(account)
    setShowChartForm(true)
  }

  const handleSaveChartAccount = async () => {
    if (!editingChart) return
    const exists = chartAccounts.some(a => a.id === editingChart.id)
    const saved = { ...editingChart }
    try {
      if (supabase) {
        const id = await accSb.upsertChartAccount(editingChart)
        if (!exists) saved.id = id
      }
    } catch (e) {
      console.error(e)
    }
    if (exists) {
      setChartAccounts(prev => prev.map(a => a.id === saved.id ? saved : a))
      toast({ title: "Account updated", description: `${saved.name} (${saved.code}) has been updated.` })
    } else {
      setChartAccounts(prev => [...prev, saved])
      toast({ title: "Account created", description: `${saved.name} (${saved.code}) has been created.` })
    }
    setShowChartForm(false)
    setEditingChart(null)
  }

  const handleDeleteChartAccount = (id: string) => {
    setDeleteConfirm({ open: true, type: 'chartAccount', id })
  }

  // ========== DELETE CONFIRMATION HANDLER ==========
  const confirmDelete = async () => {
    if (!deleteConfirm.id) return
    const id = deleteConfirm.id
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    try {
      if (supabase && isUuid) {
        switch (deleteConfirm.type) {
          case 'weighbridge': await accSb.deleteWeighbridgeTicket(id); break
          case 'supplier': await accSb.deleteSupplier(id); break
          case 'pricing': await accSb.deleteMaterialPricing(id); break
          case 'bale': await accSb.deleteBaleLot(id); break
          case 'compliance': await accSb.deleteComplianceFee(id); break
          case 'logistics': await accSb.deleteLogisticsCost(id); break
          case 'cashDrawer': await accSb.deleteCashDrawer(id); break
          case 'bankAccount': await accSb.deleteBankAccount(id); break
          case 'vendor': await accSb.deleteVendorCustomer(id); break
          case 'payment': await accSb.deletePayment(id); break
          case 'bill': await accSb.deleteBill(id); break
          case 'chartAccount': await accSb.deleteChartAccount(id); break
        }
      }
    } catch (e) {
      console.error(e)
    }
    switch (deleteConfirm.type) {
      case 'weighbridge':
        setWeighbridgeTickets(prev => prev.filter(t => t.id !== id))
        toast({ title: "Deleted", description: "Weighbridge ticket has been deleted." })
        break
      case 'supplier':
        setSuppliers(prev => prev.filter(s => s.id !== id))
        toast({ title: "Deleted", description: "Supplier has been deleted." })
        break
      case 'pricing':
        setMaterialPricing(prev => prev.filter(p => p.id !== id))
        toast({ title: "Deleted", description: "Material pricing has been deleted." })
        break
      case 'bale':
        setBaleLots(prev => prev.filter(b => b.id !== id))
        toast({ title: "Deleted", description: "Bale lot has been deleted." })
        break
      case 'compliance':
        setComplianceFees(prev => prev.filter(f => f.id !== id))
        toast({ title: "Deleted", description: "Compliance fee has been deleted." })
        break
      case 'logistics':
        setLogisticsCosts(prev => prev.filter(c => c.id !== id))
        toast({ title: "Deleted", description: "Logistics cost has been deleted." })
        break
      case 'cashDrawer':
        setCashDrawers(prev => prev.filter(d => d.id !== id))
        toast({ title: "Deleted", description: "Cash drawer has been deleted." })
        break
      case 'bankAccount':
        setBankAccounts(prev => prev.filter(a => a.id !== id))
        toast({ title: "Deleted", description: "Bank account has been deleted." })
        break
      case 'vendor':
        setVendorCustomers(prev => prev.filter(v => v.id !== id))
        toast({ title: "Deleted", description: "Vendor/Customer has been deleted." })
        break
      case 'payment':
        setPayments(prev => prev.filter(p => p.id !== id))
        toast({ title: "Deleted", description: "Payment has been deleted." })
        break
      case 'bill':
        setBills(prev => prev.filter(b => b.id !== id))
        toast({ title: "Deleted", description: "Bill has been deleted." })
        break
      case 'chartAccount':
        setChartAccounts(prev => prev.filter(a => a.id !== id))
        toast({ title: "Deleted", description: "Chart account has been deleted." })
        break
      case 'invoice':
        deleteInv(deleteConfirm.id)
        toast({ title: "Deleted", description: "Invoice has been deleted." })
        break
    }
    
    setDeleteConfirm({ open: false, type: '', id: null })
  }

  return (
    <div className="h-full flex bg-white">
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full w-full relative z-20">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-gray-200 flex-shrink-0 shadow-sm sticky top-0 z-50">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Image
                  src={SebenzaLogo}
                  alt="Sebenza Nathi Waste"
                  className="h-8 w-auto"
                  priority
                />
                <span className="font-semibold text-gray-800 tracking-wide">
                  Sebenza Nathi Waste – Financial System
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between px-6 pb-3 pt-0">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              <Button
                variant="ghost"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeSection === 'dashboard' 
                    ? 'bg-orange-500 text-white shadow-md hover:bg-orange-600' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => handleSectionClick('dashboard')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeSection === 'documents' 
                    ? 'bg-orange-500 text-white shadow-md hover:bg-orange-600' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => handleSectionClick('documents')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Files & Docs
              </Button>
              {/* Shortcuts to key financial tabs in this page */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="px-4 py-2 rounded-lg font-medium transition-all text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  >
                    Financial Pages
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 mt-2 shadow-lg border border-gray-200 rounded-lg">
                  <DropdownMenuItem
                    onClick={() => {
                      handleSectionClick('invoices')
                      setOpenDropdown(null)
                    }}
                    className="cursor-pointer"
                  >
                    Accounts Receivable – Invoices
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      handleSectionClick('payments')
                      setOpenDropdown(null)
                    }}
                    className="cursor-pointer"
                  >
                    Accounts Receivable – Payments
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      handleSectionClick('material-purchases')
                      setOpenDropdown(null)
                    }}
                    className="cursor-pointer"
                  >
                    Accounts Payable – Material Purchases / POs
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      handleSectionClick('suppliers')
                      setOpenDropdown(null)
                    }}
                    className="cursor-pointer"
                  >
                    Accounts Payable – Suppliers
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      handleSectionClick('banking')
                      setOpenDropdown(null)
                    }}
                    className="cursor-pointer"
                  >
                    Cash &amp; Bank – Banking / Reco
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      handleSectionClick('cash-drawer')
                      setOpenDropdown(null)
                    }}
                    className="cursor-pointer"
                  >
                    Cash &amp; Bank – Cash Drawer
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      router.push("/payroll/disburse")
                      setOpenDropdown(null)
                    }}
                    className="cursor-pointer"
                  >
                    Payroll - Run Business Payroll
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      handleSectionClick('reports')
                      setOpenDropdown(null)
                    }}
                    className="cursor-pointer"
                  >
                    Reports – Financial &amp; Impact
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {navigationSections.map((section) => {
                const isActive = section.items.some(item => item.key === activeSection)
                return (
                  <DropdownMenu key={section.key} open={openDropdown === section.key} onOpenChange={(open) => setOpenDropdown(open ? section.key : null)}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          isActive
                            ? 'bg-orange-500 text-white shadow-md hover:bg-orange-600' 
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        {section.label}
                        <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${openDropdown === section.key ? 'rotate-180' : ''}`} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64 mt-2 shadow-lg border border-gray-200 rounded-lg">
                      {section.items.map((item) => {
                        const Icon = item.icon
                        const itemIsActive = activeSection === item.key
                        return (
                          <DropdownMenuItem
                            key={item.key}
                            onClick={() => {
                              handleSectionClick(item.key)
                              setOpenDropdown(null)
                            }}
                            className={`cursor-pointer px-4 py-2.5 transition-colors ${
                              itemIsActive 
                                ? 'bg-orange-50 text-orange-600 font-medium border-l-2 border-orange-500' 
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <Icon className={`h-4 w-4 mr-3 ${itemIsActive ? 'text-orange-600' : 'text-gray-500'}`} />
                            <span>{item.label}</span>
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              })}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-md px-4 py-2 rounded-lg font-medium">
                    <Plus className="h-4 w-4 mr-2" />
                    Quick Add
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => { openCreateInv(); setOpenDropdown(null) }}>
                    <FileText className="h-4 w-4 mr-2" />
                    New Invoice
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setQuickEntryType('expense'); setShowQuickEntryDialog(true); setOpenDropdown(null) }}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Quick Expense
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setQuickEntryType('payment'); setShowQuickEntryDialog(true); setOpenDropdown(null) }}>
                    <Receipt className="h-4 w-4 mr-2" />
                    Quick Payment
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setQuickEntryType('weighbridge'); setShowQuickEntryDialog(true); setOpenDropdown(null) }}>
                    <Truck className="h-4 w-4 mr-2" />
                    Weighbridge Entry
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" onClick={handleExportSectionPdf} className="px-4 py-2 rounded-lg font-medium border-gray-300 hover:bg-gray-50">
                <FileText className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" onClick={handleExport} className="px-4 py-2 rounded-lg font-medium border-gray-300 hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          {/* Page Title Bar */}
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100">
            <h1 className="text-2xl font-bold text-gray-800">
              {activeSection === 'dashboard' && 'Dashboard'}
              {activeSection === 'material-purchases' && 'Material Purchases'}
              {activeSection === 'weighbridge' && 'Weighbridge Tickets'}
              {activeSection === 'suppliers' && 'Suppliers'}
              {activeSection === 'pricing' && 'Material Pricing'}
              {activeSection === 'inventory' && 'Inventory Management'}
              {activeSection === 'bales' && 'Bales & Lots'}
              {activeSection === 'invoices' && 'Invoices'}
              {activeSection === 'compliance' && 'Compliance & Fees'}
              {activeSection === 'logistics' && 'Logistics & Haulage'}
              {activeSection === 'cash-drawer' && 'Cash Drawer'}
              {activeSection === 'banking' && 'Banking & Accounts'}
              {activeSection === 'vendors' && 'Vendors & Customers'}
              {activeSection === 'bills' && 'Bills'}
              {activeSection === 'payments' && 'Payments'}
              {activeSection === 'reports' && 'Reports & Analytics'}
              {activeSection === 'ocr' && 'OCR & Scale Integration'}
              {activeSection === 'chart-of-accounts' && 'Chart of Accounts'}
              {activeSection === 'settings' && 'General Settings'}
              {activeSection === 'documents' && 'Files & Documents'}
            </h1>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto bg-gray-50">
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Enhanced KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                {/* Material Purchases */}
                <Card className="overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card to-card/80 shadow-card hover:shadow-lg transition-all dark:border-white/10 dark:bg-sidebar-accent dark:from-sidebar-accent dark:to-sidebar-accent/80 relative border-l-4 border-l-orange-500">
                  {/* Colored header accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-orange-500" />
                  <CardContent className="p-6 pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Material Purchases</p>
                        <p className="text-2xl font-bold text-gray-800">R{weighbridgeTickets.reduce((sum, t) => sum + (t.netWeight * 50), 0).toLocaleString('en-US')}</p>
                        <p className="text-sm text-gray-500">This month</p>
                      </div>
                      <div className="p-3 bg-orange-100 rounded-full">
                        <Package className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sales Revenue */}
                <Card className="border-l-4 border-l-green-500 bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Sales Revenue</p>
                        <p className="text-2xl font-bold text-gray-800">R{revenue.toLocaleString('en-US')}</p>
                        <p className="text-sm text-gray-500">Paid invoices</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-full">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cash on Hand */}
                <Card className="border-l-4 border-l-blue-500 bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Cash on Hand</p>
                        <p className="text-2xl font-bold text-gray-800">R{cashDrawers.reduce((sum, d) => sum + d.closingBalance, 0).toLocaleString('en-US')}</p>
                        <p className="text-sm text-gray-500">Cash drawer total</p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-full">
                        <Banknote className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bank Balance */}
                <Card className="border-l-4 border-l-purple-500 bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Bank Balance</p>
                        <p className="text-2xl font-bold text-gray-800">R{bankBalance.toLocaleString('en-US')}</p>
                        <p className="text-sm text-gray-500">Total across accounts</p>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-full">
                        <Building2 className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Outstanding Invoices */}
                <Card className="border-l-4 border-l-yellow-500 bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Outstanding</p>
                        <p className="text-2xl font-bold text-gray-800">R{outstanding.toLocaleString('en-US')}</p>
                        <p className="text-sm text-gray-500">Unpaid invoices</p>
                      </div>
                      <div className="p-3 bg-yellow-100 rounded-full">
                        <FileText className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Compliance Fees */}
                <Card className="border-l-4 border-l-red-500 bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Compliance Fees</p>
                        <p className="text-2xl font-bold text-gray-800">R{complianceFees.reduce((sum, f) => sum + f.collected, 0).toLocaleString('en-US')}</p>
                        <p className="text-sm text-gray-500">Collected this month</p>
                      </div>
                      <div className="p-3 bg-red-100 rounded-full">
                        <Shield className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Material Purchases Trend Chart */}
                <Card className="bg-white border-gray-200 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <TrendingUp className="h-5 w-5" />
                      Material Purchases Trend
                    </CardTitle>
                    <CardDescription className="text-gray-600">Monthly material purchase volume</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Chart visualization would go here</p>
                        <p className="text-sm text-gray-500">Material purchases: {weighbridgeTickets.reduce((sum, t) => sum + t.netWeight, 0)} kg</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Inventory vs Bales Chart */}
                <Card className="bg-white border-gray-200 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <Package className="h-5 w-5" />
                      Inventory vs Bales & Lots
                    </CardTitle>
                    <CardDescription className="text-gray-600">Current inventory levels by material</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Chart visualization would go here</p>
                        <p className="text-sm text-gray-500">Total bales: {baleLots.length}, Total weight: {baleLots.reduce((sum, b) => sum + b.weight, 0)} kg</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Cashflow Chart */}
              <Card className="bg-white border-gray-200 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <BarChart3 className="h-5 w-5" />
                    Cashflow Analysis
                  </CardTitle>
                  <CardDescription className="text-gray-600">Cash in vs cash out this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center">
                    <div className="text-center">
                      <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Chart visualization would go here</p>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="text-center">
                          <p className="text-green-600 font-semibold">R{revenue.toLocaleString('en-US')}</p>
                          <p className="text-sm text-gray-600">Cash In</p>
                        </div>
                        <div className="text-center">
                          <p className="text-red-600 font-semibold">R{spend.toLocaleString('en-US')}</p>
                          <p className="text-sm text-gray-600">Cash Out</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dashboard Widgets */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Invoices */}
                <Card className="bg-white border-gray-200 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <Clock className="h-5 w-5" />
                      Recent Invoices
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {invoices.slice(0, 5).map(invoice => (
                        <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-full">
                              <FileText className="h-4 w-4 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{invoice.number}</p>
                              <p className="text-sm text-gray-600">{invoice.client}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-800">R{invoice.amount.toLocaleString()}</p>
                            <Badge className={statusColor(invoice.status)}>{invoice.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Compliance Deadlines */}
                <Card className="bg-white border-gray-200 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <AlertCircle className="h-5 w-5" />
                      Compliance Deadlines
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {complianceFees.filter(f => f.status === 'pending').slice(0, 5).map(fee => (
                        <div key={fee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-full">
                              <Shield className="h-4 w-4 text-red-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 capitalize">{fee.type.replace('_', ' ')}</p>
                              <p className="text-sm text-gray-600">Due: {new Date(fee.dueDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-800">R{fee.collected.toLocaleString()}</p>
                            <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Vendor Payments Due */}
                <Card className="bg-white border-gray-200 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <Users className="h-5 w-5" />
                      Vendor Payments Due
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {bills.filter(b => b.status === 'unpaid').slice(0, 5).map(bill => (
                        <div key={bill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <Receipt className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{bill.vendor}</p>
                              <p className="text-sm text-gray-600">{bill.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-800">R{bill.amount.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">
                              Due {new Date(bill.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'material-purchases' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Material Purchases</h2>
                <Button 
                  className="bg-orange-500 hover:bg-orange-600 text-white shadow-md"
                  onClick={handleCreateWeighbridge}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Purchase
                </Button>
              </div>

              {/* Zoho Books Style Form - Only show when creating/editing */}
              {(showMaterialPurchaseForm || showWeighbridgeForm || editingWeighbridge) && (
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader className="border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-800">{editingWeighbridge ? `Edit Material Purchase ${editingWeighbridge.ticketNumber}` : 'New Material Purchase'}</CardTitle>
                      <CardDescription className="text-gray-600">Create a new material purchase order</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="border-gray-300 text-gray-700" onClick={handleCancelForm}>
                        Cancel
                      </Button>
                      <Button variant="outline" className="border-orange-300 text-orange-700" onClick={handleSaveDraft}>
                        Save Draft
                      </Button>
                      <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleSaveWeighbridge}>
                        Save & Send
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  {/* Tabbed Form Interface */}
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 bg-gray-50 border-b border-gray-200 rounded-none">
                      <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Details</TabsTrigger>
                      <TabsTrigger value="items" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Items</TabsTrigger>
                      <TabsTrigger value="taxes" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Taxes</TabsTrigger>
                      <TabsTrigger value="attachments" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Attachments</TabsTrigger>
                      <TabsTrigger value="notes" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Notes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="p-6 space-y-6">
                      {/* Vendor Information Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Vendor Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Supplier *</Label>
                            <Select 
                              value={editingWeighbridge?.supplierId || ''}
                              onValueChange={(value) => {
                                if (!editingWeighbridge) {
                                  handleCreateWeighbridge()
                                  setEditingWeighbridge(prev => prev ? { ...prev, supplierId: value } : null)
                                } else {
                                  setEditingWeighbridge({ ...editingWeighbridge, supplierId: value })
                                }
                              }}
                            >
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm text-gray-900">
                                <SelectValue placeholder="Select supplier" />
                              </SelectTrigger>
                              <SelectContent>
                                {suppliers.map(supplier => (
                                  <SelectItem key={supplier.id} value={supplier.id}>
                                    {supplier.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Purchase Order #</Label>
                            <Input 
                              placeholder="PO-2024-001" 
                              className="bg-white border-gray-300 shadow-sm text-gray-900"
                              value={editingWeighbridge?.ticketNumber || ''}
                              onChange={(e) => {
                                if (!editingWeighbridge) {
                                  handleCreateWeighbridge()
                                  setTimeout(() => {
                                    const ticket: WeighbridgeTicket = {
                                      id: `wb-${Date.now()}`,
                                      ticketNumber: e.target.value,
                                      supplierId: '',
                                      material: '',
                                      grade: 'A',
                                      grossWeight: 0,
                                      tareWeight: 0,
                                      netWeight: 0,
                                      contamination: 0,
                                      photos: [],
                                      status: 'pending',
                                      date: new Date().toISOString().split('T')[0],
                                      location: 'Gate 1',
                                      driverName: '',
                                      vehicleReg: '',
                                      notes: ''
                                    }
                                    setEditingWeighbridge(ticket)
                                  }, 0)
                                } else {
                                  setEditingWeighbridge({ ...editingWeighbridge, ticketNumber: e.target.value })
                                }
                              }}
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Date *</Label>
                            <Input 
                              type="date" 
                              className="bg-white border-gray-300 shadow-sm text-gray-900"
                              value={editingWeighbridge?.date || new Date().toISOString().split('T')[0]}
                              onChange={(e) => {
                                if (!editingWeighbridge) {
                                  handleCreateWeighbridge()
                                  setTimeout(() => {
                                    setEditingWeighbridge(prev => prev ? { ...prev, date: e.target.value } : null)
                                  }, 0)
                                } else {
                                  setEditingWeighbridge({ ...editingWeighbridge, date: e.target.value })
                                }
                              }}
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Due Date</Label>
                            <Input 
                              type="date" 
                              className="bg-white border-gray-300 shadow-sm text-gray-900"
                              value={editingWeighbridge?.date || ''}
                              onChange={(e) => {
                                if (!editingWeighbridge) {
                                  handleCreateWeighbridge()
                                  setTimeout(() => {
                                    setEditingWeighbridge(prev => prev ? { ...prev, date: e.target.value } : null)
                                  }, 0)
                                } else {
                                  setEditingWeighbridge({ ...editingWeighbridge, date: e.target.value })
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Payment Information Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Payment Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Payment Terms</Label>
                            <Select>
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select payment terms" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="net15">Net 15 days</SelectItem>
                                <SelectItem value="net30">Net 30 days</SelectItem>
                                <SelectItem value="net60">Net 60 days</SelectItem>
                                <SelectItem value="cod">Cash on Delivery</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Payment Method</Label>
                            <Select>
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="eft">EFT</SelectItem>
                                <SelectItem value="cheque">Cheque</SelectItem>
                                <SelectItem value="card">Credit Card</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="items" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Purchase Items</h3>
                        
                        {/* Items Table */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Material</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Quantity</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Unit Price</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tax %</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700"></th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              <tr>
                                <td className="px-4 py-3">
                                  <Select>
                                    <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                      <SelectValue placeholder="Select material" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Aluminium Cans">Aluminium Cans</SelectItem>
                                      <SelectItem value="Cardboard">Cardboard</SelectItem>
                                      <SelectItem value="Glass">Glass</SelectItem>
                                      <SelectItem value="Glass Bottles">Glass Bottles</SelectItem>
                                      <SelectItem value="HDPE Containers">HDPE Containers</SelectItem>
                                      <SelectItem value="Paper">Paper</SelectItem>
                                      <SelectItem value="PET Bottles">PET Bottles</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </td>
                                <td className="px-4 py-3">
                                  <Input type="number" placeholder="0" className="bg-white border-gray-300 shadow-sm" />
                                </td>
                                <td className="px-4 py-3">
                                  <Input type="number" placeholder="0.00" className="bg-white border-gray-300 shadow-sm" />
                                </td>
                                <td className="px-4 py-3">
                                  <Input type="number" placeholder="15" className="bg-white border-gray-300 shadow-sm" />
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-gray-800 font-medium">R0.00</span>
                                </td>
                                <td className="px-4 py-3">
                                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        
                        <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="taxes" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Tax Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Tax Type</Label>
                            <Select>
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select tax type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="vat">VAT (15%)</SelectItem>
                                <SelectItem value="zero">Zero Rated</SelectItem>
                                <SelectItem value="exempt">Exempt</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Tax Amount</Label>
                            <Input placeholder="0.00" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="attachments" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Attachments</h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <div className="space-y-2">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                            <p className="text-gray-600">Drop files here or click to upload</p>
                            <p className="text-sm text-gray-500">Supports: PDF, JPG, PNG (Max 10MB)</p>
                            <input
                              id="weighbridge-attachments-input"
                              type="file"
                              multiple
                              accept=".pdf,.png,.jpg,.jpeg"
                              className="hidden"
                              onChange={async (e) => {
                                if (!editingWeighbridge) return
                                const urls = await uploadToStorage({ section: "weighbridge", recordId: editingWeighbridge.id, files: e.target.files })
                                if (urls.length) {
                                  setEditingWeighbridge((prev) => (prev ? { ...prev, photos: [...(prev.photos || []), ...urls] } : prev))
                                  toast({ title: "Uploaded", description: `${urls.length} file(s) attached.` })
                                }
                                e.currentTarget.value = ""
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="border-orange-300 text-orange-700 hover:bg-orange-50"
                              disabled={uploading.busy && uploading.section === "weighbridge"}
                              onClick={() => {
                                const el = document.getElementById("weighbridge-attachments-input") as HTMLInputElement | null
                                el?.click()
                              }}
                            >
                              {uploading.busy && uploading.section === "weighbridge" ? "Uploading..." : "Choose Files"}
                            </Button>
                          </div>
                        </div>

                        {!!(editingWeighbridge?.photos?.length) && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-700">Attached</h4>
                            <div className="space-y-2">
                              {editingWeighbridge.photos.map((u, idx) => (
                                <div key={`${u}-${idx}`} className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2">
                                  <a href={u} target="_blank" rel="noreferrer" className="text-sm text-orange-700 hover:underline truncate max-w-[70%]">
                                    {u.split("/").pop()}
                                  </a>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() =>
                                      setEditingWeighbridge((prev) =>
                                        prev ? { ...prev, photos: prev.photos.filter((_, i) => i !== idx) } : prev
                                      )
                                    }
                                  >
                                    Remove
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="notes" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Notes & Terms</h3>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Internal Notes</Label>
                            <textarea 
                              className="w-full mt-1 p-3 border border-gray-300 rounded-md bg-white shadow-sm"
                              rows={4}
                              placeholder="Add internal notes for this purchase..."
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Terms & Conditions</Label>
                            <textarea 
                              className="w-full mt-1 p-3 border border-gray-300 rounded-md bg-white shadow-sm"
                              rows={3}
                              placeholder="Add terms and conditions..."
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              )}

              {/* Recent Purchases - Spreadsheet Style Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Recent Purchases</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700" onClick={handleExport}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>

                <Card className="bg-white border-gray-200 shadow-md">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Ticket #</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Material</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Grade</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Supplier</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Net Weight (kg)</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Contamination (kg)</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Purchase Value</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Driver</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Vehicle</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {weighbridgeTickets.map((ticket, index) => (
                          <tr 
                            key={ticket.id} 
                            className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-gray-800 border-r border-gray-200">
                              {ticket.ticketNumber}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {ticket.material}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {ticket.grade}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {ticket.supplierId}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-right">
                              {ticket.netWeight.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-right">
                              {ticket.contamination.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-800 border-r border-gray-200 text-right">
                              R{(ticket.netWeight * 50).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {ticket.driverName}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {ticket.vehicleReg}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {new Date(ticket.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm border-r border-gray-200">
                              <Badge className={`${
                                ticket.status === 'weighed' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : ticket.status === 'processed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {ticket.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-gray-600 hover:text-gray-800"
                                  onClick={() => handleEditWeighbridge(ticket)}
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-600 hover:text-red-800"
                                  onClick={() => handleDeleteWeighbridge(ticket.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Table Footer with Summary */}
                  <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-6">
                        <span>Total Records: {weighbridgeTickets.length}</span>
                        <span>Total Weight: {weighbridgeTickets.reduce((sum, t) => sum + t.netWeight, 0).toLocaleString()} kg</span>
                        <span>Total Value: R{weighbridgeTickets.reduce((sum, t) => sum + (t.netWeight * 50), 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                          Previous
                        </Button>
                        <span className="px-3 py-1 text-sm">Page 1 of 1</span>
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'inventory' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Inventory Management</h2>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-gray-300 text-gray-700" onClick={handleRefresh}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-md">
                    <Plus className="h-4 w-4 mr-2" />
                    Adjust Stock
                  </Button>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border-gray-200 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Materials</p>
                        <p className="text-2xl font-bold text-gray-800">{baleLots.length}</p>
                        <p className="text-sm text-gray-500">Active lots</p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-full">
                        <Package className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-gray-200 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Weight</p>
                        <p className="text-2xl font-bold text-gray-800">{baleLots.reduce((sum, b) => sum + b.weight, 0)} kg</p>
                        <p className="text-sm text-gray-500">In inventory</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-full">
                        <Target className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-gray-200 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Low Stock Alerts</p>
                        <p className="text-2xl font-bold text-gray-800">{baleLots.filter(b => b.weight < 1000).length}</p>
                        <p className="text-sm text-gray-500">Items below threshold</p>
                      </div>
                      <div className="p-3 bg-red-100 rounded-full">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Zoho Books Style Form */}
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader className="border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-800">Stock Adjustment</CardTitle>
                      <CardDescription className="text-gray-600">Adjust inventory levels for materials</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="border-gray-300 text-gray-700">
                        Cancel
                      </Button>
                      <Button variant="outline" className="border-orange-300 text-orange-700">
                        Save Draft
                      </Button>
                      <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                        Save & Apply
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 bg-gray-50 border-b border-gray-200 rounded-none">
                      <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Details</TabsTrigger>
                      <TabsTrigger value="items" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Items</TabsTrigger>
                      <TabsTrigger value="location" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Location</TabsTrigger>
                      <TabsTrigger value="valuation" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Valuation</TabsTrigger>
                      <TabsTrigger value="notes" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Notes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="p-6 space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Adjustment Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Adjustment Type *</Label>
                            <Select>
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="add">Add Stock</SelectItem>
                                <SelectItem value="remove">Remove Stock</SelectItem>
                                <SelectItem value="transfer">Transfer</SelectItem>
                                <SelectItem value="correction">Correction</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Date *</Label>
                            <Input type="date" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Reference Number</Label>
                            <Input placeholder="REF-2024-001" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Reason</Label>
                            <Input placeholder="Enter reason" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="items" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Items to Adjust</h3>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Bale ID</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Material</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Current Weight</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Adjustment</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">New Weight</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700"></th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              <tr>
                                <td className="px-4 py-3">
                                  <Input placeholder="BALE-001" className="bg-white border-gray-300 shadow-sm" />
                                </td>
                                <td className="px-4 py-3">
                                  <Select>
                                    <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                      <SelectValue placeholder="Select material" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Aluminium Cans">Aluminium Cans</SelectItem>
                                      <SelectItem value="Cardboard">Cardboard</SelectItem>
                                      <SelectItem value="Glass">Glass</SelectItem>
                                      <SelectItem value="Glass Bottles">Glass Bottles</SelectItem>
                                      <SelectItem value="HDPE Containers">HDPE Containers</SelectItem>
                                      <SelectItem value="Paper">Paper</SelectItem>
                                      <SelectItem value="PET Bottles">PET Bottles</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </td>
                                <td className="px-4 py-3">
                                  <Input type="number" placeholder="0" className="bg-white border-gray-300 shadow-sm" disabled />
                                </td>
                                <td className="px-4 py-3">
                                  <Input type="number" placeholder="0" className="bg-white border-gray-300 shadow-sm" />
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-gray-800 font-medium">0 kg</span>
                                </td>
                                <td className="px-4 py-3">
                                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="location" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Location Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">From Location</Label>
                            <Select>
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select location" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="warehouse">Warehouse A</SelectItem>
                                <SelectItem value="gate1">Gate 1</SelectItem>
                                <SelectItem value="gate2">Gate 2</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">To Location</Label>
                            <Select>
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select location" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="warehouse">Warehouse A</SelectItem>
                                <SelectItem value="gate1">Gate 1</SelectItem>
                                <SelectItem value="gate2">Gate 2</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="valuation" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Valuation</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Purchase Price (R)</Label>
                            <Input type="number" placeholder="0.00" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Processing Cost (R)</Label>
                            <Input type="number" placeholder="0.00" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">COGS per kg (R)</Label>
                            <Input type="number" placeholder="0.00" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="notes" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Notes</h3>
                        <div>
                          <Label className="text-gray-700 font-medium">Internal Notes</Label>
                          <Textarea 
                            className="w-full mt-1 border-gray-300 shadow-sm"
                            rows={4}
                            placeholder="Add notes about this adjustment..."
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Inventory Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Current Inventory</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700" onClick={handleExport}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>

                <Card className="bg-white border-gray-200 shadow-md">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Bale ID</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Material</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Grade</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Weight (kg)</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Density (kg/m³)</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Location</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Purchase Price</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Processing Cost</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">COGS</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {baleLots.map((bale, index) => (
                          <tr 
                            key={bale.id} 
                            className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-gray-800 border-r border-gray-200">
                              {bale.baleId}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {bale.material}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {bale.grade}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-right">
                              {bale.weight.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-right">
                              {bale.density.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {bale.location}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-right">
                              R{bale.purchasePrice.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-right">
                              R{bale.processingCost.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-800 border-r border-gray-200 text-right">
                              R{bale.cogs.toFixed(2)}/kg
                            </td>
                            <td className="px-4 py-3 text-sm border-r border-gray-200">
                              <Badge className={`${
                                bale.status === 'processed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : bale.status === 'sold' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {bale.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-600 hover:text-gray-800"
                                  title="Delete"
                                  onClick={() => setDeleteConfirm({ open: true, type: 'bale', id: bale.id })}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-6">
                        <span>Total Records: {baleLots.length}</span>
                        <span>Total Weight: {baleLots.reduce((sum, b) => sum + b.weight, 0).toLocaleString()} kg</span>
                        <span>Total Value: R{baleLots.reduce((sum, b) => sum + b.purchasePrice, 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                          Previous
                        </Button>
                        <span className="px-3 py-1 text-sm">Page 1 of 1</span>
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'banking' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Banking & Accounts</h2>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-gray-300 text-gray-700">
                    <Download className="h-4 w-4 mr-2" />
                    Import Statement
                  </Button>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-md" onClick={handleCreateBankAccount}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Account
                  </Button>
                </div>
              </div>

              {/* Cash Flow Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border-gray-200 shadow-md">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">Total Bank Balance</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2">R{bankBalance.toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200 shadow-md">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">Cash on Hand</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2">R{cashDrawers.reduce((sum, d) => sum + d.closingBalance, 0).toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white border-gray-200 shadow-md">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">Net Cash Position</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2">R{(bankBalance + cashDrawers.reduce((sum, d) => sum + d.closingBalance, 0)).toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Zoho Books Style Form */}
              {(showBankingForm || editingBank) && (
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader className="border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-800">{editingBank?.name ? `Edit Bank Account – ${editingBank.name}` : "New Bank Account"}</CardTitle>
                      <CardDescription className="text-gray-600">Add a new bank account for tracking</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="border-gray-300 text-gray-700"
                        onClick={() => {
                          setShowBankingForm(false)
                          setEditingBank(null)
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="outline"
                        className="border-orange-300 text-orange-700"
                        onClick={() => handleSaveBankAccount('draft')}
                        disabled={!editingBank}
                      >
                        Save Draft
                      </Button>
                      <Button
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={() => handleSaveBankAccount('active')}
                        disabled={!editingBank}
                      >
                        Save & Activate
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 bg-gray-50 border-b border-gray-200 rounded-none">
                      <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Details</TabsTrigger>
                      <TabsTrigger value="banking" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Banking</TabsTrigger>
                      <TabsTrigger value="balance" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Balance</TabsTrigger>
                      <TabsTrigger value="reconciliation" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Reconciliation</TabsTrigger>
                      <TabsTrigger value="notes" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Notes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="p-6 space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Account Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Account Name *</Label>
                            <Input
                              placeholder="Main Operating Account"
                              className="bg-white border-gray-300 shadow-sm"
                              value={editingBank?.name || ""}
                              onChange={(e) => setEditingBank((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Account Type *</Label>
                            <Select
                              value={editingBank?.type || "checking"}
                              onValueChange={(v) => setEditingBank((prev) => (prev ? { ...prev, type: v as BankAccount["type"] } : prev))}
                            >
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select account type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="checking">Checking</SelectItem>
                                <SelectItem value="savings">Savings</SelectItem>
                                <SelectItem value="credit">Credit</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="banking" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Banking Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Bank Name *</Label>
                            <Input
                              placeholder="Enter bank name"
                              className="bg-white border-gray-300 shadow-sm"
                              value={editingBank?.bank || ""}
                              onChange={(e) => setEditingBank((prev) => (prev ? { ...prev, bank: e.target.value } : prev))}
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Account Number *</Label>
                            <Input
                              placeholder="Enter account number"
                              className="bg-white border-gray-300 shadow-sm"
                              value={editingBank?.accountNumber || ""}
                              onChange={(e) =>
                                setEditingBank((prev) => (prev ? { ...prev, accountNumber: e.target.value } : prev))
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Branch Code</Label>
                            <Input
                              placeholder="Enter branch code"
                              className="bg-white border-gray-300 shadow-sm"
                              value={editingBank?.branchCode || ""}
                              onChange={(e) => setEditingBank((prev) => (prev ? { ...prev, branchCode: e.target.value } : prev))}
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">SWIFT Code</Label>
                            <Input
                              placeholder="Enter SWIFT code"
                              className="bg-white border-gray-300 shadow-sm"
                              value={editingBank?.swiftCode || ""}
                              onChange={(e) => setEditingBank((prev) => (prev ? { ...prev, swiftCode: e.target.value } : prev))}
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="balance" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Opening Balance</h3>
                        <div>
                          <Label className="text-gray-700 font-medium">Opening Balance (R) *</Label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            className="bg-white border-gray-300 shadow-sm"
                            value={editingBank?.openingBalance ?? 0}
                            onChange={(e) =>
                              setEditingBank((prev) => (prev ? { ...prev, openingBalance: Number(e.target.value) || 0 } : prev))
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700 font-medium">As of Date *</Label>
                          <Input
                            type="date"
                            className="bg-white border-gray-300 shadow-sm"
                            value={editingBank?.asOfDate || ""}
                            onChange={(e) => setEditingBank((prev) => (prev ? { ...prev, asOfDate: e.target.value } : prev))}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="reconciliation" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Reconciliation Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Last Reconciled Date</Label>
                            <Input
                              type="date"
                              className="bg-white border-gray-300 shadow-sm"
                              value={editingBank?.lastReconciled || ""}
                              onChange={(e) =>
                                setEditingBank((prev) => (prev ? { ...prev, lastReconciled: e.target.value } : prev))
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Reconciliation Frequency</Label>
                            <Select
                              value={editingBank?.reconciliationFrequency || "monthly"}
                              onValueChange={(v) =>
                                setEditingBank((prev) =>
                                  prev ? { ...prev, reconciliationFrequency: v as BankAccount["reconciliationFrequency"] } : prev
                                )
                              }
                            >
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="notes" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Notes</h3>
                        <div>
                          <Label className="text-gray-700 font-medium">Internal Notes</Label>
                          <Textarea 
                            className="w-full mt-1 border-gray-300 shadow-sm"
                            rows={4}
                            placeholder="Add notes about this bank account..."
                            value={editingBank?.internalNotes || ""}
                            onChange={(e) => setEditingBank((prev) => (prev ? { ...prev, internalNotes: e.target.value } : prev))}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              )}

              {/* Bank Accounts Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">All Bank Accounts</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>

                <Card className="bg-white border-gray-200 shadow-md">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Account Name</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Bank</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Account Number</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Type</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Current Balance</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Last Reconciled</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {bankAccounts.map((account, index) => (
                          <tr 
                            key={account.id} 
                            className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-gray-800 border-r border-gray-200">
                              {account.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {account.bank}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              ****{account.accountNumber.slice(-4)}
                            </td>
                            <td className="px-4 py-3 text-sm border-r border-gray-200">
                              <Badge className={`${
                                account.type === 'checking' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : account.type === 'savings' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-purple-100 text-purple-800'
                              }`}>
                                {account.type}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-800 border-r border-gray-200 text-right">
                              R{account.balance.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {account.lastReconciled ? new Date(account.lastReconciled).toLocaleDateString() : 'Never'}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-600 hover:text-gray-800"
                                  title="Delete"
                                  onClick={() => setDeleteConfirm({ open: true, type: 'bankAccount', id: account.id })}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-6">
                        <span>Total Records: {bankAccounts.length}</span>
                        <span>Total Balance: R{bankBalance.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                          Previous
                        </Button>
                        <span className="px-3 py-1 text-sm">Page 1 of 1</span>
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'bills' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Bills</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-700" onClick={handleRefresh}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white shadow-md"
                    onClick={() => {
                      setEditingBill({
                        id: `bill-${Date.now()}`,
                        vendor: "",
                        amount: 0,
                        dueDate: new Date().toISOString().split("T")[0],
                        status: "unpaid",
                        description: "",
                        category: "General",
                      })
                      setBillDialog(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Bill
                  </Button>
                </div>
              </div>

              {editingBill != null && (
                <Card className="bg-white border-gray-200 shadow-lg">
                  <CardHeader className="border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-gray-800">{editingBill?.id && /^[0-9a-f-]{36}$/i.test(editingBill.id) ? "Edit Bill" : "New Bill"}</CardTitle>
                        <CardDescription className="text-gray-600">Vendor bill (payable)</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="border-gray-300 text-gray-700" onClick={() => { setBillDialog(false); setEditingBill(null) }}>
                          Cancel
                        </Button>
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleSaveBill}>
                          Save & Record
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-700 font-medium">Vendor *</Label>
                        <Input
                          placeholder="Vendor name"
                          className="bg-white border-gray-300 shadow-sm"
                          value={editingBill?.vendor ?? ""}
                          onChange={(e) => setEditingBill(prev => prev ? { ...prev, vendor: e.target.value } : null)}
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700 font-medium">Amount (R) *</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          className="bg-white border-gray-300 shadow-sm"
                          value={editingBill?.amount ?? ""}
                          onChange={(e) => setEditingBill(prev => prev ? { ...prev, amount: Number(e.target.value) || 0 } : null)}
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700 font-medium">Due Date *</Label>
                        <Input
                          type="date"
                          className="bg-white border-gray-300 shadow-sm"
                          value={editingBill?.dueDate ?? ""}
                          onChange={(e) => setEditingBill(prev => prev ? { ...prev, dueDate: e.target.value } : null)}
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700 font-medium">Status</Label>
                        <Select
                          value={editingBill?.status ?? "unpaid"}
                          onValueChange={(v: "unpaid" | "paid") => setEditingBill(prev => prev ? { ...prev, status: v } : null)}
                        >
                          <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unpaid">Unpaid</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-gray-700 font-medium">Description</Label>
                        <Input
                          placeholder="Bill description or reference"
                          className="bg-white border-gray-300 shadow-sm"
                          value={editingBill?.description ?? ""}
                          onChange={(e) => setEditingBill(prev => prev ? { ...prev, description: e.target.value } : null)}
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700 font-medium">Category</Label>
                        <Input
                          placeholder="e.g. General, Utilities"
                          className="bg-white border-gray-300 shadow-sm"
                          value={editingBill?.category ?? "General"}
                          onChange={(e) => setEditingBill(prev => prev ? { ...prev, category: e.target.value } : null)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-white border-gray-200 shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Vendor</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Due Date</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {bills.map((bill, index) => (
                        <tr key={bill.id} className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-800 border-r border-gray-200">{bill.vendor}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">R{bill.amount.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">{new Date(bill.dueDate).toLocaleDateString()}</td>
                          <td className="px-4 py-3 border-r border-gray-200">
                            <Badge className={bill.status === "paid" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>{bill.status}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-600 hover:text-gray-800"
                                onClick={() => {
                                  setEditingBill({ ...bill })
                                  setBillDialog(true)
                                }}
                              >
                                Edit
                              </Button>
                              {bill.status === "unpaid" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-800"
                                  onClick={async () => {
                                    try {
                                      await accSb.upsertBill({ ...bill, status: "paid" })
                                      setBills(prev => prev.map(b => (b.id === bill.id ? { ...b, status: "paid" as const } : b)))
                                      toast({ title: "Marked paid", description: `${bill.vendor} marked as paid.` })
                                    } catch (e) {
                                      toast({ title: "Error", description: "Failed to update.", variant: "destructive" })
                                    }
                                  }}
                                >
                                  Mark paid
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800" onClick={() => handleDeleteBill(bill.id)}>
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 text-sm text-gray-600">
                  Total: {bills.length} bill(s) · Unpaid: R{bills.filter(b => b.status === "unpaid").reduce((s, b) => s + b.amount, 0).toLocaleString()}
                </div>
              </Card>
            </div>
          )}

          {activeSection === 'payments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Payments</h2>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-md" onClick={handleCreatePayment}>
                  <Plus className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              </div>

              {/* Payment form (wired to Supabase via editingPayment) */}
              {showPaymentForm && editingPayment && (
                <Card className="bg-white border-gray-200 shadow-lg">
                  <CardHeader className="border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-gray-800">{/^[0-9a-f-]{36}$/i.test(editingPayment.id) ? "Edit Payment" : "New Payment"}</CardTitle>
                        <CardDescription className="text-gray-600">Record a new payment transaction</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="border-gray-300 text-gray-700"
                          onClick={() => {
                            setShowPaymentForm(false)
                            setEditingPayment(null)
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="outline"
                          className="border-orange-300 text-orange-700"
                          onClick={() => {
                            setEditingPayment((prev) => (prev ? { ...prev, status: "pending" } : prev))
                            handleSavePayment()
                          }}
                        >
                          Save Draft
                        </Button>
                        <Button
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                          onClick={() => {
                            setEditingPayment((prev) => (prev ? { ...prev, status: "completed" } : prev))
                            handleSavePayment()
                          }}
                        >
                          Save & Record
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    <Tabs defaultValue="details" className="w-full">
                      <TabsList className="grid w-full grid-cols-5 bg-gray-50 border-b border-gray-200 rounded-none">
                        <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Details</TabsTrigger>
                        <TabsTrigger value="method" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Payment Method</TabsTrigger>
                        <TabsTrigger value="invoice" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Invoice</TabsTrigger>
                        <TabsTrigger value="attachments" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Attachments</TabsTrigger>
                        <TabsTrigger value="notes" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Notes</TabsTrigger>
                      </TabsList>

                      <TabsContent value="details" className="p-6 space-y-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Payment Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-gray-700 font-medium">Payment Date *</Label>
                              <Input
                                type="date"
                                className="bg-white border-gray-300 shadow-sm"
                                value={editingPayment.date ?? ""}
                                onChange={(e) => setEditingPayment((prev) => (prev ? { ...prev, date: e.target.value } : prev))}
                              />
                            </div>
                            <div>
                              <Label className="text-gray-700 font-medium">Amount (R) *</Label>
                              <Input
                                type="number"
                                placeholder="0.00"
                                className="bg-white border-gray-300 shadow-sm"
                                value={editingPayment.amount ?? 0}
                                onChange={(e) => setEditingPayment((prev) => (prev ? { ...prev, amount: Number(e.target.value) || 0 } : prev))}
                              />
                            </div>
                            <div>
                              <Label className="text-gray-700 font-medium">Reference Number</Label>
                              <Input
                                placeholder="REF-2024-001"
                                className="bg-white border-gray-300 shadow-sm"
                                value={editingPayment.reference ?? ""}
                                onChange={(e) => setEditingPayment((prev) => (prev ? { ...prev, reference: e.target.value } : prev))}
                              />
                            </div>
                            <div>
                              <Label className="text-gray-700 font-medium">Status</Label>
                              <Select
                                value={editingPayment.status}
                                onValueChange={(v) => setEditingPayment((prev) => (prev ? { ...prev, status: v as PaymentStatus } : prev))}
                              >
                                <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="failed">Failed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="method" className="p-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Payment Method</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-gray-700 font-medium">Payment Method *</Label>
                              <Select
                                value={editingPayment.method}
                                onValueChange={(v) => setEditingPayment((prev) => (prev ? { ...prev, method: v } : prev))}
                              >
                                <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                  <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cash">Cash</SelectItem>
                                  <SelectItem value="eft">EFT</SelectItem>
                                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                  <SelectItem value="cheque">Cheque</SelectItem>
                                  <SelectItem value="credit_card">Credit Card</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-gray-700 font-medium">Bank Account</Label>
                              <Select
                                value={editingPayment.bankAccountId || ""}
                                onValueChange={(v) =>
                                  setEditingPayment((prev) => (prev ? { ...prev, bankAccountId: v } : prev))
                                }
                              >
                                <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                  <SelectValue placeholder="(Optional) Track account" />
                                </SelectTrigger>
                                <SelectContent>
                                  {bankAccounts.map(acc => (
                                    <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="invoice" className="p-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Apply to Invoice</h3>
                          <div>
                            <Label className="text-gray-700 font-medium">Invoice ID / Number</Label>
                            <Input
                              placeholder="Invoice reference"
                              className="bg-white border-gray-300 shadow-sm"
                              value={editingPayment.invoiceId ?? ""}
                              onChange={(e) => setEditingPayment((prev) => (prev ? { ...prev, invoiceId: e.target.value } : prev))}
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="attachments" className="p-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Attachments</h3>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <div className="space-y-2">
                              <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                              <p className="text-gray-600">Drop files here or click to upload</p>
                              <p className="text-sm text-gray-500">Supports: PDF, JPG, PNG (Max 10MB)</p>
                              <input
                                id="payment-attachments-input"
                                type="file"
                                multiple
                                accept=".pdf,.png,.jpg,.jpeg"
                                className="hidden"
                                onChange={async (e) => {
                                  if (!editingPayment) return
                                  const urls = await uploadToStorage({ section: "payments", recordId: editingPayment.id, files: e.target.files })
                                  if (urls.length) {
                                    setEditingPayment((prev) =>
                                      prev ? { ...prev, attachments: [...(prev.attachments || []), ...urls] } : prev
                                    )
                                    toast({ title: "Uploaded", description: `${urls.length} file(s) attached.` })
                                  }
                                  e.currentTarget.value = ""
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                className="border-orange-300 text-orange-700 hover:bg-orange-50"
                                disabled={uploading.busy && uploading.section === "payments"}
                                onClick={() => {
                                  const el = document.getElementById("payment-attachments-input") as HTMLInputElement | null
                                  el?.click()
                                }}
                              >
                                {uploading.busy && uploading.section === "payments" ? "Uploading..." : "Choose Files"}
                              </Button>
                            </div>
                          </div>

                          {!!(editingPayment?.attachments?.length) && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold text-gray-700">Attached</h4>
                              <div className="space-y-2">
                                {editingPayment.attachments.map((u, idx) => (
                                  <div key={`${u}-${idx}`} className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2">
                                    <a href={u} target="_blank" rel="noreferrer" className="text-sm text-orange-700 hover:underline truncate max-w-[70%]">
                                      {u.split("/").pop()}
                                    </a>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700"
                                      onClick={() =>
                                        setEditingPayment((prev) =>
                                          prev ? { ...prev, attachments: (prev.attachments || []).filter((_, i) => i !== idx) } : prev
                                        )
                                      }
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="notes" className="p-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Notes</h3>
                          <div>
                            <Label className="text-gray-700 font-medium">Internal Notes</Label>
                            <Textarea
                              className="w-full mt-1 border-gray-300 shadow-sm"
                              rows={4}
                              placeholder="Add notes about this payment..."
                              value={editingPayment.internalNotes || ""}
                              onChange={(e) =>
                                setEditingPayment((prev) =>
                                  prev ? { ...prev, internalNotes: e.target.value } : prev
                                )
                              }
                            />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}

              {/* Payments Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">All Payments</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>

                <Card className="bg-white border-gray-200 shadow-md">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Payment #</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Amount (R)</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Method</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Reference</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Invoice</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {payments.map((payment, index) => (
                          <tr 
                            key={payment.id} 
                            className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-gray-800 border-r border-gray-200">
                              #{payment.id.slice(-6)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {new Date(payment.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-800 border-r border-gray-200 text-right">
                              R{payment.amount.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 capitalize">
                              {payment.method.replace('_', ' ')}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {payment.reference || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {payment.invoiceId || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm border-r border-gray-200">
                              <Badge className={paymentStatusColor(payment.status)}>
                                {payment.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-600 hover:text-gray-800"
                                  onClick={() => handleEditPayment(payment)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-800"
                                  onClick={() => handleDeletePayment(payment.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-6">
                        <span>Total Records: {payments.length}</span>
                        <span>Total Amount: R{payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</span>
                        <span>Completed: R{payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                          Previous
                        </Button>
                        <span className="px-3 py-1 text-sm">Page 1 of 1</span>
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'chart-of-accounts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Chart of Accounts</h2>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-md">
                  <Plus className="h-4 w-4 mr-2" />
                  New Account
                </Button>
              </div>

              {/* Zoho Books Style Form */}
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader className="border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-800">New Account</CardTitle>
                      <CardDescription className="text-gray-600">Add a new account to the chart of accounts</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="border-gray-300 text-gray-700">
                        Cancel
                      </Button>
                      <Button variant="outline" className="border-orange-300 text-orange-700">
                        Save Draft
                      </Button>
                      <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                        Save & Activate
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 bg-gray-50 border-b border-gray-200 rounded-none">
                      <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Details</TabsTrigger>
                      <TabsTrigger value="classification" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Classification</TabsTrigger>
                      <TabsTrigger value="balance" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Balance</TabsTrigger>
                      <TabsTrigger value="settings" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Settings</TabsTrigger>
                      <TabsTrigger value="notes" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Notes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="p-6 space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Account Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Account Name *</Label>
                            <Input placeholder="Enter account name" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Account Code *</Label>
                            <Input placeholder="1000" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-gray-700 font-medium">Description</Label>
                            <Textarea 
                              className="w-full mt-1 border-gray-300 shadow-sm"
                              rows={2}
                              placeholder="Enter account description..."
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="classification" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Account Classification</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Account Type *</Label>
                            <Select>
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select account type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="asset">Asset</SelectItem>
                                <SelectItem value="liability">Liability</SelectItem>
                                <SelectItem value="equity">Equity</SelectItem>
                                <SelectItem value="income">Income</SelectItem>
                                <SelectItem value="expense">Expense</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Parent Account</Label>
                            <Select>
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select parent account (optional)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None - Top Level</SelectItem>
                                {chartAccounts.map(acc => (
                                  <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="balance" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Opening Balance</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Opening Balance (R)</Label>
                            <Input type="number" placeholder="0.00" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">As of Date</Label>
                            <Input type="date" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="settings" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Account Settings</h3>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="isSubAccount" className="rounded" />
                            <Label htmlFor="isSubAccount" className="text-gray-700 font-medium">Is Sub-Account</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="isActive" className="rounded" defaultChecked />
                            <Label htmlFor="isActive" className="text-gray-700 font-medium">Is Active</Label>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="notes" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Notes</h3>
                        <div>
                          <Label className="text-gray-700 font-medium">Internal Notes</Label>
                          <Textarea 
                            className="w-full mt-1 border-gray-300 shadow-sm"
                            rows={4}
                            placeholder="Add notes about this account..."
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Chart of Accounts Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">All Accounts</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>

                <Card className="bg-white border-gray-200 shadow-md">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Account Code</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Account Name</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Type</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Description</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Current Balance</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {chartAccounts.map((account, index) => (
                          <tr 
                            key={account.id} 
                            className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-gray-800 border-r border-gray-200">
                              {account.code}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-800 border-r border-gray-200">
                              {account.name}
                            </td>
                            <td className="px-4 py-3 text-sm border-r border-gray-200">
                              <Badge className={`${
                                account.type === 'asset' 
                                  ? 'bg-green-100 text-green-800' 
                                  : account.type === 'liability' 
                                    ? 'bg-red-100 text-red-800' 
                                    : account.type === 'equity' 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : account.type === 'income' 
                                        ? 'bg-purple-100 text-purple-800' 
                                        : 'bg-orange-100 text-orange-800'
                              }`}>
                                {account.type}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {account.description}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-800 border-r border-gray-200 text-right">
                              R{account.balance.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-600 hover:text-gray-800"
                                  title="Delete"
                                  onClick={() => handleDeleteChartAccount(account.id)}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-6">
                        <span>Total Records: {chartAccounts.length}</span>
                        <span>Total Assets: R{chartAccounts.filter(a => a.type === 'asset').reduce((sum, a) => sum + a.balance, 0).toLocaleString()}</span>
                        <span>Total Liabilities: R{chartAccounts.filter(a => a.type === 'liability').reduce((sum, a) => sum + a.balance, 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                          Previous
                        </Button>
                        <span className="px-3 py-1 text-sm">Page 1 of 1</span>
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">General Settings</h2>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-md" onClick={handleSaveSettings}>
                  <Settings className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tax Settings */}
                <Card className="bg-white border-gray-200 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-gray-800">Tax Configuration</CardTitle>
                    <CardDescription className="text-gray-600">Configure tax rates and settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-700 font-medium">VAT Rate (%)</Label>
                      <Input placeholder="15" className="bg-white border-gray-300 text-gray-800 shadow-sm" />
                    </div>
                    <div>
                      <Label className="text-gray-700 font-medium">Tax Number</Label>
                      <Input placeholder="Enter tax number" className="bg-white border-gray-300 text-gray-800 shadow-sm" />
                    </div>
                    <div>
                      <Label className="text-gray-700 font-medium">Tax Authority</Label>
                      <Input placeholder="SARS" className="bg-white border-gray-300 text-gray-800 shadow-sm" />
                    </div>
                  </CardContent>
                </Card>

                {/* Currency Settings */}
                <Card className="bg-white border-gray-200 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-gray-800">Currency Settings</CardTitle>
                    <CardDescription className="text-gray-600">Configure currency and exchange rates</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-700 font-medium">Base Currency</Label>
                      <Select>
                        <SelectTrigger className="bg-white border-gray-300 text-gray-800 shadow-sm">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="zar">ZAR - South African Rand</SelectItem>
                          <SelectItem value="eur">EUR - Euro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-gray-700 font-medium">Exchange Rate Source</Label>
                      <Select>
                        <SelectTrigger className="bg-white border-gray-300 text-gray-800 shadow-sm">
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual Entry</SelectItem>
                          <SelectItem value="api">API Integration</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Invoice Templates */}
                <Card className="bg-white border-gray-200 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-gray-800">Invoice Templates</CardTitle>
                    <CardDescription className="text-gray-600">Customize invoice appearance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-700 font-medium">Company Logo</Label>
                      <Input type="file" accept="image/*" className="bg-white border-gray-300 text-gray-800 shadow-sm" />
                    </div>
                    <div>
                      <Label className="text-gray-700 font-medium">Invoice Footer</Label>
                      <Input placeholder="Enter footer text" className="bg-white border-gray-300 text-gray-800 shadow-sm" />
                    </div>
                    <div>
                      <Label className="text-gray-700 font-medium">Payment Terms</Label>
                      <Input placeholder="e.g., Net 30 days" className="bg-white border-gray-300 text-gray-800 shadow-sm" />
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Gateways */}
                <Card className="bg-white border-gray-200 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-gray-800">Payment Gateways</CardTitle>
                    <CardDescription className="text-gray-600">Configure payment processing</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="paypal" className="rounded" />
                      <Label htmlFor="paypal" className="text-gray-700 font-medium">PayPal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="stripe" className="rounded" />
                      <Label htmlFor="stripe" className="text-gray-700 font-medium">Stripe</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="bank-transfer" className="rounded" />
                      <Label htmlFor="bank-transfer" className="text-gray-700 font-medium">Bank Transfer</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="cash" className="rounded" />
                      <Label htmlFor="cash" className="text-gray-700 font-medium">Cash</Label>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'invoices' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Invoices</h2>
                <Button onClick={handleCreateInvoice} className="bg-orange-500 hover:bg-orange-600 text-white shadow-md">
                  <Plus className="h-4 w-4 mr-2" />
                  New Invoice
                </Button>
              </div>

              {/* Zoho Books Style Form */}
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader className="border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-800">New Invoice</CardTitle>
                      <CardDescription className="text-gray-600">Create a new invoice for clients</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="border-gray-300 text-gray-700" onClick={handleCancelForm}>
                        Cancel
                      </Button>
                      <Button variant="outline" className="border-orange-300 text-orange-700" onClick={handleSaveDraft}>
                        Save Draft
                      </Button>
                      <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleSaveInvoice}>
                        Save & Send
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-gray-50 border-b border-gray-200 rounded-none">
                      <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Details</TabsTrigger>
                      <TabsTrigger value="items" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Items</TabsTrigger>
                      <TabsTrigger value="attachments" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Attachments</TabsTrigger>
                      <TabsTrigger value="notes" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Notes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="p-6 space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Client & Billing Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">Client *</Label>
                            {clients.length > 0 && (
                              <Select
                                value={editingInv?.clientId || ''}
                                onValueChange={(value) => {
                                  if (!value) return
                                  if (value === '__new__') {
                                    openNewClientDialog()
                                    return
                                  }
                                  const selected = clients.find(c => c.id === value)
                                  if (!selected) return
                                  setEditingInv(prev => ({
                                    id: prev?.id ?? `i-${Date.now()}`,
                                    number: prev?.number ?? generateInvoiceNumber(),
                                    client: selected.name,
                                    clientId: selected.id,
                                    clientAddress: selected.billingAddress ?? prev?.clientAddress ?? '',
                                    clientVatNumber: selected.vatNumber ?? prev?.clientVatNumber ?? '',
                                    amount: prev?.amount ?? 0,
                                    tax: prev?.tax ?? 0,
                                    dueDate: prev?.dueDate ?? nowIso(),
                                    status: prev?.status ?? 'draft',
                                    createdDate: prev?.createdDate ?? nowIso(),
                                    description: prev?.description ?? '',
                                    lineItems: prev?.lineItems ?? [],
                                    paymentMethod: prev?.paymentMethod ?? '',
                                    poNumber: prev?.poNumber ?? '',
                                    companyBankDetails: prev?.companyBankDetails ?? '',
                                  }))
                                }}
                              >
                                <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                  <SelectValue placeholder="Select saved client (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                  {clients.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                      {c.name}
                                    </SelectItem>
                                  ))}
                                  <SelectItem value="__new__">+ Add new client…</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                            <Input
                              placeholder="Enter client name"
                              className="bg-white border-gray-300 shadow-sm"
                              value={editingInv?.client ?? ''}
                              onChange={(e) =>
                                setEditingInv(prev =>
                                  prev
                                    ? { ...prev, client: e.target.value }
                                    : {
                                        id: `i-${Date.now()}`,
                                        number: generateInvoiceNumber(),
                                        client: e.target.value,
                                        amount: 0,
                                        tax: 0,
                                        dueDate: nowIso(),
                                        status: 'draft',
                                        createdDate: nowIso(),
                                        description: '',
                                      }
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Invoice Number *</Label>
                            <Input
                              placeholder="SNW-E00001"
                              className="bg-white border-gray-300 shadow-sm"
                              value={editingInv?.number ?? ''}
                              onChange={(e) =>
                                setEditingInv(prev =>
                                  prev
                                    ? { ...prev, number: e.target.value }
                                    : {
                                        id: `i-${Date.now()}`,
                                        number: e.target.value,
                                        client: '',
                                        amount: 0,
                                        tax: 0,
                                        dueDate: nowIso(),
                                        status: 'draft',
                                        createdDate: nowIso(),
                                        description: '',
                                      }
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Date *</Label>
                            <Input
                              type="date"
                              className="bg-white border-gray-300 shadow-sm"
                              value={editingInv?.createdDate ? new Date(editingInv.createdDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)}
                              onChange={(e) => setEditingInv(prev => prev ? { ...prev, createdDate: e.target.value ? new Date(e.target.value).toISOString() : prev.createdDate } : { id: `i-${Date.now()}`, number: `INV-${String(invoices.length + 1).padStart(4, '0')}`, client: '', amount: 0, tax: 0, dueDate: nowIso(), status: 'draft', createdDate: e.target.value ? new Date(e.target.value).toISOString() : nowIso(), description: '' })}
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Due Date *</Label>
                            <Input
                              type="date"
                              className="bg-white border-gray-300 shadow-sm"
                              value={editingInv?.dueDate ? new Date(editingInv.dueDate).toISOString().slice(0, 10) : ''}
                              onChange={(e) => setEditingInv(prev => prev ? { ...prev, dueDate: e.target.value ? new Date(e.target.value).toISOString() : prev.dueDate } : { id: `i-${Date.now()}`, number: `INV-${String(invoices.length + 1).padStart(4, '0')}`, client: '', amount: 0, tax: 0, dueDate: e.target.value ? new Date(e.target.value).toISOString() : nowIso(), status: 'draft', createdDate: nowIso(), description: '' })}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label className="text-gray-700 font-medium">Bill To Address (appears under BILL TO)</Label>
                            <Textarea
                              className="w-full mt-1 border-gray-300 shadow-sm"
                              rows={3}
                              placeholder={"Street address\nSuburb, City, Postal code\nCountry"}
                              value={editingInv?.clientAddress ?? ''}
                              onChange={(e) =>
                                setEditingInv(prev =>
                                  prev
                                    ? { ...prev, clientAddress: e.target.value }
                                    : {
                                        id: `i-${Date.now()}`,
                                        number: generateInvoiceNumber(),
                                        client: '',
                                        amount: 0,
                                        tax: 0,
                                        dueDate: nowIso(),
                                        status: 'draft',
                                        createdDate: nowIso(),
                                        description: '',
                                        clientAddress: e.target.value,
                                      }
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Client VAT Number</Label>
                            <Input
                              className="bg-white border-gray-300 shadow-sm"
                              placeholder="Enter client VAT number"
                              value={editingInv?.clientVatNumber ?? ''}
                              onChange={(e) =>
                                setEditingInv(prev =>
                                  prev
                                    ? { ...prev, clientVatNumber: e.target.value }
                                    : {
                                        id: `i-${Date.now()}`,
                                        number: generateInvoiceNumber(),
                                        client: '',
                                        amount: 0,
                                        tax: 0,
                                        dueDate: nowIso(),
                                        status: 'draft',
                                        createdDate: nowIso(),
                                        description: '',
                                        clientVatNumber: e.target.value,
                                      }
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Payment Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Payment Terms</Label>
                            <Select>
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select payment terms" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="net15">Net 15 days</SelectItem>
                                <SelectItem value="net30">Net 30 days</SelectItem>
                                <SelectItem value="net60">Net 60 days</SelectItem>
                                <SelectItem value="due_on_receipt">Due on Receipt</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Status</Label>
                            <Select
                              value={editingInv?.status ?? 'draft'}
                              onValueChange={(v) =>
                                setEditingInv(prev =>
                                  prev
                                    ? { ...prev, status: v as InvoiceStatus }
                                    : {
                                        id: `i-${Date.now()}`,
                                        number: generateInvoiceNumber(),
                                        client: '',
                                        amount: 0,
                                        tax: 0,
                                        dueDate: nowIso(),
                                        status: v as InvoiceStatus,
                                        createdDate: nowIso(),
                                        description: '',
                                      }
                                )
                              }
                            >
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="sent">Sent</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Payment Method (shown on invoice)</Label>
                            <Input
                              className="bg-white border-gray-300 shadow-sm"
                              placeholder="e.g. Cash on Delivery, EFT"
                              value={editingInv?.paymentMethod ?? ''}
                              onChange={(e) =>
                                setEditingInv(prev =>
                                  prev
                                    ? { ...prev, paymentMethod: e.target.value }
                                    : {
                                        id: `i-${Date.now()}`,
                                        number: generateInvoiceNumber(),
                                        client: '',
                                        amount: 0,
                                        tax: 0,
                                        dueDate: nowIso(),
                                        status: 'draft',
                                        createdDate: nowIso(),
                                        description: '',
                                        paymentMethod: e.target.value,
                                      }
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">PO Number</Label>
                            <Input
                              className="bg-white border-gray-300 shadow-sm"
                              placeholder="Customer PO number"
                              value={editingInv?.poNumber ?? ''}
                              onChange={(e) =>
                                setEditingInv(prev =>
                                  prev
                                    ? { ...prev, poNumber: e.target.value }
                                    : {
                                        id: `i-${Date.now()}`,
                                        number: generateInvoiceNumber(),
                                        client: '',
                                        amount: 0,
                                        tax: 0,
                                        dueDate: nowIso(),
                                        status: 'draft',
                                        createdDate: nowIso(),
                                        description: '',
                                        poNumber: e.target.value,
                                      }
                                )
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-gray-700 font-medium">Company Banking Details (shown on invoice footer)</Label>
                          <Textarea
                            className="w-full mt-1 border-gray-300 shadow-sm"
                            rows={3}
                            placeholder={"Bank: \nAccount Name: \nAccount Number: \nBranch Code:"}
                            value={editingInv?.companyBankDetails ?? ''}
                            onChange={(e) =>
                              setEditingInv(prev =>
                                prev
                                  ? { ...prev, companyBankDetails: e.target.value }
                                  : {
                                      id: `i-${Date.now()}`,
                                      number: generateInvoiceNumber(),
                                      client: '',
                                      amount: 0,
                                      tax: 0,
                                      dueDate: nowIso(),
                                      status: 'draft',
                                      createdDate: nowIso(),
                                      description: '',
                                      companyBankDetails: e.target.value,
                                    }
                              )
                            }
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="items" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Invoice Items</h3>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Quantity</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Unit Price</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tax %</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700"></th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {invoiceItemRows.map((row) => (
                                <tr key={row.id}>
                                  <td className="px-4 py-3">
                                    <Input
                                      placeholder="Item description"
                                      className="bg-white border-gray-300 shadow-sm"
                                      value={row.description}
                                      onChange={(e) => updateInvoiceItem(row.id, 'description', e.target.value)}
                                    />
                                  </td>
                                  <td className="px-4 py-3">
                                    <Input
                                      type="number"
                                      min={0}
                                      placeholder="0"
                                      className="bg-white border-gray-300 shadow-sm"
                                      value={row.quantity || ''}
                                      onChange={(e) => updateInvoiceItem(row.id, 'quantity', parseFloat(e.target.value) || 0)}
                                    />
                                  </td>
                                  <td className="px-4 py-3">
                                    <Input
                                      type="number"
                                      min={0}
                                      step={0.01}
                                      placeholder="0.00"
                                      className="bg-white border-gray-300 shadow-sm"
                                      value={row.unitPrice || ''}
                                      onChange={(e) => updateInvoiceItem(row.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                    />
                                  </td>
                                  <td className="px-4 py-3">
                                    <Input
                                      type="number"
                                      min={0}
                                      max={100}
                                      placeholder="15"
                                      className="bg-white border-gray-300 shadow-sm"
                                      value={row.taxPercent || ''}
                                      onChange={(e) => updateInvoiceItem(row.id, 'taxPercent', parseFloat(e.target.value) || 0)}
                                    />
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="text-gray-800 font-medium">
                                      R{invoiceItemsTotal(row).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700"
                                      onClick={() => removeInvoiceItem(row.id)}
                                      disabled={invoiceItemRows.length === 1}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="flex items-center justify-between">
                          <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50" onClick={addInvoiceItem}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Item
                          </Button>
                          <div className="text-sm text-gray-700 space-y-1">
                            <p>Subtotal: R{invoiceSubtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
                            <p>VAT: R{invoiceTaxTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
                            <p className="font-semibold">Total: R{invoiceGrandTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="attachments" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Attachments</h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <div className="space-y-2">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                            <p className="text-gray-600">Drop files here or click to upload</p>
                            <p className="text-sm text-gray-500">Supports: PDF, JPG, PNG (Max 10MB)</p>
                            <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                              Choose Files
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="notes" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Notes & Terms</h3>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Internal Notes</Label>
                            <Textarea 
                              className="w-full mt-1 border-gray-300 shadow-sm"
                              rows={4}
                              placeholder="Add internal notes for this invoice..."
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Terms & Conditions</Label>
                            <Textarea 
                              className="w-full mt-1 border-gray-300 shadow-sm"
                              rows={3}
                              placeholder="Add terms and conditions..."
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Invoices Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">All Invoices</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>

                <Card className="bg-white border-gray-200 shadow-md">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Invoice #</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Client</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Amount</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Total</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Created Date</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Due Date</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {invoices.map((invoice, index) => (
                          <tr 
                            key={invoice.id} 
                            className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-gray-800 border-r border-gray-200">
                              {invoice.number}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {invoice.client}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-right">
                              R{invoice.amount.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-800 border-r border-gray-200 text-right">
                              R{(invoice.amount + (invoice.tax || 0)).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {new Date(invoice.createdDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {new Date(invoice.dueDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm border-r border-gray-200">
                              <Badge className={statusColor(invoice.status)}>
                                {invoice.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-600 hover:text-gray-800"
                                  title="Edit"
                                  onClick={() => openEditInv(invoice)}
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-600 hover:text-gray-800"
                                  title="Download PDF"
                                  onClick={() => {
                                    // Prefer line items saved on the invoice; fall back to current form if editing
                                    let lineItems = invoice.lineItems && invoice.lineItems.length > 0
                                      ? invoice.lineItems
                                      : undefined

                                    if ((!lineItems || lineItems.length === 0) && editingInv && editingInv.id === invoice.id) {
                                      lineItems = invoiceItemRows
                                        .filter(r => (r.quantity || 0) !== 0 || (r.unitPrice || 0) !== 0 || (r.description || '').trim() !== '')
                                        .map((row) => ({
                                          description: row.description || "Item",
                                          quantity: row.quantity || 0,
                                          unitPrice: row.unitPrice || 0,
                                          amount: (row.quantity || 0) * (row.unitPrice || 0),
                                        }))
                                    }

                                    generateInvoicePdf({
                                      number: invoice.number,
                                      client: invoice.client,
                                      clientAddress: invoice.clientAddress,
                                      shippingAddress: invoice.clientAddress,
                                      issueDate: invoice.createdDate,
                                      dueDate: invoice.dueDate,
                                      description: invoice.description,
                                      amount: invoice.amount,
                                      tax: invoice.tax,
                                      status: invoice.status,
                                      lineItems,
                                      taxRate: 0.15,
                                      paymentMethod: invoice.paymentMethod,
                                      poNumber: invoice.poNumber,
                                      companyBankDetails: invoice.companyBankDetails,
                                      clientVatNumber: invoice.clientVatNumber,
                                    })
                                  }}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  title="Delete"
                                  onClick={() => setDeleteConfirm({ open: true, type: 'invoice', id: invoice.id })}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-6">
                        <span>Total Records: {invoices.length}</span>
                        <span>Total Amount: R{invoices.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}</span>
                        <span>Total Due: R{invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.amount, 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                          Previous
                        </Button>
                        <span className="px-3 py-1 text-sm">Page 1 of 1</span>
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'weighbridge' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Weighbridge Tickets</h2>
                <Button 
                  className="bg-orange-500 hover:bg-orange-600 text-white shadow-md"
                  onClick={handleCreateWeighbridge}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Ticket
                </Button>
              </div>

              {/* Zoho Books Style Form - Show conditionally */}
              {(showWeighbridgeForm && editingWeighbridge) && (
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader className="border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-800">New Weighbridge Ticket</CardTitle>
                      <CardDescription className="text-gray-600">Create a new weighbridge ticket for material weighing</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="border-gray-300 text-gray-700"
                        onClick={() => { setShowWeighbridgeForm(false); setEditingWeighbridge(null) }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-orange-300 text-orange-700"
                        onClick={handleSaveWeighbridge}
                      >
                        Save Draft
                      </Button>
                      <Button 
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={handleSaveWeighbridge}
                      >
                        Save & Process
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  {/* Tabbed Form Interface */}
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 bg-gray-50 border-b border-gray-200 rounded-none">
                      <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Details</TabsTrigger>
                      <TabsTrigger value="weights" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Weights</TabsTrigger>
                      <TabsTrigger value="vehicle" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Vehicle Info</TabsTrigger>
                      <TabsTrigger value="attachments" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Photos</TabsTrigger>
                      <TabsTrigger value="notes" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Notes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="p-6 space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Ticket Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Ticket Number *</Label>
                            <Input 
                              placeholder="SNWB-00001" 
                              className="bg-white border-gray-300 shadow-sm text-gray-900"
                              value={editingWeighbridge?.ticketNumber || ''}
                              onChange={(e) => editingWeighbridge && setEditingWeighbridge({ ...editingWeighbridge, ticketNumber: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Supplier *</Label>
                            <Select 
                              value={editingWeighbridge?.supplierId || ''}
                              onValueChange={(value) => editingWeighbridge && setEditingWeighbridge({ ...editingWeighbridge, supplierId: value })}
                            >
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select supplier" />
                              </SelectTrigger>
                              <SelectContent>
                                {suppliers.map(supplier => (
                                  <SelectItem key={supplier.id} value={supplier.id}>
                                    {supplier.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Material *</Label>
                            <Select 
                              value={editingWeighbridge?.material || ''}
                              onValueChange={(value) => editingWeighbridge && setEditingWeighbridge({ ...editingWeighbridge, material: value })}
                            >
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select material" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Aluminium Cans">Aluminium Cans</SelectItem>
                                <SelectItem value="Cardboard">Cardboard</SelectItem>
                                <SelectItem value="Glass">Glass</SelectItem>
                                <SelectItem value="Glass Bottles">Glass Bottles</SelectItem>
                                <SelectItem value="HDPE Containers">HDPE Containers</SelectItem>
                                <SelectItem value="Paper">Paper</SelectItem>
                                <SelectItem value="PET Bottles">PET Bottles</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Grade *</Label>
                            <Select 
                              value={editingWeighbridge?.grade || 'A'}
                              onValueChange={(value) => editingWeighbridge && setEditingWeighbridge({ ...editingWeighbridge, grade: value as MaterialGrade })}
                            >
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select grade" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="A">Grade A</SelectItem>
                                <SelectItem value="B">Grade B</SelectItem>
                                <SelectItem value="C">Grade C</SelectItem>
                                <SelectItem value="D">Grade D</SelectItem>
                                <SelectItem value="Mixed">Mixed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Date *</Label>
                            <Input 
                              type="date" 
                              className="bg-white border-gray-300 shadow-sm text-gray-900"
                              value={editingWeighbridge?.date ? new Date(editingWeighbridge.date).toISOString().split('T')[0] : ''}
                              onChange={(e) => editingWeighbridge && setEditingWeighbridge({ ...editingWeighbridge, date: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Location *</Label>
                            <Select 
                              value={editingWeighbridge?.location || ''}
                              onValueChange={(value) => editingWeighbridge && setEditingWeighbridge({ ...editingWeighbridge, location: value })}
                            >
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select location" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Gate 1">Gate 1</SelectItem>
                                <SelectItem value="Gate 2">Gate 2</SelectItem>
                                <SelectItem value="Warehouse A">Warehouse A</SelectItem>
                                <SelectItem value="Warehouse B">Warehouse B</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="weights" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Weight Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Gross Weight (kg) *</Label>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              className="bg-white border-gray-300 shadow-sm text-gray-900"
                              value={editingWeighbridge?.grossWeight || 0}
                              onChange={(e) => {
                                const gross = parseFloat(e.target.value) || 0
                                const net = gross - (editingWeighbridge?.tareWeight || 0)
                                editingWeighbridge && setEditingWeighbridge({ 
                                  ...editingWeighbridge, 
                                  grossWeight: gross,
                                  netWeight: net
                                })
                              }}
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Tare Weight (kg) *</Label>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              className="bg-white border-gray-300 shadow-sm text-gray-900"
                              value={editingWeighbridge?.tareWeight || 0}
                              onChange={(e) => {
                                const tare = parseFloat(e.target.value) || 0
                                const net = (editingWeighbridge?.grossWeight || 0) - tare
                                editingWeighbridge && setEditingWeighbridge({ 
                                  ...editingWeighbridge, 
                                  tareWeight: tare,
                                  netWeight: net
                                })
                              }}
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Net Weight (kg)</Label>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              className="bg-white border-gray-300 shadow-sm text-gray-900" 
                              disabled
                              value={editingWeighbridge?.netWeight || 0}
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Contamination (kg)</Label>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              className="bg-white border-gray-300 shadow-sm text-gray-900"
                              value={editingWeighbridge?.contamination || 0}
                              onChange={(e) => editingWeighbridge && setEditingWeighbridge({ 
                                ...editingWeighbridge, 
                                contamination: parseFloat(e.target.value) || 0
                              })}
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="vehicle" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Vehicle & Driver Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Driver Name *</Label>
                            <Input 
                              placeholder="Enter driver name" 
                              className="bg-white border-gray-300 shadow-sm text-gray-900"
                              value={editingWeighbridge?.driverName || ''}
                              onChange={(e) => editingWeighbridge && setEditingWeighbridge({ ...editingWeighbridge, driverName: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Vehicle Registration *</Label>
                            <Input 
                              placeholder="ABC123GP" 
                              className="bg-white border-gray-300 shadow-sm text-gray-900"
                              value={editingWeighbridge?.vehicleReg || ''}
                              onChange={(e) => editingWeighbridge && setEditingWeighbridge({ ...editingWeighbridge, vehicleReg: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="attachments" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Photos</h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <div className="space-y-2">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                            <p className="text-gray-600">Drop photos here or click to upload</p>
                            <p className="text-sm text-gray-500">Supports: JPG, PNG (Max 10MB each)</p>
                            <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                              Choose Files
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="notes" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Notes & Observations</h3>
                        <div>
                          <Label className="text-gray-700 font-medium">Notes</Label>
                          <Textarea 
                            className="w-full mt-1 border-gray-300 shadow-sm text-gray-900"
                            rows={4}
                            placeholder="Add notes about this weighbridge ticket..."
                            value={editingWeighbridge?.notes || ''}
                            onChange={(e) => editingWeighbridge && setEditingWeighbridge({ ...editingWeighbridge, notes: e.target.value })}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              )}

              {/* Recent Tickets - Spreadsheet Style Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Recent Tickets</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>

                <Card className="bg-white border-gray-200 shadow-md">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Ticket #</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Supplier</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Material</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Grade</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Gross (kg)</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Tare (kg)</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Net (kg)</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Contamination (kg)</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Driver</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Vehicle</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {weighbridgeTickets.map((ticket, index) => (
                          <tr 
                            key={ticket.id} 
                            className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-gray-800 border-r border-gray-200">
                              {ticket.ticketNumber}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {ticket.supplierId}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {ticket.material}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {ticket.grade}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-right">
                              {ticket.grossWeight.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-right">
                              {ticket.tareWeight.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-800 border-r border-gray-200 text-right">
                              {ticket.netWeight.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-right">
                              {ticket.contamination.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {ticket.driverName}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {ticket.vehicleReg}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {new Date(ticket.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm border-r border-gray-200">
                              <Badge className={`${
                                ticket.status === 'weighed' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : ticket.status === 'processed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {ticket.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Table Footer with Summary */}
                  <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-6">
                        <span>Total Records: {weighbridgeTickets.length}</span>
                        <span>Total Net Weight: {weighbridgeTickets.reduce((sum, t) => sum + t.netWeight, 0).toLocaleString()} kg</span>
                        <span>Total Gross Weight: {weighbridgeTickets.reduce((sum, t) => sum + t.grossWeight, 0).toLocaleString()} kg</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                          Previous
                        </Button>
                        <span className="px-3 py-1 text-sm">Page 1 of 1</span>
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'suppliers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Suppliers</h2>
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white shadow-md"
                  onClick={handleCreateSupplier}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Supplier
                </Button>
              </div>

              {/* Zoho Books Style Form */}
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader className="border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-800">New Supplier</CardTitle>
                      <CardDescription className="text-gray-600">Register a new supplier for material purchases</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="border-gray-300 text-gray-700"
                          onClick={() => {
                            setShowSupplierForm(false)
                            setEditingSupplier(null)
                          }}
                        >
                        Cancel
                      </Button>
                        <Button
                          variant="outline"
                          className="border-orange-300 text-orange-700"
                          onClick={handleSaveSupplier}
                        >
                        Save Draft
                      </Button>
                        <Button
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                          onClick={handleSaveSupplier}
                        >
                        Save & Activate
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 bg-gray-50 border-b border-gray-200 rounded-none">
                      <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Details</TabsTrigger>
                      <TabsTrigger value="contact" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Contact</TabsTrigger>
                      <TabsTrigger value="banking" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Banking</TabsTrigger>
                      <TabsTrigger value="kyc" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">KYC & Compliance</TabsTrigger>
                      <TabsTrigger value="notes" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Notes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="p-6 space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Supplier Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Supplier Name *</Label>
                            <Input
                              placeholder="Enter supplier name"
                              className="bg-white border-gray-300 shadow-sm"
                              value={editingSupplier?.name ?? ''}
                              onChange={(e) =>
                                setEditingSupplier(prev =>
                                  prev
                                    ? { ...prev, name: e.target.value }
                                    : {
                                        id: `sup-${Date.now()}`,
                                        name: e.target.value,
                                        contact: '',
                                        email: '',
                                        phone: '',
                                        idNumber: '',
                                        idType: 'id_number',
                                        address: '',
                                        bankDetails: '',
                                        kycStatus: 'pending',
                                        blacklistFlag: false,
                                        paymentMethod: 'cash',
                                        creditLimit: 0,
                                        totalPayouts: 0,
                                        lastPayment: new Date().toISOString(),
                                        status: 'active',
                                      }
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">ID Number *</Label>
                            <div className="grid grid-cols-3 gap-2">
                              <Select
                                value={editingSupplier?.idType ?? 'id_number'}
                                onValueChange={(value) =>
                                  setEditingSupplier(prev =>
                                    prev ? { ...prev, idType: value as Supplier['idType'] } : prev
                                  )
                                }
                              >
                                <SelectTrigger className="bg-white border-gray-300 shadow-sm col-span-1">
                                  <SelectValue placeholder="ID Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ck">CK</SelectItem>
                                  <SelectItem value="team_code">Team Code</SelectItem>
                                  <SelectItem value="id_number">ID Number</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                placeholder="Enter ID / CK / Team Code"
                                className="bg-white border-gray-300 shadow-sm col-span-2"
                                value={editingSupplier?.idNumber ?? ''}
                                onChange={(e) =>
                                  setEditingSupplier(prev => (prev ? { ...prev, idNumber: e.target.value } : prev))
                                }
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Credit Limit</Label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              className="bg-white border-gray-300 shadow-sm"
                              value={editingSupplier?.creditLimit ?? 0}
                              onChange={(e) =>
                                setEditingSupplier(prev => (prev ? { ...prev, creditLimit: Number(e.target.value || 0) } : prev))
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Payment Method *</Label>
                            <Select
                              value={editingSupplier?.paymentMethod ?? 'cash'}
                              onValueChange={(value) =>
                                setEditingSupplier(prev => (prev ? { ...prev, paymentMethod: value as PaymentMethod } : prev))
                              }
                            >
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="eft">EFT</SelectItem>
                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                <SelectItem value="cheque">Cheque</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="contact" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Contact Person *</Label>
                            <Input
                              placeholder="Enter contact name"
                              className="bg-white border-gray-300 shadow-sm"
                              value={editingSupplier?.contact ?? ''}
                              onChange={(e) =>
                                setEditingSupplier(prev => (prev ? { ...prev, contact: e.target.value } : prev))
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Email</Label>
                            <Input
                              type="email"
                              placeholder="email@example.com"
                              className="bg-white border-gray-300 shadow-sm"
                              value={editingSupplier?.email ?? ''}
                              onChange={(e) =>
                                setEditingSupplier(prev => (prev ? { ...prev, email: e.target.value } : prev))
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Phone *</Label>
                            <Input
                              type="tel"
                              placeholder="+27..."
                              className="bg-white border-gray-300 shadow-sm"
                              value={editingSupplier?.phone ?? ''}
                              onChange={(e) =>
                                setEditingSupplier(prev => (prev ? { ...prev, phone: e.target.value } : prev))
                              }
                            />
                          </div>
                          <div className="md:col-span-2 space-y-2">
                            <Label className="text-gray-700 font-medium">Address</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <Input
                                placeholder="Street"
                                className="bg-white border-gray-300 shadow-sm"
                                value={editingSupplier?.address?.split('\n')[0] ?? ''}
                                onChange={(e) =>
                                  setEditingSupplier(prev =>
                                    prev
                                      ? {
                                          ...prev,
                                          address: [
                                            e.target.value,
                                            ...(prev.address?.split('\n').slice(1) ?? ['', '', '']),
                                          ].join('\n'),
                                        }
                                      : prev
                                  )
                                }
                              />
                              <Input
                                placeholder="Suburb"
                                className="bg-white border-gray-300 shadow-sm"
                                value={editingSupplier?.address?.split('\n')[1] ?? ''}
                                onChange={(e) =>
                                  setEditingSupplier(prev =>
                                    prev
                                      ? {
                                          ...prev,
                                          address: [
                                            prev.address?.split('\n')[0] ?? '',
                                            e.target.value,
                                            ...(prev.address?.split('\n').slice(2) ?? ['', '']),
                                          ].join('\n'),
                                        }
                                      : prev
                                  )
                                }
                              />
                              <Input
                                placeholder="City"
                                className="bg-white border-gray-300 shadow-sm"
                                value={editingSupplier?.address?.split('\n')[2] ?? ''}
                                onChange={(e) =>
                                  setEditingSupplier(prev =>
                                    prev
                                      ? {
                                          ...prev,
                                          address: [
                                            ...(prev.address?.split('\n').slice(0, 2) ?? ['', '']),
                                            e.target.value,
                                            prev.address?.split('\n')[3] ?? '',
                                          ].join('\n'),
                                        }
                                      : prev
                                  )
                                }
                              />
                              <Input
                                placeholder="Postal Code"
                                className="bg-white border-gray-300 shadow-sm"
                                value={editingSupplier?.address?.split('\n')[3] ?? ''}
                                onChange={(e) =>
                                  setEditingSupplier(prev =>
                                    prev
                                      ? {
                                          ...prev,
                                          address: [
                                            ...(prev.address?.split('\n').slice(0, 3) ?? ['', '', '']),
                                            e.target.value,
                                          ].join('\n'),
                                        }
                                      : prev
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="banking" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Banking Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Bank Name</Label>
                            <Input
                              placeholder="Enter bank name"
                              className="bg-white border-gray-300 shadow-sm"
                              value={editingSupplier?.bankDetails?.split('\n')[0] ?? ''}
                              onChange={(e) =>
                                setEditingSupplier(prev =>
                                  prev
                                    ? {
                                        ...prev,
                                        bankDetails: [e.target.value, ...(prev.bankDetails?.split('\n').slice(1) ?? [])].join('\n'),
                                      }
                                    : prev
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Account Number</Label>
                            <Input
                              placeholder="Enter account number"
                              className="bg-white border-gray-300 shadow-sm"
                              value={editingSupplier?.bankDetails?.split('\n')[1] ?? ''}
                              onChange={(e) =>
                                setEditingSupplier(prev =>
                                  prev
                                    ? {
                                        ...prev,
                                        bankDetails: [
                                          prev.bankDetails?.split('\n')[0] ?? '',
                                          e.target.value,
                                          ...(prev.bankDetails?.split('\n').slice(2) ?? []),
                                        ].join('\n'),
                                      }
                                    : prev
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Branch Code</Label>
                            <Input placeholder="Enter branch code" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Account Type</Label>
                            <Select>
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select account type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="checking">Checking</SelectItem>
                                <SelectItem value="savings">Savings</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="kyc" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">KYC & Compliance</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">KYC Status</Label>
                            <Select
                              value={editingSupplier?.kycStatus ?? 'pending'}
                              onValueChange={(value) =>
                                setEditingSupplier(prev =>
                                  prev ? { ...prev, kycStatus: value as 'pending' | 'approved' | 'rejected' } : prev
                                )
                              }
                            >
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center space-x-2 pt-8">
                            <input
                              type="checkbox"
                              id="blacklist"
                              className="rounded"
                              checked={editingSupplier?.blacklistFlag ?? false}
                              onChange={(e) =>
                                setEditingSupplier(prev => (prev ? { ...prev, blacklistFlag: e.target.checked } : prev))
                              }
                            />
                            <Label htmlFor="blacklist" className="text-gray-700 font-medium">Blacklist Flag</Label>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="notes" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Notes & Comments</h3>
                        <div>
                          <Label className="text-gray-700 font-medium">Internal Notes</Label>
                          <Textarea 
                            className="w-full mt-1 border-gray-300 shadow-sm"
                            rows={4}
                            placeholder="Add notes about this supplier..."
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Suppliers Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">All Suppliers</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>

                <Card className="bg-white border-gray-200 shadow-md">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Name</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Contact</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Email</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Phone</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Total Payouts</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Credit Limit</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Payment Method</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">KYC Status</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {suppliers.map((supplier, index) => (
                          <tr 
                            key={supplier.id} 
                            className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-gray-800 border-r border-gray-200">
                              {supplier.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {supplier.contact}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {supplier.email}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {supplier.phone}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-right">
                              R{supplier.totalPayouts.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-right">
                              R{supplier.creditLimit.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 capitalize">
                              {supplier.paymentMethod.replace('_', ' ')}
                            </td>
                            <td className="px-4 py-3 text-sm border-r border-gray-200">
                              <Badge className={`${
                                supplier.kycStatus === 'approved' 
                                  ? 'bg-green-100 text-green-800' 
                                  : supplier.kycStatus === 'pending' 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-red-100 text-red-800'
                              }`}>
                                {supplier.kycStatus}
                              </Badge>
                              {supplier.blacklistFlag && (
                                <Badge variant="destructive" className="ml-1">Blacklisted</Badge>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm border-r border-gray-200">
                              <Badge className={supplier.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {supplier.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-6">
                        <span>Total Records: {suppliers.length}</span>
                        <span>Total Payouts: R{suppliers.reduce((sum, s) => sum + s.totalPayouts, 0).toLocaleString()}</span>
                        <span>Active Suppliers: {suppliers.filter(s => s.status === 'active').length}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                          Previous
                        </Button>
                        <span className="px-3 py-1 text-sm">Page 1 of 1</span>
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'pricing' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Material Pricing</h2>
        <Button 
          className="bg-orange-500 hover:bg-orange-600 text-white shadow-md"
          onClick={handleCreatePricing}
        >
                  <Plus className="h-4 w-4 mr-2" />
                  New Pricing
                </Button>
              </div>

      {/* Zoho Books Style Form */}
      {(showPricingForm || editingPricing) && (
      <Card className="bg-white border-gray-200 shadow-lg">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-800">
                {editingPricing ? `Material Pricing – ${editingPricing.material || 'New'}` : 'New Material Pricing'}
              </CardTitle>
              <CardDescription className="text-gray-600">Set pricing for materials and grades</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700"
                onClick={() => {
                  setShowPricingForm(false)
                  setEditingPricing(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                className="border-orange-300 text-orange-700"
                onClick={() => handleSavePricing('draft')}
                disabled={!editingPricing}
              >
                Save Draft
              </Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => handleSavePricing('active')}
                disabled={!editingPricing}
              >
                Save & Activate
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 bg-gray-50 border-b border-gray-200 rounded-none">
                      <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Details</TabsTrigger>
                      <TabsTrigger value="adjustments" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Adjustments</TabsTrigger>
                      <TabsTrigger value="tiers" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Price Tiers</TabsTrigger>
                      <TabsTrigger value="dates" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Dates</TabsTrigger>
                      <TabsTrigger value="notes" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Notes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="p-6 space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Material Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Material *</Label>
                            <Select
                              value={editingPricing?.material || ''}
                              onValueChange={(value) =>
                                setEditingPricing(prev => prev ? { ...prev, material: value } : prev)
                              }
                            >
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select material" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Aluminium Cans">Aluminium Cans</SelectItem>
                                <SelectItem value="Cardboard">Cardboard</SelectItem>
                                <SelectItem value="Glass">Glass</SelectItem>
                                <SelectItem value="Glass Bottles">Glass Bottles</SelectItem>
                                <SelectItem value="HDPE Containers">HDPE Containers</SelectItem>
                                <SelectItem value="Paper">Paper</SelectItem>
                                <SelectItem value="PET Bottles">PET Bottles</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Grade *</Label>
                            <Select
                              value={editingPricing?.grade || 'A'}
                              onValueChange={(value) =>
                                setEditingPricing(prev => prev ? { ...prev, grade: value as MaterialGrade } : prev)
                              }
                            >
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select grade" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="A">Grade A</SelectItem>
                                <SelectItem value="B">Grade B</SelectItem>
                                <SelectItem value="C">Grade C</SelectItem>
                                <SelectItem value="D">Grade D</SelectItem>
                                <SelectItem value="Mixed">Mixed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Base Price (R/kg) *</Label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              className="bg-white border-gray-300 shadow-sm"
                              value={editingPricing?.basePrice ?? ''}
                              onChange={(e) =>
                                setEditingPricing(prev =>
                                  prev ? { ...prev, basePrice: parseFloat(e.target.value || '0') } : prev
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Price Tier</Label>
                            <Select
                              value={editingPricing?.priceTier || 'standard'}
                              onValueChange={(value) =>
                                setEditingPricing(prev => prev ? { ...prev, priceTier: value as MaterialPricing['priceTier'] } : prev)
                              }
                            >
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select tier" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="premium">Premium</SelectItem>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="discount">Discount</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="adjustments" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Price Adjustments</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Moisture Adjustment (%)</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              className="bg-white border-gray-300 shadow-sm"
                              value={editingPricing?.moistureAdjustment ?? ''}
                              onChange={(e) =>
                                setEditingPricing(prev =>
                                  prev ? { ...prev, moistureAdjustment: parseFloat(e.target.value || '0') } : prev
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Contamination Deduction (%)</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              className="bg-white border-gray-300 shadow-sm"
                              value={editingPricing?.contaminationDeduction ?? ''}
                              onChange={(e) =>
                                setEditingPricing(prev =>
                                  prev ? { ...prev, contaminationDeduction: parseFloat(e.target.value || '0') } : prev
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="tiers" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Price Tier Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Supplier Specific</Label>
                            <Select
                              value={editingPricing?.supplierId || 'none'}
                              onValueChange={(value) =>
                                setEditingPricing(prev =>
                                  prev ? { ...prev, supplierId: value === 'none' ? undefined : value } : prev
                                )
                              }
                            >
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select supplier (optional)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None - Apply to All</SelectItem>
                                {suppliers.map(s => (
                                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Customer Specific</Label>
                            <Select
                              value={editingPricing?.customerId || 'none'}
                              onValueChange={(value) =>
                                setEditingPricing(prev =>
                                  prev ? { ...prev, customerId: value === 'none' ? undefined : value } : prev
                                )
                              }
                            >
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select customer (optional)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None - Apply to All</SelectItem>
                                {vendorCustomers
                                  .filter(v => v.type === 'customer')
                                  .map(v => (
                                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="dates" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Effective Dates</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Effective Date *</Label>
                            <Input
                              type="date"
                              className="bg-white border-gray-300 shadow-sm"
                              value={editingPricing?.effectiveDate || ''}
                              onChange={(e) =>
                                setEditingPricing(prev =>
                                  prev ? { ...prev, effectiveDate: e.target.value } : prev
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Review Date *</Label>
                            <Input
                              type="date"
                              className="bg-white border-gray-300 shadow-sm"
                              value={editingPricing?.reviewDate || ''}
                              onChange={(e) =>
                                setEditingPricing(prev =>
                                  prev ? { ...prev, reviewDate: e.target.value } : prev
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="notes" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Notes</h3>
                        <div>
                          <Label className="text-gray-700 font-medium">Internal Notes</Label>
                          <Textarea 
                            className="w-full mt-1 border-gray-300 shadow-sm"
                            rows={4}
                            placeholder="Add notes about this pricing..."
                            value={editingPricing?.internalNotes || ''}
                            onChange={(e) =>
                              setEditingPricing(prev =>
                                prev ? { ...prev, internalNotes: e.target.value } : prev
                              )
                            }
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
      )}

              {/* Pricing Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">All Pricing</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>

                <Card className="bg-white border-gray-200 shadow-md">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Material</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Grade</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Base Price (R/kg)</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Moisture Adj (%)</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Contamination (%)</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Net Price (R/kg)</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Price Tier</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Effective Date</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Review Date</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {materialPricing.map((pricing, index) => (
                          <tr 
                            key={pricing.id} 
                            className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-gray-800 border-r border-gray-200">
                              {pricing.material}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {pricing.grade}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-right">
                              R{pricing.basePrice.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-right">
                              -{pricing.moistureAdjustment}%
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-right">
                              -{pricing.contaminationDeduction}%
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-800 border-r border-gray-200 text-right">
                              R{(pricing.basePrice * (1 - pricing.moistureAdjustment/100) * (1 - pricing.contaminationDeduction/100)).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm border-r border-gray-200">
                              <Badge className={`${
                                pricing.priceTier === 'premium' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : pricing.priceTier === 'standard' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-green-100 text-green-800'
                              }`}>
                                {pricing.priceTier}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {new Date(pricing.effectiveDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {pricing.reviewDate ? new Date(pricing.reviewDate).toLocaleDateString() : ''}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              <Badge
                                className={
                                  pricing.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : pricing.status === 'inactive'
                                      ? 'bg-gray-100 text-gray-800'
                                      : pricing.status === 'expired'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                }
                              >
                                {pricing.status || 'draft'}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-600 hover:text-gray-800"
                                  onClick={() => handleEditPricing(pricing)}
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-600 hover:text-gray-800"
                                  onClick={() => handleDeletePricing(pricing.id)}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-6">
                        <span>Total Records: {materialPricing.length}</span>
                        <span>Average Base Price: R{(materialPricing.reduce((sum, p) => sum + p.basePrice, 0) / materialPricing.length).toFixed(2)}/kg</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                          Previous
                        </Button>
                        <span className="px-3 py-1 text-sm">Page 1 of 1</span>
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'bales' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Bales & Lots</h2>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-md">
                  <Plus className="h-4 w-4 mr-2" />
                  New Bale
                </Button>
              </div>

              {/* Zoho Books Style Form */}
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader className="border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-800">New Bale Lot</CardTitle>
                      <CardDescription className="text-gray-600">Create a new bale lot for inventory tracking</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="border-gray-300 text-gray-700">
                        Cancel
                      </Button>
                      <Button variant="outline" className="border-orange-300 text-orange-700">
                        Save Draft
                      </Button>
                      <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                        Save & Create
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 bg-gray-50 border-b border-gray-200 rounded-none">
                      <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Details</TabsTrigger>
                      <TabsTrigger value="specifications" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Specs</TabsTrigger>
                      <TabsTrigger value="costing" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Costing</TabsTrigger>
                      <TabsTrigger value="location" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Location</TabsTrigger>
                      <TabsTrigger value="notes" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Notes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="p-6 space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Bale Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Bale ID *</Label>
                            <Input placeholder="BALE-2024-001" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Material *</Label>
                            <Select>
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select material" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Aluminium Cans">Aluminium Cans</SelectItem>
                                <SelectItem value="Cardboard">Cardboard</SelectItem>
                                <SelectItem value="Glass">Glass</SelectItem>
                                <SelectItem value="Glass Bottles">Glass Bottles</SelectItem>
                                <SelectItem value="HDPE Containers">HDPE Containers</SelectItem>
                                <SelectItem value="Paper">Paper</SelectItem>
                                <SelectItem value="PET Bottles">PET Bottles</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Grade *</Label>
                            <Select>
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select grade" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="A">Grade A</SelectItem>
                                <SelectItem value="B">Grade B</SelectItem>
                                <SelectItem value="C">Grade C</SelectItem>
                                <SelectItem value="D">Grade D</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Supplier *</Label>
                            <Select>
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select supplier" />
                              </SelectTrigger>
                              <SelectContent>
                                {suppliers.map(s => (
                                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Date *</Label>
                            <Input type="date" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Status</Label>
                            <Select>
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processed">Processed</SelectItem>
                                <SelectItem value="sold">Sold</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="specifications" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Bale Specifications</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Weight (kg) *</Label>
                            <Input type="number" placeholder="0" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Density (kg/m³)</Label>
                            <Input type="number" placeholder="0" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Shrinkage (%)</Label>
                            <Input type="number" placeholder="0" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Yield (%)</Label>
                            <Input type="number" placeholder="0" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="costing" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Costing Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Purchase Price (R) *</Label>
                            <Input type="number" placeholder="0.00" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Processing Cost (R)</Label>
                            <Input type="number" placeholder="0.00" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">COGS per kg (R)</Label>
                            <Input type="number" placeholder="0.00" className="bg-white border-gray-300 shadow-sm" disabled />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="location" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Location</h3>
                        <div>
                          <Label className="text-gray-700 font-medium">Location *</Label>
                          <Select>
                            <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="warehouse">Warehouse A</SelectItem>
                              <SelectItem value="gate1">Gate 1</SelectItem>
                              <SelectItem value="gate2">Gate 2</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="notes" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Notes</h3>
                        <div>
                          <Label className="text-gray-700 font-medium">Internal Notes</Label>
                          <Textarea 
                            className="w-full mt-1 border-gray-300 shadow-sm"
                            rows={4}
                            placeholder="Add notes about this bale lot..."
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Bales Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">All Bales & Lots</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>

                <Card className="bg-white border-gray-200 shadow-md">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Bale ID</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Material</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Grade</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Weight (kg)</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Density</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Location</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Purchase Price</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Processing Cost</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">COGS</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Shrinkage</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Yield</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {baleLots.map((bale, index) => (
                          <tr 
                            key={bale.id} 
                            className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-gray-800 border-r border-gray-200">
                              {bale.baleId}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {bale.material}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {bale.grade}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-right">
                              {bale.weight.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-right">
                              {bale.density.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {bale.location}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-right">
                              R{bale.purchasePrice.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-right">
                              R{bale.processingCost.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-800 border-r border-gray-200 text-right">
                              R{bale.cogs.toFixed(2)}/kg
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-right">
                              {(bale.shrinkage * 100).toFixed(1)}%
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-right">
                              {(bale.yield * 100).toFixed(1)}%
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {new Date(bale.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm border-r border-gray-200">
                              <Badge className={`${
                                bale.status === 'processed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : bale.status === 'sold' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {bale.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-6">
                        <span>Total Records: {baleLots.length}</span>
                        <span>Total Weight: {baleLots.reduce((sum, b) => sum + b.weight, 0).toLocaleString()} kg</span>
                        <span>Total Value: R{baleLots.reduce((sum, b) => sum + b.purchasePrice, 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                          Previous
                        </Button>
                        <span className="px-3 py-1 text-sm">Page 1 of 1</span>
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'expenses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-100">Expenses</h2>
                <Button onClick={openCreateExp} className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Expense
                </Button>
              </div>

              <div className="space-y-4">
                {expenses.map(expense => (
                  <Card key={expense.id} className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-orange-100 rounded-full">
                            <Receipt className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-100">{expense.vendor}</h3>
                            <p className="text-gray-400">{expense.category}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(expense.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xl font-bold text-gray-100">R{expense.amount.toLocaleString()}</p>
                            {expense.reimbursable && (
                              <Badge variant="secondary" className="text-xs">Reimbursable</Badge>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditExp(expense)}>Edit</DropdownMenuItem>
                              <DropdownMenuItem>View Receipt</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive" 
                                onClick={() => deleteExp(expense.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'compliance' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Compliance & Fees</h2>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-md">
                  <Plus className="h-4 w-4 mr-2" />
                  New Fee
                </Button>
              </div>

              {/* Zoho Books Style Form */}
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader className="border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-800">New Compliance Fee</CardTitle>
                      <CardDescription className="text-gray-600">Record a new compliance fee or regulatory payment</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="border-gray-300 text-gray-700">
                        Cancel
                      </Button>
                      <Button variant="outline" className="border-orange-300 text-orange-700">
                        Save Draft
                      </Button>
                      <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                        Save & Record
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 bg-gray-50 border-b border-gray-200 rounded-none">
                      <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Details</TabsTrigger>
                      <TabsTrigger value="amounts" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Amounts</TabsTrigger>
                      <TabsTrigger value="certificate" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Certificate</TabsTrigger>
                      <TabsTrigger value="custody" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Chain of Custody</TabsTrigger>
                      <TabsTrigger value="notes" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Notes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="p-6 space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Fee Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Fee Type *</Label>
                            <Select>
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select fee type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="bottle_deposit">Bottle Deposit</SelectItem>
                                <SelectItem value="epr_eco_fee">EPR Eco Fee</SelectItem>
                                <SelectItem value="landfill_levy">Landfill Levy</SelectItem>
                                <SelectItem value="certificate">Certificate Fee</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Amount per Unit (R) *</Label>
                            <Input type="number" placeholder="0.00" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Due Date *</Label>
                            <Input type="date" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Status</Label>
                            <Select>
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="amounts" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Collection & Remittance</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Amount Collected (R)</Label>
                            <Input type="number" placeholder="0.00" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Amount Remitted (R)</Label>
                            <Input type="number" placeholder="0.00" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Outstanding (R)</Label>
                            <Input type="number" placeholder="0.00" className="bg-white border-gray-300 shadow-sm" disabled />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="certificate" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Certificate Information</h3>
                        <div>
                          <Label className="text-gray-700 font-medium">Certificate Number</Label>
                          <Input placeholder="Enter certificate number" className="bg-white border-gray-300 shadow-sm" />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="custody" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Chain of Custody Documents</h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <div className="space-y-2">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                            <p className="text-gray-600">Drop documents here or click to upload</p>
                            <p className="text-sm text-gray-500">Supports: PDF, JPG, PNG (Max 10MB each)</p>
                            <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                              Choose Files
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="notes" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Notes</h3>
                        <div>
                          <Label className="text-gray-700 font-medium">Internal Notes</Label>
                          <Textarea 
                            className="w-full mt-1 border-gray-300 shadow-sm"
                            rows={4}
                            placeholder="Add notes about this compliance fee..."
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Compliance Fees Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">All Compliance Fees</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>

                <Card className="bg-white border-gray-200 shadow-md">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Fee Type</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Amount/Unit</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Collected (R)</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Remitted (R)</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Outstanding (R)</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Certificate #</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Due Date</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Documents</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {complianceFees.map((fee, index) => (
                          <tr 
                            key={fee.id} 
                            className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-gray-800 border-r border-gray-200 capitalize">
                              {fee.type.replace('_', ' ')}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-right">
                              R{fee.amount.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-right">
                              R{fee.collected.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-right">
                              R{fee.remitted.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-800 border-r border-gray-200 text-right">
                              R{(fee.collected - fee.remitted).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {fee.certificateNumber || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {new Date(fee.dueDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-center">
                              {fee.chainOfCustody.length}
                            </td>
                            <td className="px-4 py-3 text-sm border-r border-gray-200">
                              <Badge className={`${
                                fee.status === 'paid' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {fee.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-6">
                        <span>Total Records: {complianceFees.length}</span>
                        <span>Total Collected: R{complianceFees.reduce((sum, f) => sum + f.collected, 0).toLocaleString()}</span>
                        <span>Total Remitted: R{complianceFees.reduce((sum, f) => sum + f.remitted, 0).toLocaleString()}</span>
                        <span>Total Outstanding: R{complianceFees.reduce((sum, f) => sum + (f.collected - f.remitted), 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                          Previous
                        </Button>
                        <span className="px-3 py-1 text-sm">Page 1 of 1</span>
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'logistics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Logistics & Haulage</h2>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-md">
                  <Plus className="h-4 w-4 mr-2" />
                  New Cost
                </Button>
              </div>

              {/* Zoho Books Style Form */}
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader className="border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-800">New Logistics Cost</CardTitle>
                      <CardDescription className="text-gray-600">Record a new logistics or haulage cost</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="border-gray-300 text-gray-700">
                        Cancel
                      </Button>
                      <Button variant="outline" className="border-orange-300 text-orange-700">
                        Save Draft
                      </Button>
                      <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                        Save & Record
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 bg-gray-50 border-b border-gray-200 rounded-none">
                      <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Details</TabsTrigger>
                      <TabsTrigger value="vehicle" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Vehicle</TabsTrigger>
                      <TabsTrigger value="route" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Route Info</TabsTrigger>
                      <TabsTrigger value="photos" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Photos</TabsTrigger>
                      <TabsTrigger value="notes" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Notes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="p-6 space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Cost Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Cost Type *</Label>
                            <Select>
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select cost type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="gate_fee">Gate Fee</SelectItem>
                                <SelectItem value="transport">Transport</SelectItem>
                                <SelectItem value="fuel_surcharge">Fuel Surcharge</SelectItem>
                                <SelectItem value="route_settlement">Route Settlement</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Amount (R) *</Label>
                            <Input type="number" placeholder="0.00" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Date *</Label>
                            <Input type="date" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Status</Label>
                            <Select>
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="vehicle" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Vehicle Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Vehicle Registration *</Label>
                            <Input placeholder="ABC123GP" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Driver Name *</Label>
                            <Input placeholder="Enter driver name" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="route" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Route Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Route *</Label>
                            <Input placeholder="JHB-CPT" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Mileage (km)</Label>
                            <Input type="number" placeholder="0" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="photos" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Load Photos</h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <div className="space-y-2">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                            <p className="text-gray-600">Drop photos here or click to upload</p>
                            <p className="text-sm text-gray-500">Supports: JPG, PNG (Max 10MB each)</p>
                            <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                              Choose Files
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="notes" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Notes</h3>
                        <div>
                          <Label className="text-gray-700 font-medium">Internal Notes</Label>
                          <Textarea 
                            className="w-full mt-1 border-gray-300 shadow-sm"
                            rows={4}
                            placeholder="Add notes about this logistics cost..."
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Logistics Costs Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">All Logistics Costs</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>

                <Card className="bg-white border-gray-200 shadow-md">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Cost Type</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Amount (R)</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Vehicle</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Driver</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Route</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Mileage (km)</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Photos</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {logisticsCosts.map((cost, index) => (
                          <tr 
                            key={cost.id} 
                            className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-gray-800 border-r border-gray-200 capitalize">
                              {cost.type.replace('_', ' ')}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-800 border-r border-gray-200 text-right">
                              R{cost.amount.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {cost.vehicleReg}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {cost.driverName}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {cost.route}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-right">
                              {cost.mileage}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {new Date(cost.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-center">
                              {cost.loadPhotos.length}
                            </td>
                            <td className="px-4 py-3 text-sm border-r border-gray-200">
                              <Badge className={`${
                                cost.status === 'paid' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {cost.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-6">
                        <span>Total Records: {logisticsCosts.length}</span>
                        <span>Total Amount: R{logisticsCosts.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}</span>
                        <span>Total Mileage: {logisticsCosts.reduce((sum, c) => sum + c.mileage, 0)} km</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                          Previous
                        </Button>
                        <span className="px-3 py-1 text-sm">Page 1 of 1</span>
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'cash-drawer' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Cash Drawer</h2>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-md">
                  <Plus className="h-4 w-4 mr-2" />
                  New Drawer
                </Button>
              </div>

              {/* Zoho Books Style Form */}
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader className="border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-800">New Cash Drawer</CardTitle>
                      <CardDescription className="text-gray-600">Open a new cash drawer for daily operations</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="border-gray-300 text-gray-700">
                        Cancel
                      </Button>
                      <Button variant="outline" className="border-orange-300 text-orange-700">
                        Save Draft
                      </Button>
                      <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                        Save & Open
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 bg-gray-50 border-b border-gray-200 rounded-none">
                      <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Details</TabsTrigger>
                      <TabsTrigger value="balances" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Balances</TabsTrigger>
                      <TabsTrigger value="deposit" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Deposit</TabsTrigger>
                      <TabsTrigger value="transactions" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Transactions</TabsTrigger>
                      <TabsTrigger value="notes" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Notes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="p-6 space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Drawer Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Date *</Label>
                            <Input type="date" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Drawer ID</Label>
                            <Input placeholder="DRAWER-001" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Opening Balance (R) *</Label>
                            <Input type="number" placeholder="0.00" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Status</Label>
                            <Select>
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                                <SelectItem value="reconciled">Reconciled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="balances" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Cash Balances</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Cash Received (R)</Label>
                            <Input type="number" placeholder="0.00" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Cash Paid (R)</Label>
                            <Input type="number" placeholder="0.00" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Closing Balance (R)</Label>
                            <Input type="number" placeholder="0.00" className="bg-white border-gray-300 shadow-sm" disabled />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Over/Short (R)</Label>
                            <Input type="number" placeholder="0.00" className="bg-white border-gray-300 shadow-sm" disabled />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="deposit" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Bank Deposit</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Bank Deposit Amount (R)</Label>
                            <Input type="number" placeholder="0.00" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Deposit Slip Number</Label>
                            <Input placeholder="DEP-2024-001" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="transactions" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Transactions</h3>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Reference</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700"></th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              <tr>
                                <td className="px-4 py-3">
                                  <Select>
                                    <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="receipt">Receipt</SelectItem>
                                      <SelectItem value="payment">Payment</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </td>
                                <td className="px-4 py-3">
                                  <Input type="number" placeholder="0.00" className="bg-white border-gray-300 shadow-sm" />
                                </td>
                                <td className="px-4 py-3">
                                  <Input placeholder="Reference" className="bg-white border-gray-300 shadow-sm" />
                                </td>
                                <td className="px-4 py-3">
                                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Transaction
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="notes" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Notes</h3>
                        <div>
                          <Label className="text-gray-700 font-medium">Internal Notes</Label>
                          <Textarea 
                            className="w-full mt-1 border-gray-300 shadow-sm"
                            rows={4}
                            placeholder="Add notes about this cash drawer..."
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Cash Drawers Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">All Cash Drawers</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>

                <Card className="bg-white border-gray-200 shadow-md">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Opening Balance</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Cash Received</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Cash Paid</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Closing Balance</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Over/Short</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Bank Deposit</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Deposit Slip</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Transactions</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {cashDrawers.map((drawer, index) => (
                          <tr 
                            key={drawer.id} 
                            className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-gray-800 border-r border-gray-200">
                              {new Date(drawer.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-right">
                              R{drawer.openingBalance.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-right">
                              R{drawer.cashReceived.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-right">
                              R{drawer.cashPaid.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-800 border-r border-gray-200 text-right">
                              R{drawer.closingBalance.toLocaleString()}
                            </td>
                            <td className={`px-4 py-3 text-sm font-semibold border-r border-gray-200 text-right ${
                              drawer.overShort >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              R{drawer.overShort.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-right">
                              R{drawer.bankDeposit.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {drawer.depositSlip}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-center">
                              {drawer.transactions.length}
                            </td>
                            <td className="px-4 py-3 text-sm border-r border-gray-200">
                              <Badge className={`${
                                drawer.reconciled 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {drawer.reconciled ? 'Reconciled' : 'Pending'}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-6">
                        <span>Total Records: {cashDrawers.length}</span>
                        <span>Total Cash Received: R{cashDrawers.reduce((sum, d) => sum + d.cashReceived, 0).toLocaleString()}</span>
                        <span>Total Cash Paid: R{cashDrawers.reduce((sum, d) => sum + d.cashPaid, 0).toLocaleString()}</span>
                        <span>Total Bank Deposits: R{cashDrawers.reduce((sum, d) => sum + d.bankDeposit, 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                          Previous
                        </Button>
                        <span className="px-3 py-1 text-sm">Page 1 of 1</span>
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'vendors' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Vendors & Customers</h2>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-md">
                  <Plus className="h-4 w-4 mr-2" />
                  New Vendor
                </Button>
              </div>

              {/* Zoho Books Style Form */}
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader className="border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-800">New Vendor/Customer</CardTitle>
                      <CardDescription className="text-gray-600">Register a new vendor or customer</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="border-gray-300 text-gray-700">
                        Cancel
                      </Button>
                      <Button variant="outline" className="border-orange-300 text-orange-700">
                        Save Draft
                      </Button>
                      <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                        Save & Activate
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 bg-gray-50 border-b border-gray-200 rounded-none">
                      <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Details</TabsTrigger>
                      <TabsTrigger value="contact" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Contact</TabsTrigger>
                      <TabsTrigger value="financial" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Financial</TabsTrigger>
                      <TabsTrigger value="kyc" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">KYC</TabsTrigger>
                      <TabsTrigger value="notes" className="data-[state=active]:bg-white data-[state=active]:text-orange-600">Notes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="p-6 space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Vendor Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Name *</Label>
                            <Input placeholder="Enter vendor/customer name" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Type *</Label>
                            <Select>
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="supplier">Supplier</SelectItem>
                                <SelectItem value="customer">Customer</SelectItem>
                                <SelectItem value="both">Both</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Contact Person</Label>
                            <Input placeholder="Enter contact name" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Incoterms</Label>
                            <Select>
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select incoterms" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="FOB">FOB</SelectItem>
                                <SelectItem value="CIF">CIF</SelectItem>
                                <SelectItem value="EXW">EXW</SelectItem>
                                <SelectItem value="DDP">DDP</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="contact" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Email *</Label>
                            <Input type="email" placeholder="email@example.com" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Phone *</Label>
                            <Input type="tel" placeholder="+27..." className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Address</Label>
                            <Input placeholder="Enter address" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="financial" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Financial Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Credit Limit (R)</Label>
                            <Input type="number" placeholder="0.00" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Payment Terms</Label>
                            <Select>
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select payment terms" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="net15">Net 15 days</SelectItem>
                                <SelectItem value="net30">Net 30 days</SelectItem>
                                <SelectItem value="net60">Net 60 days</SelectItem>
                                <SelectItem value="due_on_receipt">Due on Receipt</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="kyc" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">KYC & Compliance</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">KYC Status</Label>
                            <Select>
                              <SelectTrigger className="bg-white border-gray-300 shadow-sm">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center space-x-2 pt-8">
                            <input type="checkbox" id="blacklist" className="rounded" />
                            <Label htmlFor="blacklist" className="text-gray-700 font-medium">Blacklist Flag</Label>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="notes" className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Notes</h3>
                        <div>
                          <Label className="text-gray-700 font-medium">Internal Notes</Label>
                          <Textarea 
                            className="w-full mt-1 border-gray-300 shadow-sm"
                            rows={4}
                            placeholder="Add notes about this vendor/customer..."
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Vendors Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">All Vendors & Customers</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>

                <Card className="bg-white border-gray-200 shadow-md">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Name</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Type</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Contact</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Email</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Phone</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Credit Limit</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">Payment Terms</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">FX Gains</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">FX Losses</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">KYC Status</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {vendorCustomers.map((vendor, index) => (
                          <tr 
                            key={vendor.id} 
                            className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-gray-800 border-r border-gray-200">
                              {vendor.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 capitalize">
                              {vendor.type}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {vendor.contact}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {vendor.email}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {vendor.phone}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 text-right">
                              R{vendor.creditLimit.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {vendor.paymentTerms}
                            </td>
                            <td className="px-4 py-3 text-sm text-green-600 border-r border-gray-200 text-right">
                              R{vendor.fxGains.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-red-600 border-r border-gray-200 text-right">
                              R{vendor.fxLosses.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm border-r border-gray-200">
                              <Badge className={`${
                                vendor.kycStatus === 'approved' 
                                  ? 'bg-green-100 text-green-800' 
                                  : vendor.kycStatus === 'pending' 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-red-100 text-red-800'
                              }`}>
                                {vendor.kycStatus}
                              </Badge>
                              {vendor.blacklistFlag && (
                                <Badge variant="destructive" className="ml-1">Blacklisted</Badge>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-6">
                        <span>Total Records: {vendorCustomers.length}</span>
                        <span>Total Credit Limit: R{vendorCustomers.reduce((sum, v) => sum + v.creditLimit, 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                          Previous
                        </Button>
                        <span className="px-3 py-1 text-sm">Page 1 of 1</span>
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-100">Reports & Analytics</h2>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-gray-600 text-gray-300">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Key Performance Indicators - from live data */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-100">R{revenue.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                        <p className="text-xs text-gray-500">From paid invoices</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-full">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Material Processed</p>
                        <p className="text-2xl font-bold text-gray-100">{materialProcessedTons.toFixed(1)} tons</p>
                        <p className="text-xs text-gray-500">From weighbridge</p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-full">
                        <Package className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Outstanding</p>
                        <p className="text-2xl font-bold text-gray-100">R{outstanding.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                        <p className="text-xs text-gray-500">Unpaid invoices</p>
                      </div>
                      <div className="p-3 bg-orange-100 rounded-full">
                        <Recycle className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Cost per Ton</p>
                        <p className="text-2xl font-bold text-gray-100">{materialProcessedTons > 0 ? `R${costPerTon.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '-'}</p>
                        <p className="text-xs text-gray-500">Spend / tons</p>
                      </div>
                      <div className="p-3 bg-red-100 rounded-full">
                        <BarChart3 className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Material Performance - from weighbridge data */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-100">Material Performance</CardTitle>
                    <CardDescription className="text-gray-400">Revenue by material type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {materialByRevenue.length === 0 ? (
                        <p className="text-gray-500 text-sm">No material data yet. Add weighbridge tickets and material pricing.</p>
                      ) : (
                        materialByRevenue.map(([mat, val], i) => {
                          const total = materialByRevenue.reduce((s,[,v])=>s+v,0)
                          const pct = total > 0 ? ((val/total)*100).toFixed(1) : '0'
                          const colors = ['bg-orange-500','bg-blue-500','bg-green-500','bg-cyan-500','bg-yellow-500']
                          return (
                            <div key={mat} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 ${colors[i%5]} rounded-full`}></div>
                                <span className="text-gray-300">{mat}</span>
                              </div>
                              <div className="text-right">
                                <p className="text-gray-100 font-semibold">R{val.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                                <p className="text-xs text-gray-400">{pct}%</p>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-100">Supplier Performance</CardTitle>
                    <CardDescription className="text-gray-400">Top suppliers by volume</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {supplierByVolume.length === 0 ? (
                        <p className="text-gray-500 text-sm">No supplier data yet. Add weighbridge tickets.</p>
                      ) : (
                        supplierByVolume.map(([name, {kg, value}]) => (
                          <div key={name} className="flex items-center justify-between">
                            <div>
                              <p className="text-gray-100 font-semibold">{name}</p>
                              <p className="text-sm text-gray-400">{(kg/1000).toFixed(1)} tons</p>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-100 font-semibold">R{value.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Financial Reports - from live data */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-100">Profit & Loss</CardTitle>
                    <CardDescription className="text-gray-400">Summary from invoices & expenses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Revenue</span>
                        <span className="text-gray-100">R{revenue.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Cost of Goods (est.)</span>
                        <span className="text-gray-100">-R{cogsEstimate.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Operating Expenses</span>
                        <span className="text-gray-100">-R{Math.max(0, operatingExpenses).toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="border-t border-gray-600 pt-3">
                        <div className="flex justify-between">
                          <span className="text-gray-100 font-semibold">Net Profit</span>
                          <span className={netProfit >= 0 ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>R{netProfit.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-100">Cash Flow</CardTitle>
                    <CardDescription className="text-gray-400">Cash position</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Cash In (payments)</span>
                        <span className="text-green-400">R{cashIn.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Cash Out (expenses)</span>
                        <span className="text-red-400">-R{cashOut.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="border-t border-gray-600 pt-3">
                        <div className="flex justify-between">
                          <span className="text-gray-100 font-semibold">Bank Balance</span>
                          <span className="text-green-400 font-semibold">R{bankBalance.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-100">Compliance Status</CardTitle>
                    <CardDescription className="text-gray-400">EPR fees</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Collected</span>
                        <span className="text-gray-100">R{complianceCollected.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Remitted</span>
                        <span className="text-gray-100">R{complianceRemitted.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Outstanding</span>
                        <span className="text-yellow-400">R{complianceOutstanding.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="border-t border-gray-600 pt-3">
                        <div className="flex justify-between">
                          <span className="text-gray-100 font-semibold">Rate</span>
                          <span className="text-green-400 font-semibold">{complianceCollected > 0 ? Math.round((complianceRemitted/complianceCollected)*100) : 0}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Reports Table */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-100">Detailed Reports</CardTitle>
                  <CardDescription className="text-gray-400">
                    Sebenza Nathi Waste recycling & financial reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div
                        className="p-4 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() => router.push("/reports/income")}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-orange-500" />
                          <div>
                            <p className="text-gray-100 font-semibold">Profit & Loss</p>
                            <p className="text-sm text-gray-400">Monthly P&L for recycling operations</p>
                          </div>
                        </div>
                      </div>
                      <div
                        className="p-4 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() => router.push("/reports/balance")}
                      >
                        <div className="flex items-center gap-3">
                          <BarChart3 className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-gray-100 font-semibold">Balance Sheet</p>
                            <p className="text-sm text-gray-400">Assets, liabilities & equity for Sebenza Nathi Waste</p>
                          </div>
                        </div>
                      </div>
                      <div
                        className="p-4 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() => router.push("/reports/cashflow")}
                      >
                        <div className="flex items-center gap-3">
                          <BarChart3 className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-gray-100 font-semibold">Cash Flow</p>
                            <p className="text-sm text-gray-400">Cash movement from recycling cashbook & bank</p>
                          </div>
                        </div>
                      </div>
                      <div
                        className="p-4 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() => router.push("/reports/income")}
                      >
                        <div className="flex items-center gap-3">
                          <Package className="h-5 w-5 text-purple-500" />
                          <div>
                            <p className="text-gray-100 font-semibold">Inventory Valuation</p>
                            <p className="text-sm text-gray-400">Bales, materials & stock valuation</p>
                          </div>
                        </div>
                      </div>
                      <div
                        className="p-4 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() => router.push("/reports/funder")}
                      >
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-red-500" />
                          <div>
                            <p className="text-gray-100 font-semibold">Compliance Costs</p>
                            <p className="text-sm text-gray-400">EPR, landfill levies & other compliance fees</p>
                          </div>
                        </div>
                      </div>
                      <div
                        className="p-4 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() => router.push("/reports/funder")}
                      >
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-yellow-500" />
                          <div>
                            <p className="text-gray-100 font-semibold">Vendor Aging</p>
                            <p className="text-sm text-gray-400">Outstanding payouts to suppliers & partners</p>
                          </div>
                        </div>
                      </div>
                      <div
                        className="p-4 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() => router.push("/reports/impact")}
                      >
                        <div className="flex items-center gap-3">
                          <Target className="h-5 w-5 text-cyan-500" />
                          <div>
                            <p className="text-gray-100 font-semibold">Material Analysis</p>
                            <p className="text-sm text-gray-400">Material performance across Aluminium Cans, Cardboard, Glass, Paper, PET Bottles, etc.</p>
                          </div>
                        </div>
                      </div>
                      <div
                        className="p-4 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() => router.push("/reports/cashflow")}
                      >
                        <div className="flex items-center gap-3">
                          <Truck className="h-5 w-5 text-pink-500" />
                          <div>
                            <p className="text-gray-100 font-semibold">Logistics Report</p>
                            <p className="text-sm text-gray-400">Transport & haulage costs per route</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Calculator className="h-5 w-5 text-indigo-500" />
                          <div>
                            <p className="text-gray-100 font-semibold">Trial Balance</p>
                            <p className="text-sm text-gray-400">Account balances for Sebenza ledger</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'documents' && <Documents />}

          {activeSection === 'ocr' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-100">OCR & Scale Integration</h2>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-gray-600 text-gray-300">
                    <Download className="h-4 w-4 mr-2" />
                    Import Data
                  </Button>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="h-4 w-4 mr-2" />
                    New Integration
                  </Button>
                </div>
              </div>

              {/* Integration Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Scale Integration</p>
                        <p className="text-2xl font-bold text-green-400">Online</p>
                        <p className="text-xs text-gray-500">Serial: COM3</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-full">
                        <Target className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">OCR Processing</p>
                        <p className="text-2xl font-bold text-blue-400">Active</p>
                        <p className="text-xs text-gray-500">24/7 monitoring</p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-full">
                        <FileSpreadsheet className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="bg-gray-800 border-gray-700 cursor-pointer hover:border-orange-500 transition-colors"
                  onClick={() => handleSectionClick('documents')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Documents Processed</p>
                        <p className="text-2xl font-bold text-gray-100">1,247</p>
                        <p className="text-xs text-green-400">+15% this week</p>
                        <p className="text-xs text-orange-400 mt-1">View in Documents →</p>
                      </div>
                      <div className="p-3 bg-orange-100 rounded-full">
                        <FileText className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Accuracy Rate</p>
                        <p className="text-2xl font-bold text-gray-100">94.2%</p>
                        <p className="text-xs text-green-400">+2.1% improvement</p>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-full">
                        <CheckCircle className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Scale Integration */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-100">Scale Integration</CardTitle>
                  <CardDescription className="text-gray-400">Connected scales and weight capture</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="p-4 border border-gray-600 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-gray-100 font-semibold">Main Weighbridge</h3>
                            <Badge className="bg-green-100 text-green-800">Connected</Badge>
                          </div>
                          <p className="text-sm text-gray-400">Serial: COM3, Baud: 9600</p>
                          <p className="text-sm text-gray-400">Last Reading: 2,450 kg</p>
                          <p className="text-xs text-gray-500">Updated: 2 minutes ago</p>
                        </div>
                        
                        <div className="p-4 border border-gray-600 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-gray-100 font-semibold">Secondary Scale</h3>
                            <Badge className="bg-yellow-100 text-yellow-800">Standby</Badge>
                          </div>
                          <p className="text-sm text-gray-400">IP: 192.168.1.100:8080</p>
                          <p className="text-sm text-gray-400">Last Reading: 1,200 kg</p>
                          <p className="text-xs text-gray-500">Updated: 15 minutes ago</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-700 rounded-lg">
                          <h4 className="text-gray-100 font-semibold mb-2">Auto-Capture Settings</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Auto-capture on stable weight</span>
                              <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Stability threshold</span>
                              <span className="text-gray-100">±0.5 kg</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Capture delay</span>
                              <span className="text-gray-100">3 seconds</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* OCR Processing */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-100">OCR Processing</CardTitle>
                      <CardDescription className="text-gray-400">Document recognition and data extraction</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      className="border-orange-500 text-orange-400 hover:bg-orange-500/20"
                      onClick={() => handleSectionClick('documents')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View in Documents
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-gray-100 font-semibold">Supported Documents</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 p-3 border border-gray-600 rounded-lg">
                            <FileText className="h-5 w-5 text-orange-500" />
                            <div>
                              <p className="text-gray-100 font-medium">Weighbridge Tickets</p>
                              <p className="text-sm text-gray-400">Auto-extract weights, vehicle details</p>
                            </div>
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 border border-gray-600 rounded-lg">
                            <Receipt className="h-5 w-5 text-blue-500" />
                            <div>
                              <p className="text-gray-100 font-medium">Supplier Invoices</p>
                              <p className="text-sm text-gray-400">Extract amounts, dates, vendor info</p>
                            </div>
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 border border-gray-600 rounded-lg">
                            <CreditCard className="h-5 w-5 text-green-500" />
                            <div>
                              <p className="text-gray-100 font-medium">ID Documents</p>
                              <p className="text-sm text-gray-400">KYC verification, ID numbers</p>
                            </div>
                            <Badge className="bg-yellow-100 text-yellow-800">Testing</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="text-gray-100 font-semibold">Processing Queue</h4>
                        <p className="text-xs text-gray-500 mb-2">Processed docs go to Documents</p>
                        <div className="space-y-2">
                          {ocrQueue.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                              <div className="flex items-center gap-3">
                                <FileText className="h-4 w-4 text-orange-500" />
                                <div>
                                  <p className="text-gray-100 text-sm">{item.name}</p>
                                  <p className="text-xs text-gray-400">
                                    {item.status === 'processing' && 'Processing...'}
                                    {item.status === 'done' && 'Completed'}
                                    {item.status === 'error' && 'Failed - Retry'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {item.status === 'done' && !item.sentToDocs && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-orange-500 text-orange-400 hover:bg-orange-500/20 text-xs"
                                    onClick={() => sendProcessedToDocuments(item)}
                                  >
                                    Send to Documents
                                  </Button>
                                )}
                                {item.status === 'done' && item.sentToDocs && (
                                  <Badge className="bg-green-100 text-green-800">In Documents</Badge>
                                )}
                                {item.status === 'processing' && <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>}
                                {item.status === 'done' && !item.sentToDocs && <Badge className="bg-green-100 text-green-800">Done</Badge>}
                                {item.status === 'error' && <Badge className="bg-red-100 text-red-800">Error</Badge>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Import/Export */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-100">CSV Import</CardTitle>
                    <CardDescription className="text-gray-400">Import data from external systems</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border border-gray-600 rounded-lg">
                        <h4 className="text-gray-100 font-semibold mb-2">Bank Statements</h4>
                        <p className="text-sm text-gray-400 mb-3">Import bank transaction data</p>
                        <Button variant="outline" className="w-full border-gray-600 text-gray-300">
                          <Download className="h-4 w-4 mr-2" />
                          Upload CSV
                        </Button>
                      </div>
                      
                      <div className="p-4 border border-gray-600 rounded-lg">
                        <h4 className="text-gray-100 font-semibold mb-2">Supplier Data</h4>
                        <p className="text-sm text-gray-400 mb-3">Import supplier information</p>
                        <Button variant="outline" className="w-full border-gray-600 text-gray-300">
                          <Download className="h-4 w-4 mr-2" />
                          Upload CSV
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-100">Webhook Integration</CardTitle>
                    <CardDescription className="text-gray-400">Real-time data synchronization</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border border-gray-600 rounded-lg">
                        <h4 className="text-gray-100 font-semibold mb-2">Payment Gateway</h4>
                        <p className="text-sm text-gray-400 mb-2">Webhook URL: https://api.sebenza.co.za/webhooks/payments</p>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      
                      <div className="p-4 border border-gray-600 rounded-lg">
                        <h4 className="text-gray-100 font-semibold mb-2">Scale Data</h4>
                        <p className="text-sm text-gray-400 mb-2">Webhook URL: https://api.sebenza.co.za/webhooks/scale</p>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      
                      <div className="p-4 border border-gray-600 rounded-lg">
                        <h4 className="text-gray-100 font-semibold mb-2">Banking API</h4>
                        <p className="text-sm text-gray-400 mb-2">Webhook URL: https://api.sebenza.co.za/webhooks/banking</p>
                        <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Entry Dialog (from Quick Add dropdown) */}
      <QuickEntry
        open={showQuickEntryDialog}
        onOpenChange={setShowQuickEntryDialog}
        initialType={quickEntryType}
        onSave={handleQuickEntrySave}
      />

      {/* New Client Dialog */}
      <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingClientMaster?.id ? 'Edit Client' : 'Add Client'}</DialogTitle>
          </DialogHeader>
          {editingClientMaster && (
            <div className="space-y-4">
              <div>
                <Label className="text-gray-700 font-medium">Client Name</Label>
                <Input
                  className="mt-1 bg-white border-gray-300 shadow-sm"
                  value={editingClientMaster.name}
                  onChange={(e) =>
                    setEditingClientMaster(prev => prev ? { ...prev, name: e.target.value } : null)
                  }
                  placeholder="Client or company name"
                />
              </div>
              <div>
                <Label className="text-gray-700 font-medium">Billing Address</Label>
                <Textarea
                  className="mt-1 bg-white border-gray-300 shadow-sm"
                  rows={3}
                  value={editingClientMaster.billingAddress ?? ''}
                  onChange={(e) =>
                    setEditingClientMaster(prev => prev ? { ...prev, billingAddress: e.target.value } : null)
                  }
                  placeholder={"Street address\nSuburb, City, Postal code\nCountry"}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700 font-medium">VAT Number</Label>
                  <Input
                    className="mt-1 bg-white border-gray-300 shadow-sm"
                    value={editingClientMaster.vatNumber ?? ''}
                    onChange={(e) =>
                      setEditingClientMaster(prev => prev ? { ...prev, vatNumber: e.target.value } : null)
                    }
                    placeholder="Client VAT number"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 font-medium">Default Payment Terms</Label>
                  <Input
                    className="mt-1 bg-white border-gray-300 shadow-sm"
                    value={editingClientMaster.defaultPaymentTerms ?? ''}
                    onChange={(e) =>
                      setEditingClientMaster(prev => prev ? { ...prev, defaultPaymentTerms: e.target.value } : null)
                    }
                    placeholder="e.g. 30 days"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700 font-medium">Email</Label>
                  <Input
                    className="mt-1 bg-white border-gray-300 shadow-sm"
                    value={editingClientMaster.email ?? ''}
                    onChange={(e) =>
                      setEditingClientMaster(prev => prev ? { ...prev, email: e.target.value } : null)
                    }
                    placeholder="billing@example.com"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 font-medium">Phone</Label>
                  <Input
                    className="mt-1 bg-white border-gray-300 shadow-sm"
                    value={editingClientMaster.phone ?? ''}
                    onChange={(e) =>
                      setEditingClientMaster(prev => prev ? { ...prev, phone: e.target.value } : null)
                    }
                    placeholder="+27 ..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setClientDialogOpen(false)
                    setEditingClientMaster(null)
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveClientMaster} className="bg-orange-600 hover:bg-orange-700">
                  Save Client
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog - comprehensive editor */}
      <Dialog open={invDialog} onOpenChange={setInvDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingInv && invoices.some(i => i.id === editingInv.id) ? 'Edit Invoice' : 'New Invoice'}
            </DialogTitle>
          </DialogHeader>
          {editingInv && (
            <div className="space-y-6">
              {/* Core invoice & client info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Invoice Number</Label>
                  <Input
                    value={editingInv.number}
                    onChange={(e) => setEditingInv({ ...editingInv, number: e.target.value })}
                    placeholder="INV-0003"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Client</Label>
                  <Input
                    value={editingInv.client}
                    onChange={(e) => setEditingInv({ ...editingInv, client: e.target.value })}
                    placeholder="Client name"
                  />
                </div>
              </div>

              {/* Dates & status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Issue Date</Label>
                  <Input
                    type="date"
                    value={editingInv.createdDate ? new Date(editingInv.createdDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)}
                    onChange={(e) =>
                      setEditingInv({
                        ...editingInv,
                        createdDate: e.target.value ? new Date(e.target.value).toISOString() : editingInv.createdDate,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Due Date</Label>
                  <Input
                    type="date"
                    value={editingInv.dueDate ? new Date(editingInv.dueDate).toISOString().slice(0, 10) : ''}
                    onChange={(e) =>
                      setEditingInv({
                        ...editingInv,
                        dueDate: e.target.value ? new Date(e.target.value).toISOString() : editingInv.dueDate,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <Select
                    value={editingInv.status}
                    onValueChange={(v) => setEditingInv({ ...editingInv, status: v as InvoiceStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description / notes */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Description</Label>
                <Textarea
                  value={editingInv.description || ''}
                  onChange={(e) => setEditingInv({ ...editingInv, description: e.target.value })}
                  placeholder="Describe the services or materials for this invoice"
                  rows={3}
                />
              </div>

              {/* Amounts summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Amount (excl. VAT)</Label>
                  <Input
                    type="number"
                    value={editingInv.amount}
                    onChange={(e) =>
                      setEditingInv({
                        ...editingInv,
                        amount: Number(e.target.value || 0),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">VAT / Tax</Label>
                  <Input
                    type="number"
                    value={editingInv.tax ?? 0}
                    onChange={(e) =>
                      setEditingInv({
                        ...editingInv,
                        tax: Number(e.target.value || 0),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Total (incl. VAT)</Label>
                  <Input
                    readOnly
                    value={(editingInv.amount + (editingInv.tax || 0)).toLocaleString('en-ZA', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setInvDialog(false)
                    setEditingInv(null)
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={() => saveInv()} className="bg-orange-600 hover:bg-orange-700">
                  Save Invoice
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Expense Dialog */}
      <Dialog open={expDialog} onOpenChange={setExpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingExp && expenses.some(e => e.id === editingExp.id) ? 'Edit Expense' : 'New Expense'}
            </DialogTitle>
          </DialogHeader>
          {editingExp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Vendor</Label>
                  <Input 
                    value={editingExp.vendor} 
                    onChange={(e) => setEditingExp({ ...editingExp, vendor: e.target.value })} 
                    placeholder="Vendor Name"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input 
                    value={editingExp.category} 
                    onChange={(e) => setEditingExp({ ...editingExp, category: e.target.value })} 
                    placeholder="Category"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount</Label>
                  <Input 
                    type="number" 
                    value={editingExp.amount} 
                    onChange={(e) => setEditingExp({ ...editingExp, amount: Number(e.target.value || 0) })} 
                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input 
                    type="date" 
                    value={new Date(editingExp.date).toISOString().slice(0, 10)} 
                    onChange={(e) => setEditingExp({ 
                      ...editingExp, 
                      date: e.target.value ? new Date(e.target.value).toISOString() : editingExp.date 
                    })} 
                  />
                </div>
              </div>
              
              <div>
                <Label>Notes</Label>
                <Input 
                  value={editingExp.notes || ''} 
                  onChange={(e) => setEditingExp({ ...editingExp, notes: e.target.value })} 
                  placeholder="Additional notes"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="reimbursable" 
                  checked={editingExp.reimbursable} 
                  onChange={(e) => setEditingExp({ ...editingExp, reimbursable: e.target.checked })} 
                />
                <Label htmlFor="reimbursable">Reimbursable</Label>
              </div>
              
              <div className="flex items-center justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => { setExpDialog(false); setEditingExp(null) }}>
                  Cancel
                </Button>
                <Button onClick={saveExp} className="bg-orange-600 hover:bg-orange-700">
                  Save Expense
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm.open} onOpenChange={(open) => !open && setDeleteConfirm({ open: false, type: '', id: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirm({ open: false, type: '', id: null })}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}



