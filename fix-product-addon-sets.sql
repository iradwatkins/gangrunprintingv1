-- Fix Product Add-On Set Assignment
-- This assigns the existing add-on set to products that don't have any

-- First, let's check what add-on sets exist
-- Expected: At least one add-on set with strategically positioned add-ons

-- Get the add-on set ID (should be '4c7cbc2e-b2fc-4820-841e-97dd4ef3f34b')
-- This set has 3 add-ons positioned as: Corner Rounding (ABOVE), Variable Data (IN), Banding (BELOW)

-- Insert ProductAddOnSet assignment for all products that don't have one
INSERT INTO "ProductAddOnSet" ("id", "productId", "addOnSetId", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  p."id",
  '4c7cbc2e-b2fc-4820-841e-97dd4ef3f34b',
  NOW(),
  NOW()
FROM "Product" p
WHERE NOT EXISTS (
  SELECT 1 FROM "ProductAddOnSet" pas WHERE pas."productId" = p."id"
)
AND p."id" IS NOT NULL;

-- Verify the fix
SELECT
  p."name",
  p."slug",
  COUNT(pas."id") as addon_set_count
FROM "Product" p
LEFT JOIN "ProductAddOnSet" pas ON p."id" = pas."productId"
GROUP BY p."id", p."name", p."slug"
ORDER BY p."name";