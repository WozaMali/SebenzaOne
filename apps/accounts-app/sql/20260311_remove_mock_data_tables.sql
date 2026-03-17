-- Sebenza - Tables for documents, notifications, expenses (remove mock data dependencies)
-- Run after 20260310_accounting_app_extensions.sql

-- ---------------------------------------------------------------------------
-- Documents (SOPs, Policies)
-- ---------------------------------------------------------------------------
create table if not exists accounting_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'SOP',
  version text not null default '1.0',
  owner text,
  status text not null default 'draft' check (status in ('draft', 'approved', 'under_review', 'expired')),
  content text,
  last_updated date not null default current_date,
  next_review date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table if exists accounting_documents add column if not exists status text not null default 'draft';

create index if not exists idx_accounting_documents_category on accounting_documents (category);
create index if not exists idx_accounting_documents_status on accounting_documents (status);

-- ---------------------------------------------------------------------------
-- Accounting Expenses (if not exists)
-- ---------------------------------------------------------------------------
create table if not exists accounting_expenses (
  id uuid primary key default gen_random_uuid(),
  vendor text,
  category text,
  amount numeric(14,2) not null default 0,
  date date not null default current_date,
  notes text,
  reimbursable boolean default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_accounting_expenses_date on accounting_expenses (date);
create index if not exists idx_accounting_expenses_category on accounting_expenses (category);

-- ---------------------------------------------------------------------------
-- CRM Notifications (shared or per-app - CRM app)
-- ---------------------------------------------------------------------------
create table if not exists crm_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  type text not null check (type in ('success', 'warning', 'info', 'error')),
  title text not null,
  message text,
  read boolean not null default false,
  action_label text,
  action_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_crm_notifications_user_read on crm_notifications (user_id, read);
create index if not exists idx_crm_notifications_created on crm_notifications (created_at desc);
