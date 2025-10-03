-- =====================================================
-- GangRun Printing: Broker Order System Migration
-- =====================================================
-- This migration updates the Order model for print broker operations
-- and simplifies the OrderStatus enum
--
-- BACKUP FIRST: pg_dump gangrun_db > backup_before_broker_migration.sql
-- =====================================================

BEGIN;

-- Step 1: Add new columns to Order table
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "filesApprovedAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "filesApprovedBy" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "vendorNotifiedAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "internalNotes" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "customerNotes" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "rushOrder" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "priorityLevel" INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "productionDeadline" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "estimatedCompletion" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "estimatedDelivery" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "pickedUpAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "pickedUpBy" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveredAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "reprintReason" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "originalOrderId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "holdReason" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "pickupLocation" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "pickupInstructions" TEXT;

-- Step 2: Create temporary status mapping column
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "temp_status" TEXT;

-- Step 3: Map existing statuses to new broker statuses
UPDATE "Order" SET "temp_status" =
  CASE status
    WHEN 'PENDING_PAYMENT' THEN 'PENDING_PAYMENT'
    WHEN 'PAID' THEN 'CONFIRMATION'
    WHEN 'CONFIRMATION' THEN 'CONFIRMATION'
    WHEN 'PRE_PRESS' THEN 'CONFIRMATION'
    WHEN 'PROCESSING' THEN 'PRODUCTION'
    WHEN 'PRODUCTION' THEN 'PRODUCTION'
    WHEN 'PRINTING' THEN 'PRODUCTION'
    WHEN 'QUALITY_CHECK' THEN 'PRODUCTION'
    WHEN 'BINDERY' THEN 'PRODUCTION'
    WHEN 'PACKAGING' THEN 'PRODUCTION'
    WHEN 'ON_HOLD' THEN 'ON_HOLD'
    WHEN 'READY_FOR_PICKUP' THEN 'READY_FOR_PICKUP'
    WHEN 'SHIPPED' THEN 'SHIPPED'
    WHEN 'DELIVERED' THEN 'DELIVERED'
    WHEN 'CANCELLED' THEN 'CANCELLED'
    WHEN 'REFUNDED' THEN 'REFUNDED'
    WHEN 'PAYMENT_FAILED' THEN 'PAYMENT_DECLINED'
    ELSE 'CONFIRMATION'
  END;

-- Step 4: Show what will change (for verification)
SELECT
  status as old_status,
  temp_status as new_status,
  COUNT(*) as count
FROM "Order"
GROUP BY status, temp_status
ORDER BY status;

-- Step 5: Drop default value from status column (required for enum change)
ALTER TABLE "Order" ALTER COLUMN status DROP DEFAULT;

-- Step 6: Drop old enum type and create new one
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";

CREATE TYPE "OrderStatus" AS ENUM (
  'PENDING_PAYMENT',
  'PAYMENT_DECLINED',
  'CONFIRMATION',
  'ON_HOLD',
  'PRODUCTION',
  'SHIPPED',
  'READY_FOR_PICKUP',
  'ON_THE_WAY',
  'PICKED_UP',
  'DELIVERED',
  'REPRINT',
  'CANCELLED',
  'REFUNDED'
);

-- Step 7: Update status column to use new enum
ALTER TABLE "Order" ALTER COLUMN status TYPE "OrderStatus" USING temp_status::"OrderStatus";

-- Step 8: Restore default value
ALTER TABLE "Order" ALTER COLUMN status SET DEFAULT 'PENDING_PAYMENT'::"OrderStatus";

-- Step 9: Update StatusHistory table with status mapping
ALTER TABLE "StatusHistory" ADD COLUMN IF NOT EXISTS "temp_toStatus" TEXT;
ALTER TABLE "StatusHistory" ADD COLUMN IF NOT EXISTS "temp_fromStatus" TEXT;

UPDATE "StatusHistory" SET "temp_toStatus" =
  CASE "toStatus"::text
    WHEN 'PENDING_PAYMENT' THEN 'PENDING_PAYMENT'
    WHEN 'PAID' THEN 'CONFIRMATION'
    WHEN 'CONFIRMATION' THEN 'CONFIRMATION'
    WHEN 'PRE_PRESS' THEN 'CONFIRMATION'
    WHEN 'PROCESSING' THEN 'PRODUCTION'
    WHEN 'PRODUCTION' THEN 'PRODUCTION'
    WHEN 'PRINTING' THEN 'PRODUCTION'
    WHEN 'QUALITY_CHECK' THEN 'PRODUCTION'
    WHEN 'BINDERY' THEN 'PRODUCTION'
    WHEN 'PACKAGING' THEN 'PRODUCTION'
    WHEN 'ON_HOLD' THEN 'ON_HOLD'
    WHEN 'READY_FOR_PICKUP' THEN 'READY_FOR_PICKUP'
    WHEN 'SHIPPED' THEN 'SHIPPED'
    WHEN 'DELIVERED' THEN 'DELIVERED'
    WHEN 'CANCELLED' THEN 'CANCELLED'
    WHEN 'REFUNDED' THEN 'REFUNDED'
    WHEN 'PAYMENT_FAILED' THEN 'PAYMENT_DECLINED'
    ELSE 'CONFIRMATION'
  END;

UPDATE "StatusHistory" SET "temp_fromStatus" =
  CASE "fromStatus"::text
    WHEN 'PENDING_PAYMENT' THEN 'PENDING_PAYMENT'
    WHEN 'PAID' THEN 'CONFIRMATION'
    WHEN 'CONFIRMATION' THEN 'CONFIRMATION'
    WHEN 'PRE_PRESS' THEN 'CONFIRMATION'
    WHEN 'PROCESSING' THEN 'PRODUCTION'
    WHEN 'PRODUCTION' THEN 'PRODUCTION'
    WHEN 'PRINTING' THEN 'PRODUCTION'
    WHEN 'QUALITY_CHECK' THEN 'PRODUCTION'
    WHEN 'BINDERY' THEN 'PRODUCTION'
    WHEN 'PACKAGING' THEN 'PRODUCTION'
    WHEN 'ON_HOLD' THEN 'ON_HOLD'
    WHEN 'READY_FOR_PICKUP' THEN 'READY_FOR_PICKUP'
    WHEN 'SHIPPED' THEN 'SHIPPED'
    WHEN 'DELIVERED' THEN 'DELIVERED'
    WHEN 'CANCELLED' THEN 'CANCELLED'
    WHEN 'REFUNDED' THEN 'REFUNDED'
    WHEN 'PAYMENT_FAILED' THEN 'PAYMENT_DECLINED'
    ELSE 'CONFIRMATION'
  END;

ALTER TABLE "StatusHistory" ALTER COLUMN "toStatus" TYPE "OrderStatus" USING "temp_toStatus"::"OrderStatus";
ALTER TABLE "StatusHistory" ALTER COLUMN "fromStatus" TYPE "OrderStatus" USING "temp_fromStatus"::"OrderStatus";

ALTER TABLE "StatusHistory" DROP COLUMN "temp_toStatus";
ALTER TABLE "StatusHistory" DROP COLUMN "temp_fromStatus";

-- Step 10: Cleanup
ALTER TABLE "Order" DROP COLUMN "temp_status";
DROP TYPE "OrderStatus_old";

-- Step 11: Create indexes for performance
CREATE INDEX IF NOT EXISTS "Order_status_createdAt_idx" ON "Order"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "Order_paidAt_idx" ON "Order"("paidAt") WHERE "paidAt" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "Order_vendorId_status_idx" ON "Order"("vendorId", "status") WHERE "vendorId" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "Order_rushOrder_idx" ON "Order"("rushOrder") WHERE "rushOrder" = true;
CREATE INDEX IF NOT EXISTS "Order_tags_idx" ON "Order" USING GIN("tags");

-- Step 12: Verify migration
SELECT
  status,
  COUNT(*) as count,
  MIN("createdAt") as first_order,
  MAX("createdAt") as last_order
FROM "Order"
GROUP BY status
ORDER BY count DESC;

COMMIT;

-- =====================================================
-- Migration Complete!
-- =====================================================
-- Next steps:
-- 1. Run: npx prisma generate
-- 2. Restart app: pm2 restart gangrunprinting
-- 3. Test order status updates in admin dashboard
-- =====================================================
