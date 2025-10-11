# 📊 CSV Import - Quick Reference Card

## 🚀 3-Step Process

```bash
# 1. Validate
npx tsx scripts/validate-products-csv.ts data/my-products.csv

# 2. Import
npx tsx scripts/import-products-csv.ts data/my-products.csv

# 3. View
https://gangrunprinting.com/admin/products
```

---

## 📄 CSV Template

```csv
name,slug,sku,category,basePrice,productionTime,size,description,featured,active
"Product Name","product-slug","PRODUCT-SKU","cat_category",29.99,5,"8.5x11","Description here","false","true"
```

---

## 📂 Files

| File                               | Purpose                     |
| ---------------------------------- | --------------------------- |
| `data/products-template.csv`       | Template with 20 examples   |
| `data/my-products.csv`             | Your products (create this) |
| `scripts/import-products-csv.ts`   | Importer                    |
| `scripts/validate-products-csv.ts` | Validator                   |
| `scripts/export-products-csv.ts`   | Exporter                    |

---

## 🎯 Common Categories

| Category ID       | Name          |
| ----------------- | ------------- |
| cat_business_card | Business Card |
| cat_flyer         | Flyer         |
| cat_postcard      | Postcard      |
| cat_brochure      | Brochure      |
| cat_banner        | Banner        |
| cat_poster        | Poster        |

---

## ✅ What's Auto-Configured

When you import, these are **automatically set up**:

- ✅ Paper Stock Set
- ✅ Quantity Group (100, 250, 500, 1000, 2500, 5000)
- ✅ Size Group (from your "size" column)
- ✅ Turnaround Times (Economy, Fast, Faster, Crazy Fast)
- ✅ All 18 AddOns
- ✅ Coating Options (None, UV, AQ, Soft Touch)
- ✅ Sides Options (1-sided, 2-sided)

**You don't configure these manually!**

---

## ⚡ Tips

1. **Use Excel formulas** to auto-generate slugs and SKUs
2. **Validate first** - catches errors before import
3. **Export existing** products to see format
4. **Copy/paste rows** for variants (just change name/price)
5. **Commit to git** for version control

---

## 🚨 Common Errors

| Error               | Fix                                    |
| ------------------- | -------------------------------------- |
| Slug already exists | Make slug unique                       |
| Category not found  | Check spelling (cat_business_card)     |
| Invalid price       | Remove $ and commas (29.99 not $29.99) |
| Slug format wrong   | Lowercase with hyphens only            |

---

## 📊 Time Savings

- **Manual (per product)**: 15 minutes
- **CSV (per product)**: 30 seconds
- **Savings**: 95% faster

**250 products:**

- Manual: 62.5 hours (8 days)
- CSV: 3 hours
- **Time saved: 59.5 hours!**

---

## 🎯 Your Workflow

1. Copy template: `cp data/products-template.csv data/my-products.csv`
2. Edit in Excel
3. Validate: `npx tsx scripts/validate-products-csv.ts data/my-products.csv`
4. Import: `npx tsx scripts/import-products-csv.ts data/my-products.csv`
5. Done! ✅

---

**Full Guide**: See [CSV-IMPORT-GUIDE.md](./CSV-IMPORT-GUIDE.md)
