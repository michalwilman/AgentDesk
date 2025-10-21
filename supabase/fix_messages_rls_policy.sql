-- Fix RLS Policy for messages table to allow creating messages
-- Messages should be created freely by the chat API

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own bot messages" ON messages;
DROP POLICY IF EXISTS "Allow creating messages" ON messages;

-- Allow creating messages (chat API needs this)
CREATE POLICY "Allow creating messages" ON messages
  FOR INSERT
  WITH CHECK (true);

-- Allow viewing messages for owned bots
CREATE POLICY "Users can view own bot messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chats 
      JOIN bots ON bots.id = chats.bot_id 
      WHERE chats.id = messages.chat_id 
      AND bots.user_id = auth.uid()
    )
  );

-- Allow viewing all messages (for chat API)
CREATE POLICY "Allow viewing all messages" ON messages
  FOR SELECT USING (true);

