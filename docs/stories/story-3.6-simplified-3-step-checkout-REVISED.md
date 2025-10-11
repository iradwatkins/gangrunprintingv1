# Story 3.6: Simplified 3-Step Checkout Flow (REVISED)

**Epic:** 3 - Checkout & Payment System
**Status:** InProgress
**Priority:** P0 - Critical
**Assignee:** Development Team
**Created:** 2025-10-11
**Updated:** 2025-10-11 (Revised based on feedback)

---

## 📋 Overview

Redesign the checkout flow from a **4-step process** to a **simplified 3-step process** based on proven UX patterns from high-converting print e-commerce sites (specifically UVCoatedClubFlyers.com).

**Current Flow (4 Steps):**
```
Information → Shipping → Payment Method Selection → Review & Pay
```

**New Flow (3 Steps):**
```
Step 1: Order Summary
Step 2: Shipping Method (Complete Address for Shipping Options)
Step 3: Payment (Confirm your order)
```

---

## 🎯 Key Requirements

### Guest Checkout
- **NO LOGIN REQUIRED** - Customers can checkout as guests
- Only require: Email + Phone + Shipping Address
- Optional: Company name

### Billing Address Smart Default
- **Default:** Billing address same as shipping
- Only show billing address fields if customer checks "Billing address is different"
- **Saves time:** 95% of customers have same billing/shipping address

### Notes System (Space-Saving)
Two types of notes, **both hidden behind checkboxes**:

1. **Order Notes Checkbox**
   - Label: "☐ Add notes for your order"
   - When checked: Shows textarea for order-specific notes
   - Example: "Please use red ink for company logo"

2. **Shipping Notes Checkbox**
   - Label: "☐ Add notes for shipping"
   - When checked: Shows textarea for shipping-specific instructions
   - Example: "Leave package at side door"

### Payment Method Switching
Payment forms appear **immediately** when method is selected (see CC example images):
- Credit Card selected → Card form visible (Card Number, MM/YY, CVV)
- PayPal selected → "Pay via PayPal" + PayPal button
- Cash App Pay selected → "Pay securely using Cash App Pay" + button
- Test Cash selected → (Dev only) Test payment button

---

## 💡 Detailed Solution

### **Step 1: Order Summary**

**Page Header:**
```
Order Summary
```

**Components:**

1. **Progress Indicator**
   ```
   ● 1. Order Summary  →  ○ 2. Shipping Method  →  ○ 3. Payment
   ```

2. **Product Details Card** (not collapsible on this step)
   ```
   ┌─────────────────────────────────────────────┐
   │ [📄 Icon]  5000 9pt Standard 4x6 Flyers    │ $160.55
   │                                              │
   │  QUANTITY: 5000          SIZE: 4x6          │
   │  PAPER: 80 lb Cover      SIDES: Double      │
   │  COATING: Gloss Aqueous  TURNAROUND: Economy│
   │  ADDONS: UV Coating, Rounded Corners        │
   └─────────────────────────────────────────────┘
   ```

3. **Uploaded Images Display** (if files uploaded)
   ```
   ┌─────────────────────────────────────────────┐
   │ ✅ Design Files Uploaded (3)                │
   │ [img1] [img2] [img3]                        │
   └─────────────────────────────────────────────┘
   ```

4. **Price Breakdown**
   ```
   Subtotal:        $160.55
   Shipping:        TBD
   Tax:             $12.84
   ──────────────────────────
   Total:           $173.39
   ```

5. **Action Buttons**
   ```
   [← Back to Cart]              [Continue to Shipping →]
   ```

---

### **Step 2: Shipping Method**

**Page Header:**
```
Shipping Method
Complete Address for Shipping Options
```

**Progress Indicator:**
```
✓ 1. Order Summary  →  ● 2. Shipping Method  →  ○ 3. Payment
```

**Components:**

1. **Collapsible Order Summary (Top)** - New Feature
   ```
   [▼ Show Order Summary ▲]                      $222.01
   ```
   When expanded, shows full product details + price breakdown

2. **Contact Information Section**
   ```
   📧 Contact Details

   Email Address *          [john.doe@example.com]
   First Name *  [John]     Last Name *  [Doe]
   Phone *      [(555) 123-4567]
   Company      [ACME Corp] (optional)
   ```

3. **Shipping Address Section**
   ```
   📍 Shipping Address

   Street Address *     [123 Main Street]
   City *       [Dallas]
   State *      [TX]     ZIP Code *  [75001]
   Country      [US] (default)
   ```

4. **Billing Address Section** (Smart Show/Hide)
   ```
   ☑ Billing address same as shipping

   [If unchecked, show billing fields:]

   ☐ Billing address same as shipping

   💳 Billing Address

   Street Address *     [____________]
   City *       [______]
   State *      [__]     ZIP Code *  [_____]
   ```

5. **Shipping Options** (Prices Right-Aligned)
   ```
   Shipping to: John Doe, 123 Main Street, Dallas, TX 75001

   🚚 Select Shipping Method:

   ● FedEx Ground Home Delivery                   $61.46
   ○ Southwest Cargo Pickup                       $80.00
   ○ Southwest Cargo Pickup (Express)             $95.00
   ○ FedEx 2Day                                   $205.60
   ○ FedEx First Overnight                        $545.95

   [Airport selector if applicable]
   ```

6. **Order Notes** (Hidden Behind Checkbox)
   ```
   ☐ Add notes for your order

   [If checked, show:]

   ☑ Add notes for your order

   Order Notes:
   ┌──────────────────────────────────────────┐
   │ Add any special instructions for your    │
   │ order (e.g., color preferences, special  │
   │ finishing requests)...                   │
   └──────────────────────────────────────────┘
   ```

7. **Shipping Notes** (Hidden Behind Checkbox)
   ```
   ☐ Add notes for shipping

   [If checked, show:]

   ☑ Add notes for shipping

   Shipping Notes:
   ┌──────────────────────────────────────────┐
   │ Add delivery instructions (e.g., gate    │
   │ code, leave at side door, call on        │
   │ arrival)...                              │
   └──────────────────────────────────────────┘
   ```

8. **Action Buttons**
   ```
   [← Back]              [NEXT PAYMENT OPTIONS →]
                         (Big red button)
   ```

---

### **Step 3: Payment**

**Page Header:**
```
Payment
Confirm your order
```

**Progress Indicator:**
```
✓ 1. Order Summary  →  ✓ 2. Shipping Method  →  ● 3. Payment
```

**Components:**

1. **Collapsible Order Summary** (Expanded by default)
   ```
   [▼ Hide Order Summary ▲]                      $222.01

   [When expanded:]

   📄 5000 9pt Standard 4x6 Flyers              $160.55
   QUANTITY: 5000  SIZE: 4x6  PAPER: 80 lb

   Subtotal:        $160.55
   Shipping:        $61.46
   Tax:             $12.84
   ──────────────────────────
   Total:           $222.01
   ```

2. **Review Section with Change Links**
   ```
   Email:   john.doe@example.com              [Change]
   Phone:   (555) 123-4567                    [Change]
   Name:    John Doe                          [Change]
   Method:  FedEx Ground Home Delivery        [Change]
   ```
   Clicking "Change" navigates back to Step 2 and scrolls to that field

3. **Order Notes Display** (if provided)
   ```
   📝 Order Notes
   Please use red ink for company logo
   ```

4. **Shipping Notes Display** (if provided)
   ```
   🚚 Shipping Notes
   Leave package at side door, call on arrival
   ```

5. **Complete Payment Section**
   ```
   Complete Payment

   Order Total: $222.01
   ```

6. **Payment Information Section**
   ```
   Payment Information
   All transactions are secure and encrypted.
   ```

7. **Payment Method Selection** (With Visible Forms)

   **● Credit Card (Default Selected)**
   ```
   ● Credit Card
     [Visa] [MC] [Amex] [Discover] [Diners] [UnionPay]

     Pay securely using your credit card.

     [💳 Card number                           ]
     [📅 MM/YY]  [🔒 CVV]
   ```

   **○ PayPal**
   ```
   ○ PayPal [PayPal logo]

     [When selected, shows:]
     Pay via PayPal.
     [Yellow PayPal Button]

     « Return to Shipping Options
     « Back to Cart
   ```

   **○ Cash App Pay**
   ```
   ○ Cash App Pay [$]

     [When selected, shows:]
     Pay securely using Cash App Pay.
     [Black Cash App Pay Button]
   ```

   **○ Test Gateway (DEV ONLY)**
   ```
   ○ Test Gateway By FunnelKit

     [When selected, shows:]
     Test payment mode for development.
   ```

8. **Privacy & Terms**
   ```
   Your personal data will be used to process your order,
   support your experience throughout this website, and for
   other purposes described in our privacy policy.

   ☐ I have read and agree to the website terms and conditions *
   ```

9. **Action Buttons**
   ```
   [🔒 PLACE ORDER NOW $222.01]
   (Big red button, full width, large text)

   « Return to Shipping Options  |  « Back to Cart
   ```

10. **Trust Badges**
    ```
    [🔒 McAfee Secure]      [✓ Norton Secured]

    ✓ 256-Bit Bank Level Security
    ✓ 100% Secure Payments
    ```

---

### **Sidebar: "Shop With Confidence"** (All Steps)

Right sidebar visible on all steps (desktop only, hidden on mobile):

```
┌─────────────────────────────────┐
│ Shop With Confidence             │
│                                  │
│ ✓ 100% Money-Back Guarantee     │
│ ✓ Nextday Airport Shipping      │
│ ✓ Secured Transactions          │
│ ✓ 24 Hour Email Support         │
│                                  │
│ ──────────────────────────────  │
│                                  │
│ Thousands Of Happy Customers     │
│                                  │
│ [👤 Photo] ⭐⭐⭐⭐⭐              │
│ - Emily Martinez, Star          │
│   Charity Foundation            │
│                                  │
│ "I called Uvcoatedclubflyers    │
│ at the last minute and they     │
│ were able to print the job and  │
│ have it shipped the next        │
│ morning."                       │
│                                  │
│ [👤 Photo] ⭐⭐⭐⭐⭐              │
│ - Jason Smith, Creative         │
│   Solutions Inc.                │
│                                  │
│ "Our event materials from       │
│ Uvcoatedclubflyers.com were     │
│ stunning. Vivid colors,         │
│ excellent paper quality, and    │
│ timely delivery."               │
│                                  │
│ [👤 Photo] ⭐⭐⭐⭐⭐              │
│ - Michael Johnson,              │
│   Johnson's Tech Hub            │
│                                  │
│ "Uvcoatedclubflyers.com is our  │
│ go-to for all printing needs.   │
│ Great quality, competitive      │
│ pricing, and excellent service."│
└─────────────────────────────────┘
```

---

## 🏗️ Technical Implementation

### Phase 1: Update Step Structure & State

**File:** `/src/app/(customer)/checkout/page.tsx`

**1. Update STEPS array** (around line 56):
```typescript
const STEPS: {
  id: CheckoutStep
  label: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  {
    id: 'order-summary',
    label: 'Order Summary',
    subtitle: '',
    icon: Package2
  },
  {
    id: 'shipping',
    label: 'Shipping Method',
    subtitle: 'Complete Address for Shipping Options',
    icon: Truck
  },
  {
    id: 'payment',
    label: 'Payment',
    subtitle: 'Confirm your order',
    icon: CreditCard
  },
]
```

**2. Update CheckoutStep type** (around line 54):
```typescript
type CheckoutStep = 'order-summary' | 'shipping' | 'payment'
```

**3. Add new state variables** (around line 72-99):
```typescript
const [currentStep, setCurrentStep] = useState<CheckoutStep>('order-summary')
const [orderNotes, setOrderNotes] = useState<string>('')
const [shippingNotes, setShippingNotes] = useState<string>('')
const [showOrderNotes, setShowOrderNotes] = useState<boolean>(false)
const [showShippingNotes, setShowShippingNotes] = useState<boolean>(false)
const [billingDifferent, setBillingDifferent] = useState<boolean>(false)
```

**4. Update formData state** (around line 85):
```typescript
const [formData, setFormData] = useState({
  email: '',
  firstName: '',
  lastName: '',
  company: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  // Only used if billingDifferent is true:
  billingAddress: '',
  billingCity: '',
  billingState: '',
  billingZipCode: '',
})
```

---

### Phase 2: Implement Step 1 (Order Summary)

**Location:** Replace old information step (around line 608)

```typescript
{/* Step 1: Order Summary */}
{currentStep === 'order-summary' && (
  <div className="p-8">
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-2">Order Summary</h2>
    </div>

    {/* Product Details Card - NOT collapsible on this step */}
    <div className="bg-gray-50 rounded-lg p-6 mb-6">
      <div className="flex items-start gap-4">
        {/* Product Icon */}
        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>

        {/* Product Info */}
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-3">{currentItem.productName}</h3>

          {/* Product Options Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="text-gray-500 uppercase text-xs font-medium">Quantity:</span>{' '}
              <span className="font-medium">{currentItem.quantity}</span>
            </div>
            {currentItem.options.size && (
              <div>
                <span className="text-gray-500 uppercase text-xs font-medium">Size:</span>{' '}
                <span className="font-medium">{currentItem.options.size}</span>
              </div>
            )}
            {currentItem.options.paperStock && (
              <div>
                <span className="text-gray-500 uppercase text-xs font-medium">Paper:</span>{' '}
                <span className="font-medium">{currentItem.options.paperStock}</span>
              </div>
            )}
            {currentItem.options.sides && (
              <div>
                <span className="text-gray-500 uppercase text-xs font-medium">Sides:</span>{' '}
                <span className="font-medium">{currentItem.options.sides}</span>
              </div>
            )}
            {currentItem.options.coating && (
              <div>
                <span className="text-gray-500 uppercase text-xs font-medium">Coating:</span>{' '}
                <span className="font-medium">{currentItem.options.coating}</span>
              </div>
            )}
            {currentItem.options.turnaround && (
              <div>
                <span className="text-gray-500 uppercase text-xs font-medium">Turnaround:</span>{' '}
                <span className="font-medium">{currentItem.options.turnaround}</span>
              </div>
            )}
          </div>

          {/* Addons */}
          {currentItem.addons && currentItem.addons.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-sm">
                <span className="text-gray-500 uppercase text-xs font-medium">Addons:</span>{' '}
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
      <div className="mt-6 pt-4 border-t border-gray-300">
        <div className="space-y-2 text-sm max-w-xs ml-auto">
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
            <span className="font-semibold text-base">Total:</span>
            <span className="font-bold text-lg text-primary">
              ${(subtotal + tax).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* Uploaded Images */}
    {uploadedImages.length > 0 && (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm font-medium mb-3 flex items-center gap-2 text-blue-900">
          <Check className="h-4 w-4 text-green-600" />
          Design Files Uploaded ({uploadedImages.length})
        </p>
        <div className="grid grid-cols-4 gap-3">
          {uploadedImages.map((img) => (
            <div
              key={img.id}
              className="relative aspect-square rounded border-2 border-white bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <Image
                fill
                alt={img.fileName}
                className="object-contain p-2"
                src={img.thumbnailUrl || img.url}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-blue-700 mt-2">
          Files will be reviewed after order placement
        </p>
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
        className="min-w-[220px] text-base"
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

---

### Phase 3: Implement Step 2 (Shipping Method)

**Location:** Replace old shipping step (around line 788)

```typescript
{/* Step 2: Shipping Method */}
{currentStep === 'shipping' && (
  <div className="p-8">
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-2">Shipping Method</h2>
      <p className="text-sm text-gray-600">
        Complete Address for Shipping Options
      </p>
    </div>

    {/* Collapsible Order Summary */}
    <details className="mb-8 bg-gray-50 rounded-lg p-4 border">
      <summary className="flex justify-between items-center cursor-pointer font-medium hover:text-primary">
        <span className="flex items-center gap-2">
          <Package2 className="h-5 w-5" />
          Show Order Summary
        </span>
        <span className="text-lg font-bold">${(subtotal + tax).toFixed(2)}</span>
      </summary>
      <div className="mt-4 pt-4 border-t border-gray-200 text-sm">
        <p className="font-medium mb-2">{currentItem.productName}</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div>Quantity: {currentItem.quantity}</div>
          {currentItem.options.size && <div>Size: {currentItem.options.size}</div>}
          {currentItem.options.paperStock && <div>Paper: {currentItem.options.paperStock}</div>}
          {currentItem.options.coating && <div>Coating: {currentItem.options.coating}</div>}
        </div>
        <div className="mt-3 pt-3 border-t space-y-1">
          <div className="flex justify-between"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Tax:</span><span>${tax.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold pt-1 border-t">
            <span>Total:</span><span>${(subtotal + tax).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </details>

    {/* Contact Information */}
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <Mail className="h-5 w-5 text-gray-400 mr-2" />
        <h3 className="text-lg font-medium">Contact Details</h3>
      </div>
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-1.5 block" htmlFor="email">
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
          <p className="text-xs text-gray-500 mt-1">
            Order confirmation will be sent to this email
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-1.5 block" htmlFor="firstName">
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
            <Label className="text-sm font-medium mb-1.5 block" htmlFor="lastName">
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
            <Label className="text-sm font-medium mb-1.5 block" htmlFor="phone">
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
            <Label className="text-sm font-medium mb-1.5 block" htmlFor="company">
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

    {/* Shipping Address */}
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <MapPin className="h-5 w-5 text-gray-400 mr-2" />
        <h3 className="text-lg font-medium">Shipping Address</h3>
      </div>
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-1.5 block" htmlFor="address">
            Street Address *
          </Label>
          <Input
            required
            className="h-11"
            id="address"
            name="address"
            placeholder="123 Main Street"
            value={formData.address}
            onChange={handleInputChange}
          />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Label className="text-sm font-medium mb-1.5 block" htmlFor="city">
              City *
            </Label>
            <Input
              required
              className="h-11"
              id="city"
              name="city"
              placeholder="Dallas"
              value={formData.city}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block" htmlFor="state">
              State *
            </Label>
            <Input
              required
              className="h-11"
              id="state"
              maxLength={2}
              name="state"
              placeholder="TX"
              value={formData.state}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block" htmlFor="zipCode">
              ZIP Code *
            </Label>
            <Input
              required
              className="h-11"
              id="zipCode"
              maxLength={10}
              name="zipCode"
              placeholder="75001"
              value={formData.zipCode}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
    </div>

    {/* Billing Address - Smart Show/Hide */}
    <div className="mb-8 bg-gray-50 rounded-lg p-4 border">
      <div className="flex items-center gap-2 mb-3">
        <Checkbox
          checked={!billingDifferent}
          id="sameBilling"
          onCheckedChange={(checked) => setBillingDifferent(!checked)}
        />
        <Label className="text-sm font-medium cursor-pointer" htmlFor="sameBilling">
          Billing address same as shipping
        </Label>
      </div>

      {billingDifferent && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
            <h4 className="text-base font-medium">Billing Address</h4>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-1.5 block" htmlFor="billingAddress">
                Street Address *
              </Label>
              <Input
                required={billingDifferent}
                className="h-11"
                id="billingAddress"
                name="billingAddress"
                placeholder="123 Billing Street"
                value={formData.billingAddress}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium mb-1.5 block" htmlFor="billingCity">
                  City *
                </Label>
                <Input
                  required={billingDifferent}
                  className="h-11"
                  id="billingCity"
                  name="billingCity"
                  placeholder="Dallas"
                  value={formData.billingCity}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block" htmlFor="billingState">
                  State *
                </Label>
                <Input
                  required={billingDifferent}
                  className="h-11"
                  id="billingState"
                  maxLength={2}
                  name="billingState"
                  placeholder="TX"
                  value={formData.billingState}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block" htmlFor="billingZipCode">
                  ZIP Code *
                </Label>
                <Input
                  required={billingDifferent}
                  className="h-11"
                  id="billingZipCode"
                  maxLength={10}
                  name="billingZipCode"
                  placeholder="75001"
                  value={formData.billingZipCode}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Shipping Rates */}
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <Truck className="h-5 w-5 text-gray-400 mr-2" />
        <h3 className="text-lg font-medium">Select Shipping Method</h3>
      </div>

      {formData.address && formData.city && formData.state && formData.zipCode && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-sm text-blue-900">
          <strong>Shipping to:</strong> {formData.firstName} {formData.lastName}, {formData.address}, {formData.city}, {formData.state} {formData.zipCode}
        </div>
      )}

      {mappedShippingItems.length === 0 ? (
        <div className="text-red-600 p-4 border border-red-300 rounded bg-red-50">
          Error: Cart items not properly loaded. Please refresh the page.
        </div>
      ) : !formData.address || !formData.city || !formData.state || !formData.zipCode ? (
        <div className="text-gray-600 p-4 border border-gray-300 rounded bg-gray-50">
          Please complete shipping address to see shipping options.
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
    </div>

    {/* Order Notes - Hidden Behind Checkbox */}
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Checkbox
          checked={showOrderNotes}
          id="showOrderNotes"
          onCheckedChange={(checked) => setShowOrderNotes(checked as boolean)}
        />
        <Label className="text-sm font-medium cursor-pointer" htmlFor="showOrderNotes">
          Add notes for your order
        </Label>
      </div>
      {showOrderNotes && (
        <div className="mt-3">
          <textarea
            id="orderNotes"
            className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            placeholder="Add any special instructions for your order (e.g., color preferences, special finishing requests)..."
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
          />
        </div>
      )}
    </div>

    {/* Shipping Notes - Hidden Behind Checkbox */}
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-2">
        <Checkbox
          checked={showShippingNotes}
          id="showShippingNotes"
          onCheckedChange={(checked) => setShowShippingNotes(checked as boolean)}
        />
        <Label className="text-sm font-medium cursor-pointer" htmlFor="showShippingNotes">
          Add notes for shipping
        </Label>
      </div>
      {showShippingNotes && (
        <div className="mt-3">
          <textarea
            id="shippingNotes"
            className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            placeholder="Add delivery instructions (e.g., gate code, leave at side door, call on arrival)..."
            value={shippingNotes}
            onChange={(e) => setShippingNotes(e.target.value)}
          />
        </div>
      )}
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
        className="min-w-[240px] bg-red-600 hover:bg-red-700 text-white h-12 text-base font-semibold"
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

---

### Phase 4: Implement Step 3 (Payment)

**Location:** Replace old payment/review steps (around line 861)

```typescript
{/* Step 3: Payment */}
{currentStep === 'payment' && (
  <div className="p-8">
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-2">Payment</h2>
      <p className="text-sm text-gray-600">Confirm your order</p>
    </div>

    {/* Collapsible Order Summary - Expanded by Default */}
    <details open className="mb-6 bg-gray-50 rounded-lg p-4 border">
      <summary className="flex justify-between items-center cursor-pointer font-medium hover:text-primary">
        <span className="flex items-center gap-2">
          <Package2 className="h-5 w-5" />
          Order Summary
        </span>
        <span className="text-lg font-bold">${orderTotal.toFixed(2)}</span>
      </summary>
      <div className="mt-4 pt-4 border-t border-gray-200">
        {/* Product details */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 bg-white rounded flex items-center justify-center flex-shrink-0 border">
            <FileText className="h-6 w-6 text-gray-400" />
          </div>
          <div className="flex-1 text-sm">
            <h4 className="font-semibold mb-1">{currentItem.productName}</h4>
            <div className="space-y-1 text-gray-600 text-xs">
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
    <div className="mb-6 bg-white rounded-lg border p-4">
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center pb-2 border-b">
          <span className="text-gray-600 font-medium">Email:</span>
          <div className="flex items-center gap-3">
            <span className="font-medium">{formData.email}</span>
            <button
              className="text-red-600 hover:underline text-xs font-medium"
              type="button"
              onClick={() => setCurrentStep('shipping')}
            >
              Change
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center pb-2 border-b">
          <span className="text-gray-600 font-medium">Phone:</span>
          <div className="flex items-center gap-3">
            <span className="font-medium">{formData.phone}</span>
            <button
              className="text-red-600 hover:underline text-xs font-medium"
              type="button"
              onClick={() => setCurrentStep('shipping')}
            >
              Change
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center pb-2 border-b">
          <span className="text-gray-600 font-medium">Name:</span>
          <div className="flex items-center gap-3">
            <span className="font-medium">{formData.firstName} {formData.lastName}</span>
            <button
              className="text-red-600 hover:underline text-xs font-medium"
              type="button"
              onClick={() => setCurrentStep('shipping')}
            >
              Change
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-medium">Method:</span>
          <div className="flex items-center gap-3">
            <span className="font-medium">
              {selectedShippingRate?.carrier} {selectedShippingRate?.serviceName}
            </span>
            <button
              className="text-red-600 hover:underline text-xs font-medium"
              type="button"
              onClick={() => setCurrentStep('shipping')}
            >
              Change
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Order Notes Display */}
    {orderNotes && (
      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Order Notes
        </h4>
        <p className="text-sm text-gray-700">{orderNotes}</p>
      </div>
    )}

    {/* Shipping Notes Display */}
    {shippingNotes && (
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
          <Truck className="h-4 w-4" />
          Shipping Notes
        </h4>
        <p className="text-sm text-gray-700">{shippingNotes}</p>
      </div>
    )}

    {/* Complete Payment Section */}
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Complete Payment</h3>
      <div className="text-sm">
        <span className="text-gray-600">Order Total:</span>{' '}
        <span className="text-2xl font-bold text-primary">${orderTotal.toFixed(2)}</span>
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
        {/* Credit Card - Default Selected, Form Visible Immediately */}
        <div className="border-2 rounded-lg p-4 hover:border-primary transition-colors" style={{borderColor: selectedPaymentMethod === 'square' || selectedPaymentMethod === 'card' ? 'rgb(var(--primary))' : undefined}}>
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
              <div className="font-semibold text-base">Credit Card</div>
              <div className="flex gap-1 mt-2">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded border">Visa</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded border">Mastercard</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded border">Amex</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded border">Discover</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded border">Diners</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded border">UnionPay</span>
              </div>
            </div>
          </label>

          {/* Show card form IMMEDIATELY when selected */}
          {(selectedPaymentMethod === 'square' || selectedPaymentMethod === 'card') && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600 mb-4">
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
        <div className="border-2 rounded-lg p-4 hover:border-primary transition-colors" style={{borderColor: selectedPaymentMethod === 'paypal' ? 'rgb(var(--primary))' : undefined}}>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              checked={selectedPaymentMethod === 'paypal'}
              className="w-4 h-4"
              name="paymentMethod"
              type="radio"
              value="paypal"
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            />
            <div className="flex-1 flex items-center gap-2">
              <span className="font-semibold text-base">PayPal</span>
              <span className="text-blue-600 font-bold text-lg">Pay</span><span className="text-blue-400 font-bold text-lg">Pal</span>
            </div>
          </label>

          {selectedPaymentMethod === 'paypal' && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600 mb-3">Pay via PayPal.</p>
              <PayPalButton
                total={orderTotal}
                onError={handlePayPalError}
                onSuccess={handlePayPalSuccess}
              />
              <div className="mt-4 text-center space-x-4 text-sm">
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
          )}
        </div>

        {/* Cash App Pay */}
        <div className="border-2 rounded-lg p-4 hover:border-primary transition-colors" style={{borderColor: selectedPaymentMethod === 'cashapp' ? 'rgb(var(--primary))' : undefined}}>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              checked={selectedPaymentMethod === 'cashapp'}
              className="w-4 h-4"
              name="paymentMethod"
              type="radio"
              value="cashapp"
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            />
            <div className="flex-1 flex items-center gap-2">
              <span className="font-semibold text-base">Cash App Pay</span>
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded font-bold">$</span>
            </div>
          </label>

          {selectedPaymentMethod === 'cashapp' && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600 mb-3">Pay securely using Cash App Pay.</p>
              <button className="w-full bg-black text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-800">
                <span className="bg-green-500 text-white text-sm px-2 py-1 rounded font-bold">$</span>
                Cash App Pay
              </button>
            </div>
          )}
        </div>

        {/* Test Cash (DEV ONLY) */}
        <div className="border-2 rounded-lg p-4 bg-yellow-50 hover:border-primary transition-colors" style={{borderColor: selectedPaymentMethod === 'test_cash' ? 'rgb(var(--primary))' : undefined}}>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              checked={selectedPaymentMethod === 'test_cash'}
              className="w-4 h-4"
              name="paymentMethod"
              type="radio"
              value="test_cash"
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            />
            <div className="flex-1">
              <span className="font-semibold text-base">Test Gateway By FunnelKit</span>
              <span className="ml-2 text-xs bg-yellow-200 px-2 py-0.5 rounded">DEV ONLY</span>
            </div>
          </label>
        </div>
      </div>
    </div>

    {/* Privacy & Terms */}
    <div className="mb-6 bg-gray-50 rounded-lg p-4 border">
      <p className="text-xs text-gray-600 mb-3">
        Your personal data will be used to process your order, support your experience
        throughout this website, and for other purposes described in our{' '}
        <a className="text-red-600 hover:underline" href="/privacy-policy" target="_blank">
          privacy policy
        </a>.
      </p>
      <div className="flex items-start gap-2">
        <Checkbox id="terms" required />
        <Label className="text-xs cursor-pointer leading-relaxed" htmlFor="terms">
          I have read and agree to the website{' '}
          <a className="text-red-600 hover:underline font-medium" href="/terms" target="_blank">
            terms and conditions
          </a>{' '}
          *
        </Label>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="space-y-4">
      {/* Only show Place Order button for non-Square/non-PayPal */}
      {selectedPaymentMethod !== 'square' &&
       selectedPaymentMethod !== 'card' &&
       selectedPaymentMethod !== 'paypal' && (
        <Button
          className="w-full bg-red-600 hover:bg-red-700 text-white h-14 text-lg font-bold"
          disabled={isProcessing}
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
      )}

      {/* Return links */}
      {selectedPaymentMethod !== 'paypal' && (
        <div className="flex justify-center gap-4 text-sm pt-2">
          <button
            className="text-red-600 hover:underline font-medium"
            type="button"
            onClick={() => setCurrentStep('shipping')}
          >
            « Return to Shipping Options
          </button>
          <span className="text-gray-400">|</span>
          <Link className="text-red-600 hover:underline font-medium" href="/cart">
            « Back to Cart
          </Link>
        </div>
      )}
    </div>

    {/* Trust Badges */}
    <div className="mt-8 pt-6 border-t">
      <div className="flex items-center justify-center gap-8 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-green-600" />
          <div>
            <div className="font-semibold text-gray-700 text-sm">McAfee Secure</div>
            <div>256-Bit Bank Level Security</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="h-6 w-6 text-green-600" />
          <div>
            <div className="font-semibold text-gray-700 text-sm">Norton Secured</div>
            <div>100% Secure Payments</div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
```

---

### Phase 5: Add "Shop With Confidence" Sidebar

**New Component:** `/src/components/checkout/confidence-sidebar.tsx`

```typescript
'use client'

import { Shield, Check } from 'lucide-react'
import Image from 'next/image'

const testimonials = [
  {
    name: 'Emily Martinez',
    company: 'Star Charity Foundation',
    text: '"I called Uvcoatedclubflyers at the last minute and they were able to print the job and have it shipped the next morning."',
    rating: 5,
  },
  {
    name: 'Jason Smith',
    company: 'Creative Solutions Inc.',
    text: '"Our event materials from Uvcoatedclubflyers.com were stunning. Vivid colors, excellent paper quality, and timely delivery. Highly impressed!"',
    rating: 5,
  },
  {
    name: 'Michael Johnson',
    company: "Johnson's Tech Hub",
    text: '"Uvcoatedclubflyers.com is our go-to for all printing needs. Great quality, competitive pricing, and excellent service. Always reliable!"',
    rating: 5,
  },
]

export function ConfidenceSidebar() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
      <h2 className="text-xl font-semibold mb-4">Shop With Confidence</h2>

      {/* Trust Badges */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 text-sm">
          <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
          <span>100% Money-Back Guarantee</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
          <span>Nextday Airport Shipping</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
          <span>Secured Transactions</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
          <span>24 Hour Email Support</span>
        </div>
      </div>

      <hr className="my-6" />

      {/* Testimonials */}
      <h3 className="text-lg font-semibold mb-4">Thousands Of Happy Customers</h3>

      <div className="space-y-4">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="pb-4 border-b last:border-b-0 last:pb-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                {testimonial.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">- {testimonial.name}</div>
                <div className="text-xs text-gray-600">{testimonial.company}</div>
              </div>
              <div className="flex gap-0.5">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-sm">★</span>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">{testimonial.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Update main checkout page to include sidebar:**

```typescript
// At top of page, import:
import { ConfidenceSidebar } from '@/components/checkout/confidence-sidebar'

// In the grid layout (around line 604):
<div className="grid lg:grid-cols-3 gap-8">
  {/* Left Column - Form Steps */}
  <div className="lg:col-span-2">
    {/* ...existing step content... */}
  </div>

  {/* Right Column - Confidence Sidebar */}
  <div className="lg:col-span-1 hidden lg:block">
    <ConfidenceSidebar />
  </div>
</div>
```

---

### Phase 6: Update ShippingRates Component (Right-Aligned Prices)

**File:** `/src/components/checkout/shipping-rates.tsx`

Ensure the component displays prices right-aligned:

```typescript
// Inside the rate mapping:
<div className="flex justify-between items-center py-3 px-4 border rounded-lg hover:bg-gray-50 transition-colors">
  <div className="flex items-center gap-3">
    <input
      type="radio"
      name="shippingRate"
      value={rate.id}
      checked={selectedRate?.id === rate.id}
      onChange={() => onRateSelected(rate)}
      className="w-4 h-4"
    />
    <div>
      <div className="font-medium text-sm">{rate.carrier} - {rate.serviceName}</div>
      <div className="text-xs text-gray-500">
        Est. {rate.estimatedDays} business days
      </div>
    </div>
  </div>
  {/* Price aligned right */}
  <div className="font-bold text-lg text-gray-900">
    ${rate.rateAmount.toFixed(2)}
  </div>
</div>
```

---

### Phase 7: Update createCheckoutData Function

**Add order notes and shipping notes to checkout data:**

```typescript
const createCheckoutData = () => {
  const shippingCost = selectedShippingRate?.rateAmount || 0
  const total = subtotal + tax + shippingCost

  return {
    cartItems: items,
    uploadedImages: uploadedImages,
    customerInfo: {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      company: formData.company,
      phone: formData.phone,
    },
    shippingAddress: {
      street: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      country: 'US',
    },
    billingAddress: billingDifferent
      ? {
          street: formData.billingAddress,
          city: formData.billingCity,
          state: formData.billingState,
          zipCode: formData.billingZipCode,
          country: 'US',
        }
      : null, // null means same as shipping
    shippingRate: selectedShippingRate,
    selectedAirportId,
    orderNotes: orderNotes || null,
    shippingNotes: shippingNotes || null,
    subtotal,
    tax,
    shipping: shippingCost,
    total,
  }
}
```

---

## 📝 Acceptance Criteria (Updated)

### Step 1: Order Summary
- [ ] Shows product details card (not collapsible)
- [ ] Displays all selected options (QUANTITY, SIZE, PAPER, etc.)
- [ ] Shows uploaded images if present (with grid layout)
- [ ] Shows price breakdown (Subtotal, Shipping TBD, Tax, Total)
- [ ] "Continue to Shipping" button works
- [ ] "Back to Cart" link works

### Step 2: Shipping Method
- [ ] Collapsible order summary at top (collapsed by default)
- [ ] Contact information fields visible (Email, Phone, Name, Company)
- [ ] Shipping address fields visible
- [ ] Billing address checkbox: "Billing address same as shipping"
- [ ] Billing address fields hidden by default, shown only if unchecked
- [ ] Shipping rates displayed with prices aligned right
- [ ] **NO coupon code field** (removed as requested)
- [ ] Order notes checkbox → shows textarea when checked
- [ ] Shipping notes checkbox → shows textarea when checked
- [ ] "NEXT PAYMENT OPTIONS →" button works (red, prominent)
- [ ] Form validation works correctly
- [ ] Subtitle: "Complete Address for Shipping Options"

### Step 3: Payment
- [ ] Collapsible order summary at top (expanded by default)
- [ ] Review section shows Email, Phone, Name, Method with "Change" links
- [ ] "Change" links navigate back to Step 2
- [ ] Order notes displayed if provided
- [ ] Shipping notes displayed if provided
- [ ] Credit Card selected by default
- [ ] Square card form VISIBLE immediately when Credit Card selected
- [ ] PayPal selection shows "Pay via PayPal" + PayPal button
- [ ] Cash App Pay selection shows "Pay securely..." + Cash App button
- [ ] Test Cash option works (dev only)
- [ ] Terms checkbox required
- [ ] "PLACE ORDER NOW" button shows correct total (red, large, prominent)
- [ ] Trust badges displayed (McAfee, Norton)
- [ ] Return links work
- [ ] Subtitle: "Confirm your order"

### Sidebar: Shop With Confidence
- [ ] Visible on all steps (desktop only)
- [ ] Shows 4 trust badges (100% Money-Back, Nextday Airport, etc.)
- [ ] Shows 3 customer testimonials with 5-star ratings
- [ ] Sticky positioning works correctly

### General
- [ ] Progress indicator shows 3 steps (not 4)
- [ ] Guest checkout works (no login required)
- [ ] Mobile responsive design (sidebar hidden on mobile)
- [ ] No console errors
- [ ] All existing payment integrations work
- [ ] Order notes and shipping notes saved to database
- [ ] Billing address only sent if different from shipping
- [ ] Cart clears after successful order
- [ ] Success page shows correct information

---

## 🧪 Testing Checklist (Updated)

### Desktop Testing
- [ ] Complete checkout with Credit Card (Square form visible)
- [ ] Complete checkout with PayPal (PayPal button shown)
- [ ] Complete checkout with Cash App Pay (if implemented)
- [ ] Complete checkout with Test Cash
- [ ] Verify "Change" links work on payment step
- [ ] Verify order summary collapses/expands correctly
- [ ] Verify shipping prices are right-aligned and scannable
- [ ] Test order notes checkbox → textarea functionality
- [ ] Test shipping notes checkbox → textarea functionality
- [ ] Test billing address checkbox (show/hide fields)
- [ ] Verify all form validations work
- [ ] Test with both billing same and different addresses

### Mobile Testing
- [ ] Test complete flow on mobile (320px - 414px width)
- [ ] Verify sidebar is hidden on mobile
- [ ] Verify collapsible summary works on mobile
- [ ] Verify form fields are easy to tap
- [ ] Verify payment forms display correctly
- [ ] Test keyboard interactions
- [ ] Test notes checkboxes on mobile

### Edge Cases
- [ ] Test with no uploaded files
- [ ] Test with multiple uploaded files (4+)
- [ ] Test with very long order notes (500+ characters)
- [ ] Test with very long shipping notes
- [ ] Test with missing required fields
- [ ] Test back navigation throughout flow
- [ ] Test browser back button behavior
- [ ] Test with billing address checkbox unchecked
- [ ] Test payment method switching (all 4 methods)

---

## 📚 References (Updated)

### Design References
- UVCoatedClubFlyers.com checkout flow (`.aaaaaa/checkout flow/` directory)
- CC payment method examples (`.aaaaaa/checkout flow/cc/` directory)
- [Checkout UX Analysis](/docs/checkout-ux-analysis-2025-10-11.md)

### Related Stories
- Story 3.3: Address Management Enhancement
- Story 3.4: Shipping Provider Selection
- Story 3.5: Payment Processing Integration

---

## 🚀 Deployment Plan

### Pre-Deployment
1. **Code Review**
   - Review all checkout page changes
   - Review new ConfidenceSidebar component
   - Verify ShippingRates price alignment
   - Verify no breaking changes

2. **Testing**
   - Run all acceptance criteria tests
   - Test all payment methods
   - Mobile testing on real devices
   - Test notes functionality
   - Test billing address toggle

3. **Database Check**
   - Ensure orderNotes field exists in Order table
   - Ensure shippingNotes field exists in Order table
   - Verify billing address fields exist

### Deployment
```bash
npm run build
pm2 stop gangrunprinting
git pull origin main
npm install
npm run build
pm2 restart gangrunprinting
pm2 save
```

### Post-Deployment
1. **Smoke Tests**
   - Complete full checkout flow
   - Test all payment methods
   - Verify notes save correctly
   - Check mobile responsiveness

2. **Monitor**
   - Watch error logs: `pm2 logs gangrunprinting --err`
   - Monitor conversion rates
   - Track cart abandonment
   - Monitor support tickets

---

**Status:** Ready for Implementation
**Last Updated:** 2025-10-11 (Revised)
**Next Step:** Begin Phase 1 implementation
