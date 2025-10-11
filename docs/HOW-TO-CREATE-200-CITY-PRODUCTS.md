# 🌆 How to Create 200 City Products

## Overview

This guide shows you how to create **ONE template product** and automatically generate **200 city-specific variants** from it.

---

## 📋 Step-by-Step Process

### Step 1: Create Your Template Product

1. **Go to Admin Panel**:

   ```
   https://gangrunprinting.com/admin/products/new
   ```

2. **Fill in Product Details**:
   - **Name**: `Postcards - 4x6 Template` (must include "Template")
   - **Slug**: `postcards-4x6-template`
   - **SKU**: `POSTCARD-4X6-TEMPLATE`
   - **Category**: Select appropriate category (e.g., "Postcard")
   - **Description**: Write a generic description (will be customized per city)
   - **Base Price**: Set starting price (e.g., $19.99)
   - **Production Time**: Set days (e.g., 5)

3. **Configure Product Options**:
   - ✅ Select **Paper Stock Set**
   - ✅ Select **Quantity Group**
   - ✅ Select **Size Group**
   - ✅ Select **Turnaround Time Set**
   - ✅ Select **AddOn Set** (all 18 addons)
   - ✅ Select **Coating Options**
   - ✅ Select **Sides Options**

4. **Upload Images** (optional for template):
   - You can upload generic images
   - Or skip this - we'll add city-specific images later

5. **Save and Test**:
   - Save the product
   - Test it in your browser:
     ```
     https://gangrunprinting.com/products/postcards-4x6-template
     ```
   - Add to cart and verify:
     - Pricing calculation works
     - All options appear
     - Addons calculate correctly

---

### Step 2: Run the 200 Cities Generator

Once your template product is perfect, run this command:

```bash
npx tsx scripts/duplicate-product-for-200-cities.ts postcards-4x6-template
```

**Replace `postcards-4x6-template` with your actual template slug.**

---

## 🎯 What the Script Does

The script will:

1. ✅ Find your template product
2. ✅ Load 200 cities from `/scripts/data/200-cities.json`
3. ✅ Create or use "200 Cities - Postcards" category
4. ✅ For EACH city:
   - Create new product with city name
   - Generate unique slug: `postcards-4x6-new-york-ny`
   - Generate unique SKU: `POSTCARD-4X6-NY-NEWYORK`
   - Copy ALL configurations from template
   - Link to city in database
   - Add city-specific metadata

---

## 📊 Example Output

```
🌆 200 Cities Product Generator
================================

📋 Template Product: postcards-4x6-template
📍 Cities to Generate: 200

✅ Template found: Postcards - 4x6 Template
   Category: Postcard
   Base Price: $19.99
   Production Time: 5 days

🚀 Starting duplication process...

============================================================

📍 Creating: Postcards - 4x6 - New York, NY
   Slug: postcards-4x6-new-york-ny
   SKU: POSTCARD-4X6-NY-NEWYORK
   ✅ Product created: prod_postcards-4x6-new-york-ny
   ✅ Configurations copied

📍 Creating: Postcards - 4x6 - Los Angeles, CA
   Slug: postcards-4x6-los-angeles-ca
   SKU: POSTCARD-4X6-CA-LOSANGELES
   ✅ Product created: prod_postcards-4x6-los-angeles-ca
   ✅ Configurations copied

... (198 more cities)

============================================================
📊 Summary
============================================================
✅ Created: 200
⚠️  Skipped: 0
❌ Errors: 0
📍 Total: 200

🎉 City products generated successfully!

🌐 View products: https://gangrunprinting.com/admin/products
📂 Category: 200 Cities - Postcards
```

---

## 🔍 Verifying Results

### Check in Admin:

```
https://gangrunprinting.com/admin/products
```

Filter by category: **"200 Cities - Postcards"**

You should see 200 products:

- ✅ Postcards - 4x6 - New York, NY
- ✅ Postcards - 4x6 - Los Angeles, CA
- ✅ Postcards - 4x6 - Chicago, IL
- ... (197 more)

### Test a Random City Product:

Pick any city and test the full customer journey:

```
https://gangrunprinting.com/products/postcards-4x6-chicago-il
```

Verify:

- [ ] Product page loads correctly
- [ ] All options appear (paper, size, quantity, turnaround)
- [ ] Pricing calculates correctly
- [ ] Addons work
- [ ] Add to cart works
- [ ] Checkout works

---

## 🎨 Customizing City Products (After Generation)

### Add City-Specific Images

You can bulk upload city-specific images using this script:

```bash
npx tsx scripts/add-city-images.ts
```

### Update City-Specific SEO

Generate unique SEO content for each city:

```bash
npx tsx scripts/generate-city-seo.ts
```

### Regenerate If Needed

If you update the template and want to regenerate:

```bash
# Delete existing city products first
npx tsx scripts/delete-city-products.ts postcards-4x6-template

# Regenerate from updated template
npx tsx scripts/duplicate-product-for-200-cities.ts postcards-4x6-template
```

---

## 📝 Best Practices

### 1. Template Naming Convention

Always include "Template" in the name:

- ✅ `Postcards - 4x6 Template`
- ✅ `Business Cards - Standard Template`
- ✅ `Flyers - 8.5x11 Template`
- ❌ `Postcards 4x6` (missing "Template")

### 2. Test Template Thoroughly

Before generating 200 copies, make sure:

- [ ] Pricing is correct
- [ ] All addons work
- [ ] Configuration is complete
- [ ] Description is generic (not city-specific yet)
- [ ] Base price is set correctly

### 3. Keep Template Active

- Don't mark template as inactive
- Don't delete template after generation
- You'll need it if you want to regenerate

### 4. Review First 5 Cities

After generation, manually check the first 5 city products:

- New York, NY
- Los Angeles, CA
- Chicago, IL
- Houston, TX
- Phoenix, AZ

If these look good, the rest should be perfect.

---

## 🚨 Troubleshooting

### Error: "Template product not found"

**Solution**: Check the slug is correct

```bash
# List all products with "template" in name
npx tsx scripts/list-templates.ts
```

### Error: "Category not found"

**Solution**: Script will auto-create "200 Cities - Postcards" category

### Duplicate Products Created

**Solution**: Script skips existing products

```bash
# It will say: "⚠️  Already exists, skipping..."
```

### Want to Start Over

```bash
# Delete all city products
npx tsx scripts/delete-city-products.ts postcards-4x6-template

# Regenerate
npx tsx scripts/duplicate-product-for-200-cities.ts postcards-4x6-template
```

---

## 📂 Files Created

- **Script**: `/scripts/duplicate-product-for-200-cities.ts`
- **Cities Data**: `/scripts/data/200-cities.json`
- **Documentation**: `/docs/HOW-TO-CREATE-200-CITY-PRODUCTS.md`

---

## 🎯 Next Steps After Generation

1. **Add City Images** (optional):

   ```bash
   npx tsx scripts/add-city-images.ts
   ```

2. **Generate SEO Content**:

   ```bash
   npx tsx scripts/generate-city-seo.ts
   ```

3. **Test Sample Cities**: Manually test 5-10 random cities

4. **Enable for Search**: Update ChatGPT feed to include city products

5. **Monitor Performance**: Track which cities get the most orders

---

## ✅ Success Checklist

Before considering 200 Cities products "complete":

- [ ] Template product created and tested
- [ ] 200 city products generated successfully
- [ ] Sample city products tested (New York, LA, Chicago)
- [ ] Pricing verified on multiple cities
- [ ] All addons work correctly
- [ ] Products appear in "200 Cities - Postcards" category
- [ ] Products hidden from main navigation (isHidden: true)
- [ ] City-specific SEO generated
- [ ] ChatGPT feed includes city products
- [ ] Ready for production launch

---

**Questions? Issues?**

- Check logs: `pm2 logs gangrunprinting`
- Test script: `npx tsx scripts/test-city-generation.ts`
- Documentation: This file!
