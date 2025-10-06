-- CRM Database Schema for Supabase
-- This schema defines all the tables needed for the CRM module

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE deal_stage AS ENUM ('lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost');
CREATE TYPE contact_status AS ENUM ('active', 'inactive', 'prospect', 'customer', 'lead');
CREATE TYPE company_status AS ENUM ('active', 'inactive', 'prospect', 'customer', 'competitor');
CREATE TYPE activity_type AS ENUM ('call', 'email', 'meeting', 'note', 'task', 'file', 'deal_update');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE deal_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE deal_status AS ENUM ('active', 'won', 'lost', 'paused', 'cancelled');
CREATE TYPE company_size AS ENUM ('startup', 'small', 'medium', 'large', 'enterprise');
CREATE TYPE address_type AS ENUM ('work', 'home', 'billing', 'shipping', 'other');
CREATE TYPE social_platform AS ENUM ('linkedin', 'twitter', 'facebook', 'instagram', 'github', 'website');
CREATE TYPE source_type AS ENUM ('manual', 'import', 'email', 'website', 'referral', 'cold_call', 'advertisement', 'other');

-- Companies table
CREATE TABLE crm_companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    website VARCHAR(500),
    industry VARCHAR(100),
    size company_size,
    description TEXT,
    logo VARCHAR(500),
    phone VARCHAR(50),
    email VARCHAR(255),
    address JSONB, -- Store address as JSON
    tags TEXT[] DEFAULT '{}',
    is_favorite BOOLEAN DEFAULT FALSE,
    status company_status DEFAULT 'prospect',
    annual_revenue BIGINT,
    employee_count INTEGER,
    founded_year INTEGER,
    last_contact_date TIMESTAMP WITH TIME ZONE,
    next_follow_up TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    assigned_to UUID REFERENCES auth.users(id),
    custom_fields JSONB DEFAULT '{}',
    social_profiles JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contacts table
CREATE TABLE crm_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    title VARCHAR(100),
    company_id UUID REFERENCES crm_companies(id) ON DELETE SET NULL,
    avatar VARCHAR(500),
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    is_favorite BOOLEAN DEFAULT FALSE,
    source source_type DEFAULT 'manual',
    status contact_status DEFAULT 'prospect',
    last_contact_date TIMESTAMP WITH TIME ZONE,
    next_follow_up TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    assigned_to UUID REFERENCES auth.users(id),
    custom_fields JSONB DEFAULT '{}',
    social_profiles JSONB DEFAULT '[]',
    addresses JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deals table
CREATE TABLE crm_deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    value BIGINT NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'ZAR',
    stage deal_stage DEFAULT 'lead',
    probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
    close_date TIMESTAMP WITH TIME ZONE,
    expected_close_date TIMESTAMP WITH TIME ZONE,
    contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
    company_id UUID REFERENCES crm_companies(id) ON DELETE SET NULL,
    owner_id UUID REFERENCES auth.users(id) NOT NULL,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    source source_type DEFAULT 'other',
    priority deal_priority DEFAULT 'medium',
    status deal_status DEFAULT 'active',
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    won_date TIMESTAMP WITH TIME ZONE,
    lost_date TIMESTAMP WITH TIME ZONE,
    lost_reason TEXT,
    next_follow_up TIMESTAMP WITH TIME ZONE,
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE
);

-- Activities table
CREATE TABLE crm_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type activity_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER, -- in minutes
    contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
    company_id UUID REFERENCES crm_companies(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES crm_deals(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    priority priority_level DEFAULT 'medium',
    tags TEXT[] DEFAULT '{}',
    email_thread_id UUID, -- Reference to email thread if applicable
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email threads table
CREATE TABLE crm_email_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject VARCHAR(500) NOT NULL,
    participants JSONB NOT NULL DEFAULT '[]', -- Array of email addresses
    last_message_date TIMESTAMP WITH TIME ZONE NOT NULL,
    message_count INTEGER DEFAULT 1,
    is_read BOOLEAN DEFAULT FALSE,
    is_important BOOLEAN DEFAULT FALSE,
    is_starred BOOLEAN DEFAULT FALSE,
    folder VARCHAR(100) DEFAULT 'inbox',
    labels TEXT[] DEFAULT '{}',
    contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
    company_id UUID REFERENCES crm_companies(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES crm_deals(id) ON DELETE SET NULL,
    activity_id UUID REFERENCES crm_activities(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email messages table
CREATE TABLE crm_email_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID REFERENCES crm_email_threads(id) ON DELETE CASCADE,
    from_email JSONB NOT NULL, -- Email address object
    to_emails JSONB NOT NULL DEFAULT '[]', -- Array of email addresses
    cc_emails JSONB DEFAULT '[]',
    bcc_emails JSONB DEFAULT '[]',
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    is_html BOOLEAN DEFAULT FALSE,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_important BOOLEAN DEFAULT FALSE,
    is_starred BOOLEAN DEFAULT FALSE,
    has_attachments BOOLEAN DEFAULT FALSE,
    attachments JSONB DEFAULT '[]',
    labels TEXT[] DEFAULT '{}',
    folder VARCHAR(100) DEFAULT 'inbox',
    priority VARCHAR(10) DEFAULT 'normal',
    in_reply_to VARCHAR(255),
    "references" TEXT[],
    message_id VARCHAR(255) UNIQUE NOT NULL,
    size BIGINT DEFAULT 0,
    is_encrypted BOOLEAN DEFAULT FALSE,
    is_signed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE crm_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type activity_type NOT NULL,
    priority priority_level DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending',
    due_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES auth.users(id) NOT NULL,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
    company_id UUID REFERENCES crm_companies(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES crm_deals(id) ON DELETE SET NULL,
    activity_id UUID REFERENCES crm_activities(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communications table
CREATE TABLE crm_communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type activity_type NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
    company_id UUID REFERENCES crm_companies(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES crm_deals(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    is_important BOOLEAN DEFAULT FALSE,
    is_starred BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    attachments JSONB DEFAULT '[]',
    email_thread_id UUID REFERENCES crm_email_threads(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_crm_companies_name ON crm_companies(name);
CREATE INDEX idx_crm_companies_industry ON crm_companies(industry);
CREATE INDEX idx_crm_companies_status ON crm_companies(status);
CREATE INDEX idx_crm_companies_created_by ON crm_companies(created_by);
CREATE INDEX idx_crm_companies_assigned_to ON crm_companies(assigned_to);

CREATE INDEX idx_crm_contacts_email ON crm_contacts(email);
CREATE INDEX idx_crm_contacts_company_id ON crm_contacts(company_id);
CREATE INDEX idx_crm_contacts_status ON crm_contacts(status);
CREATE INDEX idx_crm_contacts_created_by ON crm_contacts(created_by);
CREATE INDEX idx_crm_contacts_assigned_to ON crm_contacts(assigned_to);
CREATE INDEX idx_crm_contacts_name ON crm_contacts(first_name, last_name);

CREATE INDEX idx_crm_deals_stage ON crm_deals(stage);
CREATE INDEX idx_crm_deals_status ON crm_deals(status);
CREATE INDEX idx_crm_deals_contact_id ON crm_deals(contact_id);
CREATE INDEX idx_crm_deals_company_id ON crm_deals(company_id);
CREATE INDEX idx_crm_deals_owner_id ON crm_deals(owner_id);
CREATE INDEX idx_crm_deals_created_by ON crm_deals(created_by);
CREATE INDEX idx_crm_deals_expected_close_date ON crm_deals(expected_close_date);

CREATE INDEX idx_crm_activities_type ON crm_activities(type);
CREATE INDEX idx_crm_activities_date ON crm_activities(date);
CREATE INDEX idx_crm_activities_contact_id ON crm_activities(contact_id);
CREATE INDEX idx_crm_activities_company_id ON crm_activities(company_id);
CREATE INDEX idx_crm_activities_deal_id ON crm_activities(deal_id);
CREATE INDEX idx_crm_activities_user_id ON crm_activities(user_id);

CREATE INDEX idx_crm_email_threads_contact_id ON crm_email_threads(contact_id);
CREATE INDEX idx_crm_email_threads_company_id ON crm_email_threads(company_id);
CREATE INDEX idx_crm_email_threads_deal_id ON crm_email_threads(deal_id);
CREATE INDEX idx_crm_email_threads_last_message_date ON crm_email_threads(last_message_date);

CREATE INDEX idx_crm_email_messages_thread_id ON crm_email_messages(thread_id);
CREATE INDEX idx_crm_email_messages_date ON crm_email_messages(date);
CREATE INDEX idx_crm_email_messages_message_id ON crm_email_messages(message_id);

CREATE INDEX idx_crm_tasks_assigned_to ON crm_tasks(assigned_to);
CREATE INDEX idx_crm_tasks_due_date ON crm_tasks(due_date);
CREATE INDEX idx_crm_tasks_status ON crm_tasks(status);
CREATE INDEX idx_crm_tasks_contact_id ON crm_tasks(contact_id);
CREATE INDEX idx_crm_tasks_company_id ON crm_tasks(company_id);
CREATE INDEX idx_crm_tasks_deal_id ON crm_tasks(deal_id);

CREATE INDEX idx_crm_communications_contact_id ON crm_communications(contact_id);
CREATE INDEX idx_crm_communications_company_id ON crm_communications(company_id);
CREATE INDEX idx_crm_communications_deal_id ON crm_communications(deal_id);
CREATE INDEX idx_crm_communications_date ON crm_communications(date);
CREATE INDEX idx_crm_communications_type ON crm_communications(type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_crm_companies_updated_at BEFORE UPDATE ON crm_companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crm_contacts_updated_at BEFORE UPDATE ON crm_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crm_deals_updated_at BEFORE UPDATE ON crm_deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crm_activities_updated_at BEFORE UPDATE ON crm_activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crm_email_threads_updated_at BEFORE UPDATE ON crm_email_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crm_tasks_updated_at BEFORE UPDATE ON crm_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crm_communications_updated_at BEFORE UPDATE ON crm_communications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE crm_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_email_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_communications ENABLE ROW LEVEL SECURITY;

-- Create policies for companies
CREATE POLICY "Users can view their own companies" ON crm_companies
    FOR SELECT USING (auth.uid() = created_by OR auth.uid() = assigned_to);

CREATE POLICY "Users can insert their own companies" ON crm_companies
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own companies" ON crm_companies
    FOR UPDATE USING (auth.uid() = created_by OR auth.uid() = assigned_to);

CREATE POLICY "Users can delete their own companies" ON crm_companies
    FOR DELETE USING (auth.uid() = created_by);

-- Create policies for contacts
CREATE POLICY "Users can view their own contacts" ON crm_contacts
    FOR SELECT USING (auth.uid() = created_by OR auth.uid() = assigned_to);

CREATE POLICY "Users can insert their own contacts" ON crm_contacts
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own contacts" ON crm_contacts
    FOR UPDATE USING (auth.uid() = created_by OR auth.uid() = assigned_to);

CREATE POLICY "Users can delete their own contacts" ON crm_contacts
    FOR DELETE USING (auth.uid() = created_by);

-- Create policies for deals
CREATE POLICY "Users can view their own deals" ON crm_deals
    FOR SELECT USING (auth.uid() = owner_id OR auth.uid() = created_by);

CREATE POLICY "Users can insert their own deals" ON crm_deals
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own deals" ON crm_deals
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own deals" ON crm_deals
    FOR DELETE USING (auth.uid() = owner_id);

-- Create policies for activities
CREATE POLICY "Users can view their own activities" ON crm_activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities" ON crm_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities" ON crm_activities
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities" ON crm_activities
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for email threads
CREATE POLICY "Users can view their own email threads" ON crm_email_threads
    FOR SELECT USING (true); -- Allow all users to view email threads for now

CREATE POLICY "Users can insert email threads" ON crm_email_threads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update email threads" ON crm_email_threads
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete email threads" ON crm_email_threads
    FOR DELETE USING (true);

-- Create policies for email messages
CREATE POLICY "Users can view email messages" ON crm_email_messages
    FOR SELECT USING (true);

CREATE POLICY "Users can insert email messages" ON crm_email_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update email messages" ON crm_email_messages
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete email messages" ON crm_email_messages
    FOR DELETE USING (true);

-- Create policies for tasks
CREATE POLICY "Users can view their own tasks" ON crm_tasks
    FOR SELECT USING (auth.uid() = assigned_to OR auth.uid() = created_by);

CREATE POLICY "Users can insert their own tasks" ON crm_tasks
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own tasks" ON crm_tasks
    FOR UPDATE USING (auth.uid() = assigned_to OR auth.uid() = created_by);

CREATE POLICY "Users can delete their own tasks" ON crm_tasks
    FOR DELETE USING (auth.uid() = created_by);

-- Create policies for communications
CREATE POLICY "Users can view their own communications" ON crm_communications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own communications" ON crm_communications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own communications" ON crm_communications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own communications" ON crm_communications
    FOR DELETE USING (auth.uid() = user_id);

-- Create views for analytics
CREATE VIEW crm_deal_analytics AS
SELECT 
    stage,
    COUNT(*) as deal_count,
    SUM(value) as total_value,
    AVG(value) as average_value,
    AVG(probability) as average_probability
FROM crm_deals
WHERE status = 'active'
GROUP BY stage;

CREATE VIEW crm_contact_analytics AS
SELECT 
    status,
    COUNT(*) as contact_count,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_this_month
FROM crm_contacts
GROUP BY status;

CREATE VIEW crm_company_analytics AS
SELECT 
    industry,
    size,
    COUNT(*) as company_count,
    AVG(employee_count) as avg_employee_count,
    AVG(annual_revenue) as avg_annual_revenue
FROM crm_companies
GROUP BY industry, size;

-- Create functions for common operations
CREATE OR REPLACE FUNCTION get_contact_deals(contact_uuid UUID)
RETURNS TABLE (
    deal_id UUID,
    deal_name VARCHAR(255),
    deal_value BIGINT,
    deal_stage deal_stage,
    deal_status deal_status
) AS $$
BEGIN
    RETURN QUERY
    SELECT d.id, d.name, d.value, d.stage, d.status
    FROM crm_deals d
    WHERE d.contact_id = contact_uuid;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_company_contacts(company_uuid UUID)
RETURNS TABLE (
    contact_id UUID,
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_title VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, CONCAT(c.first_name, ' ', c.last_name), c.email, c.title
    FROM crm_contacts c
    WHERE c.company_id = company_uuid;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_deal_activities(deal_uuid UUID)
RETURNS TABLE (
    activity_id UUID,
    activity_type activity_type,
    activity_title VARCHAR(255),
    activity_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT a.id, a.type, a.title, a.date
    FROM crm_activities a
    WHERE a.deal_id = deal_uuid
    ORDER BY a.date DESC;
END;
$$ LANGUAGE plpgsql;
