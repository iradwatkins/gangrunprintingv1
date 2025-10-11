# Story 3.6: Simplified 3-Step Checkout Flow

**Epic:** 3 - Checkout & Payment System
**Status:** InProgress
**Priority:** P0 - Critical
**Assignee:** Development Team
**Created:** 2025-10-11
**Updated:** 2025-10-11

---

## 📋 Overview

Redesign the checkout flow from a **4-step process** to a **simplified 3-step process** based on proven UX patterns from high-converting print e-commerce sites. The current checkout hides critical payment information until the final step, creating friction and reducing conversion rates.

**Current Flow (4 Steps):**
```
Information → Shipping → Payment Method Selection → Review & Pay
```

**New Flow (3 Steps):**
```
Order Summary → Shipping Method → Payment
```

---

## 🎯 Goals

### Primary Goals
1. **Reduce checkout friction** - 4 steps → 3 steps = 25% fewer clicks
2. **Show payment forms immediately** - No hiding card inputs until review step
3. **Improve price transparency** - Clear shipping cost comparison
4. **Add missing features** - Order notes, coupon codes, collapsible summary

### Success Metrics
- [ ] Checkout completion time reduced by 30%
- [ ] Cart abandonment rate decreased
- [ ] Customer satisfaction increased (fewer "where's payment?" support tickets)
- [ ] Mobile checkout conversion improved

---

## 🔍 Problem Statement

### Current Issues

**❌ Problem 1: Too Many Steps (4 Steps)**
- Users must click through 4 separate screens
- Information and shipping address are separate steps
- Payment method selection and actual payment are separate steps
- Creates unnecessary friction

**❌ Problem 2: Payment Form Hidden**
- User selects "Credit Card" on step 3
- Form doesn't appear until step 4 (Review)
- Creates confusion and mistrust
- Users can't see what information they'll need to provide

**❌ Problem 3: Order Summary Takes Up Space**
- Sticky sidebar always visible on right
- Takes up valuable screen space
- Not collapsible
- Poor mobile experience

**❌ Problem 4: Missing Features**
- No order notes field (customers can't add special instructions)
- Coupon code field may not be prominent
- No "Change" links on final step to quickly edit info
- Shipping prices not aligned for easy comparison

**❌ Problem 5: Unclear Shipping Costs**
- Users may not easily compare shipping prices
- Need right-aligned prices for quick scanning

---

## 💡 Solution

### New 3-Step Checkout Flow

#### **Step 1: Order Summary**
**Purpose:** Quick overview of what's being ordered

**Components:**
- Progress indicator showing "Step 1 of 3"
- Collapsible product details card
  - Product thumbnail/icon
  - Product name and SKU
  - Quantity
  - All selected options (size, paper, coating, sides, etc.)
  - Turnaround time
  - Addons (if any)
  - Price breakdown:
    - Subtotal
    - Shipping: "TBD"
    - Tax
    - Total
- Upload status (if files uploaded)
- Big "Continue to Shipping" button
- "« Back to Cart" link

**Visual Reference:**
- Collapsible card similar to UVCoatedClubFlyers Step 2
- Clean, minimal design
- Order summary can collapse/expand with toggle

---

#### **Step 2: Shipping Method**
**Purpose:** Collect shipping info and select shipping method in ONE step

**Components:**

1. **Collapsible Order Summary (Top)**
   ```
   [▼ Show Order Summary]               $222.01
   ```
   When expanded, shows full product details + price breakdown

2. **Contact Information Section**
   - 📧 Email address *
   - 📱 Phone number *
   - 👤 First name *
   - 👤 Last name *
   - 🏢 Company (optional)

3. **Shipping Address Section**
   - 📍 Street address *
   - 🏙️ City *
   - 🏛️ State * (2-letter, e.g., TX)
   - 🏤 ZIP code *
   - 🌍 Country (default: US)

4. **Shipping Options Section**
   - Display message: "Shipping to: [Name], [Address]"
   - **Shipping method radio buttons:**
     ```
     ● FedEx Ground Home Delivery           $61.46
     ○ Southwest Cargo Pickup                $80.00
     ○ Southwest Cargo Pickup (Express)      $95.00
     ○ FedEx 2Day                           $205.60
     ○ FedEx First Overnight                $545.95
     ```
   - **Prices must be aligned right for easy scanning**
   - Estimated delivery days shown for each option
   - Airport selector (if applicable)

5. **Additional Fields**
   - Coupon code input (with "Apply" button)
   - Order notes textarea (optional)
     - Placeholder: "Add any special instructions for your order..."

6. **Action Buttons**
   - "« Back" button (left)
   - Big red "NEXT PAYMENT OPTIONS →" button (right)

**Visual Reference:**
- See UVCoatedClubFlyers Step 2 (Image 2 & 3)
- Shipping prices aligned right
- Clean form layout
- Clear section headers

---

#### **Step 3: Payment**
**Purpose:** Review order and complete payment in ONE step

**Components:**

1. **Collapsible Order Summary (Top)**
   ```
   [▼ Hide Order Summary ▲]             $222.01
   ```
   - Expanded by default on page load
   - Shows full product details + price breakdown
   - User can collapse to save space

2. **Review Section (Editable)**
   ```
   ┌──────────────────────────────────────┐
   │ Email:  iradwatkins@gmail.com [Change] │
   │ Phone:  (404) 868-2401        [Change] │
   │ Name:   Ira Watkins           [Change] │
   │ Method: FedEx Ground Delivery [Change] │
   └──────────────────────────────────────┘
   ```
   - Clicking "Change" links takes user back to Step 2

3. **Order Notes Display (if provided)**
   ```
   ┌──────────────────────────────────────┐
   │ Order Notes                          │
   │ If you have anything you would like  │
   │ to add about your order...           │
   └──────────────────────────────────────┘
   ```

4. **Complete Payment Section**
   ```
   Complete Payment

   Order Total: $222.01
   ```

5. **Payment Information Section**
   ```
   Payment Information
   All transactions are secure and encrypted.
   ```

   **Payment Method Tabs/Radio Buttons:**

   **● Credit Card (Default Selected)**
   ```
   [💳 Card icons: Visa MC Amex Discover UnionPay]

   Pay securely using your credit card.

   [💳 Card number input field              ]
   [📅 MM/YY]  [🔒 CVV]
   ```
   - **IMPORTANT:** Card form VISIBLE immediately when Credit Card is selected
   - Uses Square card form (already implemented in SquareCardPayment component)

   **○ PayPal**
   ```
   [PayPal checkout button]
   ```
   - Shows PayPal button when selected

   **○ Cash App Pay**
   ```
   [Cash App Pay button]
   ```
   - Shows Cash App Pay button when selected

   **○ Test Gateway (DEV ONLY)**
   ```
   [Test Payment button]
   ```
   - Shows test payment button when selected

6. **Privacy & Terms**
   ```
   Your personal data will be used to process your order,
   support your experience throughout this website, and for
   other purposes described in our privacy policy.

   ☐ I have read and agree to the website terms and conditions *
   ```

7. **Action Buttons**
   ```
   [« Return to Shipping Options]

   [🔒 PLACE ORDER NOW $222.01]
   ```
   - Big red button, full width
   - Shows lock icon + total price

8. **Trust Badges (Bottom)**
   ```
   [🔒 McAfee Secure]  [✓ Norton Secured]

   ✓ 256-Bit Bank Level Security
   ✓ 100% Secure Payments
   ```

**Visual Reference:**
- See UVCoatedClubFlyers Step 3 (Image 4)
- Payment form visible immediately
- Clear review section with Change links
- Big action button

---

## 🏗️ Technical Implementation

### Phase 1: Update Step Structure

**File:** `/src/app/(customer)/checkout/page.tsx`

**Changes:**

1. **Update STEPS array** (lines 56-65):
```typescript
const STEPS: {
  id: CheckoutStep
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { id: 'order-summary', label: 'Order Summary', icon: Package2 },
  { id: 'shipping', label: 'Shipping Method', icon: Truck },
  { id: 'payment', label: 'Payment', icon: CreditCard },
]
```

2. **Update CheckoutStep type** (line 54):
```typescript
type CheckoutStep = 'order-summary' | 'shipping' | 'payment'
```

3. **Set initial step to 'order-summary'** (line 72):
```typescript
const [currentStep, setCurrentStep] = useState<CheckoutStep>('order-summary')
```

### Phase 2: Implement Step 1 (Order Summary)

**New section in render (after line 608):**

```typescript
{/* Step 1: Order Summary */}
{currentStep === 'order-summary' && (
  <div className="p-8">
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-2">Order Summary</h2>
      <p className="text-sm text-gray-600">
        Review your order before proceeding to checkout
      </p>
    </div>

    {/* Product Details Card */}
    <div className="bg-gray-50 rounded-lg p-6 mb-6">
      <div className="flex items-start gap-4">
        {/* Product Icon/Image */}
        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>

        {/* Product Info */}
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2">{currentItem.productName}</h3>

          {/* Product Options Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span className="text-gray-500">QUANTITY:</span>{' '}
              <span className="font-medium">{currentItem.quantity}</span>
            </div>
            {currentItem.options.size && (
              <div>
                <span className="text-gray-500">SIZE:</span>{' '}
                <span className="font-medium">{currentItem.options.size}</span>
              </div>
            )}
            {currentItem.options.paperStock && (
              <div>
                <span className="text-gray-500">PAPER:</span>{' '}
                <span className="font-medium">{currentItem.options.paperStock}</span>
              </div>
            )}
            {currentItem.options.sides && (
              <div>
                <span className="text-gray-500">SIDES:</span>{' '}
                <span className="font-medium">{currentItem.options.sides}</span>
              </div>
            )}
            {currentItem.options.coating && (
              <div>
                <span className="text-gray-500">COATING:</span>{' '}
                <span className="font-medium">{currentItem.options.coating}</span>
              </div>
            )}
            {currentItem.options.turnaround && (
              <div>
                <span className="text-gray-500">TURNAROUND:</span>{' '}
                <span className="font-medium">{currentItem.options.turnaround}</span>
              </div>
            )}
          </div>

          {/* Addons */}
          {currentItem.addons && currentItem.addons.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-sm">
                <span className="text-gray-500">ADDONS:</span>{' '}
                <span className="font-medium">
                  {currentItem.addons.map(a => a.name).join(', ')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            ${subtotal.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping:</span>
            <span className="font-medium text-gray-400">TBD</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax:</span>
            <span className="font-medium">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-300">
            <span className="font-semibold">Total:</span>
            <span className="font-bold text-lg">${(subtotal + tax).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Uploaded Files */}
    {uploadedImages.length > 0 && (
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <p className="text-sm font-medium mb-2 flex items-center gap-2">
          <Check className="h-4 w-4 text-green-600" />
          Design Files Uploaded ({uploadedImages.length})
        </p>
        <div className="grid grid-cols-4 gap-2">
          {uploadedImages.map((img) => (
            <div
              key={img.id}
              className="relative aspect-square rounded border bg-white overflow-hidden"
            >
              <Image
                fill
                alt={img.fileName}
                className="object-contain p-1"
                src={img.thumbnailUrl || img.url}
              />
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Navigation Buttons */}
    <div className="flex justify-between pt-6 border-t">
      <Link href="/cart">
        <Button size="lg" type="button" variant="outline">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Cart
        </Button>
      </Link>
      <Button
        className="min-w-[200px]"
        size="lg"
        type="button"
        onClick={handleNextStep}
      >
        Continue to Shipping
        <ChevronRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  </div>
)}
```

### Phase 3: Update Step 2 (Combine Information + Shipping)

**Modify existing shipping step (lines 788-859):**

1. **Add contact fields before shipping address**
2. **Add coupon code field**
3. **Add order notes textarea**
4. **Update button text to "NEXT PAYMENT OPTIONS →"**

**New order notes state** (add near line 99):
```typescript
const [orderNotes, setOrderNotes] = useState<string>('')
```

**Updated shipping step:**
```typescript
{/* Step 2: Shipping */}
{currentStep === 'shipping' && (
  <div className="p-8">
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-2">Shipping Method</h2>
      <p className="text-sm text-gray-600">
        Complete address for shipping options
      </p>
    </div>

    {/* Contact Information */}
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <Mail className="h-5 w-5 text-gray-400 mr-2" />
        <h3 className="text-lg font-medium">Contact Details</h3>
      </div>
      <div className="space-y-4 pl-7">
        <div>
          <Label className="text-sm font-medium mb-1.5" htmlFor="email">
            Email Address *
          </Label>
          <Input
            required
            className="h-11"
            id="email"
            name="email"
            placeholder="john.doe@example.com"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-1.5" htmlFor="firstName">
              First Name *
            </Label>
            <Input
              required
              className="h-11"
              id="firstName"
              name="firstName"
              placeholder="John"
              value={formData.firstName}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5" htmlFor="lastName">
              Last Name *
            </Label>
            <Input
              required
              className="h-11"
              id="lastName"
              name="lastName"
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-1.5" htmlFor="phone">
              Phone Number *
            </Label>
            <Input
              required
              className="h-11"
              id="phone"
              name="phone"
              placeholder="(555) 123-4567"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5" htmlFor="company">
              Company (Optional)
            </Label>
            <Input
              className="h-11"
              id="company"
              name="company"
              placeholder="ACME Corp"
              value={formData.company}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
    </div>

    {/* Shipping Address Section */}
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <MapPin className="h-5 w-5 text-gray-400 mr-2" />
        <h3 className="text-lg font-medium">Shipping Address</h3>
      </div>
      <div className="space-y-4 pl-7">
        {/* ...existing shipping address fields... */}
      </div>
    </div>

    {/* Coupon Code */}
    <div className="mb-8">
      <div className="flex gap-2">
        <Input
          className="h-11"
          placeholder="Coupon Code"
          type="text"
        />
        <Button
          className="min-w-[100px]"
          size="lg"
          type="button"
          variant="outline"
        >
          Apply
        </Button>
      </div>
    </div>

    {/* Shipping Rates */}
    {mappedShippingItems.length === 0 ? (
      <div className="text-red-600 p-4 border border-red-300 rounded">
        Error: Cart items not properly loaded. Please refresh the page.
      </div>
    ) : (
      <ShippingRates
        items={mappedShippingItems}
        toAddress={shippingAddress}
        onAirportSelected={setSelectedAirportId}
        onRateSelected={(rate) => {
          setSelectedShippingRate({
            carrier: rate.carrier,
            serviceName: rate.serviceName,
            rateAmount: rate.rateAmount,
            estimatedDays: rate.estimatedDays,
            transitDays: rate.estimatedDays,
          })
        }}
      />
    )}

    {/* Order Notes */}
    <div className="mt-8">
      <Label className="text-sm font-medium mb-1.5" htmlFor="orderNotes">
        Order Notes (Optional)
      </Label>
      <textarea
        id="orderNotes"
        className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="If you have anything you would like to add about your order..."
        value={orderNotes}
        onChange={(e) => setOrderNotes(e.target.value)}
      />
    </div>

    {/* Navigation Buttons */}
    <div className="flex justify-between pt-6 border-t">
      <Button
        size="lg"
        type="button"
        variant="outline"
        onClick={handlePreviousStep}
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        Back
      </Button>
      <Button
        className="min-w-[240px] bg-red-600 hover:bg-red-700"
        disabled={!selectedShippingRate}
        size="lg"
        type="button"
        onClick={handleStepSubmit}
      >
        NEXT PAYMENT OPTIONS
        <ChevronRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  </div>
)}
```

### Phase 4: Update Step 3 (Combine Payment + Review)

**Replace existing payment and review steps (lines 861-1132):**

```typescript
{/* Step 3: Payment */}
{currentStep === 'payment' && (
  <div className="p-8">
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-2">Payment</h2>
      <p className="text-sm text-gray-600">Confirm your order</p>
    </div>

    {/* Collapsible Order Summary */}
    <details open className="mb-6 bg-gray-50 rounded-lg p-4">
      <summary className="flex justify-between items-center cursor-pointer font-medium">
        <span className="flex items-center gap-2">
          <Package2 className="h-5 w-5" />
          Order Summary
        </span>
        <span className="text-lg font-bold">${orderTotal.toFixed(2)}</span>
      </summary>
      <div className="mt-4 pt-4 border-t border-gray-200">
        {/* Product details */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 bg-white rounded flex items-center justify-center flex-shrink-0">
            <FileText className="h-6 w-6 text-gray-400" />
          </div>
          <div className="flex-1 text-sm">
            <h4 className="font-semibold mb-1">{currentItem.productName}</h4>
            <div className="space-y-1 text-gray-600">
              <p>QUANTITY: {currentItem.quantity}</p>
              {currentItem.options.size && <p>SIZE: {currentItem.options.size}</p>}
              {currentItem.options.paperStock && <p>PAPER: {currentItem.options.paperStock}</p>}
              {currentItem.options.sides && <p>SIDES: {currentItem.options.sides}</p>}
              {currentItem.options.coating && <p>COATING: {currentItem.options.coating}</p>}
              {currentItem.options.turnaround && <p>TURNAROUND: {currentItem.options.turnaround}</p>}
            </div>
          </div>
          <div className="text-right font-medium">
            ${subtotal.toFixed(2)}
          </div>
        </div>

        {/* Price breakdown */}
        <div className="space-y-2 text-sm pt-3 border-t border-gray-200">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping:</span>
            <span className="font-medium">${shippingCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pb-2">
            <span>Tax:</span>
            <span className="font-medium">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-300 font-bold">
            <span>Total:</span>
            <span className="text-lg">${orderTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </details>

    {/* Review Information with Change Links */}
    <div className="mb-6 space-y-2 text-sm">
      <div className="flex justify-between items-center py-2 border-b">
        <span className="text-gray-600">Email:</span>
        <div className="flex items-center gap-3">
          <span className="font-medium">{formData.email}</span>
          <button
            className="text-red-600 hover:underline"
            type="button"
            onClick={() => setCurrentStep('shipping')}
          >
            Change
          </button>
        </div>
      </div>
      <div className="flex justify-between items-center py-2 border-b">
        <span className="text-gray-600">Phone:</span>
        <div className="flex items-center gap-3">
          <span className="font-medium">{formData.phone}</span>
          <button
            className="text-red-600 hover:underline"
            type="button"
            onClick={() => setCurrentStep('shipping')}
          >
            Change
          </button>
        </div>
      </div>
      <div className="flex justify-between items-center py-2 border-b">
        <span className="text-gray-600">Name:</span>
        <div className="flex items-center gap-3">
          <span className="font-medium">{formData.firstName} {formData.lastName}</span>
          <button
            className="text-red-600 hover:underline"
            type="button"
            onClick={() => setCurrentStep('shipping')}
          >
            Change
          </button>
        </div>
      </div>
      <div className="flex justify-between items-center py-2 border-b">
        <span className="text-gray-600">Method:</span>
        <div className="flex items-center gap-3">
          <span className="font-medium">
            {selectedShippingRate?.carrier} {selectedShippingRate?.serviceName}
          </span>
          <button
            className="text-red-600 hover:underline"
            type="button"
            onClick={() => setCurrentStep('shipping')}
          >
            Change
          </button>
        </div>
      </div>
    </div>

    {/* Order Notes Display */}
    {orderNotes && (
      <div className="mb-6 bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-sm mb-2">Order Notes</h4>
        <p className="text-sm text-gray-700">{orderNotes}</p>
      </div>
    )}

    {/* Complete Payment Section */}
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Complete Payment</h3>
      <div className="text-sm">
        <span className="text-gray-600">Order Total:</span>{' '}
        <span className="text-xl font-bold">${orderTotal.toFixed(2)}</span>
      </div>
    </div>

    {/* Payment Information */}
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Payment Information</h3>
      <p className="text-xs text-gray-500 mb-4">
        All transactions are secure and encrypted.
      </p>

      {/* Payment Method Selection */}
      <div className="space-y-3">
        {/* Credit Card - Default Selected */}
        <div className="border rounded-lg p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              checked={selectedPaymentMethod === 'square' || selectedPaymentMethod === 'card'}
              className="w-4 h-4"
              name="paymentMethod"
              type="radio"
              value="square"
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            />
            <div className="flex-1">
              <div className="font-medium">Credit Card</div>
              <div className="flex gap-1 mt-1">
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Visa</span>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Mastercard</span>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Amex</span>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Discover</span>
              </div>
            </div>
          </label>

          {/* Show card form when selected */}
          {(selectedPaymentMethod === 'square' || selectedPaymentMethod === 'card') && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600 mb-3">
                Pay securely using your credit card.
              </p>
              <SquareCardPayment
                applicationId={SQUARE_APPLICATION_ID}
                locationId={SQUARE_LOCATION_ID}
                total={orderTotal}
                onBack={handlePreviousStep}
                onPaymentError={handleCardPaymentError}
                onPaymentSuccess={handleCardPaymentSuccess}
              />
            </div>
          )}
        </div>

        {/* PayPal */}
        <div className="border rounded-lg p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              checked={selectedPaymentMethod === 'paypal'}
              className="w-4 h-4"
              name="paymentMethod"
              type="radio"
              value="paypal"
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            />
            <div className="flex-1 font-medium">PayPal</div>
          </label>

          {selectedPaymentMethod === 'paypal' && (
            <div className="mt-4 pt-4 border-t">
              <PayPalButton
                total={orderTotal}
                onError={handlePayPalError}
                onSuccess={handlePayPalSuccess}
              />
            </div>
          )}
        </div>

        {/* Test Cash (DEV ONLY) */}
        <div className="border rounded-lg p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              checked={selectedPaymentMethod === 'test_cash'}
              className="w-4 h-4"
              name="paymentMethod"
              type="radio"
              value="test_cash"
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            />
            <div className="flex-1 font-medium">🧪 Test Cash Payment</div>
          </label>
        </div>
      </div>
    </div>

    {/* Privacy & Terms */}
    <div className="mb-6 bg-gray-50 rounded-lg p-4">
      <p className="text-xs text-gray-600 mb-3">
        Your personal data will be used to process your order, support your experience
        throughout this website, and for other purposes described in our privacy policy.
      </p>
      <div className="flex items-start gap-2">
        <Checkbox id="terms" required />
        <Label className="text-xs cursor-pointer" htmlFor="terms">
          I have read and agree to the website{' '}
          <a className="text-red-600 hover:underline" href="/terms" target="_blank">
            terms and conditions
          </a>{' '}
          *
        </Label>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="space-y-4">
      <Button
        className="w-full bg-red-600 hover:bg-red-700 text-white h-14 text-lg"
        disabled={isProcessing || selectedPaymentMethod === 'square' || selectedPaymentMethod === 'paypal'}
        size="lg"
        onClick={selectedPaymentMethod === 'test_cash' ? processPayment : undefined}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-5 w-5" />
            PLACE ORDER NOW ${orderTotal.toFixed(2)}
          </>
        )}
      </Button>

      <div className="flex justify-center gap-4 text-sm">
        <button
          className="text-red-600 hover:underline"
          type="button"
          onClick={() => setCurrentStep('shipping')}
        >
          « Return to Shipping Options
        </button>
        <span className="text-gray-400">|</span>
        <Link className="text-red-600 hover:underline" href="/cart">
          « Back to Cart
        </Link>
      </div>
    </div>

    {/* Trust Badges */}
    <div className="mt-6 pt-6 border-t">
      <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          <div>
            <div className="font-medium text-gray-700">McAfee Secure</div>
            <div>256-Bit Encryption</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-green-600" />
          <div>
            <div className="font-medium text-gray-700">Norton Secured</div>
            <div>100% Secure Payments</div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
```

### Phase 5: Update ShippingRates Component

**File:** `/src/components/checkout/shipping-rates.tsx`

**Ensure shipping prices are aligned right:**
```typescript
<div className="flex justify-between items-center">
  <div className="flex items-center gap-2">
    <input type="radio" ... />
    <div>
      <div className="font-medium">{rate.serviceName}</div>
      <div className="text-xs text-gray-500">
        Est. {rate.estimatedDays} business days
      </div>
    </div>
  </div>
  <div className="font-bold text-lg">
    ${rate.rateAmount.toFixed(2)}
  </div>
</div>
```

### Phase 6: Remove Old Step 1 (Information)

**Delete lines 608-786** (old information step) - this content has been moved to Step 2

### Phase 7: Remove Old Step 4 (Review)

**Delete lines 981-1132** (old review step) - this content has been merged into Step 3

---

## 📝 Acceptance Criteria

### Step 1: Order Summary
- [ ] Shows collapsible product details card
- [ ] Displays all selected options
- [ ] Shows price breakdown (Subtotal, Shipping TBD, Tax, Total)
- [ ] Shows uploaded files if present
- [ ] "Continue to Shipping" button works
- [ ] "Back to Cart" link works

### Step 2: Shipping Method
- [ ] Contact information fields visible
- [ ] Shipping address fields visible
- [ ] Shipping rates displayed with prices aligned right
- [ ] Coupon code field present
- [ ] Order notes textarea present
- [ ] "NEXT PAYMENT OPTIONS →" button works
- [ ] Form validation works correctly

### Step 3: Payment
- [ ] Collapsible order summary at top (default open)
- [ ] Review section shows Email, Phone, Name, Method with "Change" links
- [ ] "Change" links navigate back to Step 2
- [ ] Order notes displayed if provided
- [ ] Credit Card selected by default
- [ ] Square card form VISIBLE immediately when Credit Card selected
- [ ] PayPal button shown when PayPal selected
- [ ] Test Cash option works (dev only)
- [ ] Terms checkbox required
- [ ] "PLACE ORDER NOW" button shows correct total
- [ ] Trust badges displayed
- [ ] All payment methods work correctly

### General
- [ ] Progress indicator shows 3 steps (not 4)
- [ ] Mobile responsive design
- [ ] No console errors
- [ ] All existing payment integrations work
- [ ] Cart clears after successful order
- [ ] Success page shows correct information

---

## 🧪 Testing Checklist

### Desktop Testing
- [ ] Complete checkout with Credit Card (Square)
- [ ] Complete checkout with PayPal
- [ ] Complete checkout with Test Cash
- [ ] Verify "Change" links work on payment step
- [ ] Verify order summary collapses/expands
- [ ] Verify shipping prices are scannable (aligned right)
- [ ] Test coupon code field (if functionality exists)
- [ ] Test order notes field
- [ ] Verify all form validations work

### Mobile Testing
- [ ] Test complete flow on mobile (320px width)
- [ ] Verify collapsible summary works on mobile
- [ ] Verify form fields are easy to tap
- [ ] Verify payment forms display correctly
- [ ] Test keyboard interactions

### Edge Cases
- [ ] Test with no uploaded files
- [ ] Test with multiple uploaded files
- [ ] Test with very long order notes
- [ ] Test with missing required fields
- [ ] Test back navigation throughout flow
- [ ] Test browser back button behavior

---

## 📊 Success Metrics

**Before (Baseline):**
- Steps: 4
- Payment form: Hidden until step 4
- Order summary: Always visible sidebar
- Shipping comparison: Moderate
- Order notes: Missing
- Coupon field: May not be prominent

**After (Target):**
- Steps: 3 (✅ 25% reduction)
- Payment form: Visible on step 3 (✅ immediate trust)
- Order summary: Collapsible (✅ cleaner UI)
- Shipping comparison: Easy (✅ right-aligned prices)
- Order notes: Present (✅ feature added)
- Coupon field: Prominent (✅ increased usage)

**Expected Improvements:**
- 🎯 **30% reduction** in checkout completion time
- 🎯 **15-20% decrease** in cart abandonment
- 🎯 **Fewer support tickets** about payment confusion
- 🎯 **Increased mobile conversions** (cleaner mobile UI)

---

## 🚀 Deployment Plan

### Pre-Deployment
1. **Code Review**
   - Review all changes in `/src/app/(customer)/checkout/page.tsx`
   - Review ShippingRates component updates
   - Verify no breaking changes to payment integrations

2. **Testing**
   - Run all acceptance criteria tests
   - Test all payment methods (Square, PayPal, Test Cash)
   - Mobile testing on real devices
   - Cross-browser testing (Chrome, Safari, Firefox)

3. **Documentation**
   - Update checkout flow documentation
   - Document any new environment variables
   - Update API documentation if needed

### Deployment
1. **Build & Test**
   ```bash
   npm run build
   npm run test:e2e:checkout
   ```

2. **Deploy to Staging**
   ```bash
   pm2 stop gangrunprinting
   git pull origin main
   npm install
   npm run build
   pm2 restart gangrunprinting
   pm2 save
   ```

3. **Smoke Test on Staging**
   - Test complete checkout flow
   - Verify payment integrations
   - Check mobile responsiveness

4. **Deploy to Production**
   - Same commands as staging
   - Monitor error logs: `pm2 logs gangrunprinting`
   - Watch for any issues

### Post-Deployment
1. **Monitoring**
   - Monitor checkout completion rates
   - Track cart abandonment rates
   - Watch for error reports
   - Monitor support tickets

2. **Analytics**
   - Set up funnel tracking for 3-step flow
   - Track time-to-completion
   - Monitor conversion rates by payment method

3. **User Feedback**
   - Collect user feedback on new flow
   - Monitor customer satisfaction scores
   - Track any usability issues

---

## 🐛 Known Issues & Risks

### Potential Risks

**Risk 1: Payment Integration Breakage**
- **Impact:** HIGH
- **Probability:** LOW
- **Mitigation:** Thorough testing of all payment methods before deployment
- **Rollback:** Keep old checkout flow in feature flag if needed

**Risk 2: Mobile UX Issues**
- **Impact:** MEDIUM
- **Probability:** MEDIUM
- **Mitigation:** Extensive mobile testing, responsive design review
- **Rollback:** Quick CSS fixes can resolve most mobile issues

**Risk 3: Form Validation Errors**
- **Impact:** MEDIUM
- **Probability:** LOW
- **Mitigation:** Test all validation scenarios, maintain existing validation logic
- **Rollback:** Restore old validation patterns if issues arise

**Risk 4: User Confusion During Transition**
- **Impact:** LOW
- **Probability:** MEDIUM
- **Mitigation:** Add subtle UI hints if needed, monitor support tickets
- **Rollback:** None needed - users adapt quickly to simpler flows

---

## 📚 References

### Design References
- UVCoatedClubFlyers.com checkout (reference images in `.aaaaaa/checkout flow/`)
- [Checkout UX Analysis](/docs/checkout-ux-analysis-2025-10-11.md)

### Related Stories
- Story 3.3: Address Management Enhancement
- Story 3.4: Shipping Provider Selection
- Story 3.5: Payment Processing Integration

### Related Documentation
- [Checkout API Documentation](/docs/api/checkout.md)
- [Payment Integration Guide](/docs/payment-integration.md)
- [E-commerce Best Practices](/docs/ecommerce-ux-best-practices.md)

---

## QA Results

_QA testing to be completed after implementation._

### Test Date: TBD
### Tested By: TBD

**Test Results:**
- [ ] All acceptance criteria passed
- [ ] Desktop testing complete
- [ ] Mobile testing complete
- [ ] Edge cases tested
- [ ] Payment integrations verified

**Issues Found:**
- None yet

**Gate Status:**
- _To be determined after QA_

---

**Status:** InProgress
**Last Updated:** 2025-10-11
**Next Review:** After Phase 1 implementation
