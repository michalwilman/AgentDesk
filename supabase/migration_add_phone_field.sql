-- Migration: Add phone field to users table
-- Date: 2025-11-05
-- Purpose: Support phone number collection during registration

-- Add phone column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Create index for phone lookups (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_users_phone 
ON users(phone);

-- Comment the new column
COMMENT ON COLUMN users.phone IS 'User mobile phone number (Israeli format: 05XXXXXXXX)';

