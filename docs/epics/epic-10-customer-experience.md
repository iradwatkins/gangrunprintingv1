# Epic 10: Customer Experience Enhancements

## Epic Information

| Field                  | Value                                              |
| ---------------------- | -------------------------------------------------- |
| **Epic ID**            | EPIC-010                                           |
| **Phase**              | Phase 2                                            |
| **Priority**           | MEDIUM                                             |
| **Status**             | Not Started                                        |
| **Story Points**       | 44                                                 |
| **Estimated Duration** | 4-5 weeks                                          |
| **Dependencies**       | Epic 3 (Core Commerce), Epic 4 (Customer Accounts) |

---

## Epic Description

Enhance the customer experience with features that increase satisfaction, reduce support burden, and encourage repeat purchases. This includes AI chat support, design templates, file proofing, product reviews, wishlists, referral program, and live order tracking.

---

## Business Value

**Problem:** Basic customer experience causing support overhead and missed opportunities
**Solution:** Self-service tools and engagement features that delight customers
**Impact:**

- Reduce support tickets by 50%
- Increase customer satisfaction score by 30%
- Increase repeat purchase rate by 35%
- Reduce design-related order delays by 70%

---

## User Stories

### Story 10.1: AI Chat Support (13 points)

**As a** Customer
**I want** instant answers to my questions
**So that** I don't have to wait for email support

**Acceptance Criteria:**

- [ ] Chat widget appears on all pages
- [ ] AI answers common questions instantly
- [ ] Can escalate to human support if needed
- [ ] Chat history saved for logged-in users
- [ ] Proactive chat on checkout page
- [ ] Multilingual support (EN, ES)
- [ ] Mobile responsive

**AI Capabilities:**

```typescript
// Common questions AI should handle:
- Product specifications and options
- Pricing and turnaround time estimates
- File requirements and upload help
- Order status and tracking
- Shipping costs and delivery times
- Returns and refund policies
- Account management help

// Escalation triggers:
- Customer explicitly requests human
- AI confidence score <70%
- Complex order modifications
- Refund requests
- Complaints
```

**Implementation:**

```typescript
// Using Ollama (already running on port 11434)
import { Ollama } from 'ollama'

export class ChatSupportService {
  private ollama = new Ollama({ host: 'http://localhost:11434' })

  async generateResponse(message: string, context: ChatContext): Promise<ChatResponse> {
    // Build context from order history, product catalog, FAQs
    const prompt = this.buildPrompt(message, context)

    const response = await this.ollama.generate({
      model: 'llama2',
      prompt,
      stream: false,
    })

    const confidence = this.calculateConfidence(response)

    if (confidence < 0.7) {
      return {
        message: "I'm not entirely sure about this. Let me connect you with our support team.",
        escalate: true,
      }
    }

    return {
      message: response.response,
      confidence,
      escalate: false,
    }
  }

  private buildPrompt(message: string, context: ChatContext): string {
    return `
You are a helpful customer support agent for GangRun Printing, a professional printing company.

Customer Context:
- Name: ${context.customer?.name || 'Guest'}
- Order History: ${context.orderCount} orders
- Last Order: ${context.lastOrder?.date}

Current Page: ${context.currentPage}

Available Products:
${context.products.map((p) => `- ${p.name}: ${p.description}`).join('\n')}

Common FAQs:
${this.getFAQs()}

Customer Message: ${message}

Provide a helpful, friendly response. If you're unsure, suggest escalating to a human agent.
    `
  }
}
```

**Tasks:**

1. Integrate Ollama AI service
2. Build chat widget UI
3. Create conversation management system
4. Implement context building
5. Add escalation to human support
6. Build admin chat console
7. Add multilingual support
8. Test with real customer scenarios

---

### Story 10.2: Design Templates & Editor (13 points)

**As a** Customer
**I want** ready-made design templates
**So that** I don't need to hire a designer

**Acceptance Criteria:**

- [ ] Template library with 50+ designs
- [ ] Filter by product type and industry
- [ ] Preview templates before selecting
- [ ] Online editor to customize templates
- [ ] Can upload own logo/images
- [ ] Can change colors and text
- [ ] Real-time preview
- [ ] Export design to order

**Template Categories:**

```
Business Cards:
- Corporate Professional
- Creative/Artistic
- Real Estate
- Healthcare
- Technology
- Restaurant/Food

Flyers:
- Event Promotion
- Sales/Discount
- Grand Opening
- Service Offering
- Seasonal

Brochures:
- Tri-fold Corporate
- Product Catalog
- Service Menu
- Real Estate Listing
- Educational
```

**Design Editor Features:**

```typescript
// Online editor capabilities
interface DesignEditor {
  // Text editing
  - Add/edit/remove text
  - Font selection (50+ fonts)
  - Size, color, alignment
  - Effects (shadow, outline)

  // Image handling
  - Upload images
  - Crop, resize, rotate
  - Apply filters
  - Background removal

  // Colors
  - Color picker
  - Brand color palette
  - Gradient support

  // Elements
  - Shapes and icons
  - Lines and dividers
  - QR code generator

  // Layout
  - Layer management
  - Alignment tools
  - Grid and guides
  - Undo/redo
}
```

**Implementation:**

```typescript
// Use Fabric.js for canvas editing
import { fabric } from 'fabric'

export class DesignEditor {
  private canvas: fabric.Canvas

  constructor(containerId: string, template: Template) {
    this.canvas = new fabric.Canvas(containerId)
    this.loadTemplate(template)
  }

  loadTemplate(template: Template) {
    // Load template JSON
    this.canvas.loadFromJSON(template.canvasData, () => {
      this.canvas.renderAll()
    })
  }

  addText(text: string, options: TextOptions) {
    const textObj = new fabric.Text(text, {
      left: options.x,
      top: options.y,
      fontFamily: options.fontFamily,
      fontSize: options.fontSize,
      fill: options.color,
    })
    this.canvas.add(textObj)
  }

  uploadImage(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      fabric.Image.fromURL(e.target.result as string, (img) => {
        img.scaleToWidth(300)
        this.canvas.add(img)
      })
    }
    reader.readAsDataURL(file)
  }

  exportDesign(): string {
    // Export as high-res PDF
    return this.canvas.toDataURL({
      format: 'png',
      multiplier: 4, // 4x resolution for print quality
    })
  }
}
```

**Tasks:**

1. Create template library (50+ designs)
2. Build template selection UI
3. Integrate Fabric.js editor
4. Implement text editing
5. Add image upload and editing
6. Create color picker
7. Build export to PDF
8. Test print quality output

---

### Story 10.3: File Proofing System (8 points)

**As a** Customer
**I want** to approve my design before printing
**So that** I can ensure it looks perfect

**Acceptance Criteria:**

- [ ] Customer receives proof after upload
- [ ] Can view proof with zoom and measurements
- [ ] Can approve or request changes
- [ ] Can leave comments on specific areas
- [ ] Admin can upload revised proofs
- [ ] Email notifications on proof status
- [ ] Approval required before production

**Proofing Workflow:**

```
1. Customer uploads file
2. System generates proof (PDF thumbnail)
3. Customer receives email notification
4. Customer reviews proof online
5. Customer either:
   a. Approves → Order goes to production
   b. Requests changes → Admin notified
6. If changes requested:
   - Admin uploads revised proof
   - Customer reviews again
   - Repeat until approved
```

**Tasks:**

1. Build proof generation (PDF → thumbnail)
2. Create proof viewer UI with zoom
3. Implement approval/rejection flow
4. Add commenting system
5. Build revision upload for admin
6. Create email notifications
7. Add production hold until approval
8. Test approval workflow

---

### Story 10.4: Product Reviews & Ratings (5 points)

**As a** Customer
**I want** to see reviews from other customers
**So that** I can make informed decisions

**Acceptance Criteria:**

- [ ] Customers can leave reviews after order completion
- [ ] Star rating (1-5) with written review
- [ ] Can upload photos of received product
- [ ] Reviews display on product pages
- [ ] Can filter reviews (highest rated, most recent)
- [ ] Admin moderation (approve/reject)
- [ ] Incentive for leaving reviews (5% discount)

**Database Schema:**

```prisma
model Review {
  id          String   @id @default(cuid())
  productId   String
  product     Product  @relation(fields: [productId], references: [id])
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id])

  rating      Int      // 1-5
  title       String
  content     String
  images      String[] // Array of image URLs

  isApproved  Boolean  @default(false)
  isVerified  Boolean  @default(true) // Only real customers can review

  helpfulCount Int     @default(0)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([productId])
  @@index([userId])
  @@unique([orderId, userId]) // One review per order per user
}
```

**Tasks:**

1. Create review database schema
2. Build review submission form
3. Create review display component
4. Implement image upload for reviews
5. Add admin moderation panel
6. Build review filtering
7. Create review request emails
8. Add incentive discount code

---

### Story 10.5: Wishlist & Favorites (5 points)

**As a** Customer
**I want** to save products for later
**So that** I can easily find them when ready to order

**Acceptance Criteria:**

- [ ] Can add products to wishlist
- [ ] Can view all wishlist items
- [ ] Can remove items from wishlist
- [ ] Wishlist persists across sessions
- [ ] Can move wishlist item to cart
- [ ] Email reminders for wishlist items on sale
- [ ] Share wishlist with others

**Tasks:**

1. Create wishlist database table
2. Build add to wishlist button
3. Create wishlist page
4. Implement remove from wishlist
5. Add move to cart functionality
6. Create sale notification system
7. Build wishlist sharing
8. Test across devices

---

## Technical Architecture

### AI Chat Integration

```typescript
// src/lib/chat/chat-service.ts
export class ChatService {
  private ollamaClient: Ollama
  private contextBuilder: ChatContextBuilder

  async handleMessage(message: string, sessionId: string): Promise<ChatResponse> {
    // Get conversation history
    const history = await this.getConversationHistory(sessionId)

    // Build context
    const context = await this.contextBuilder.build({
      history,
      currentUrl: message.metadata?.url,
      userId: message.userId,
    })

    // Generate AI response
    const aiResponse = await this.ollamaClient.generate({
      model: 'llama2',
      prompt: this.buildPrompt(message.content, context),
      stream: false,
    })

    // Evaluate confidence
    const confidence = this.evaluateConfidence(aiResponse)

    // Save to history
    await this.saveMessage(sessionId, {
      role: 'assistant',
      content: aiResponse.response,
      confidence,
    })

    // Check if escalation needed
    if (confidence < 0.7 || this.shouldEscalate(message.content)) {
      await this.notifySupport(sessionId)
      return {
        message: 'Let me connect you with our support team for better assistance.',
        escalated: true,
      }
    }

    return {
      message: aiResponse.response,
      confidence,
      escalated: false,
    }
  }
}
```

### Design Template System

```typescript
// src/lib/templates/template-service.ts
export class TemplateService {
  async getTemplates(filters: TemplateFilters): Promise<Template[]> {
    return await prisma.designTemplate.findMany({
      where: {
        productType: filters.productType,
        industry: filters.industry,
        isActive: true,
      },
      orderBy: { popularity: 'desc' },
    })
  }

  async customizeTemplate(
    templateId: string,
    customizations: TemplateCustomizations
  ): Promise<CustomizedDesign> {
    const template = await this.getTemplate(templateId)

    // Apply customizations
    const design = {
      ...template.canvasData,
      elements: this.applyCustomizations(template.canvasData.elements, customizations),
    }

    // Save customized version
    return await prisma.customizedDesign.create({
      data: {
        templateId,
        userId: customizations.userId,
        designData: design,
      },
    })
  }

  async exportToPDF(designId: string): Promise<Buffer> {
    const design = await this.getDesign(designId)

    // Use Puppeteer to render canvas and export to PDF
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.setContent(this.generateHTML(design))
    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
    })

    await browser.close()

    return pdf
  }
}
```

---

## API Endpoints

```
Chat Support:
POST   /api/chat/message
GET    /api/chat/sessions/:sessionId
POST   /api/chat/escalate

Design Templates:
GET    /api/templates
GET    /api/templates/:id
POST   /api/templates/:id/customize
POST   /api/designs/export-pdf

File Proofing:
POST   /api/orders/:id/generate-proof
POST   /api/orders/:id/approve-proof
POST   /api/orders/:id/request-changes
POST   /api/orders/:id/upload-revision

Reviews:
GET    /api/products/:id/reviews
POST   /api/products/:id/reviews
PUT    /api/reviews/:id
DELETE /api/reviews/:id
POST   /api/reviews/:id/helpful

Wishlist:
GET    /api/account/wishlist
POST   /api/account/wishlist
DELETE /api/account/wishlist/:productId
```

---

## Testing Strategy

### Unit Tests

- AI response generation
- Template customization logic
- Proof approval workflow
- Review validation

### Integration Tests

- Ollama AI integration
- Template export to PDF
- Email notifications
- Review submission

### E2E Tests

1. Chat with AI and get accurate answer
2. Customize template and place order
3. Upload file, review proof, approve
4. Leave product review with photos
5. Add to wishlist, get sale notification

---

## Success Metrics

### Launch Criteria

- [ ] AI chat answers >80% of questions correctly
- [ ] 50+ design templates available
- [ ] Proof approval workflow functional
- [ ] Review system with moderation
- [ ] Wishlist working across devices

### Performance Targets

- AI response time: <3 seconds
- Template load time: <2 seconds
- Proof generation: <30 seconds
- Review submission: <2 seconds

### Business Metrics (60 days post-launch)

- Support ticket reduction: >40%
- AI chat resolution rate: >75%
- Template usage: >30% of orders
- Proof approval rate: >95% first time
- Review submission rate: >20% of orders
- Wishlist conversion: >15%

---

## Risks & Mitigation

### Risk 1: AI Accuracy

**Impact:** High
**Probability:** Medium
**Mitigation:**

- Extensive testing with real questions
- Human escalation for low confidence
- Continuous training with support logs
- Clear limitations communicated

### Risk 2: Template Quality

**Impact:** Medium
**Probability:** Low
**Mitigation:**

- Professional designers create templates
- Print quality testing
- Customer feedback loop
- Regular template updates

### Risk 3: Proof Delays

**Impact:** Medium
**Probability:** Medium
**Mitigation:**

- Automated proof generation
- Clear timeline expectations
- Admin alerts for pending proofs
- Auto-escalation after 24 hours

---

## Timeline

### Week 1: AI Chat Support

- Ollama integration
- Chat widget UI
- Context building
- Escalation logic

### Week 2: Design Templates

- Template creation (50+ designs)
- Template library UI
- Basic editor integration
- Export functionality

### Week 3: Advanced Editor & Proofing

- Full editor features
- Proof generation system
- Approval workflow
- Email notifications

### Week 4: Reviews & Wishlist

- Review system
- Moderation panel
- Wishlist functionality
- Sale notifications

### Week 5: Testing & Polish

- E2E testing
- Performance optimization
- User acceptance testing
- Documentation

---

**Epic Owner:** Product Manager
**Technical Lead:** Full Stack Lead + AI Engineer
**Status:** Not Started
**Last Updated:** October 3, 2025
