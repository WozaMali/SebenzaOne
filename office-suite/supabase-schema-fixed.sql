-- Fixed Supabase Schema for Mail Settings
-- This version handles existing policies gracefully

-- Drop existing policies if they exist (optional - only if you want to recreate them)
-- DROP POLICY IF EXISTS "Allow all for authenticated users" ON mail_config;
-- DROP POLICY IF EXISTS "Allow all for authenticated users" ON domains;
-- DROP POLICY IF EXISTS "Allow all for authenticated users" ON users;
-- DROP POLICY IF EXISTS "Allow all for authenticated users" ON reports;
-- DROP POLICY IF EXISTS "Allow all for authenticated users" ON emails;
-- DROP POLICY IF EXISTS "Allow all for authenticated users" ON email_templates;
-- DROP POLICY IF EXISTS "Allow all for authenticated users" ON email_rules;

-- Mail Configuration Table
CREATE TABLE IF NOT EXISTS mail_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  smtp_host TEXT NOT NULL DEFAULT 'email-smtp.us-east-1.amazonaws.com',
  smtp_port INTEGER NOT NULL DEFAULT 587,
  aws_region TEXT NOT NULL DEFAULT 'us-east-1',
  aws_access_key_id TEXT NOT NULL,
  aws_secret_access_key TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT NOT NULL,
  ssl_enabled BOOLEAN DEFAULT true,
  two_factor_enabled BOOLEAN DEFAULT false,
  spam_protection BOOLEAN DEFAULT true,
  virus_scanning BOOLEAN DEFAULT true,
  max_attachment_size INTEGER DEFAULT 25,
  max_recipients INTEGER DEFAULT 100,
  retention_days INTEGER DEFAULT 365,
  supabase_url TEXT,
  supabase_anon_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Domains Table
CREATE TABLE IF NOT EXISTS domains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed')),
  records INTEGER DEFAULT 0,
  total_records INTEGER DEFAULT 3,
  users INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT false,
  mx_record TEXT,
  txt_record TEXT,
  dkim_selectors TEXT[],
  dmarc_value TEXT,
  verification JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'User' CHECK (role IN ('Admin', 'Moderator', 'User')),
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  date TEXT NOT NULL,
  size TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emails Table (for statistics)
CREATE TABLE IF NOT EXISTS emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  from_email TEXT NOT NULL,
  to_email TEXT NOT NULL,
  body TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  is_html BOOLEAN DEFAULT false,
  category TEXT NOT NULL,
  tags TEXT[],
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Rules Table
CREATE TABLE IF NOT EXISTS email_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  conditions JSONB NOT NULL,
  actions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_domains_name ON domains(name);
CREATE INDEX IF NOT EXISTS idx_domains_status ON domains(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_emails_created_at ON emails(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_mail_config_updated_at ON mail_config;
CREATE TRIGGER update_mail_config_updated_at BEFORE UPDATE ON mail_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_domains_updated_at ON domains;
CREATE TRIGGER update_domains_updated_at BEFORE UPDATE ON domains FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_rules_updated_at ON email_rules;
CREATE TRIGGER update_email_rules_updated_at BEFORE UPDATE ON email_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE mail_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_rules ENABLE ROW LEVEL SECURITY;

-- Create policies only if they don't exist
-- This prevents the "policy already exists" error
DO $$ 
BEGIN
    -- Mail Config policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mail_config' AND policyname = 'Allow all for authenticated users') THEN
        CREATE POLICY "Allow all for authenticated users" ON mail_config FOR ALL TO authenticated USING (true);
    END IF;
    
    -- Domains policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'domains' AND policyname = 'Allow all for authenticated users') THEN
        CREATE POLICY "Allow all for authenticated users" ON domains FOR ALL TO authenticated USING (true);
    END IF;
    
    -- Users policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow all for authenticated users') THEN
        CREATE POLICY "Allow all for authenticated users" ON users FOR ALL TO authenticated USING (true);
    END IF;
    
    -- Reports policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reports' AND policyname = 'Allow all for authenticated users') THEN
        CREATE POLICY "Allow all for authenticated users" ON reports FOR ALL TO authenticated USING (true);
    END IF;
    
    -- Emails policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'emails' AND policyname = 'Allow all for authenticated users') THEN
        CREATE POLICY "Allow all for authenticated users" ON emails FOR ALL TO authenticated USING (true);
    END IF;
    
    -- Email Templates policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_templates' AND policyname = 'Allow all for authenticated users') THEN
        CREATE POLICY "Allow all for authenticated users" ON email_templates FOR ALL TO authenticated USING (true);
    END IF;
    
    -- Email Rules policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_rules' AND policyname = 'Allow all for authenticated users') THEN
        CREATE POLICY "Allow all for authenticated users" ON email_rules FOR ALL TO authenticated USING (true);
    END IF;
END $$;

-- Insert sample data (only if tables are empty)
INSERT INTO mail_config (
  smtp_host, smtp_port, aws_region, aws_access_key_id, aws_secret_access_key,
  from_email, from_name, ssl_enabled, two_factor_enabled, spam_protection, virus_scanning
) 
SELECT 
  'email-smtp.us-east-1.amazonaws.com', 587, 'us-east-1', 'YOUR_AWS_ACCESS_KEY', 'YOUR_AWS_SECRET_KEY',
  'noreply@yourdomain.com', 'Your Company', true, false, true, true
WHERE NOT EXISTS (SELECT 1 FROM mail_config);

INSERT INTO domains (name, status, records, total_records, users, is_active) 
SELECT 'yourdomain.com', 'verified', 3, 3, 5, true
WHERE NOT EXISTS (SELECT 1 FROM domains WHERE name = 'yourdomain.com');

INSERT INTO domains (name, status, records, total_records, users, is_active) 
SELECT 'subdomain.yourdomain.com', 'pending', 2, 3, 2, false
WHERE NOT EXISTS (SELECT 1 FROM domains WHERE name = 'subdomain.yourdomain.com');

INSERT INTO users (name, email, role, status) 
SELECT 'Admin User', 'admin@yourdomain.com', 'Admin', 'Active'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@yourdomain.com');

INSERT INTO users (name, email, role, status) 
SELECT 'John Doe', 'john@yourdomain.com', 'User', 'Active'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'john@yourdomain.com');

INSERT INTO users (name, email, role, status) 
SELECT 'Jane Smith', 'jane@yourdomain.com', 'User', 'Active'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'jane@yourdomain.com');

-- Projects: Kanban Columns and Tasks
CREATE TABLE IF NOT EXISTS project_columns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id TEXT NOT NULL DEFAULT 'default',
  title TEXT NOT NULL,
  color TEXT DEFAULT 'bg-slate-100',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id TEXT NOT NULL DEFAULT 'default',
  column_id UUID NOT NULL REFERENCES project_columns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  assignee TEXT DEFAULT '',
  due_date DATE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  labels TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','inprogress','review','done')),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_project_columns_updated_at ON project_columns;
CREATE TRIGGER update_project_columns_updated_at BEFORE UPDATE ON project_columns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_tasks_updated_at ON project_tasks;
CREATE TRIGGER update_project_tasks_updated_at BEFORE UPDATE ON project_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_columns_project_order ON project_columns(project_id, order_index);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_column_order ON project_tasks(project_id, column_id, order_index);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status);

-- RLS
ALTER TABLE project_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

-- Dev policies: allow all for anon/authenticated (adjust for prod)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_columns' AND policyname = 'Allow all (dev)') THEN
    CREATE POLICY "Allow all (dev)" ON project_columns FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_tasks' AND policyname = 'Allow all (dev)') THEN
    CREATE POLICY "Allow all (dev)" ON project_tasks FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Seed default board if empty
DO $$
DECLARE c_count INT; t_count INT; todo_id UUID; inprog_id UUID; review_id UUID; done_id UUID;
BEGIN
  SELECT COUNT(*) INTO c_count FROM project_columns WHERE project_id = 'default';
  IF c_count = 0 THEN
    INSERT INTO project_columns(project_id, title, color, order_index) VALUES
      ('default','To Do','bg-slate-100',0),
      ('default','In Progress','bg-blue-100',1),
      ('default','Review','bg-amber-100',2),
      ('default','Done','bg-green-100',3);

    SELECT id INTO todo_id FROM project_columns WHERE project_id='default' AND title='To Do' LIMIT 1;
    SELECT id INTO inprog_id FROM project_columns WHERE project_id='default' AND title='In Progress' LIMIT 1;
    SELECT id INTO review_id FROM project_columns WHERE project_id='default' AND title='Review' LIMIT 1;
    SELECT id INTO done_id FROM project_columns WHERE project_id='default' AND title='Done' LIMIT 1;

    INSERT INTO project_tasks(project_id, column_id, title, description, assignee, due_date, priority, labels, order_index) VALUES
      ('default', todo_id, 'Design system updates','Update color palette and typography guidelines','Sarah Johnson','2024-01-15','high',ARRAY['Design','Frontend'],0),
      ('default', todo_id, 'API documentation','Complete REST API documentation for v2.0','Mike Chen','2024-01-20','medium',ARRAY['Backend','Documentation'],1),
      ('default', inprog_id, 'User authentication refactor','Implement OAuth 2.0 and JWT tokens','Lisa Rodriguez','2024-01-18','high',ARRAY['Backend','Security'],0),
      ('default', review_id, 'Mobile responsive fixes','Fix layout issues on mobile devices','John Doe','2024-01-12','medium',ARRAY['Frontend','Bug Fix'],0),
      ('default', done_id, 'Database optimization','Optimized slow queries and added indexes','Mike Chen','2024-01-10','low',ARRAY['Backend','Performance'],0);
  END IF;
END $$;

-- =============================================================
-- Application Modules: Notes, Calendar, Planner, CRM, Accounting
-- =============================================================

-- Notes
CREATE TABLE IF NOT EXISTS notes_notebooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notebook_id UUID REFERENCES notes_notebooks(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Untitled',
  content TEXT NOT NULL DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  pinned BOOLEAN DEFAULT false,
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_notebook ON notes(notebook_id);
CREATE INDEX IF NOT EXISTS idx_notes_updated ON notes(updated_at DESC);

DROP TRIGGER IF EXISTS trg_notes_notebooks_updated_at ON notes_notebooks;
CREATE TRIGGER trg_notes_notebooks_updated_at BEFORE UPDATE ON notes_notebooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS trg_notes_updated_at ON notes;
CREATE TRIGGER trg_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE notes_notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notes_notebooks' AND policyname = 'owner_all') THEN
    CREATE POLICY owner_all ON notes_notebooks FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notes' AND policyname = 'owner_all') THEN
    CREATE POLICY owner_all ON notes FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Calendar
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT DEFAULT '',
  calendar TEXT NOT NULL DEFAULT 'Work',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_calendar_user ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_time ON calendar_events(start_time, end_time);

DROP TRIGGER IF EXISTS trg_calendar_events_updated_at ON calendar_events;
CREATE TRIGGER trg_calendar_events_updated_at BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'calendar_events' AND policyname = 'owner_all') THEN
    CREATE POLICY owner_all ON calendar_events FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Planner
CREATE TABLE IF NOT EXISTS planner_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  due_date DATE,
  tags TEXT[] DEFAULT '{}',
  assignee TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','inprogress','review','done')),
  estimate INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_planner_user ON planner_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_planner_status ON planner_tasks(status);
CREATE INDEX IF NOT EXISTS idx_planner_due ON planner_tasks(due_date);

DROP TRIGGER IF EXISTS trg_planner_tasks_updated_at ON planner_tasks;
CREATE TRIGGER trg_planner_tasks_updated_at BEFORE UPDATE ON planner_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE planner_tasks ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'planner_tasks' AND policyname = 'owner_all') THEN
    CREATE POLICY owner_all ON planner_tasks FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- CRM
CREATE TABLE IF NOT EXISTS crm_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_id UUID REFERENCES crm_companies(id) ON DELETE SET NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  value NUMERIC NOT NULL DEFAULT 0,
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
  company_id UUID REFERENCES crm_companies(id) ON DELETE SET NULL,
  stage TEXT NOT NULL DEFAULT 'new' CHECK (stage IN ('new','qualified','proposal','won','lost')),
  close_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_companies_user ON crm_companies(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_user ON crm_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_user ON crm_deals(user_id);

DROP TRIGGER IF EXISTS trg_crm_companies_updated_at ON crm_companies;
CREATE TRIGGER trg_crm_companies_updated_at BEFORE UPDATE ON crm_companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS trg_crm_contacts_updated_at ON crm_contacts;
CREATE TRIGGER trg_crm_contacts_updated_at BEFORE UPDATE ON crm_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS trg_crm_deals_updated_at ON crm_deals;
CREATE TRIGGER trg_crm_deals_updated_at BEFORE UPDATE ON crm_deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE crm_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_deals ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'crm_companies' AND policyname = 'owner_all') THEN
    CREATE POLICY owner_all ON crm_companies FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'crm_contacts' AND policyname = 'owner_all') THEN
    CREATE POLICY owner_all ON crm_contacts FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'crm_deals' AND policyname = 'owner_all') THEN
    CREATE POLICY owner_all ON crm_deals FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Accounting
CREATE TABLE IF NOT EXISTS accounting_invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  number TEXT NOT NULL,
  client TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','overdue')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounting_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vendor TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_acc_inv_user ON accounting_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_acc_exp_user ON accounting_expenses(user_id);

DROP TRIGGER IF EXISTS trg_acc_invoices_updated_at ON accounting_invoices;
CREATE TRIGGER trg_acc_invoices_updated_at BEFORE UPDATE ON accounting_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS trg_acc_expenses_updated_at ON accounting_expenses;
CREATE TRIGGER trg_acc_expenses_updated_at BEFORE UPDATE ON accounting_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE accounting_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_expenses ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'accounting_invoices' AND policyname = 'owner_all') THEN
    CREATE POLICY owner_all ON accounting_invoices FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'accounting_expenses' AND policyname = 'owner_all') THEN
    CREATE POLICY owner_all ON accounting_expenses FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;