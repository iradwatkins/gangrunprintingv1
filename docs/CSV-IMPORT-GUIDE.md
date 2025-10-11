# 📊 CSV Product Import Guide

## Quick Start

Create 250 products in 5 minutes using a spreadsheet!

---

## 📋 Step-by-Step

### Step 1: Copy the Template

```bash
cp data/products-template.csv data/my-products.csv
```

### Step 2: Edit in Excel/Google Sheets

Open `data/my-products.csv` in Excel or Google Sheets and fill in your products:

| name                      | slug                    | sku          | category          | basePrice | productionTime | size   | description                 | featured | active |
| ------------------------- | ----------------------- | ------------ | ----------------- | --------- | -------------- | ------ | --------------------------- | -------- | ------ |
| Business Cards - Standard | business-cards-standard | BC-STD-3.5X2 | cat_business_card | 19.99     | 5              | 3.5x2  | Professional business cards | true     | true   |
| Flyers - 8.5x11           | flyers-8-5x11           | FLYER-8.5X11 | cat_flyer         | 29.99     | 3              | 8.5x11 | Standard flyers             | true     | true   |

### Step 3: Validate Your CSV

```bash
npx tsx scripts/validate-products-csv.ts data/my-products.csv
```

**Expected output:**

```
🔍 CSV Product Validator
============================================================
📂 File: data/my-products.csv

📊 Validating 20 products...

============================================================
✅ Validation passed!

📊 Summary:
   Total rows: 20
   Errors: 0

🚀 Ready to import!
   Run: npx tsx scripts/import-products-csv.ts data/my-products.csv
```

### Step 4: Import Products

```bash
npx tsx scripts/import-products-csv.ts data/my-products.csv
```

**Expected output:**

```
📥 CSV Product Importer
============================================================
📂 File: data/my-products.csv

📊 Found 20 products to import

============================================================

📦 Row 1: Business Cards - Standard
   ✅ Category: Business Card
   ✅ Size: 3.5x2
   ✅ Product created: prod_business-cards-standard
   ✅ Paper stock set linked
   ✅ Quantity group linked
   ✅ Size group linked
   ✅ Turnaround set linked
   ✅ AddOn set linked
   ✅ Coating options linked (6)
   ✅ Sides options linked (4)
   🎉 Complete!

... (19 more products)

============================================================
📊 Import Summary
============================================================
✅ Created: 20
⚠️  Skipped: 0
❌ Errors: 0
📍 Total: 20

🎉 Products imported successfully!

🌐 View products: https://gangrunprinting.com/admin/products
```

---

## 📄 CSV Format Reference

### Required Columns

| Column             | Description         | Example                   | Rules                                     |
| ------------------ | ------------------- | ------------------------- | ----------------------------------------- |
| **name**           | Product name        | Business Cards - Standard | Required, unique                          |
| **slug**           | URL slug            | business-cards-standard   | Required, unique, lowercase, hyphens only |
| **sku**            | Product SKU         | BC-STD-3.5X2              | Required, unique                          |
| **category**       | Category slug or ID | cat_business_card         | Required, must exist                      |
| **basePrice**      | Starting price      | 19.99                     | Required, positive number                 |
| **productionTime** | Days to produce     | 5                         | Required, positive integer                |
| **size**           | Product size        | 3.5x2                     | Required                                  |

### Optional Columns

| Column          | Description         | Example                        | Default        |
| --------------- | ------------------- | ------------------------------ | -------------- |
| **description** | Product description | Professional business cards... | Auto-generated |
| **featured**    | Show on homepage    | true/false                     | false          |
| **active**      | Product is active   | true/false                     | true           |
| **quantities**  | Custom quantities   | 100,250,500                    | Uses defaults  |

---

## 🎯 Available Categories

List available categories:

```bash
PGPASSWORD='GangRun2024Secure' psql -h 172.22.0.1 -U gangrun_user -d gangrun_db -c "
SELECT id, name, slug FROM \"ProductCategory\" WHERE \"isActive\" = true ORDER BY name;
"
```

**Common categories:**

| ID                | Name          | Slug          |
| ----------------- | ------------- | ------------- |
| cat_business_card | Business Card | business-card |
| cat_flyer         | Flyer         | flyer         |
| cat_postcard      | Postcard      | postcard      |
| cat_brochure      | Brochure      | brochure      |
| cat_banner        | Banner        | banner        |
| cat_poster        | Poster        | poster        |
| cat_door_hanger   | Door Hanger   | door-hanger   |

---

## 💡 Tips & Best Practices

### 1. Use Formulas in Excel

**Calculate pricing tiers:**

```excel
=IF(A2="Premium", B2*1.5, B2)
```

**Auto-generate slugs:**

```excel
=LOWER(SUBSTITUTE(A2," ","-"))
```

**Auto-generate SKUs:**

```excel
=UPPER(LEFT(C2,3))&"-"&D2
```

### 2. Batch Create Variants

Copy one row, paste 10 times, then just change:

- Name (add "- Premium", "- Economy", etc.)
- Slug (add "-premium", "-economy")
- SKU (add suffix)
- Price (adjust)

### 3. Validate Before Import

**Always run validation first!**

```bash
npx tsx scripts/validate-products-csv.ts data/my-products.csv
```

This catches errors like:

- Duplicate slugs
- Missing categories
- Invalid pricing
- Malformed SKUs

### 4. Export Existing Products

Want to edit existing products in bulk?

```bash
# Export all products
npx tsx scripts/export-products-csv.ts data/existing-products.csv

# Export specific category
npx tsx scripts/export-products-csv.ts data/business-cards.csv --category=cat_business_card
```

Then edit and re-import!

---

## 🔧 Auto-Configured Settings

When you import a product, these are **automatically configured**:

✅ **Paper Stock Set** - Default cardstock options
✅ **Quantity Group** - Standard quantities (100, 250, 500, 1000, 2500, 5000)
✅ **Size Group** - Created from your "size" column
✅ **Turnaround Times** - Economy, Fast, Faster, Crazy Fast
✅ **AddOns** - All 18 addons enabled
✅ **Coating Options** - None, UV, Aqueous, Soft Touch
✅ **Sides Options** - 1-sided, 2-sided

**You don't need to configure these manually!**

---

## 📊 Example CSVs

### Example 1: Business Cards Variants

```csv
name,slug,sku,category,basePrice,productionTime,size,description,featured,active
"Business Cards - Standard","business-cards-standard","BC-STD-3.5X2","cat_business_card",19.99,5,"3.5x2","Standard business cards on 14pt cardstock","true","true"
"Business Cards - Premium","business-cards-premium","BC-PREM-3.5X2","cat_business_card",29.99,5,"3.5x2","Premium business cards with UV coating","true","true"
"Business Cards - Economy","business-cards-economy","BC-ECO-3.5X2","cat_business_card",14.99,7,"3.5x2","Budget-friendly business cards","false","true"
"Business Cards - Folded","business-cards-folded","BC-FOLD-3.5X4","cat_folded_business_card",39.99,5,"3.5x4","Unique folded business cards","false","true"
```

### Example 2: Complete Flyer Line

```csv
name,slug,sku,category,basePrice,productionTime,size,description,featured,active
"Flyers - 4x6","flyers-4x6","FLYER-4X6","cat_flyer",24.99,3,"4x6","Compact flyers perfect for handouts","false","true"
"Flyers - 5x7","flyers-5x7","FLYER-5X7","cat_flyer",27.99,3,"5x7","Mid-size flyers for events","false","true"
"Flyers - 8.5x11","flyers-8-5x11","FLYER-8.5X11","cat_flyer",29.99,3,"8.5x11","Standard letter-size flyers","true","true"
"Flyers - 11x17","flyers-11x17","FLYER-11X17","cat_flyer",39.99,3,"11x17","Large format flyers","false","true"
```

### Example 3: All Poster Sizes

```csv
name,slug,sku,category,basePrice,productionTime,size,description,featured,active
"Posters - 11x17","posters-11x17","POSTER-11X17","cat_poster",29.99,3,"11x17","Standard poster size","false","true"
"Posters - 18x24","posters-18x24","POSTER-18X24","cat_poster",39.99,3,"18x24","Medium poster size","true","true"
"Posters - 24x36","posters-24x36","POSTER-24X36","cat_poster",49.99,3,"24x36","Large poster size","false","true"
"Posters - 27x40","posters-27x40","POSTER-27X40","cat_poster",59.99,3,"27x40","Movie poster size","false","true"
```

---

## 🚨 Common Errors & Fixes

### Error: "Slug already exists"

**Problem**: Another product has the same slug

**Fix**: Make slug unique

```csv
Before: business-cards-standard
After:  business-cards-standard-premium
```

### Error: "Category not found: cat_busines_card"

**Problem**: Typo in category ID

**Fix**: Check spelling

```csv
Before: cat_busines_card
After:  cat_business_card
```

### Error: "Base price must be a positive number"

**Problem**: Price contains non-numeric characters

**Fix**: Remove dollar signs, commas

```csv
Before: $29.99
After:  29.99
```

### Error: "Slug should be: business-cards-standard"

**Problem**: Slug has uppercase or spaces

**Fix**: Use lowercase with hyphens only

```csv
Before: Business Cards Standard
After:  business-cards-standard
```

---

## 🔄 Update Existing Products

To update products:

1. **Export existing products:**

   ```bash
   npx tsx scripts/export-products-csv.ts data/current-products.csv
   ```

2. **Edit in Excel:**
   - Change prices
   - Update descriptions
   - Modify categories

3. **Re-import:**
   ```bash
   npx tsx scripts/import-products-csv.ts data/current-products.csv
   ```

**Note**: Existing products are skipped, not updated. To update, delete product first or use admin UI.

---

## ⚡ Advanced Usage

### Import by Category

Create separate CSVs per category for organization:

```bash
data/
├── business-cards.csv
├── flyers.csv
├── postcards.csv
├── brochures.csv
└── banners.csv
```

Then import one at a time:

```bash
npx tsx scripts/import-products-csv.ts data/business-cards.csv
npx tsx scripts/import-products-csv.ts data/flyers.csv
# ... etc
```

### Batch Import All

Or create a master CSV with all 250 products:

```bash
data/master-products.csv  # All 250 products
```

Import once:

```bash
npx tsx scripts/import-products-csv.ts data/master-products.csv
```

### Version Control

Track changes in git:

```bash
git add data/*.csv
git commit -m "Add 50 new product configurations"
git push
```

Team members can pull and import the same products!

---

## ✅ Checklist

Before importing:

- [ ] CSV file created/copied from template
- [ ] All required columns filled
- [ ] Slugs are lowercase with hyphens
- [ ] SKUs are unique
- [ ] Categories exist in database
- [ ] Prices are numeric (no $, commas)
- [ ] Production times are integers
- [ ] Validation passed

After importing:

- [ ] Check admin panel for new products
- [ ] Test 2-3 products in browser
- [ ] Verify pricing calculation works
- [ ] Check all options appear
- [ ] Test add to cart

---

## 🎯 Next Steps

After importing products:

1. **Upload Images**: Use admin UI or bulk upload script
2. **Test Products**: Verify each product works end-to-end
3. **Adjust Pricing**: Fine-tune prices if needed
4. **Add Descriptions**: Enhance with AI or manual editing
5. **Mark Featured**: Select products for homepage

---

**Questions?** Check the [Product Organization System docs](./PRODUCT-ORGANIZATION-SYSTEM.md)
