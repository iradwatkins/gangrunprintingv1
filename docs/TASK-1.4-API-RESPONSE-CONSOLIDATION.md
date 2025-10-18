# Task 1.4: API Response Handler Consolidation
**Date:** October 18, 2025
**Status:** In Progress
**Risk Level:** VERY LOW
**Estimated Time:** 2-3 hours

---

## DECISION: Keep `/src/lib/api-response.ts`

### Analysis Results

**File Usage:**
- `/src/lib/api-response.ts` → Used by **8 files** ✅
- `/src/lib/api/responses.ts` → Used by **1 file** only

**Feature Comparison:**

| Feature | api-response.ts | api/responses.ts |
|---------|-----------------|------------------|
| Lines of Code | 254 | 98 |
| Request ID tracking | ✅ Yes | ❌ No |
| Timestamps | ✅ Yes | ❌ No |
| Custom headers | ✅ Yes | ❌ No |
| Validation errors | ✅ Yes | ❌ No |
| Database errors | ✅ Yes | ✅ Yes (basic) |
| Upload errors | ✅ Yes | ❌ No |
| Rate limit errors | ✅ Yes | ❌ No |
| Timeout errors | ✅ Yes | ❌ No |

**Decision Rationale:**
- `api-response.ts` is MORE comprehensive
- `api-response.ts` is MORE widely used (8 vs 1 files)
- `api-response.ts` has better features (request tracking, timestamps)
- Easier to migrate 1 file than 8 files

**Action:** Keep `api-response.ts`, deprecate `api/responses.ts`

---

## IMPLEMENTATION PLAN

### Step 1: Migrate the Single File

**File to migrate:** `/src/app/api/add-ons/route.ts`

**Current imports:**
```typescript
import { successResponse, handleApiError, commonErrors } from '@/lib/api/responses'
```

**New imports:**
```typescript
import {
  createSuccessResponse,
  createErrorResponse,
  createDatabaseErrorResponse,
  createAuthErrorResponse
} from '@/lib/api-response'
```

**Function mapping:**
- `successResponse(data)` → `createSuccessResponse(data)`
- `errorResponse(msg, status)` → `createErrorResponse(msg, status)`
- `commonErrors.unauthorized()` → `createAuthErrorResponse()`
- `commonErrors.adminRequired()` → `createAuthErrorResponse('Admin access required')`
- `commonErrors.notFound(resource)` → `createNotFoundErrorResponse(resource)`
- `commonErrors.badRequest(msg)` → `createErrorResponse(msg, 400)`
- `handleApiError(error)` → `createDatabaseErrorResponse(error)` or `createServerErrorResponse()`

### Step 2: Update add-ons/route.ts

No file changes needed yet - will update in implementation.

### Step 3: Delete api/responses.ts

After migration, delete `/src/lib/api/responses.ts`.

### Step 4: Verify No Broken Imports

```bash
# Should return nothing
grep -r "from '@/lib/api/responses'" src/
```

---

## IMPLEMENTATION

Starting now...
