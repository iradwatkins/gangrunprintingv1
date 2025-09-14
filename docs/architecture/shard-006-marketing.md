# Architecture Shard 006: Marketing & Automation Platform

## Overview
**Epic**: Integrated Marketing & CRM Platform
**Status**: 0% Complete - Not started
**Priority**: High - Required for Phase 1 MVP

## Technical Requirements

### Marketing Platform Components
```typescript
interface MarketingPlatform {
  crm: {
    contacts: ContactManagement;
    segments: CustomerSegmentation;
    tags: TagSystem;
    activities: ActivityTracking;
  };
  email: {
    builder: VisualEmailBuilder;
    templates: EmailTemplates;
    campaigns: CampaignManagement;
    broadcasts: BroadcastSystem;
  };
  automation: {
    workflows: WorkflowEngine;
    triggers: EventTriggers;
    actions: AutomationActions;
    conditions: RuleEngine;
  };
  analytics: {
    performance: CampaignMetrics;
    engagement: UserEngagement;
    conversion: ConversionTracking;
    reports: CustomReports;
  };
}
```

### Implementation Tasks

#### 1. CRM/Contacts Hub
- [ ] Contact database with custom fields
- [ ] Import/export functionality
- [ ] Tagging and categorization system
- [ ] Advanced search and filtering
- [ ] Activity timeline per contact
- [ ] Bulk operations interface
- [ ] Custom field management
- [ ] Duplicate detection and merging

#### 2. Visual Email Builder
- [ ] Drag-and-drop email composer
- [ ] Responsive email templates
- [ ] Custom HTML blocks
- [ ] Dynamic content insertion
- [ ] Image library integration
- [ ] Preview across devices
- [ ] Template save/load system
- [ ] Personalization tokens

#### 3. Email Campaigns & Broadcasts
- [ ] Campaign creation wizard
- [ ] Recipient selection interface
- [ ] A/B testing setup
- [ ] Schedule and send options
- [ ] Real-time sending status
- [ ] Bounce and complaint handling
- [ ] Unsubscribe management
- [ ] Campaign duplication

#### 4. Marketing Automation
- [ ] Visual workflow builder
- [ ] Trigger configuration
- [ ] Action node library
- [ ] Condition branching
- [ ] Delay and timing controls
- [ ] Workflow templates
- [ ] Testing and debugging tools
- [ ] Performance monitoring

#### 5. Analytics & Reporting
- [ ] Email performance metrics
- [ ] Contact engagement scoring
- [ ] Campaign comparison
- [ ] Revenue attribution
- [ ] Custom report builder
- [ ] Automated report delivery
- [ ] Export functionality
- [ ] Real-time dashboards

### Database Schema

```sql
-- Contact management
CREATE TABLE "Contact" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "customFields" JSONB,
    "tags" TEXT[],
    "segments" TEXT[],
    "engagementScore" INTEGER DEFAULT 0,
    "unsubscribed" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP
);

-- Email campaigns
CREATE TABLE "Campaign" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "fromName" TEXT NOT NULL,
    "fromEmail" TEXT NOT NULL,
    "replyTo" TEXT,
    "content" JSONB NOT NULL,
    "status" TEXT DEFAULT 'DRAFT',
    "scheduledAt" TIMESTAMP,
    "sentAt" TIMESTAMP,
    "stats" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("createdBy") REFERENCES "User"("id")
);

-- Automation workflows
CREATE TABLE "Workflow" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trigger" JSONB NOT NULL,
    "nodes" JSONB NOT NULL,
    "isActive" BOOLEAN DEFAULT false,
    "lastRun" TIMESTAMP,
    "runCount" INTEGER DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("createdBy") REFERENCES "User"("id")
);

-- Email events tracking
CREATE TABLE "EmailEvent" (
    "id" TEXT PRIMARY KEY,
    "campaignId" TEXT,
    "contactId" TEXT NOT NULL,
    "event" TEXT NOT NULL, -- sent, opened, clicked, bounced, complained
    "metadata" JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id"),
    FOREIGN KEY ("contactId") REFERENCES "Contact"("id")
);

-- Workflow executions
CREATE TABLE "WorkflowExecution" (
    "id" TEXT PRIMARY KEY,
    "workflowId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "status" TEXT DEFAULT 'RUNNING',
    "currentNode" TEXT,
    "context" JSONB,
    "startedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP,
    FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id"),
    FOREIGN KEY ("contactId") REFERENCES "Contact"("id")
);
```

### API Endpoints

```yaml
# Marketing API routes
/api/marketing/contacts:
  GET: List contacts with filters
  POST: Create new contact
  PUT: Bulk update contacts
  DELETE: Bulk delete contacts

/api/marketing/contacts/{id}:
  GET: Contact details with activity
  PATCH: Update contact
  DELETE: Delete contact

/api/marketing/campaigns:
  GET: List campaigns
  POST: Create campaign

/api/marketing/campaigns/{id}:
  GET: Campaign details with stats
  PATCH: Update campaign
  POST: Send/schedule campaign
  DELETE: Delete campaign

/api/marketing/workflows:
  GET: List workflows
  POST: Create workflow

/api/marketing/workflows/{id}:
  GET: Workflow details
  PATCH: Update workflow
  POST: Activate/deactivate
  DELETE: Delete workflow

/api/marketing/analytics:
  GET: Marketing metrics
  POST: Generate custom report
```

### Email Builder Architecture

```typescript
// Email builder components
interface EmailBuilder {
  canvas: {
    rows: Row[];
    settings: CanvasSettings;
  };
  components: {
    text: TextBlock;
    image: ImageBlock;
    button: ButtonBlock;
    divider: DividerBlock;
    spacer: SpacerBlock;
    columns: ColumnBlock;
    social: SocialBlock;
  };
  styles: {
    theme: EmailTheme;
    responsive: ResponsiveRules;
  };
}

// Drag-and-drop implementation
class EmailBuilderCanvas {
  private rows: Row[] = [];

  addRow(position: number) {}
  removeRow(id: string) {}
  moveRow(from: number, to: number) {}

  addBlock(rowId: string, block: Block) {}
  removeBlock(blockId: string) {}
  moveBlock(from: Position, to: Position) {}

  updateBlockContent(blockId: string, content: any) {}
  updateBlockStyles(blockId: string, styles: any) {}

  exportHTML(): string {}
  exportJSON(): object {}
  importTemplate(template: EmailTemplate) {}
}
```

### Automation Engine

```typescript
// Workflow execution engine
class WorkflowEngine {
  async execute(workflow: Workflow, contact: Contact) {
    const execution = await this.createExecution(workflow, contact);

    for (const node of workflow.nodes) {
      switch (node.type) {
        case 'trigger':
          await this.evaluateTrigger(node, contact);
          break;
        case 'condition':
          const result = await this.evaluateCondition(node, contact);
          if (!result) break;
        case 'action':
          await this.executeAction(node, contact, execution);
          break;
        case 'delay':
          await this.scheduleDelay(node, execution);
          break;
      }
    }
  }

  private async executeAction(node: ActionNode, contact: Contact) {
    switch (node.action) {
      case 'sendEmail':
        await this.sendEmail(node.emailId, contact);
        break;
      case 'addTag':
        await this.addTag(contact, node.tag);
        break;
      case 'updateField':
        await this.updateField(contact, node.field, node.value);
        break;
      case 'webhook':
        await this.callWebhook(node.url, contact);
        break;
    }
  }
}
```

### N8N Integration

```typescript
// N8N workflow triggers
interface N8NIntegration {
  triggers: {
    orderPlaced: OrderTrigger;
    contactCreated: ContactTrigger;
    campaignSent: CampaignTrigger;
    workflowCompleted: WorkflowTrigger;
  };
  actions: {
    createContact: CreateContactAction;
    sendEmail: SendEmailAction;
    updateOrder: UpdateOrderAction;
    notifyVendor: NotifyVendorAction;
  };
}

// Webhook configuration for N8N
const n8nWebhooks = {
  baseUrl: process.env.N8N_WEBHOOK_URL,
  endpoints: {
    orderWebhook: '/webhook/order-placed',
    contactWebhook: '/webhook/contact-created',
    campaignWebhook: '/webhook/campaign-sent',
  },
  auth: {
    type: 'bearer',
    token: process.env.N8N_API_TOKEN,
  },
};
```

### Performance Optimization

- Background job processing for email sends
- Queue management with Redis
- Batch processing for bulk operations
- Caching of email templates
- CDN for email images
- Optimistic UI updates
- Pagination for large contact lists
- Indexing for search operations

### UI Components

```typescript
// Marketing UI components
components/marketing/
├── contacts/
│   ├── ContactList.tsx
│   ├── ContactForm.tsx
│   ├── ContactProfile.tsx
│   ├── TagManager.tsx
│   └── SegmentBuilder.tsx
├── email/
│   ├── EmailBuilder.tsx
│   ├── TemplateLibrary.tsx
│   ├── PreviewModal.tsx
│   └── PersonalizationTokens.tsx
├── campaigns/
│   ├── CampaignWizard.tsx
│   ├── RecipientSelector.tsx
│   ├── ScheduleModal.tsx
│   └── CampaignStats.tsx
├── automation/
│   ├── WorkflowBuilder.tsx
│   ├── NodeLibrary.tsx
│   ├── TriggerConfig.tsx
│   └── TestRunner.tsx
└── analytics/
    ├── PerformanceDashboard.tsx
    ├── EngagementChart.tsx
    ├── ReportBuilder.tsx
    └── MetricCards.tsx
```

## Success Criteria

- [ ] Contacts can be imported and managed
- [ ] Emails can be designed visually
- [ ] Campaigns can be sent to segments
- [ ] Automations execute reliably
- [ ] Analytics provide actionable insights
- [ ] Integration with N8N works
- [ ] Performance targets met
- [ ] GDPR compliance implemented

## Dependencies

- User authentication (Shard 002) ✅
- Email service configuration ✅
- File storage for assets ✅
- Background job processing
- Redis for queuing

## Implementation Priority

1. Contact management system
2. Email template builder
3. Campaign sending capability
4. Basic automation triggers
5. Analytics and reporting
6. Advanced automation features
7. N8N integration
8. A/B testing capabilities