# GangRun Printing - Complete Addon Options Guide

## Overview

The GangRun Printing system offers a comprehensive set of addon options that enhance printed products with various finishing, delivery, and service options. Each addon has its own pricing model and calculation methodology.

## Pricing Models

### 1. **FLAT** - Fixed Fee
- Single fixed price regardless of quantity or configuration
- Applied as a one-time charge

### 2. **PERCENTAGE** - Percentage-Based
- Calculated as a percentage of base price or total
- Can apply to different price points (base, adjusted, or total)

### 3. **PER_UNIT** - Per Unit/Piece Pricing
- Cost multiplied by quantity
- May include setup fees

### 4. **CUSTOM** - Complex Pricing Logic
- Combination of setup fees, per-piece costs, and conditional pricing
- May vary based on product specifications

---

## Complete Addon List

### 1. **Our Tagline** 📢
- **Type**: Discount Addon
- **Pricing Model**: PERCENTAGE
- **Calculation**: 5% discount on Base Paper Print Price
- **Formula**: `Discount = Base_Paper_Print_Price × 0.05`
- **Special Conditions**:
  - Hidden when broker discount is applied
  - Only applies to non-broker customers
- **Impact**: Reduces the Adjusted Base Price

---

### 2. **Exact Size** 📐
- **Type**: Precision Cutting
- **Pricing Model**: PERCENTAGE
- **Calculation**: 12.5% markup on Adjusted Base Price
- **Formula**: `Markup = Adjusted_Base_Price × 0.125`
- **Description**: Ensures precise cutting to exact dimensions
- **Turnaround Impact**: May add production time
- **Applied After**: Broker/Tagline discounts
- **Applied Before**: Turnaround markup

---

### 3. **Digital Proof** 🖼️
- **Type**: Proofing Service
- **Pricing Model**: FLAT
- **Price**: $5.00
- **Description**: Digital proof sent before production
- **Includes**: PDF proof via email
- **Turnaround**: Usually adds 1 business day

---

### 4. **Perforation** ✂️
- **Type**: Finishing Option
- **Pricing Model**: CUSTOM
- **Base Price**: $20.00 (setup fee) OR $25.00 (new pricing)
- **Per-Piece Cost**: $0.01/piece OR $0.005/piece (new pricing)
- **Formula**: `Cost = $20.00 + ($0.01 × quantity)`
- **Alternative Formula**: `Cost = $25.00 + ($0.005 × quantity)`
- **Configuration Options**:
  - **Orientation**: Vertical, Horizontal, or Both
  - **Position**: Custom placement specification
- **Use Cases**: Tickets, coupons, tear-off sections
- **Additional Fields**:
  - Vertical Count (number of vertical perforations)
  - Horizontal Count (number of horizontal perforations)
  - Position specifications for each perforation

---

### 5. **Score Only** 📏
- **Type**: Finishing Option
- **Pricing Model**: CUSTOM
- **Base Price**: $17.00 (setup fee)
- **Per-Score Cost**: $0.01 per score per piece
- **Formula**: `Cost = $17.00 + ($0.01 × number_of_scores × quantity)`
- **Description**: Creates fold lines without cutting
- **Configuration**:
  - Number of scores required
  - Position of each score line
- **Use Cases**: Greeting cards, folders, brochures

---

### 6. **Folding** 📄
- **Type**: Finishing Option
- **Pricing Model**: CUSTOM
- **Pricing Structure**:

  **Text Paper (Lightweight)**:
  - Setup: $0.17
  - Per Piece: $0.01
  - Formula: `Cost = $0.17 + ($0.01 × quantity)`

  **Card Stock (Heavyweight)**:
  - Setup: $0.34
  - Per Piece: $0.02
  - Formula: `Cost = $0.34 + ($0.02 × quantity)`
  - Note: Includes mandatory basic score

- **Fold Types Available**:
  - Half Fold
  - Tri-Fold
  - Z-Fold
  - Gate Fold
  - Double Parallel Fold
  - Custom folding patterns

---

### 7. **Design Services** 🎨
- **Type**: Professional Service
- **Pricing Model**: CUSTOM/FLAT
- **Service Options**:

  **Upload Artwork**: $0 (customer provides)

  **Standard Custom Design**:
  - One Side: Variable (uses PRICING.DESIGN_COST_ONE_SIDE)
  - Two Sides: Variable (uses PRICING.DESIGN_COST_TWO_SIDE)
  - Turnaround: 2-3 business days

  **Rush Custom Design**:
  - One Side: Variable (uses PRICING.BUSINESS_CARD_DESIGN_ONE_SIDE)
  - Two Sides: Variable (uses PRICING.BUSINESS_CARD_DESIGN_TWO_SIDE)
  - Turnaround: 24 hours

  **Design Changes**:
  - Minor Changes: $22.50
  - Major Changes: $45.00

- **Additional Options**:
  - Basic Touch-up: $25.00
  - Layout Design: $150.00
  - Full Design Package: $300.00

---

### 8. **Banding** 🎀
- **Type**: Bundling Service
- **Pricing Model**: CUSTOM
- **Base Price**: $15.00
- **Per-Bundle Cost**: $0.75 OR $2.00 (depending on configuration)
- **Formula**: `Cost = $15.00 + ($2.00 × number_of_bundles)`
- **Alternative Formula**: `Cost = number_of_bundles × $0.75`
- **Bundle Calculation**: `bundles = Math.ceil(quantity / items_per_bundle)`
- **Default Items Per Bundle**: 100 (configurable)
- **Band Types**:
  - Paper Band
  - Rubber Band
- **Use Cases**: Organization of multiple pieces, bulk delivery

---

### 9. **Shrink Wrapping** 📦
- **Type**: Packaging Service
- **Pricing Model**: CUSTOM
- **Per-Bundle Cost**: $0.30
- **Formula**: `Cost = number_of_bundles × $0.30`
- **Bundle Calculation**: `bundles = Math.ceil(quantity / items_per_bundle)`
- **Default Items Per Bundle**: 100 (configurable)
- **Description**: Protective plastic wrapping for bundles
- **Benefits**: Weather protection, tamper evidence

---

### 10. **QR Code** 📱
- **Type**: Digital Integration
- **Pricing Model**: FLAT
- **Price**: $5.00
- **Description**: Add custom QR code to design
- **Configuration**:
  - Content/URL to encode
  - Size and placement
- **Use Cases**: Digital engagement, tracking, contactless information

---

### 11. **Postal Delivery (DDU)** 📮
- **Type**: Shipping Service
- **Pricing Model**: CUSTOM
- **Price Per Box**: $30.00
- **Formula**: `Cost = number_of_boxes × $30.00`
- **Description**: Delivery Duties Unpaid postal service
- **Box Capacity**: Varies by product size
- **Service**: Direct to post office delivery

---

### 12. **EDDM Process & Postage** 📬
- **Type**: Mail Service
- **Pricing Model**: CUSTOM
- **Setup Fee**: $50.00
- **Per-Piece Cost**: $0.239
- **Formula**: `Cost = $50.00 + ($0.239 × quantity)`
- **Description**: Every Door Direct Mail processing
- **Includes**:
  - Route selection assistance
  - USPS paperwork
  - Mandatory banding (included in price)
- **Route Options**:
  - US Select (system selects routes)
  - Customer Provides (customer specifies routes)

---

### 13. **Hole Drilling** 🔲
- **Type**: Finishing Option
- **Pricing Model**: CUSTOM
- **Base Setup Fee**: $20.00
- **Per-Piece Pricing**:

  **Custom Holes**:
  - Cost: $0.02 per hole per piece
  - Formula: `Cost = $20.00 + ($0.02 × number_of_holes × quantity)`

  **Binder Punch**:
  - Cost: $0.01 per piece
  - Formula: `Cost = $20.00 + ($0.01 × quantity)`
  - Options: 2-hole, 3-hole punch

- **Configuration**:
  - Hole type (custom or binder)
  - Number of holes (for custom)
  - Hole size specification
  - Position specification

- **Alternative Pricing** (from seed data):
  - Price per hole: $0.10
  - Positions: Top Center, Top Corners, 3-Hole Punch, Custom

---

### 14. **Variable Data Printing** 🔢
- **Type**: Personalization Service
- **Pricing Model**: CUSTOM
- **Base Price**: $60.00
- **Per-Piece Cost**: $0.02
- **Formula**: `Cost = $60.00 + ($0.02 × quantity)`
- **Capabilities**:
  - Name Personalization
  - Sequential Numbering
  - Unique QR Codes
  - Custom Addresses
  - Unique Promo Codes
- **Configuration Fields**:
  - Number of variable locations
  - Data field specifications
  - CSV file upload for data

---

### 15. **Corner Rounding** ⭕
- **Type**: Finishing Option
- **Pricing Model**: CUSTOM
- **Base Price**: $20.00 OR $25.00 (varies by configuration)
- **Per-Piece Cost**: $0.01 OR $0.02
- **Formula**: `Cost = $25.00 + ($0.02 × quantity)`
- **Corner Options**:
  - All Four Corners
  - Top Two Corners
  - Bottom Two Corners
  - Custom Selection
- **Radius**: Standard 1/8" or 1/4" radius
- **Popular For**: Business cards, postcards, tags

---

### 16. **Numbering** 🔢
- **Type**: Sequential Identification
- **Pricing Model**: PER_UNIT
- **Price Structure**: Variable based on quantity and complexity
- **Description**: Sequential numbering for tracking
- **Use Cases**:
  - Tickets
  - Invoices
  - Raffle tickets
  - Inventory tracking

---

## Pricing Calculation Flow

### Order of Operations:

1. **Base Paper Print Price**
   ```
   Base_Price = Quantity × Area × Paper_Price_Per_SqInch × Sides_Factor
   ```

2. **Adjusted Base Price**
   - Apply Broker Discount OR "Our Tagline" discount (mutually exclusive)
   ```
   If Broker: Adjusted = Base × (1 - Broker_Discount%)
   Else If Our Tagline: Adjusted = Base - (Base × 5%)
   ```

3. **Base Percentage Modifiers**
   - Apply "Exact Size" markup if selected
   ```
   If Exact Size: Modified = Adjusted + (Adjusted × 12.5%)
   ```

4. **Turnaround Markup**
   ```
   After_Turnaround = Modified × (1 + Turnaround_Markup%)
   ```

5. **Discrete Add-ons**
   - Sum all selected discrete addon costs
   ```
   Total_Addons = Sum of all addon calculations
   ```

6. **Final Subtotal**
   ```
   Subtotal = After_Turnaround + Total_Addons
   ```

---

## Addon Display Positions

Addons can be displayed in three positions on the product configuration page:

### **ABOVE_DROPDOWN**
- Priority addons shown prominently above the main dropdown
- Typically includes most commonly selected options
- Examples: Digital Proof, Corner Rounding

### **IN_DROPDOWN**
- Standard addons shown in the main dropdown selector
- Bulk of available options
- User expands to see and select

### **BELOW_DROPDOWN**
- Special addons shown below the main selection area
- Often includes complex configurational addons
- Examples: Variable Data, EDDM Services

---

## Addon Sets

Different products can have different addon sets assigned to them:

1. **Premium Business Card Add-ons**
   - Rounded Corners
   - Foil Stamping
   - Spot UV
   - Lamination

2. **Marketing Materials Add-ons**
   - Perforation
   - Folding
   - Variable Data
   - EDDM Services

3. **Finishing Options**
   - Folding
   - Scoring
   - Perforation
   - Hole Drilling

4. **Packaging & Delivery**
   - Banding
   - Shrink Wrapping
   - Postal Delivery

5. **Design Services**
   - Design Creation
   - Digital Proof
   - QR Code Generation

6. **Large Format Add-ons**
   - Special coatings
   - Mounting options

7. **EDDM Services**
   - EDDM Processing
   - Postal Services

8. **Rush Production**
   - Expedited turnaround options

---

## Special Conditions & Business Rules

### Mutual Exclusivity
- **Broker Discount** and **"Our Tagline"** discount cannot be applied together
- If broker has discount, "Our Tagline" option is hidden

### Mandatory Combinations
- **EDDM Service** automatically includes banding
- **Card Stock Folding** includes mandatory basic score

### Progressive Pricing
- Many addons use base + per-unit pricing
- Economies of scale for bulk quantities

### Turnaround Impact
- Some addons add additional production days:
  - Digital Proof: +1 day
  - Design Services: +1-3 days
  - Complex finishing: Variable

### Configuration Dependencies
- Some addons reveal additional options when selected
- Example: Corner Rounding reveals corner selection dropdown
- Example: Variable Data reveals field configuration options

---

## Implementation Details

### Database Schema
- **AddOn** table stores base addon information
- **AddOnSet** groups addons for different product types
- **AddOnSetItem** links addons to sets with display positions
- **AddOnSubOption** stores configurable options for complex addons

### Frontend Components
- `AddonAccordion.tsx` - Main addon selection interface
- `SimpleAddonSelector.tsx` - Simplified addon picker
- Specialized components for complex addons:
  - `VariableDataSection.tsx`
  - `PerforationSection.tsx`
  - `CornerRoundingSection.tsx`
  - `BandingSection.tsx`

### Pricing Engine
- `pricing-engine.ts` - Core pricing calculations
- `pricing-calculator.ts` - Helper functions for addon pricing
- `pricing.ts` (utils) - Specific addon price calculators

---

## Notes for Developers

1. **Always check configuration type** before calculating prices
2. **Handle null/undefined** values with appropriate defaults
3. **Round monetary values** to 2 decimal places
4. **Cache calculations** when quantity changes for performance
5. **Validate addon combinations** before submission
6. **Test edge cases** like zero quantity, maximum quantities

---

## Future Enhancements

- Dynamic pricing based on market conditions
- Bulk discount tiers for addons
- Seasonal addon promotions
- Custom addon builder for enterprise clients
- AI-powered addon recommendations
- Real-time pricing updates via WebSocket

---

*Last Updated: 2025*
*Version: 1.0*