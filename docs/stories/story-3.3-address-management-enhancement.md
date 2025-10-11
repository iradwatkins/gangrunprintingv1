# Story 3.3: Address Management Enhancement

## Story Title

Implement Address Book and Validation for Checkout

## Story Type

Feature Enhancement

## Story Points

5

## Priority

P1 - High (Checkout UX)

## Epic

Epic 3: Core Commerce & Checkout

## Story Description

As a **customer**, I want to save my shipping and billing addresses for future orders and have them validated automatically, so that I can checkout faster and avoid shipping errors.

## Background

The checkout address system is currently 70% complete:

- ✅ Basic address forms exist (shipping & billing)
- ✅ "Same as shipping" toggle works
- ✅ Client-side validation with Zod
- ❌ No address book (addresses not saved)
- ❌ No default address selection
- ❌ No address validation API
- ❌ No international address support

Customers must re-enter their address on every order, which:

- Increases checkout friction
- Slows down repeat purchases
- Leads to address entry errors
- Creates poor user experience

This story completes the address management system to match customer expectations and reduce cart abandonment.

## Acceptance Criteria

### Must Have (P0)

- [ ] **Address Book Storage:**
  - [ ] Addresses saved to user account in database
  - [ ] Each address has label (e.g., "Home", "Office", "Mom's House")
  - [ ] Addresses linked to user via `userId`
  - [ ] Full address details stored (street, city, state, zip, country)
  - [ ] Timestamps for created/updated dates

- [ ] **Address Selection at Checkout:**
  - [ ] "Choose saved address" dropdown on checkout page
  - [ ] Dropdown shows all user's saved addresses
  - [ ] Address displayed in formatted, readable format
  - [ ] "Add new address" option in dropdown
  - [ ] Selected address populates form fields
  - [ ] Can edit selected address before continuing

- [ ] **Default Address Handling:**
  - [ ] User can mark one address as "Default Shipping"
  - [ ] User can mark one address as "Default Billing"
  - [ ] Default shipping address auto-selected at checkout
  - [ ] Default billing address auto-selected if different from shipping
  - [ ] "Set as default" checkbox on address form

- [ ] **Save Address During Checkout:**
  - [ ] "Save this address" checkbox on checkout form
  - [ ] Address saved to account if checkbox checked
  - [ ] Address available in dropdown on next order
  - [ ] Works for both guest→registered and existing users

- [ ] **Address Management in Account Section:**
  - [ ] View all saved addresses at `/account/addresses`
  - [ ] Add new address
  - [ ] Edit existing address
  - [ ] Delete address (with confirmation)
  - [ ] Set/unset default shipping address
  - [ ] Set/unset default billing address
  - [ ] Address validation on save

### Should Have (P1)

- [ ] **Address Validation API:**
  - [ ] Integrate USPS Address Validation API (or similar)
  - [ ] Validate address before saving
  - [ ] Show suggestions if address invalid
  - [ ] Allow user to override validation
  - [ ] Display validation errors clearly
  - [ ] Validate US addresses only initially

- [ ] **Smart Address Features:**
  - [ ] Autocomplete street addresses (Google Places API)
  - [ ] Auto-populate city/state from zip code
  - [ ] Detect and suggest address corrections
  - [ ] Flag potentially invalid addresses
  - [ ] PO Box detection and handling

- [ ] **Address Formatting:**
  - [ ] Display addresses in standardized format
  - [ ] Different formats for different countries
  - [ ] Proper capitalization
  - [ ] Remove duplicate spaces/characters
  - [ ] Standardize street abbreviations

### Nice to Have (P2)

- [ ] **International Address Support:**
  - [ ] Support addresses in Canada
  - [ ] Support addresses in UK
  - [ ] Support addresses in Australia
  - [ ] Country selection dropdown
  - [ ] Region/province field for non-US
  - [ ] Postal code validation per country
  - [ ] Dynamic form fields based on country

- [ ] **Address Verification:**
  - [ ] Email verification for new addresses
  - [ ] SMS verification option
  - [ ] Address usage tracking
  - [ ] Confidence score display

- [ ] **Bulk Address Operations:**
  - [ ] Import addresses from CSV
  - [ ] Export addresses to CSV
  - [ ] Merge duplicate addresses
  - [ ] Archive old addresses

## Technical Details

### Database Schema (Existing - Needs Usage)

```prisma
model Address {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  label       String?  // "Home", "Office", etc.
  firstName   String
  lastName    String
  company     String?
  addressLine1 String
  addressLine2 String?
  city        String
  state       String
  postalCode  String
  country     String   @default("US")
  phone       String?

  isDefaultShipping Boolean @default(false)
  isDefaultBilling  Boolean @default(false)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
  @@index([userId, isDefaultShipping])
  @@index([userId, isDefaultBilling])
}
```

### Address API Endpoints

**File:** `src/app/api/addresses/route.ts` (new)

```typescript
// GET /api/addresses - Get all addresses for current user
export async function GET(request: NextRequest) {
  const { user } = await validateRequest()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefaultShipping: 'desc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json({ addresses })
}

// POST /api/addresses - Create new address
export async function POST(request: NextRequest) {
  const { user } = await validateRequest()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await request.json()

  // Validate address
  const validationResult = await validateAddress(data)
  if (!validationResult.isValid && !data.overrideValidation) {
    return NextResponse.json(
      {
        error: 'Address validation failed',
        suggestions: validationResult.suggestions,
      },
      { status: 400 }
    )
  }

  // If setting as default, unset other defaults
  if (data.isDefaultShipping) {
    await prisma.address.updateMany({
      where: { userId: user.id, isDefaultShipping: true },
      data: { isDefaultShipping: false },
    })
  }

  if (data.isDefaultBilling) {
    await prisma.address.updateMany({
      where: { userId: user.id, isDefaultBilling: true },
      data: { isDefaultBilling: false },
    })
  }

  const address = await prisma.address.create({
    data: {
      ...data,
      userId: user.id,
    },
  })

  return NextResponse.json({ address })
}
```

**File:** `src/app/api/addresses/[id]/route.ts` (new)

```typescript
// PUT /api/addresses/[id] - Update address
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user } = await validateRequest()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const data = await request.json()

  // Verify ownership
  const existingAddress = await prisma.address.findFirst({
    where: { id, userId: user.id },
  })

  if (!existingAddress) {
    return NextResponse.json({ error: 'Address not found' }, { status: 404 })
  }

  // Validate address
  const validationResult = await validateAddress(data)
  if (!validationResult.isValid && !data.overrideValidation) {
    return NextResponse.json(
      {
        error: 'Address validation failed',
        suggestions: validationResult.suggestions,
      },
      { status: 400 }
    )
  }

  // Handle default status
  if (data.isDefaultShipping && !existingAddress.isDefaultShipping) {
    await prisma.address.updateMany({
      where: { userId: user.id, isDefaultShipping: true, id: { not: id } },
      data: { isDefaultShipping: false },
    })
  }

  if (data.isDefaultBilling && !existingAddress.isDefaultBilling) {
    await prisma.address.updateMany({
      where: { userId: user.id, isDefaultBilling: true, id: { not: id } },
      data: { isDefaultBilling: false },
    })
  }

  const address = await prisma.address.update({
    where: { id },
    data,
  })

  return NextResponse.json({ address })
}

// DELETE /api/addresses/[id] - Delete address
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user } = await validateRequest()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Verify ownership
  const address = await prisma.address.findFirst({
    where: { id, userId: user.id },
  })

  if (!address) {
    return NextResponse.json({ error: 'Address not found' }, { status: 404 })
  }

  await prisma.address.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
```

### Address Validation Service

**File:** `src/services/AddressValidationService.ts` (new)

```typescript
interface AddressValidationResult {
  isValid: boolean
  suggestions?: Address[]
  errors?: string[]
  confidence?: 'high' | 'medium' | 'low'
}

export async function validateAddress(address: Partial<Address>): Promise<AddressValidationResult> {
  // Only validate US addresses initially
  if (address.country !== 'US') {
    return { isValid: true, confidence: 'low' }
  }

  try {
    // Option 1: USPS API (free for US addresses)
    const response = await fetch('https://secure.shippingapis.com/ShippingAPI.dll', {
      method: 'POST',
      body: buildUSPSXML(address),
    })

    const result = await parseUSPSResponse(response)

    if (result.isValid) {
      return {
        isValid: true,
        suggestions: result.standardizedAddress ? [result.standardizedAddress] : undefined,
        confidence: 'high',
      }
    } else {
      return {
        isValid: false,
        errors: result.errors,
        suggestions: result.suggestions,
        confidence: 'low',
      }
    }
  } catch (error) {
    console.error('Address validation error:', error)
    // Fail open - don't block checkout if validation service is down
    return { isValid: true, confidence: 'low' }
  }
}

// Alternative: Google Address Validation API (paid, more accurate)
async function validateAddressWithGoogle(
  address: Partial<Address>
): Promise<AddressValidationResult> {
  const response = await fetch('https://addressvalidation.googleapis.com/v1:validateAddress', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
    },
    body: JSON.stringify({
      address: {
        regionCode: address.country,
        locality: address.city,
        administrativeArea: address.state,
        postalCode: address.postalCode,
        addressLines: [address.addressLine1, address.addressLine2].filter(Boolean),
      },
    }),
  })

  const data = await response.json()

  return {
    isValid: data.result.verdict.validationGranularity !== 'OTHER',
    suggestions: data.result.address ? [formatGoogleAddress(data.result.address)] : undefined,
    confidence: data.result.verdict.addressComplete ? 'high' : 'medium',
  }
}
```

### Checkout Address Selection Component

**File:** `src/components/checkout/AddressSelection.tsx` (modify existing)

```typescript
interface AddressSelectionProps {
  type: 'shipping' | 'billing'
  selectedAddress?: Address
  onAddressSelect: (address: Address | null) => void
}

export function AddressSelection({ type, selectedAddress, onAddressSelect }: AddressSelectionProps) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showNewForm, setShowNewForm] = useState(false)
  const [saveAddress, setSaveAddress] = useState(true)

  useEffect(() => {
    fetchAddresses()
  }, [])

  async function fetchAddresses() {
    const response = await fetch('/api/addresses')
    const data = await response.json()
    setAddresses(data.addresses)

    // Auto-select default address
    const defaultAddress = data.addresses.find(a =>
      type === 'shipping' ? a.isDefaultShipping : a.isDefaultBilling
    )
    if (defaultAddress && !selectedAddress) {
      onAddressSelect(defaultAddress)
    }
  }

  async function handleSaveNewAddress(address: Address) {
    if (saveAddress) {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address)
      })
      const data = await response.json()
      setAddresses([...addresses, data.address])
      onAddressSelect(data.address)
    } else {
      onAddressSelect(address)
    }
    setShowNewForm(false)
  }

  return (
    <div className="space-y-4">
      <Label>
        {type === 'shipping' ? 'Shipping' : 'Billing'} Address
      </Label>

      {addresses.length > 0 && !showNewForm ? (
        <>
          <Select
            value={selectedAddress?.id || 'new'}
            onValueChange={(value) => {
              if (value === 'new') {
                setShowNewForm(true)
                onAddressSelect(null)
              } else {
                const address = addresses.find(a => a.id === value)
                onAddressSelect(address || null)
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose saved address" />
            </SelectTrigger>
            <SelectContent>
              {addresses.map(address => (
                <SelectItem key={address.id} value={address.id}>
                  {address.label ? `${address.label} - ` : ''}
                  {address.addressLine1}, {address.city}, {address.state}
                </SelectItem>
              ))}
              <SelectItem value="new">
                <Plus className="inline h-4 w-4 mr-2" />
                Add new address
              </SelectItem>
            </SelectContent>
          </Select>

          {selectedAddress && (
            <Card className="p-4">
              <div className="text-sm space-y-1">
                <p className="font-medium">
                  {selectedAddress.firstName} {selectedAddress.lastName}
                </p>
                {selectedAddress.company && <p>{selectedAddress.company}</p>}
                <p>{selectedAddress.addressLine1}</p>
                {selectedAddress.addressLine2 && <p>{selectedAddress.addressLine2}</p>}
                <p>
                  {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}
                </p>
                {selectedAddress.phone && <p>Phone: {selectedAddress.phone}</p>}
              </div>
              <Button
                variant="link"
                size="sm"
                onClick={() => setShowNewForm(true)}
                className="mt-2"
              >
                Edit address
              </Button>
            </Card>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <AddressForm
            initialAddress={selectedAddress || undefined}
            onSave={handleSaveNewAddress}
            onCancel={() => {
              setShowNewForm(false)
              if (addresses.length > 0) {
                onAddressSelect(addresses[0])
              }
            }}
          />

          <div className="flex items-center space-x-2">
            <Checkbox
              id="save-address"
              checked={saveAddress}
              onCheckedChange={(checked) => setSaveAddress(checked as boolean)}
            />
            <Label htmlFor="save-address" className="text-sm">
              Save this address to my account
            </Label>
          </div>
        </div>
      )}
    </div>
  )
}
```

## Files to Create/Modify

### Backend (New Files)

- `src/app/api/addresses/route.ts` - List and create addresses
- `src/app/api/addresses/[id]/route.ts` - Update and delete addresses
- `src/services/AddressValidationService.ts` - Address validation logic

### Frontend (New Files)

- `src/components/checkout/AddressSelection.tsx` - Address selection component
- `src/components/account/AddressBook.tsx` - Address management page
- `src/components/account/AddressForm.tsx` - Address add/edit form

### Frontend (Modifications)

- `src/app/(customer)/checkout/page.tsx` - Integrate AddressSelection
- `src/app/account/addresses/page.tsx` - Already exists, needs enhancement

### Database

- `Address` model already exists in Prisma schema
- No schema changes required ✅

## Testing Requirements

### Unit Tests

- [ ] Address CRUD operations work correctly
- [ ] Default address logic works (only one default per type)
- [ ] Address validation service returns correct results
- [ ] Address formatting produces correct output

### Integration Tests

- [ ] Save address during checkout
- [ ] Select saved address on next order
- [ ] Set default shipping address
- [ ] Set default billing address
- [ ] Edit address updates correctly
- [ ] Delete address removes from list

### Manual Testing Checklist

- [ ] Complete checkout, save new address
- [ ] Start new order, see saved address in dropdown
- [ ] Select saved address from dropdown
- [ ] Mark address as default shipping
- [ ] Start new order, default address auto-selected
- [ ] Go to `/account/addresses`
- [ ] Add new address from account page
- [ ] Edit existing address
- [ ] Delete address (confirm it's removed)
- [ ] Set different default billing address
- [ ] Test with invalid address (validation)
- [ ] Test address autocomplete (if implemented)

## Dependencies

### Database

- `Address` model (exists)
- `User` model (exists)

### External Services (Optional)

- USPS Address Validation API (free, US only)
- Google Address Validation API (paid, global)
- Google Places API (autocomplete)

### Environment Variables

```env
# Optional - for address validation
USPS_USER_ID=...
GOOGLE_MAPS_API_KEY=...
```

## Risks & Mitigation

| Risk                                      | Impact | Likelihood | Mitigation                       |
| ----------------------------------------- | ------ | ---------- | -------------------------------- |
| Address validation API downtime           | MEDIUM | LOW        | Fail open - don't block checkout |
| Invalid addresses causing shipping issues | MEDIUM | MEDIUM     | Validation + manual review       |
| Performance with many addresses           | LOW    | LOW        | Pagination, indexing             |
| International address complexity          | MEDIUM | LOW        | Start US-only, expand later      |

## Success Metrics

- [ ] Address book functional for all users
- [ ] Default address auto-selected 100% of time
- [ ] Address validation accuracy > 95%
- [ ] Checkout time reduced by 30% for repeat customers
- [ ] Address-related support tickets reduced by 50%

## User Flow

```
Checkout Page
  ↓
Shipping Address Section
  ├── Has saved addresses?
  │   ├── YES → Show dropdown with saved addresses
  │   │   ├── Select address → Auto-populate form
  │   │   └── "Add new" → Show address form
  │   └── NO → Show address form
  │       └── "Save address" checkbox
  ↓
Address Form Filled
  ↓
Validate Address (optional)
  ├── Valid → Continue
  ├── Invalid → Show suggestions
  └── Override → Allow continue
  ↓
Save Address (if checkbox checked)
  ↓
Continue to Shipping Method
```

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Manual testing checklist complete
- [ ] Code reviewed and approved
- [ ] Address validation working (at least basic)
- [ ] Account address management working
- [ ] Deployed to staging and tested
- [ ] Documentation updated
- [ ] Ready for production deployment

## Related Stories

- Story 3.4: Shipping Method Selection (related)
- Story 3.5: Payment Processing Integration (related)
- Story 4.7: Address Book (duplicate - already in account section)
