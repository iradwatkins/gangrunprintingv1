  
\# Custom E-commerce Printing Platform Product Requirements Document (PRD)

\#\# Goals and Background Context

\#\#\# Goals

\* To build a feature-rich, white-label-ready e-commerce platform for highly configurable printing products.  
\* To operate on a vendor-broker model, where production is outsourced to external vendors.  
\* To deliver a superior user experience with dynamic product configuration and pricing.  
\* To integrate a full suite of marketing, email, and CRM capabilities for customer engagement and retention.  
\* To ensure the platform is SEO-optimized and installable as a Progressive Web App (PWA) from day one.  
\* To support both English and Spanish throughout the entire application.

\#\#\# Background Context

This project aims to develop a bespoke e-commerce platform to address a gap in the market for selling complex, highly-configurable printing products. The platform will serve both direct customers and a network of brokers with specialized pricing. The core of the system is a dynamic pricing engine, a flexible product configurator, and deep integration with n8n.io to automate the order fulfillment process with third-party vendors. This PRD will outline the phased development, starting with the core printing website, followed by the integrated email/CRM system and advanced automations, to ensure a structured and successful launch.

\#\#\# Change Log

| Date | Version | Description | Author |  
| :--- | :--- | :--- | :--- |  
| 2025-06-20 | 1.0 | Initial PRD Draft | John (PM) |  
| 2025-06-20 | 2.0 | Revised MVP scope to include Marketing and Automation Epics per stakeholder feedback. | John (PM) |

\---

\#\# Requirements

\#\#\# Functional

\* **\*\*FR1:\*\*** The system must provide a dynamic product configurator allowing users to select options like Paper Stocks, Print Sizes, Coatings, and Sides.  
\* **\*\*FR2:\*\*** A flexible "Add-ons" system must allow administrators to define and manage various add-on services with different pricing models (e.g., Digital Proof, Folding, Design Services).  
\* **\*\*FR3:\*\*** A real-time, dynamic pricing engine must calculate product costs based on a defined sequence of calculations, including markups and discounts.  
\* **\*\*FR4:\*\*** The platform must support a broker system with category-specific discounts that can be managed globally or on a per-user basis.  
\* **\*\*FR5:\*\*** The system must manage a complete order lifecycle with defined statuses and generate a unique, formatted customer reference number for each order.  
\* **\*\*FR6:\*\*** Users must be able to upload artwork files with defined type/size limits and receive clear error handling.  
\* **\*\*FR7:\*\*** A central CRM/Contacts hub must be available to manage user profiles, tags, and segmentation.  
\* **\*\*FR8:\*\*** The platform must include a visual email builder for creating responsive, branded emails for marketing campaigns and broadcasts.  
\* **\*\*FR9:\*\*** A rule-based automation engine for marketing and email workflows is required.  
\* **\*\*FR10:\*\*** The system must integrate with Square, CashApp, and PayPal for payment processing, with support for saved payment methods.  
\* **\*\*FR11:\*\*** A comprehensive "My Account" section must allow users to view filterable order history, re-order products, and track quote requests.  
\* **\*\*FR12:\*\*** The platform's UI must be flexible, allowing an admin to switch between different navigation styles (simple vs. mega menu), product configuration flows (all-in-one vs. guided), and checkout flows (multi-step vs. one-page).  
\* **\*\*FR13:\*\*** Administrators must have a "Theme Editor" to manage logos, a full light/dark mode color palette, and selectable fonts to support a white-label architecture.

\#\#\# Non-Functional

\* **\*\*NFR1:\*\*** The platform must be a Progressive Web App (PWA), supporting installability, push notifications, and offline capabilities.  
\* **\*\*NFR2:\*\*** The entire platform (customer and admin facing) must support English and Spanish localization, with auto-detection and a manual switcher.  
\* **\*\*NFR3:\*\*** All API inputs must be rigorously validated on the backend using Zod schemas.  
\* **\*\*NFR4:\*\*** All complex database operations, such as order creation, must be wrapped in a database transaction to ensure atomicity.  
\* **\*\*NFR5:\*\*** All protected API endpoints must verify a valid user session, and admin endpoints must perform a secondary role check.  
\* **\*\*NFR6:\*\*** The frontend must adhere to WCAG 2.1 AA accessibility standards, including full keyboard navigation and semantic HTML.  
\* **\*\*NFR7:\*\*** The architecture will use Supabase as the primary BaaS, with custom logic implemented as Serverless Functions.  
\* **\*\*NFR8:\*\*** The frontend will be built with React (using Vite) and TypeScript.  
\* **\*\*NFR9:\*\*** Styling will be implemented with Tailwind CSS and Shadcn/UI.  
\* **\*\*NFR10:\*\*** Server state will be managed by React Query, and form state by React Hook Form.

\---

\#\# User Stories / Phased Rollout

\#\#\# Phase 1: Core E-commerce, Marketing & Automation MVP

The goal of Phase 1 is to launch a fully functional e-commerce platform that includes customer-facing ordering, a complete backend marketing suite, and automated order fulfillment.

**\*\*Phase 1 Epics:\*\***

\* **\*\*Epic 1: Foundational Setup & Theming\*\***  
    \* **\*\*Description:\*\*** Establish the core frontend and backend architecture, including the database schema, CI/CD pipeline, and the admin-facing "Theme Editor" to manage the site's branding (logos, colors, fonts).  
    \* **\*\*User Goal:\*\*** As an Administrator, I need to set up my website's core brand identity so that it reflects my business.

\* **\*\*Epic 2: Product Catalog & Configuration\*\***  
    \* **\*\*Description:\*\*** Build the systems to manage the product catalog, including categories, products, and all associated configuration options (paper stocks, coatings, sizes, etc.). Implement the customer-facing product detail page with the dynamic pricing calculator.  
    \* **\*\*User Goal:\*\*** As a Customer, I want to be able to see all available product options and understand the price in real-time as I make selections.

\* **\*\*Epic 3: Core Commerce & Checkout\*\***  
    \* **\*\*Description:\*\*** Implement the floating side cart and the full, multi-step checkout process. This includes address entry, shipping selection, and integration with Square, CashApp, and PayPal.  
    \* **\*\*User Goal:\*\*** As a Customer, I want a clear and secure process to purchase the items in my cart.

\* **\*\*Epic 4: Customer Account Management\*\***  
    \* **\*\*Description:\*\*** Develop the full "My Account" section where users can view their order history (with filtering), see order details, and use the "Re-Order" functionality.  
    \* **\*\*User Goal:\*\*** As a Customer, I want to be able to track my past orders and easily place a new order for a product I've purchased before.

\* **\*\*Epic 5: Admin Order & User Management\*\***  
    \* **\*\*Description:\*\*** Build the essential admin screens for viewing and managing orders, customers, and the broker discount system. The UI for these screens will be based on samples you provide.  
    \* **\*\*User Goal:\*\*** As an Administrator, I need to be able to manage incoming orders and view my customers' details.

\* **\*\*Epic 6: Integrated Marketing & CRM Platform\*\***  
    \* **\*\*Description:\*\*** Build the full marketing suite as defined in the project brief. This includes:  
        \* A central **\*\*CRM/Contacts\*\*** hub with detailed profiles, tagging, and segmentation.  
        \* A visual **\*\*Email Builder\*\*** for creating responsive, branded emails.  
        \* Functionality for **\*\*Email Broadcasts\*\*** for one-time campaigns.  
        \* A rule-based **\*\*Automation\*\*** engine for marketing workflows.  
        \* Detailed **\*\*Analytics\*\*** for tracking performance.  
    \* **\*\*User Goal:\*\*** As an Administrator, I want to manage my customer list and send targeted marketing emails to drive sales and engagement.

\* **\*\*Epic 7: Automated Vendor Order Placement (n8n.io)\*\***  
    \* **\*\*Description:\*\*** Implement the integration with n8n.io to automate order placement with external vendors. This process will be triggered by **\*\*emails sent from the platform\*\*** to the vendor-specific incoming email addresses stored in the system.  
    \* **\*\*User Goal:\*\*** As an Administrator, I want customer orders to be sent to my print vendors automatically so that I don't have to handle them manually.

\---

\#\# Out of Scope

To maintain focus on the Phase 1 MVP, the following features and functionalities are explicitly designated as out of scope for the initial launch. They will be logged and prioritized in a future release cycle.

\* **\*\*Mega Menu Navigation:\*\*** The initial launch will use the simple dropdown navigation style only.  
\* **\*\*One-Page Checkout:\*\*** The initial launch will use the multi-step checkout process only.  
\* **\*\*Post-Purchase Upsells:\*\*** The "Thank You" page will not include any post-purchase upsell functionality for the MVP.  
\* **\*\*Downloadable Templates:\*\*** The product page will direct users to email for templates rather than providing direct downloads.

\---

\#\# Success Metrics

The success of the Phase 1 MVP will be measured against the following key performance indicators (KPIs):

\* **\*\*Adoption & Engagement:\*\***  
    \* Number of registered user accounts.  
    \* Number of successful orders placed.  
    \* Average items per order.  
\* **\*\*Conversion & Commercial:\*\***  
    \* Website conversion rate (percentage of visitors who complete an order).  
    \* Cart abandonment rate.  
    \* Total revenue processed through the platform.  
\* **\*\*User Experience & Performance:\*\***  
    \* Customer satisfaction score (CSAT) collected via post-purchase surveys.  
    \* Number of "Re-orders" placed, indicating satisfaction and convenience.  
    \* Lighthouse performance scores for key pages, ensuring a fast user experience.

\---

\#\# Open Questions / Follow-ups

All previously open questions were resolved during the final review of this document.

\---

\#\# Sign-off / Stakeholders

The following stakeholders have reviewed and approved this PRD, authorizing the start of development:

\* Product Owner  
\* Design Architect  
\* System Architect

