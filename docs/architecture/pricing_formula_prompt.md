Edit Paper Stock# CRITICAL: Printing Company Base Price Formula Implementation

## EXACT FORMULA REQUIREMENTS - IMMEDIATE CODE REVIEW NEEDED

You MUST review your current code implementation against this EXACT formula logic. Any deviation from this structure is incorrect and must be fixed immediately.

### BASE PRICE FORMULA:

```
Base Price = Base Paper Price × Size × Quantity × Sides Multiplier
```

### CRITICAL IMPLEMENTATION RULES:

#### 1. SIZE CALCULATION (MANDATORY LOGIC)

```
IF user selects "Custom Size" from Print Size dropdown
    THEN Size = Width input × Height input
ELSE
    Size = pre-calculated backend value for selected standard size
```

**EXAMPLES:**

- Customer sees "4x6" → Backend uses 24 (pre-calculated: 4×6=24)
- Customer sees "5x5" → Backend uses 25 (pre-calculated: 5×5=25)
- Customer selects "Custom Size" → Width/Height inputs appear → Backend calculates Width × Height

**CRITICAL:** Standard sizes are pre-calculated on backend, NOT calculated each time.

#### 2. QUANTITY CALCULATION (MANDATORY LOGIC)

```
IF user selects "Custom" from Quantity dropdown
    THEN Quantity = custom quantity input value
ELSE IF selected quantity < 5000 AND adjustment input exists AND adjustment input is not empty
    THEN Quantity = adjustment input value (hidden from customer)
ELSE
    Quantity = selected standard quantity value
```

**PRICING ADJUSTMENT RULES:**

- **Quantities ≥ 5000**: Use exact displayed value
- **Quantities < 5000**: Check for backend adjustment input
  - If adjustment input empty → use displayed quantity
  - If adjustment input has value → use adjustment value for calculation
- **Customer NEVER sees adjustment values** - frontend shows original, backend uses adjustment

**EXAMPLE:**

- Frontend displays: 200 quantity
- Backend adjustment field: 250
- Calculation uses: 250 (customer sees 200, pays based on 250)

#### 3. SIDES MULTIPLIER (PAPER-DEPENDENT LOGIC)

```
IF Paper Type is Exception Type (e.g., Text Paper)
    IF Sides selection = "Double Sided (4/4)"
        THEN Sides Multiplier = 1.75
    ELSE
        Sides Multiplier = 1.0
ELSE (for most paper types like Cardstock)
    Sides Multiplier = 1.0 (regardless of single or double-sided)
```

#### 4. CUSTOM OPTIONS VISIBILITY

- Custom Size and Custom Quantity can be **disabled per product**
- If disabled → "Custom" option does NOT appear in dropdown
- Check product settings before showing custom options

### EXAMPLE CALCULATION VERIFICATION:

```
Paper Stock Price = 0.00145833333
Size = 24 (from 4×6 standard OR 4×6 custom calculation)
Quantity = 5000
Sides Multiplier = 1.0

Base Price = 0.00145833333 × 24 × 5000 × 1.0 = 175
```

### IMMEDIATE ACTION REQUIRED:

**REVIEW YOUR CURRENT CODE NOW:**

1. ✅ Does your size calculation use pre-calculated values for standard sizes?
2. ✅ Does your quantity logic include backend adjustment fields for quantities < 5000?
3. ✅ Are customers seeing adjustment quantities (they shouldn't)?
4. ✅ Do custom options check if they're enabled per product?
5. ✅ Does your sides multiplier logic match the paper-dependent rules?

### CODE UPDATE CHECKLIST:

- [ ] Standard sizes use backend pre-calculated values (not real-time calculation)
- [ ] Quantity adjustment logic implemented for < 5000 quantities
- [ ] Adjustment quantities hidden from frontend display
- [ ] Custom options visibility controlled by product settings
- [ ] Sides multiplier only applies to specific paper types
- [ ] Formula multiplication order: Base Paper Price × Size × Quantity × Sides Multiplier

**IF ANY OF THESE ARE INCORRECT IN YOUR CODE, YOU MUST UPDATE IMMEDIATELY.**

This is the foundation - all add-on pricing will build on top of this base calculation. The base must be perfect before proceeding.
