-- ============================================================================
-- AgentDesk Actions System Migration
-- ============================================================================
-- This migration adds support for bot actions including:
-- - Lead collection
-- - Appointment scheduling
-- - Email sending
-- - PDF generation
-- - WhatsApp messaging
-- - Webhook integrations
-- ============================================================================

-- Leads Table
-- Stores customer leads collected by bots
CREATE TABLE leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE NOT NULL,
  chat_id UUID REFERENCES chats(id) ON DELETE SET NULL,
  full_name VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  question TEXT,
  metadata JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'new', -- new, contacted, qualified, converted, lost
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments Table
-- Stores scheduled appointments from bot interactions
CREATE TABLE appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  chat_id UUID REFERENCES chats(id) ON DELETE SET NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, cancelled, completed
  calendar_event_id TEXT, -- External calendar event ID (Google Calendar, etc.)
  attendee_name VARCHAR(255),
  attendee_email VARCHAR(255),
  attendee_phone VARCHAR(50),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bot Actions Configuration Table
-- Per-bot configuration for available actions and integrations
CREATE TABLE bot_actions_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Lead Collection Configuration
  lead_collection_enabled BOOLEAN DEFAULT false,
  lead_form_fields JSONB DEFAULT '["full_name", "phone", "email", "question"]'::jsonb,
  lead_notification_email VARCHAR(255), -- Email to notify when lead is captured
  
  -- Appointments Configuration
  appointments_enabled BOOLEAN DEFAULT false,
  calendar_provider VARCHAR(50), -- google, outlook, calendly
  calendar_credentials JSONB, -- Encrypted credentials
  calendar_id TEXT, -- Calendar ID to use
  appointment_duration_default INTEGER DEFAULT 30, -- Default meeting duration in minutes
  appointment_buffer_minutes INTEGER DEFAULT 15, -- Buffer between meetings
  available_hours JSONB DEFAULT '{"monday": ["09:00-17:00"], "tuesday": ["09:00-17:00"], "wednesday": ["09:00-17:00"], "thursday": ["09:00-17:00"], "friday": ["09:00-17:00"]}'::jsonb,
  
  -- Email Configuration
  email_enabled BOOLEAN DEFAULT false,
  email_provider VARCHAR(50), -- resend, sendgrid, smtp
  email_api_key TEXT, -- Encrypted API key
  email_from_address VARCHAR(255),
  email_from_name VARCHAR(255),
  email_templates JSONB DEFAULT '{}'::jsonb, -- Template storage
  
  -- PDF Generation Configuration
  pdf_enabled BOOLEAN DEFAULT false,
  pdf_templates JSONB DEFAULT '{}'::jsonb, -- HTML templates for PDF generation
  pdf_storage_bucket TEXT DEFAULT 'bot-documents', -- Supabase storage bucket
  
  -- WhatsApp Configuration
  whatsapp_enabled BOOLEAN DEFAULT false,
  whatsapp_template_messages JSONB DEFAULT '[]'::jsonb, -- Pre-approved template messages
  
  -- Webhooks Configuration
  webhooks_enabled BOOLEAN DEFAULT false,
  webhook_urls JSONB DEFAULT '[]'::jsonb, -- Array of webhook endpoint configurations
  webhook_secret TEXT, -- Secret for webhook signature verification
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Action Logs Table
-- Audit trail for all bot actions
CREATE TABLE action_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE NOT NULL,
  chat_id UUID REFERENCES chats(id) ON DELETE SET NULL,
  action_type VARCHAR(50) NOT NULL, -- save_lead, send_email, schedule_appointment, create_pdf, send_whatsapp, trigger_webhook
  action_data JSONB DEFAULT '{}', -- Input parameters for the action
  result_data JSONB DEFAULT '{}', -- Output/result of the action
  status VARCHAR(50) DEFAULT 'success', -- success, failed, pending
  error_message TEXT,
  execution_time_ms INTEGER, -- How long the action took to execute
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Leads indexes
CREATE INDEX idx_leads_bot_id ON leads(bot_id);
CREATE INDEX idx_leads_chat_id ON leads(chat_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_email ON leads(email) WHERE email IS NOT NULL;

-- Appointments indexes
CREATE INDEX idx_appointments_bot_id ON appointments(bot_id);
CREATE INDEX idx_appointments_lead_id ON appointments(lead_id);
CREATE INDEX idx_appointments_scheduled_time ON appointments(scheduled_time);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_created_at ON appointments(created_at DESC);

-- Bot actions config indexes
CREATE INDEX idx_bot_actions_config_bot_id ON bot_actions_config(bot_id);

-- Action logs indexes
CREATE INDEX idx_action_logs_bot_id ON action_logs(bot_id);
CREATE INDEX idx_action_logs_chat_id ON action_logs(chat_id);
CREATE INDEX idx_action_logs_action_type ON action_logs(action_type);
CREATE INDEX idx_action_logs_status ON action_logs(status);
CREATE INDEX idx_action_logs_created_at ON action_logs(created_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamps for leads
CREATE TRIGGER update_leads_updated_at 
  BEFORE UPDATE ON leads
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Update timestamps for appointments
CREATE TRIGGER update_appointments_updated_at 
  BEFORE UPDATE ON appointments
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Update timestamps for bot_actions_config
CREATE TRIGGER update_bot_actions_config_updated_at 
  BEFORE UPDATE ON bot_actions_config
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_actions_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_logs ENABLE ROW LEVEL SECURITY;

-- Leads policies (users can view leads from their bots)
CREATE POLICY "Users can view own bot leads" ON leads
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM bots WHERE bots.id = leads.bot_id AND bots.user_id = auth.uid())
  );

CREATE POLICY "Users can create leads for own bots" ON leads
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM bots WHERE bots.id = leads.bot_id AND bots.user_id = auth.uid())
  );

CREATE POLICY "Users can update own bot leads" ON leads
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM bots WHERE bots.id = leads.bot_id AND bots.user_id = auth.uid())
  );

CREATE POLICY "Users can delete own bot leads" ON leads
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM bots WHERE bots.id = leads.bot_id AND bots.user_id = auth.uid())
  );

-- Appointments policies (users can view appointments from their bots)
CREATE POLICY "Users can view own bot appointments" ON appointments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM bots WHERE bots.id = appointments.bot_id AND bots.user_id = auth.uid())
  );

CREATE POLICY "Users can create appointments for own bots" ON appointments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM bots WHERE bots.id = appointments.bot_id AND bots.user_id = auth.uid())
  );

CREATE POLICY "Users can update own bot appointments" ON appointments
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM bots WHERE bots.id = appointments.bot_id AND bots.user_id = auth.uid())
  );

CREATE POLICY "Users can delete own bot appointments" ON appointments
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM bots WHERE bots.id = appointments.bot_id AND bots.user_id = auth.uid())
  );

-- Bot actions config policies
CREATE POLICY "Users can view own bot actions config" ON bot_actions_config
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM bots WHERE bots.id = bot_actions_config.bot_id AND bots.user_id = auth.uid())
  );

CREATE POLICY "Users can manage own bot actions config" ON bot_actions_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM bots WHERE bots.id = bot_actions_config.bot_id AND bots.user_id = auth.uid())
  );

-- Action logs policies (users can view logs from their bots)
CREATE POLICY "Users can view own bot action logs" ON action_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM bots WHERE bots.id = action_logs.bot_id AND bots.user_id = auth.uid())
  );

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Leads summary view
CREATE OR REPLACE VIEW leads_summary AS
SELECT 
  l.bot_id,
  COUNT(*) AS total_leads,
  COUNT(*) FILTER (WHERE l.status = 'new') AS new_leads,
  COUNT(*) FILTER (WHERE l.status = 'contacted') AS contacted_leads,
  COUNT(*) FILTER (WHERE l.status = 'qualified') AS qualified_leads,
  COUNT(*) FILTER (WHERE l.status = 'converted') AS converted_leads,
  COUNT(*) FILTER (WHERE l.created_at >= NOW() - INTERVAL '7 days') AS leads_last_7_days,
  COUNT(*) FILTER (WHERE l.created_at >= NOW() - INTERVAL '30 days') AS leads_last_30_days
FROM leads l
GROUP BY l.bot_id;

-- Appointments summary view
CREATE OR REPLACE VIEW appointments_summary AS
SELECT 
  a.bot_id,
  COUNT(*) AS total_appointments,
  COUNT(*) FILTER (WHERE a.status = 'pending') AS pending_appointments,
  COUNT(*) FILTER (WHERE a.status = 'confirmed') AS confirmed_appointments,
  COUNT(*) FILTER (WHERE a.status = 'completed') AS completed_appointments,
  COUNT(*) FILTER (WHERE a.status = 'cancelled') AS cancelled_appointments,
  COUNT(*) FILTER (WHERE a.scheduled_time >= NOW()) AS upcoming_appointments
FROM appointments a
GROUP BY a.bot_id;

-- Action logs summary view
CREATE OR REPLACE VIEW action_logs_summary AS
SELECT 
  al.bot_id,
  al.action_type,
  COUNT(*) AS total_executions,
  COUNT(*) FILTER (WHERE al.status = 'success') AS successful_executions,
  COUNT(*) FILTER (WHERE al.status = 'failed') AS failed_executions,
  AVG(al.execution_time_ms) AS avg_execution_time_ms,
  MAX(al.created_at) AS last_execution
FROM action_logs al
GROUP BY al.bot_id, al.action_type;

-- Grant permissions on views
GRANT SELECT ON leads_summary TO authenticated;
GRANT SELECT ON appointments_summary TO authenticated;
GRANT SELECT ON action_logs_summary TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE leads IS 'Customer leads collected through bot conversations';
COMMENT ON TABLE appointments IS 'Scheduled appointments created by bots';
COMMENT ON TABLE bot_actions_config IS 'Per-bot configuration for available actions and integrations';
COMMENT ON TABLE action_logs IS 'Audit trail for all bot actions and their execution results';

COMMENT ON COLUMN leads.status IS 'Lead status: new, contacted, qualified, converted, lost';
COMMENT ON COLUMN appointments.status IS 'Appointment status: pending, confirmed, cancelled, completed';
COMMENT ON COLUMN action_logs.action_type IS 'Type of action: save_lead, send_email, schedule_appointment, create_pdf, send_whatsapp, trigger_webhook';

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Create default action config for existing bots
INSERT INTO bot_actions_config (bot_id, lead_collection_enabled)
SELECT id, true FROM bots
ON CONFLICT (bot_id) DO NOTHING;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

