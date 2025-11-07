-- Create plan_limits table for configurable plan constraints
-- Allows flexible adjustment of limits without code changes

CREATE TABLE IF NOT EXISTS plan_limits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  plan_type VARCHAR(20) UNIQUE NOT NULL,
  sms_monthly_limit INTEGER,
  whatsapp_monthly_limit INTEGER,
  email_monthly_limit INTEGER,
  price_monthly DECIMAL(10, 2),
  features JSONB DEFAULT '{}'::jsonb, -- Additional features per plan
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default limits
-- NULL = unlimited
INSERT INTO plan_limits (plan_type, sms_monthly_limit, whatsapp_monthly_limit, email_monthly_limit, price_monthly, features) VALUES
('starter', 0, 0, 100, 99.00, '{"calendar": true, "email": true, "sms": false, "whatsapp": false}'::jsonb),
('pro', 250, 100, 500, 249.00, '{"calendar": true, "email": true, "sms": true, "whatsapp": true, "managed_twilio": true}'::jsonb),
('enterprise', NULL, NULL, NULL, 499.00, '{"calendar": true, "email": true, "sms": true, "whatsapp": true, "byot": true, "priority_support": true}'::jsonb)
ON CONFLICT (plan_type) DO NOTHING;

-- Add comments
COMMENT ON TABLE plan_limits IS 'Configurable limits and pricing for each plan type';
COMMENT ON COLUMN plan_limits.sms_monthly_limit IS 'Monthly SMS limit (NULL = unlimited)';
COMMENT ON COLUMN plan_limits.whatsapp_monthly_limit IS 'Monthly WhatsApp limit (NULL = unlimited)';
COMMENT ON COLUMN plan_limits.email_monthly_limit IS 'Monthly Email limit (NULL = unlimited)';
COMMENT ON COLUMN plan_limits.features IS 'JSON object describing available features for this plan';

