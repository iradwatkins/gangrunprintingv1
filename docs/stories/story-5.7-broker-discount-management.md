# Story 5.7: Broker Discount Management

## Story Title
Build Broker Discount Configuration and Management System

## Story Type
Feature Development

## Story Points
8

## Priority
P1 - High (Business Model Critical)

## Epic
Epic 5: Admin Order & User Management

## Story Description

As an **administrator**, I need to configure and manage category-specific discounts for broker accounts, so that resellers can receive their negotiated discounts automatically when placing orders.

## Background

Gang Run Printing operates a broker/reseller business model where certain customers (brokers) receive category-specific discounts. Currently:
- ✅ Database schema supports broker discounts (`User.isBroker`, `User.brokerDiscounts`)
- ✅ Broker status can be set on user accounts
- ❌ No UI to configure broker discounts
- ❌ Discounts not automatically applied during pricing
- ❌ No broker performance tracking

This story implements the missing UI layer for the broker system, which is critical for the business model to function.

## Acceptance Criteria

### Must Have (P0)
- [ ] **Broker List Page** (`/admin/brokers`)
  - [ ] Table showing all broker accounts
  - [ ] Columns: Name, Company, Email, Active Discounts, Total Orders, Total Revenue
  - [ ] "Configure Discounts" button per broker
  - [ ] Filter by active/inactive brokers
  - [ ] Search by name/company/email
  - [ ] Sort by revenue, orders, name
  - [ ] Badge showing number of active discounts

- [ ] **Discount Configuration Modal:**
  - [ ] Opens when "Configure Discounts" clicked
  - [ ] Shows broker name and company
  - [ ] List of all product categories
  - [ ] Checkbox to enable discount per category
  - [ ] Input field for discount percentage (0-100%)
  - [ ] "Apply Global Discount" option (sets same % for all categories)
  - [ ] Preview calculation showing example savings
  - [ ] "Save" and "Cancel" buttons
  - [ ] Confirmation message on save

- [ ] **Customer Detail Integration:**
  - [ ] "Configure Broker Discounts" button on customer detail page (`/admin/customers/[id]`)
  - [ ] Button only visible if customer is marked as broker
  - [ ] Opens same discount configuration modal
  - [ ] Shows current discount configuration

- [ ] **Discount Display:**
  - [ ] Customer detail shows active discount summary
  - [ ] Table of categories with discount percentages
  - [ ] Highlight categories with discounts
  - [ ] Show "No discounts" if none configured

- [ ] **Discount Application:**
  - [ ] Pricing API checks if user is broker
  - [ ] Applies category discount to product pricing
  - [ ] Shows "Broker Discount" line item in pricing breakdown
  - [ ] Discount visible in cart
  - [ ] Discount visible in order summary
  - [ ] Discount visible in order confirmation

### Should Have (P1)
- [ ] **Advanced Discount Rules:**
  - [ ] Minimum order amount for discount to apply
  - [ ] Maximum order amount cap
  - [ ] Effective date (discount starts on date)
  - [ ] Expiry date (discount ends on date)
  - [ ] Discount active/inactive toggle

- [ ] **Discount History:**
  - [ ] Log all discount configuration changes
  - [ ] Show who made changes and when
  - [ ] View history on customer detail
  - [ ] Audit trail for discount modifications

- [ ] **Broker Performance:**
  - [ ] Broker performance metrics page
  - [ ] Total orders by broker
  - [ ] Total revenue by broker
  - [ ] Average order value
  - [ ] Discount savings per broker
  - [ ] ROI calculations

- [ ] **Bulk Operations:**
  - [ ] Apply same discount to multiple brokers
  - [ ] Copy discount configuration between brokers
  - [ ] Disable all discounts for a broker
  - [ ] Export broker discount configuration

### Nice to Have (P2)
- [ ] **Tiered Discounts:**
  - [ ] Different discount % based on order volume
  - [ ] Tier 1: Orders under $1,000 → 5% discount
  - [ ] Tier 2: Orders $1,000-$5,000 → 10% discount
  - [ ] Tier 3: Orders over $5,000 → 15% discount

- [ ] **Discount Templates:**
  - [ ] Save discount configurations as templates
  - [ ] Apply template to new brokers
  - [ ] Standard, Premium, Enterprise templates

- [ ] **Notifications:**
  - [ ] Email broker when discounts updated
  - [ ] Notify admin when discount expires
  - [ ] Alert when discount reaches usage cap

## Technical Details

### Database Schema (Already Exists)
```prisma
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  name            String?
  role            UserRole @default(CUSTOMER)
  isBroker        Boolean  @default(false)
  brokerDiscounts Json?    // Category-specific discounts
}
```

### Broker Discounts JSON Structure
```typescript
interface BrokerDiscountConfig {
  discounts: {
    categoryId: string
    categoryName: string
    discountPercent: number
    minOrderAmount?: number
    maxOrderAmount?: number
    effectiveDate?: string
    expiryDate?: string
    isActive: boolean
  }[]
  globalDiscount?: number
  lastUpdated: string
  updatedBy: string
}
```

### Broker List API Endpoint
**File:** `src/app/api/admin/brokers/route.ts` (new)

```typescript
export async function GET(request: NextRequest) {
  const { user } = await validateRequest()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get all broker accounts
  const brokers = await prisma.user.findMany({
    where: { isBroker: true },
    include: {
      orders: {
        select: {
          id: true,
          total: true,
          status: true
        }
      }
    }
  })

  // Calculate metrics for each broker
  const brokersWithMetrics = brokers.map(broker => {
    const totalOrders = broker.orders.length
    const totalRevenue = broker.orders.reduce((sum, order) => sum + order.total, 0)
    const activeDiscounts = broker.brokerDiscounts
      ? (broker.brokerDiscounts as BrokerDiscountConfig).discounts.filter(d => d.isActive).length
      : 0

    return {
      id: broker.id,
      name: broker.name,
      email: broker.email,
      company: broker.company || 'N/A',
      totalOrders,
      totalRevenue,
      activeDiscounts,
      brokerDiscounts: broker.brokerDiscounts
    }
  })

  return NextResponse.json({ brokers: brokersWithMetrics })
}
```

### Update Broker Discounts API
**File:** `src/app/api/admin/users/[id]/broker-discounts/route.ts` (new)

```typescript
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user } = await validateRequest()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { discounts, globalDiscount } = await request.json()

  // Validate broker exists
  const broker = await prisma.user.findUnique({
    where: { id }
  })

  if (!broker || !broker.isBroker) {
    return NextResponse.json({ error: 'Broker not found' }, { status: 404 })
  }

  // Build discount configuration
  const discountConfig: BrokerDiscountConfig = {
    discounts: discounts.map(d => ({
      categoryId: d.categoryId,
      categoryName: d.categoryName,
      discountPercent: d.discountPercent,
      minOrderAmount: d.minOrderAmount,
      maxOrderAmount: d.maxOrderAmount,
      effectiveDate: d.effectiveDate,
      expiryDate: d.expiryDate,
      isActive: d.isActive ?? true
    })),
    globalDiscount: globalDiscount || null,
    lastUpdated: new Date().toISOString(),
    updatedBy: user.id
  }

  // Update broker discounts
  await prisma.user.update({
    where: { id },
    data: {
      brokerDiscounts: discountConfig as any
    }
  })

  // Log discount change
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'UPDATE_BROKER_DISCOUNTS',
      entityType: 'User',
      entityId: id,
      changes: discountConfig as any
    }
  })

  return NextResponse.json({
    success: true,
    message: 'Broker discounts updated successfully'
  })
}
```

### Apply Broker Discount in Pricing
**File:** `src/services/PricingService.ts` (modify existing)

```typescript
async function calculatePrice(params: PriceCalculationParams): Promise<number> {
  const { productId, quantity, configuration, userId } = params

  // Get product
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { productCategory: true }
  })

  if (!product) throw new Error('Product not found')

  // Calculate base price
  let basePrice = calculateBasePrice(product, quantity, configuration)

  // Apply broker discount if applicable
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (user?.isBroker && user.brokerDiscounts) {
      const discountConfig = user.brokerDiscounts as BrokerDiscountConfig

      // Find category-specific discount
      const categoryDiscount = discountConfig.discounts.find(
        d => d.categoryId === product.categoryId && d.isActive
      )

      if (categoryDiscount) {
        // Check if discount is within date range
        const now = new Date()
        const isEffective = !categoryDiscount.effectiveDate || new Date(categoryDiscount.effectiveDate) <= now
        const notExpired = !categoryDiscount.expiryDate || new Date(categoryDiscount.expiryDate) >= now

        // Check if order meets min/max amount requirements
        const meetsMin = !categoryDiscount.minOrderAmount || basePrice >= categoryDiscount.minOrderAmount
        const meetsMax = !categoryDiscount.maxOrderAmount || basePrice <= categoryDiscount.maxOrderAmount

        if (isEffective && notExpired && meetsMin && meetsMax) {
          const discountAmount = basePrice * (categoryDiscount.discountPercent / 100)
          basePrice -= discountAmount
        }
      }
    }
  }

  return basePrice
}
```

### Broker Configuration Component
**File:** `src/components/admin/BrokerDiscountModal.tsx` (new)

```typescript
interface BrokerDiscountModalProps {
  brokerId: string
  brokerName: string
  currentDiscounts: BrokerDiscountConfig | null
  isOpen: boolean
  onClose: () => void
  onSave: (discounts: any) => Promise<void>
}

export function BrokerDiscountModal({
  brokerId,
  brokerName,
  currentDiscounts,
  isOpen,
  onClose,
  onSave
}: BrokerDiscountModalProps) {
  const [categories, setCategories] = useState([])
  const [discounts, setDiscounts] = useState({})
  const [globalDiscount, setGlobalDiscount] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCategories()
    if (currentDiscounts) {
      initializeDiscounts(currentDiscounts)
    }
  }, [currentDiscounts])

  async function fetchCategories() {
    const response = await fetch('/api/product-categories')
    const data = await response.json()
    setCategories(data)
  }

  function initializeDiscounts(config: BrokerDiscountConfig) {
    const discountMap = {}
    config.discounts.forEach(d => {
      discountMap[d.categoryId] = d.discountPercent
    })
    setDiscounts(discountMap)
    setGlobalDiscount(config.globalDiscount?.toString() || '')
  }

  function handleGlobalDiscount(value: string) {
    setGlobalDiscount(value)
    const percent = parseFloat(value)
    if (!isNaN(percent) && percent >= 0 && percent <= 100) {
      const newDiscounts = {}
      categories.forEach(cat => {
        newDiscounts[cat.id] = percent
      })
      setDiscounts(newDiscounts)
    }
  }

  async function handleSave() {
    setLoading(true)
    try {
      const discountArray = Object.entries(discounts)
        .filter(([_, percent]) => percent > 0)
        .map(([categoryId, percent]) => {
          const category = categories.find(c => c.id === categoryId)
          return {
            categoryId,
            categoryName: category?.name || '',
            discountPercent: percent as number,
            isActive: true
          }
        })

      await onSave({
        discounts: discountArray,
        globalDiscount: globalDiscount ? parseFloat(globalDiscount) : null
      })

      toast.success('Broker discounts updated successfully')
      onClose()
    } catch (error) {
      toast.error('Failed to update broker discounts')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Broker Discounts - {brokerName}</DialogTitle>
          <DialogDescription>
            Set category-specific discount percentages for this broker
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Global Discount */}
          <div className="border rounded-lg p-4 bg-muted">
            <Label>Apply Global Discount (Optional)</Label>
            <div className="flex gap-2 items-center mt-2">
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={globalDiscount}
                onChange={(e) => handleGlobalDiscount(e.target.value)}
                placeholder="e.g., 10"
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">
                % discount on all categories
              </span>
            </div>
          </div>

          {/* Category-Specific Discounts */}
          <div className="space-y-2">
            <Label>Category-Specific Discounts</Label>
            <div className="grid gap-3">
              {categories.map(category => (
                <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={discounts[category.id] || ''}
                      onChange={(e) => setDiscounts({
                        ...discounts,
                        [category.id]: parseFloat(e.target.value) || 0
                      })}
                      placeholder="0"
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground w-8">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="border rounded-lg p-4 bg-blue-50">
            <h4 className="font-medium mb-2">Discount Preview</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Original Price: $100.00</span>
                <span className="text-muted-foreground">Example</span>
              </div>
              <div className="flex justify-between text-green-600 font-medium">
                <span>Discount (15%): -$15.00</span>
                <span>You Save 15%</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-1">
                <span>Final Price: $85.00</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Discounts'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

## Files to Create/Modify

### Backend (New Files)
- `src/app/api/admin/brokers/route.ts` - List all brokers with metrics
- `src/app/api/admin/users/[id]/broker-discounts/route.ts` - CRUD for broker discounts
- `src/app/api/admin/brokers/[id]/performance/route.ts` - Broker performance metrics

### Frontend (New Files)
- `src/app/admin/brokers/page.tsx` - Broker list page
- `src/components/admin/BrokerDiscountModal.tsx` - Discount configuration modal
- `src/components/admin/BrokerList.tsx` - Broker table component
- `src/components/admin/BrokerPerformance.tsx` - Performance metrics display

### Frontend (Modifications)
- `src/app/admin/customers/[id]/page.tsx` - Add "Configure Broker Discounts" button
- `src/services/PricingService.ts` - Apply broker discounts during pricing

### Database (Modifications - Optional)
- Consider adding `AuditLog` table for discount change tracking
- Consider adding `BrokerPerformance` table for metrics caching

## Testing Requirements

### Unit Tests
- [ ] Broker discount API returns correct data
- [ ] Discount application logic works correctly
- [ ] Discount validation (min/max, dates) functions properly
- [ ] Global discount overrides category discounts

### Integration Tests
- [ ] End-to-end broker discount configuration
- [ ] Discount application in pricing calculation
- [ ] Discount display in cart and checkout
- [ ] Discount saved and persisted correctly

### Manual Testing Checklist
- [ ] Navigate to `/admin/brokers`
- [ ] View list of all brokers
- [ ] Click "Configure Discounts"
- [ ] Set category-specific discounts
- [ ] Apply global discount
- [ ] Save and verify discounts saved
- [ ] Log in as broker user
- [ ] Add product to cart
- [ ] Verify discount applied in cart
- [ ] Complete checkout
- [ ] Verify discount in order summary

## Dependencies

### Database
- `User` model with `isBroker` and `brokerDiscounts` (exists)
- `ProductCategory` model (exists)
- `Order` model (exists)

### APIs
- `/api/product-categories` (exists)
- `/api/pricing/calculate` (exists, needs modification)

## Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Discount calculation errors | HIGH | MEDIUM | Comprehensive unit tests, preview calculations |
| Performance with many categories | MEDIUM | LOW | Cache category list, efficient queries |
| Unauthorized discount access | CRITICAL | LOW | Strict admin authentication, audit logging |
| Discount not applied correctly | HIGH | MEDIUM | Integration tests, staging environment testing |

## Success Metrics

- [ ] Broker discount configuration page functional
- [ ] All brokers can have discounts configured
- [ ] Discounts apply correctly 100% of time
- [ ] Admin can configure discounts in < 2 minutes
- [ ] Broker performance metrics accurate

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Manual testing checklist complete
- [ ] Code reviewed and approved
- [ ] Deployed to staging and tested
- [ ] Admin documentation created
- [ ] Broker notification email template ready
- [ ] Ready for production deployment

## Related Stories
- Story 5.5: Customer Management Interface (dependency)
- Story 5.6: Customer Detail View (dependency)
- Story 3.5: Payment Processing (related - discounts affect final price)