-- Migration: Add WordPress Integration fields to bots table
-- Created: 2025-11-01
-- Description: Adds fields to track WordPress plugin connections

-- Add WordPress integration columns to bots table
ALTER TABLE bots 
ADD COLUMN IF NOT EXISTS wordpress_connected BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS wordpress_site_url TEXT,
ADD COLUMN IF NOT EXISTS wordpress_plugin_version TEXT,
ADD COLUMN IF NOT EXISTS wordpress_last_activity TIMESTAMP WITH TIME ZONE;

-- Add index for faster queries on wordpress_connected status
CREATE INDEX IF NOT EXISTS idx_bots_wordpress_connected 
ON bots(wordpress_connected) 
WHERE wordpress_connected = true;

-- Add index for wordpress_last_activity to track stale connections
CREATE INDEX IF NOT EXISTS idx_bots_wordpress_last_activity 
ON bots(wordpress_last_activity DESC);

-- Add comment to document the fields
COMMENT ON COLUMN bots.wordpress_connected IS 'Indicates if a WordPress plugin is actively connected to this bot';
COMMENT ON COLUMN bots.wordpress_site_url IS 'The URL of the WordPress site where the plugin is installed';
COMMENT ON COLUMN bots.wordpress_plugin_version IS 'The version of the WordPress plugin currently installed';
COMMENT ON COLUMN bots.wordpress_last_activity IS 'Last heartbeat timestamp from the WordPress plugin';

