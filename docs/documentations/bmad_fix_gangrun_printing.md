# BMAD Project: Fix GangRunPrinting Product Configurator

## Project Context

**Repository:** https://github.com/iradwatkins/gangrunprintingv1
**Website:** https://gangrunprinting.com
**Problem:** Product configurator components (quantity, size, paper stock, addons, turnaround times) are not showing on the website
**Business Model:** Print broker (order-taking only, forwards to vendors)

## Critical Project Information

- **Tech Stack:** Next.js 15.5.2, TypeScript, PostgreSQL with Prisma ORM, Docker, MinIO for storage
- **Current State:** The business logic and pricing calculations work, but UI components are not visible
- **Requirement:** Fix visibility issues while preserving the existing modular component system
- **Important:** This is NOT a manufacturing system - it's purely for taking orders

## BMAD Agent Instructions

### For PM Agent

Create a PRD for fixing the product configurator visibility issues. The requirements are:

1. **Functional Requirements:**
   - FR1: All product configuration options (quantity, size, paper stock, addons, turnaround) must be visible on product pages
   - FR2: Price must update in real-time when options are selected
   - FR3: Product creation must use existing modular components (not create new architecture)
   - FR4: System must support creating new products by configuring existing components

2. **Non-Functional Requirements:**
   - NFR1: Fix must not break any existing products
   - NFR2: Solution must be deployable to existing VPS via Docker
   - NFR3: Must maintain existing database structure (PostgreSQL/Prisma)

3. **Success Criteria:**
   - All components visible on https://gangrunprinting.com/products/business-cards-quantity-only-test-1759153813144
   - Admin can create new products using configuration (not coding)
   - Existing orders and data remain intact

### For Architect Agent

Analyze the existing architecture and identify the root cause of component visibility issues:

1. **Repository Analysis Required:**

   ```
   - Examine prisma/schema.prisma for Product model structure
   - Identify how paper stock, addons, turnaround times are stored
   - Document component structure in app/ or pages/ directories
   - Find pricing calculation logic
   ```

2. **Key Questions to Answer:**
   - Are components not rendering due to missing data?
   - Are there CSS/JavaScript conflicts hiding components?
   - Is there a hydration issue with Next.js SSR?
   - Are conditional rendering checks failing?

3. **Architecture Constraints:**
   - Must work within existing Next.js 15.5.2 structure
   - Must use existing Prisma schema (no migrations that break data)
   - Must preserve Docker deployment setup

### For Dev Agent (Most Critical)

**Your mission:** Fix the product configurator visibility issues and document how the existing system works.

#### Phase 1: Emergency Fix (Immediate)

Create a utility to force all components visible:

```typescript
// utils/forceVisibility.ts
// Force all product options to display regardless of conditions
// Apply to: quantity-selector, size-selector, paper-selector, addon-selector, turnaround-selector
```

Add this to the main product page layout immediately.

#### Phase 2: Root Cause Analysis

1. Clone https://github.com/iradwatkins/gangrunprintingv1
2. Document the EXACT structure of:
   - How products are stored in the database
   - How paper stock options are defined
   - How addons work (separate table, JSON field, or relations?)
   - How turnaround times affect pricing
   - Component rendering logic

3. Identify why components aren't showing:
   - Missing data in API responses?
   - Client-side rendering issues?
   - CSS hiding elements?
   - JavaScript initialization failures?

#### Phase 3: Proper Fix Implementation

Based on your findings, implement the correct fix:

- If data issue: Fix API endpoints to return all required fields
- If rendering issue: Fix hydration and conditional rendering
- If CSS issue: Override hiding rules
- If JS issue: Ensure proper component initialization

#### Phase 4: Product Creation Documentation

Create a working example showing how to create a new product:

```typescript
// Example: Creating a "Postcards" product
const postcardProduct = {
  name: "Postcards",
  slug: "postcards",
  // Document the EXACT structure your system uses
  quantityOptions: // How are these stored?
  paperOptions: // What format?
  turnaroundOptions: // How structured?
  addonOptions: // How configured?
}

// Show the exact Prisma create command
// Show how to configure each component
// Show how pricing is calculated
```

#### Phase 5: Testing

Test these specific URLs:

1. https://gangrunprinting.com/products/business-cards-quantity-only-test-1759153813144
2. Any other product pages

Verify:

- ✅ Quantity selector visible and functional
- ✅ Paper stock options showing
- ✅ Addon checkboxes/selects working
- ✅ Turnaround time options displaying
- ✅ Price updates when options change
- ✅ Add to cart works with all selections

### For QA Agent

Create test cases for:

1. Component visibility (all options display)
2. Price calculation accuracy
3. Product creation process
4. Order submission with all options
5. Existing product compatibility

## Deliverables Required

1. **Immediate Fix** - Code to force components visible TODAY
2. **Root Cause Analysis** - Document explaining why components aren't showing
3. **Permanent Solution** - Proper fix addressing the root cause
4. **Product Creation Guide** - Step-by-step instructions using existing system
5. **Component Documentation** - How paper stock, addons, turnaround times currently work

## Project Constraints

- **DO NOT** redesign the system - fix what exists
- **DO NOT** change database schema in breaking ways
- **DO NOT** create new architecture - use existing modular components
- **DO** preserve all existing functionality
- **DO** maintain Docker deployment compatibility
- **DO** document everything you discover

## Definition of Success

The project is complete when:

1. All product configurator components are visible on the website
2. New products can be created using the existing modular system
3. Documentation explains how to create products without coding
4. No existing functionality is broken

## Start Instructions for BMAD

1. Begin with Dev Agent to analyze the repository
2. Document findings about component structure
3. Implement emergency visibility fix
4. Identify and fix root cause
5. Create product creation documentation
6. Test everything

## Repository Files to Examine First

```
prisma/schema.prisma - Database structure
app/products/* - Product pages
app/api/products/* - Product APIs
components/* - UI components
lib/pricing/* - Pricing logic
types/* - TypeScript definitions
```

## Example Test Product URL

https://gangrunprinting.com/products/business-cards-quantity-only-test-1759153813144

This product should show:

- Quantity options (100, 250, 500, 1000, etc.)
- Paper stock (14pt, 16pt, 32pt, etc.)
- Coating/finish options
- Turnaround times (standard, rush, next-day)
- Addons (rounded corners, foil, etc.)
- File upload
- Real-time pricing

Currently, these components exist but are not displaying. Fix this.
