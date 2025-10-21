-- Fix missing file names in existing documents
-- Update documents where file_name is null but we have metadata.original_name

UPDATE scraped_content
SET file_name = metadata->>'original_name'
WHERE source_url = 'document' 
  AND file_name IS NULL 
  AND metadata->>'original_name' IS NOT NULL;

-- If no metadata, use title as fallback
UPDATE scraped_content
SET file_name = title
WHERE source_url = 'document' 
  AND file_name IS NULL 
  AND title IS NOT NULL;

-- Set a default name for any remaining documents
UPDATE scraped_content
SET file_name = CONCAT('document_', SUBSTRING(id::text, 1, 8))
WHERE source_url = 'document' 
  AND file_name IS NULL;

