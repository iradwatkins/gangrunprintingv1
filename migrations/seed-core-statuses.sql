-- ORDER STATUS MANAGER - Core Status Seed Data
-- Populates CustomOrderStatus and StatusTransition tables with default values

-- Generate unique IDs using gen_random_uuid()
-- Note: This script is idempotent - safe to run multiple times

-- Step 1: Insert Core Order Statuses
INSERT INTO "CustomOrderStatus" (
    "id", "name", "slug", "description", "icon", "color", "badgeColor",
    "isPaid", "isCore", "includeInReports", "allowDownloads", "sortOrder",
    "isActive", "sendEmailOnEnter", "createdAt", "updatedAt"
) VALUES
    (gen_random_uuid(), 'Pending Payment', 'PENDING_PAYMENT', 'Order created, waiting for payment', 'Clock', 'yellow', 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', false, true, false, false, 1, true, false, NOW(), NOW()),
    (gen_random_uuid(), 'Payment Declined', 'PAYMENT_DECLINED', 'Payment was declined by payment processor', 'XCircle', 'red', 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', false, true, false, false, 2, true, false, NOW(), NOW()),
    (gen_random_uuid(), 'Payment Failed', 'PAYMENT_FAILED', 'Payment processing encountered an error', 'AlertCircle', 'red', 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', false, true, false, false, 3, true, false, NOW(), NOW()),
    (gen_random_uuid(), 'Paid', 'PAID', 'Payment received and confirmed', 'DollarSign', 'green', 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', true, true, true, true, 4, true, false, NOW(), NOW()),
    (gen_random_uuid(), 'Confirmation', 'CONFIRMATION', 'Order confirmed and ready for production', 'CheckCircle', 'blue', 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', true, true, true, true, 5, true, false, NOW(), NOW()),
    (gen_random_uuid(), 'On Hold', 'ON_HOLD', 'Order has an issue that needs resolution', 'AlertCircle', 'orange', 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400', true, true, true, false, 6, true, false, NOW(), NOW()),
    (gen_random_uuid(), 'Processing', 'PROCESSING', 'Order is being processed', 'Package', 'purple', 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400', true, true, true, true, 7, true, false, NOW(), NOW()),
    (gen_random_uuid(), 'Printing', 'PRINTING', 'Order is currently being printed', 'Package', 'purple', 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400', true, true, true, true, 8, true, false, NOW(), NOW()),
    (gen_random_uuid(), 'Production', 'PRODUCTION', 'Order is in production', 'Package', 'purple', 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400', true, true, true, true, 9, true, false, NOW(), NOW()),
    (gen_random_uuid(), 'Shipped', 'SHIPPED', 'Order has been shipped', 'Truck', 'teal', 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400', true, true, true, true, 10, true, false, NOW(), NOW()),
    (gen_random_uuid(), 'Ready for Pickup', 'READY_FOR_PICKUP', 'Order is ready to be picked up', 'Package', 'cyan', 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400', true, true, true, true, 11, true, false, NOW(), NOW()),
    (gen_random_uuid(), 'On The Way', 'ON_THE_WAY', 'Order is on the way for delivery', 'Truck', 'indigo', 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400', true, true, true, true, 12, true, false, NOW(), NOW()),
    (gen_random_uuid(), 'Picked Up', 'PICKED_UP', 'Order has been picked up by customer', 'CheckCircle', 'green', 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', true, true, true, true, 13, true, false, NOW(), NOW()),
    (gen_random_uuid(), 'Delivered', 'DELIVERED', 'Order successfully delivered', 'CheckCircle', 'emerald', 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400', true, true, true, true, 14, true, false, NOW(), NOW()),
    (gen_random_uuid(), 'Reprint', 'REPRINT', 'Order needs to be reprinted', 'AlertCircle', 'yellow', 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', true, true, true, false, 15, true, false, NOW(), NOW()),
    (gen_random_uuid(), 'Cancelled', 'CANCELLED', 'Order has been cancelled', 'XCircle', 'gray', 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400', false, true, false, false, 16, true, false, NOW(), NOW()),
    (gen_random_uuid(), 'Refunded', 'REFUNDED', 'Order has been refunded', 'DollarSign', 'red', 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', false, true, false, false, 17, true, false, NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- Step 2: Create Status Transitions using slug lookups
-- This allows the script to be idempotent and work even if IDs change

WITH status_ids AS (
    SELECT id, slug FROM "CustomOrderStatus"
)
INSERT INTO "StatusTransition" (
    "id", "fromStatusId", "toStatusId", "requiresPayment", "requiresAdmin", "createdAt"
)
SELECT
    gen_random_uuid(),
    from_status.id,
    to_status.id,
    false,
    false,
    NOW()
FROM (VALUES
    ('PENDING_PAYMENT', 'PAYMENT_DECLINED'),
    ('PENDING_PAYMENT', 'PAYMENT_FAILED'),
    ('PENDING_PAYMENT', 'PAID'),
    ('PENDING_PAYMENT', 'CONFIRMATION'),
    ('PENDING_PAYMENT', 'CANCELLED'),

    ('PAYMENT_DECLINED', 'PENDING_PAYMENT'),
    ('PAYMENT_DECLINED', 'CANCELLED'),

    ('PAYMENT_FAILED', 'PENDING_PAYMENT'),
    ('PAYMENT_FAILED', 'CANCELLED'),

    ('PAID', 'CONFIRMATION'),
    ('PAID', 'REFUNDED'),

    ('CONFIRMATION', 'ON_HOLD'),
    ('CONFIRMATION', 'PROCESSING'),
    ('CONFIRMATION', 'PRODUCTION'),
    ('CONFIRMATION', 'CANCELLED'),

    ('ON_HOLD', 'CONFIRMATION'),
    ('ON_HOLD', 'PRODUCTION'),
    ('ON_HOLD', 'CANCELLED'),

    ('PROCESSING', 'PRODUCTION'),
    ('PROCESSING', 'ON_HOLD'),

    ('PRINTING', 'PRODUCTION'),
    ('PRINTING', 'ON_HOLD'),

    ('PRODUCTION', 'SHIPPED'),
    ('PRODUCTION', 'READY_FOR_PICKUP'),
    ('PRODUCTION', 'ON_THE_WAY'),
    ('PRODUCTION', 'ON_HOLD'),
    ('PRODUCTION', 'REPRINT'),

    ('SHIPPED', 'DELIVERED'),
    ('SHIPPED', 'REPRINT'),

    ('READY_FOR_PICKUP', 'PICKED_UP'),
    ('READY_FOR_PICKUP', 'REPRINT'),

    ('ON_THE_WAY', 'DELIVERED'),
    ('ON_THE_WAY', 'PICKED_UP'),
    ('ON_THE_WAY', 'REPRINT'),

    ('PICKED_UP', 'REPRINT'),
    ('DELIVERED', 'REPRINT'),

    ('REPRINT', 'PRODUCTION')
) AS transitions(from_slug, to_slug)
JOIN status_ids AS from_status ON from_status.slug = transitions.from_slug
JOIN status_ids AS to_status ON to_status.slug = transitions.to_slug
ON CONFLICT ("fromStatusId", "toStatusId") DO NOTHING;

-- Step 3: Verification queries
SELECT
    COUNT(*) as total_statuses,
    COUNT(CASE WHEN "isCore" = true THEN 1 END) as core_statuses,
    COUNT(CASE WHEN "isActive" = true THEN 1 END) as active_statuses
FROM "CustomOrderStatus";

SELECT COUNT(*) as total_transitions FROM "StatusTransition";

-- Display created statuses
SELECT
    "sortOrder",
    "name",
    "slug",
    "isPaid",
    "isCore"
FROM "CustomOrderStatus"
ORDER BY "sortOrder";
