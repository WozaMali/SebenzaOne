# 🗄️ DATABASE SETUP GUIDE

## **STEP 1: Run the Database Schema**

You need to run the SQL schema in your Supabase dashboard to create all the tables.

### **Option A: Use the Fixed Schema (Recommended)**

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `uepolhpxzarmpcynomxg`
3. **Click on "SQL Editor"** in the left sidebar
4. **Copy the entire contents** of `admin-schema-fixed.sql`
5. **Paste it into the SQL Editor**
6. **Click "Run"** to execute the schema

### **Option B: Quick Setup (Minimal Tables)**

If you want to start with just the essential tables, run this SQL instead:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'helpdesk', 'user', 'auditor')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    last_login TIMESTAMP WITH TIME ZONE,
    quota BIGINT NOT NULL DEFAULT 10000,
    used_quota BIGINT NOT NULL DEFAULT 0,
    aliases TEXT[] DEFAULT '{}',
    permissions TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_servers table
CREATE TABLE IF NOT EXISTS email_servers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    server_type VARCHAR(50) NOT NULL CHECK (server_type IN ('smtp', 'imap', 'pop3', 'exchange')),
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL,
    encryption VARCHAR(50) NOT NULL CHECK (encryption IN ('none', 'ssl', 'tls', 'starttls')),
    authentication VARCHAR(50) NOT NULL CHECK (authentication IN ('none', 'password', 'oauth2', 'ntlm')),
    status VARCHAR(50) NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error', 'testing')),
    last_tested TIMESTAMP WITH TIME ZONE,
    response_time INTEGER DEFAULT 0,
    uptime DECIMAL(5,2) DEFAULT 0.00,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_metrics table
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('normal', 'warning', 'critical')),
    trend VARCHAR(50) NOT NULL CHECK (trend IN ('up', 'down', 'stable')),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    threshold_warning DECIMAL(10,2) NOT NULL,
    threshold_critical DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some sample data
INSERT INTO admin_users (name, email, role, status, quota, used_quota, aliases, permissions) VALUES
('John Doe', 'john@sebenza.co.za', 'owner', 'active', 10000, 2500, '{"john.doe@sebenza.co.za"}', '{"read", "write", "admin"}'),
('Jane Smith', 'jane@sebenza.co.za', 'admin', 'active', 5000, 1200, '{"jane.smith@sebenza.co.za"}', '{"read", "write"}'),
('Mike Johnson', 'mike@sebenza.co.za', 'user', 'active', 2000, 800, '{}', '{"read"}')
ON CONFLICT (email) DO NOTHING;

INSERT INTO system_metrics (name, value, unit, status, trend, threshold_warning, threshold_critical) VALUES
('CPU Usage', 25.5, '%', 'normal', 'stable', 70, 90),
('Memory Usage', 45.2, '%', 'normal', 'stable', 75, 90),
('Disk Usage', 60.8, '%', 'normal', 'stable', 80, 90),
('Email Queue', 15, 'emails', 'normal', 'stable', 1000, 5000)
ON CONFLICT DO NOTHING;
```

## **STEP 2: Test the Connection**

After running the schema, test if it works:

1. **Go to your app**: http://localhost:3001/mail-admin
2. **Check the browser console** for any errors
3. **Look for the "Users" section** - it should show real data from the database

## **STEP 3: Verify Tables Created**

In your Supabase dashboard:
1. **Go to "Table Editor"**
2. **You should see these tables**:
   - `admin_users`
   - `email_servers` 
   - `system_metrics`

## **TROUBLESHOOTING**

### **If you get "relation does not exist" errors:**
- Make sure you ran the SQL schema in the correct project
- Check that the tables were created in the "Table Editor"
- Try refreshing your browser

### **If you get connection errors:**
- Verify your `.env.local` file has the correct Supabase URL and key
- Check that your Supabase project is active
- Make sure the anon key has the right permissions

### **If you want to start fresh:**
- You can drop all tables and recreate them
- Or create a new Supabase project

## **NEXT STEPS**

Once the database is set up:
1. **The platform will use real data** instead of mock data
2. **You can add/edit users** through the admin interface
3. **All CRUD operations** will work with the database
4. **The platform will be fully functional** with live data

---

**Need help?** Check the browser console for detailed error messages!
