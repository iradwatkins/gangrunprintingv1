-- Create 4 Test Orders Directly in Database
-- Product: 4x6 Flyers - 9pt Card Stock

-- Order 1: John Smith - 250 Flyers - Phoenix, AZ
INSERT INTO "Order" (
  id, "orderNumber", "customerEmail", "customerName", "customerPhone",
  "shippingStreet1", "shippingCity", "shippingState", "shippingPostalCode", "shippingCountry",
  "billingStreet1", "billingCity", "billingState", "billingPostalCode", "billingCountry",
  subtotal, "shippingCost", tax, total,
  "paymentMethod", "paymentStatus", status,
  "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(), 'GR' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0'),
  'john.smith@test.com', 'John Smith', '602-555-0101',
  '123 Main St', 'Phoenix', 'AZ', '85034', 'US',
  '123 Main St', 'Phoenix', 'AZ', '85034', 'US',
  13750.00, 22.77, 0, 13772.77,
  'TEST', 'PENDING', 'CONFIRMATION',
  NOW(), NOW()
) RETURNING id, "orderNumber", "customerName", total;

-- Order 2: Sarah Johnson - 500 Flyers - Dallas, TX
INSERT INTO "Order" (
  id, "orderNumber", "customerEmail", "customerName", "customerPhone",
  "shippingStreet1", "shippingCity", "shippingState", "shippingPostalCode", "shippingCountry",
  "billingStreet1", "billingCity", "billingState", "billingPostalCode", "billingCountry",
  subtotal, "shippingCost", tax, total,
  "paymentMethod", "paymentStatus", status,
  "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(), 'GR' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0'),
  'sarah.johnson@test.com', 'Sarah Johnson', '214-555-0202',
  '456 Oak Ave', 'Dallas', 'TX', '75201', 'US',
  '456 Oak Ave', 'Dallas', 'TX', '75201', 'US',
  27500.00, 20.71, 0, 27520.71,
  'TEST', 'PENDING', 'CONFIRMATION',
  NOW(), NOW()
) RETURNING id, "orderNumber", "customerName", total;

-- Order 3: Mike Davis - 1000 Flyers - Los Angeles, CA
INSERT INTO "Order" (
  id, "orderNumber", "customerEmail", "customerName", "customerPhone",
  "shippingStreet1", "shippingCity", "shippingState", "shippingPostalCode", "shippingCountry",
  "billingStreet1", "billingCity", "billingState", "billingPostalCode", "billingCountry",
  subtotal, "shippingCost", tax, total,
  "paymentMethod", "paymentStatus", status,
  "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(), 'GR' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0'),
  'mike.davis@test.com', 'Mike Davis', '213-555-0303',
  '789 Elm Blvd', 'Los Angeles', 'CA', '90001', 'US',
  '789 Elm Blvd', 'Los Angeles', 'CA', '90001', 'US',
  55000.00, 23.88, 0, 55023.88,
  'TEST', 'PENDING', 'CONFIRMATION',
  NOW(), NOW()
) RETURNING id, "orderNumber", "customerName", total;

-- Order 4: Lisa Brown - 500 Flyers - Scottsdale, AZ
INSERT INTO "Order" (
  id, "orderNumber", "customerEmail", "customerName", "customerPhone",
  "shippingStreet1", "shippingCity", "shippingState", "shippingPostalCode", "shippingCountry",
  "billingStreet1", "billingCity", "billingState", "billingPostalCode", "billingCountry",
  subtotal, "shippingCost", tax, total,
  "paymentMethod", "paymentStatus", status,
  "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(), 'GR' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0'),
  'lisa.brown@test.com', 'Lisa Brown', '480-555-0404',
  '321 Pine Dr', 'Scottsdale', 'AZ', '85251', 'US',
  '321 Pine Dr', 'Scottsdale', 'AZ', '85251', 'US',
  27500.00, 22.77, 0, 27522.77,
  'TEST', 'PENDING', 'CONFIRMATION',
  NOW(), NOW()
) RETURNING id, "orderNumber", "customerName", total;

-- Show summary
SELECT
  "orderNumber" as "Order #",
  "customerName" as "Customer",
  "shippingCity" || ', ' || "shippingState" as "Location",
  status as "Status",
  '$' || total::TEXT as "Total"
FROM "Order"
WHERE "customerEmail" LIKE '%@test.com'
ORDER BY "createdAt" DESC
LIMIT 4;
