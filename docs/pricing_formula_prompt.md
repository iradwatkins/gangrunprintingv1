# CRITICAL: Printing Company Base Price Formula Implementation

## EXACT FORMULA REQUIREMENTS

You MUST implement the base pricing calculation using this EXACT formula logic. Any deviation from this structure is incorrect and must be fixed.

### BASE PRICE FORMULA:

```
Base Price = Base Paper Price × Size × Quantity × Sides Multiplier
```

### CRITICAL IMPLEMENTATION RULES:

#### 1. SIZE CALCULATION (MANDATORY LOGIC)

```
IF user selects "Custom" from Print Size dropdown
    THEN Size = Width input × Height input
ELSE
    Size = the selected standard size value from dropdown
```

- **ONLY** use Width × Height when "Custom" is specifically selected
- **NEVER** default to custom size calculation
- Standard sizes have predetermined values - use those exact values

#### 2. QUANTITY CALCULATION (MANDATORY LOGIC)

```
IF user selects "Custom" from Quantity dropdown
    THEN Quantity = value from Custom Quantity input field
ELSE
    Quantity = the selected standard quantity value from dropdown
```

- **ONLY** use custom quantity input when "Custom" is specifically selected
- **NEVER** default to custom quantity calculation
- Standard quantities have predetermined values - use those exact values

#### 3. SIDES MULTIPLIER (PAPER-DEPENDENT LOGIC)

```
IF Paper Type is an Exception Type (e.g., Text Paper)
    IF Sides selection = "Double Sided (4/4)"
        THEN Sides Multiplier = 1.75
    ELSE
        Sides Multiplier = 1.0
ELSE (for most paper types like Cardstock)
    Sides Multiplier = 1.0 (regardless of single or double-sided)
```

#### 4. BASE PAPER PRICE

- Each paper type has a specific base rate per unit size
- This is multiplied by all other factors in the formula

### IMPLEMENTATION VERIFICATION CHECKLIST:

- [ ] Size calculation ONLY uses Width × Height when dropdown = "Custom"
- [ ] Quantity calculation ONLY uses custom input when dropdown = "Custom"
- [ ] Standard dropdown selections use their predetermined values
- [ ] Sides multiplier defaults to 1.0 for most papers
- [ ] Sides multiplier = 1.75 for double-sided exception papers only
- [ ] All four variables multiply together in exact order: Base Paper Price × Size × Quantity × Sides Multiplier

### COMMON ERRORS TO FIX:

- ❌ Always using custom size calculation regardless of dropdown selection
- ❌ Always using custom quantity regardless of dropdown selection
- ❌ Applying sides multiplier to all paper types
- ❌ Using wrong multiplication order or missing variables
- ❌ Not checking dropdown values before applying custom logic

### TESTING REQUIREMENTS:

Test these scenarios to verify correct implementation:

1. Standard size + Standard quantity + Single-sided cardstock
2. Custom size + Standard quantity + Double-sided text paper
3. Standard size + Custom quantity + Single-sided cardstock
4. Custom size + Custom quantity + Double-sided cardstock (multiplier should = 1.0)

**This formula logic is non-negotiable. If your current code doesn't match this exact structure, it must be updated immediately.**
