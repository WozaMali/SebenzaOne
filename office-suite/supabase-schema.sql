-- Supabase Schema for Mail Settings
-- Run this in your Supabase SQL editor

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
CREATE TRIGGER update_mail_config_updated_at BEFORE UPDATE ON mail_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_domains_updated_at BEFORE UPDATE ON domains FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_rules_updated_at BEFORE UPDATE ON email_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO mail_config (
  smtp_host, smtp_port, aws_region, aws_access_key_id, aws_secret_access_key,
  from_email, from_name, ssl_enabled, two_factor_enabled, spam_protection, virus_scanning
) VALUES (
  'email-smtp.us-east-1.amazonaws.com', 587, 'us-east-1', 'YOUR_AWS_ACCESS_KEY', 'YOUR_AWS_SECRET_KEY',
  'noreply@yourdomain.com', 'Your Company', true, false, true, true
) ON CONFLICT DO NOTHING;

INSERT INTO domains (name, status, records, total_records, users, is_active) VALUES
('yourdomain.com', 'verified', 3, 3, 5, true),
('subdomain.yourdomain.com', 'pending', 2, 3, 2, false)
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (name, email, role, status) VALUES
('Admin User', 'admin@yourdomain.com', 'Admin', 'Active'),
('John Doe', 'john@yourdomain.com', 'User', 'Active'),
('Jane Smith', 'jane@yourdomain.com', 'User', 'Active')
ON CONFLICT (email) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE mail_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_rules ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your authentication needs)
-- For now, allow all operations for authenticated users
-- Use IF NOT EXISTS to avoid conflicts with existing policies
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
