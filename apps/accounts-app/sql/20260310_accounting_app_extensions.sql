-- Sebenza Accounts App - schema extensions
-- Safe/idempotent migration for payroll, AP POs, and dignity credits.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Ensure core invoice/payment columns used by the app exist
-- ---------------------------------------------------------------------------
alter table if exists accounting_invoices
  add column if not exists invoice_number text,
  add column if not exists type text,
  add column if not exists issue_date date,
  add column if not exists due_date date,
  add column if not exists amount numeric(14,2),
  add column if not exists status text,
  add column if not exists description text,
  add column if not exists source text,
  add column if not exists customer_id uuid,
  add column if not exists supplier_id uuid;

alter table if exists accounting_payments
  add column if not exists invoice_id uuid,
  add column if not exists counterparty_type text,
  add column if not exists customer_id uuid,
  add column if not exists supplier_id uuid,
  add column if not exists bank_account_id uuid,
  add column if not exists payment_date date,
  add column if not exists amount numeric(14,2),
  add column if not exists method text,
  add column if not exists status text;

create index if not exists idx_accounting_invoices_number
  on accounting_invoices (invoice_number);

create index if not exists idx_accounting_payments_invoice_id
  on accounting_payments (invoice_id);

-- ---------------------------------------------------------------------------
-- Accounts Payable - Purchase Orders
-- ---------------------------------------------------------------------------
create table if not exists accounting_purchase_orders (
  id uuid primary key default gen_random_uuid(),
  po_number text not null,
  supplier_name text,
  supplier_id uuid,
  order_date date not null default current_date,
  total_amount numeric(14,2) not null default 0,
  status text not null default 'draft',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (po_number)
);

create index if not exists idx_accounting_purchase_orders_order_date
  on accounting_purchase_orders (order_date);

create index if not exists idx_accounting_purchase_orders_supplier_id
  on accounting_purchase_orders (supplier_id);

-- ---------------------------------------------------------------------------
-- Payroll - Runs and line items
-- ---------------------------------------------------------------------------
create table if not exists accounting_payroll_runs (
  id uuid primary key default gen_random_uuid(),
  run_number text not null,
  period_name text not null,
  period_label text not null,
  pay_date date not null,
  total_amount numeric(14,2) not null default 0,
  status text not null default 'draft',
  source text,
  company_name text,
  company_address text,
  company_phone text,
  company_email text,
  company_registration_no text,
  company_vat_no text,
  project_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (run_number)
);

alter table if exists accounting_payroll_runs
  add column if not exists run_number text,
  add column if not exists period_name text,
  add column if not exists period_label text,
  add column if not exists pay_date date,
  add column if not exists total_amount numeric(14,2),
  add column if not exists status text,
  add column if not exists source text,
  add column if not exists company_name text,
  add column if not exists company_address text,
  add column if not exists company_phone text,
  add column if not exists company_email text,
  add column if not exists company_registration_no text,
  add column if not exists company_vat_no text,
  add column if not exists project_code text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create index if not exists idx_accounting_payroll_runs_pay_date
  on accounting_payroll_runs (pay_date);

create table if not exists accounting_payroll_lines (
  id uuid primary key default gen_random_uuid(),
  payroll_run_id uuid not null,
  employee_code text,
  employee_name text not null,
  role text,
  department text,
  id_number text,
  tax_number text,
  bank_name text,
  bank_account text,
  hours_worked numeric(10,2) not null default 0,
  rate numeric(14,4) not null default 0,
  allowances numeric(14,2) not null default 0,
  deductions numeric(14,2) not null default 0,
  tax numeric(14,2) not null default 0,
  gross_amount numeric(14,2) not null default 0,
  net_amount numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  constraint fk_payroll_lines_run
    foreign key (payroll_run_id)
    references accounting_payroll_runs(id)
    on delete cascade
);

alter table if exists accounting_payroll_lines
  add column if not exists payroll_run_id uuid,
  add column if not exists employee_code text,
  add column if not exists employee_name text,
  add column if not exists role text,
  add column if not exists department text,
  add column if not exists id_number text,
  add column if not exists tax_number text,
  add column if not exists bank_name text,
  add column if not exists bank_account text,
  add column if not exists hours_worked numeric(10,2) default 0,
  add column if not exists rate numeric(14,4) default 0,
  add column if not exists allowances numeric(14,2) default 0,
  add column if not exists deductions numeric(14,2) default 0,
  add column if not exists tax numeric(14,2) default 0,
  add column if not exists gross_amount numeric(14,2) default 0,
  add column if not exists net_amount numeric(14,2) default 0,
  add column if not exists created_at timestamptz default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'fk_payroll_lines_run'
  ) then
    alter table accounting_payroll_lines
      add constraint fk_payroll_lines_run
      foreign key (payroll_run_id)
      references accounting_payroll_runs(id)
      on delete cascade;
  end if;
end $$;

create index if not exists idx_accounting_payroll_lines_run_id
  on accounting_payroll_lines (payroll_run_id);

create index if not exists idx_accounting_payroll_lines_employee_code
  on accounting_payroll_lines (employee_code);

-- ---------------------------------------------------------------------------
-- Dignity credits - master issuance and movements
-- ---------------------------------------------------------------------------
create table if not exists accounting_dignity_credits (
  id uuid primary key default gen_random_uuid(),
  credit_number text not null,
  beneficiary_ref text not null,
  amount numeric(14,2) not null default 0,
  issued_date date not null default current_date,
  status text not null default 'issued',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (credit_number)
);

alter table if exists accounting_dignity_credits
  add column if not exists credit_number text,
  add column if not exists beneficiary_ref text,
  add column if not exists amount numeric(14,2) default 0,
  add column if not exists issued_date date default current_date,
  add column if not exists status text default 'issued',
  add column if not exists notes text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create index if not exists idx_accounting_dignity_credits_beneficiary
  on accounting_dignity_credits (beneficiary_ref);

create table if not exists accounting_dignity_credit_movements (
  id uuid primary key default gen_random_uuid(),
  movement_ref text not null,
  beneficiary_ref text not null,
  movement_type text not null,
  amount numeric(14,2) not null default 0,
  movement_date date not null default current_date,
  location text,
  created_at timestamptz not null default now(),
  unique (movement_ref)
);

alter table if exists accounting_dignity_credit_movements
  add column if not exists movement_ref text,
  add column if not exists beneficiary_ref text,
  add column if not exists movement_type text,
  add column if not exists amount numeric(14,2) default 0,
  add column if not exists movement_date date default current_date,
  add column if not exists location text,
  add column if not exists created_at timestamptz default now();

create index if not exists idx_accounting_credit_movements_beneficiary
  on accounting_dignity_credit_movements (beneficiary_ref);

create index if not exists idx_accounting_credit_movements_date
  on accounting_dignity_credit_movements (movement_date);
