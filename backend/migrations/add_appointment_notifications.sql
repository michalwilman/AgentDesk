-- Add Appointment Notifications System
-- This allows tracking which appointments have been seen/dismissed by users

-- Create appointment_notifications table
CREATE TABLE IF NOT EXISTS appointment_notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  dismissed BOOLEAN DEFAULT false,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(appointment_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointment_notifications_user ON appointment_notifications(user_id, dismissed);
CREATE INDEX IF NOT EXISTS idx_appointment_notifications_appointment ON appointment_notifications(appointment_id);

-- Add comments for documentation
COMMENT ON TABLE appointment_notifications IS 'Tracks notification state for appointments per user';
COMMENT ON COLUMN appointment_notifications.appointment_id IS 'Reference to the appointment';
COMMENT ON COLUMN appointment_notifications.user_id IS 'User who owns the bot/appointment';
COMMENT ON COLUMN appointment_notifications.dismissed IS 'Whether user dismissed this notification';
COMMENT ON COLUMN appointment_notifications.dismissed_at IS 'When the notification was dismissed';

-- Create function to automatically create notification when appointment is confirmed
CREATE OR REPLACE FUNCTION create_appointment_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification for confirmed appointments
  IF NEW.status = 'confirmed' THEN
    INSERT INTO appointment_notifications (appointment_id, user_id, dismissed)
    SELECT NEW.id, bots.user_id, false
    FROM bots
    WHERE bots.id = NEW.bot_id
    ON CONFLICT (appointment_id, user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run the function
DROP TRIGGER IF EXISTS trigger_create_appointment_notification ON appointments;
CREATE TRIGGER trigger_create_appointment_notification
AFTER INSERT OR UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION create_appointment_notification();

