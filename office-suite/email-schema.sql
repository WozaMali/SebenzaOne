-- ============================================================================
-- EMAIL SCHEMA FOR SEBENZA SUITE
-- ============================================================================
-- This schema creates all necessary tables for email functionality
-- Run this in your Supabase SQL Editor after setting up the admin schema

-- ============================================================================
-- EMAIL TABLES
-- ============================================================================

-- Email folders table (must be created first for foreign key references)
CREATE TABLE IF NOT EXISTS email_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'custom' CHECK (type IN ('inbox', 'sent', 'drafts', 'starred', 'archive', 'spam', 'trash', 'custom')),
  unread_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  color TEXT,
  is_system BOOLEAN DEFAULT false,
  path TEXT NOT NULL,
  sync_enabled BOOLEAN DEFAULT true,
  permissions JSONB DEFAULT '{"read": true, "write": true, "delete": true}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emails table
CREATE TABLE IF NOT EXISTS emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_emails JSONB NOT NULL DEFAULT '[]',
  cc_emails JSONB DEFAULT '[]',
  bcc_emails JSONB DEFAULT '[]',
  body TEXT NOT NULL,
  is_html BOOLEAN DEFAULT false,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  folder_id UUID,
  is_read BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  is_important BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  is_draft BOOLEAN DEFAULT false,
  is_sent BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  is_spam BOOLEAN DEFAULT false,
  has_attachments BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]',
  labels JSONB DEFAULT '[]',
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  thread_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- Email threads table
CREATE TABLE IF NOT EXISTS email_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  participants JSONB DEFAULT '[]',
  last_message_date TIMESTAMPTZ,
  message_count INTEGER DEFAULT 0,
  is_read BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  is_important BOOLEAN DEFAULT false,
  labels JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email attachments table
CREATE TABLE IF NOT EXISTS email_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID,
  filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  file_path TEXT,
  is_inline BOOLEAN DEFAULT false,
  content_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email labels table
CREATE TABLE IF NOT EXISTS email_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#3b82f6',
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email rules table (for filtering and automation)
CREATE TABLE IF NOT EXISTS email_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  conditions JSONB NOT NULL,
  actions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Add foreign key constraints after tables are created
ALTER TABLE emails ADD CONSTRAINT fk_emails_folder_id 
  FOREIGN KEY (folder_id) REFERENCES email_folders(id) ON DELETE SET NULL;

ALTER TABLE email_attachments ADD CONSTRAINT fk_email_attachments_email_id 
  FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE;

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Email indexes
CREATE INDEX IF NOT EXISTS idx_emails_folder_id ON emails(folder_id);
CREATE INDEX IF NOT EXISTS idx_emails_date ON emails(date);
CREATE INDEX IF NOT EXISTS idx_emails_from_email ON emails(from_email);
CREATE INDEX IF NOT EXISTS idx_emails_is_read ON emails(is_read);
CREATE INDEX IF NOT EXISTS idx_emails_is_starred ON emails(is_starred);
CREATE INDEX IF NOT EXISTS idx_emails_is_important ON emails(is_important);
CREATE INDEX IF NOT EXISTS idx_emails_thread_id ON emails(thread_id);
CREATE INDEX IF NOT EXISTS idx_emails_created_at ON emails(created_at);

-- Folder indexes
CREATE INDEX IF NOT EXISTS idx_email_folders_type ON email_folders(type);
CREATE INDEX IF NOT EXISTS idx_email_folders_is_system ON email_folders(is_system);

-- Thread indexes
CREATE INDEX IF NOT EXISTS idx_email_threads_last_message_date ON email_threads(last_message_date);
CREATE INDEX IF NOT EXISTS idx_email_threads_is_read ON email_threads(is_read);

-- Attachment indexes
CREATE INDEX IF NOT EXISTS idx_email_attachments_email_id ON email_attachments(email_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_rules ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust based on your auth requirements)
CREATE POLICY "Users can view their own emails" ON emails
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own emails" ON emails
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own emails" ON emails
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own emails" ON emails
  FOR DELETE USING (true);

-- Folder policies
CREATE POLICY "Users can view folders" ON email_folders
  FOR SELECT USING (true);

CREATE POLICY "Users can manage folders" ON email_folders
  FOR ALL USING (true);

-- Thread policies
CREATE POLICY "Users can view threads" ON email_threads
  FOR SELECT USING (true);

CREATE POLICY "Users can manage threads" ON email_threads
  FOR ALL USING (true);

-- Attachment policies
CREATE POLICY "Users can view attachments" ON email_attachments
  FOR SELECT USING (true);

CREATE POLICY "Users can manage attachments" ON email_attachments
  FOR ALL USING (true);

-- Label policies
CREATE POLICY "Users can view labels" ON email_labels
  FOR SELECT USING (true);

CREATE POLICY "Users can manage labels" ON email_labels
  FOR ALL USING (true);

-- Rule policies
CREATE POLICY "Users can view rules" ON email_rules
  FOR SELECT USING (true);

CREATE POLICY "Users can manage rules" ON email_rules
  FOR ALL USING (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================


-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
DROP TRIGGER IF EXISTS trigger_emails_updated_at ON emails;
CREATE TRIGGER trigger_emails_updated_at
  BEFORE UPDATE ON emails
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_email_folders_updated_at ON email_folders;
CREATE TRIGGER trigger_email_folders_updated_at
  BEFORE UPDATE ON email_folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_email_threads_updated_at ON email_threads;
CREATE TRIGGER trigger_email_threads_updated_at
  BEFORE UPDATE ON email_threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_email_rules_updated_at ON email_rules;
CREATE TRIGGER trigger_email_rules_updated_at
  BEFORE UPDATE ON email_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default system folders
INSERT INTO email_folders (id, name, type, is_system, path, permissions) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Inbox', 'inbox', true, '/inbox', '{"read": true, "write": true, "delete": true}'),
  ('00000000-0000-0000-0000-000000000002', 'Sent', 'sent', true, '/sent', '{"read": true, "write": false, "delete": true}'),
  ('00000000-0000-0000-0000-000000000003', 'Drafts', 'drafts', true, '/drafts', '{"read": true, "write": true, "delete": true}'),
  ('00000000-0000-0000-0000-000000000004', 'Starred', 'starred', true, '/starred', '{"read": true, "write": true, "delete": true}'),
  ('00000000-0000-0000-0000-000000000005', 'Archive', 'archive', true, '/archive', '{"read": true, "write": true, "delete": true}'),
  ('00000000-0000-0000-0000-000000000006', 'Spam', 'spam', true, '/spam', '{"read": true, "write": false, "delete": true}'),
  ('00000000-0000-0000-0000-000000000007', 'Trash', 'trash', true, '/trash', '{"read": true, "write": false, "delete": true}')
ON CONFLICT (id) DO NOTHING;

-- Insert default system labels
INSERT INTO email_labels (id, name, color, is_system, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Important', '#ef4444', true, 'Important emails'),
  ('00000000-0000-0000-0000-000000000002', 'Work', '#3b82f6', true, 'Work-related emails'),
  ('00000000-0000-0000-0000-000000000003', 'Personal', '#10b981', true, 'Personal emails'),
  ('00000000-0000-0000-0000-000000000004', 'Newsletters', '#f59e0b', true, 'Newsletter subscriptions')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Uncomment the following section to insert sample emails for testing
/*
INSERT INTO emails (subject, from_email, from_name, to_emails, body, folder_id, is_read, is_starred) VALUES
  ('Welcome to Sebenza Suite', 'noreply@sebenza.co.za', 'Sebenza Team', '[{"name": "User", "email": "user@example.com"}]', 'Welcome to our platform!', '00000000-0000-0000-0000-000000000001', false, false),
  ('Meeting Reminder', 'calendar@sebenza.co.za', 'Calendar System', '[{"name": "User", "email": "user@example.com"}]', 'You have a meeting in 30 minutes.', '00000000-0000-0000-0000-000000000001', true, true),
  ('Project Update', 'project@sebenza.co.za', 'Project Manager', '[{"name": "User", "email": "user@example.com"}]', 'Here is the latest update on your project.', '00000000-0000-0000-0000-000000000001', false, false);
*/

-- ============================================================================
-- FOLDER COUNT TRIGGERS (Created after all tables and data)
-- ============================================================================

-- Update folder counts when emails change
CREATE OR REPLACE FUNCTION update_folder_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update folder counts based on email changes
  IF TG_OP = 'INSERT' THEN
    UPDATE email_folders 
    SET total_count = total_count + 1,
        unread_count = unread_count + CASE WHEN NEW.is_read = false THEN 1 ELSE 0 END
    WHERE id = NEW.folder_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle read status changes
    IF OLD.is_read != NEW.is_read THEN
      UPDATE email_folders 
      SET unread_count = unread_count + CASE WHEN NEW.is_read = false THEN 1 ELSE -1 END
      WHERE id = NEW.folder_id;
    END IF;
    
    -- Handle folder changes
    IF OLD.folder_id != NEW.folder_id THEN
      -- Decrease old folder counts
      UPDATE email_folders 
      SET total_count = total_count - 1,
          unread_count = unread_count - CASE WHEN OLD.is_read = false THEN 1 ELSE 0 END
      WHERE id = OLD.folder_id;
      
      -- Increase new folder counts
      UPDATE email_folders 
      SET total_count = total_count + 1,
          unread_count = unread_count + CASE WHEN NEW.is_read = false THEN 1 ELSE 0 END
      WHERE id = NEW.folder_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE email_folders 
    SET total_count = total_count - 1,
        unread_count = unread_count - CASE WHEN OLD.is_read = false THEN 1 ELSE 0 END
    WHERE id = OLD.folder_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create folder count trigger
DROP TRIGGER IF EXISTS trigger_update_folder_counts ON emails;
CREATE TRIGGER trigger_update_folder_counts
  AFTER INSERT OR UPDATE OR DELETE ON emails
  FOR EACH ROW EXECUTE FUNCTION update_folder_counts();

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Email schema setup completed successfully!';
  RAISE NOTICE 'Tables created: emails, email_folders, email_threads, email_attachments, email_labels, email_rules';
  RAISE NOTICE 'Indexes, RLS policies, and triggers have been applied';
  RAISE NOTICE 'Default system folders and labels have been inserted';
END $$;
