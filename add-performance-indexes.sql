-- Performance Optimization Indexes for GangRun Printing
-- Sprint 3: Code Quality & Performance
-- Date: 2025-10-23

-- =============================================================================
-- HIGH-PRIORITY INDEXES (Query Optimization)
-- =============================================================================

-- Orders table - Most frequently queried fields
CREATE INDEX IF NOT EXISTS idx_order_status ON "Order"(status) WHERE "isActive" = true;
CREATE INDEX IF NOT EXISTS idx_order_email ON "Order"(email) WHERE "isActive" = true;
CREATE INDEX IF NOT EXISTS idx_order_number ON "Order"("orderNumber") WHERE "isActive" = true;
CREATE INDEX IF NOT EXISTS idx_order_created_at ON "Order"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_order_user_id ON "Order"("userId") WHERE "userId" IS NOT NULL;

-- Products table - Customer browsing and search
CREATE INDEX IF NOT EXISTS idx_product_slug ON "Product"(slug) WHERE "isActive" = true;
CREATE INDEX IF NOT EXISTS idx_product_sku ON "Product"(sku) WHERE "isActive" = true;
CREATE INDEX IF NOT EXISTS idx_product_category ON "Product"("productCategoryId") WHERE "isActive" = true;
CREATE INDEX IF NOT EXISTS idx_product_active ON "Product"("isActive", "createdAt" DESC);

-- Users table - Authentication and lookups
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_user_role ON "User"(role);
CREATE INDEX IF NOT EXISTS idx_user_broker ON "User"("isBroker") WHERE "isBroker" = true;

-- Sessions table - Authentication lookups
CREATE INDEX IF NOT EXISTS idx_session_expires_at ON "Session"("expiresAt");
CREATE INDEX IF NOT EXISTS idx_session_user_id ON "Session"("userId");

-- =============================================================================
-- MEDIUM-PRIORITY INDEXES (Admin Operations)
-- =============================================================================

-- OrderItem table - Order detail queries
CREATE INDEX IF NOT EXISTS idx_order_item_order_id ON "OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS idx_order_item_product ON "OrderItem"("productId");

-- ProductImage table - Product display
CREATE INDEX IF NOT EXISTS idx_product_image_product ON "ProductImage"("productId", "sortOrder" ASC);
CREATE INDEX IF NOT EXISTS idx_product_image_primary ON "ProductImage"("productId", "isPrimary") WHERE "isPrimary" = true;

-- File table - Order file management
CREATE INDEX IF NOT EXISTS idx_file_order ON "File"("orderId");
CREATE INDEX IF NOT EXISTS idx_file_user ON "File"("userId") WHERE "userId" IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_file_status ON "File"(status);

-- =============================================================================
-- CONFIGURATION TABLES (Product Setup Queries)
-- =============================================================================

-- Product configuration relationships
CREATE INDEX IF NOT EXISTS idx_product_paper_stock_set ON "ProductPaperStockSet"("productId", "sortOrder" ASC);
CREATE INDEX IF NOT EXISTS idx_product_quantity_group ON "ProductQuantityGroup"("productId");
CREATE INDEX IF NOT EXISTS idx_product_size_group ON "ProductSizeGroup"("productId");
CREATE INDEX IF NOT EXISTS idx_product_addon_set ON "ProductAddOnSet"("productId", "sortOrder" ASC);

-- Configuration set items
CREATE INDEX IF NOT EXISTS idx_paper_stock_set_item ON "PaperStockSetItem"("paperStockSetId", "sortOrder" ASC);
CREATE INDEX IF NOT EXISTS idx_addon_set_item ON "AddOnSetItem"("addOnSetId", "sortOrder" ASC);
CREATE INDEX IF NOT EXISTS idx_design_set_item ON "DesignSetItem"("designSetId", "sortOrder" ASC);

-- =============================================================================
-- COMPOSITE INDEXES (Multi-column queries)
-- =============================================================================

-- Order search by user + status
CREATE INDEX IF NOT EXISTS idx_order_user_status ON "Order"("userId", status) WHERE "userId" IS NOT NULL AND "isActive" = true;

-- Product search by category + active
CREATE INDEX IF NOT EXISTS idx_product_category_active ON "Product"("productCategoryId", "isActive", "createdAt" DESC);

-- Order items by order + product (for analytics)
CREATE INDEX IF NOT EXISTS idx_order_item_composite ON "OrderItem"("orderId", "productId");

-- =============================================================================
-- ANALYTICS INDEXES (Reporting Queries)
-- =============================================================================

-- Revenue analytics
CREATE INDEX IF NOT EXISTS idx_order_total_created ON "Order"("totalAmount", "createdAt" DESC) WHERE "isActive" = true;

-- Product popularity
CREATE INDEX IF NOT EXISTS idx_order_item_product_created ON "OrderItem"("productId", "createdAt" DESC);

-- =============================================================================
-- INDEX SUMMARY
-- =============================================================================
-- Total indexes created: 35
-- High-priority: 15 indexes
-- Medium-priority: 8 indexes
-- Configuration: 7 indexes
-- Composite: 3 indexes
-- Analytics: 2 indexes
