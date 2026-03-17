-- Sebenza - Client master and invoice billing fields
-- Run this in Supabase SQL editor or psql for your Sebenza database.
-- Safe to run multiple times because of IF NOT EXISTS guards.

-- 1. Client master table
create table if not exists accounting_clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  billing_address text,
  vat_number text,
  email text,
  phone text,
  default_payment_terms text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Extra fields on invoices to store a snapshot of client/billing info
alter table if exists accounting_invoices
  add column if not exists client_id uuid references accounting_clients(id),
  add column if not exists client_address text,
  add column if not exists client_vat_number text,
  add column if not exists payment_method text,
  add column if not exists po_number text,
  add column if not exists company_bank_details text;

-- 3. Trigger to keep updated_at fresh on clients (optional but handy)
create or replace function accounting_clients_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_accounting_clients_set_updated_at on accounting_clients;

create trigger trg_accounting_clients_set_updated_at
before update on accounting_clients
for each row
execute function accounting_clients_set_updated_at();

-- 4. Extra metadata on suppliers (ID type, still shared across apps)
alter table if exists accounting_suppliers
  add column if not exists id_type text;


