-- Create 3 test orders with Southwest Cargo shipping and image files
-- Run with: psql $DATABASE_URL -f seed-3-test-orders.sql

-- Order 1: Dallas Love Field
INSERT INTO "Order" (
  id, "orderNumber", status,
  "customerEmail", "customerFirstName", "customerLastName", "customerPhone",
  "shippingStreet", "shippingCity", "shippingState", "shippingZipCode", "shippingCountry",
  "shippingMethod", "shippingCarrier", "shippingService", "shippingCost",
  "airportId",
  subtotal, tax, total,
  "createdAt", "updatedAt"
)
VALUES (
  'test_order_dal_' || extract(epoch from now())::bigint,
  'TEST-DAL-' || extract(epoch from now())::bigint,
  'CONFIRMATION',
  'test1@gangrunprinting.com', 'Test', 'Customer 1', '555-0100',
  '123 Test St', 'Dallas', 'TX', '75001', 'US',
  'Southwest Cargo - Dallas Love Field', 'Southwest Cargo', 'Airport Pickup', 0,
  'airport_dal',
  50.00, 4.13, 54.13,
  NOW(), NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Order 2: Houston Hobby
INSERT INTO "Order" (
  id, "orderNumber", status,
  "customerEmail", "customerFirstName", "customerLastName", "customerPhone",
  "shippingStreet", "shippingCity", "shippingState", "shippingZipCode", "shippingCountry",
  "shippingMethod", "shippingCarrier", "shippingService", "shippingCost",
  "airportId",
  subtotal, tax, total,
  "createdAt", "updatedAt"
)
VALUES (
  'test_order_hou_' || extract(epoch from now())::bigint,
  'TEST-HOU-' || extract(epoch from now())::bigint,
  'CONFIRMATION',
  'test2@gangrunprinting.com', 'Test', 'Customer 2', '555-0100',
  '123 Test St', 'Houston', 'TX', '77001', 'US',
  'Southwest Cargo - Houston Hobby', 'Southwest Cargo', 'Airport Pickup', 0,
  'airport_hou',
  100.00, 8.25, 108.25,
  NOW(), NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Order 3: Phoenix Sky Harbor
INSERT INTO "Order" (
  id, "orderNumber", status,
  "customerEmail", "customerFirstName", "customerLastName", "customerPhone",
  "shippingStreet", "shippingCity", "shippingState", "shippingZipCode", "shippingCountry",
  "shippingMethod", "shippingCarrier", "shippingService", "shippingCost",
  "airportId",
  subtotal, tax, total,
  "createdAt", "updatedAt"
)
VALUES (
  'test_order_phx_' || extract(epoch from now())::bigint,
  'TEST-PHX-' || extract(epoch from now())::bigint,
  'CONFIRMATION',
  'test3@gangrunprinting.com', 'Test', 'Customer 3', '555-0100',
  '123 Test St', 'Phoenix', 'AZ', '85001', 'US',
  'Southwest Cargo - Phoenix', 'Southwest Cargo', 'Airport Pickup', 0,
  'airport_phx',
  25.00, 2.06, 27.06,
  NOW(), NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Add order items
INSERT INTO "OrderItem" (
  id, "orderId", "productName", quantity, price, subtotal,
  "createdAt", "updatedAt"
)
SELECT
  'item_' || o.id,
  o.id,
  '4x6 Flyers (9pt Card Stock)',
  CASE
    WHEN o."orderNumber" LIKE '%DAL%' THEN 500
    WHEN o."orderNumber" LIKE '%HOU%' THEN 1000
    WHEN o."orderNumber" LIKE '%PHX%' THEN 250
  END,
  0.10,
  o.subtotal,
  NOW(),
  NOW()
FROM "Order" o
WHERE o."orderNumber" LIKE 'TEST-%'
  AND NOT EXISTS (SELECT 1 FROM "OrderItem" WHERE "orderId" = o.id);

-- Add order files with thumbnails
INSERT INTO "OrderFile" (
  id, "orderId", "fileId", "fileName", "fileUrl", "thumbnailUrl",
  "fileSize", "mimeType", type, status,
  "createdAt", "updatedAt"
)
SELECT
  'file_' || o.id,
  o.id,
  'upload_' || o.id,
  'test-image-' || SUBSTRING(o."orderNumber" FROM 6 FOR 3) || '.png',
  'https://gangrun-test.s3.amazonaws.com/test-image-' || o.id || '.png',
  'https://gangrun-test.s3.amazonaws.com/thumbnails/test-image-' || o.id || '.png',
  1024,
  'image/png',
  'CUSTOMER_ARTWORK',
  'PENDING_REVIEW',
  NOW(),
  NOW()
FROM "Order" o
WHERE o."orderNumber" LIKE 'TEST-%'
  AND NOT EXISTS (SELECT 1 FROM "OrderFile" WHERE "orderId" = o.id);

-- Show results
SELECT
  o."orderNumber",
  o."shippingMethod",
  a.code as "airportCode",
  a.name as "airportName",
  (SELECT COUNT(*) FROM "OrderFile" f WHERE f."orderId" = o.id) as "fileCount",
  (SELECT COUNT(*) FROM "OrderFile" f WHERE f."orderId" = o.id AND f."thumbnailUrl" IS NOT NULL) as "thumbnailCount"
FROM "Order" o
LEFT JOIN "Airport" a ON o."airportId" = a.id
WHERE o."orderNumber" LIKE 'TEST-%'
ORDER BY o."createdAt" DESC
LIMIT 3;
