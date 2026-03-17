-- Sebenza - Extend accounting_material_pricing with status and internal notes
-- Run in Supabase SQL editor after 20260312_accounting_forms_tables.sql.
-- Safe to run multiple times.

alter table if exists accounting_material_pricing
  add column if not exists status text not null default 'draft'
    check (status in ('draft', 'active', 'inactive', 'expired'));

alter table if exists accounting_material_pricing
  add column if not exists internal_notes text;

