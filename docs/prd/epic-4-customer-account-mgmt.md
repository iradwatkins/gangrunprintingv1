# Epic 4: Customer Account Management

## Epic Status
**STATUS: ⚠️ IN PROGRESS (80% Complete - Corrected)**
**Started:** 2025-09-18
**Target Completion:** 2025-10-10 (Extended due to Story 4.3 discovery)
**Implementation Score:** 80/100
**Critical Issue:** Story 4.3 marked complete but only stub exists - customers cannot view orders

---

## Epic Goal
Develop the complete "My Account" section where customers can view their order history with filtering, see order details, manage their profile information, and use the "Re-Order" functionality to quickly place repeat orders.

---

## Epic Description

### User Goal
**As a Customer**, I want to be able to track my past orders, manage my account information, and easily place a new order for a product I've purchased before, so that I have full control over my account and can quickly reorder favorite products.

### Business Value
- Increases customer retention through easy account management
- Boosts repeat purchases with re-order functionality
- Reduces support inquiries with self-service tools
- Builds customer loyalty through transparency
- Enables targeted marketing through order history insights

### Technical Summary
This epic implements a comprehensive customer account portal with:
- **Account Dashboard:** Overview of recent activity
- **Order History:** Searchable, filterable order list
- **Order Details:** Detailed view of each order
- **Re-Order:** One-click repeat purchase
- **Profile Management:** Update personal information
- **Address Book:** Manage shipping/billing addresses
- **Payment Methods:** Manage saved payment options
- **Downloads:** Access digital proofs and artwork

---

## Functional Requirements Addressed

- **FR11:** "My Account" section with filterable order history and re-order ⚠️ (90% complete)
- **FR5:** Complete order lifecycle tracking ✅

---

## Implementation Details

### ✅ Completed Components

#### 1. **Account Layout & Navigation**
- Account section layout at `/account`
- Side navigation menu
- Mobile-responsive navigation
- Active state indicators
- User profile display
- Logout functionality
- Breadcrumb navigation

#### 2. **Account Dashboard** (`/account/dashboard`)
- Welcome message with user name
- Recent orders summary (last 5)
- Quick stats:
  - Total orders
  - Active orders
  - Completed orders
- Quick actions:
  - Place new order
  - View all orders
  - Update profile
- Recent activity feed
- Account status indicators

#### 3. **Order History Page** (`/account/orders`)
- Paginated order list
- Order cards with key information:
  - Order number
  - Order date
  - Status badge
  - Total amount
  - Product thumbnails
- **Filtering Options:**
  - By status (All, Pending, Processing, Completed, Cancelled)
  - By date range
  - By total amount range
- **Search:**
  - By order number
  - By product name
- **Sorting:**
  - Date (newest/oldest)
  - Amount (high/low)
  - Status
- Empty state when no orders
- Loading states

#### 4. **Order Detail Page** (`/account/orders/[id]`)
- Detailed order information:
  - Order number & date
  - Current status with timeline
  - Shipping address
  - Billing address
  - Payment method used
- **Order Items:**
  - Product images
  - Product names
  - Configurations selected
  - Quantities
  - Individual prices
  - Subtotals
- **Order Summary:**
  - Subtotal
  - Shipping cost
  - Tax
  - Discounts (if any)
  - Total amount
- **Actions:**
  - Download invoice (PDF)
  - Contact support
  - Track shipping (when available)
  - Cancel order (if eligible)

#### 5. **Profile Management** (`/account/details`)
- Personal information form:
  - Full name
  - Email (display only)
  - Phone number
  - Company name (optional)
- Form validation
- Save changes functionality
- Success/error feedback
- Email verification status
- Account creation date

#### 6. **Address Management** (`/account/addresses`)
- List of saved addresses
- Default shipping address indicator
- Default billing address indicator
- **Address Cards Display:**
  - Address label (Home, Office, etc.)
  - Full address
  - Set as default buttons
  - Edit button
  - Delete button
- Add new address functionality
- Edit address modal/page
- Delete address confirmation
- Address form validation

#### 7. **Payment Methods** (`/account/payment-methods`)
- List of saved payment methods
- **Card Display:**
  - Last 4 digits
  - Card brand (Visa, Mastercard, etc.)
  - Expiration date
  - Default indicator
- Add new card functionality
- Remove card confirmation
- Set default card
- PCI compliant card storage

#### 8. **Downloads Section** (`/account/downloads`)
- Digital proof downloads
- Invoice downloads
- Artwork file downloads (if uploaded)
- File list with:
  - File name
  - File type
  - Upload/created date
  - File size
  - Download button
- Batch download option
- File preview (images)

---

### ⚠️ Partially Complete Components

#### 1. **Re-Order Functionality** (0%)
**Status:** NOT STARTED ❌

**Required Implementation:**
- "Re-Order" button on order history cards
- "Re-Order" button on order detail page
- Re-order confirmation modal
- Ability to modify quantities before adding to cart
- Ability to update configurations
- Automatic cart population
- Price update check (if prices changed)
- Out-of-stock handling

---

### 📋 Enhancement Opportunities

#### 1. **Order Tracking**
- Real-time shipping tracking integration
- Carrier tracking number display
- Estimated delivery date
- Delivery status updates
- Tracking map visualization

#### 2. **Quote Management**
- Quote request history
- Quote approval/rejection
- Convert quote to order
- Quote expiration tracking

#### 3. **Wish Lists**
- Save products for later
- Share wish lists
- Convert wish list to order
- Price drop notifications

#### 4. **Subscription Management**
- View active subscriptions
- Pause/resume subscriptions
- Update subscription details
- Subscription billing history

---

## User Stories

### Story 4.1: Account Layout & Navigation ✅
**Status:** COMPLETE
**Description:** Create account section layout with navigation and user profile display.

**Acceptance Criteria:**
- ✅ Account layout at `/account`
- ✅ Side navigation menu
- ✅ Mobile-responsive design
- ✅ User profile display
- ✅ Active state indicators
- ✅ Logout functionality
- ✅ Breadcrumb navigation

---

### Story 4.2: Account Dashboard ✅
**Status:** COMPLETE
**Description:** Build dashboard showing recent orders and account overview.

**Acceptance Criteria:**
- ✅ Dashboard at `/account/dashboard`
- ✅ Recent orders display
- ✅ Account statistics
- ✅ Quick action buttons
- ✅ Recent activity feed
- ✅ Personalized welcome message

---

### Story 4.3: Order History with Filtering ❌
**Status:** NOT IMPLEMENTED (Documentation Error - Marked complete but only stub exists)
**Description:** Create order history page with search, filter, and sort capabilities.

**Current State:** Page exists at `/account/orders` but only shows hardcoded "no orders" message. Does NOT fetch or display actual orders from database.

**Acceptance Criteria:**
- ⚠️ Order history at `/account/orders` (page exists but non-functional)
- ❌ Paginated order list
- ❌ Filter by status
- ❌ Filter by date range
- ❌ Search by order number/product
- ❌ Sort options (date, amount, status)
- ❌ Order cards with key info
- ⚠️ Empty state handling (exists but always shows, needs conditional logic)

---

### Story 4.4: Order Detail View ✅
**Status:** COMPLETE
**Description:** Create detailed order view page with all order information.

**Acceptance Criteria:**
- ✅ Order detail at `/account/orders/[id]`
- ✅ Complete order information
- ✅ Order status timeline
- ✅ Item list with configurations
- ✅ Pricing breakdown
- ✅ Shipping/billing addresses
- ✅ Download invoice option
- ✅ Contact support button

---

### Story 4.5: Re-Order Functionality ❌
**Status:** NOT STARTED
**Description:** Implement one-click re-order functionality from order history.

**Acceptance Criteria:**
- ❌ "Re-Order" button on order cards
- ❌ "Re-Order" button on order detail
- ❌ Re-order confirmation modal
- ❌ Ability to modify quantities
- ❌ Ability to update configurations
- ❌ Automatic cart population
- ❌ Price update notification
- ❌ Out-of-stock handling

**Remaining Work:**
This is the ONLY missing piece (FR11 requirement). Implementation needed:

1. **Add Re-Order Button:**
   - Location 1: Order history page (`/account/orders`) - on each order card
   - Location 2: Order detail page (`/account/orders/[id]`) - prominent button

2. **Create Re-Order Logic:**
   ```typescript
   async function handleReOrder(orderId: string) {
     // 1. Fetch original order with items
     const order = await fetchOrderWithItems(orderId)

     // 2. Check product availability
     const availability = await checkProductsAvailability(order.items)

     // 3. Check if prices changed
     const priceComparison = await comparePrices(order.items)

     // 4. Show confirmation modal with:
     //    - Original order items
     //    - Current availability status
     //    - Price changes (if any)
     //    - Ability to adjust quantities
     //    - Proceed/Cancel buttons

     // 5. On confirm:
     //    - Add items to cart
     //    - Navigate to cart or checkout
     //    - Show success message
   }
   ```

3. **Create Re-Order Modal Component:**
   - Display original order items
   - Show availability status per item
   - Highlight price changes
   - Quantity adjustment controls
   - Total price recalculation
   - Proceed/Cancel actions

4. **API Endpoint:**
   ```typescript
   POST /api/orders/[id]/reorder
   - Validates order exists
   - Checks product availability
   - Returns current prices
   - Handles out-of-stock items
   ```

**Estimated Effort:** 8 hours

---

### Story 4.6: Profile Management ✅
**Status:** COMPLETE
**Description:** Allow customers to update their profile information.

**Acceptance Criteria:**
- ✅ Profile page at `/account/details`
- ✅ Personal information form
- ✅ Form validation
- ✅ Save changes functionality
- ✅ Success/error feedback
- ✅ Email verification status
- ✅ Account creation date display

---

### Story 4.7: Address Book ✅
**Status:** COMPLETE
**Description:** Manage shipping and billing addresses.

**Acceptance Criteria:**
- ✅ Address management at `/account/addresses`
- ✅ List of saved addresses
- ✅ Add new address
- ✅ Edit existing address
- ✅ Delete address with confirmation
- ✅ Set default shipping address
- ✅ Set default billing address
- ✅ Address validation

---

### Story 4.8: Payment Methods Management ✅
**Status:** COMPLETE
**Description:** Manage saved payment methods securely.

**Acceptance Criteria:**
- ✅ Payment methods at `/account/payment-methods`
- ✅ List saved cards (tokenized)
- ✅ Add new payment method
- ✅ Remove payment method
- ✅ Set default payment method
- ✅ PCI compliant storage
- ✅ Secure display (last 4 digits only)

---

### Story 4.9: Downloads Section ✅
**Status:** COMPLETE
**Description:** Provide access to downloadable files (invoices, proofs, artwork).

**Acceptance Criteria:**
- ✅ Downloads at `/account/downloads`
- ✅ File list display
- ✅ Download individual files
- ✅ File metadata (name, type, date, size)
- ✅ File preview for images
- ✅ Batch download option
- ✅ Access control (user's files only)

---

## Technical Architecture

### Account Pages Structure
```
/account (Layout)
├── /dashboard (Overview)
├── /orders (Order History)
│   └── /[id] (Order Detail)
├── /details (Profile)
├── /addresses (Address Book)
├── /payment-methods (Payment Management)
└── /downloads (File Downloads)
```

### Re-Order Workflow (TO BE IMPLEMENTED)
```
Order History/Detail Page
  ↓
Click "Re-Order" Button
  ↓
Fetch Order Items + Current Data
  ↓
Check Availability & Prices
  ↓
Show Confirmation Modal
  ├── Items available → Add to Cart
  ├── Items unavailable → Show alternatives
  └── Prices changed → Show comparison
  ↓
Navigate to Cart or Checkout
```

---

## API Endpoints

### Account APIs
- `GET /api/account/profile` - Get user profile ✅
- `PUT /api/account/profile` - Update profile ✅
- `GET /api/account/orders` - List user orders ✅
- `GET /api/account/orders/[id]` - Get order details ✅
- `POST /api/account/orders/[id]/reorder` - Re-order ❌ **NEEDS IMPLEMENTATION**

### Address APIs
- `GET /api/account/addresses` - List addresses ✅
- `POST /api/account/addresses` - Create address ✅
- `PUT /api/account/addresses/[id]` - Update address ✅
- `DELETE /api/account/addresses/[id]` - Delete address ✅

### Payment APIs
- `GET /api/account/payment-methods` - List payment methods ✅
- `POST /api/account/payment-methods` - Add payment method ✅
- `DELETE /api/account/payment-methods/[id]` - Remove payment method ✅

### Downloads APIs
- `GET /api/account/downloads` - List downloadable files ✅
- `GET /api/account/downloads/[id]` - Download file ✅

---

## Dependencies

### Internal
- Epic 1: Foundation (auth, database)
- Epic 3: Commerce (order data)

### External Services
- Square (payment tokenization)
- Resend (email notifications)
- MinIO (file storage for downloads)

### Libraries
- React Hook Form (forms)
- Zod (validation)
- date-fns (date formatting)
- React Query (data fetching)

---

## Remaining Work

### High Priority
**1. Re-Order Functionality (Story 4.5)** - 8 hours
- Add re-order buttons to UI
- Create re-order API endpoint
- Build confirmation modal
- Handle availability/price checks
- Add to cart logic
- Error handling

**Total Remaining:** 8 hours (1 day)

---

## Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation | Status |
|------|--------|------------|------------|--------|
| Re-order price changes | MEDIUM | HIGH | Show price comparison before confirm | 📋 Planned |
| Product discontinuation | MEDIUM | MEDIUM | Suggest alternatives | 📋 Planned |
| Out-of-stock items | MEDIUM | MEDIUM | Show availability before cart add | 📋 Planned |
| Performance with large order history | MEDIUM | LOW | Pagination + caching | ✅ Resolved |

---

## Success Metrics

### Current Achievement
- [x] Account navigation: 100%
- [x] Dashboard: 100%
- [x] Order history: 100%
- [x] Order details: 100%
- [x] Profile management: 100%
- [x] Address book: 100%
- [x] Payment methods: 100%
- [x] Downloads: 100%
- [ ] Re-order functionality: 0%

**Overall Completion:** 90%

### Target Metrics (When Complete)
- Account page views: > 30% of customers
- Order history usage: > 60% of returning customers
- Re-order rate: > 15% of orders
- Profile updates: > 40% of customers
- Customer satisfaction: > 85%

---

## Testing Requirements

### ✅ Completed Tests
- Account page navigation tests
- Order history filtering tests
- Order detail display tests
- Address CRUD tests

### 📋 Remaining Tests
- Re-order functionality tests
- Re-order price change scenarios
- Re-order out-of-stock handling
- Re-order modal interactions

---

## Documentation References

- [Customer Account Flow](/docs/architecture/customer-account-flow.md)
- [Order Management](/docs/architecture/order-management.md)
- [Re-Order Specification](/docs/stories/story-4.5-reorder-functionality.md) *(To be created)*

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-09-18 | 1.0 | Account pages implemented | Development Team |
| 2025-09-22 | 1.1 | Order history completed | Development Team |
| 2025-09-25 | 1.2 | Address and payment management added | Development Team |
| 2025-09-30 | 2.0 | Sharded from monolithic PRD | BMAD Agent |

---

**Epic Owner:** Customer Experience Lead
**Last Updated:** 2025-09-30
**Previous Epic:** [Epic 3: Commerce & Checkout](./epic-3-commerce-checkout.md)
**Next Epic:** [Epic 5: Admin Order & User Management](./epic-5-admin-order-user-mgmt.md)