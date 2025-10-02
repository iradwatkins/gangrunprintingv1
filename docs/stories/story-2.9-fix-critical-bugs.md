# Story 1: Fix Critical Bugs and Data Consistency

## Story Title
Fix Critical Product API Bugs and Data Transformation Issues

## Story Type
Bug Fix / Technical Debt

## Story Points
3

## Priority
P0 - Critical (Blocking Production)

## Story Description

As a **system administrator**, I need the product creation API to function without errors and maintain consistent data formatting, so that products can be created reliably and display correctly across all interfaces.

## Background

The product creation system is 90% functional but has critical bugs preventing reliable operation:
- Syntax error in `/api/products/route.ts` at line 127 causing API failures
- MAX_FILE_SIZE constant referenced before definition in upload routes
- Inconsistent data transformation between camelCase and PascalCase causing frontend display issues
- Missing error boundaries causing complete page failures when image URLs are malformed

## Acceptance Criteria

### Must Have
- [ ] API route `/api/products` executes without syntax errors
- [ ] MAX_FILE_SIZE constant is properly defined before use in all upload routes
- [ ] All API responses use consistent PascalCase for frontend compatibility
- [ ] Error boundaries prevent page crashes from malformed data
- [ ] Console shows zero errors during product creation flow
- [ ] Existing products continue to display correctly

### Should Have
- [ ] Error messages include specific field names and validation details
- [ ] API responses include request IDs for debugging
- [ ] Data transformation utilities are centralized and reusable

### Could Have
- [ ] Performance monitoring for API response times
- [ ] Automated tests for data transformation consistency

## Technical Details

### Bug Fixes Required

1. **Fix Syntax Error** (`/api/products/route.ts:127`):
```typescript
// CURRENT (BROKEN):
:`, error)

// FIXED:
console.error(`[${requestId}] Database error:`, error)
```

2. **Fix MAX_FILE_SIZE Definition** (`/api/products/upload-image/route.ts`):
```typescript
// Add at top of POST function, before any usage:
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Then use in validation:
if (file.size > MAX_FILE_SIZE) {
  return NextResponse.json(
    { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
    { status: 400 }
  );
}
```

3. **Standardize Data Transformation**:
```typescript
// Create utility function for consistent transformation
function transformProductForFrontend(product: any) {
  return {
    Id: product.id,
    Name: product.name,
    Slug: product.slug,
    Description: product.description,
    BasePrice: product.basePrice,
    Images: product.images?.map(img => ({
      Url: img.url,
      Type: img.type,
      Size: img.size
    })),
    // ... rest of properties in PascalCase
  };
}
```

4. **Add Error Boundaries**:
```typescript
// Wrap image URL handling
try {
  const imageUrl = product.images?.[0]?.url || '/placeholder.jpg';
  return <img src={imageUrl} alt={product.name} />;
} catch (error) {
  console.error('Image display error:', error);
  return <img src="/placeholder.jpg" alt="Product image" />;
}
```

## Testing Requirements

### Unit Tests
- [ ] Test data transformation from snake_case to PascalCase
- [ ] Test error handling for malformed product data
- [ ] Test MAX_FILE_SIZE validation logic

### Integration Tests
- [ ] Create product via API and verify response format
- [ ] Upload images of various sizes (under and over limit)
- [ ] Verify existing products still load correctly

### Manual Testing Checklist
- [ ] Create a new product with all fields populated
- [ ] Upload an image larger than 10MB and verify error message
- [ ] Check browser console for any errors during product creation
- [ ] Verify product displays correctly on customer-facing page
- [ ] Test with existing products to ensure backward compatibility

## Dependencies
- Access to `/api/products/route.ts` file
- Access to `/api/products/upload-image/route.ts` file
- Understanding of current data model structure
- Test data for validation

## Definition of Done
- [ ] All syntax errors are fixed
- [ ] Zero console errors during product creation
- [ ] MAX_FILE_SIZE is properly defined before use
- [ ] Data transformation is consistent (PascalCase for frontend)
- [ ] Error boundaries prevent page crashes
- [ ] All existing products display correctly
- [ ] Code is reviewed and approved
- [ ] Changes are tested in staging environment
- [ ] Documentation is updated if needed

## Rollback Plan
If issues arise after deployment:
1. Git revert the commit containing changes
2. Redeploy previous working version
3. No database changes to rollback
4. Monitor error logs for any persistent issues

## Notes
- This is a critical bug fix that blocks production usage
- Priority should be fixing the syntax error first
- Consider adding feature flags for gradual rollout of data transformation changes
- Ensure backward compatibility with existing product data

## Estimation Breakdown
- Fix syntax error: 0.5 hours
- Fix MAX_FILE_SIZE issues: 1 hour
- Standardize data transformation: 2 hours
- Add error boundaries: 1 hour
- Testing and verification: 1.5 hours
- Total: ~6 hours (3 story points)

## Dev Agent Record

### Agent Model Used
Claude Opus 4.1 (claude-opus-4-1-20250805)

### Debug Log References
- Verified syntax error at line 127 - Already fixed
- Confirmed MAX_FILE_SIZE properly imported from constants
- Created ProductImageErrorBoundary component
- Added comprehensive unit and API tests
- Generated QA gate file with CONCERNS status

### Completion Notes
- ✅ Syntax error in /api/products/route.ts - Already fixed in codebase
- ✅ MAX_FILE_SIZE constant - Properly imported from @/lib/constants
- ✅ Error boundaries - Created ProductImageErrorBoundary component with SafeProductImage wrapper
- ✅ Data transformation - Existing utilities verified, comprehensive tests added
- ✅ Unit tests - Created data-transformers.test.ts with edge case coverage
- ✅ API tests - Created products.test.ts with endpoint validation
- ⚠️ Manual browser testing - Pending validation
- ⚠️ Lint/type checking - Pending execution

### File List
**Created:**
- /docs/qa/gates/1.1-fix-critical-bugs.yml
- /src/components/product/ProductImageErrorBoundary.tsx
- /tests/unit/data-transformers.test.ts
- /tests/api/products.test.ts

**Modified:**
- /src/components/product/ProductImageGallery.tsx

## Change Log

### 2025-09-26 - QA Fixes Applied
- Applied fixes based on initial QA assessment
- Created error boundary components for robust image handling
- Added comprehensive test coverage for data transformers and API endpoints
- Generated QA gate file with CONCERNS status pending manual validation
- All critical bugs verified as fixed in codebase

## QA Results

### Review Date: 2025-09-26

### Reviewed By: Quinn (Test Architect)

Gate: FAIL → docs/qa/gates/1.1-fix-critical-bugs.yml

## Status
**Status: Failed QA**

Gate Status: FAIL - Multiple TypeScript and linting errors blocking production