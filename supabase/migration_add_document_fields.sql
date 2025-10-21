-- Migration: Add document upload fields to scraped_content table
-- Date: 2025-10-19
-- Purpose: Support document ingestion feature (PDF, TXT, DOC, DOCX)

-- Add document-specific columns to scraped_content table
ALTER TABLE scraped_content
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS file_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS processing_status VARCHAR(20) DEFAULT 'pending';

-- Add check constraint for processing_status
ALTER TABLE scraped_content
ADD CONSTRAINT check_processing_status 
CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed'));

-- Create index for faster queries on processing_status
CREATE INDEX IF NOT EXISTS idx_scraped_content_processing_status 
ON scraped_content(processing_status);

-- Create index for file_type queries
CREATE INDEX IF NOT EXISTS idx_scraped_content_file_type 
ON scraped_content(file_type);

-- Update existing records to have 'completed' status for backward compatibility
UPDATE scraped_content
SET processing_status = 'completed'
WHERE processing_status IS NULL OR processing_status = 'pending';

-- Comment the new columns
COMMENT ON COLUMN scraped_content.file_name IS 'Original filename of uploaded document';
COMMENT ON COLUMN scraped_content.file_size IS 'File size in bytes';
COMMENT ON COLUMN scraped_content.file_type IS 'MIME type or file extension (pdf, txt, doc, docx)';
COMMENT ON COLUMN scraped_content.storage_path IS 'Path in Supabase Storage bucket';
COMMENT ON COLUMN scraped_content.processing_status IS 'Document processing status: pending, processing, completed, failed';

