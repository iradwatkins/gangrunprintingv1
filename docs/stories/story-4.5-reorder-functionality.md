# Story 4.5: Re-Order Functionality

## Story Title

Implement One-Click Re-Order from Order History

## Story Type

Feature Development

## Story Points

5

## Priority

P1 - High (User Experience Enhancement)

## Epic

Epic 4: Customer Account Management

## Story Description

As a **returning customer**, I want to quickly reorder products I've purchased before with one click, so that I can save time on repeat orders without having to reconfigure products from scratch.

## Background

The customer account section (My Account) is 90% complete with all features working EXCEPT re-order functionality. Customers currently have to:

1. Find the product on the site
2. Reconfigure all options (size, quantity, paper stock, etc.)
3. Add to cart manually

This creates friction for repeat customers, our most valuable users. Adding re-order functionality will:

- Increase customer lifetime value
- Reduce order completion time for repeat purchases
- Improve customer satisfaction
- Drive repeat purchase rate

## Acceptance Criteria

### Must Have (P0)

- [ ] **Re-Order Button on Order History:**
  - [ ] "Re-Order" button appears on each order card in `/account/orders`
  - [ ] Button styled prominently (primary color)
  - [ ] Button disabled for cancelled orders
  - [ ] Button shows loading state while processing

- [ ] **Re-Order Button on Order Detail:**
  - [ ] "Re-Order" button on order detail page `/account/orders/[id]`
  - [ ] Positioned prominently near order summary
  - [ ] Same styling and behavior as order history button

- [ ] **Re-Order Confirmation Modal:**
  - [ ] Modal displays when "Re-Order" clicked
  - [ ] Shows list of items from original order
  - [ ] Displays current availability status for each item
  - [ ] Shows price comparison (original vs current)
  - [ ] Allows quantity adjustment for each item
  - [ ] Shows updated total price
  - [ ] "Add to Cart" button to proceed
  - [ ] "Cancel" button to dismiss

- [ ] **Product Availability Check:**
  - [ ] Check if product still exists and is active
  - [ ] Check if product configurations still available
  - [ ] Show "Product no longer available" for discontinued items
  - [ ] Allow partial re-order if some items unavailable

- [ ] **Price Change Detection:**
  - [ ] Compare current price to original order price
  - [ ] Highlight items with price increases (red indicator)
  - [ ] Highlight items with price decreases (green indicator)
  - [ ] Show percentage change for significant differences (>5%)
  - [ ] Display clear warning if total is significantly different

- [ ] **Cart Population:**
  - [ ] Add all available items to cart on confirmation
  - [ ] Preserve original product configurations
  - [ ] Use adjusted quantities if customer modified them
  - [ ] Show success toast: "X items added to cart"
  - [ ] Redirect to cart page after adding

### Should Have (P1)

- [ ] **Configuration Modification:**
  - [ ] "Customize" button on each item in modal
  - [ ] Opens product configuration for that item
  - [ ] Allows changing size, paper stock, add-ons, etc.
  - [ ] Returns to re-order modal after customization

- [ ] **Smart Recommendations:**
  - [ ] If product discontinued, suggest similar products
  - [ ] "You may also like..." based on order history
  - [ ] Show most frequently ordered items

- [ ] **Bulk Actions:**
  - [ ] "Re-Order All" button if multiple orders selected
  - [ ] Checkbox selection on order history page
  - [ ] Combine items from multiple orders

### Nice to Have (P2)

- [ ] **Recurring Orders:**
  - [ ] "Set up recurring order" option
  - [ ] Choose frequency (weekly, monthly, quarterly)
  - [ ] Automatic reorder on schedule
  - [ ] Email notification before each reorder

- [ ] **Re-Order History:**
  - [ ] Track which orders were reordered
  - [ ] Show "Reordered 3 times" badge on original order
  - [ ] Link between original and reordered orders

## Technical Details

### Re-Order API Endpoint

**File:** `src/app/api/orders/[id]/reorder/route.ts` (new)

```typescript
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user } = await validateRequest()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // 1. Fetch original order with items
  const order = await prisma.order.findUnique({
    where: { id, userId: user.id },
    include: {
      orderItems: {
        include: {
          product: {
            include: {
              productCategory: true,
              productImages: true,
            },
          },
        },
      },
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // 2. Check product availability and get current prices
  const items = []
  for (const orderItem of order.orderItems) {
    const product = await prisma.product.findUnique({
      where: { id: orderItem.productId },
    })

    if (product && product.isActive) {
      // Calculate current price with same configuration
      const currentPrice = await calculatePrice({
        productId: product.id,
        quantity: orderItem.quantity,
        configuration: orderItem.configuration,
      })

      items.push({
        productId: product.id,
        name: orderItem.name,
        quantity: orderItem.quantity,
        configuration: orderItem.configuration,
        originalPrice: orderItem.unitPrice,
        currentPrice,
        priceChanged: Math.abs(currentPrice - orderItem.unitPrice) > 0.01,
        available: true,
      })
    } else {
      items.push({
        productId: orderItem.productId,
        name: orderItem.name,
        available: false,
        reason: !product ? 'Product no longer exists' : 'Product is inactive',
      })
    }
  }

  return NextResponse.json({
    orderId: order.id,
    orderNumber: order.orderNumber,
    orderDate: order.createdAt,
    items,
    originalTotal: order.total,
    currentTotal: items
      .filter((i) => i.available)
      .reduce((sum, i) => sum + i.currentPrice * i.quantity, 0),
  })
}
```

### Add to Cart from Re-Order

**File:** `src/app/api/cart/reorder/route.ts` (new)

```typescript
export async function POST(request: NextRequest) {
  const { user } = await validateRequest()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { items } = await request.json()

  // Add each item to cart
  const cartItems = []
  for (const item of items) {
    const cartItem = await prisma.cartItem.create({
      data: {
        userId: user.id,
        productId: item.productId,
        quantity: item.quantity,
        configuration: item.configuration,
        price: item.currentPrice,
      },
    })
    cartItems.push(cartItem)
  }

  return NextResponse.json({
    success: true,
    itemsAdded: cartItems.length,
    cartItems,
  })
}
```

### Re-Order Modal Component

**File:** `src/components/account/ReOrderModal.tsx` (new)

```typescript
interface ReOrderModalProps {
  orderId: string
  isOpen: boolean
  onClose: () => void
}

export function ReOrderModal({ orderId, isOpen, onClose }: ReOrderModalProps) {
  const [reorderData, setReorderData] = useState(null)
  const [quantities, setQuantities] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchReorderData()
    }
  }, [isOpen, orderId])

  async function fetchReorderData() {
    const response = await fetch(`/api/orders/${orderId}/reorder`, {
      method: 'POST'
    })
    const data = await response.json()
    setReorderData(data)

    // Initialize quantities
    const initialQty = {}
    data.items.forEach(item => {
      if (item.available) {
        initialQty[item.productId] = item.quantity
      }
    })
    setQuantities(initialQty)
  }

  async function handleAddToCart() {
    setLoading(true)
    try {
      const items = reorderData.items
        .filter(item => item.available)
        .map(item => ({
          productId: item.productId,
          quantity: quantities[item.productId] || item.quantity,
          configuration: item.configuration,
          currentPrice: item.currentPrice
        }))

      await fetch('/api/cart/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      })

      toast.success(`${items.length} item(s) added to cart`)
      router.push('/cart')
    } catch (error) {
      toast.error('Failed to add items to cart')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Re-Order #{reorderData?.orderNumber}</DialogTitle>
          <DialogDescription>
            Review and adjust your order before adding to cart
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {reorderData?.items.map(item => (
            <div key={item.productId} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{item.name}</h4>
                  {item.available ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Original price: ${item.originalPrice.toFixed(2)}
                      </p>
                      <p className="text-sm">
                        Current price: ${item.currentPrice.toFixed(2)}
                        {item.priceChanged && (
                          <Badge variant={item.currentPrice > item.originalPrice ? 'destructive' : 'success'}>
                            {item.currentPrice > item.originalPrice ? '▲' : '▼'}
                            {Math.abs(((item.currentPrice - item.originalPrice) / item.originalPrice) * 100).toFixed(0)}%
                          </Badge>
                        )}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Label>Quantity:</Label>
                        <Input
                          type="number"
                          min="1"
                          value={quantities[item.productId] || item.quantity}
                          onChange={(e) => setQuantities({
                            ...quantities,
                            [item.productId]: parseInt(e.target.value)
                          })}
                          className="w-20"
                        />
                      </div>
                    </>
                  ) : (
                    <Badge variant="destructive">{item.reason}</Badge>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${reorderData?.currentTotal.toFixed(2)}</span>
            </div>
            {Math.abs(reorderData?.currentTotal - reorderData?.originalTotal) > 0.01 && (
              <p className="text-sm text-muted-foreground text-right">
                Original total: ${reorderData?.originalTotal.toFixed(2)}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAddToCart} disabled={loading}>
            {loading ? 'Adding...' : 'Add to Cart'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

## Files to Create/Modify

### Backend (New Files)

- `src/app/api/orders/[id]/reorder/route.ts` - Get reorder data
- `src/app/api/cart/reorder/route.ts` - Add reorder items to cart

### Frontend (New Files)

- `src/components/account/ReOrderModal.tsx` - Reorder modal component
- `src/components/account/ReOrderButton.tsx` - Reorder button component

### Frontend (Modifications)

- `src/app/account/orders/page.tsx` - Add re-order button to order cards
- `src/app/account/orders/[id]/page.tsx` - Add re-order button to order detail

## Testing Requirements

### Unit Tests

- [ ] Re-order API endpoint returns correct data
- [ ] Product availability check works correctly
- [ ] Price comparison logic accurate
- [ ] Cart population works with multiple items

### Integration Tests

- [ ] End-to-end re-order flow from order history
- [ ] Re-order with discontinued products
- [ ] Re-order with price changes
- [ ] Re-order with quantity adjustments

### Manual Testing Checklist

- [ ] Click "Re-Order" from order history
- [ ] Modal displays all order items correctly
- [ ] Availability status shown accurately
- [ ] Price changes highlighted correctly
- [ ] Adjust quantities in modal
- [ ] Add to cart and verify items
- [ ] Re-order with some items unavailable
- [ ] Re-order from order detail page
- [ ] Cancel re-order modal

## Dependencies

### Database

- `Order` model (exists)
- `OrderItem` model (exists)
- `CartItem` model (exists)
- No schema changes required ✅

### APIs

- `/api/orders/[id]` - Get order details (exists)
- `/api/cart` - Cart operations (exists)
- Price calculation service (exists)

## Risks & Mitigation

| Risk                           | Impact | Likelihood | Mitigation                                             |
| ------------------------------ | ------ | ---------- | ------------------------------------------------------ |
| Product configurations changed | MEDIUM | MEDIUM     | Validate configuration still valid, offer alternatives |
| Price increased significantly  | MEDIUM | MEDIUM     | Show clear warning, allow customer to adjust           |
| Out of stock                   | LOW    | LOW        | Show availability, suggest similar products            |
| Performance with large orders  | LOW    | LOW        | Limit re-order to reasonable item counts               |

## Success Metrics

- [ ] Re-order button available on all eligible orders
- [ ] Modal displays within 1 second
- [ ] Price comparison accurate 100% of time
- [ ] Successful add to cart rate > 95%
- [ ] Customer satisfaction with feature > 80%

## User Flow

```
Order History Page
  ↓
Click "Re-Order" button
  ↓
Fetch order items + current data
  ↓
Check availability & prices
  ↓
Display Re-Order Modal
  ├── Show available items
  ├── Show unavailable items with reason
  ├── Highlight price changes
  └── Allow quantity adjustment
  ↓
Customer clicks "Add to Cart"
  ↓
Add items to cart
  ↓
Redirect to Cart page
  ↓
Show success message
```

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Manual testing checklist complete
- [ ] Code reviewed and approved
- [ ] Deployed to staging and tested
- [ ] Performance tested with various order sizes
- [ ] Documentation updated
- [ ] Ready for production deployment

## Related Stories

- Story 4.1-4.4: Account pages (dependency - already complete)
- Story 3.1: Shopping Cart (dependency - already complete)
- Story 4.6: Profile Management (related)
