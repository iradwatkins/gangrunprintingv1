# Product Modules - Testing Checklist

## 🧪 Manual Testing Checklist

### Pre-Testing Setup

- [ ] Ensure application is running (`npm run dev`)
- [ ] Navigate to a product detail page
- [ ] Open browser DevTools Console
- [ ] Clear any cached data

### Module 1: Quantity Module Testing

#### Standard Quantities

- [ ] Verify dropdown shows standard quantities (25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000)
- [ ] Select each standard quantity
- [ ] Verify price updates when quantity changes
- [ ] Check that selected quantity persists when changing other options

#### Custom Quantities

- [ ] Select "Custom..." option
- [ ] Verify custom input field appears
- [ ] Test minimum value (55,000) - should accept
- [ ] Test below minimum (54,999) - should show error
- [ ] Test maximum value (100,000) - should accept
- [ ] Test above maximum (100,001) - should show error
- [ ] Test non-numeric input - should show error
- [ ] Verify number formatting (commas) displays correctly

### Module 2: Size Module Testing

#### Standard Sizes

- [ ] Verify dropdown shows all standard sizes
- [ ] Select each standard size option
- [ ] Verify size name and dimensions display correctly
- [ ] Check that selected size persists when changing other options

#### Custom Sizes

- [ ] Select "Custom..." option
- [ ] Verify width and height input fields appear
- [ ] Test 0.25" increments (4.25, 5.50, 8.75) - should accept
- [ ] Test non-0.25" increments (4.3, 5.67) - should show error message
- [ ] Test minimum dimensions - should validate
- [ ] Test maximum dimensions - should validate
- [ ] Verify both width and height are required

#### Exact Size Option

- [ ] Check "Exact size required" checkbox
- [ ] Verify checkbox state persists
- [ ] Uncheck and verify state changes

### Module 3: Paper Stock Module Testing

#### Paper Selection

- [ ] Verify all paper stock options appear in dropdown
- [ ] Select each paper type
- [ ] Verify paper weight displays (14pt, 16pt, etc.)
- [ ] Check tooltips show paper descriptions

#### Coating Selection

- [ ] Verify coating options update based on selected paper
- [ ] Select each coating option (Matte, Gloss, UV, Uncoated)
- [ ] Verify default coating is pre-selected
- [ ] Check that unavailable coatings are disabled

#### Sides Selection

- [ ] Verify sides options (Single-sided, Double-sided)
- [ ] Select each sides option
- [ ] Verify price multiplier displays for double-sided
- [ ] Check that changing paper updates available sides

#### Cascade Logic

- [ ] Change paper type
- [ ] Verify coating automatically updates to default for new paper
- [ ] Verify sides automatically updates if needed
- [ ] Confirm no invalid combinations are possible

### Module 4: Addons Module Testing

#### Addon Selection

- [ ] Verify addon accordion/dropdown appears
- [ ] Expand addon section
- [ ] Select various addons
- [ ] Verify addon prices display correctly
- [ ] Deselect addons and verify removal

#### Special Addon Configurations

**Variable Data:**

- [ ] Enable variable data addon
- [ ] Enter number of locations
- [ ] Specify location details
- [ ] Verify configuration persists

**Perforation:**

- [ ] Enable perforation addon
- [ ] Set vertical perforation count and position
- [ ] Set horizontal perforation count and position
- [ ] Verify settings are saved

**Banding:**

- [ ] Enable banding addon
- [ ] Select banding type
- [ ] Set items per bundle
- [ ] Verify configuration updates

**Corner Rounding:**

- [ ] Enable corner rounding
- [ ] Select corner type (2 corners, 4 corners)
- [ ] Verify selection persists

### Module 5: Turnaround Module Testing

#### Turnaround Selection

- [ ] Verify all turnaround options display
- [ ] Select Rush option - verify price increase
- [ ] Select Standard option - verify base pricing
- [ ] Select Economy option - verify discount (if applicable)

#### Coating Restrictions

- [ ] Select turnaround requiring "No Coating"
- [ ] Verify coating automatically changes to "No Coating"
- [ ] Verify user cannot select other coatings

#### Delivery Estimation

- [ ] Select each turnaround option
- [ ] Verify estimated delivery date displays
- [ ] Check that weekends are excluded from business days
- [ ] Verify date format is correct

### Integration Testing

#### Module Communication

- [ ] Change quantity - verify price updates across all modules
- [ ] Change size - verify compatible paper stocks
- [ ] Change paper - verify coating/sides update
- [ ] Add addons - verify total price includes addon costs
- [ ] Change turnaround - verify final price includes rush fees

#### Price Calculation

- [ ] Verify base price displays correctly
- [ ] Add quantity - price should scale
- [ ] Add custom size - price should adjust
- [ ] Select premium paper - price should increase
- [ ] Add multiple addons - each should add to price
- [ ] Select rush turnaround - premium should apply
- [ ] Verify final price = base + all adjustments

#### Data Persistence

- [ ] Make selections in all modules
- [ ] Navigate away from page
- [ ] Return to page
- [ ] Verify all selections are maintained

### Error Handling

#### Network Errors

- [ ] Disable network
- [ ] Try to load configuration
- [ ] Verify error message displays
- [ ] Re-enable network
- [ ] Verify retry functionality works

#### Invalid Data

- [ ] Test with missing configuration data
- [ ] Test with invalid API responses
- [ ] Verify graceful degradation
- [ ] Check error boundaries work

### Accessibility Testing

#### Keyboard Navigation

- [ ] Tab through all modules
- [ ] Use arrow keys in dropdowns
- [ ] Use space/enter to select options
- [ ] Verify focus indicators are visible

#### Screen Reader

- [ ] Test with screen reader enabled
- [ ] Verify all labels are read correctly
- [ ] Check ARIA attributes work
- [ ] Verify error messages are announced

### Performance Testing

#### Load Times

- [ ] Measure initial configuration load time (< 2s)
- [ ] Measure module interaction response time (< 100ms)
- [ ] Check for any lag when selecting options
- [ ] Verify no memory leaks with repeated interactions

#### Large Data Sets

- [ ] Test with many paper stock options
- [ ] Test with many addon options
- [ ] Verify scrolling performance in dropdowns
- [ ] Check that searching/filtering works (if implemented)

## 🐛 Bug Report Template

If you find an issue, document it as follows:

```
Module: [Which module has the issue]
Steps to Reproduce:
1. [First step]
2. [Second step]
3. [etc...]

Expected Behavior:
[What should happen]

Actual Behavior:
[What actually happens]

Browser/Environment:
- Browser: [Chrome/Firefox/Safari/Edge]
- Version: [Browser version]
- OS: [Operating system]

Screenshots/Console Errors:
[Attach if applicable]
```

## ✅ Sign-off Checklist

### Development Complete

- [x] All modules created with consistent structure
- [x] TypeScript interfaces defined
- [x] Hooks implemented for external use
- [x] Documentation written
- [x] README files created

### Testing Complete

- [ ] All manual tests passed
- [ ] Integration tests passed
- [ ] Accessibility verified
- [ ] Performance acceptable
- [ ] No console errors

### Ready for Production

- [ ] Code reviewed
- [ ] Tests automated (if applicable)
- [ ] Documentation updated
- [ ] Deployment plan created
- [ ] Rollback plan prepared

---

**Tester**: **\*\*\*\***\_**\*\*\*\***
**Date**: **\*\*\*\***\_**\*\*\*\***
**Version**: 1.0.0
**Status**: [ ] Passed [ ] Failed [ ] Partial

**Notes**:

---

---

---
