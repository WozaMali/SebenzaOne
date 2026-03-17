/**
 * Supabase CRUD for AccountingPage entities.
 * Maps frontend types to DB columns (snake_case).
 */

import { getSupabaseClient } from "@/app/lib/supabase"

const sb = () => getSupabaseClient()

// --- Suppliers ---
export async function fetchSuppliers() {
  const { data, error } = await sb().from("accounting_suppliers").select("*").order("name")
  if (error) throw error
  return (data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    contact: r.contact ?? "",
    email: r.email ?? "",
    phone: r.phone ?? "",
    idNumber: r.id_number ?? "",
    idType: ((): "ck" | "team_code" | "id_number" => {
      const v = (r.id_type as string) ?? "id_number"
      return v === "ck" || v === "team_code" || v === "id_number" ? v : "id_number"
    })(),
    address: r.address ?? "",
    bankDetails: r.bank_details ?? "",
    kycStatus: r.kyc_status ?? "pending",
    blacklistFlag: r.blacklist_flag ?? false,
    paymentMethod: r.payment_method ?? "cash",
    creditLimit: Number(r.credit_limit ?? 0),
    totalPayouts: Number(r.total_payouts ?? 0),
    lastPayment: r.last_payment ? new Date(r.last_payment).toISOString().split("T")[0] : "",
    status: r.status ?? "active",
  }))
}

export async function upsertSupplier(row: {
  id?: string
  name: string
  contact?: string
  email?: string
  phone?: string
  idNumber?: string
  idType?: string
  address?: string
  bankDetails?: string
  kycStatus?: string
  blacklistFlag?: boolean
  paymentMethod?: string
  creditLimit?: number
  totalPayouts?: number
  lastPayment?: string
  status?: string
}) {
  const payload = {
    name: row.name,
    contact: row.contact ?? null,
    email: row.email ?? null,
    phone: row.phone ?? null,
    id_number: row.idNumber ?? null,
    id_type: row.idType ?? null,
    address: row.address ?? null,
    bank_details: row.bankDetails ?? null,
    kyc_status: row.kycStatus ?? "pending",
    blacklist_flag: row.blacklistFlag ?? false,
    payment_method: row.paymentMethod ?? "cash",
    credit_limit: row.creditLimit ?? 0,
    total_payouts: row.totalPayouts ?? 0,
    last_payment: row.lastPayment || null,
    status: row.status ?? "active",
    updated_at: new Date().toISOString(),
  }
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(row.id ?? "")
  if (row.id && isUuid) {
    const { data, error } = await sb().from("accounting_suppliers").update(payload).eq("id", row.id).select("id").single()
    if (error) throw error
    return data.id
  }
  const { data, error } = await sb().from("accounting_suppliers").insert(payload).select("id").single()
  if (error) throw error
  return data.id
}

export async function deleteSupplier(id: string) {
  const { error } = await sb().from("accounting_suppliers").delete().eq("id", id)
  if (error) throw error
}

// --- Weighbridge ---
export async function fetchWeighbridgeTickets() {
  const { data, error } = await sb().from("accounting_weighbridge_tickets").select("*").order("ticket_date", { ascending: false })
  if (error) throw error
  return (data ?? []).map((r: any) => ({
    id: r.id,
    ticketNumber: r.ticket_number,
    supplierId: r.supplier_id ?? "",
    material: r.material ?? "",
    grade: r.grade ?? "A",
    grossWeight: Number(r.gross_weight ?? 0),
    tareWeight: Number(r.tare_weight ?? 0),
    netWeight: Number(r.net_weight ?? 0),
    contamination: Number(r.contamination ?? 0),
    photos: r.photos ?? [],
    status: r.status ?? "pending",
    date: r.ticket_date ? new Date(r.ticket_date).toISOString().split("T")[0] : "",
    location: r.location ?? "",
    driverName: r.driver_name ?? "",
    vehicleReg: r.vehicle_reg ?? "",
    notes: r.notes ?? "",
  }))
}

export async function upsertWeighbridgeTicket(row: {
  id?: string
  ticketNumber: string
  supplierId?: string
  material: string
  grade: string
  grossWeight: number
  tareWeight: number
  netWeight: number
  contamination?: number
  photos?: string[]
  status?: string
  date: string
  location?: string
  driverName?: string
  vehicleReg?: string
  notes?: string
}) {
  const payload = {
    ticket_number: row.ticketNumber,
    supplier_id: row.supplierId || null,
    material: row.material,
    grade: row.grade,
    gross_weight: row.grossWeight,
    tare_weight: row.tareWeight,
    net_weight: row.netWeight,
    contamination: row.contamination ?? 0,
    photos: row.photos ?? [],
    status: row.status ?? "pending",
    ticket_date: row.date,
    location: row.location ?? null,
    driver_name: row.driverName ?? null,
    vehicle_reg: row.vehicleReg ?? null,
    notes: row.notes ?? null,
    updated_at: new Date().toISOString(),
  }
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(row.id ?? "")
  if (row.id && isUuid) {
    const { data, error } = await sb().from("accounting_weighbridge_tickets").update(payload).eq("id", row.id).select("id").single()
    if (error) throw error
    return data.id
  }
  const { data, error } = await sb().from("accounting_weighbridge_tickets").insert(payload).select("id").single()
  if (error) throw error
  return data.id
}

export async function deleteWeighbridgeTicket(id: string) {
  const { error } = await sb().from("accounting_weighbridge_tickets").delete().eq("id", id)
  if (error) throw error
}

// --- Material Pricing ---
export async function fetchMaterialPricing() {
  const { data, error } = await sb().from("accounting_material_pricing").select("*").order("material")
  if (error) throw error
  return (data ?? []).map((r: any) => ({
    id: r.id,
    material: r.material,
    grade: r.grade ?? "A",
    basePrice: Number(r.base_price ?? 0),
    moistureAdjustment: Number(r.moisture_adjustment ?? 0),
    contaminationDeduction: Number(r.contamination_deduction ?? 0),
    priceTier: r.price_tier ?? "standard",
    effectiveDate: r.effective_date ? new Date(r.effective_date).toISOString().split("T")[0] : "",
    reviewDate: r.review_date ? new Date(r.review_date).toISOString().split("T")[0] : "",
    supplierId: r.supplier_id ?? undefined,
    customerId: r.customer_id ?? undefined,
    status: ((): "draft" | "active" | "inactive" | "expired" => {
      const v = (r.status as string) ?? "draft"
      return v === "draft" || v === "active" || v === "inactive" || v === "expired" ? v : "draft"
    })(),
    internalNotes: r.internal_notes ?? "",
  }))
}

export async function upsertMaterialPricing(row: any) {
  const payload = {
    material: row.material,
    grade: row.grade ?? "A",
    base_price: row.basePrice ?? 0,
    moisture_adjustment: row.moistureAdjustment ?? 0,
    contamination_deduction: row.contaminationDeduction ?? 0,
    price_tier: row.priceTier ?? "standard",
    effective_date: row.effectiveDate,
    review_date: row.reviewDate || null,
    supplier_id: row.supplierId || null,
    customer_id: row.customerId || null,
    status: row.status ?? "draft",
    internal_notes: row.internalNotes ?? null,
    updated_at: new Date().toISOString(),
  }
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(row.id ?? "")
  if (row.id && isUuid) {
    const { data, error } = await sb().from("accounting_material_pricing").update(payload).eq("id", row.id).select("id").single()
    if (error) throw error
    return data.id
  }
  const { data, error } = await sb().from("accounting_material_pricing").insert(payload).select("id").single()
  if (error) throw error
  return data.id
}

export async function deleteMaterialPricing(id: string) {
  const { error } = await sb().from("accounting_material_pricing").delete().eq("id", id)
  if (error) throw error
}

// --- Bale Lots ---
export async function fetchBaleLots() {
  const { data, error } = await sb().from("accounting_bale_lots").select("*").order("bale_date", { ascending: false })
  if (error) throw error
  return (data ?? []).map((r: any) => ({
    id: r.id,
    baleId: r.bale_id,
    material: r.material,
    grade: r.grade ?? "A",
    weight: Number(r.weight ?? 0),
    density: Number(r.density ?? 0),
    location: r.location ?? "",
    supplierId: r.supplier_id ?? "",
    purchasePrice: Number(r.purchase_price ?? 0),
    processingCost: Number(r.processing_cost ?? 0),
    cogs: Number(r.cogs ?? 0),
    shrinkage: Number(r.shrinkage ?? 0),
    yield: Number(r.yield ?? 1),
    date: r.bale_date ? new Date(r.bale_date).toISOString().split("T")[0] : "",
    status: r.status ?? "pending",
  }))
}

export async function upsertBaleLot(row: any) {
  const payload = {
    bale_id: row.baleId,
    material: row.material,
    grade: row.grade ?? "A",
    weight: row.weight ?? 0,
    density: row.density ?? 0,
    location: row.location ?? null,
    supplier_id: row.supplierId || null,
    purchase_price: row.purchasePrice ?? 0,
    processing_cost: row.processingCost ?? 0,
    cogs: row.cogs ?? 0,
    shrinkage: row.shrinkage ?? 0,
    yield: row.yield ?? 1,
    bale_date: row.date,
    status: row.status ?? "pending",
    updated_at: new Date().toISOString(),
  }
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(row.id ?? "")
  if (row.id && isUuid) {
    const { data, error } = await sb().from("accounting_bale_lots").update(payload).eq("id", row.id).select("id").single()
    if (error) throw error
    return data.id
  }
  const { data, error } = await sb().from("accounting_bale_lots").insert(payload).select("id").single()
  if (error) throw error
  return data.id
}

export async function deleteBaleLot(id: string) {
  const { error } = await sb().from("accounting_bale_lots").delete().eq("id", id)
  if (error) throw error
}

// --- Compliance Fees ---
export async function fetchComplianceFees() {
  const { data, error } = await sb().from("accounting_compliance_fees").select("*").order("due_date", { ascending: false })
  if (error) throw error
  return (data ?? []).map((r: any) => ({
    id: r.id,
    type: r.fee_type,
    amount: Number(r.amount ?? 0),
    collected: Number(r.collected ?? 0),
    remitted: Number(r.remitted ?? 0),
    dueDate: r.due_date ? new Date(r.due_date).toISOString().split("T")[0] : "",
    certificateNumber: r.certificate_number ?? undefined,
    chainOfCustody: r.chain_of_custody ?? [],
    status: r.status ?? "pending",
  }))
}

export async function upsertComplianceFee(row: any) {
  const payload = {
    fee_type: row.type,
    amount: row.amount ?? 0,
    collected: row.collected ?? 0,
    remitted: row.remitted ?? 0,
    due_date: row.dueDate,
    certificate_number: row.certificateNumber ?? null,
    chain_of_custody: row.chainOfCustody ?? [],
    status: row.status ?? "pending",
    updated_at: new Date().toISOString(),
  }
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(row.id ?? "")
  if (row.id && isUuid) {
    const { data, error } = await sb().from("accounting_compliance_fees").update(payload).eq("id", row.id).select("id").single()
    if (error) throw error
    return data.id
  }
  const { data, error } = await sb().from("accounting_compliance_fees").insert(payload).select("id").single()
  if (error) throw error
  return data.id
}

export async function deleteComplianceFee(id: string) {
  const { error } = await sb().from("accounting_compliance_fees").delete().eq("id", id)
  if (error) throw error
}

// --- Logistics Costs ---
export async function fetchLogisticsCosts() {
  const { data, error } = await sb().from("accounting_logistics_costs").select("*").order("cost_date", { ascending: false })
  if (error) throw error
  return (data ?? []).map((r: any) => ({
    id: r.id,
    type: r.cost_type,
    amount: Number(r.amount ?? 0),
    vehicleReg: r.vehicle_reg ?? "",
    driverName: r.driver_name ?? "",
    route: r.route ?? "",
    mileage: Number(r.mileage ?? 0),
    loadPhotos: r.load_photos ?? [],
    date: r.cost_date ? new Date(r.cost_date).toISOString().split("T")[0] : "",
    status: r.status ?? "pending",
  }))
}

export async function upsertLogisticsCost(row: any) {
  const payload = {
    cost_type: row.type,
    amount: row.amount ?? 0,
    vehicle_reg: row.vehicleReg ?? null,
    driver_name: row.driverName ?? null,
    route: row.route ?? null,
    mileage: row.mileage ?? null,
    load_photos: row.loadPhotos ?? [],
    cost_date: row.date,
    status: row.status ?? "pending",
    updated_at: new Date().toISOString(),
  }
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(row.id ?? "")
  if (row.id && isUuid) {
    const { data, error } = await sb().from("accounting_logistics_costs").update(payload).eq("id", row.id).select("id").single()
    if (error) throw error
    return data.id
  }
  const { data, error } = await sb().from("accounting_logistics_costs").insert(payload).select("id").single()
  if (error) throw error
  return data.id
}

export async function deleteLogisticsCost(id: string) {
  const { error } = await sb().from("accounting_logistics_costs").delete().eq("id", id)
  if (error) throw error
}

// --- Cash Drawers ---
export async function fetchCashDrawers() {
  const { data, error } = await sb().from("accounting_cash_drawers").select("*").order("drawer_date", { ascending: false })
  if (error) throw error
  return (data ?? []).map((r: any) => ({
    id: r.id,
    date: r.drawer_date ? new Date(r.drawer_date).toISOString().split("T")[0] : "",
    openingBalance: Number(r.opening_balance ?? 0),
    closingBalance: Number(r.closing_balance ?? 0),
    cashReceived: Number(r.cash_received ?? 0),
    cashPaid: Number(r.cash_paid ?? 0),
    overShort: Number(r.over_short ?? 0),
    bankDeposit: Number(r.bank_deposit ?? 0),
    depositSlip: r.deposit_slip ?? "",
    reconciled: r.reconciled ?? false,
    transactions: r.transactions ?? [],
  }))
}

export async function upsertCashDrawer(row: any) {
  const payload = {
    drawer_date: row.date,
    opening_balance: row.openingBalance ?? 0,
    closing_balance: row.closingBalance ?? 0,
    cash_received: row.cashReceived ?? 0,
    cash_paid: row.cashPaid ?? 0,
    over_short: row.overShort ?? 0,
    bank_deposit: row.bankDeposit ?? 0,
    deposit_slip: row.depositSlip ?? null,
    reconciled: row.reconciled ?? false,
    transactions: row.transactions ?? [],
    updated_at: new Date().toISOString(),
  }
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(row.id ?? "")
  if (row.id && isUuid) {
    const { data, error } = await sb().from("accounting_cash_drawers").update(payload).eq("id", row.id).select("id").single()
    if (error) throw error
    return data.id
  }
  const { data, error } = await sb().from("accounting_cash_drawers").insert(payload).select("id").single()
  if (error) throw error
  return data.id
}

export async function deleteCashDrawer(id: string) {
  const { error } = await sb().from("accounting_cash_drawers").delete().eq("id", id)
  if (error) throw error
}

// --- Bank Accounts ---
export async function fetchBankAccounts() {
  const { data, error } = await sb().from("accounting_bank_accounts").select("*").order("name")
  if (error) throw error
  return (data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    type: r.account_type ?? "checking",
    balance: Number(r.balance ?? 0),
    bank: r.bank ?? "",
    accountNumber: r.account_number ?? "",
    branchCode: r.branch_code ?? "",
    swiftCode: r.swift_code ?? "",
    openingBalance: Number(r.opening_balance ?? 0),
    asOfDate: r.as_of_date ? new Date(r.as_of_date).toISOString().split("T")[0] : "",
    lastReconciled: r.last_reconciled ? new Date(r.last_reconciled).toISOString().split("T")[0] : "",
    reconciliationFrequency: r.reconciliation_frequency ?? "monthly",
    internalNotes: r.internal_notes ?? "",
    status: r.status ?? "active",
    glAccountId: r.gl_account_id ?? undefined,
  }))
}

export async function upsertBankAccount(row: any) {
  const payload = {
    name: row.name,
    account_type: row.type ?? "checking",
    balance: row.balance ?? 0,
    bank: row.bank ?? null,
    account_number: row.accountNumber ?? null,
    branch_code: row.branchCode ?? null,
    swift_code: row.swiftCode ?? null,
    opening_balance: row.openingBalance ?? null,
    as_of_date: row.asOfDate || null,
    last_reconciled: row.lastReconciled || null,
    reconciliation_frequency: row.reconciliationFrequency ?? null,
    internal_notes: row.internalNotes ?? null,
    status: row.status ?? "draft",
    gl_account_id: row.glAccountId ?? null,
    updated_at: new Date().toISOString(),
  }
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(row.id ?? "")
  if (row.id && isUuid) {
    const { data, error } = await sb().from("accounting_bank_accounts").update(payload).eq("id", row.id).select("id").single()
    if (error) throw error
    return data.id
  }
  const { data, error } = await sb().from("accounting_bank_accounts").insert(payload).select("id").single()
  if (error) throw error
  return data.id
}

export async function deleteBankAccount(id: string) {
  const { error } = await sb().from("accounting_bank_accounts").delete().eq("id", id)
  if (error) throw error
}

// --- Vendor/Customers ---
export async function fetchVendorCustomers() {
  const { data, error } = await sb().from("accounting_vendor_customers").select("*").order("name")
  if (error) throw error
  return (data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    type: r.party_type,
    contact: r.contact ?? "",
    email: r.email ?? "",
    phone: r.phone ?? "",
    idNumber: r.id_number ?? "",
    address: r.address ?? "",
    kycStatus: r.kyc_status ?? "pending",
    blacklistFlag: r.blacklist_flag ?? false,
    creditLimit: Number(r.credit_limit ?? 0),
    paymentTerms: r.payment_terms ?? "",
    exportDocs: r.export_docs ?? [],
    incoterms: r.incoterms ?? "",
    fxGains: Number(r.fx_gains ?? 0),
    fxLosses: Number(r.fx_losses ?? 0),
  }))
}

export async function upsertVendorCustomer(row: any) {
  const payload = {
    name: row.name,
    party_type: row.type ?? "supplier",
    contact: row.contact ?? null,
    email: row.email ?? null,
    phone: row.phone ?? null,
    id_number: row.idNumber ?? null,
    address: row.address ?? null,
    kyc_status: row.kycStatus ?? "pending",
    blacklist_flag: row.blacklistFlag ?? false,
    credit_limit: row.creditLimit ?? 0,
    payment_terms: row.paymentTerms ?? null,
    export_docs: row.exportDocs ?? [],
    incoterms: row.incoterms ?? null,
    fx_gains: row.fxGains ?? 0,
    fx_losses: row.fxLosses ?? 0,
    updated_at: new Date().toISOString(),
  }
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(row.id ?? "")
  if (row.id && isUuid) {
    const { data, error } = await sb().from("accounting_vendor_customers").update(payload).eq("id", row.id).select("id").single()
    if (error) throw error
    return data.id
  }
  const { data, error } = await sb().from("accounting_vendor_customers").insert(payload).select("id").single()
  if (error) throw error
  return data.id
}

export async function deleteVendorCustomer(id: string) {
  const { error } = await sb().from("accounting_vendor_customers").delete().eq("id", id)
  if (error) throw error
}

// --- Payments ---
export async function fetchPayments() {
  const { data, error } = await sb().from("accounting_payments").select("*").order("payment_date", { ascending: false })
  if (error) throw error
  return (data ?? []).map((r: any) => ({
    id: r.id,
    invoiceId: r.invoice_id ?? "",
    amount: Number(r.amount ?? 0),
    date: r.payment_date ? new Date(r.payment_date).toISOString().split("T")[0] : "",
    method: r.method ?? "eft",
    status: r.status ?? "pending",
    reference: r.reference ?? "",
    bankAccountId: r.bank_account_id ?? undefined,
    internalNotes: r.internal_notes ?? "",
    attachments: (r.attachments as string[]) ?? [],
  }))
}

export async function upsertPayment(row: any) {
  const payload = {
    invoice_id: row.invoiceId || null,
    payment_date: row.date,
    amount: row.amount ?? 0,
    method: row.method ?? "eft",
    status: row.status ?? "pending",
    reference: row.reference ?? null,
    bank_account_id: row.bankAccountId || null,
    internal_notes: row.internalNotes ?? null,
    attachments: row.attachments ?? [],
  }
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(row.id ?? "")
  if (row.id && isUuid) {
    const { data, error } = await sb().from("accounting_payments").update(payload).eq("id", row.id).select("id").single()
    if (error) throw error
    return data.id
  }
  const { data, error } = await sb().from("accounting_payments").insert(payload).select("id").single()
  if (error) throw error
  return data.id
}

export async function deletePayment(id: string) {
  const { error } = await sb().from("accounting_payments").delete().eq("id", id)
  if (error) throw error
}

// --- Bills ---
export async function fetchBills() {
  const { data, error } = await sb().from("accounting_bills").select("*").order("due_date", { ascending: false })
  if (error) throw error
  return (data ?? []).map((r: any) => ({
    id: r.id,
    vendor: r.vendor ?? "",
    amount: Number(r.amount ?? 0),
    dueDate: r.due_date ? new Date(r.due_date).toISOString().split("T")[0] : "",
    status: (r.status === "paid" ? "paid" : "unpaid") as "paid" | "unpaid",
    description: r.description ?? "",
    category: r.category ?? "General",
  }))
}

export async function upsertBill(row: {
  id?: string
  vendor: string
  amount: number
  dueDate: string
  status?: "unpaid" | "paid"
  description?: string
  category?: string
}) {
  const payload = {
    vendor: row.vendor,
    amount: row.amount ?? 0,
    due_date: row.dueDate,
    status: row.status ?? "unpaid",
    description: row.description ?? null,
    category: row.category ?? "General",
    updated_at: new Date().toISOString(),
  }
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(row.id ?? "")
  if (row.id && isUuid) {
    const { data, error } = await sb().from("accounting_bills").update(payload).eq("id", row.id).select("id").single()
    if (error) throw error
    return data.id
  }
  const { data, error } = await sb().from("accounting_bills").insert(payload).select("id").single()
  if (error) throw error
  return data.id
}

export async function deleteBill(id: string) {
  const { error } = await sb().from("accounting_bills").delete().eq("id", id)
  if (error) throw error
}

// --- Chart of Accounts ---
export async function fetchChartAccounts() {
  const { data, error } = await sb().from("accounting_chart_accounts").select("*").order("code")
  if (error) throw error
  return (data ?? []).map((r: any) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    type: r.account_type,
    balance: Number(r.balance ?? 0),
    description: r.description ?? "",
  }))
}

export async function upsertChartAccount(row: any) {
  const payload = {
    code: row.code,
    name: row.name,
    account_type: row.type ?? "asset",
    balance: row.balance ?? 0,
    description: row.description ?? null,
    updated_at: new Date().toISOString(),
  }
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(row.id ?? "")
  if (row.id && isUuid) {
    const { data, error } = await sb().from("accounting_chart_accounts").update(payload).eq("id", row.id).select("id").single()
    if (error) throw error
    return data.id
  }
  const { data, error } = await sb().from("accounting_chart_accounts").insert(payload).select("id").single()
  if (error) throw error
  return data.id
}

export async function deleteChartAccount(id: string) {
  const { error } = await sb().from("accounting_chart_accounts").delete().eq("id", id)
  if (error) throw error
}
