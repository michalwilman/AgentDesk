-- Fix RLS Policy for chats table to allow creating chat sessions
-- The issue: Users can't create new chat sessions because of missing INSERT policy

-- First, let's check existing policies and drop if needed
DROP POLICY IF EXISTS "Allow bot API to create chats" ON chats;
DROP POLICY IF EXISTS "Allow creating chats for owned bots" ON chats;

-- Create a policy that allows creating chats for any bot
-- (authentication is handled at the application level via bot token)
CREATE POLICY "Allow creating chats for any bot" ON chats
  FOR INSERT
  WITH CHECK (true);

-- Also ensure users can view chats for their bots
DROP POLICY IF EXISTS "Users can view own bot chats" ON chats;

CREATE POLICY "Users can view own bot chats" ON chats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bots 
      WHERE bots.id = chats.bot_id 
      AND bots.user_id = auth.uid()
    )
  );

-- Allow viewing all chats (for bot API access)
CREATE POLICY "Allow viewing all chats" ON chats
  FOR SELECT USING (true);

-- Allow updating chats (for ending sessions, ratings, etc.)
CREATE POLICY "Allow updating chats" ON chats
  FOR UPDATE USING (true);

