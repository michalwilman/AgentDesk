-- AgentDesk Database Migrations

This directory contains SQL migration files for the AgentDesk database schema.

## Migration Files

### Core Schema
- `schema.sql` - Initial database schema (from supabase/schema.sql)

### WordPress Integration
- `add_wordpress_integration.sql` - Adds WordPress plugin integration tracking
  - Adds columns: wordpress_connected, wordpress_site_url, wordpress_plugin_version, wordpress_last_activity
  - Creates indexes for WordPress fields

### Actions System
- `add_actions_system.sql` - Adds bot actions and automation capabilities
  - Tables: leads, appointments, bot_actions_config, action_logs
  - Features: Lead collection, appointment scheduling, email, PDF, WhatsApp, webhooks
  - Includes RLS policies, indexes, and views

## How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended for Supabase projects)
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of the migration file
4. Paste and execute

### Option 2: psql Command Line
```bash
# Connect to your database
psql postgresql://user:password@host:port/database

# Run migration
\i backend/migrations/add_actions_system.sql
```

### Option 3: Supabase CLI
```bash
# Link to your project
supabase link --project-ref your-project-ref

# Apply migration
supabase db push
```

## Migration Order

Migrations should be applied in this order:
1. Core schema (schema.sql)
2. WordPress integration (add_wordpress_integration.sql)
3. Actions system (add_actions_system.sql)

## Rolling Back

To roll back the actions system migration:
```sql
DROP VIEW IF EXISTS action_logs_summary;
DROP VIEW IF EXISTS appointments_summary;
DROP VIEW IF EXISTS leads_summary;
DROP TABLE IF EXISTS action_logs CASCADE;
DROP TABLE IF EXISTS bot_actions_config CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
```

## Notes

- All migrations include Row Level Security (RLS) policies
- Sensitive data (API keys, credentials) should be encrypted
- Migrations create indexes for performance
- Views are created for analytics and reporting
