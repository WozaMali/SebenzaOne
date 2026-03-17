-- Sebenza - Bills table (single source of truth for payables)
-- Run in Supabase SQL editor. Safe to run multiple times.

create table if not exists accounting_bills (
  id uuid primary key default gen_random_uuid(),
  vendor text not null,
  amount numeric(14, 2) not null default 0,
  due_date date not null default current_date,
  status text not null default 'unpaid' check (status in ('unpaid', 'paid')),
  description text,
  category text default 'General',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_accounting_bills_due_date on accounting_bills (due_date);
create index if not exists idx_accounting_bills_status on accounting_bills (status);
create index if not exists idx_accounting_bills_vendor on accounting_bills (vendor);

create or replace function accounting_bills_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_accounting_bills_set_updated_at on accounting_bills;
create trigger trg_accounting_bills_set_updated_at
before update on accounting_bills
for each row
execute function accounting_bills_set_updated_at();
