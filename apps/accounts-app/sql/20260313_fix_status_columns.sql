-- Sebenza - Fix missing status columns (run if you get "column status does not exist")
-- Safe to run multiple times

alter table if exists accounting_invoices add column if not exists status text;
alter table if exists accounting_payments add column if not exists status text;
alter table if exists accounting_documents add column if not exists status text;

-- Client/customer name for invoices (AccountingPage uses this)
alter table if exists accounting_invoices add column if not exists client text;
alter table if exists accounting_invoices add column if not exists tax numeric(14,2) default 0;
alter table if exists accounting_invoices add column if not exists line_items jsonb default '[]';
