-- Create contact_requests table for Premium plan inquiries
CREATE TABLE IF NOT EXISTS contact_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_requests_user_id ON contact_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON contact_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON contact_requests(created_at DESC);

-- Add RLS policies
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view their own contact requests"
  ON contact_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own requests
CREATE POLICY "Users can create contact requests"
  ON contact_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all contact requests"
  ON contact_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- Admins can update all requests
CREATE POLICY "Admins can update contact requests"
  ON contact_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

