-- ORDER STATUS MANAGER MIGRATION
-- Adds CustomOrderStatus and StatusTransition tables
-- Changes Order.status from enum to String for dynamic statuses

-- Step 1: Create CustomOrderStatus table
CREATE TABLE IF NOT EXISTS "CustomOrderStatus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "badgeColor" TEXT NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "isCore" BOOLEAN NOT NULL DEFAULT false,
    "includeInReports" BOOLEAN NOT NULL DEFAULT true,
    "allowDownloads" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailTemplateId" TEXT,
    "sendEmailOnEnter" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomOrderStatus_pkey" PRIMARY KEY ("id")
);

-- Step 2: Create StatusTransition table
CREATE TABLE IF NOT EXISTS "StatusTransition" (
    "id" TEXT NOT NULL,
    "fromStatusId" TEXT NOT NULL,
    "toStatusId" TEXT NOT NULL,
    "requiresPayment" BOOLEAN NOT NULL DEFAULT false,
    "requiresAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatusTransition_pkey" PRIMARY KEY ("id")
);

-- Step 3: Add indexes for CustomOrderStatus
CREATE UNIQUE INDEX IF NOT EXISTS "CustomOrderStatus_slug_key" ON "CustomOrderStatus"("slug");
CREATE INDEX IF NOT EXISTS "CustomOrderStatus_slug_idx" ON "CustomOrderStatus"("slug");
CREATE INDEX IF NOT EXISTS "CustomOrderStatus_isActive_idx" ON "CustomOrderStatus"("isActive");
CREATE INDEX IF NOT EXISTS "CustomOrderStatus_sortOrder_idx" ON "CustomOrderStatus"("sortOrder");
CREATE INDEX IF NOT EXISTS "CustomOrderStatus_isPaid_idx" ON "CustomOrderStatus"("isPaid");

-- Step 4: Add indexes for StatusTransition
CREATE UNIQUE INDEX IF NOT EXISTS "StatusTransition_fromStatusId_toStatusId_key" ON "StatusTransition"("fromStatusId", "toStatusId");
CREATE INDEX IF NOT EXISTS "StatusTransition_fromStatusId_idx" ON "StatusTransition"("fromStatusId");
CREATE INDEX IF NOT EXISTS "StatusTransition_toStatusId_idx" ON "StatusTransition"("toStatusId");

-- Step 5: Add foreign keys
ALTER TABLE "CustomOrderStatus" ADD CONSTRAINT "CustomOrderStatus_emailTemplateId_fkey" FOREIGN KEY ("emailTemplateId") REFERENCES "EmailTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StatusTransition" ADD CONSTRAINT "StatusTransition_fromStatusId_fkey" FOREIGN KEY ("fromStatusId") REFERENCES "CustomOrderStatus"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StatusTransition" ADD CONSTRAINT "StatusTransition_toStatusId_fkey" FOREIGN KEY ("toStatusId") REFERENCES "CustomOrderStatus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 6: Change Order.status from enum to text
ALTER TABLE "Order" ALTER COLUMN "status" TYPE TEXT;
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING_PAYMENT';

-- Step 7: Add index on Order.status
CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status");

-- Step 8: Change StatusHistory from enum to text
ALTER TABLE "StatusHistory" ALTER COLUMN "fromStatus" TYPE TEXT;
ALTER TABLE "StatusHistory" ALTER COLUMN "toStatus" TYPE TEXT;

-- Step 9: Add indexes for StatusHistory
CREATE INDEX IF NOT EXISTS "StatusHistory_orderId_idx" ON "StatusHistory"("orderId");
CREATE INDEX IF NOT EXISTS "StatusHistory_toStatus_idx" ON "StatusHistory"("toStatus");
