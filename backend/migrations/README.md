# Database Migrations

This directory contains SQL migration files for the AgentDesk database.

## How to Run Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of the migration file (e.g., `add_wordpress_integration.sql`)
5. Paste into the SQL editor
6. Click **Run** or press `Ctrl+Enter`
7. Verify the changes in the **Table Editor**

### Option 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
# Make sure you're in the backend directory
cd backend

# Run the migration
supabase db push --file migrations/add_wordpress_integration.sql
```

### Option 3: Direct SQL Client

If you have direct database access:

```bash
# Using psql
psql -h your-db-host -U postgres -d postgres -f migrations/add_wordpress_integration.sql
```

---

## Available Migrations

### `add_wordpress_integration.sql`

**Purpose:** Adds WordPress integration tracking fields to the `bots` table.

**Changes:**
- Adds `wordpress_connected` (BOOLEAN)
- Adds `wordpress_site_url` (TEXT)
- Adds `wordpress_plugin_version` (TEXT)
- Adds `wordpress_last_activity` (TIMESTAMP WITH TIME ZONE)
- Creates indexes for performance
- Adds column comments for documentation

**Required for:** WordPress plugin v1.1.0+

**Rollback:**
```sql
-- If you need to rollback this migration
ALTER TABLE bots 
DROP COLUMN IF EXISTS wordpress_connected,
DROP COLUMN IF EXISTS wordpress_site_url,
DROP COLUMN IF EXISTS wordpress_plugin_version,
DROP COLUMN IF EXISTS wordpress_last_activity;

DROP INDEX IF EXISTS idx_bots_wordpress_connected;
DROP INDEX IF EXISTS idx_bots_wordpress_last_activity;
```

---

## Migration Checklist

Before running a migration:

- [ ] Backup your database
- [ ] Review the SQL file
- [ ] Test in a development environment first
- [ ] Verify no conflicts with existing schema
- [ ] Check that all dependent services are updated

After running a migration:

- [ ] Verify changes in the database
- [ ] Test the affected features
- [ ] Update backend code if needed
- [ ] Deploy backend changes
- [ ] Monitor for errors

---

## Best Practices

1. **Always backup** before running migrations
2. **Test first** in development/staging
3. **Use transactions** when possible
4. **Document changes** in this README
5. **Version control** all migration files
6. **Never modify** existing migration files after they've been run in production

---

## Troubleshooting

### Error: "column already exists"

This means the migration was already run. You can either:
- Skip this migration
- Modify the SQL to use `IF NOT EXISTS` clauses

### Error: "permission denied"

Make sure you're using a database user with sufficient privileges (usually `postgres` or your service role).

### Error: "relation does not exist"

The target table might not exist. Check:
- You're connected to the correct database
- The table name is spelled correctly
- Previous migrations have been run

---

## Need Help?

If you encounter issues:

1. Check the Supabase logs
2. Review the SQL syntax
3. Consult the Supabase documentation
4. Contact the development team

---

## Migration History

| Date | File | Description | Status |
|------|------|-------------|--------|
| 2025-11-01 | `add_wordpress_integration.sql` | WordPress integration tracking | ✅ Ready |

