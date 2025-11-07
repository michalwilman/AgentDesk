-- Add location field to appointments table
-- This allows storing the meeting location/address for appointments

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS location TEXT;

-- Add comment
COMMENT ON COLUMN appointments.location IS 'Meeting location or address (e.g., Office, Zoom link, physical address)';

