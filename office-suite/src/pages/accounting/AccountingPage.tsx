"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { supabase, isSupabaseEnabled } from "@/lib/supabase-client"

// Types for comprehensive recycling center accounting system
type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'
type PaymentStatus = 'pending' | 'completed' | 'failed'
type AccountType = 'asset' | 'liability' | 'equity' | 'income' | 'expense'
type MaterialGrade = 'A' | 'B' | 'C' | 'D' | 'Mixed'
type PaymentMethod = 'cash' | 'eft' | 'bank_transfer' | 'cheque'
type WeighbridgeStatus = 'pending' | 'weighed' | 'processed' | 'paid'

// Core accounting types
type Invoice = { 
  id: string; number: string; client: string; amount: number; dueDate: string; 
  status: InvoiceStatus; createdDate: string; description?: string; tax?: number;
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
  id: string; invoiceId?: string; amount: number; date: string; method: string;
  status: PaymentStatus; reference?: string;
}
type BankAccount = {
  id: string; name: string; type: 'checking' | 'savings' | 'credit'; balance: number;
  bank: string; accountNumber: string;
}
type ChartAccount = {
  id: string; code: string; name: string; type: AccountType; parentId?: string;
  balance: number; description?: string;
}

// Recycling center specific types
type WeighbridgeTicket = {
  id: string; ticketNumber: string; supplierId: string; material: string; grade: MaterialGrade;
  grossWeight: number; tareWeight: number; netWeight: number; contamination: number;
  photos: string[]; status: WeighbridgeStatus; date: string; location: string;
  driverName: string; vehicleReg: string; notes?: string;
}

type Supplier = {
  id: string; name: string; contact: string; email: string; phone: string;
  idNumber: string; address: string; bankDetails: string; kycStatus: 'pending' | 'approved' | 'rejected';
  blacklistFlag: boolean; paymentMethod: PaymentMethod; creditLimit: number;
  totalPayouts: number; lastPayment: string; status: 'active' | 'inactive';
}

type MaterialPricing = {
  id: string; material: string; grade: MaterialGrade; basePrice: number;
  moistureAdjustment: number; contaminationDeduction: number; 
  priceTier: 'premium' | 'standard' | 'discount'; effectiveDate: string;
  reviewDate: string; supplierId?: string; customerId?: string;
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

// Sample data for recycling center
const initialInvoices: Invoice[] = [
  { id:'i-1', number:'INV-1001', client:'MetalCorp SA', amount: 25000, dueDate: nowIso(), status: 'sent', createdDate: nowIso(), description: 'Copper Scrap Grade A', tax: 2500 },
  { id:'i-2', number:'INV-1002', client:'PlasticRecycle Ltd', amount: 15000, dueDate: nowIso(), status: 'draft', createdDate: nowIso(), description: 'PET Bottles Grade B', tax: 1500 },
  { id:'i-3', number:'INV-1003', client:'PaperTrader', amount: 8000, dueDate: nowIso(), status: 'paid', createdDate: nowIso(), description: 'Cardboard Grade C', tax: 800 },
]

const initialExpenses: Expense[] = [
  { id:'x-1', vendor:'Eskom', category:'Utilities', amount: 15000, date: nowIso(), notes:'Monthly electricity for processing', reimbursable: false },
  { id:'x-2', vendor:'ScaleTech', category:'Equipment', amount: 45000, date: nowIso(), reimbursable: false },
  { id:'x-3', vendor:'Waste Management', category:'Services', amount: 12000, date: nowIso(), reimbursable: false },
]

const initialBills: Bill[] = [
  { id:'b-1', vendor:'Eskom', amount: 15000, dueDate: nowIso(), status: 'unpaid', description: 'Monthly electricity', category: 'Utilities' },
  { id:'b-2', vendor:'Municipality', amount: 8000, dueDate: nowIso(), status: 'paid', description: 'Water and sewerage', category: 'Utilities' },
]

const initialPayments: Payment[] = [
  { id:'p-1', invoiceId: 'i-3', amount: 8000, date: nowIso(), method: 'EFT', status: 'completed', reference: 'TXN-001' },
]

const initialBankAccounts: BankAccount[] = [
  { id:'ba-1', name: 'Business Checking', type: 'checking', balance: 250000, bank: 'Standard Bank', accountNumber: '****1234' },
  { id:'ba-2', name: 'Business Savings', type: 'savings', balance: 500000, bank: 'Standard Bank', accountNumber: '****5678' },
]

const initialChartAccounts: ChartAccount[] = [
  { id:'ca-1', code: '1000', name: 'Cash', type: 'asset', balance: 250000, description: 'Cash on hand' },
  { id:'ca-2', code: '1100', name: 'Accounts Receivable', type: 'asset', balance: 120000, description: 'Money owed by customers' },
  { id:'ca-3', code: '2000', name: 'Accounts Payable', type: 'liability', balance: 50000, description: 'Money owed to vendors' },
  { id:'ca-4', code: '3000', name: 'Owner Equity', type: 'equity', balance: 320000, description: 'Owner investment' },
  { id:'ca-5', code: '4000', name: 'Recycling Revenue', type: 'income', balance: 500000, description: 'Revenue from recycling' },
  { id:'ca-6', code: '5000', name: 'Processing Expenses', type: 'expense', balance: 80000, description: 'Processing and operational expenses' },
]

// Recycling center specific sample data
const initialWeighbridgeTickets: WeighbridgeTicket[] = [
  { id:'wb-1', ticketNumber:'WB-001', supplierId:'sup-1', material:'Copper', grade:'A', grossWeight:2500, tareWeight:500, netWeight:2000, contamination:50, photos:[], status:'weighed', date:nowIso(), location:'Gate 1', driverName:'John Doe', vehicleReg:'ABC123GP', notes:'High quality copper' },
  { id:'wb-2', ticketNumber:'WB-002', supplierId:'sup-2', material:'Aluminum', grade:'B', grossWeight:1800, tareWeight:300, netWeight:1500, contamination:75, photos:[], status:'processed', date:nowIso(), location:'Gate 2', driverName:'Jane Smith', vehicleReg:'XYZ789GP', notes:'Mixed aluminum cans' },
]

const initialSuppliers: Supplier[] = [
  { id:'sup-1', name:'MetalCorp SA', contact:'Mike Johnson', email:'mike@metalcorp.co.za', phone:'+27123456789', idNumber:'1234567890123', address:'123 Industrial St, JHB', bankDetails:'Standard Bank 123456789', kycStatus:'approved', blacklistFlag:false, paymentMethod:'eft', creditLimit:100000, totalPayouts:50000, lastPayment:nowIso(), status:'active' },
  { id:'sup-2', name:'ScrapDealers Ltd', contact:'Sarah Wilson', email:'sarah@scrapdealers.co.za', phone:'+27987654321', idNumber:'9876543210987', address:'456 Recycling Ave, CPT', bankDetails:'FNB 987654321', kycStatus:'approved', blacklistFlag:false, paymentMethod:'cash', creditLimit:75000, totalPayouts:30000, lastPayment:nowIso(), status:'active' },
]

const initialMaterialPricing: MaterialPricing[] = [
  { id:'mp-1', material:'Copper', grade:'A', basePrice:85, moistureAdjustment:2, contaminationDeduction:5, priceTier:'premium', effectiveDate:nowIso(), reviewDate:nowIso(), supplierId:'sup-1' },
  { id:'mp-2', material:'Aluminum', grade:'B', basePrice:25, moistureAdjustment:1, contaminationDeduction:3, priceTier:'standard', effectiveDate:nowIso(), reviewDate:nowIso(), supplierId:'sup-2' },
]

const initialBaleLots: BaleLot[] = [
  { id:'bl-1', baleId:'BALE-001', material:'Copper', grade:'A', weight:2000, density:8.9, location:'Warehouse A', supplierId:'sup-1', purchasePrice:170000, processingCost:10000, cogs:90, shrinkage:0.05, yield:0.95, date:nowIso(), status:'processed' },
  { id:'bl-2', baleId:'BALE-002', material:'Aluminum', grade:'B', weight:1500, density:2.7, location:'Warehouse B', supplierId:'sup-2', purchasePrice:37500, processingCost:5000, cogs:28.33, shrinkage:0.03, yield:0.97, date:nowIso(), status:'pending' },
]

const initialComplianceFees: ComplianceFee[] = [
  { id:'cf-1', type:'bottle_deposit', amount:2.5, collected:5000, remitted:4500, dueDate:nowIso(), status:'pending', chainOfCustody:[] },
  { id:'cf-2', type:'epr_eco_fee', amount:0.5, collected:2000, remitted:1800, dueDate:nowIso(), status:'paid', chainOfCustody:[] },
  { id:'cf-3', type:'landfill_levy', amount:150, collected:3000, remitted:2850, dueDate:nowIso(), status:'pending', chainOfCustody:[] },
]

const initialLogisticsCosts: LogisticsCost[] = [
  { id:'lc-1', type:'gate_fee', amount:50, vehicleReg:'ABC123GP', driverName:'John Doe', route:'JHB-CPT', mileage:1400, loadPhotos:[], date:nowIso(), status:'paid' },
  { id:'lc-2', type:'transport', amount:2500, vehicleReg:'XYZ789GP', driverName:'Jane Smith', route:'CPT-DBN', mileage:600, loadPhotos:[], date:nowIso(), status:'pending' },
]

const initialCashDrawers: CashDrawer[] = [
  { id:'cd-1', date:nowIso(), openingBalance:5000, closingBalance:3500, cashReceived:2000, cashPaid:3500, overShort:0, bankDeposit:3500, depositSlip:'DEP-001', reconciled:true, transactions:[] },
]

const initialVendorCustomers: VendorCustomer[] = [
  { id:'vc-1', name:'MetalCorp SA', type:'supplier', contact:'Mike Johnson', email:'mike@metalcorp.co.za', phone:'+27123456789', idNumber:'1234567890123', address:'123 Industrial St, JHB', kycStatus:'approved', blacklistFlag:false, creditLimit:100000, paymentTerms:'30 days', exportDocs:[], incoterms:'FOB', fxGains:0, fxLosses:0 },
  { id:'vc-2', name:'ExportBroker Ltd', type:'broker', contact:'Lisa Brown', email:'lisa@exportbroker.co.za', phone:'+27555666777', idNumber:'5556667778889', address:'789 Export St, DBN', kycStatus:'approved', blacklistFlag:false, creditLimit:200000, paymentTerms:'15 days', exportDocs:['Export License', 'Certificate of Origin'], incoterms:'CIF', fxGains:5000, fxLosses:2000 },
]

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

export function AccountingPage() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [activeSubSection, setActiveSubSection] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  // Data states
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
  const [bills, setBills] = useState<Bill[]>(initialBills)
  const [payments, setPayments] = useState<Payment[]>(initialPayments)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(initialBankAccounts)
  const [chartAccounts, setChartAccounts] = useState<ChartAccount[]>(initialChartAccounts)
  
  // Recycling center specific states
  const [weighbridgeTickets, setWeighbridgeTickets] = useState<WeighbridgeTicket[]>(initialWeighbridgeTickets)
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers)
  const [materialPricing, setMaterialPricing] = useState<MaterialPricing[]>(initialMaterialPricing)
  const [baleLots, setBaleLots] = useState<BaleLot[]>(initialBaleLots)
  const [complianceFees, setComplianceFees] = useState<ComplianceFee[]>(initialComplianceFees)
  const [logisticsCosts, setLogisticsCosts] = useState<LogisticsCost[]>(initialLogisticsCosts)
  const [cashDrawers, setCashDrawers] = useState<CashDrawer[]>(initialCashDrawers)
  const [vendorCustomers, setVendorCustomers] = useState<VendorCustomer[]>(initialVendorCustomers)
  
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
  
  const [userId, setUserId] = useState<string | null>(null)

  // Initialize Supabase and fetch data
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data?.user?.id || null)
      fetchInvoices()
      fetchExpenses()
    }).catch(() => {})
  }, [])

  async function fetchInvoices() {
    if (!isSupabaseEnabled || !supabase) return
    try {
      const { data } = await supabase.from('accounting_invoices').select('*').order('created_at', { ascending: false })
      if (data) setInvoices(data.map((r:any)=>({ 
        id:r.id, number:r.number, client:r.client, amount:Number(r.amount||0), 
        dueDate: new Date(r.due_date).toISOString(), status: r.status,
        createdDate: new Date(r.created_at).toISOString(), description: r.description,
        tax: Number(r.tax || 0)
      })))
    } catch (error) {
      console.log('Invoices table not found, using sample data');
    }
  }
  async function fetchExpenses() {
    if (!isSupabaseEnabled || !supabase) return
    try {
      const { data } = await supabase.from('accounting_expenses').select('*').order('date', { ascending: false })
      if (data) setExpenses(data.map((r:any)=>({ 
        id:r.id, vendor:r.vendor, category:r.category, amount:Number(r.amount||0), 
        date: new Date(r.date).toISOString(), notes:r.notes||'', reimbursable: r.reimbursable || false
      })))
    } catch (error) {
      console.log('Expenses table not found, using sample data');
    }
  }

  // KPI Calculations
  const revenue = useMemo(()=> invoices.filter(i=>i.status==='paid').reduce((s,i)=>s+i.amount,0), [invoices])
  const outstanding = useMemo(()=> invoices.filter(i=>i.status==='sent' || i.status==='overdue').reduce((s,i)=>s+i.amount,0), [invoices])
  const spend = useMemo(()=> expenses.reduce((s,e)=>s+e.amount, 0), [expenses])
  const totalPayables = useMemo(()=> bills.filter(b=>b.status==='unpaid').reduce((s,b)=>s+b.amount,0), [bills])
  const cashflow = useMemo(()=> revenue - spend, [revenue, spend])
  const bankBalance = useMemo(()=> bankAccounts.reduce((s,b)=>s+b.balance,0), [bankAccounts])

  // Navigation handlers
  const handleSectionClick = (section: string) => {
    setActiveSection(section)
    setActiveSubSection('')
  }

  const handleSubSectionClick = (subSection: string) => {
    setActiveSubSection(subSection)
  }

  // Invoice handlers
  const openCreateInv = () => { 
    setEditingInv({ 
      id:`i-${Date.now()}`, number:'', client:'', amount:0, dueDate: nowIso(), 
      status:'draft', createdDate: nowIso(), description: '', tax: 0
    }); 
    setInvDialog(true) 
  }
  const openEditInv = (i: Invoice) => { setEditingInv(i); setInvDialog(true) }
  const saveInv = async () => {
    if(!editingInv) return
    const exists = invoices.some(i=>i.id===editingInv.id)
    setInvoices(prev => exists ? prev.map(i=>i.id===editingInv.id? editingInv : i) : prev.concat(editingInv))
    if (isSupabaseEnabled && supabase) {
      if (exists) {
        await supabase.from('accounting_invoices').update({
          number: editingInv.number,
          client: editingInv.client,
          amount: editingInv.amount,
          due_date: new Date(editingInv.dueDate).toISOString().slice(0,10),
          status: editingInv.status,
          description: editingInv.description,
          tax: editingInv.tax,
        }).eq('id', editingInv.id)
      } else {
        await supabase.from('accounting_invoices').insert({
          user_id: userId,
          number: editingInv.number,
          client: editingInv.client,
          amount: editingInv.amount,
          due_date: new Date(editingInv.dueDate).toISOString().slice(0,10),
          status: editingInv.status,
          description: editingInv.description,
          tax: editingInv.tax,
        })
      }
      fetchInvoices()
    }
    setInvDialog(false); setEditingInv(null)
  }
  const deleteInv = async (id: string) => {
    setInvoices(prev => prev.filter(i=>i.id!==id))
    if (isSupabaseEnabled && supabase) {
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
    setExpDialog(false); setEditingExp(null)
  }
  const deleteExp = async (id: string) => {
    setExpenses(prev => prev.filter(e=>e.id!==id))
  }

  return (
    <div className="h-full flex bg-white">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-gray-50 border-r border-gray-200 flex flex-col shadow-lg flex-shrink-0 relative z-10`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && <h2 className="text-lg font-semibold text-gray-800">Accounting</h2>}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-gray-600 hover:text-gray-800"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${sidebarCollapsed ? 'rotate-90' : ''}`} />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto max-h-screen scrollbar-thin scrollbar-thumb-muted-foreground scrollbar-track-muted" style={{
          maxHeight: '100vh', 
          overflowY: 'auto', 
          scrollbarWidth: 'thin',
          scrollbarColor: 'hsl(var(--muted-foreground)) hsl(var(--muted))'
        }}>
        <div className="p-4 space-y-2">
          {/* Dashboard */}
          <div className="space-y-1">
            <Button
              variant={activeSection === 'dashboard' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'dashboard' 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              onClick={() => handleSectionClick('dashboard')}
            >
              <BarChart3 className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Dashboard</span>}
            </Button>
          </div>

          {/* Material Purchases & Payouts */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Material Purchases</span>}
            </div>
            <Button
              variant={activeSection === 'material-purchases' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'material-purchases' 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              onClick={() => handleSectionClick('material-purchases')}
            >
              <Package className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Material Purchases</span>}
            </Button>
            <Button
              variant={activeSection === 'weighbridge' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'weighbridge' 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              onClick={() => handleSectionClick('weighbridge')}
            >
              <Target className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Weighbridge</span>}
            </Button>
            <Button
              variant={activeSection === 'suppliers' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'suppliers' 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              onClick={() => handleSectionClick('suppliers')}
            >
              <Users className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Suppliers</span>}
            </Button>
            <Button
              variant={activeSection === 'pricing' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'pricing' 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              onClick={() => handleSectionClick('pricing')}
            >
              <BarChart3 className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Pricing</span>}
            </Button>
          </div>

          {/* Inventory & Costing */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Inventory</span>}
            </div>
            <Button
              variant={activeSection === 'inventory' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'inventory' 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              onClick={() => handleSectionClick('inventory')}
            >
              <Package className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Inventory</span>}
            </Button>
            <Button
              variant={activeSection === 'bales' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'bales' 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              onClick={() => handleSectionClick('bales')}
            >
              <Package className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Bales & Lots</span>}
            </Button>
            <Button
              variant={activeSection === 'invoices' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'invoices' 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              onClick={() => handleSectionClick('invoices')}
            >
              <FileText className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Invoices</span>}
            </Button>
          </div>

          {/* Compliance & Fees */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Compliance</span>}
            </div>
            <Button
              variant={activeSection === 'compliance' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'compliance' 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              onClick={() => handleSectionClick('compliance')}
            >
              <CheckCircle className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Fees & Compliance</span>}
            </Button>
            <Button
              variant={activeSection === 'logistics' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'logistics' 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              onClick={() => handleSectionClick('logistics')}
            >
              <Truck className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Logistics</span>}
            </Button>
          </div>

          {/* Cash & Settlements */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Cash Management</span>}
            </div>
            <Button
              variant={activeSection === 'cash-drawer' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'cash-drawer' 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              onClick={() => handleSectionClick('cash-drawer')}
            >
              <Wallet className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Cash Drawer</span>}
            </Button>
            <Button
              variant={activeSection === 'banking' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'banking' 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              onClick={() => handleSectionClick('banking')}
            >
              <Building2 className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Banking</span>}
            </Button>
          </div>

          {/* Vendor & Customer Management */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Vendor Management</span>}
            </div>
            <Button
              variant={activeSection === 'vendors' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'vendors' 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              onClick={() => handleSectionClick('vendors')}
            >
              <Users className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Vendors & Customers</span>}
            </Button>
            <Button
              variant={activeSection === 'payments' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'payments' 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              onClick={() => handleSectionClick('payments')}
            >
              <CreditCard className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Payments</span>}
            </Button>
          </div>

          {/* Reports */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Reports</span>}
          </div>
          <Button
            variant={activeSection === 'reports' ? 'default' : 'ghost'}
            className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
              activeSection === 'reports' 
                ? 'bg-orange-500 text-white shadow-md' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
            onClick={() => handleSectionClick('reports')}
          >
            <PieChart className="h-4 w-4" />
            {!sidebarCollapsed && <span className="ml-2">Reports</span>}
          </Button>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Integration</span>}
          </div>
          <Button
            variant={activeSection === 'ocr' ? 'default' : 'ghost'}
            className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
              activeSection === 'ocr' 
                ? 'bg-orange-500 text-white shadow-md' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
            onClick={() => handleSectionClick('ocr')}
          >
            <FileSpreadsheet className="h-4 w-4" />
            {!sidebarCollapsed && <span className="ml-2">OCR & Scale</span>}
          </Button>
        </div>

          {/* Settings */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Settings</span>}
            </div>
            <Button
              variant={activeSection === 'chart-of-accounts' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'chart-of-accounts' 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              onClick={() => handleSectionClick('chart-of-accounts')}
            >
              <Calculator className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Chart of Accounts</span>}
            </Button>
            <Button
              variant={activeSection === 'settings' ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : ''} ${
                activeSection === 'settings' 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              onClick={() => handleSectionClick('settings')}
            >
              <Settings className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Settings</span>}
            </Button>
          </div>
        </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative z-20">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
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
                {activeSection === 'payments' && 'Payments'}
                {activeSection === 'reports' && 'Reports & Analytics'}
                {activeSection === 'ocr' && 'OCR & Scale Integration'}
                {activeSection === 'chart-of-accounts' && 'Chart of Accounts'}
                {activeSection === 'settings' && 'General Settings'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={openCreateInv} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Quick Add
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto bg-gray-50">
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Enhanced KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                {/* Material Purchases */}
                <Card className="border-l-4 border-l-orange-500 bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
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
                <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-md">
                  <Plus className="h-4 w-4 mr-2" />
                  New Purchase
                </Button>
              </div>

              {/* Zoho Books Style Form */}
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardHeader className="border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-800">New Material Purchase</CardTitle>
                      <CardDescription className="text-gray-600">Create a new material purchase order</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="border-gray-300 text-gray-700">
                        Cancel
                      </Button>
                      <Button variant="outline" className="border-orange-300 text-orange-700">
                        Save Draft
                      </Button>
                      <Button className="bg-orange-500 hover:bg-orange-600 text-white">
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
                            <Select>
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
                            <Label className="text-gray-700 font-medium">Purchase Order #</Label>
                            <Input placeholder="PO-2024-001" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Date *</Label>
                            <Input type="date" className="bg-white border-gray-300 shadow-sm" />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Due Date</Label>
                            <Input type="date" className="bg-white border-gray-300 shadow-sm" />
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
                                      <SelectItem value="copper">Copper</SelectItem>
                                      <SelectItem value="aluminum">Aluminum</SelectItem>
                                      <SelectItem value="steel">Steel</SelectItem>
                                      <SelectItem value="plastic">Plastic</SelectItem>
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

              {/* Recent Purchases - Spreadsheet Style Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Recent Purchases</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
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
                <h2 className="text-xl font-semibold text-gray-100">Inventory Management</h2>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-gray-600 text-gray-300">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Adjust Stock
                  </Button>
                </div>
              </div>

              {/* Inventory Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-300">Total Materials</p>
                        <p className="text-2xl font-bold text-gray-100">{baleLots.length}</p>
                        <p className="text-sm text-gray-400">Active lots</p>
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
                        <p className="text-sm font-medium text-gray-300">Total Weight</p>
                        <p className="text-2xl font-bold text-gray-100">{baleLots.reduce((sum, b) => sum + b.weight, 0)} kg</p>
                        <p className="text-sm text-gray-400">In inventory</p>
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
                        <p className="text-sm font-medium text-gray-300">Low Stock Alerts</p>
                        <p className="text-2xl font-bold text-gray-100">{baleLots.filter(b => b.weight < 1000).length}</p>
                        <p className="text-sm text-gray-400">Items below threshold</p>
                      </div>
                      <div className="p-3 bg-red-100 rounded-full">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Inventory List */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-100">Current Inventory</CardTitle>
                  <CardDescription className="text-gray-400">All materials in stock</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {baleLots.map(bale => (
                      <div key={bale.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-orange-100 rounded-full">
                            <Package className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-100">{bale.baleId}</p>
                            <p className="text-gray-400">{bale.material} - Grade {bale.grade}</p>
                            <p className="text-sm text-gray-500">Location: {bale.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-sm text-gray-400">Weight</p>
                            <p className="font-semibold text-gray-100">{bale.weight} kg</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-400">Value</p>
                            <p className="font-semibold text-gray-100">R{bale.purchasePrice.toLocaleString()}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-400">Status</p>
                            <Badge className={`${bale.status === 'processed' ? 'bg-green-100 text-green-800' : bale.status === 'sold' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {bale.status}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Transfer</Button>
                            <Button variant="outline" size="sm">Adjust</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'banking' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-100">Banking & Accounts</h2>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-gray-600 text-gray-300">
                    <Download className="h-4 w-4 mr-2" />
                    Import Statement
                  </Button>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Account
                  </Button>
                </div>
              </div>

              {/* Bank Accounts Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bankAccounts.map(account => (
                  <Card key={account.id} className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-100">{account.name}</h3>
                          <p className="text-gray-400">{account.bank}</p>
                          <p className="text-sm text-gray-500">****{account.accountNumber.slice(-4)}</p>
                        </div>
                        <Badge className={`${account.type === 'checking' ? 'bg-blue-100 text-blue-800' : account.type === 'savings' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                          {account.type}
                        </Badge>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-400">Current Balance</p>
                        <p className="text-2xl font-bold text-gray-100">R{account.balance.toLocaleString()}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                          <p>Account: {account.accountNumber}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Reconcile</Button>
                          <Button variant="outline" size="sm">View Transactions</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Cash Flow Summary */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-100">Cash Flow Summary</CardTitle>
                  <CardDescription className="text-gray-400">Monthly cash position across all accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Total Bank Balance</p>
                      <p className="text-3xl font-bold text-gray-100">R{bankBalance.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Cash on Hand</p>
                      <p className="text-3xl font-bold text-gray-100">R{cashDrawers.reduce((sum, d) => sum + d.closingBalance, 0).toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Net Cash Position</p>
                      <p className="text-3xl font-bold text-gray-100">R{(bankBalance + cashDrawers.reduce((sum, d) => sum + d.closingBalance, 0)).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'payments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-100">Payments</h2>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {payments.map(payment => (
                  <Card key={payment.id} className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-100">Payment #{payment.id.slice(-6)}</h3>
                          <p className="text-gray-400">Amount: R{payment.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">Method: {payment.method}</p>
                        </div>
                        <Badge className={paymentStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Date</p>
                          <p className="font-semibold text-gray-100">{new Date(payment.date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Reference</p>
                          <p className="font-semibold text-gray-100">{payment.reference || 'N/A'}</p>
                        </div>
                        {payment.invoiceId && (
                          <div className="col-span-2">
                            <p className="text-sm text-gray-400">Applied to Invoice</p>
                            <p className="font-semibold text-gray-100">{payment.invoiceId}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                          <p>Status: {payment.status}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">View Details</Button>
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'chart-of-accounts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-100">Chart of Accounts</h2>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Account
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {chartAccounts.map(account => (
                  <Card key={account.id} className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-100">{account.name}</h3>
                          <p className="text-gray-400">Code: {account.code}</p>
                          <p className="text-sm text-gray-500">{account.description}</p>
                        </div>
                        <Badge className={`${account.type === 'asset' ? 'bg-green-100 text-green-800' : account.type === 'liability' ? 'bg-red-100 text-red-800' : account.type === 'equity' ? 'bg-blue-100 text-blue-800' : account.type === 'income' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'}`}>
                          {account.type}
                        </Badge>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-400">Current Balance</p>
                        <p className="text-2xl font-bold text-gray-100">R{account.balance.toLocaleString()}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                          <p>Account Code: {account.code}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">View Transactions</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-100">General Settings</h2>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Settings className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tax Settings */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-100">Tax Configuration</CardTitle>
                    <CardDescription className="text-gray-400">Configure tax rates and settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-300">VAT Rate (%)</Label>
                      <Input placeholder="15" className="bg-gray-700 border-gray-600 text-gray-100" />
                    </div>
                    <div>
                      <Label className="text-gray-300">Tax Number</Label>
                      <Input placeholder="Enter tax number" className="bg-gray-700 border-gray-600 text-gray-100" />
                    </div>
                    <div>
                      <Label className="text-gray-300">Tax Authority</Label>
                      <Input placeholder="SARS" className="bg-gray-700 border-gray-600 text-gray-100" />
                    </div>
                  </CardContent>
                </Card>

                {/* Currency Settings */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-100">Currency Settings</CardTitle>
                    <CardDescription className="text-gray-400">Configure currency and exchange rates</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Base Currency</Label>
                      <Select>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="zar">ZAR - South African Rand</SelectItem>
                          <SelectItem value="eur">EUR - Euro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-gray-300">Exchange Rate Source</Label>
                      <Select>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
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
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-100">Invoice Templates</CardTitle>
                    <CardDescription className="text-gray-400">Customize invoice appearance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Company Logo</Label>
                      <Input type="file" accept="image/*" className="bg-gray-700 border-gray-600 text-gray-100" />
                    </div>
                    <div>
                      <Label className="text-gray-300">Invoice Footer</Label>
                      <Input placeholder="Enter footer text" className="bg-gray-700 border-gray-600 text-gray-100" />
                    </div>
                    <div>
                      <Label className="text-gray-300">Payment Terms</Label>
                      <Input placeholder="e.g., Net 30 days" className="bg-gray-700 border-gray-600 text-gray-100" />
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Gateways */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-100">Payment Gateways</CardTitle>
                    <CardDescription className="text-gray-400">Configure payment processing</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="paypal" className="rounded" />
                      <Label htmlFor="paypal" className="text-gray-300">PayPal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="stripe" className="rounded" />
                      <Label htmlFor="stripe" className="text-gray-300">Stripe</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="bank-transfer" className="rounded" />
                      <Label htmlFor="bank-transfer" className="text-gray-300">Bank Transfer</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="cash" className="rounded" />
                      <Label htmlFor="cash" className="text-gray-300">Cash</Label>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'invoices' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Invoices</h2>
                <Button onClick={openCreateInv} className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Invoice
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {invoices.map(invoice => (
                  <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{invoice.number}</h3>
                          <p className="text-gray-600">{invoice.client}</p>
                        </div>
                        <Badge className={statusColor(invoice.status)}>{invoice.status}</Badge>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Amount:</span>
                          <span className="font-semibold">${invoice.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Due Date:</span>
                          <span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
                        </div>
                        {invoice.tax && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Tax:</span>
                            <span>${invoice.tax.toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditInv(invoice)}>
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditInv(invoice)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Send</DropdownMenuItem>
                            <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive" 
                              onClick={() => deleteInv(invoice.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'weighbridge' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-100">Weighbridge Tickets</h2>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Ticket
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {weighbridgeTickets.map(ticket => (
                  <Card key={ticket.id} className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-100">{ticket.ticketNumber}</h3>
                          <p className="text-gray-400">{ticket.material} - Grade {ticket.grade}</p>
                          <p className="text-sm text-gray-500">{ticket.supplierId}</p>
                        </div>
                        <Badge className={`${ticket.status === 'weighed' ? 'bg-blue-100 text-blue-800' : ticket.status === 'processed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {ticket.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Gross Weight</p>
                          <p className="font-semibold text-gray-100">{ticket.grossWeight} kg</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Tare Weight</p>
                          <p className="font-semibold text-gray-100">{ticket.tareWeight} kg</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Net Weight</p>
                          <p className="font-semibold text-gray-100">{ticket.netWeight} kg</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Contamination</p>
                          <p className="font-semibold text-gray-100">{ticket.contamination} kg</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <div>
                          <p>Driver: {ticket.driverName}</p>
                          <p>Vehicle: {ticket.vehicleReg}</p>
                        </div>
                        <div className="text-right">
                          <p>Location: {ticket.location}</p>
                          <p>{new Date(ticket.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'suppliers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-100">Suppliers</h2>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Supplier
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {suppliers.map(supplier => (
                  <Card key={supplier.id} className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-100">{supplier.name}</h3>
                          <p className="text-gray-400">{supplier.contact}</p>
                          <p className="text-sm text-gray-500">{supplier.email}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge className={`${supplier.kycStatus === 'approved' ? 'bg-green-100 text-green-800' : supplier.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {supplier.kycStatus}
                          </Badge>
                          {supplier.blacklistFlag && (
                            <Badge variant="destructive">Blacklisted</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Total Payouts</p>
                          <p className="font-semibold text-gray-100">R{supplier.totalPayouts.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Credit Limit</p>
                          <p className="font-semibold text-gray-100">R{supplier.creditLimit.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Payment Method</p>
                          <p className="font-semibold text-gray-100 capitalize">{supplier.paymentMethod.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Last Payment</p>
                          <p className="font-semibold text-gray-100">{new Date(supplier.lastPayment).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                          <p>ID: {supplier.idNumber}</p>
                          <p>Phone: {supplier.phone}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">View Details</Button>
                          <Button variant="outline" size="sm">Make Payment</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'pricing' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-100">Material Pricing</h2>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Pricing
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {materialPricing.map(pricing => (
                  <Card key={pricing.id} className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-100">{pricing.material} - Grade {pricing.grade}</h3>
                          <p className="text-gray-400">Base Price: R{pricing.basePrice}/kg</p>
                        </div>
                        <Badge className={`${pricing.priceTier === 'premium' ? 'bg-purple-100 text-purple-800' : pricing.priceTier === 'standard' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {pricing.priceTier}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Moisture Adjustment</p>
                          <p className="font-semibold text-gray-100">-{pricing.moistureAdjustment}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Contamination Deduction</p>
                          <p className="font-semibold text-gray-100">-{pricing.contaminationDeduction}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Effective Date</p>
                          <p className="font-semibold text-gray-100">{new Date(pricing.effectiveDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Review Date</p>
                          <p className="font-semibold text-gray-100">{new Date(pricing.reviewDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                          <p>Net Price: R{(pricing.basePrice * (1 - pricing.moistureAdjustment/100) * (1 - pricing.contaminationDeduction/100)).toFixed(2)}/kg</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">Review</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'bales' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-100">Bales & Lots</h2>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Bale
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {baleLots.map(bale => (
                  <Card key={bale.id} className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-100">{bale.baleId}</h3>
                          <p className="text-gray-400">{bale.material} - Grade {bale.grade}</p>
                          <p className="text-sm text-gray-500">Location: {bale.location}</p>
                        </div>
                        <Badge className={`${bale.status === 'processed' ? 'bg-green-100 text-green-800' : bale.status === 'sold' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {bale.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Weight</p>
                          <p className="font-semibold text-gray-100">{bale.weight} kg</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Density</p>
                          <p className="font-semibold text-gray-100">{bale.density} kg/m³</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Purchase Price</p>
                          <p className="font-semibold text-gray-100">R{bale.purchasePrice.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">COGS</p>
                          <p className="font-semibold text-gray-100">R{bale.cogs}/kg</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Shrinkage</p>
                          <p className="font-semibold text-gray-100">{(bale.shrinkage * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Yield</p>
                          <p className="font-semibold text-gray-100">{(bale.yield * 100).toFixed(1)}%</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                          <p>Processing Cost: R{bale.processingCost.toLocaleString()}</p>
                          <p>Date: {new Date(bale.date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">Process</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                <h2 className="text-xl font-semibold text-gray-100">Compliance & Fees</h2>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Fee
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {complianceFees.map(fee => (
                  <Card key={fee.id} className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-100 capitalize">{fee.type.replace('_', ' ')}</h3>
                          <p className="text-gray-400">Amount: R{fee.amount}/unit</p>
                          {fee.certificateNumber && (
                            <p className="text-sm text-gray-500">Cert: {fee.certificateNumber}</p>
                          )}
                        </div>
                        <Badge className={`${fee.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {fee.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Collected</p>
                          <p className="font-semibold text-gray-100">R{fee.collected.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Remitted</p>
                          <p className="font-semibold text-gray-100">R{fee.remitted.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Outstanding</p>
                          <p className="font-semibold text-gray-100">R{(fee.collected - fee.remitted).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Due Date</p>
                          <p className="font-semibold text-gray-100">{new Date(fee.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                          <p>Chain of Custody: {fee.chainOfCustody.length} documents</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">View Docs</Button>
                          <Button variant="outline" size="sm">Remit</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'logistics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-100">Logistics & Haulage</h2>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Cost
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {logisticsCosts.map(cost => (
                  <Card key={cost.id} className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-100 capitalize">{cost.type.replace('_', ' ')}</h3>
                          <p className="text-gray-400">Amount: R{cost.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">Vehicle: {cost.vehicleReg}</p>
                        </div>
                        <Badge className={`${cost.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {cost.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Driver</p>
                          <p className="font-semibold text-gray-100">{cost.driverName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Route</p>
                          <p className="font-semibold text-gray-100">{cost.route}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Mileage</p>
                          <p className="font-semibold text-gray-100">{cost.mileage} km</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Date</p>
                          <p className="font-semibold text-gray-100">{new Date(cost.date).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                          <p>Load Photos: {cost.loadPhotos.length} images</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">View Photos</Button>
                          <Button variant="outline" size="sm">Settle</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'cash-drawer' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-100">Cash Drawer</h2>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Drawer
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {cashDrawers.map(drawer => (
                  <Card key={drawer.id} className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-100">Cash Drawer - {new Date(drawer.date).toLocaleDateString()}</h3>
                          <p className="text-gray-400">Opening: R{drawer.openingBalance.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">Closing: R{drawer.closingBalance.toLocaleString()}</p>
                        </div>
                        <Badge className={`${drawer.reconciled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {drawer.reconciled ? 'Reconciled' : 'Pending'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Cash Received</p>
                          <p className="font-semibold text-gray-100">R{drawer.cashReceived.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Cash Paid</p>
                          <p className="font-semibold text-gray-100">R{drawer.cashPaid.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Over/Short</p>
                          <p className={`font-semibold ${drawer.overShort >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            R{drawer.overShort.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Bank Deposit</p>
                          <p className="font-semibold text-gray-100">R{drawer.bankDeposit.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                          <p>Deposit Slip: {drawer.depositSlip}</p>
                          <p>Transactions: {drawer.transactions.length}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">View Transactions</Button>
                          <Button variant="outline" size="sm">Reconcile</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'vendors' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-100">Vendors & Customers</h2>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Vendor
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {vendorCustomers.map(vendor => (
                  <Card key={vendor.id} className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-100">{vendor.name}</h3>
                          <p className="text-gray-400 capitalize">{vendor.type}</p>
                          <p className="text-sm text-gray-500">{vendor.contact}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge className={`${vendor.kycStatus === 'approved' ? 'bg-green-100 text-green-800' : vendor.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {vendor.kycStatus}
                          </Badge>
                          {vendor.blacklistFlag && (
                            <Badge variant="destructive">Blacklisted</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-400">Credit Limit</p>
                          <p className="font-semibold text-gray-100">R{vendor.creditLimit.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Payment Terms</p>
                          <p className="font-semibold text-gray-100">{vendor.paymentTerms}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">FX Gains</p>
                          <p className="font-semibold text-green-400">R{vendor.fxGains.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">FX Losses</p>
                          <p className="font-semibold text-red-400">R{vendor.fxLosses.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                          <p>Email: {vendor.email}</p>
                          <p>Phone: {vendor.phone}</p>
                          <p>Incoterms: {vendor.incoterms}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">View Details</Button>
                          <Button variant="outline" size="sm">Export Docs</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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

              {/* Key Performance Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-100">R2,450,000</p>
                        <p className="text-xs text-green-400">+12.5% vs last month</p>
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
                        <p className="text-2xl font-bold text-gray-100">45.2 tons</p>
                        <p className="text-xs text-blue-400">+8.3% vs last month</p>
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
                        <p className="text-sm text-gray-400">Diversion Rate</p>
                        <p className="text-2xl font-bold text-gray-100">87.3%</p>
                        <p className="text-xs text-orange-400">+2.1% vs last month</p>
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
                        <p className="text-2xl font-bold text-gray-100">R1,250</p>
                        <p className="text-xs text-red-400">-5.2% vs last month</p>
                      </div>
                      <div className="p-3 bg-red-100 rounded-full">
                        <BarChart3 className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Material Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-100">Material Performance</CardTitle>
                    <CardDescription className="text-gray-400">Revenue by material type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <span className="text-gray-300">Copper</span>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-100 font-semibold">R1,250,000</p>
                          <p className="text-xs text-gray-400">51.0%</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-300">Aluminum</span>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-100 font-semibold">R850,000</p>
                          <p className="text-xs text-gray-400">34.7%</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-gray-300">Steel</span>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-100 font-semibold">R350,000</p>
                          <p className="text-xs text-gray-400">14.3%</p>
                        </div>
                      </div>
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
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-100 font-semibold">Metro Scrap</p>
                          <p className="text-sm text-gray-400">15.2 tons</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-100 font-semibold">R380,000</p>
                          <p className="text-xs text-green-400">+5.2%</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-100 font-semibold">Green Metals</p>
                          <p className="text-sm text-gray-400">12.8 tons</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-100 font-semibold">R320,000</p>
                          <p className="text-xs text-green-400">+3.1%</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-100 font-semibold">Eco Solutions</p>
                          <p className="text-sm text-gray-400">8.5 tons</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-100 font-semibold">R210,000</p>
                          <p className="text-xs text-red-400">-2.3%</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Financial Reports */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-100">Profit & Loss</CardTitle>
                    <CardDescription className="text-gray-400">Monthly summary</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Revenue</span>
                        <span className="text-gray-100">R2,450,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Cost of Goods</span>
                        <span className="text-gray-100">-R1,850,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Operating Expenses</span>
                        <span className="text-gray-100">-R320,000</span>
                      </div>
                      <div className="border-t border-gray-600 pt-3">
                        <div className="flex justify-between">
                          <span className="text-gray-100 font-semibold">Net Profit</span>
                          <span className="text-green-400 font-semibold">R280,000</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-100">Cash Flow</CardTitle>
                    <CardDescription className="text-gray-400">Monthly cash position</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Cash In</span>
                        <span className="text-green-400">R2,450,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Cash Out</span>
                        <span className="text-red-400">-R2,170,000</span>
                      </div>
                      <div className="border-t border-gray-600 pt-3">
                        <div className="flex justify-between">
                          <span className="text-gray-100 font-semibold">Net Cash Flow</span>
                          <span className="text-green-400 font-semibold">R280,000</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-100">Compliance Status</CardTitle>
                    <CardDescription className="text-gray-400">Regulatory compliance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">EPR Fees Collected</span>
                        <span className="text-gray-100">R7,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">EPR Fees Remitted</span>
                        <span className="text-gray-100">R6,300</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Outstanding</span>
                        <span className="text-yellow-400">R700</span>
                      </div>
                      <div className="border-t border-gray-600 pt-3">
                        <div className="flex justify-between">
                          <span className="text-gray-100 font-semibold">Compliance Rate</span>
                          <span className="text-green-400 font-semibold">90%</span>
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
                  <CardDescription className="text-gray-400">Available reports for download</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="p-4 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-orange-500" />
                          <div>
                            <p className="text-gray-100 font-semibold">Profit & Loss</p>
                            <p className="text-sm text-gray-400">Monthly P&L Statement</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <BarChart3 className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-gray-100 font-semibold">Balance Sheet</p>
                            <p className="text-sm text-gray-400">Assets, Liabilities & Equity</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <BarChart3 className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-gray-100 font-semibold">Cash Flow</p>
                            <p className="text-sm text-gray-400">Cash flow statement</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Package className="h-5 w-5 text-purple-500" />
                          <div>
                            <p className="text-gray-100 font-semibold">Inventory Valuation</p>
                            <p className="text-sm text-gray-400">Stock valuation report</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-red-500" />
                          <div>
                            <p className="text-gray-100 font-semibold">Compliance Costs</p>
                            <p className="text-sm text-gray-400">Regulatory compliance costs</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-yellow-500" />
                          <div>
                            <p className="text-gray-100 font-semibold">Vendor Aging</p>
                            <p className="text-sm text-gray-400">Outstanding vendor payments</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Target className="h-5 w-5 text-cyan-500" />
                          <div>
                            <p className="text-gray-100 font-semibold">Material Analysis</p>
                            <p className="text-sm text-gray-400">Material performance report</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Truck className="h-5 w-5 text-pink-500" />
                          <div>
                            <p className="text-gray-100 font-semibold">Logistics Report</p>
                            <p className="text-sm text-gray-400">Transport & haulage costs</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Calculator className="h-5 w-5 text-indigo-500" />
                          <div>
                            <p className="text-gray-100 font-semibold">Trial Balance</p>
                            <p className="text-sm text-gray-400">Account balances summary</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

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

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Documents Processed</p>
                        <p className="text-2xl font-bold text-gray-100">1,247</p>
                        <p className="text-xs text-green-400">+15% this week</p>
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
                  <CardTitle className="text-gray-100">OCR Processing</CardTitle>
                  <CardDescription className="text-gray-400">Document recognition and data extraction</CardDescription>
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
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-orange-500" />
                              <div>
                                <p className="text-gray-100 text-sm">WT-2024-001.jpg</p>
                                <p className="text-xs text-gray-400">Processing...</p>
                              </div>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Receipt className="h-4 w-4 text-blue-500" />
                              <div>
                                <p className="text-gray-100 text-sm">INV-2024-045.pdf</p>
                                <p className="text-xs text-gray-400">Completed</p>
                              </div>
                            </div>
                            <Badge className="bg-green-100 text-green-800">Done</Badge>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              <CreditCard className="h-4 w-4 text-green-500" />
                              <div>
                                <p className="text-gray-100 text-sm">ID-123456.jpg</p>
                                <p className="text-xs text-gray-400">Failed - Retry</p>
                              </div>
                            </div>
                            <Badge className="bg-red-100 text-red-800">Error</Badge>
                          </div>
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

      {/* Invoice Dialog */}
      <Dialog open={invDialog} onOpenChange={setInvDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingInv && invoices.some(i => i.id === editingInv.id) ? 'Edit Invoice' : 'New Invoice'}
            </DialogTitle>
          </DialogHeader>
          {editingInv && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Invoice Number</Label>
                  <Input 
                    value={editingInv.number} 
                    onChange={(e) => setEditingInv({ ...editingInv, number: e.target.value })} 
                    placeholder="INV-1001"
                  />
                </div>
                <div>
                  <Label>Client</Label>
                  <Input 
                    value={editingInv.client} 
                    onChange={(e) => setEditingInv({ ...editingInv, client: e.target.value })} 
                    placeholder="Client Name"
                  />
                </div>
              </div>
              
              <div>
                <Label>Description</Label>
                <Input 
                  value={editingInv.description || ''} 
                  onChange={(e) => setEditingInv({ ...editingInv, description: e.target.value })} 
                  placeholder="Service description"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Amount</Label>
                  <Input 
                    type="number" 
                    value={editingInv.amount} 
                    onChange={(e) => setEditingInv({ ...editingInv, amount: Number(e.target.value || 0) })} 
                  />
                </div>
                <div>
                  <Label>Tax</Label>
                  <Input 
                    type="number" 
                    value={editingInv.tax || 0} 
                    onChange={(e) => setEditingInv({ ...editingInv, tax: Number(e.target.value || 0) })} 
                  />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input 
                    type="date" 
                    value={new Date(editingInv.dueDate).toISOString().slice(0, 10)} 
                    onChange={(e) => setEditingInv({ 
                      ...editingInv, 
                      dueDate: e.target.value ? new Date(e.target.value).toISOString() : editingInv.dueDate 
                    })} 
                  />
                </div>
              </div>
              
              <div>
                <Label>Status</Label>
                <Select 
                  value={editingInv.status} 
                  onValueChange={(v) => setEditingInv({ ...editingInv, status: v as InvoiceStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => { setInvDialog(false); setEditingInv(null) }}>
                  Cancel
                </Button>
                <Button onClick={saveInv} className="bg-orange-600 hover:bg-orange-700">
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
    </div>
  )
}



