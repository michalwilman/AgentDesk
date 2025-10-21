-- Comprehensive fix for RLS policies to enable chat functionality
-- Run this in Supabase SQL Editor to fix the "row violates row-level security" error

-- ============================================================================
-- FIX CHATS TABLE POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own bot chats" ON chats;
DROP POLICY IF EXISTS "Allow bot API to create chats" ON chats;
DROP POLICY IF EXISTS "Allow creating chats for owned bots" ON chats;
DROP POLICY IF EXISTS "Allow viewing all chats" ON chats;
DROP POLICY IF EXISTS "Allow updating chats" ON chats;

-- Allow creating chats (needed for bot API)
CREATE POLICY "Allow creating chats" ON chats
  FOR INSERT
  WITH CHECK (true);

-- Allow viewing all chats (needed for bot API and user dashboard)
CREATE POLICY "Allow viewing all chats" ON chats
  FOR SELECT
  USING (true);

-- Allow updating chats (for session management)
CREATE POLICY "Allow updating chats" ON chats
  FOR UPDATE
  USING (true);

-- ============================================================================
-- FIX MESSAGES TABLE POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own bot messages" ON messages;
DROP POLICY IF EXISTS "Allow creating messages" ON messages;
DROP POLICY IF EXISTS "Allow viewing all messages" ON messages;

-- Allow creating messages (needed for chat functionality)
CREATE POLICY "Allow creating messages" ON messages
  FOR INSERT
  WITH CHECK (true);

-- Allow viewing all messages (needed for chat history)
CREATE POLICY "Allow viewing all messages" ON messages
  FOR SELECT
  USING (true);

-- ============================================================================
-- FIX FILE NAMES IN EXISTING DOCUMENTS
-- ============================================================================

-- Update documents where file_name is null
UPDATE scraped_content
SET file_name = metadata->>'original_name'
WHERE source_url = 'document' 
  AND file_name IS NULL 
  AND metadata->>'original_name' IS NOT NULL;

-- Fallback to title if no metadata
UPDATE scraped_content
SET file_name = title
WHERE source_url = 'document' 
  AND file_name IS NULL 
  AND title IS NOT NULL;

-- Set default name for remaining documents
UPDATE scraped_content
SET file_name = CONCAT('document_', SUBSTRING(id::text, 1, 8))
WHERE source_url = 'document' 
  AND file_name IS NULL;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check that policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('chats', 'messages')
ORDER BY tablename, policyname;

