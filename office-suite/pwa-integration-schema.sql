-- PWA Integration Schema for Sebenza Suite
-- Handles cross-module data synchronization, offline capabilities, and PWA features

-- Integration Events Table
-- Tracks all cross-module events and data changes
CREATE TABLE IF NOT EXISTS integration_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL, -- 'email_received', 'email_sent', 'deal_created', etc.
  module VARCHAR(20) NOT NULL, -- 'mail', 'crm', 'projects', 'accounting', 'drive'
  entity_id VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL,
  related_entities JSONB DEFAULT '[]'::jsonb,
  processed BOOLEAN DEFAULT FALSE,
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PWA Sync Queue
-- Queues actions for offline processing
CREATE TABLE IF NOT EXISTS pwa_sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action_type VARCHAR(50) NOT NULL, -- 'send_email', 'create_deal', 'update_contact', etc.
  module VARCHAR(20) NOT NULL,
  entity_id VARCHAR(100),
  data JSONB NOT NULL,
  priority INTEGER DEFAULT 0, -- Higher number = higher priority
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- PWA Cache Management
-- Tracks cached data for offline access
CREATE TABLE IF NOT EXISTS pwa_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  cache_key VARCHAR(255) NOT NULL,
  module VARCHAR(20) NOT NULL,
  data_type VARCHAR(50) NOT NULL, -- 'email', 'contact', 'deal', etc.
  data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  access_count INTEGER DEFAULT 0,
  size_bytes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, cache_key)
);

-- PWA Notifications
-- Manages push notifications and alerts
CREATE TABLE IF NOT EXISTS pwa_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'email', 'deal_update', 'task_reminder', etc.
  module VARCHAR(20) NOT NULL,
  entity_id VARCHAR(100),
  data JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
  priority VARCHAR(10) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  action_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PWA User Settings
-- Stores PWA-specific user preferences
CREATE TABLE IF NOT EXISTS pwa_user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  offline_mode BOOLEAN DEFAULT TRUE,
  auto_sync BOOLEAN DEFAULT TRUE,
  sync_interval INTEGER DEFAULT 300, -- seconds
  cache_size_limit BIGINT DEFAULT 104857600, -- 100MB in bytes
  push_notifications BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  desktop_notifications BOOLEAN DEFAULT TRUE,
  sound_notifications BOOLEAN DEFAULT TRUE,
  theme VARCHAR(20) DEFAULT 'system', -- 'light', 'dark', 'system'
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PWA Installation Tracking
-- Tracks PWA installations and usage
CREATE TABLE IF NOT EXISTS pwa_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  device_info JSONB NOT NULL,
  browser_info JSONB NOT NULL,
  installation_method VARCHAR(50), -- 'prompt', 'manual', 'bookmark'
  version VARCHAR(20) NOT NULL,
  is_installed BOOLEAN DEFAULT TRUE,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PWA Sync Status
-- Tracks synchronization status across modules
CREATE TABLE IF NOT EXISTS pwa_sync_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module VARCHAR(20) NOT NULL,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status VARCHAR(20) DEFAULT 'idle', -- 'idle', 'syncing', 'success', 'error'
  error_message TEXT,
  pending_items INTEGER DEFAULT 0,
  synced_items INTEGER DEFAULT 0,
  failed_items INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module)
);

-- PWA Search History
-- Stores search queries and results for analytics
CREATE TABLE IF NOT EXISTS pwa_search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  modules_searched JSONB DEFAULT '[]'::jsonb,
  filters_applied JSONB DEFAULT '{}'::jsonb,
  result_clicked BOOLEAN DEFAULT FALSE,
  clicked_result_id VARCHAR(100),
  search_duration INTEGER, -- milliseconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PWA Analytics
-- Tracks PWA usage and performance metrics
CREATE TABLE IF NOT EXISTS pwa_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_type VARCHAR(50) NOT NULL, -- 'page_view', 'action', 'error', 'performance'
  event_name VARCHAR(100) NOT NULL,
  module VARCHAR(20),
  data JSONB DEFAULT '{}'::jsonb,
  session_id VARCHAR(100),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PWA Offline Actions
-- Tracks actions performed while offline
CREATE TABLE IF NOT EXISTS pwa_offline_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  module VARCHAR(20) NOT NULL,
  entity_id VARCHAR(100),
  data JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'synced', 'failed'
  created_offline_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0
);

-- Cross-Module Relationships
-- Maps relationships between entities across modules
CREATE TABLE IF NOT EXISTS cross_module_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_module VARCHAR(20) NOT NULL,
  source_entity_id VARCHAR(100) NOT NULL,
  source_entity_type VARCHAR(50) NOT NULL,
  target_module VARCHAR(20) NOT NULL,
  target_entity_id VARCHAR(100) NOT NULL,
  target_entity_type VARCHAR(50) NOT NULL,
  relationship_type VARCHAR(50) NOT NULL, -- 'contact', 'company', 'deal', 'email', etc.
  strength DECIMAL(3,2) DEFAULT 1.0, -- Relationship strength (0.0 to 1.0)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(source_module, source_entity_id, target_module, target_entity_id)
);

-- PWA File Attachments
-- Tracks file attachments across modules
CREATE TABLE IF NOT EXISTS pwa_file_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  module VARCHAR(20) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  is_offline_available BOOLEAN DEFAULT FALSE,
  download_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PWA Background Sync
-- Manages background synchronization tasks
CREATE TABLE IF NOT EXISTS pwa_background_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  sync_type VARCHAR(50) NOT NULL, -- 'email', 'crm', 'projects', 'accounting', 'drive'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  items_processed INTEGER DEFAULT 0,
  items_total INTEGER DEFAULT 0,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_integration_events_user_timestamp ON integration_events(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_integration_events_type ON integration_events(type);
CREATE INDEX IF NOT EXISTS idx_integration_events_module ON integration_events(module);
CREATE INDEX IF NOT EXISTS idx_integration_events_processed ON integration_events(processed);

CREATE INDEX IF NOT EXISTS idx_pwa_sync_queue_user_status ON pwa_sync_queue(user_id, status);
CREATE INDEX IF NOT EXISTS idx_pwa_sync_queue_priority ON pwa_sync_queue(priority DESC);
CREATE INDEX IF NOT EXISTS idx_pwa_sync_queue_created ON pwa_sync_queue(created_at);

CREATE INDEX IF NOT EXISTS idx_pwa_cache_user_key ON pwa_cache(user_id, cache_key);
CREATE INDEX IF NOT EXISTS idx_pwa_cache_module ON pwa_cache(module);
CREATE INDEX IF NOT EXISTS idx_pwa_cache_expires ON pwa_cache(expires_at);

CREATE INDEX IF NOT EXISTS idx_pwa_notifications_user_status ON pwa_notifications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_pwa_notifications_scheduled ON pwa_notifications(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_pwa_notifications_type ON pwa_notifications(type);

CREATE INDEX IF NOT EXISTS idx_pwa_sync_status_user_module ON pwa_sync_status(user_id, module);

CREATE INDEX IF NOT EXISTS idx_pwa_search_history_user ON pwa_search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_pwa_search_history_created ON pwa_search_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pwa_analytics_user_event ON pwa_analytics(user_id, event_type);
CREATE INDEX IF NOT EXISTS idx_pwa_analytics_timestamp ON pwa_analytics(timestamp);

CREATE INDEX IF NOT EXISTS idx_cross_module_relationships_source ON cross_module_relationships(source_module, source_entity_id);
CREATE INDEX IF NOT EXISTS idx_cross_module_relationships_target ON cross_module_relationships(target_module, target_entity_id);

CREATE INDEX IF NOT EXISTS idx_pwa_file_attachments_user ON pwa_file_attachments(user_id);
CREATE INDEX IF NOT EXISTS idx_pwa_file_attachments_module_entity ON pwa_file_attachments(module, entity_id);

CREATE INDEX IF NOT EXISTS idx_pwa_background_sync_user_status ON pwa_background_sync(user_id, status);

-- Row Level Security (RLS) Policies
ALTER TABLE integration_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE pwa_sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE pwa_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE pwa_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE pwa_user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pwa_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pwa_sync_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE pwa_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE pwa_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE pwa_offline_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_module_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE pwa_file_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pwa_background_sync ENABLE ROW LEVEL SECURITY;

-- RLS Policies (assuming you have a users table with id column)
CREATE POLICY "Users can view their own integration events" ON integration_events
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own integration events" ON integration_events
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own integration events" ON integration_events
  FOR UPDATE USING (user_id = auth.uid());

-- Similar policies for other tables...
CREATE POLICY "Users can manage their own sync queue" ON pwa_sync_queue
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own cache" ON pwa_cache
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own notifications" ON pwa_notifications
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own settings" ON pwa_user_settings
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own installations" ON pwa_installations
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own sync status" ON pwa_sync_status
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own search history" ON pwa_search_history
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own analytics" ON pwa_analytics
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own offline actions" ON pwa_offline_actions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own file attachments" ON pwa_file_attachments
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own background sync" ON pwa_background_sync
  FOR ALL USING (user_id = auth.uid());

-- Functions for PWA operations
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM pwa_cache 
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION process_sync_queue()
RETURNS INTEGER AS $$
DECLARE
  processed_count INTEGER := 0;
  queue_item RECORD;
BEGIN
  FOR queue_item IN 
    SELECT * FROM pwa_sync_queue 
    WHERE status = 'pending' 
    ORDER BY priority DESC, created_at ASC 
    LIMIT 100
  LOOP
    -- Process the queue item (implementation depends on action_type)
    UPDATE pwa_sync_queue 
    SET status = 'processing', updated_at = NOW()
    WHERE id = queue_item.id;
    
    -- Simulate processing
    UPDATE pwa_sync_queue 
    SET status = 'completed', processed_at = NOW(), updated_at = NOW()
    WHERE id = queue_item.id;
    
    processed_count := processed_count + 1;
  END LOOP;
  
  RETURN processed_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_sync_status(p_user_id UUID)
RETURNS TABLE (
  module VARCHAR,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status VARCHAR,
  pending_items INTEGER,
  synced_items INTEGER,
  failed_items INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.module,
    s.last_sync_at,
    s.sync_status,
    s.pending_items,
    s.synced_items,
    s.failed_items
  FROM pwa_sync_status s
  WHERE s.user_id = p_user_id
  ORDER BY s.module;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at column
CREATE TRIGGER update_integration_events_updated_at
  BEFORE UPDATE ON integration_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pwa_sync_queue_updated_at
  BEFORE UPDATE ON pwa_sync_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pwa_cache_updated_at
  BEFORE UPDATE ON pwa_cache
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pwa_user_settings_updated_at
  BEFORE UPDATE ON pwa_user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pwa_installations_updated_at
  BEFORE UPDATE ON pwa_installations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pwa_sync_status_updated_at
  BEFORE UPDATE ON pwa_sync_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cross_module_relationships_updated_at
  BEFORE UPDATE ON cross_module_relationships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pwa_file_attachments_updated_at
  BEFORE UPDATE ON pwa_file_attachments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pwa_background_sync_updated_at
  BEFORE UPDATE ON pwa_background_sync
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for common queries
CREATE VIEW user_pwa_dashboard AS
SELECT 
  u.id as user_id,
  s.notifications_enabled,
  s.offline_mode,
  s.auto_sync,
  s.sync_interval,
  s.cache_size_limit,
  s.push_notifications,
  s.email_notifications,
  s.desktop_notifications,
  s.sound_notifications,
  s.theme,
  s.language,
  s.timezone,
  COALESCE(SUM(c.size_bytes), 0) as current_cache_size,
  COUNT(DISTINCT n.id) as unread_notifications,
  COUNT(DISTINCT sq.id) as pending_sync_items
FROM pwa_user_settings s
LEFT JOIN pwa_cache c ON s.user_id = c.user_id
LEFT JOIN pwa_notifications n ON s.user_id = n.user_id AND n.read_at IS NULL
LEFT JOIN pwa_sync_queue sq ON s.user_id = sq.user_id AND sq.status = 'pending'
GROUP BY u.id, s.user_id, s.notifications_enabled, s.offline_mode, s.auto_sync, 
         s.sync_interval, s.cache_size_limit, s.push_notifications, s.email_notifications,
         s.desktop_notifications, s.sound_notifications, s.theme, s.language, s.timezone;

-- Sample data for testing
INSERT INTO pwa_user_settings (user_id, notifications_enabled, offline_mode, auto_sync, sync_interval, push_notifications, email_notifications, desktop_notifications, sound_notifications, theme, language, timezone)
VALUES 
  ('00000000-0000-0000-0000-000000000001', true, true, true, 300, true, true, true, true, 'system', 'en', 'UTC'),
  ('00000000-0000-0000-0000-000000000002', true, true, true, 600, true, true, false, true, 'dark', 'en', 'America/New_York'),
  ('00000000-0000-0000-0000-000000000003', false, false, true, 900, false, false, false, false, 'light', 'es', 'Europe/Madrid');

-- Comments for documentation
COMMENT ON TABLE integration_events IS 'Tracks all cross-module events and data changes for PWA integration';
COMMENT ON TABLE pwa_sync_queue IS 'Queues actions for offline processing and synchronization';
COMMENT ON TABLE pwa_cache IS 'Manages cached data for offline access across modules';
COMMENT ON TABLE pwa_notifications IS 'Handles push notifications and alerts for PWA users';
COMMENT ON TABLE pwa_user_settings IS 'Stores PWA-specific user preferences and configuration';
COMMENT ON TABLE pwa_installations IS 'Tracks PWA installations and usage analytics';
COMMENT ON TABLE pwa_sync_status IS 'Tracks synchronization status across all modules';
COMMENT ON TABLE pwa_search_history IS 'Stores search queries and results for analytics and suggestions';
COMMENT ON TABLE pwa_analytics IS 'Tracks PWA usage and performance metrics';
COMMENT ON TABLE pwa_offline_actions IS 'Tracks actions performed while offline for later sync';
COMMENT ON TABLE cross_module_relationships IS 'Maps relationships between entities across different modules';
COMMENT ON TABLE pwa_file_attachments IS 'Tracks file attachments and their offline availability';
COMMENT ON TABLE pwa_background_sync IS 'Manages background synchronization tasks and status';



