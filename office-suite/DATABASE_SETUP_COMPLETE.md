# Complete Database Setup Guide for Sebenza Suite

This guide will help you set up the complete database schema for Sebenza Suite in the correct order.

## Prerequisites

1. **Supabase Project**: You should have a Supabase project created
2. **Environment Variables**: Your `.env.local` file should contain:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## Setup Order

Execute these SQL scripts in your Supabase SQL Editor in the following order:

### 1. Admin Schema (Foundation)
**File**: `admin-schema-fixed.sql`
- Creates admin users, email servers, templates, rules, quotas
- Sets up system metrics, audit logs, alerts
- Creates domains and integrations tables
- **Run this first** as other schemas may depend on it

### 2. CRM Schema
**File**: `crm-schema.sql`
- Creates CRM contacts, companies, deals, activities
- Sets up deal stages, analytics, and search functionality
- Includes RLS policies and triggers

### 3. Email Schema
**File**: `email-schema.sql`
- Creates emails, folders, threads, attachments, labels
- Sets up email rules and automation
- Includes folder count triggers and RLS policies

### 4. PWA Integration Schema
**File**: `pwa-integration-schema.sql`
- Creates PWA-specific tables for offline functionality
- Sets up sync status, pending actions, installation prompts

## Step-by-Step Instructions

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Run Admin Schema
1. Copy the entire contents of `admin-schema-fixed.sql`
2. Paste into the SQL Editor
3. Click "Run" to execute
4. Verify success message

### Step 3: Run CRM Schema
1. Copy the entire contents of `crm-schema.sql`
2. Paste into the SQL Editor
3. Click "Run" to execute
4. Verify success message

### Step 4: Run Email Schema
1. Copy the entire contents of `email-schema.sql`
2. Paste into the SQL Editor
3. Click "Run" to execute
4. Verify success message

### Step 5: Run PWA Schema
1. Copy the entire contents of `pwa-integration-schema.sql`
2. Paste into the SQL Editor
3. Click "Run" to execute
4. Verify success message

## Verification

After running all schemas, verify the setup:

1. **Visit Test Page**: Go to `http://localhost:3001/test-database`
2. **Check Connection**: Should show "Connection successful"
3. **Check Tables**: Should list all created tables
4. **Check Data**: Should show sample data or empty tables

## Expected Tables

After successful setup, you should have these tables:

### Admin Tables
- `admin_users`
- `email_servers`
- `email_templates`
- `email_rules`
- `email_quotas`
- `system_metrics`
- `audit_logs`
- `alerts`
- `domains`
- `integrations`

### CRM Tables
- `crm_contacts`
- `crm_companies`
- `crm_deals`
- `crm_activities`
- `crm_deal_stages`
- `crm_analytics`

### Email Tables
- `emails`
- `email_folders`
- `email_threads`
- `email_attachments`
- `email_labels`
- `email_rules`

### PWA Tables
- `pwa_sync_status`
- `pwa_pending_actions`
- `pwa_installation_prompts`

## Troubleshooting

### Common Issues

1. **Foreign Key Errors**: Make sure to run schemas in the correct order
2. **Permission Errors**: Check that your Supabase project has the correct permissions
3. **Column Errors**: Ensure all schemas are run completely

### Error Messages

- `ERROR: 42703: column "X" does not exist`: Run schemas in correct order
- `ERROR: 42P01: relation "X" does not exist`: Missing table, check schema order
- `ERROR: 23503: foreign key constraint fails`: Check foreign key references

## Next Steps

After database setup:

1. **Test Application**: Visit all pages to ensure they work
2. **Migrate Data**: Start migrating mock data to real database
3. **Configure Services**: Update services to use real data
4. **Test Features**: Verify all CRUD operations work

## Support

If you encounter issues:

1. Check the Supabase logs in your project dashboard
2. Verify your environment variables are correct
3. Ensure all schemas were run in the correct order
4. Check the test-database page for diagnostic information

## Files Created

- `admin-schema-fixed.sql` - Main admin functionality
- `crm-schema.sql` - CRM system tables
- `email-schema.sql` - Email system tables  
- `pwa-integration-schema.sql` - PWA functionality
- `setup-database.js` - Setup verification script
- `DATABASE_SETUP_COMPLETE.md` - This guide

All schemas include:
- ✅ Proper table definitions
- ✅ Indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Triggers for automation
- ✅ Foreign key constraints
- ✅ Sample data (where appropriate)
