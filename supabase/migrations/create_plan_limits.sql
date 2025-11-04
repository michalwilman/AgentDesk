-- Create plan_limits table to define limits for each subscription tier
-- This table defines what each plan can do

CREATE TABLE IF NOT EXISTS plan_limits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  plan_name VARCHAR(50) UNIQUE NOT NULL,
  
  -- Bot limits
  max_bots INTEGER NOT NULL,
  
  -- Conversation limits (per month)
  max_conversations INTEGER NOT NULL,
  
  -- WhatsApp limits (per month, -1 means unlimited)
  max_whatsapp_messages INTEGER NOT NULL,
  
  -- Feature flags
  email_notifications BOOLEAN DEFAULT TRUE,
  google_calendar_sync BOOLEAN DEFAULT TRUE,
  whatsapp_notifications BOOLEAN DEFAULT TRUE,
  appointment_reminders BOOLEAN DEFAULT TRUE,
  lead_collection BOOLEAN DEFAULT TRUE,
  basic_analytics BOOLEAN DEFAULT TRUE,
  advanced_analytics BOOLEAN DEFAULT FALSE,
  remove_branding BOOLEAN DEFAULT FALSE,
  priority_support BOOLEAN DEFAULT FALSE,
  webhook_integrations BOOLEAN DEFAULT FALSE,
  custom_branding BOOLEAN DEFAULT FALSE,
  bring_own_twilio BOOLEAN DEFAULT FALSE,
  multiple_team_members BOOLEAN DEFAULT FALSE,
  api_access BOOLEAN DEFAULT FALSE,
  sla_guarantee BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert plan limits matching the pricing page
INSERT INTO plan_limits (
  plan_name,
  max_bots,
  max_conversations,
  max_whatsapp_messages,
  email_notifications,
  google_calendar_sync,
  whatsapp_notifications,
  appointment_reminders,
  lead_collection,
  basic_analytics,
  advanced_analytics,
  remove_branding,
  priority_support,
  webhook_integrations,
  custom_branding,
  bring_own_twilio,
  multiple_team_members,
  api_access,
  sla_guarantee
) VALUES 
  -- Starter Plan ($24.17/mo)
  (
    'starter',
    1,      -- 1 AI Bot
    100,    -- 100 AI conversations/month
    500,    -- WhatsApp notifications (up to 500/mo)
    true,   -- Email notifications (included)
    true,   -- Google Calendar sync
    true,   -- WhatsApp notifications
    true,   -- 24h appointment reminders
    true,   -- Lead collection & management
    true,   -- Basic analytics
    false,  -- No advanced analytics
    false,  -- Keep branding
    false,  -- No priority support
    false,  -- No webhook integrations
    false,  -- No custom branding
    false,  -- No bring own Twilio
    false,  -- No multiple team members
    false,  -- No API access
    false   -- No SLA guarantee
  ),
  
  -- Growth Plan ($49.17/mo)
  (
    'growth',
    3,      -- 3 AI Bots
    250,    -- 250 AI conversations/month
    -1,     -- Unlimited WhatsApp notifications
    true,   -- Email notifications
    true,   -- Google Calendar sync
    true,   -- WhatsApp notifications
    true,   -- 24h appointment reminders
    true,   -- Lead collection
    true,   -- Basic analytics
    true,   -- Advanced analytics
    true,   -- Remove AgentDesk branding
    true,   -- Priority support
    true,   -- Webhook integrations
    false,  -- No custom branding (just remove branding)
    false,  -- No bring own Twilio
    false,  -- No multiple team members
    false,  -- No API access
    false   -- No SLA guarantee
  ),
  
  -- Plus Plan ($749/mo)
  (
    'plus',
    -1,     -- Unlimited AI Bots
    -1,     -- Custom AI conversation quota (unlimited)
    -1,     -- Unlimited WhatsApp notifications
    true,   -- Email notifications
    true,   -- Google Calendar sync
    true,   -- WhatsApp notifications
    true,   -- 24h appointment reminders
    true,   -- Lead collection
    true,   -- Basic analytics
    true,   -- Advanced analytics
    true,   -- Remove branding
    true,   -- Priority support
    true,   -- Webhook integrations
    true,   -- Custom branding & white label
    true,   -- Bring your own Twilio (optional)
    true,   -- Multiple team members
    true,   -- API access (OpenAPI)
    true    -- SLA guarantee
  ),
  
  -- Premium Plan (Custom pricing)
  (
    'premium',
    -1,     -- Unlimited AI Bots
    -1,     -- Unlimited AI conversations
    -1,     -- Unlimited WhatsApp
    true,   -- All features enabled
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true
  );

-- Create index for faster lookups
CREATE INDEX idx_plan_limits_plan_name ON plan_limits(plan_name);

-- Add comments
COMMENT ON TABLE plan_limits IS 'Defines limits and features for each subscription plan';
COMMENT ON COLUMN plan_limits.max_bots IS 'Maximum number of bots allowed (-1 = unlimited)';
COMMENT ON COLUMN plan_limits.max_conversations IS 'Maximum AI conversations per month (-1 = unlimited)';
COMMENT ON COLUMN plan_limits.max_whatsapp_messages IS 'Maximum WhatsApp messages per month (-1 = unlimited)';

