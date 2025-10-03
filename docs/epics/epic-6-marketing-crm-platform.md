# Epic 6: Complete Marketing & CRM Platform

## Epic Information

| Field | Value |
|-------|-------|
| **Epic ID** | EPIC-006 |
| **Phase** | Phase 2 |
| **Priority** | CRITICAL |
| **Status** | Not Started |
| **Story Points** | 55 |
| **Estimated Duration** | 6-8 weeks |
| **Dependencies** | Phase 1 MVP Complete |

---

## Epic Description

Build the comprehensive Marketing & CRM platform that was deferred from Phase 1. This system will enable customer relationship management, email marketing campaigns, marketing automation, and detailed analytics to drive customer retention and revenue growth.

---

## Business Value

**Problem:** Cannot effectively market to customers or run retention campaigns
**Solution:** Full-featured marketing automation and CRM platform
**Impact:**
- Increase repeat purchase rate by 30%
- Reduce customer acquisition cost by 25%
- Increase email marketing revenue by $10K/month
- Improve customer lifetime value by 40%

---

## User Stories

### Story 6.1: CRM/Contacts Hub (13 points)

**As an** Admin
**I want** a central customer database
**So that** I can manage relationships and track customer information

**Acceptance Criteria:**
- [ ] Can view all customers in a searchable list
- [ ] Can view individual customer profiles with complete history
- [ ] Can add custom tags to customers
- [ ] Can create customer segments based on criteria
- [ ] Can track customer lifetime value
- [ ] Can see order history and communication log
- [ ] Can export customer data to CSV

**Tasks:**
1. Design CRM database schema
2. Build customer list page with search/filter
3. Build customer detail page
4. Implement tagging system
5. Build segmentation engine
6. Add customer activity tracking
7. Create CLV calculation algorithm
8. Build export functionality

---

### Story 6.2: Email Builder (13 points)

**As an** Admin
**I want** a drag-and-drop email builder
**So that** I can create professional marketing emails without coding

**Acceptance Criteria:**
- [ ] Can create emails using drag-and-drop interface
- [ ] Can save email templates
- [ ] Can preview emails in desktop/mobile view
- [ ] Can use merge tags for personalization
- [ ] Can add images from media library
- [ ] Can customize colors and fonts
- [ ] Can send test emails
- [ ] Templates are responsive

**Tasks:**
1. Integrate email builder library (MJML or similar)
2. Build template save/load functionality
3. Create media library for images
4. Implement merge tag system
5. Build preview functionality
6. Add responsive design controls
7. Create test email functionality
8. Build 5 starter templates

---

### Story 6.3: Email Broadcasts (8 points)

**As an** Admin
**I want** to send one-time email campaigns
**So that** I can promote products and engage customers

**Acceptance Criteria:**
- [ ] Can create new campaign
- [ ] Can select recipient segments
- [ ] Can schedule send time
- [ ] Can send immediately or schedule
- [ ] Can track delivery status
- [ ] Can see real-time send progress
- [ ] Can cancel scheduled campaigns
- [ ] Receives confirmation when complete

**Tasks:**
1. Build campaign creation UI
2. Implement recipient selection
3. Add campaign scheduling
4. Build email queue system
5. Create send progress tracker
6. Implement cancel functionality
7. Add delivery status tracking
8. Create completion notifications

---

### Story 6.4: Marketing Automation (13 points)

**As an** Admin
**I want** to create automated email workflows
**So that** I can nurture customers without manual effort

**Acceptance Criteria:**
- [ ] Can create multi-step workflows
- [ ] Can set triggers (order placed, abandoned cart, etc.)
- [ ] Can add delays between steps
- [ ] Can add conditional logic (if/then)
- [ ] Can preview workflow before activating
- [ ] Can activate/deactivate workflows
- [ ] Can see workflow performance metrics
- [ ] Can clone existing workflows

**Tasks:**
1. Design automation database schema
2. Build workflow editor UI
3. Implement trigger system
4. Add delay/wait functionality
5. Build conditional logic engine
6. Create workflow execution engine
7. Add performance tracking
8. Build workflow clone feature

**Automation Examples:**
1. Welcome Series (3 emails over 5 days)
2. Abandoned Cart Recovery (3 reminders over 24 hours)
3. Post-Purchase Follow-up (feedback request after 7 days)
4. Re-engagement Campaign (inactive customers after 60 days)
5. Loyalty Tier Upgrade (when customer reaches threshold)

---

### Story 6.5: Analytics Dashboard (8 points)

**As an** Admin
**I want** detailed email and campaign analytics
**So that** I can measure performance and ROI

**Acceptance Criteria:**
- [ ] Can see overview dashboard with key metrics
- [ ] Can view campaign-specific reports
- [ ] Can track open rates by campaign
- [ ] Can track click-through rates
- [ ] Can see revenue attribution
- [ ] Can compare campaign performance
- [ ] Can export analytics data
- [ ] Can set custom date ranges

**Tasks:**
1. Design analytics database schema
2. Build overview dashboard
3. Implement email tracking pixels
4. Add click tracking with redirects
5. Build revenue attribution system
6. Create campaign comparison charts
7. Add data export functionality
8. Build custom date range selector

**Key Metrics:**
- Total emails sent
- Delivery rate
- Open rate
- Click-through rate
- Conversion rate
- Revenue per email
- List growth rate
- Unsubscribe rate

---

## Technical Architecture

### Database Schema

```sql
-- Customers & CRM
CREATE TABLE Customer (
  id UUID PRIMARY KEY,
  userId UUID REFERENCES User(id),
  firstName VARCHAR(255),
  lastName VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  lifetimeValue DECIMAL(10,2) DEFAULT 0,
  totalOrders INT DEFAULT 0,
  lastOrderDate TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE CustomerTag (
  id UUID PRIMARY KEY,
  customerId UUID REFERENCES Customer(id),
  tag VARCHAR(100) NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE CustomerSegment (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE CustomerActivity (
  id UUID PRIMARY KEY,
  customerId UUID REFERENCES Customer(id),
  activityType VARCHAR(50) NOT NULL, -- email_open, email_click, order, etc.
  activityData JSONB,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Email Templates
CREATE TABLE EmailTemplate (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  htmlContent TEXT NOT NULL,
  jsonContent JSONB, -- For email builder
  previewText VARCHAR(500),
  isActive BOOLEAN DEFAULT true,
  createdBy UUID REFERENCES User(id),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Email Campaigns
CREATE TABLE EmailCampaign (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  templateId UUID REFERENCES EmailTemplate(id),
  segmentId UUID REFERENCES CustomerSegment(id),
  subject VARCHAR(500) NOT NULL,
  fromName VARCHAR(255),
  fromEmail VARCHAR(255),
  scheduledAt TIMESTAMP,
  sentAt TIMESTAMP,
  status VARCHAR(50) DEFAULT 'draft', -- draft, scheduled, sending, sent, cancelled
  totalRecipients INT DEFAULT 0,
  totalSent INT DEFAULT 0,
  totalDelivered INT DEFAULT 0,
  totalOpened INT DEFAULT 0,
  totalClicked INT DEFAULT 0,
  totalRevenue DECIMAL(10,2) DEFAULT 0,
  createdBy UUID REFERENCES User(id),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Email Sends (individual emails)
CREATE TABLE EmailSend (
  id UUID PRIMARY KEY,
  campaignId UUID REFERENCES EmailCampaign(id),
  customerId UUID REFERENCES Customer(id),
  emailAddress VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, delivered, bounced, failed
  sentAt TIMESTAMP,
  deliveredAt TIMESTAMP,
  openedAt TIMESTAMP,
  clickedAt TIMESTAMP,
  unsubscribedAt TIMESTAMP,
  errorMessage TEXT,
  messageId VARCHAR(500), -- From email service provider
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Email Events (opens, clicks)
CREATE TABLE EmailEvent (
  id UUID PRIMARY KEY,
  emailSendId UUID REFERENCES EmailSend(id),
  eventType VARCHAR(50) NOT NULL, -- open, click, bounce, unsubscribe
  eventData JSONB,
  userAgent TEXT,
  ipAddress VARCHAR(45),
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Marketing Automation
CREATE TABLE AutomationWorkflow (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  triggerType VARCHAR(50) NOT NULL, -- order_placed, cart_abandoned, user_registered, etc.
  triggerCriteria JSONB,
  steps JSONB NOT NULL, -- Array of workflow steps
  isActive BOOLEAN DEFAULT false,
  totalRuns INT DEFAULT 0,
  totalCompleted INT DEFAULT 0,
  totalRevenue DECIMAL(10,2) DEFAULT 0,
  createdBy UUID REFERENCES User(id),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE AutomationRun (
  id UUID PRIMARY KEY,
  workflowId UUID REFERENCES AutomationWorkflow(id),
  customerId UUID REFERENCES Customer(id),
  currentStep INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active', -- active, paused, completed, failed
  startedAt TIMESTAMP DEFAULT NOW(),
  completedAt TIMESTAMP,
  data JSONB -- Context data for the run
);
```

### API Endpoints

```
CRM:
GET    /api/admin/crm/customers
GET    /api/admin/crm/customers/:id
PUT    /api/admin/crm/customers/:id
POST   /api/admin/crm/customers/:id/tags
DELETE /api/admin/crm/customers/:id/tags/:tagId
GET    /api/admin/crm/segments
POST   /api/admin/crm/segments
PUT    /api/admin/crm/segments/:id
DELETE /api/admin/crm/segments/:id
GET    /api/admin/crm/segments/:id/customers

Email Templates:
GET    /api/admin/email/templates
GET    /api/admin/email/templates/:id
POST   /api/admin/email/templates
PUT    /api/admin/email/templates/:id
DELETE /api/admin/email/templates/:id
POST   /api/admin/email/templates/:id/test

Email Campaigns:
GET    /api/admin/email/campaigns
GET    /api/admin/email/campaigns/:id
POST   /api/admin/email/campaigns
PUT    /api/admin/email/campaigns/:id
DELETE /api/admin/email/campaigns/:id
POST   /api/admin/email/campaigns/:id/send
POST   /api/admin/email/campaigns/:id/schedule
POST   /api/admin/email/campaigns/:id/cancel
GET    /api/admin/email/campaigns/:id/analytics

Marketing Automation:
GET    /api/admin/automation/workflows
GET    /api/admin/automation/workflows/:id
POST   /api/admin/automation/workflows
PUT    /api/admin/automation/workflows/:id
DELETE /api/admin/automation/workflows/:id
POST   /api/admin/automation/workflows/:id/activate
POST   /api/admin/automation/workflows/:id/deactivate
GET    /api/admin/automation/workflows/:id/runs

Analytics:
GET    /api/admin/analytics/overview
GET    /api/admin/analytics/campaigns
GET    /api/admin/analytics/campaigns/:id
GET    /api/admin/analytics/automation
GET    /api/admin/analytics/revenue

Tracking (Public):
GET    /api/track/email/:id/open.png  (1x1 pixel)
GET    /api/track/email/:id/click/:linkId
GET    /api/track/email/:id/unsubscribe
```

### Third-Party Integrations

**Email Service Provider:**
- Resend (already configured) ✅
- Backup: SendGrid or AWS SES

**Email Builder:**
- Option 1: MJML (https://mjml.io)
- Option 2: React Email (https://react.email)
- Option 3: Unlayer (https://unlayer.com)

**Analytics:**
- Custom implementation using tracking pixels
- Webhook integration with Resend for delivery events

---

## Testing Strategy

### Unit Tests
- Customer segmentation logic
- Email merge tag replacement
- Workflow trigger evaluation
- Revenue attribution calculations

### Integration Tests
- Email sending via Resend
- Campaign scheduling
- Automation workflow execution
- Tracking pixel clicks

### E2E Tests
- Create and send campaign
- Set up automation workflow
- Customer receives and opens email
- Click tracking works
- Unsubscribe works

---

## Success Metrics

### Launch Criteria
- [ ] Can manage 100+ customers in CRM
- [ ] Can create email with builder in <10 minutes
- [ ] Can send campaign to segmented list
- [ ] 3+ automation workflows active
- [ ] Email deliverability >95%
- [ ] Tracking accuracy >98%

### Performance Targets
- Campaign creation time: <2 minutes
- Email send speed: 100 emails/second
- Analytics dashboard load: <2 seconds
- Workflow trigger latency: <30 seconds

### Business Metrics (30 days post-launch)
- Email open rate: >25%
- Click-through rate: >5%
- Campaign conversion rate: >2%
- Automation revenue: >$5K/month
- Customer segmentation: 5+ active segments
- List growth rate: >10%/month

---

## Risks & Mitigation

### Risk 1: Email Deliverability
**Impact:** High
**Probability:** Medium
**Mitigation:**
- Use reputable ESP (Resend)
- Implement double opt-in
- Monitor spam complaints
- Authenticate domain (SPF, DKIM, DMARC)
- Warm up sending domain gradually

### Risk 2: Complexity
**Impact:** High
**Probability:** High
**Mitigation:**
- Use existing email builder library
- Start with simple automation workflows
- Phase rollout (CRM → Templates → Campaigns → Automation)
- Extensive testing before launch

### Risk 3: Performance
**Impact:** Medium
**Probability:** Medium
**Mitigation:**
- Queue-based email sending
- Database indexing on key fields
- Caching for analytics queries
- Load testing with 10K+ customers

---

## Dependencies

**Completed:**
- Resend account configured ✅
- Email infrastructure working ✅
- User/Order data available ✅

**Required:**
- Domain authentication (SPF/DKIM)
- Email builder library selection
- Analytics tracking infrastructure
- Queue system for email sending

---

## Timeline

### Sprint 1 (Week 1-2): CRM Foundation
- Database schema
- Customer list page
- Customer detail page
- Tagging system
- Basic segmentation

### Sprint 2 (Week 3-4): Email Builder
- Email builder integration
- Template management
- Preview functionality
- Test email sending
- Starter templates

### Sprint 3 (Week 5-6): Campaigns
- Campaign creation
- Recipient selection
- Scheduling system
- Send functionality
- Delivery tracking

### Sprint 4 (Week 7-8): Automation & Analytics
- Automation workflow builder
- Trigger system
- Workflow execution
- Analytics dashboard
- Tracking implementation

---

## Deliverables

1. **CRM System**
   - Customer database with profiles
   - Tagging and segmentation
   - Activity tracking

2. **Email Platform**
   - Drag-and-drop email builder
   - Template library
   - Preview and testing tools

3. **Campaign Management**
   - Broadcast campaigns
   - Scheduling system
   - Delivery tracking

4. **Marketing Automation**
   - Workflow builder
   - 5 pre-built workflows
   - Trigger system
   - Execution engine

5. **Analytics**
   - Overview dashboard
   - Campaign reports
   - Revenue attribution
   - Export functionality

---

**Epic Owner:** Product Manager
**Technical Lead:** Backend Lead
**Status:** Not Started
**Last Updated:** October 3, 2025
