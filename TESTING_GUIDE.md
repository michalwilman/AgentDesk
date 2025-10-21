# Document Ingestion Feature - Testing Guide

## Prerequisites

Before testing, ensure you have completed:

1. ✅ Installed backend dependencies: `cd backend && npm install`
2. ✅ Installed frontend dependencies: `cd frontend && npm install`
3. ✅ Configured Supabase Storage bucket (see `supabase/setup_storage_bucket.md`)
4. ✅ Applied database migration (`supabase/migration_add_document_fields.sql`)
5. ✅ Set environment variables in both backend and frontend
6. ✅ Started backend server: `cd backend && npm run dev`
7. ✅ Started frontend server: `cd frontend && npm run dev`

## Test Files Preparation

Prepare test files in both Hebrew and English:

### English Test Files
- `test_english.pdf` - PDF with English text
- `test_english.txt` - Plain text file with English content
- `test_english.doc` - Old Word document with English text
- `test_english.docx` - Modern Word document with English text

### Hebrew Test Files
- `test_hebrew.pdf` - PDF with Hebrew text (עברית)
- `test_hebrew.txt` - Plain text file with Hebrew content
- `test_hebrew.doc` - Old Word document with Hebrew text
- `test_hebrew.docx` - Modern Word document with Hebrew text

### Edge Cases
- `large_file.pdf` - File just under tier limit (e.g., 4.9MB for free tier)
- `oversized_file.pdf` - File exceeding tier limit (e.g., 6MB for free tier)
- `invalid_file.exe` - Invalid file type
- `empty_file.pdf` - Empty or corrupted file

## Test Scenarios

### 1. Basic Upload Tests

#### Test 1.1: Upload PDF (English)
1. Navigate to bot edit page
2. Click "Knowledge Base" tab
3. Upload `test_english.pdf`
4. **Expected**: 
   - File uploads successfully
   - Status shows "Pending" then "Processing"
   - After ~5-10 seconds, status changes to "Completed"
   - Word count is displayed
   - File appears in documents table

#### Test 1.2: Upload PDF (Hebrew)
1. Same steps as 1.1 but with `test_hebrew.pdf`
2. **Expected**: Same as 1.1, Hebrew text properly extracted

#### Test 1.3: Upload TXT (English)
1. Upload `test_english.txt`
2. **Expected**: Fast processing (instant), text extracted correctly

#### Test 1.4: Upload TXT (Hebrew)
1. Upload `test_hebrew.txt`
2. **Expected**: Fast processing (instant), Hebrew text extracted correctly

#### Test 1.5: Upload DOCX (English)
1. Upload `test_english.docx`
2. **Expected**: Text extracted from Word document

#### Test 1.6: Upload DOCX (Hebrew)
1. Upload `test_hebrew.docx`
2. **Expected**: Hebrew text extracted from Word document

#### Test 1.7: Upload DOC (Old Format)
1. Upload `test_english.doc`
2. **Expected**: May work partially (old format has limited support)
3. **Note**: May show "Failed" status - this is expected for complex .doc files

### 2. Validation Tests

#### Test 2.1: File Size Validation (Frontend)
1. Try to drag `oversized_file.pdf` (>5MB for free tier)
2. **Expected**: 
   - Error message: "File size exceeds 5MB limit"
   - File not uploaded
   - Message in red banner

#### Test 2.2: File Size Validation (Backend)
1. Bypass frontend and send oversized file via API
2. **Expected**: 
   - 400 Bad Request error
   - Error message indicates size limit exceeded

#### Test 2.3: Invalid File Type
1. Try to upload `invalid_file.exe`
2. **Expected**: 
   - Error message: "Invalid file type. Supported: PDF, TXT, DOC, DOCX"
   - File not uploaded

#### Test 2.4: Empty/Corrupted File
1. Upload `empty_file.pdf`
2. **Expected**: 
   - File uploads
   - Status changes to "Failed"
   - Error in metadata: "No text could be extracted"

### 3. Multiple File Upload

#### Test 3.1: Upload Multiple Files
1. Select multiple files: `test_english.pdf`, `test_english.txt`, `test_hebrew.pdf`
2. **Expected**:
   - All files show in "selected files" list
   - Upload button shows count: "Upload 3 files"
   - All files upload sequentially
   - Progress bar for each file

#### Test 3.2: Remove File Before Upload
1. Select multiple files
2. Click X button on one file
3. **Expected**:
   - File removed from list
   - Other files remain
   - Count updated

### 4. Documents Table Tests

#### Test 4.1: Sort by Name
1. Upload multiple files with different names
2. Click "File Name" column header
3. **Expected**:
   - Files sorted alphabetically
   - Arrow indicator shows sort direction
   - Click again to reverse sort

#### Test 4.2: Sort by Date
1. Upload files at different times
2. Click "Date" column header
3. **Expected**:
   - Files sorted by upload date
   - Newest first (desc) by default
   - Click again to show oldest first

#### Test 4.3: Sort by Size
1. Upload files of different sizes
2. Click "Size" column header
3. **Expected**:
   - Files sorted by size
   - Largest first (desc) by default

#### Test 4.4: Status Badges
1. Observe status badges during upload and processing
2. **Expected**:
   - Pending: Yellow badge with clock icon
   - Processing: Blue badge with spinner icon
   - Completed: Green badge with checkmark icon
   - Failed: Red badge with alert icon

### 5. Delete Tests

#### Test 5.1: Delete Document
1. Click delete button (trash icon) on a document
2. **Expected**:
   - Button changes to red with "Click again to confirm"
   - Click again
   - Document removed from table
   - Success message shown
   - File removed from Supabase Storage

#### Test 5.2: Delete During Processing
1. Upload a large PDF
2. While status is "Processing", try to delete
3. **Expected**:
   - Deletion works
   - File removed from storage
   - Processing stops
   - Embeddings cleaned up

#### Test 5.3: Cancel Delete
1. Click delete button once
2. Wait 3 seconds without clicking again
3. **Expected**:
   - Button returns to normal state
   - Document not deleted
   - Confirmation expires

### 6. Refresh Tests

#### Test 6.1: Manual Refresh
1. Click refresh button (circular arrow)
2. **Expected**:
   - Loading spinner shows
   - Documents list reloads
   - Processing status updated

#### Test 6.2: Auto Refresh After Upload
1. Upload a file
2. **Expected**:
   - After successful upload, documents list automatically refreshes
   - New document appears in table

#### Test 6.3: Auto Refresh After Delete
1. Delete a document
2. **Expected**:
   - After successful delete, documents list automatically refreshes
   - Document removed from table

### 7. UI/UX Tests

#### Test 7.1: Empty State
1. Create new bot with no documents
2. Navigate to Knowledge Base tab
3. **Expected**:
   - File icon displayed
   - Message: "No documents yet"
   - Helpful description text

#### Test 7.2: Drag & Drop Visual Feedback
1. Drag a file over the upload zone
2. **Expected**:
   - Border changes to primary color
   - Background slightly highlighted
   - Visual feedback that drop is allowed

#### Test 7.3: Upload Progress
1. Upload a large file (3-4MB)
2. **Expected**:
   - Progress bar appears
   - Percentage shown (0% to 100%)
   - File name displayed
   - Progress bar animated

#### Test 7.4: Error Messages
1. Trigger various errors (oversized file, invalid type, network error)
2. **Expected**:
   - Red error banner with specific message
   - Message is clear and actionable
   - Error persists until dismissed or new action

#### Test 7.5: Success Messages
1. Successfully upload a file
2. Successfully delete a file
3. **Expected**:
   - Green success banner
   - Message in appropriate language
   - Auto-dismiss after a few seconds

### 8. Bilingual Support Tests

#### Test 8.1: Hebrew Interface
1. Create/edit a bot with language set to Hebrew
2. Navigate to Knowledge Base tab
3. **Expected**:
   - All labels in Hebrew
   - RTL layout
   - Hebrew dates
   - Hebrew error/success messages

#### Test 8.2: English Interface
1. Create/edit a bot with language set to English
2. Navigate to Knowledge Base tab
3. **Expected**:
   - All labels in English
   - LTR layout
   - English dates
   - English error/success messages

#### Test 8.3: Switch Language
1. Change bot language from English to Hebrew
2. **Expected**:
   - Knowledge Base tab updates immediately
   - All text translated
   - Layout direction changes

### 9. Integration Tests

#### Test 9.1: Embedding Generation
1. Upload a document
2. Wait for "Completed" status
3. Check database `knowledge_embeddings` table
4. **Expected**:
   - Embedding record created
   - `bot_id` matches
   - `content_id` references document
   - Vector embedding is populated

#### Test 9.2: Bot Response Uses Document
1. Upload a document with specific information
2. Wait for processing to complete
3. Chat with bot asking about that information
4. **Expected**:
   - Bot retrieves relevant context
   - Response includes information from document
   - Context used is logged

#### Test 9.3: Document Deletion Cleanup
1. Upload and process a document
2. Verify embedding exists in database
3. Delete the document
4. Check database
5. **Expected**:
   - Document removed from `scraped_content`
   - Embedding removed from `knowledge_embeddings`
   - File removed from Supabase Storage

### 10. Security Tests

#### Test 10.1: Unauthenticated Access
1. Log out
2. Try to access `/api/documents/upload` directly
3. **Expected**:
   - 401 Unauthorized error
   - Access denied

#### Test 10.2: Access Other User's Documents
1. Login as User A
2. Get botId of User B's bot
3. Try to upload/view/delete documents for User B's bot
4. **Expected**:
   - Access denied
   - Bot ownership verification fails

#### Test 10.3: SQL Injection
1. Upload file with name: `test'; DROP TABLE scraped_content; --`
2. **Expected**:
   - Filename sanitized
   - No SQL injection occurs
   - File uploads safely

#### Test 10.4: Path Traversal
1. Upload file with name: `../../etc/passwd.txt`
2. **Expected**:
   - Path traversal characters stripped
   - File saved with sanitized name
   - No directory traversal occurs

### 11. Performance Tests

#### Test 11.1: Large File Processing
1. Upload a 4.8MB PDF with lots of text
2. Measure processing time
3. **Expected**:
   - Processing completes within 30 seconds
   - No timeout errors
   - Text extracted successfully

#### Test 11.2: Multiple Simultaneous Uploads
1. Open multiple browser tabs
2. Upload different files from each tab
3. **Expected**:
   - All uploads process without interference
   - Each gets own progress tracking
   - All complete successfully

#### Test 11.3: Heavy Load
1. Upload 10+ documents in quick succession
2. **Expected**:
   - Server handles load gracefully
   - Processing queue works correctly
   - No crashes or errors

### 12. Edge Cases

#### Test 12.1: Network Interruption
1. Start uploading a file
2. Disconnect internet mid-upload
3. **Expected**:
   - Error message shown
   - User can retry
   - No corrupt data in database

#### Test 12.2: Browser Refresh During Upload
1. Start uploading a file
2. Refresh browser page
3. **Expected**:
   - Upload interrupted gracefully
   - Document may be in "pending" or "failed" state
   - User can delete and retry

#### Test 12.3: Special Characters in Filename
1. Upload file named: `test (1) [copy] #2 @2024.pdf`
2. **Expected**:
   - Special characters handled
   - File uploads successfully
   - Filename displayed correctly

## Test Results Template

Use this template to document your test results:

```markdown
### Test Session: [Date]

**Tester**: [Your Name]
**Environment**: 
- Backend: Running on localhost:3001
- Frontend: Running on localhost:3000
- Database: Supabase [Project Name]

#### Test Results

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| 1.1 | Upload PDF (English) | ✅ PASS | Processed in 5s |
| 1.2 | Upload PDF (Hebrew) | ✅ PASS | Hebrew text extracted correctly |
| 2.1 | File Size Validation | ✅ PASS | Error shown for 6MB file |
| ... | ... | ... | ... |

#### Issues Found

1. **[Issue Title]**
   - Severity: High/Medium/Low
   - Steps to reproduce: ...
   - Expected behavior: ...
   - Actual behavior: ...
   - Screenshot/Log: ...

#### Summary

- Total Tests: XX
- Passed: XX
- Failed: XX
- Blocked: XX

**Overall Status**: ✅ PASS / ❌ FAIL / ⚠️ PARTIAL
```

## Post-Testing Checklist

After completing all tests:

- [ ] All basic upload scenarios work
- [ ] File validation works correctly
- [ ] Documents table displays properly
- [ ] Delete functionality works
- [ ] Both Hebrew and English supported
- [ ] Error messages are clear
- [ ] No security vulnerabilities found
- [ ] Performance is acceptable
- [ ] Integration with embeddings works
- [ ] Documentation is accurate

## Reporting Issues

If you find bugs during testing:

1. Document the issue using the template above
2. Check browser console for errors
3. Check backend logs for server errors
4. Include screenshots if relevant
5. Note the environment (OS, browser, versions)

## Success Criteria

Testing is complete when:

- ✅ All critical tests pass (upload, process, list, delete)
- ✅ Both Hebrew and English work correctly
- ✅ Security tests pass
- ✅ No major bugs found
- ✅ Performance is acceptable
- ✅ User experience is smooth

## Next Steps After Testing

Once testing is complete and issues are resolved:

1. Update this document with actual test results
2. Fix any bugs found
3. Consider implementing future enhancements
4. Deploy to production environment
5. Monitor production usage for issues

