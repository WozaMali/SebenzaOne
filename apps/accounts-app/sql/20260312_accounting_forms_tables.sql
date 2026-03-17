-- Sebenza - Tables for AccountingPage forms (weighbridge, suppliers, pricing, etc.)
-- Run after 20260311_remove_mock_data_tables.sql

alter table if exists accounting_payments
  add column if not exists reference text;

-- ---------------------------------------------------------------------------
-- Suppliers
-- ---------------------------------------------------------------------------
create table if not exists accounting_suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text,
  email text,
  phone text,
  id_number text,
  address text,
  bank_details text,
  kyc_status text not null default 'pending' check (kyc_status in ('pending', 'approved', 'rejected')),
  blacklist_flag boolean not null default false,
  payment_method text not null default 'cash' check (payment_method in ('cash', 'eft', 'mobile', 'voucher')),
  credit_limit numeric(14,2) not null default 0,
  total_payouts numeric(14,2) not null default 0,
  last_payment date,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_accounting_suppliers_status on accounting_suppliers (status);

-- ---------------------------------------------------------------------------
-- Weighbridge Tickets
-- ---------------------------------------------------------------------------
create table if not exists accounting_weighbridge_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number text not null,
  supplier_id uuid references accounting_suppliers(id) on delete set null,
  material text not null,
  grade text not null default 'A' check (grade in ('A', 'B', 'C', 'mixed')),
  gross_weight numeric(14,2) not null default 0,
  tare_weight numeric(14,2) not null default 0,
  net_weight numeric(14,2) not null default 0,
  contamination numeric(14,2) not null default 0,
  photos text[] default '{}',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'paid')),
  ticket_date date not null default current_date,
  location text,
  driver_name text,
  vehicle_reg text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_accounting_weighbridge_ticket_date on accounting_weighbridge_tickets (ticket_date);
create index if not exists idx_accounting_weighbridge_supplier on accounting_weighbridge_tickets (supplier_id);

-- ---------------------------------------------------------------------------
-- Material Pricing
-- ---------------------------------------------------------------------------
create table if not exists accounting_material_pricing (
  id uuid primary key default gen_random_uuid(),
  material text not null,
  grade text not null default 'A' check (grade in ('A', 'B', 'C', 'mixed')),
  base_price numeric(14,4) not null default 0,
  moisture_adjustment numeric(14,4) not null default 0,
  contamination_deduction numeric(14,4) not null default 0,
  price_tier text not null default 'standard' check (price_tier in ('premium', 'standard', 'discount')),
  effective_date date not null default current_date,
  review_date date,
  supplier_id uuid references accounting_suppliers(id) on delete set null,
  customer_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_accounting_material_pricing_material on accounting_material_pricing (material);

-- ---------------------------------------------------------------------------
-- Bale Lots
-- ---------------------------------------------------------------------------
create table if not exists accounting_bale_lots (
  id uuid primary key default gen_random_uuid(),
  bale_id text not null,
  material text not null,
  grade text not null default 'A' check (grade in ('A', 'B', 'C', 'mixed')),
  weight numeric(14,2) not null default 0,
  density numeric(14,2) not null default 0,
  location text,
  supplier_id uuid references accounting_suppliers(id) on delete set null,
  purchase_price numeric(14,2) not null default 0,
  processing_cost numeric(14,2) not null default 0,
  cogs numeric(14,4) not null default 0,
  shrinkage numeric(14,2) not null default 0,
  yield numeric(14,4) not null default 1,
  bale_date date not null default current_date,
  status text not null default 'pending' check (status in ('pending', 'processed', 'sold')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_accounting_bale_lots_date on accounting_bale_lots (bale_date);

-- ---------------------------------------------------------------------------
-- Compliance Fees
-- ---------------------------------------------------------------------------
create table if not exists accounting_compliance_fees (
  id uuid primary key default gen_random_uuid(),
  fee_type text not null check (fee_type in ('bottle_deposit', 'epr_eco_fee', 'landfill_levy', 'certificate')),
  amount numeric(14,2) not null default 0,
  collected numeric(14,2) not null default 0,
  remitted numeric(14,2) not null default 0,
  due_date date not null,
  certificate_number text,
  chain_of_custody jsonb default '[]',
  status text not null default 'pending' check (status in ('pending', 'paid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_accounting_compliance_due_date on accounting_compliance_fees (due_date);

-- ---------------------------------------------------------------------------
-- Logistics Costs
-- ---------------------------------------------------------------------------
create table if not exists accounting_logistics_costs (
  id uuid primary key default gen_random_uuid(),
  cost_type text not null check (cost_type in ('gate_fee', 'transport', 'fuel_surcharge', 'route_settlement')),
  amount numeric(14,2) not null default 0,
  vehicle_reg text,
  driver_name text,
  route text,
  mileage numeric(14,2),
  load_photos text[] default '{}',
  cost_date date not null default current_date,
  status text not null default 'pending' check (status in ('pending', 'paid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_accounting_logistics_date on accounting_logistics_costs (cost_date);

-- ---------------------------------------------------------------------------
-- Cash Drawers
-- ---------------------------------------------------------------------------
create table if not exists accounting_cash_drawers (
  id uuid primary key default gen_random_uuid(),
  drawer_date date not null default current_date,
  opening_balance numeric(14,2) not null default 0,
  closing_balance numeric(14,2) not null default 0,
  cash_received numeric(14,2) not null default 0,
  cash_paid numeric(14,2) not null default 0,
  over_short numeric(14,2) not null default 0,
  bank_deposit numeric(14,2) not null default 0,
  deposit_slip text,
  reconciled boolean not null default false,
  transactions jsonb default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_accounting_cash_drawers_date on accounting_cash_drawers (drawer_date);

-- ---------------------------------------------------------------------------
-- Bank Accounts
-- ---------------------------------------------------------------------------
create table if not exists accounting_bank_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  account_type text not null default 'checking' check (account_type in ('checking', 'savings', 'money_market', 'credit')),
  balance numeric(14,2) not null default 0,
  bank text,
  account_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Vendor/Customers (unified parties)
-- ---------------------------------------------------------------------------
create table if not exists accounting_vendor_customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  party_type text not null check (party_type in ('supplier', 'customer', 'broker')),
  contact text,
  email text,
  phone text,
  id_number text,
  address text,
  kyc_status text not null default 'pending' check (kyc_status in ('pending', 'approved', 'rejected')),
  blacklist_flag boolean not null default false,
  credit_limit numeric(14,2) not null default 0,
  payment_terms text,
  export_docs jsonb default '[]',
  incoterms text,
  fx_gains numeric(14,2) not null default 0,
  fx_losses numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_accounting_vendor_customers_type on accounting_vendor_customers (party_type);

-- ---------------------------------------------------------------------------
-- Chart of Accounts
-- ---------------------------------------------------------------------------
create table if not exists accounting_chart_accounts (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  account_type text not null check (account_type in ('asset', 'liability', 'equity', 'income', 'revenue', 'expense')),
  balance numeric(14,2) not null default 0,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_accounting_chart_accounts_code on accounting_chart_accounts (code);
