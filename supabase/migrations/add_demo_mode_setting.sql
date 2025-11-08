-- ============================================================================
-- Add Demo Mode System Setting
-- Purpose: Allow admin to toggle demo mode for simulated payments
-- ============================================================================

-- Insert demo_mode setting into system_settings
INSERT INTO system_settings (key, value, description, updated_at)
VALUES (
  'demo_mode',
  'true'::jsonb,
  'When enabled, payments are simulated without real transaction processing. Only admins can toggle this.',
  NOW()
)
ON CONFLICT (key) DO UPDATE 
SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Add comment
COMMENT ON TABLE system_settings IS 'Global system configuration settings. demo_mode controls payment simulation.';

-- Grant permissions (only service_role and admins should update this)
GRANT SELECT ON system_settings TO authenticated;
GRANT ALL ON system_settings TO service_role;


