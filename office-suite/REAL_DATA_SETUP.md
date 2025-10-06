# 🚀 Real Data Setup Guide

## **Overview**
This guide will help you transition from mock data to real, live functionality in the Sebenza Suite platform.

## **📋 Prerequisites**

### **1. Supabase Account**
- Create a free account at [supabase.com](https://supabase.com)
- Create a new project
- Note down your project URL and anon key

### **2. Environment Setup**
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit the file with your actual values
nano .env.local
```

### **3. Required Environment Variables**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## **🗄️ Database Setup**

### **1. Run the Database Schema**
```sql
-- Copy and paste the contents of admin-schema.sql into your Supabase SQL editor
-- This will create all necessary tables, indexes, and triggers
```

### **2. Verify Tables Created**
Check that these tables exist in your Supabase dashboard:
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

## **🔧 API Configuration**

### **1. Install Dependencies**
```bash
npm install @supabase/supabase-js
```

### **2. Update API Services**
The following files have been created with real API integration:
- `src/lib/supabase-client.ts` - Supabase client configuration
- `src/lib/api/admin-api.ts` - Admin API functions
- `src/lib/api/mail-admin-api.ts` - Mail Admin API functions

### **3. Component Updates**
Components have been updated to use real data:
- ✅ `UsersList` - Now uses real API calls
- 🔄 `EmailConfiguration` - In progress
- 🔄 `MonitoringDashboard` - In progress
- 🔄 `IntegrationsDashboard` - In progress

## **📧 Email Service Integration**

### **1. SMTP Configuration**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### **2. IMAP Configuration**
```env
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-email@gmail.com
IMAP_PASS=your-app-password
```

### **3. Gmail Setup**
1. Enable 2-factor authentication
2. Generate an app password
3. Use the app password in your environment variables

## **🚀 Deployment Steps**

### **1. Development Server**
```bash
# Start the development server
npm run dev

# The platform will now use real data instead of mock data
```

### **2. Production Deployment**
```bash
# Build for production
npm run build

# Start production server
npm start
```

## **🔍 Verification**

### **1. Check Real Data Loading**
- Navigate to `/mail-admin`
- Verify that data loads from the database
- Check browser console for any errors

### **2. Test API Functions**
- Try creating a new user
- Test email server configuration
- Verify audit logs are being created

### **3. Monitor Performance**
- Check Supabase dashboard for query performance
- Monitor API response times
- Verify data consistency

## **🛠️ Troubleshooting**

### **Common Issues**

#### **1. "Module not found: Can't resolve './supabase-client'"**
- Ensure `src/lib/supabase-client.ts` exists
- Check import paths in your components

#### **2. "Invalid API key"**
- Verify your Supabase URL and keys in `.env.local`
- Check that the keys are correct in your Supabase dashboard

#### **3. "Table doesn't exist"**
- Run the `admin-schema.sql` file in your Supabase SQL editor
- Verify all tables were created successfully

#### **4. "Permission denied"**
- Check Row Level Security (RLS) policies in Supabase
- Ensure your user has the correct permissions

### **Debug Steps**
1. Check browser console for errors
2. Verify environment variables are loaded
3. Test Supabase connection in the dashboard
4. Check network tab for failed API calls

## **📊 Data Migration**

### **1. From Mock to Real Data**
The platform will automatically:
- Load real data from the database
- Show loading states while fetching
- Display error states if data fails to load
- Provide retry functionality

### **2. Sample Data**
To populate with sample data:
```sql
-- Insert sample users
INSERT INTO admin_users (name, email, role, status, quota, used_quota, aliases, permissions) VALUES
('Admin User', 'admin@sebenza.co.za', 'admin', 'active', 10000, 0, '{}', '{"all"}');

-- Insert sample metrics
INSERT INTO system_metrics (name, value, unit, status, trend, threshold_warning, threshold_critical) VALUES
('CPU Usage', 45, '%', 'normal', 'stable', 70, 90);
```

## **🎯 Next Steps**

### **1. Complete Mock Data Removal**
- [ ] Update all remaining components
- [ ] Remove all sample data arrays
- [ ] Implement real API calls everywhere

### **2. Implement Real Services**
- [ ] Email SMTP/IMAP integration
- [ ] File upload and storage
- [ ] Real-time notifications
- [ ] Authentication system

### **3. Production Readiness**
- [ ] Error handling and logging
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Monitoring and alerts

## **📞 Support**

If you encounter issues:
1. Check the browser console for errors
2. Verify your Supabase configuration
3. Ensure all environment variables are set
4. Check the database schema is properly applied

The platform is now ready to function with real, live data! 🚀
