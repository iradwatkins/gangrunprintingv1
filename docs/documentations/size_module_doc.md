# SIZE MODULE - Testing & Validation Documentation

## Module Overview

**Module Name:** Size Selector  
**Priority Level:** 2 (Second Module)  
**Status:** [ ] Not Started [ ] In Progress [ ] Complete  
**BMAD Agent Assigned:** **\*\***\_\_\_**\*\***  
**Date Started:** **\*\***\_\_\_**\*\***  
**Date Completed:** **\*\***\_\_\_**\*\***  
**Prerequisite:** Quantity Module MUST be 100% complete

---

## Mission Briefing

The Size Module must operate as a completely independent component. A product with ONLY the size selector enabled (no quantity, paper, turnaround, or any other options) must display perfectly and function without errors. This module handles all dimensional inputs for print products.

## Strict Requirements

### Data Requirements

- **FORBIDDEN:** Mock data, test data, simulated data
- **REQUIRED:** Only real production system data
- **Testing Environment:** Production or staging with real data

### Testing Tools

- Chrome DevTools (Primary browser)
- MCP (System interaction)
- Puppeteer (Automated testing)

---

## Pre-Testing Checklist

### System Preparation

- [ ] Quantity Module certified complete
- [ ] Access to production/staging environment confirmed
- [ ] Chrome browser latest version installed
- [ ] MCP configured and connected
- [ ] Puppeteer environment ready
- [ ] Real size data available in system

### Module Location

- [ ] Size module code identified in codebase
- [ ] Frontend components located: `_______________`
- [ ] Backend handlers located: `_______________`
- [ ] Size calculation logic located: `_______________`
- [ ] Database tables identified: `_______________`
- [ ] API endpoints documented: `_______________`

---

## Testing Protocol

### PHASE 1: Isolation Setup

#### Step 1.1: Create Test Product

```
Product Name: TEST_SIZE_ONLY_[TIMESTAMP]
Enabled Modules: Size ONLY
All other modules: DISABLED (including Quantity)
```

#### Step 1.2: Initial State Documentation

- [ ] Screenshot of product with size only
- [ ] Console log capture (errors/warnings)
- [ ] Network requests logged
- [ ] CSS rendering verified

#### Step 1.3: Size Types Inventory

Document all size input types in system:

```
[ ] Predefined sizes (dropdown)
[ ] Custom width x height
[ ] Standard formats (A4, Letter, etc.)
[ ] Unit selection (inches, cm, mm)
[ ] Orientation (portrait/landscape)
```

---

### PHASE 2: Frontend Testing

#### Display Validation

- [ ] Size selector visible on product page
- [ ] Proper CSS styling applied
- [ ] Width/Height input fields render
- [ ] Unit selector displays
- [ ] Preset size dropdown (if applicable)
- [ ] No layout breaks without other modules

#### Size Input Types Testing

- [ ] Dropdown selection works
- [ ] Custom dimension inputs accept values
- [ ] Unit converter displays correctly
- [ ] Preset sizes load from database
- [ ] Orientation toggle (if applicable)

#### Visual Feedback

- [ ] Selected size displays clearly
- [ ] Invalid sizes show error state
- [ ] Size preview (if implemented)
- [ ] Responsive on all screen sizes
- [ ] Touch-friendly on mobile devices

---

### PHASE 3: Functionality Testing

#### Standard Size Selection

Test with real system sizes:

- [ ] Business Card: **\*\***\_\_\_**\*\***
- [ ] Postcard: **\*\***\_\_\_**\*\***
- [ ] Letter/A4: **\*\***\_\_\_**\*\***
- [ ] Poster sizes: **\*\***\_\_\_**\*\***
- [ ] Banner sizes: **\*\***\_\_\_**\*\***

#### Custom Size Input

- [ ] Width field accepts numeric input
- [ ] Height field accepts numeric input
- [ ] Decimal values handled correctly
- [ ] Unit conversion works (in to cm, etc.)
- [ ] Min/max size limits enforced

#### Validation Testing

- [ ] Negative dimensions rejected
- [ ] Zero dimensions handled
- [ ] Exceeds maximum size alert
- [ ] Below minimum size alert
- [ ] Non-numeric input rejected
- [ ] Aspect ratio warnings (if applicable)

---

### PHASE 4: Backend Testing

#### Data Persistence

- [ ] Size saves to database correctly
- [ ] Width value stored
- [ ] Height value stored
- [ ] Unit type stored
- [ ] Preset size ID stored (if applicable)
- [ ] Orientation stored

#### API Testing

```
GET /api/sizes - Retrieve available sizes
POST /api/product/size - Save selected size
PUT /api/product/size - Update size

Response Validation:
- [ ] Correct status codes
- [ ] Proper error messages
- [ ] Data format validated
```

#### Database Verification

```sql
-- Size Data Verification
SELECT * FROM product_sizes
WHERE product_id = [test_product_id];

Expected fields:
- width: _______________
- height: _______________
- unit: _______________
- preset_id: _______________
```

---

### PHASE 5: Edge Case Testing

#### Boundary Testing

- [ ] Minimum size (e.g., 1" x 1")
- [ ] Maximum size (e.g., 96" x 48")
- [ ] Square dimensions
- [ ] Extreme aspect ratios
- [ ] Common paper sizes

#### Unit Conversion Testing

- [ ] Inches to centimeters
- [ ] Centimeters to millimeters
- [ ] Millimeters to inches
- [ ] Rounding precision maintained
- [ ] Display format consistency

#### Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

---

## Automated Testing Script

### Puppeteer Test Suite

```javascript
// Size Module - Isolated Test
const testSizeModule = async () => {
  // Test 1: Module Renders in Isolation
  // Test 2: Preset Size Selection
  // Test 3: Custom Size Input
  // Test 4: Unit Conversion
  // Test 5: Data Persistence
  // Test 6: Validation Rules
}
```

Test file location: `_______________`
Last run date: `_______________`
Pass/Fail status: `_______________`

---

## Common Size Configurations

### Standard Sizes Database

```
Business Card: 3.5" x 2"
Postcard: 4" x 6"
Flyer: 8.5" x 11"
Poster: 18" x 24"
Banner: 24" x 72"
```

### Test Each Configuration

- [ ] Each size selectable
- [ ] Displays correctly
- [ ] Saves to database
- [ ] No conflicts with isolation

---

## Issues & Fixes Log

### Issue #1

```
Date: _______________
Description: _______________
Root Cause: _______________
Fix Applied: _______________
Verified By: _______________
```

### Issue #2

```
Date: _______________
Description: _______________
Root Cause: _______________
Fix Applied: _______________
Verified By: _______________
```

---

## Final Validation Checklist

### Frontend Validation

- [ ] Displays independently without ANY other modules
- [ ] All size input methods functional
- [ ] Zero console errors
- [ ] Responsive design working
- [ ] Accessible interface

### Backend Validation

- [ ] Size data saves correctly
- [ ] All size formats supported
- [ ] API endpoints functional
- [ ] Database integrity maintained
- [ ] Unit conversions accurate

### Integration Ready

- [ ] Can be added to any product type
- [ ] Can be removed without breaking product
- [ ] No dependencies on other modules
- [ ] Works without quantity module
- [ ] Documentation complete

---

## Sign-Off

### BMAD Agent Certification

```
I certify that the Size Module has been tested in complete isolation
and functions at 100% capacity independently.

Agent Name: _______________
Date: _______________
Signature: _______________
```

### Technical Review

```
Reviewed By: _______________
Date: _______________
Approved: [ ] Yes [ ] No
Comments: _______________
```

---

## Next Module Authorization

**Size Module Status:** [ ] COMPLETE  
**Authorization to proceed to Turnaround Time Module:** [ ] GRANTED  
**Authorized By:** **\*\***\_\_\_**\*\***  
**Date:** **\*\***\_\_\_**\*\***

---

## Appendix

### Screenshots

1. Isolated Size Module Display: [Attach]
2. Custom Size Input Test: [Attach]
3. Preset Size Selection: [Attach]
4. Database Verification: [Attach]
5. Console Clean State: [Attach]

### Related Files

- Frontend Component: `_______________`
- Size Calculator: `_______________`
- Backend Handler: `_______________`
- Database Schema: `_______________`
- API Documentation: `_______________`
- Test Suite: `_______________`
