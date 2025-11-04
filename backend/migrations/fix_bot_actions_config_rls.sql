-- Fix RLS policies for bot_actions_config table
-- This fixes the issue where users can't save their bot actions config
-- The problem: ALL policy was missing WITH CHECK expression

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage own bot actions config" ON bot_actions_config;
DROP POLICY IF EXISTS "Users can view own bot actions config" ON bot_actions_config;

-- Create new SELECT policy (read access)
CREATE POLICY "Users can view own bot actions config"
ON bot_actions_config
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM bots
    WHERE bots.id = bot_actions_config.bot_id
    AND bots.user_id = auth.uid()
  )
);

-- Create new INSERT policy
CREATE POLICY "Users can insert own bot actions config"
ON bot_actions_config
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM bots
    WHERE bots.id = bot_actions_config.bot_id
    AND bots.user_id = auth.uid()
  )
);

-- Create new UPDATE policy
CREATE POLICY "Users can update own bot actions config"
ON bot_actions_config
FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1 FROM bots
    WHERE bots.id = bot_actions_config.bot_id
    AND bots.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM bots
    WHERE bots.id = bot_actions_config.bot_id
    AND bots.user_id = auth.uid()
  )
);

-- Create new DELETE policy
CREATE POLICY "Users can delete own bot actions config"
ON bot_actions_config
FOR DELETE
TO public
USING (
  EXISTS (
    SELECT 1 FROM bots
    WHERE bots.id = bot_actions_config.bot_id
    AND bots.user_id = auth.uid()
  )
);

-- Add comment for documentation
COMMENT ON TABLE bot_actions_config IS 'Bot actions configuration with proper RLS policies - users can only manage config for their own bots';

