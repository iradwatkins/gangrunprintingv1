-- Create 4 Test Orders - Using Correct Schema

-- Order 1: John Smith - 250 Flyers - Phoenix, AZ
INSERT INTO "Order" (
  id, "orderNumber", email, phone,
  "shippingAddress", "billingAddress",
  subtotal, tax, shipping, total,
  status, "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'GR' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0'),
  'john.smith@test.com',
  '602-555-0101',
  '{"name": "John Smith", "street1": "123 Main St", "city": "Phoenix", "state": "AZ", "zip": "85034", "country": "US"}'::jsonb,
  '{"name": "John Smith", "street1": "123 Main St", "city": "Phoenix", "state": "AZ", "zip": "85034", "country": "US"}'::jsonb,
  13750.00, 0, 22.77, 13772.77,
  'CONFIRMATION', NOW(), NOW()
) RETURNING "orderNumber", email, total;

-- Order 2: Sarah Johnson - 500 Flyers - Dallas, TX
INSERT INTO "Order" (
  id, "orderNumber", email, phone,
  "shippingAddress", "billingAddress",
  subtotal, tax, shipping, total,
  status, "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'GR' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0'),
  'sarah.johnson@test.com',
  '214-555-0202',
  '{"name": "Sarah Johnson", "street1": "456 Oak Ave", "city": "Dallas", "state": "TX", "zip": "75201", "country": "US"}'::jsonb,
  '{"name": "Sarah Johnson", "street1": "456 Oak Ave", "city": "Dallas", "state": "TX", "zip": "75201", "country": "US"}'::jsonb,
  27500.00, 0, 20.71, 27520.71,
  'CONFIRMATION', NOW(), NOW()
) RETURNING "orderNumber", email, total;

-- Order 3: Mike Davis - 1000 Flyers - Los Angeles, CA
INSERT INTO "Order" (
  id, "orderNumber", email, phone,
  "shippingAddress", "billingAddress",
  subtotal, tax, shipping, total,
  status, "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'GR' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0'),
  'mike.davis@test.com',
  '213-555-0303',
  '{"name": "Mike Davis", "street1": "789 Elm Blvd", "city": "Los Angeles", "state": "CA", "zip": "90001", "country": "US"}'::jsonb,
  '{"name": "Mike Davis", "street1": "789 Elm Blvd", "city": "Los Angeles", "state": "CA", "zip": "90001", "country": "US"}'::jsonb,
  55000.00, 0, 23.88, 55023.88,
  'CONFIRMATION', NOW(), NOW()
) RETURNING "orderNumber", email, total;

-- Order 4: Lisa Brown - 500 Flyers - Scottsdale, AZ
INSERT INTO "Order" (
  id, "orderNumber", email, phone,
  "shippingAddress", "billingAddress",
  subtotal, tax, shipping, total,
  status, "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'GR' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0'),
  'lisa.brown@test.com',
  '480-555-0404',
  '{"name": "Lisa Brown", "street1": "321 Pine Dr", "city": "Scottsdale", "state": "AZ", "zip": "85251", "country": "US"}'::jsonb,
  '{"name": "Lisa Brown", "street1": "321 Pine Dr", "city": "Scottsdale", "state": "AZ", "zip": "85251", "country": "US"}'::jsonb,
  27500.00, 0, 22.77, 27522.77,
  'CONFIRMATION', NOW(), NOW()
) RETURNING "orderNumber", email, total;

-- Show summary of created orders
SELECT
  "orderNumber" as "Order #",
  email as "Customer Email",
  "shippingAddress"->>'city' || ', ' || "shippingAddress"->>'state' as "Location",
  status as "Status",
  '$' || total::TEXT as "Total"
FROM "Order"
WHERE email LIKE '%@test.com'
AND "createdAt" > NOW() - INTERVAL '1 minute'
ORDER BY "createdAt" DESC;
