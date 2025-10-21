# Supabase Storage Setup for Document Uploads

This guide explains how to set up the Supabase Storage bucket for the document ingestion feature.

## Prerequisites

- Supabase project already created
- Access to Supabase Dashboard
- Database schema already applied

## Steps

### 1. Create Storage Bucket

1. Log in to your [Supabase Dashboard](https://app.supabase.com)
2. Select your AgentDesk project
3. Navigate to **Storage** in the left sidebar
4. Click **New bucket**
5. Configure the bucket:
   - **Name**: `documents`
   - **Public bucket**: ❌ Unchecked (keep it private)
   - **File size limit**: `104857600` (100MB in bytes)
   - **Allowed MIME types**: Leave empty (we'll handle validation in backend)
6. Click **Create bucket**

### 2. Configure Bucket Policies

After creating the bucket, set up Row Level Security (RLS) policies:

#### Policy 1: Allow authenticated users to upload

```sql
CREATE POLICY "Users can upload documents to their bots"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM bots WHERE user_id = auth.uid()
  )
);
```

#### Policy 2: Allow users to view their documents

```sql
CREATE POLICY "Users can view their bot documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM bots WHERE user_id = auth.uid()
  )
);
```

#### Policy 3: Allow users to delete their documents

```sql
CREATE POLICY "Users can delete their bot documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM bots WHERE user_id = auth.uid()
  )
);
```

### 3. Apply Database Migration

Run the document fields migration:

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **New Query**
3. Copy the contents of `migration_add_document_fields.sql`
4. Paste and execute the query

This will add the necessary columns to the `scraped_content` table:
- `file_name`
- `file_size`
- `file_type`
- `storage_path`
- `processing_status`

### 4. Verify Setup

Test that the storage bucket is configured correctly:

1. In **Storage**, click on the `documents` bucket
2. Check that policies are active (should see policy badges)
3. The bucket should be private (padlock icon)

### 5. Environment Variables

Ensure these environment variables are set in your `.env` files:

**Backend** (`backend/.env`):
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Supabase Storage Configuration
# Maximum file size for document uploads in bytes
# Free tier: 52428800 (50MB) | Pro tier: 104857600 (100MB)
SUPABASE_MAX_FILE_SIZE=52428800
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> **Note:** The `SUPABASE_MAX_FILE_SIZE` should match your Supabase project's storage plan limit.

## Storage Structure

Documents will be stored with the following path structure:

```
documents/
  ├── {bot_id}/
  │   ├── {timestamp}_{filename}.pdf
  │   ├── {timestamp}_{filename}.txt
  │   └── {timestamp}_{filename}.docx
```

Each bot gets its own folder, and files are prefixed with timestamps to avoid naming conflicts.

## File Size Limits by Tier

The application enforces different file size limits based on user subscription:

| Tier       | Tier Limit | Actual Limit (with free Supabase) |
|------------|------------|-----------------------------------|
| Free       | 5 MB       | 5 MB ✅                           |
| Pro        | 20 MB      | 20 MB ✅                          |
| Business   | 100 MB     | 50 MB ⚠️ (Supabase limit)         |

### How It Works

The system takes the **minimum** between:
1. **User's subscription tier limit** (5MB/20MB/100MB)
2. **Supabase project limit** (configured via `SUPABASE_MAX_FILE_SIZE`)

**Example:** A Business tier user with Supabase free plan can upload up to 50MB (not 100MB) because the Supabase project limit is the bottleneck.

**When you upgrade Supabase to Pro/Team:**
1. Update `SUPABASE_MAX_FILE_SIZE` to `104857600` (100MB) in `backend/.env`
2. Restart the backend server
3. Business tier users can now upload up to 100MB ✅

These limits are enforced in both frontend (client-side validation) and backend (server-side validation) for security.

## Supported File Types

- **PDF**: `application/pdf`
- **Text**: `text/plain`
- **Word (old)**: `application/msword`
- **Word (new)**: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

## Troubleshooting

### Upload fails with "permission denied"

- Check that RLS policies are correctly applied
- Verify user is authenticated
- Ensure bot belongs to the user

### Files not appearing in storage

- Check backend logs for upload errors
- Verify Supabase service role key is correct
- Check network connectivity to Supabase

### Processing status stuck at "pending"

- Check backend logs for processing errors
- Verify PDF/DOCX parsing libraries are installed
- Check file is not corrupted

## Security Notes

- ⚠️ Never expose the service role key to the frontend
- ✅ All uploads go through backend API with authentication
- ✅ RLS policies ensure users can only access their own documents
- ✅ File names are sanitized to prevent path traversal attacks
- ✅ MIME types are validated before upload

## Next Steps

After setting up storage:

1. Install backend dependencies: `cd backend && npm install`
2. Install frontend dependencies: `cd frontend && npm install`
3. Start backend: `npm run dev` (from backend folder)
4. Start frontend: `npm run dev` (from frontend folder)
5. Test document upload through the UI

## Need Help?

If you encounter issues:

1. Check Supabase logs in Dashboard → Logs
2. Check backend console for error messages
3. Verify all migrations are applied
4. Ensure storage bucket policies are active

