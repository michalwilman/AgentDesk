# File Size Management - Smart Tier-Based Limits

## Overview

The Document Ingestion feature implements intelligent file size management that respects **both** user subscription tiers **and** Supabase project infrastructure limits.

## The Problem

As a SaaS platform, we have two types of limits:

1. **Business Limits** (Subscription Tiers):
   - Free: 5MB
   - Pro: 20MB
   - Business: 100MB

2. **Infrastructure Limits** (Supabase Storage):
   - Free Plan: 50MB per file
   - Pro Plan: 100MB per file
   - Team/Enterprise: Higher limits

**Challenge:** What happens when a Business tier user (allowed 100MB) tries to upload a file on a Supabase free plan (limited to 50MB)?

## The Solution

We implement a **dual-limit system** that takes the minimum between:
- User's subscription tier limit
- Supabase project limit

### Architecture

```
User Upload (100MB file)
    ↓
Frontend Validation
    ↓ (checks: min(Business: 100MB, Supabase: 50MB) = 50MB)
    ↓ REJECTED ❌
    └─→ Error: "File exceeds project storage limit of 50MB"

User Upload (40MB file)
    ↓
Frontend Validation ✅
    ↓
Backend Validation
    ↓ (checks: min(Business: 100MB, Supabase: 50MB) = 50MB)
    ↓ ACCEPTED ✅
    └─→ Upload to Supabase Storage
```

## Implementation Details

### Backend Implementation

**File:** `backend/src/documents/documents.service.ts`

```typescript
export class DocumentsService {
  // Configurable project limit from environment
  private readonly SUPABASE_PROJECT_MAX_FILE_SIZE: number;
  
  // Business tier limits
  private readonly MAX_FILE_SIZE_FREE = 5 * 1024 * 1024;      // 5MB
  private readonly MAX_FILE_SIZE_PRO = 20 * 1024 * 1024;      // 20MB
  private readonly MAX_FILE_SIZE_BUSINESS = 100 * 1024 * 1024; // 100MB

  constructor(private configService: ConfigService) {
    // Read from environment, default to 50MB
    this.SUPABASE_PROJECT_MAX_FILE_SIZE = 
      parseInt(configService.get('SUPABASE_MAX_FILE_SIZE', '52428800'), 10);
  }

  private validateFileSize(size: number, tier: string) {
    // Get tier limit
    let tierLimit = this.MAX_FILE_SIZE_FREE;
    if (tier === 'pro') tierLimit = this.MAX_FILE_SIZE_PRO;
    if (tier === 'business') tierLimit = this.MAX_FILE_SIZE_BUSINESS;

    // Take the minimum (most restrictive)
    const effectiveLimit = Math.min(tierLimit, this.SUPABASE_PROJECT_MAX_FILE_SIZE);

    if (size > effectiveLimit) {
      // Smart error message
      if (effectiveLimit === this.SUPABASE_PROJECT_MAX_FILE_SIZE && 
          tierLimit > this.SUPABASE_PROJECT_MAX_FILE_SIZE) {
        throw new Error(
          `File exceeds project limit (${effectiveLimit}MB). ` +
          `Your ${tier} tier allows ${tierLimit}MB, but requires Supabase upgrade.`
        );
      }
      throw new Error(`File exceeds ${tier} tier limit of ${effectiveLimit}MB`);
    }
  }
}
```

### Frontend Implementation

**File:** `frontend/lib/api/documents.ts`

```typescript
export function getMaxFileSizeForTier(tier: string): number {
  // Must match backend SUPABASE_MAX_FILE_SIZE
  const SUPABASE_PROJECT_LIMIT_MB = 50;

  const tierLimits = {
    free: 5,
    pro: 20,
    business: 100,
  };

  const tierLimit = tierLimits[tier] || tierLimits.free;
  
  // Return minimum (most restrictive)
  return Math.min(tierLimit, SUPABASE_PROJECT_LIMIT_MB);
}
```

### Configuration

**File:** `backend/.env`

```env
# Supabase Storage Configuration
# Maximum file size for document uploads in bytes
# Free tier: 52428800 (50MB) | Pro tier: 104857600 (100MB)
SUPABASE_MAX_FILE_SIZE=52428800
```

## User Experience

### Scenario 1: Free Tier User
- **Tier Limit:** 5MB
- **Project Limit:** 50MB
- **Effective Limit:** 5MB (tier is bottleneck)
- **Upload 6MB:** ❌ "File exceeds maximum allowed size of 5MB for free tier"

### Scenario 2: Pro Tier User
- **Tier Limit:** 20MB
- **Project Limit:** 50MB
- **Effective Limit:** 20MB (tier is bottleneck)
- **Upload 25MB:** ❌ "File exceeds maximum allowed size of 20MB for pro tier"

### Scenario 3: Business Tier User (Supabase Free)
- **Tier Limit:** 100MB
- **Project Limit:** 50MB
- **Effective Limit:** 50MB (project is bottleneck)
- **Upload 80MB:** ❌ "File size exceeds project storage limit of 50MB. Your business tier allows up to 100MB, but requires a Supabase plan upgrade."

### Scenario 4: Business Tier User (Supabase Pro)
- **Tier Limit:** 100MB
- **Project Limit:** 100MB
- **Effective Limit:** 100MB (both aligned)
- **Upload 80MB:** ✅ Success!

## Upgrading Path

### Current State (Supabase Free)

```
User Tier    → Can Upload
─────────────────────────
Free         → 5MB ✅
Pro          → 20MB ✅
Business     → 50MB ⚠️ (limited by Supabase)
```

### After Upgrading to Supabase Pro

1. **Upgrade Supabase** to Pro/Team plan
2. **Update environment variable:**
   ```env
   SUPABASE_MAX_FILE_SIZE=104857600  # 100MB
   ```
3. **Restart backend server**

```
User Tier    → Can Upload
─────────────────────────
Free         → 5MB ✅
Pro          → 20MB ✅
Business     → 100MB ✅ (now fully enabled!)
```

## Benefits of This Approach

### ✅ Scalability
- Easily adjust limits without code changes
- Support infrastructure upgrades seamlessly

### ✅ Clear Communication
- Users understand why their upload failed
- Business tier users know they need infrastructure upgrade

### ✅ Cost Management
- Free tier users limited to 5MB (cost-effective)
- Infrastructure costs scale with revenue (Business tier)

### ✅ Future-Proof
- Ready for Supabase plan upgrades
- Supports adding new tiers (Enterprise, etc.)

### ✅ Consistent Validation
- Frontend validation prevents wasted uploads
- Backend validation ensures security
- Both use same logic

## Testing

### Test Cases

1. **Free tier, 3MB file** → ✅ Pass
2. **Free tier, 6MB file** → ❌ Fail (tier limit)
3. **Pro tier, 15MB file** → ✅ Pass
4. **Pro tier, 25MB file** → ❌ Fail (tier limit)
5. **Business tier, 40MB file (Supabase free)** → ✅ Pass
6. **Business tier, 80MB file (Supabase free)** → ❌ Fail (project limit)
7. **Business tier, 80MB file (Supabase pro)** → ✅ Pass

### Error Messages

All error messages are:
- ✅ Clear and specific
- ✅ Explain the actual limit
- ✅ Suggest upgrade path when applicable
- ✅ Bilingual (English/Hebrew)

## Monitoring

### Backend Logs

On startup, the backend logs the configured limit:

```
📦 Supabase max file size: 50MB
```

This helps verify configuration is correct.

### Metrics to Track

1. **Upload failures by reason:**
   - Tier limit exceeded
   - Project limit exceeded
   - Invalid file type

2. **Average file size by tier:**
   - Free: ~2MB
   - Pro: ~8MB
   - Business: ~30MB

3. **Upgrade triggers:**
   - How many Business users hit 50MB limit?
   - When to upgrade Supabase?

## Configuration Reference

### Backend Environment Variables

```env
# Required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# File size limit (bytes)
SUPABASE_MAX_FILE_SIZE=52428800  # 50MB default

# Common values:
# 52428800   = 50MB  (Supabase Free)
# 104857600  = 100MB (Supabase Pro)
# 209715200  = 200MB (Custom)
```

### Frontend Constants

In `frontend/lib/api/documents.ts`:

```typescript
// Must be kept in sync with backend
const SUPABASE_PROJECT_LIMIT_MB = 50

// Update when upgrading Supabase:
// const SUPABASE_PROJECT_LIMIT_MB = 100
```

## Troubleshooting

### Issue: Business users can't upload large files

**Symptom:** Error "File exceeds project storage limit of 50MB"

**Cause:** Supabase is on free plan

**Solution:** 
1. Upgrade Supabase to Pro plan
2. Update `SUPABASE_MAX_FILE_SIZE=104857600`
3. Restart backend

### Issue: All uploads fail with "project limit"

**Symptom:** Even small files fail

**Cause:** Invalid `SUPABASE_MAX_FILE_SIZE` value

**Solution:**
1. Check backend logs for parsed value
2. Verify `.env` has valid number
3. Restart backend after fixing

### Issue: Frontend and backend limits don't match

**Symptom:** Frontend allows file, backend rejects

**Cause:** Frontend `SUPABASE_PROJECT_LIMIT_MB` not updated

**Solution:**
1. Update `SUPABASE_PROJECT_LIMIT_MB` in `documents.ts`
2. Rebuild frontend
3. Clear browser cache

## Future Enhancements

1. **Dynamic Limit Loading:** Frontend fetches limits from backend API
2. **Usage Analytics:** Show users how close they are to their limits
3. **Compression:** Auto-compress large PDFs before upload
4. **Chunked Upload:** Support files larger than 100MB with chunking
5. **CDN Integration:** Use CDN for very large file storage

## Summary

The file size management system provides:

✅ **Smart Validation:** Respects both tier and infrastructure limits  
✅ **Clear Communication:** Users understand limits and upgrade paths  
✅ **Easy Scaling:** One environment variable to upgrade capacity  
✅ **Cost Effective:** Controls infrastructure costs  
✅ **Future Proof:** Ready for growth and new tiers  

This architecture ensures the platform can grow from free tier to enterprise scale without code refactoring.

