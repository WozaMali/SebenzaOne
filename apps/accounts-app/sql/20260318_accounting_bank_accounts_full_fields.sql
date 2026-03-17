-- Sebenza - Extend accounting_bank_accounts to match Banking & Accounts UI
-- Run in Supabase SQL editor after 20260312_accounting_forms_tables.sql (or after initial table creation).
-- Safe/idempotent.

create extension if not exists pgcrypto;

alter table if exists accounting_bank_accounts
  add column if not exists branch_code text,
  add column if not exists swift_code text,
  add column if not exists opening_balance numeric(14,2) not null default 0,
  add column if not exists as_of_date date,
  add column if not exists last_reconciled date,
  add column if not exists reconciliation_frequency text check (reconciliation_frequency in ('daily', 'weekly', 'monthly')),
  add column if not exists internal_notes text,
  add column if not exists status text not null default 'active' check (status in ('draft', 'active', 'inactive')),
  add column if not exists gl_account_id uuid;

create index if not exists idx_accounting_bank_accounts_status
  on accounting_bank_accounts (status);

