\*\*3. \`System-Architecture.md\`\*\*

\`\`\`markdown  
\# System Architecture: Custom E-commerce Printing Platform (MVP)

\*\*Last Updated:\*\* June 17, 2025  
\*\*Architect:\*\* Fred

\#\# 1\. High-Level Architecture  
\* \*\*Primary Architecture:\*\* A \*\*Backend-as-a-Service (BaaS)\*\* approach using \*\*Supabase\*\*. Supabase will provide the core PostgreSQL database, Authentication, and File Storage services.  
\* \*\*Custom Logic:\*\* Custom backend logic will be implemented primarily as \*\*Serverless Functions\*\* (e.g., Supabase Edge Functions).  
\* \*\*Contingency:\*\* If any business logic proves too complex or stateful for serverless functions, a separate \*\*Node.js Modular Monolith\*\* service will be considered.  
\* \*\*Automation:\*\* \*\*N8n.io\*\* is a critical component, integrated via webhooks and a custom API, responsible for order processing with vendors, status updates, and other automated workflows.

\#\# 2\. Database Schema (Supabase PostgreSQL)

\*(This section summarizes the key tables. All tables include standard \`id\`, \`created_at\`, and \`updated_at\` fields.)\*

\* \*\*\`users\`\*\*: Stores customer and broker data. Includes \`is_broker\` (boolean) and \`broker_category_discounts\` (JSONB) to manage broker-specific pricing.  
\* \*\*\`product_categories\`\*\*: Stores product categories and sub-categories (\`parent_category_id\`). Includes \`default_broker_discount\` for the broker system.  
\* \*\*\`products\`\*\*: Stores core product information, linking to a \`category_id\` and \`vendor_id\`.  
\* \*\*\`vendors\`\*\*: Stores information on external print suppliers, including \`incoming_email_addresses\` (for n8n.io) and \`supported_shipping_carriers\` (for shipping logic).  
\* \*\*Global Options Tables\*\*:  
 \* \`paper_stocks\`: Defines paper attributes, including high-precision price and weight per square inch (\`DECIMAL(12, 8)\`).  
 \* \`coatings\`: Defines available coating options.  
 \* \`print_sizes\`: Defines standard, named print dimensions.  
 \* \`turnaround_times\`: Defines turnaround options and their percentage price markup.  
 \* \`add_ons\`: A flexible table using a \`pricing_model\` (ENUM) and a \`configuration\` (JSONB) field to handle all diverse add-on types and their specific pricing rules.  
\* \*\*Join Tables (Many-to-Many Relationships)\*\*:  
 \* \`paper_stock_coatings\`: Links coatings to paper stocks and marks the default coating.  
 \* \`product_paper_stocks\`, \`product_print_sizes\`, \`product_turnaround_times\`: Link products to their curated lists of available options and mark the default selection.  
 \* \`product_add_ons\`: Links products to their available add-ons and supports product-specific price overrides and mandatory flags.  
\* \*\*Order Tables\*\*:  
 \* \`orders\`: The parent table for an order, storing customer ID, the unique \`reference_number\`, overall status, pricing totals, and JSONB snapshots of the shipping and billing addresses for historical accuracy.  
 \* \`order_jobs\`: The line items for an order. Each job links to a parent order and product, and stores a JSONB snapshot of its full \`configuration\` and \`price_summary\` at the time of purchase. It also has job-specific status and tracking information to support multi-vendor, multi-shipment orders.

\#\# 3\. API Reference (RESTful API v1)

\#\#\# 3.1. Public Endpoints  
\* \`GET /api/v1/products\`: Fetches list of products, filterable by category.  
\* \`GET /api/v1/products/:productSlug\`: Fetches all details and configuration options for a single product.  
\* \`POST /api/v1/price-calculator\`: Calculates the dynamic price for a given product configuration.

\#\#\# 3.2. Authenticated Customer Endpoints  
\* \`GET /api/v1/cart\`: Retrieves the user's current shopping cart.  
\* \`POST /api/v1/cart/jobs\`: Adds a configured job to the cart.  
\* \`PUT /api/v1/cart/jobs/:jobId\`: Updates a job in the cart (e.g., quantity).  
\* \`DELETE /api/v1/cart/jobs/:jobId\`: Removes a job from the cart.  
\* \`POST /api/v1/orders\`: Creates a formal order from the cart and initiates payment.  
\* \`GET /api/v1/account/orders\`: Fetches the user's order history with status/date filters.  
\* \`GET /api/v1/account/orders/:orderId\`: Fetches details of a single past order.  
\* \`POST /api/v1/account/orders/:orderId/reorder\`: Initiates the re-order process.  
\* \`GET /api/v1/account/quotes\`: Fetches the user's quote request history.

\#\#\# 3.3. Admin-Only Endpoints  
\* \*\*Product Catalog Management:\*\* Full CRUD endpoints for \`categories\`, \`products\`, \`paper-stocks\`, \`coatings\`, \`print-sizes\`, \`turnaround-times\`, and \`add-ons\`.  
\* \*\*Operations Management:\*\* Endpoints to manage \`orders\` (view list, view detail, update status), \`order-jobs\` (update status), \`users\` (view list, view detail, update broker status/discounts), and \`vendors\` (full CRUD).

\#\# 4\. Architectural Policies

\* \*\*Error Handling Strategy:\*\*  
 \* \*\*Logging:\*\* All backend errors logged in a structured JSON format with a correlation ID.  
 \* \*\*API Responses:\*\* Use standard HTTP status codes. Error responses to the client are a standardized JSON object with a user-friendly message, not internal error details.  
 \* \*\*Data Integrity:\*\* All complex database operations (like order creation) must be wrapped in a \*\*database transaction\*\* to ensure atomicity.  
\* \*\*Security Best Practices:\*\*  
 \* \*\*Input Validation:\*\* All API inputs must be rigorously validated on the backend using \*\*Zod\*\* schemas.  
 \* \*\*Authentication/Authorization:\*\* All protected endpoints must verify a valid user session (via Supabase Auth). Admin endpoints must perform a secondary role check.  
 \* \*\*Secrets Management:\*\* No secrets in source code; all keys managed as secure environment variables in Supabase.  
 \* \*\*Principle of Least Privilege:\*\* Database access roles for serverless functions will be scoped to the minimum required permissions.
