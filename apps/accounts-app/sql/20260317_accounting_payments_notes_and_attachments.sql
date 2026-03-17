-- Sebenza - Extend accounting_payments with notes and attachments
-- Run in Supabase SQL editor after 20260310_accounting_app_extensions.sql.
-- Safe/idempotent.

alter table if exists accounting_payments
  add column if not exists internal_notes text;

alter table if exists accounting_payments
  add column if not exists attachments text[] default '{}';

