# 📂 Product Categories Structure

## Overview

GangRun Printing has TWO types of products that must be kept separate:

1. **Normal Products** - Main catalog, visible in navigation
2. **Landing Page Products** - City-specific, hidden from navigation

---

## 🎯 Product Category Strategy

### 1. Normal Products (Main Catalog)

**Purpose**: Core product offerings visible to all customers

**Characteristics**:

- ✅ Visible in main navigation
- ✅ Appear in product search
- ✅ Show in product listings
- ✅ Include in ChatGPT feed
- ✅ Generic (not city-specific)

**Categories**:

```
Business Cards
├── Standard Business Cards
├── Premium Business Cards
└── Folded Business Cards

Flyers
├── 4x6 Flyers
├── 5x7 Flyers
├── 8.5x11 Flyers
└── 11x17 Flyers

Postcards
├── 4x6 Postcards
├── 5x7 Postcards
├── 6x9 Postcards
└── 6x11 Postcards

Brochures
├── Bi-Fold Brochures
├── Tri-Fold Brochures
└── Z-Fold Brochures

Banners
├── Vinyl Banners
├── Fabric Banners
└── Mesh Banners

Posters
├── 11x17 Posters
├── 18x24 Posters
└── 24x36 Posters

... (All other product categories)
```

**Database Configuration**:

```typescript
{
  isActive: true,
  isHidden: false,  // ← Visible in navigation
  categoryType: 'standard'
}
```

---

### 2. Landing Page Products (200 Cities)

**Purpose**: SEO landing pages for city-specific searches

**Characteristics**:

- ❌ Hidden from main navigation
- ❌ Don't appear in product search (unless city searched)
- ❌ Not in main product listings
- ✅ Include in ChatGPT feed (after all normal products complete)
- ✅ City-specific content and SEO

**Special Category**:

```
Landing Page Folder (Hidden Parent)
└── 200 Cities - Postcards
    ├── Postcards - 4x6 - New York, NY
    ├── Postcards - 4x6 - Los Angeles, CA
    ├── Postcards - 4x6 - Chicago, IL
    └── ... (197 more cities)
```

**Database Configuration**:

```typescript
{
  isActive: true,
  isHidden: true,  // ← Hidden from navigation
  categoryType: 'landing_page'
}
```

---

## 🗂️ Category Hierarchy

### Current Database Structure

```sql
-- Normal product categories (visible)
SELECT * FROM "ProductCategory"
WHERE "isHidden" = false AND "isActive" = true;

-- Landing page categories (hidden)
SELECT * FROM "ProductCategory"
WHERE "isHidden" = true AND "isActive" = true;
```

### Example Query Results

**Normal Categories**:
| id | name | slug | isHidden | isActive |
|----|------|------|----------|----------|
| cat_business_card | Business Card | business-card | false | true |
| cat_flyer | Flyer | flyer | false | true |
| cat_postcard | Postcard | postcard | false | true |
| cat_brochure | Brochure | brochure | false | true |
| cat_banner | Banner | banner | false | true |

**Landing Page Categories**:
| id | name | slug | isHidden | isActive |
|----|------|------|----------|----------|
| cat_landing_page_groups | Landing Page Folder | landing-page-groups | true | true |
| usili3t1sq2pnejzef5wuaiq | 200 Cities - Postcards | 200-cities-postcards | true | true |

---

## 🎯 How Users Find Each Type

### Normal Products (Regular Catalog)

**Discovery Methods**:

1. **Main Navigation**: Click "Business Cards" → See all business card products
2. **Product Search**: Search "business cards" → See standard catalog
3. **Category Pages**: Browse `/categories/business-cards`
4. **Homepage**: Featured products section
5. **Direct Links**: `/products/business-cards-standard`

**Example URLs**:

```
/products/business-cards-standard
/products/flyers-8-5x11
/products/postcards-4x6
/products/brochures-trifold
```

### Landing Page Products (City-Specific)

**Discovery Methods**:

1. **Google Search**: "postcards new york" → Finds city landing page
2. **Direct URL**: Share `/products/postcards-4x6-new-york-ny`
3. **ChatGPT**: "Find printing in Chicago" → AI recommends city page
4. **Internal Search**: Search "postcards chicago" → Finds city variant
5. **City Pages**: `/locations/new-york-ny` → Lists city products

**Example URLs**:

```
/products/postcards-4x6-new-york-ny
/products/postcards-4x6-los-angeles-ca
/products/postcards-4x6-chicago-il
```

**These URLs do NOT appear in**:

- Main navigation menus
- General product listings
- Category browse pages
- Homepage featured products

---

## 🔍 Navigation UI Behavior

### Main Menu (Normal Products Only)

```
Products ▼
  Business Cards
  Flyers
  Postcards        ← Generic, not city-specific
  Brochures
  Banners
  Posters
  Door Hangers
  Yard Signs
  ... (all standard categories)
```

**Does NOT show**:

- ❌ "200 Cities - Postcards"
- ❌ "Landing Page Folder"
- ❌ Any city-specific products

### Search Results

**When user searches "postcards"**:

```
Results:
  ✅ Postcards - 4x6 (normal product)
  ✅ Postcards - 5x7 (normal product)
  ✅ Postcards - 6x9 (normal product)
  ❌ Postcards - 4x6 - New York, NY (hidden)
  ❌ Postcards - 4x6 - Los Angeles, CA (hidden)
```

**When user searches "postcards new york"**:

```
Results:
  ✅ Postcards - 4x6 - New York, NY (city match!)
  ✅ Postcards - 4x6 (generic fallback)
```

---

## 📊 Database Queries

### Get Normal Products Only

```typescript
// For navigation, browse pages, general listings
const normalProducts = await prisma.product.findMany({
  where: {
    isActive: true,
    ProductCategory: {
      isHidden: false, // Only visible categories
    },
  },
  include: {
    ProductCategory: true,
  },
})
```

### Get Landing Page Products Only

```typescript
// For city-specific pages, SEO campaigns
const landingProducts = await prisma.product.findMany({
  where: {
    isActive: true,
    ProductCategory: {
      isHidden: true, // Only hidden categories
    },
    cityId: { not: null }, // Has city association
  },
  include: {
    ProductCategory: true,
    City: true,
  },
})
```

### Get All Products (for admin)

```typescript
// For admin panel, ChatGPT feed generation
const allProducts = await prisma.product.findMany({
  where: {
    isActive: true,
  },
  include: {
    ProductCategory: true,
  },
})
```

---

## 🎨 Frontend Components

### Product Listing Page

```typescript
// src/app/products/page.tsx

export default async function ProductsPage() {
  // Only fetch normal products (not landing pages)
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ProductCategory: {
        isHidden: false  // ← Key filter
      }
    }
  })

  return <ProductGrid products={products} />
}
```

### Category Navigation Component

```typescript
// src/components/navigation/category-nav.tsx

export async function CategoryNav() {
  // Only show non-hidden categories
  const categories = await prisma.productCategory.findMany({
    where: {
      isActive: true,
      isHidden: false  // ← Key filter
    },
    orderBy: { sortOrder: 'asc' }
  })

  return <Nav categories={categories} />
}
```

### City Landing Page

```typescript
// src/app/locations/[city]/page.tsx

export default async function CityPage({ params }) {
  const { city } = params

  // Get city-specific products
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      City: {
        slug: city
      }
    }
  })

  return <CityLandingPage city={city} products={products} />
}
```

---

## 🚀 Implementation Checklist

### Phase 1: Normal Products (Current Priority)

- [ ] Business Cards - Standard
- [ ] Flyers - All sizes (4x6, 5x7, 8.5x11, 11x17)
- [ ] Postcards - Standard sizes (4x6, 5x7, 6x9, 6x11)
- [ ] Brochures - All folds (bi-fold, tri-fold, z-fold)
- [ ] Banners - Multiple sizes
- [ ] Posters - Multiple sizes
- [ ] Door Hangers
- [ ] Yard Signs
- ... (all other standard products)

**Status**: In Progress
**Priority**: HIGH - Must complete before Phase 2

### Phase 2: Landing Page Products (After Phase 1)

- [ ] Create template: "Postcards - 4x6 Template"
- [ ] Test template thoroughly
- [ ] Run 200 Cities generator
- [ ] Generate city-specific SEO
- [ ] Add city-specific images
- [ ] Test sample cities (NY, LA, Chicago)

**Status**: Waiting for Phase 1 completion
**Priority**: MEDIUM - After all normal products done

---

## 🎯 Category Configuration Reference

### Normal Product Category

```typescript
{
  id: 'cat_business_card',
  name: 'Business Card',
  slug: 'business-card',
  description: 'Professional business cards',
  isActive: true,
  isHidden: false,  // ← Visible in navigation
  sortOrder: 1,
  metadata: {
    showInNav: true,
    featured: true,
    icon: 'credit-card'
  }
}
```

### Landing Page Category

```typescript
{
  id: 'usili3t1sq2pnejzef5wuaiq',
  name: '200 Cities - Postcards',
  slug: '200-cities-postcards',
  description: 'City-specific postcard landing pages',
  isActive: true,
  isHidden: true,  // ← Hidden from navigation
  sortOrder: 999,
  metadata: {
    showInNav: false,
    featured: false,
    seoOnly: true,
    categoryType: 'landing_page'
  }
}
```

---

## 📈 SEO Strategy

### Normal Products SEO

**Target Keywords**: Generic product searches

- "business cards online"
- "cheap flyers"
- "custom postcards"
- "brochure printing"

**Pages**:

- `/products/business-cards-standard`
- `/products/flyers-8-5x11`
- `/products/postcards-4x6`

### Landing Page Products SEO

**Target Keywords**: Location-specific searches

- "business cards new york"
- "flyers los angeles"
- "postcard printing chicago"
- "brochures houston tx"

**Pages**:

- `/products/postcards-4x6-new-york-ny`
- `/locations/new-york-ny`
- `/printing-services-new-york`

---

## ✅ Summary

| Aspect                | Normal Products           | Landing Page Products                 |
| --------------------- | ------------------------- | ------------------------------------- |
| **Visible in Nav**    | ✅ Yes                    | ❌ No                                 |
| **In Search**         | ✅ Yes                    | ⚠️ If city searched                   |
| **In Listings**       | ✅ Yes                    | ❌ No                                 |
| **URL Pattern**       | `/products/postcards-4x6` | `/products/postcards-4x6-new-york-ny` |
| **Category isHidden** | false                     | true                                  |
| **Purpose**           | Main catalog              | SEO/Landing pages                     |
| **When to Create**    | Phase 1 (Now)             | Phase 2 (After Phase 1)               |
| **ChatGPT Feed**      | ✅ Yes (Phase 1)          | ✅ Yes (Phase 2)                      |

---

**Key Takeaway**: Users browse normal products by default. City products are discovered via search, direct links, or AI recommendations.
