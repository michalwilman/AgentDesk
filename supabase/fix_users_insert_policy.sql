-- Fix: Add INSERT policy for users table
-- This allows users to create their own profile when signing up with OAuth

CREATE POLICY "Users can create own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

