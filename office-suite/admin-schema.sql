-- ============================================================================
-- ADMIN CONSOLE DATABASE SCHEMA
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ADMIN USERS TABLE
-- ============================================================================

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

-- ============================================================================
-- EMAIL SERVERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_servers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('smtp', 'imap', 'pop3', 'exchange')),
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

-- ============================================================================
-- EMAIL TEMPLATES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('welcome', 'notification', 'marketing', 'system', 'custom')),
    category VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    variables TEXT[] DEFAULT '{}',
    usage_count INTEGER DEFAULT 0,
    created_by VARCHAR(255) NOT NULL,
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- EMAIL RULES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    condition_text TEXT NOT NULL,
    action_text TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    category VARCHAR(50) NOT NULL CHECK (category IN ('filtering', 'routing', 'processing', 'security', 'compliance')),
    last_triggered TIMESTAMP WITH TIME ZONE,
    trigger_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- EMAIL QUOTAS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_quotas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    storage_used DECIMAL(10,2) DEFAULT 0.00,
    storage_limit DECIMAL(10,2) NOT NULL,
    message_count INTEGER DEFAULT 0,
    message_limit INTEGER NOT NULL,
    last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    next_reset TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'normal' CHECK (status IN ('normal', 'warning', 'exceeded', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SYSTEM METRICS TABLE
-- ============================================================================

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

-- ============================================================================
-- AUDIT LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('success', 'failure', 'warning')),
    ip_address INET,
    user_agent TEXT,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ALERTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'acknowledged')),
    source VARCHAR(255) NOT NULL,
    assigned_to VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    acknowledged_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- DOMAINS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_name VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed', 'suspended')),
    verification_token VARCHAR(255),
    dns_records JSONB DEFAULT '[]',
    ssl_enabled BOOLEAN DEFAULT false,
    ssl_certificate TEXT,
    ssl_expiry TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INTEGRATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('oauth', 'api', 'webhook', 'smtp', 'imap', 'pop3', 'exchange')),
    provider VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error', 'testing')),
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_count INTEGER DEFAULT 0,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Admin Users indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_status ON admin_users(status);

-- Email Servers indexes
CREATE INDEX IF NOT EXISTS idx_email_servers_type ON email_servers(type);
CREATE INDEX IF NOT EXISTS idx_email_servers_status ON email_servers(status);

-- Email Templates indexes
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(type);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);

-- Email Rules indexes
CREATE INDEX IF NOT EXISTS idx_email_rules_category ON email_rules(category);
CREATE INDEX IF NOT EXISTS idx_email_rules_active ON email_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_email_rules_priority ON email_rules(priority);

-- Email Quotas indexes
CREATE INDEX IF NOT EXISTS idx_email_quotas_user ON email_quotas(user_email);
CREATE INDEX IF NOT EXISTS idx_email_quotas_domain ON email_quotas(domain);
CREATE INDEX IF NOT EXISTS idx_email_quotas_status ON email_quotas(status);

-- System Metrics indexes
CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON system_metrics(name);
CREATE INDEX IF NOT EXISTS idx_system_metrics_status ON system_metrics(status);
CREATE INDEX IF NOT EXISTS idx_system_metrics_updated ON system_metrics(last_updated);

-- Audit Logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON audit_logs(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Alerts indexes
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at);

-- Domains indexes
CREATE INDEX IF NOT EXISTS idx_domains_name ON domains(domain_name);
CREATE INDEX IF NOT EXISTS idx_domains_status ON domains(status);

-- Integrations indexes
CREATE INDEX IF NOT EXISTS idx_integrations_type ON integrations(type);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON integrations(provider);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_servers_updated_at BEFORE UPDATE ON email_servers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_rules_updated_at BEFORE UPDATE ON email_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_quotas_updated_at BEFORE UPDATE ON email_quotas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_domains_updated_at BEFORE UPDATE ON domains FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default system metrics
INSERT INTO system_metrics (name, value, unit, status, trend, threshold_warning, threshold_critical) VALUES
('CPU Usage', 0, '%', 'normal', 'stable', 70, 90),
('Memory Usage', 0, '%', 'normal', 'stable', 75, 90),
('Disk Usage', 0, '%', 'normal', 'stable', 80, 90),
('Email Queue', 0, 'emails', 'normal', 'stable', 1000, 5000)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VIEWS FOR REPORTING
-- ============================================================================

-- User statistics view
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
    role,
    status,
    COUNT(*) as user_count,
    AVG(used_quota::DECIMAL / quota::DECIMAL * 100) as avg_quota_usage
FROM admin_users
GROUP BY role, status;

-- System health view
CREATE OR REPLACE VIEW system_health AS
SELECT 
    sm.name,
    sm.value,
    sm.status,
    sm.trend,
    sm.last_updated,
    CASE 
        WHEN sm.value >= sm.threshold_critical THEN 'critical'
        WHEN sm.value >= sm.threshold_warning THEN 'warning'
        ELSE 'normal'
    END as health_status
FROM system_metrics sm;

-- Recent audit activity view
CREATE OR REPLACE VIEW recent_audit_activity AS
SELECT 
    user_email,
    action,
    resource,
    status,
    timestamp,
    COUNT(*) OVER (PARTITION BY user_email, DATE(timestamp)) as daily_actions
FROM audit_logs
WHERE timestamp >= NOW() - INTERVAL '7 days'
ORDER BY timestamp DESC;
