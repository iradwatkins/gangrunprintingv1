# Phase 2 Product Requirements Document (PRD)

**Custom E-commerce Printing Platform - Post-MVP Enhancements**

## Document Information

| Field            | Value                      |
| ---------------- | -------------------------- |
| **Version**      | 1.0                        |
| **Date**         | October 3, 2025            |
| **Status**       | Draft                      |
| **Author**       | Product Team               |
| **Phase**        | Phase 2 - Post-MVP         |
| **Dependencies** | Phase 1 MVP (75% complete) |

---

## Executive Summary

Phase 2 builds upon the successful Phase 1 MVP launch by adding critical marketing, automation, and advanced features that were deferred from the initial release. This phase focuses on customer retention, operational efficiency, and revenue growth.

**Key Objectives:**

1. Complete Marketing & CRM platform (Epic 6 - deferred from Phase 1)
2. Finish vendor automation workflows (Epic 7 - 50% complete)
3. Add advanced payment options (PayPal, CashApp)
4. Enhance admin capabilities
5. Improve customer experience with advanced features

**Timeline:** 12-16 weeks
**Team Size:** 3-4 developers + 1 designer
**Budget Estimate:** TBD based on resource allocation

---

## Phase 1 Completion Status

### What Was Delivered in Phase 1

**Epic 1: Foundation & Theming** - 95% Complete ✅

- Next.js 15 + PostgreSQL + Prisma architecture
- Lucia Auth authentication
- Dark/light theme system
- Production deployment (Docker + PM2)

**Epic 2: Product Catalog & Configuration** - 100% Complete ✅

- Dynamic product configurator
- Real-time pricing calculator
- 11 quantity options, 6+ sizes, paper stocks, coatings
- Add-on system (Digital Proof, Folding, Design Services)
- **Critical Fix (Oct 3, 2025):** Product configuration loading

**Epic 3: Core Commerce & Checkout** - 90% Complete ✅

- Shopping cart with persistence
- Multi-step checkout
- FedEx shipping integration
- Square payment processing
- Cash payment option
- Order confirmation emails

**Epic 4: Customer Account Management** - 95% Complete ✅

- User registration and authentication
- Order history and tracking
- Reorder functionality
- Profile management

**Epic 5: Admin Order & User Management** - 85% Complete ✅

- Admin dashboard
- Order management
- Customer management
- Broker discount system

### What Was Deferred to Phase 2

**Epic 6: Marketing & CRM** - 0% Complete ❌

- CRM/Contacts hub
- Email builder
- Email broadcasts
- Marketing automation
- Analytics dashboard

**Epic 7: Vendor Automation** - 50% Complete ⏳

- N8N workflows incomplete
- Vendor email templates needed
- Order routing logic needed
- Status update webhooks needed

**Additional Gaps:**

- PayPal integration
- CashApp integration
- Theme editor admin UI
- Order filtering/search
- Advanced reporting

---

## Phase 2 Goals

### Primary Goals

1. **Complete Marketing Infrastructure**
   - Build full CRM/Contacts system
   - Create email builder and campaign tools
   - Implement marketing automation
   - Launch analytics dashboard

2. **Operational Excellence**
   - Complete vendor automation (n8n workflows)
   - Add advanced admin capabilities
   - Implement comprehensive reporting
   - Enhance order processing efficiency

3. **Revenue Growth**
   - Add additional payment methods
   - Implement upsell/cross-sell features
   - Launch loyalty/rewards program
   - Enable promotional campaigns

4. **Customer Experience**
   - Advanced product features
   - Mobile app (PWA enhancements)
   - Live chat support
   - Enhanced self-service tools

### Success Metrics

**Marketing & CRM:**

- Email open rate: >25%
- Click-through rate: >5%
- Campaign conversion rate: >2%
- Customer segmentation: 5+ active segments

**Operations:**

- Vendor automation rate: >90%
- Order processing time: <30 minutes
- Manual intervention: <10% of orders
- Error rate: <1%

**Revenue:**

- Additional payment methods usage: >20% of orders
- Upsell acceptance rate: >15%
- Repeat customer rate: >30%
- Average order value increase: >10%

**Customer Experience:**

- CSAT score: >4.5/5
- Support ticket reduction: >30%
- Mobile traffic conversion: Match desktop
- Reorder rate: >25%

---

## Phase 2 Epics

### Epic 6: Complete Marketing & CRM Platform (Priority: CRITICAL)

**Description:** Build the full marketing suite that was deferred from Phase 1. This is essential for customer retention and revenue growth.

**User Stories:**

**6.1 CRM/Contacts Hub**

- As an Admin, I want a central customer database so I can manage relationships
- As an Admin, I want to tag and segment customers so I can target communications
- As an Admin, I want to see customer activity history so I can personalize interactions
- As an Admin, I want to track customer lifetime value so I can identify VIPs

**6.2 Email Builder**

- As an Admin, I want a drag-and-drop email builder so I can create professional emails
- As an Admin, I want email templates so I can quickly create campaigns
- As an Admin, I want to preview emails so I can ensure they look correct
- As an Admin, I want to test emails so I can verify functionality

**6.3 Email Broadcasts**

- As an Admin, I want to send one-time campaigns so I can promote products
- As an Admin, I want to schedule email sends so I can optimize timing
- As an Admin, I want to segment recipients so I can target messaging
- As an Admin, I want to track campaign performance so I can measure ROI

**6.4 Marketing Automation**

- As an Admin, I want to create automated workflows so I can nurture customers
- As an Admin, I want trigger-based emails so I can respond to customer actions
- As an Admin, I want multi-step sequences so I can guide customer journeys
- As an Admin, I want A/B testing so I can optimize campaigns

**6.5 Analytics Dashboard**

- As an Admin, I want email performance metrics so I can measure success
- As an Admin, I want revenue attribution so I can track campaign ROI
- As an Admin, I want customer insights so I can understand behavior
- As an Admin, I want exportable reports so I can share with stakeholders

**Technical Requirements:**

- Email service integration (Resend already configured)
- Template storage and versioning
- Campaign scheduling system
- Analytics tracking (open rates, clicks, conversions)
- Webhook integration for tracking
- Database schema for campaigns, templates, automation rules

**Acceptance Criteria:**

- [ ] Can create and save email templates
- [ ] Can segment customer lists (5+ criteria)
- [ ] Can send broadcast campaigns
- [ ] Can create 3+ automation workflows
- [ ] Analytics dashboard shows key metrics
- [ ] Email deliverability >95%

**Effort Estimate:** 6-8 weeks
**Story Points:** 55 points

---

### Epic 7: Complete Vendor Automation (Priority: HIGH)

**Description:** Finish the N8N integration for automated vendor order placement. Currently 50% complete.

**User Stories:**

**7.1 N8N Workflow Configuration**

- As an Admin, I want orders automatically sent to vendors so I don't have to manually forward
- As an Admin, I want vendor-specific routing so orders go to the right partner
- As an Admin, I want order formatting so vendors receive properly structured data
- As an Admin, I want error notifications so I know when automation fails

**7.2 Vendor Response Handling**

- As an Admin, I want vendor confirmations tracked so I know orders are received
- As an Admin, I want status updates from vendors so I can update customers
- As an Admin, I want automated tracking numbers so customers get shipping info
- As an Admin, I want exception handling so failed orders are flagged

**7.3 Advanced Order Routing**

- As an Admin, I want load balancing across vendors so I distribute orders fairly
- As an Admin, I want vendor capacity tracking so I don't overload partners
- As an Admin, I want fallback routing so orders go to backup vendors if needed
- As an Admin, I want priority rules so rush orders get special handling

**Technical Requirements:**

- N8N workflow templates
- Email parsing for vendor responses
- Webhook endpoints for status updates
- Vendor capacity database
- Order routing algorithm
- Error logging and alerting

**Acceptance Criteria:**

- [ ] 90%+ of orders automatically sent to vendors
- [ ] Vendor confirmations tracked within 1 hour
- [ ] Status updates reflected in customer account
- [ ] Error rate <1%
- [ ] Manual intervention <10% of orders

**Effort Estimate:** 2-3 weeks
**Story Points:** 21 points

---

### Epic 8: Advanced Payment Integration (Priority: HIGH)

**Description:** Add PayPal and CashApp payment options to increase checkout conversion.

**User Stories:**

**8.1 PayPal Integration**

- As a Customer, I want to pay with PayPal so I can use my preferred method
- As a Customer, I want PayPal Express Checkout so I can skip form entry
- As a Customer, I want to save my PayPal account so I can checkout faster
- As an Admin, I want PayPal transaction tracking so I can reconcile payments

**8.2 CashApp Integration**

- As a Customer, I want to pay with CashApp so I can use my preferred method
- As a Customer, I want instant CashApp payment so checkout is fast
- As an Admin, I want CashApp transaction tracking so I can reconcile payments

**8.3 Saved Payment Methods**

- As a Customer, I want to save payment methods so I don't re-enter them
- As a Customer, I want to manage saved methods so I can update or remove them
- As a Customer, I want to set a default method so checkout is one-click
- As an Admin, I want secure tokenization so customer data is protected

**Technical Requirements:**

- PayPal SDK integration
- CashApp Business API integration
- Payment method tokenization
- PCI compliance verification
- Webhook handling for async payments
- Refund/dispute handling

**Acceptance Criteria:**

- [ ] PayPal checkout flow complete
- [ ] CashApp checkout flow complete
- [ ] Saved payment methods working
- [ ] Payment method usage >20% of orders
- [ ] No security vulnerabilities
- [ ] Refund process documented

**Effort Estimate:** 3-4 weeks
**Story Points:** 34 points

---

### Epic 9: Enhanced Admin Capabilities (Priority: MEDIUM)

**Description:** Advanced admin features for operational efficiency.

**User Stories:**

**9.1 Advanced Order Management**

- As an Admin, I want to filter/search orders so I can find them quickly
- As an Admin, I want bulk status updates so I can process multiple orders
- As an Admin, I want to create manual orders so I can handle phone orders
- As an Admin, I want to duplicate orders so I can quickly create similar ones

**9.2 Theme Editor UI**

- As an Admin, I want to upload logos so I can brand the site
- As an Admin, I want to customize colors so I can match my brand
- As an Admin, I want to select fonts so I can control typography
- As an Admin, I want to preview changes so I can see before publishing

**9.3 Reporting & Analytics**

- As an Admin, I want sales reports so I can track revenue
- As an Admin, I want product performance reports so I can optimize catalog
- As an Admin, I want customer reports so I can understand my audience
- As an Admin, I want to export reports so I can analyze in Excel

**9.4 Inventory Management**

- As an Admin, I want to track vendor capacity so I don't overbook
- As an Admin, I want to set product availability so I can manage stock
- As an Admin, I want low inventory alerts so I can reorder
- As an Admin, I want to pause products so I can temporarily disable them

**Technical Requirements:**

- Advanced database queries with filtering
- Bulk update API endpoints
- Manual order creation workflow
- Theme preview system
- Report generation engine
- Data export functionality

**Acceptance Criteria:**

- [ ] Order search/filter by 5+ criteria
- [ ] Bulk update 10+ orders at once
- [ ] Manual order creation working
- [ ] Theme editor publishes changes live
- [ ] 5+ standard reports available
- [ ] Inventory alerts functioning

**Effort Estimate:** 4-5 weeks
**Story Points:** 34 points

---

### Epic 10: Customer Experience Enhancements (Priority: MEDIUM)

**Description:** Advanced features to improve customer satisfaction and retention.

**User Stories:**

**10.1 Product Reviews & Ratings**

- As a Customer, I want to leave reviews so I can share my experience
- As a Customer, I want to see reviews so I can make informed decisions
- As a Customer, I want to upload photos so I can show results
- As an Admin, I want to moderate reviews so I can maintain quality

**10.2 Wishlist & Favorites**

- As a Customer, I want to save products so I can purchase later
- As a Customer, I want to share wishlists so I can get input
- As a Customer, I want wishlist notifications so I know about sales
- As an Admin, I want wishlist analytics so I can understand demand

**10.3 Live Chat Support**

- As a Customer, I want live chat so I can get instant help
- As a Customer, I want chat history so I can reference past conversations
- As an Admin, I want chat management so I can handle multiple conversations
- As an Admin, I want canned responses so I can reply quickly

**10.4 Enhanced PWA Features**

- As a Customer, I want push notifications so I get order updates
- As a Customer, I want offline browsing so I can view products anywhere
- As a Customer, I want to install the app so I can access it like a native app
- As a Customer, I want app shortcuts so I can quickly access features

**Technical Requirements:**

- Review database schema
- Photo upload and storage (MinIO)
- Review moderation queue
- Wishlist database tables
- Real-time chat system (WebSocket)
- PWA manifest and service worker
- Push notification service

**Acceptance Criteria:**

- [ ] Reviews visible on product pages
- [ ] Review moderation workflow working
- [ ] Wishlists save and sync across devices
- [ ] Live chat response time <2 minutes
- [ ] PWA installable on iOS and Android
- [ ] Push notifications delivered reliably

**Effort Estimate:** 5-6 weeks
**Story Points:** 44 points

---

### Epic 11: Revenue Optimization (Priority: MEDIUM)

**Description:** Features specifically designed to increase average order value and repeat purchases.

**User Stories:**

**11.1 Upsells & Cross-sells**

- As a Customer, I want product recommendations so I can discover related items
- As a Customer, I want bundle discounts so I can save on multiple items
- As a Customer, I want "frequently bought together" suggestions so I don't miss items
- As an Admin, I want to configure upsell rules so I can maximize revenue

**11.2 Loyalty & Rewards**

- As a Customer, I want to earn points so I can get rewards
- As a Customer, I want to redeem points so I can save money
- As a Customer, I want tier status so I can unlock benefits
- As an Admin, I want to configure reward rules so I can incentivize behavior

**11.3 Promotional System**

- As a Customer, I want coupon codes so I can get discounts
- As a Customer, I want sale notifications so I know about deals
- As a Customer, I want abandoned cart recovery so I complete purchases
- As an Admin, I want to create promotions so I can drive sales

**11.4 Referral Program**

- As a Customer, I want to refer friends so I can earn rewards
- As a Customer, I want to share referral links so friends can get discounts
- As a Customer, I want to track referrals so I can see my rewards
- As an Admin, I want referral analytics so I can measure program success

**Technical Requirements:**

- Recommendation engine
- Bundle pricing logic
- Points/rewards database
- Tier calculation system
- Coupon code validation
- Abandoned cart tracking
- Email automation for recovery
- Referral link generation

**Acceptance Criteria:**

- [ ] Upsell acceptance rate >15%
- [ ] Loyalty program enrollment >40%
- [ ] Average order value increase >10%
- [ ] Coupon redemption tracking working
- [ ] Abandoned cart recovery emails sent
- [ ] Referral tracking accurate

**Effort Estimate:** 6-7 weeks
**Story Points:** 55 points

---

## Phase 2 Phased Rollout

### Sprint 1-2: Marketing & CRM Foundation (Weeks 1-4)

**Epic 6.1 & 6.2: CRM Hub + Email Builder**

**Stories:**

1. Design CRM database schema
2. Build customer profile pages
3. Implement tagging system
4. Create customer segmentation
5. Build email template editor
6. Create responsive email templates
7. Add email preview functionality
8. Implement email send functionality

**Deliverables:**

- CRM database operational
- Customer tagging working
- Basic email builder functional
- 3+ email templates available

**Sprint Goal:** Foundation for marketing automation

---

### Sprint 3-4: Marketing Automation (Weeks 5-8)

**Epic 6.3, 6.4, & 6.5: Broadcasts + Automation + Analytics**

**Stories:**

1. Build campaign creation UI
2. Implement recipient selection
3. Add campaign scheduling
4. Build automation workflow editor
5. Create trigger system
6. Implement email tracking
7. Build analytics dashboard
8. Add campaign reporting

**Deliverables:**

- Can send broadcast campaigns
- 3+ automation workflows active
- Analytics dashboard live
- Email tracking operational

**Sprint Goal:** Complete marketing platform

---

### Sprint 5: Vendor Automation Completion (Weeks 9-10)

**Epic 7: Complete Vendor Automation**

**Stories:**

1. Configure N8N workflows
2. Build vendor email templates
3. Implement order routing logic
4. Add vendor response parsing
5. Create status update webhooks
6. Build error handling
7. Add vendor capacity tracking
8. Create admin monitoring dashboard

**Deliverables:**

- 90%+ orders automated
- Vendor confirmations tracked
- Status updates working
- Error rate <1%

**Sprint Goal:** Eliminate manual vendor processing

---

### Sprint 6-7: Payment & Admin Enhancements (Weeks 11-14)

**Epic 8 & 9: Payments + Admin Features**

**Stories:**

1. Integrate PayPal SDK
2. Integrate CashApp API
3. Build saved payment methods
4. Add payment method management
5. Build order filtering/search
6. Add bulk order operations
7. Create theme editor UI
8. Build reporting engine

**Deliverables:**

- PayPal checkout working
- CashApp checkout working
- Saved payments functional
- Advanced admin features live

**Sprint Goal:** Complete payment options and admin tools

---

### Sprint 8: Customer Experience & Revenue (Weeks 15-16)

**Epic 10 & 11: Selected Features**

**Focus on highest-value items:**

1. Product reviews system
2. Wishlist functionality
3. Upsell/cross-sell engine
4. Promotional system basics

**Deliverables:**

- Reviews visible on products
- Wishlists working
- Upsells increasing AOV
- Basic promotions active

**Sprint Goal:** Improve retention and revenue

---

## Technical Architecture

### New Infrastructure Required

**Marketing Platform:**

- Email service: Resend (already configured) ✅
- Template storage: Database + file system
- Campaign tracking: Database + analytics
- Automation engine: Custom + N8N integration

**Vendor Automation:**

- N8N workflows (service running on port 5678) ✅
- Email parsing service
- Webhook receivers
- Queue system for retries

**Payment Processing:**

- PayPal SDK
- CashApp Business API
- PCI-compliant tokenization
- Webhook handling

**PWA Enhancements:**

- Service worker updates
- Push notification service (Firebase/OneSignal)
- Offline storage expansion
- App manifest improvements

### Database Schema Updates

**New Tables Needed:**

```sql
-- Marketing & CRM
EmailTemplate
EmailCampaign
EmailSend
EmailEvent (opens, clicks)
AutomationWorkflow
AutomationRun
CustomerTag
CustomerSegment
CustomerActivity

-- Vendor Automation
VendorCapacity
OrderRouting
VendorResponse
AutomationLog

-- Payment
SavedPaymentMethod
PaymentTransaction
RefundRequest

-- Customer Experience
ProductReview
ReviewPhoto
Wishlist
WishlistItem
ChatMessage
ChatSession

-- Revenue
Coupon
Promotion
LoyaltyPoints
ReferralLink
```

### API Endpoints

**Marketing:**

- POST /api/admin/crm/customers
- GET /api/admin/crm/segments
- POST /api/admin/email/templates
- POST /api/admin/email/campaigns
- GET /api/admin/analytics/campaigns

**Vendor:**

- POST /api/webhooks/vendor-confirmation
- POST /api/webhooks/vendor-status
- GET /api/admin/vendors/capacity

**Payments:**

- POST /api/payments/paypal/create
- POST /api/payments/cashapp/create
- GET /api/customer/payment-methods
- DELETE /api/customer/payment-methods/:id

**Customer:**

- POST /api/products/:id/reviews
- POST /api/wishlist/add
- GET /api/wishlist
- POST /api/chat/message

---

## Risk Assessment

### High-Priority Risks

**1. Marketing Platform Complexity**

- Risk: Email builder and automation are complex features
- Impact: Could delay entire Phase 2
- Mitigation: Use third-party service (Mailchimp/Klaviyo) if needed
- Probability: Medium

**2. PayPal/CashApp Integration Issues**

- Risk: Payment provider APIs may have unexpected issues
- Impact: Customer checkout failures
- Mitigation: Thorough testing, staged rollout
- Probability: Low

**3. Vendor Automation Reliability**

- Risk: N8N workflows may fail in edge cases
- Impact: Orders not sent to vendors
- Mitigation: Monitoring, fallback to manual, error alerts
- Probability: Medium

### Medium-Priority Risks

**4. Resource Availability**

- Risk: Team members may be unavailable
- Impact: Timeline delays
- Mitigation: Clear sprint planning, buffer time
- Probability: Medium

**5. Scope Creep**

- Risk: Additional features requested during development
- Impact: Timeline and budget overruns
- Mitigation: Strict change control process
- Probability: High

### Low-Priority Risks

**6. Third-Party Service Outages**

- Risk: Resend, PayPal, etc. may have downtime
- Impact: Temporary feature unavailability
- Mitigation: Error handling, user notifications
- Probability: Low

---

## Success Criteria

### Phase 2 Complete When:

**Marketing & CRM:**

- [ ] CRM manages 100+ customer profiles
- [ ] Email campaigns sent to segmented lists
- [ ] 3+ automation workflows active
- [ ] Analytics dashboard tracks key metrics
- [ ] Email deliverability >95%

**Operations:**

- [ ] 90%+ orders automated to vendors
- [ ] Manual intervention <10%
- [ ] Order processing time <30 minutes
- [ ] Error rate <1%

**Payments:**

- [ ] PayPal checkout functional
- [ ] CashApp checkout functional
- [ ] Saved payment methods working
- [ ] Payment method usage >20%

**Admin:**

- [ ] Order filtering by 5+ criteria
- [ ] Theme editor allows customization
- [ ] 5+ reports available
- [ ] Bulk operations working

**Customer:**

- [ ] Reviews visible on products
- [ ] Wishlists functional
- [ ] PWA installable
- [ ] Upsells increase AOV >10%

---

## Out of Scope (Future Phases)

**Phase 3 Candidates:**

- Multi-language support (Spanish)
- Advanced inventory management
- Wholesale portal
- API for third-party integrations
- Mobile native apps (iOS/Android)
- AI-powered recommendations
- Video product demos
- 3D product previews
- Social media integration
- Influencer/affiliate program

---

## Timeline & Resource Allocation

### Estimated Timeline

**Total Duration:** 12-16 weeks

| Sprint     | Weeks | Focus                | Epic                   |
| ---------- | ----- | -------------------- | ---------------------- |
| Sprint 1-2 | 1-4   | CRM & Email Builder  | Epic 6.1, 6.2          |
| Sprint 3-4 | 5-8   | Marketing Automation | Epic 6.3, 6.4, 6.5     |
| Sprint 5   | 9-10  | Vendor Automation    | Epic 7                 |
| Sprint 6-7 | 11-14 | Payments & Admin     | Epic 8, 9              |
| Sprint 8   | 15-16 | Customer & Revenue   | Epic 10, 11 (selected) |

### Team Requirements

**Core Team:**

- 2 Full-stack Developers
- 1 Frontend Specialist
- 1 Backend Specialist
- 1 UI/UX Designer
- 1 QA Engineer
- 1 Product Manager (part-time)

**Total Story Points:** ~243 points
**Velocity Assumption:** 30 points/sprint
**Sprints Required:** 8 sprints (16 weeks)

---

## Dependencies

### Phase 1 Completion

Must be 100% complete before starting Phase 2:

- [ ] All Phase 1 bugs fixed
- [ ] 10-15 real products added
- [ ] Complete customer journey tested
- [ ] MVP launched to initial customers
- [ ] User feedback collected

### External Dependencies

- Resend API (already configured) ✅
- PayPal Business Account setup
- CashApp Business Account setup
- N8N service operational ✅
- MinIO file storage ✅

### Technical Dependencies

- Next.js 15 stable ✅
- PostgreSQL performance tuned ✅
- PM2 monitoring configured ✅
- Docker deployment working ✅

---

## Stakeholder Sign-off

**Approval Required From:**

- [ ] Product Owner
- [ ] Engineering Lead
- [ ] Design Lead
- [ ] Business Owner
- [ ] Marketing Manager

**Approved By:** **\*\*\*\***\_**\*\*\*\***
**Date:** **\*\*\*\***\_**\*\*\*\***

---

**Document Status:** Draft - Awaiting Review
**Next Review Date:** TBD
**Version:** 1.0
**Last Updated:** October 3, 2025
