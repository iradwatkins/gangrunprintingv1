### **1\. Project Brief \- Overall View (FINAL).md**

Markdown

\# Project Brief: Custom E-commerce Printing Platform (FINAL)

**\*\*Last Updated:\*\*** June 17, 2025

\#\# 1\. Introduction & Vision

**\*\*Project Core:\*\*** To develop a bespoke e-commerce platform specifically designed for selling highly configurable printing products online. The platform will operate on a vendor-broker model, where the business acts as the primary printer/interface to the customer, while actual print production is outsourced to various external vendors.

**\*\*Vision:\*\*** The goal is to build a comprehensive, feature-rich e-commerce platform that includes advanced product configuration, dynamic pricing, a full suite of marketing automation and CRM capabilities, and a flexible, white-label-ready architecture. The development will proceed in prioritized phases to ensure a systematic rollout, starting with the core printing website, followed by the email/builder capabilities, and then the automations.

**\*\*Purpose of this Brief:\*\*** To serve as the master summary of all key requirements, features, and scope decisions for the platform, acting as the primary source of truth for all subsequent design and development phases.

\#\# 2\. Target Audience / Users

\* **\*\*End Customers:\*\*** Individuals and businesses seeking custom-printed materials.  
\* **\*\*Brokers:\*\*** Resellers or trade clients who receive specialized pricing.  
\* **\*\*Administrators:\*\*** Site owners and staff responsible for managing the entire platform.

\#\# 3\. Key Features & Scope (MVP)

\*\*(The MVP scope encompasses the full functionality defined in the UI/UX, Frontend Architecture, and System Architecture documents, to be built out in prioritized phases.)\*\*

\#\#\# 3.1. Core E-commerce Functionality  
\* **\*\*Dynamic Product Configuration:\*\*** A flexible system allowing customers to configure complex print products based on attributes like Paper Stocks, Print Sizes, Coatings, and Sides.  
\* **\*\*Add-on Services:\*\*** A comprehensive list of defined add-ons (e.g., Digital Proof, Folding, Design Services, Hole Drilling) with various pricing models. The system allows admins to create new add-on types.  
\* **\*\*Dynamic Pricing Engine:\*\*** A pricing engine that calculates product costs in real-time based on a defined sequence of calculations, including base price, discounts, markups, and add-on costs.  
\* **\*\*Broker System:\*\*** A system for managing broker accounts with category-specific discounts that can be set globally or on a per-user basis.  
\* **\*\*Order Management:\*\*** A complete order lifecycle with defined statuses (e.g., Confirmation, Production, Shipped). Includes a unique \`Customer Reference / Invoice Number\` (\`GRP-12345\` format) for tracking.  
\* **\*\*File Upload System:\*\*** A robust system for customers to upload artwork, with defined file type and size limits, and clear error handling.  
\* **\*\*SEO & PWA:\*\*** Comprehensive SEO features (Technical, On-Page, Structured Data, Google Shopping Feed) and core PWA capabilities (Installability, Push Notifications, Offline support) are required from the start.

\#\#\# 3.2. UI/UX & Frontend Features  
\* **\*\*Flexible UI Components:\*\*** The platform will support multiple UI styles controllable by an admin, including:  
 \* **\*\*Navigation:\*\*** Both simple dropdowns and a "mega menu" style.  
 \* **\*\*Product Page Flow:\*\*** Both a guided, step-by-step configuration and an "all-in-one-form" approach.  
 \* **\*\*Checkout Flow:\*\*** Both a multi-step and a one-page checkout process.  
\* **\*\*Floating Side Cart (Mini Cart):\*\*** A site-wide slide-out cart for an enhanced user experience.  
\* **\*\*Customer Account Section:\*\*** A comprehensive "My Account" area where users can view order history (with status filters and search), see order details, re-order products, and track quotes.  
\* **\*\*Branding & Theming:\*\*** A powerful admin "Theme Editor" to manage multiple logos (light/dark themes, favicon, OG image), a full light/dark mode color palette, and selectable fonts for headings and body text to support the white-label-ready architecture.  
\* **\*\*Localization:\*\*** The entire platform (customer- and admin-facing) will support **\*\*English and Spanish\*\***, with auto-detection from browser settings and a manual switcher. Content will be sourced via auto-translation with the ability for admins to manually edit/override.

\#\#\# 3.3. System & Automation Features  
\* **\*\*Payment Gateways:\*\*** Integration with **\*\*Square, CashApp, and PayPal\*\*** using their standard checkout flows. The system will support saved payment methods for registered users. All payments are capture-at-time-of-order (no pre-authorizations).  
\* **\*\*Marketing & Email Platform:\*\*** The MVP will include the full, comprehensive system as analyzed from the Funnel Kit reference material. This includes:  
 \* A central **\*\*CRM/Contacts\*\*** hub with detailed profiles, tagging, and segmentation.  
 \* A visual **\*\*Email Builder\*\*** for creating responsive, branded emails.  
 \* **\*\*Email Broadcasts\*\*** for one-time campaigns.  
 \* A rule-based **\*\*Automation\*\*** engine.  
 \* Detailed **\*\*Analytics\*\*** for tracking performance.  
\* **\*\*Admin Controls:\*\***  
 \* **\*\*Website Identity Management:\*\*** The ability to change the core brand identity (logo, name, address, etc.) from a central admin page.  
 \* **\*\*Automation Control:\*\*** Both a global on/off switch for order automation and per-order buttons to "Start Automation" or "Handle Manually".  
\* **\*\*N8n.io Integration:\*\*** Deep integration with n8n.io for automating order placement with external vendors and other workflows, facilitated by a custom API from the main platform.

\#\# 4\. Known Technical Constraints or Preferences

\*\*(This section is guided by the \`\# Technical Preferences for {Project Name}.txt\` document.)\*\*  
\* **\*\*Overall Architecture:\*\*** Polyrepo approach; **\*\*Supabase\*\*** as the primary BaaS.  
\* **\*\*Frontend:\*\*** **\*\*React\*\*** with **\*\*Vite\*\*** and **\*\*TypeScript\*\***.  
\* **\*\*Styling & Components:\*\*** **\*\*Tailwind CSS\*\*** with **\*\*Shadcn/UI\*\***.  
\* **\*\*State Management:\*\*** A layered approach using **\*\*React Query\*\***, **\*\*React Hook Form\*\***, and **\*\*React Context API\*\*** (with Zustand/Jotai as a potential upgrade).  
\* **\*\*Key Libraries:\*\*** **\*\*Zod\*\***, **\*\*CVA/clsx/Tailwind Merge\*\***, **\*\*date-fns\*\***.  
\* **\*\*Backend:\*\*** Serverless Functions on Supabase; **\*\*Node.js/Express.js\*\*** if a custom service is needed.  
\* **\*\*CI/CD & Hosting:\*\*** **\*\*GitHub Actions\*\*** for CI/CD, deploying to **\*\*Vercel or Netlify\*\***.
