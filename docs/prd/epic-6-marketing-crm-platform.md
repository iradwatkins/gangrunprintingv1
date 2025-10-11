# Epic 6: Integrated Marketing & CRM Platform

## Epic Status

**STATUS: ❌ MINIMAL PROGRESS (25% Complete)**
**Started:** 2025-09-15
**Target Completion:** 2025-10-20 (15 days remaining)
**Implementation Score:** 25/100

---

## Epic Goal

Build a comprehensive marketing suite including a central CRM/Contacts hub, visual email builder, email broadcast functionality, rule-based automation engine, and detailed analytics to drive customer engagement and retention.

---

## Epic Description

### User Goal

**As an Administrator**, I want to manage my customer list, create professional marketing emails, send targeted campaigns, automate marketing workflows, and track performance, so that I can drive sales and engagement without relying on external marketing platforms.

### Business Value

- **Revenue Growth:** Targeted campaigns increase repeat purchases
- **Customer Retention:** Automated engagement reduces churn
- **Cost Savings:** Eliminates need for external email marketing services ($99-299/month)
- **Data Ownership:** Complete control over customer data and insights
- **Competitive Advantage:** Integrated platform reduces tool fragmentation

### Technical Summary

This epic represents the most complex and feature-rich component:

- **CRM/Contacts:** Central hub for customer management with tagging and segmentation
- **Email Builder:** Drag-and-drop visual email editor with responsive templates
- **Email Broadcasts:** One-time campaign creation and scheduling
- **Automation Engine:** Rule-based workflows for triggered emails
- **Analytics:** Comprehensive tracking of email performance and customer engagement

---

## Functional Requirements Addressed

- **FR7:** CRM/Contacts hub with profiles, tags, and segmentation ❌
- **FR8:** Visual email builder for responsive, branded emails ⚠️ (Skeleton only)
- **FR9:** Rule-based automation engine for marketing workflows ❌

---

## Implementation Details

### ✅ Completed Components (25%)

#### 1. **Marketing Section Structure**

- Marketing navigation in admin (`/admin/marketing`)
- Route structure established:
  - `/admin/marketing/campaigns`
  - `/admin/marketing/segments`
  - `/admin/marketing/email-builder`
  - `/admin/marketing/analytics`
  - `/admin/marketing/automation`
  - `/admin/marketing/automation/new`
- Basic page components created
- UI framework in place

#### 2. **Email Builder Skeleton** (10%)

- Email builder page exists
- Basic EmailBuilder component structure
- Template loading framework
- Save/Send dialog scaffolding
- **Missing:** Actual drag-and-drop functionality
- **Missing:** Email template rendering
- **Missing:** Preview functionality
- **Missing:** Send functionality

#### 3. **Campaigns List Skeleton** (10%)

- Campaigns list page exists
- Table structure for campaign display
- Filter/search UI scaffolding
- Create campaign dialog outline
- **Missing:** Actual campaign data
- **Missing:** Campaign creation logic
- **Missing:** Campaign management

#### 4. **Basic UI Components** (5%)

- React components for marketing pages
- Shadcn/UI integration
- Layout consistency with admin
- Navigation integrated

---

### ❌ Not Started Components (75%)

#### 1. **CRM/Contacts Hub** (0%)

**Requirements:**

- Central contacts database
- Contact profiles with detailed information:
  - Personal info (name, email, phone, company)
  - Custom fields
  - Activity timeline
  - Communication history
  - Purchase history
  - Notes/tags
- **Contact Management:**
  - Import contacts (CSV, manual)
  - Export contacts
  - Bulk operations
  - Merge duplicates
  - Delete/archive contacts
- **Tagging System:**
  - Create custom tags
  - Apply tags to contacts
  - Tag-based filtering
  - Tag management
- **Segmentation:**
  - Create segments based on:
    - Demographics
    - Purchase behavior
    - Engagement level
    - Custom fields
    - Tags
  - Dynamic segments (auto-update)
  - Static segments (fixed list)
  - Segment size tracking

**Database Models Needed:**

```prisma
model Contact {
  id              String
  email           String
  firstName       String
  lastName        String
  phone           String?
  company         String?
  tags            ContactTag[]
  segments        SegmentContact[]
  customFields    Json?
  activities      ContactActivity[]
  campaigns       CampaignContact[]
  createdAt       DateTime
  updatedAt       DateTime
}

model ContactTag {
  id        String
  name      String
  color     String?
  contacts  Contact[]
}

model Segment {
  id          String
  name        String
  description String?
  rules       Json
  type        SegmentType // DYNAMIC | STATIC
  contacts    SegmentContact[]
  campaigns   Campaign[]
}
```

---

#### 2. **Email Builder - Complete Implementation** (10% → 100%)

**Current State:** Skeleton only
**Required Features:**

**Drag-and-Drop Editor:**

- Block-based email construction
- Pre-built blocks:
  - Text
  - Image
  - Button
  - Divider
  - Spacer
  - Columns (2-col, 3-col)
  - Product showcase
  - Social media links
  - Header/footer
- Drag-and-drop functionality
- Block settings panel
- Style customization per block
- Mobile responsive preview

**Template System:**

- Pre-designed templates:
  - Welcome email
  - Newsletter
  - Product announcement
  - Sale/promotion
  - Abandoned cart
  - Order confirmation
  - Shipping update
- Custom template creation
- Template library
  - Template categories
  - Search templates
  - Favorite templates
- Template variables/merge tags:
  - `{{first_name}}`
  - `{{company}}`
  - `{{product_name}}`
  - `{{order_number}}`
  - Custom variables

**Editor Features:**

- Visual editing mode
- HTML code mode toggle
- Preview mode (desktop/mobile)
- Test email sending
- Subject line editor
- Preview text editor
- From name/email configuration
- Undo/redo functionality
- Auto-save drafts

**Brand Customization:**

- Logo upload
- Brand colors
- Font selection
- Default header/footer
- Social media links
- Company information

---

#### 3. **Email Broadcasts/Campaigns** (10% → 100%)

**Current State:** UI skeleton only
**Required Features:**

**Campaign Creation:**

- Campaign wizard:
  - Step 1: Campaign details (name, subject, from)
  - Step 2: Audience selection (segments, contacts)
  - Step 3: Email content (use builder)
  - Step 4: Schedule or send immediately
  - Step 5: Review and confirm
- Campaign templates
- A/B testing setup
- Scheduling options:
  - Send immediately
  - Schedule for later
  - Recurring campaigns
  - Time zone optimization

**Campaign Management:**

- Campaign list with filters:
  - Draft
  - Scheduled
  - Sending
  - Sent
  - Cancelled
- Campaign actions:
  - Edit draft
  - Duplicate campaign
  - Cancel scheduled
  - Archive campaign
  - Delete campaign
- Campaign preview
- Test sending

**Sending Infrastructure:**

- Email queue system
- Batch sending (rate limiting)
- Retry failed sends
- Bounce handling
- Spam score checking
- Unsubscribe management

---

#### 4. **Automation Engine** (0%)

**Requirements:**

**Workflow Builder:**

- Visual workflow designer
- Trigger types:
  - Customer signs up
  - Order placed
  - Cart abandoned
  - Product purchased
  - Tag added
  - Segment entered
  - Date-based (birthday, anniversary)
  - Inactivity period
- Action types:
  - Send email
  - Add tag
  - Add to segment
  - Remove tag
  - Remove from segment
  - Wait/delay
  - Conditional split
  - Update contact field
- **Workflow Elements:**
  - Drag-and-drop canvas
  - Connection lines
  - Condition branches
  - Time delays
  - Goal tracking

**Automation Templates:**

- Welcome series (3-5 emails)
- Abandoned cart recovery
- Post-purchase follow-up
- Re-engagement campaign
- Birthday/anniversary
- Product recommendations
- Win-back campaign

**Automation Management:**

- Automation list
- Enable/disable automations
- Test automations
- Automation performance
- Edit workflow
- Duplicate automation

**Database Models Needed:**

```prisma
model Automation {
  id          String
  name        String
  description String?
  trigger     Json
  workflow    Json
  status      AutomationStatus // ACTIVE | PAUSED | DRAFT
  stats       Json?
  createdAt   DateTime
}

model AutomationRun {
  id            String
  automationId  String
  contactId     String
  status        RunStatus
  currentStep   Int
  startedAt     DateTime
  completedAt   DateTime?
}
```

---

#### 5. **Analytics & Reporting** (0%)

**Requirements:**

**Campaign Analytics:**

- Per-campaign metrics:
  - Sent count
  - Delivery rate
  - Open rate
  - Click rate
  - Bounce rate
  - Unsubscribe rate
  - Revenue generated
- Time-series charts
- Comparison to benchmarks
- Best performing campaigns

**Email Performance:**

- Overall email metrics
- Engagement trends
- Device/client breakdown
- Geographic data
- Time-of-day analysis

**Contact Insights:**

- Most engaged contacts
- Inactive contacts
- Segmentation performance
- Lifetime value
- Engagement score

**Automation Analytics:**

- Automation performance
- Completion rates
- Drop-off points
- Goal achievement
- Revenue attribution

**Database Models Needed:**

```prisma
model CampaignStats {
  id              String
  campaignId      String
  sent            Int
  delivered       Int
  opened          Int
  clicked         Int
  bounced         Int
  unsubscribed    Int
  revenue         Float?
}

model EmailEvent {
  id          String
  campaignId  String?
  contactId   String
  type        EventType // SENT | DELIVERED | OPENED | CLICKED | BOUNCED
  timestamp   DateTime
  metadata    Json?
}
```

---

#### 6. **Email Service Integration** (0%)

**Requirements:**

**Resend Integration:**

- Configure Resend API
- Domain verification
- SPF/DKIM setup
- Sending domains
- Webhook configuration for events:
  - Delivered
  - Opened
  - Clicked
  - Bounced
  - Complained
- Rate limit handling
- Bounce management

**Email Deliverability:**

- Spam score checking
- List hygiene
- Suppression list
- Bounce handling
- Complaint handling
- Unsubscribe management

---

## User Stories

### Story 6.1: CRM/Contacts Hub ❌

**Status:** NOT STARTED
**Priority:** CRITICAL
**Estimated Effort:** 40 hours

**Description:** Build central CRM hub for managing all customer contacts with profiles, tagging, and segmentation.

**Acceptance Criteria:**

- ❌ Contacts page at `/admin/marketing/contacts`
- ❌ Contact list with search/filter
- ❌ Contact detail page with full profile
- ❌ Import contacts (CSV)
- ❌ Export contacts
- ❌ Tag management system
- ❌ Tag application to contacts
- ❌ Segment creation interface
- ❌ Dynamic segment rules engine
- ❌ Static segment management
- ❌ Activity timeline per contact
- ❌ Custom fields system

---

### Story 6.2: Email Builder - Full Implementation ⚠️

**Status:** SKELETON EXISTS (10% complete)
**Priority:** CRITICAL
**Estimated Effort:** 50 hours

**Description:** Complete the email builder with full drag-and-drop functionality, templates, and preview.

**Acceptance Criteria:**

- ⚠️ Email builder page exists (skeleton)
- ❌ Drag-and-drop block system
- ❌ Pre-built email blocks
- ❌ Block customization panel
- ❌ Template library (10+ templates)
- ❌ Template variables/merge tags
- ❌ Mobile responsive preview
- ❌ HTML code mode
- ❌ Test email functionality
- ❌ Auto-save drafts
- ❌ Brand customization

---

### Story 6.3: Campaign Management System ⚠️

**Status:** SKELETON EXISTS (10% complete)
**Priority:** HIGH
**Estimated Effort:** 35 hours

**Description:** Build complete campaign creation, management, and sending system.

**Acceptance Criteria:**

- ⚠️ Campaign list page exists (skeleton)
- ❌ Campaign creation wizard
- ❌ Audience selection (segments/contacts)
- ❌ Schedule/send immediately
- ❌ Campaign preview
- ❌ Test sending
- ❌ A/B testing setup
- ❌ Campaign duplication
- ❌ Email queue system
- ❌ Batch sending
- ❌ Delivery tracking

---

### Story 6.4: Automation Workflow Engine ❌

**Status:** NOT STARTED
**Priority:** HIGH
**Estimated Effort:** 60 hours

**Description:** Build visual automation builder with triggers, actions, and conditions.

**Acceptance Criteria:**

- ❌ Automation list at `/admin/marketing/automation`
- ❌ Visual workflow builder
- ❌ Trigger configuration
- ❌ Action configuration
- ❌ Conditional logic
- ❌ Time delays
- ❌ Workflow testing
- ❌ Automation templates (5+)
- ❌ Enable/disable automations
- ❌ Automation performance tracking

---

### Story 6.5: Email Analytics & Reporting ⚠️

**Status:** SKELETON EXISTS (5% complete)
**Priority:** MEDIUM
**Estimated Effort:** 25 hours

**Description:** Build comprehensive analytics dashboard for email and automation performance.

**Acceptance Criteria:**

- ⚠️ Analytics page exists (skeleton)
- ❌ Campaign performance metrics
- ❌ Email engagement charts
- ❌ Contact insights
- ❌ Automation analytics
- ❌ Revenue attribution
- ❌ Export reports
- ❌ Date range filtering
- ❌ Comparison to benchmarks

---

### Story 6.6: Email Service Integration ❌

**Status:** NOT STARTED
**Priority:** CRITICAL (BLOCKING)
**Estimated Effort:** 20 hours

**Description:** Integrate Resend email service with webhook handling and deliverability management.

**Acceptance Criteria:**

- ❌ Resend API integration
- ❌ Domain verification
- ❌ Webhook configuration
- ❌ Event tracking (open, click, bounce)
- ❌ Bounce handling
- ❌ Unsubscribe management
- ❌ Suppression list
- ❌ Rate limiting
- ❌ Email validation

---

### Story 6.7: Segmentation Engine ❌

**Status:** NOT STARTED
**Priority:** HIGH
**Estimated Effort:** 30 hours

**Description:** Build dynamic and static segmentation with rule-based criteria.

**Acceptance Criteria:**

- ❌ Segment list at `/admin/marketing/segments`
- ❌ Segment creation wizard
- ❌ Rule builder interface
- ❌ Dynamic segment auto-update
- ❌ Static segment management
- ❌ Segment preview
- ❌ Segment size tracking
- ❌ Multiple condition logic (AND/OR)
- ❌ Nested conditions

---

### Story 6.8: Contact Activity Tracking ❌

**Status:** NOT STARTED
**Priority:** MEDIUM
**Estimated Effort:** 15 hours

**Description:** Track and display all contact activities and interactions.

**Acceptance Criteria:**

- ❌ Activity timeline component
- ❌ Track email opens
- ❌ Track email clicks
- ❌ Track purchases
- ❌ Track page visits
- ❌ Manual notes
- ❌ Activity filtering
- ❌ Activity search

---

## Technical Architecture

### Required Database Schema

```prisma
// Contacts & CRM
model Contact
model ContactTag
model ContactActivity
model Segment
model SegmentContact

// Email & Campaigns
model EmailTemplate
model Campaign
model CampaignContact
model EmailEvent

// Automation
model Automation
model AutomationRun
model AutomationStep

// Analytics
model CampaignStats
model ContactEngagement
```

### Email Sending Flow

```
Campaign Created
  ↓
Select Audience (Segment/Contacts)
  ↓
Build Email (Email Builder)
  ↓
Schedule or Send
  ↓
Add to Email Queue
  ↓
Batch Processing (Rate Limited)
  ↓
Send via Resend API
  ↓
Track Events (Webhooks)
  ↓
Update Analytics
```

### Automation Flow

```
Trigger Event Occurs
  ↓
Check Active Automations
  ↓
Create Automation Run
  ↓
Execute First Step
  ↓
Wait/Delay (if applicable)
  ↓
Execute Next Step
  ↓
Track Completion
  ↓
Update Analytics
```

---

## API Endpoints (All Need Building)

### CRM/Contacts

- `GET /api/marketing/contacts` ❌
- `POST /api/marketing/contacts` ❌
- `GET /api/marketing/contacts/[id]` ❌
- `PUT /api/marketing/contacts/[id]` ❌
- `DELETE /api/marketing/contacts/[id]` ❌
- `POST /api/marketing/contacts/import` ❌
- `POST /api/marketing/contacts/[id]/tags` ❌

### Segments

- `GET /api/marketing/segments` ❌
- `POST /api/marketing/segments` ❌
- `GET /api/marketing/segments/[id]/contacts` ❌

### Campaigns

- `GET /api/marketing/campaigns` ❌
- `POST /api/marketing/campaigns` ❌
- `PUT /api/marketing/campaigns/[id]` ❌
- `POST /api/marketing/campaigns/[id]/send` ❌
- `POST /api/marketing/campaigns/[id]/test` ❌

### Automations

- `GET /api/marketing/automations` ❌
- `POST /api/marketing/automations` ❌
- `PUT /api/marketing/automations/[id]` ❌
- `PUT /api/marketing/automations/[id]/toggle` ❌

### Analytics

- `GET /api/marketing/analytics/campaigns` ❌
- `GET /api/marketing/analytics/contacts` ❌
- `GET /api/marketing/analytics/automations` ❌

### Webhooks

- `POST /api/webhooks/resend` ❌

---

## Dependencies

### Internal

- Epic 1: Foundation (database, auth)
- Epic 5: Admin (customer data integration)

### External Services

- **Resend** (email sending) - CRITICAL
- **React Email** (email templates) - NICE TO HAVE

### Libraries

- React DnD or similar (drag-and-drop)
- Chart library (analytics)
- Date picker (scheduling)
- Rich text editor (email content)

---

## Remaining Work Breakdown

### Phase 1: Foundation (Week 1) - 50 hours

1. **CRM Database Models** - 8 hours
2. **Email Service Integration** - 20 hours ⚠️ BLOCKING
3. **Contact Management** - 22 hours

### Phase 2: Email System (Week 2) - 85 hours

4. **Email Builder Complete** - 50 hours
5. **Campaign System** - 35 hours

### Phase 3: Automation (Week 3) - 75 hours

6. **Segmentation Engine** - 30 hours
7. **Automation Builder** - 45 hours

### Phase 4: Analytics & Polish (Week 4) - 40 hours

8. **Analytics Dashboard** - 25 hours
9. **Activity Tracking** - 15 hours

**Total Remaining Effort:** 250 hours (31 working days / 6 weeks)

---

## Risks & Mitigation

| Risk                                          | Impact   | Likelihood | Mitigation                    | Status     |
| --------------------------------------------- | -------- | ---------- | ----------------------------- | ---------- |
| Email deliverability issues                   | CRITICAL | MEDIUM     | Proper SPF/DKIM, list hygiene | 📋 Planned |
| Resend API rate limits                        | HIGH     | MEDIUM     | Queue system, batch sending   | 📋 Planned |
| Complex automation logic                      | HIGH     | HIGH       | Start simple, iterate         | 📋 Planned |
| Database performance with large contact lists | MEDIUM   | MEDIUM     | Indexing, pagination          | 📋 Planned |
| Email builder complexity                      | HIGH     | HIGH       | Use proven library/framework  | 📋 Planned |

---

## Success Metrics

### Current Achievement

- [x] Marketing section structure: 100%
- [~] Email builder: 10%
- [~] Campaign management: 10%
- [~] Analytics: 5%
- [ ] CRM/Contacts: 0%
- [ ] Segmentation: 0%
- [ ] Automation: 0%
- [ ] Email integration: 0%

**Overall Completion:** 25%

### Target Metrics (When Complete)

- Email deliverability: > 95%
- Email open rate: > 20%
- Email click rate: > 3%
- Automation completion rate: > 70%
- Contact engagement score: Average > 50
- Marketing ROI: 5:1 minimum

---

## Testing Requirements

### 📋 All Testing Needed

- Email sending tests
- Email template rendering tests
- Automation workflow tests
- Segmentation logic tests
- Analytics calculation tests
- Webhook handling tests
- Deliverability tests
- Performance tests with large lists
- Cross-client email rendering tests

---

## Documentation References

- [Email Marketing Best Practices](/docs/email-marketing-guide.md) _(To be created)_
- [Automation Workflow Guide](/docs/automation-guide.md) _(To be created)_
- [CRM User Manual](/docs/crm-manual.md) _(To be created)_

---

## Change Log

| Date       | Version | Description                                    | Author           |
| ---------- | ------- | ---------------------------------------------- | ---------------- |
| 2025-09-15 | 0.1     | Marketing section structure created            | Development Team |
| 2025-09-30 | 1.0     | Sharded from monolithic PRD, detailed planning | BMAD Agent       |

---

**Epic Owner:** Marketing Technology Lead
**Last Updated:** 2025-09-30
**Previous Epic:** [Epic 5: Admin Order & User Management](./epic-5-admin-order-user-mgmt.md)

---

## 🚨 CRITICAL NOTES

**This epic represents 250 hours of remaining work (6 weeks full-time)**

**Recommended Approach:**

1. **Phase 1 (Week 1):** Email integration + basic contacts ← START HERE
2. **Phase 2 (Week 2-3):** Complete email builder + campaigns
3. **Phase 3 (Week 4-5):** Segmentation + automation
4. **Phase 4 (Week 6):** Analytics + polish

**Alternative:** Consider using external service (Mailchimp, SendGrid) to reduce scope by 80%.
