# Bilingual Website Implementation Guide (English/Spanish)

**Date**: October 23, 2025
**Status**: Infrastructure Complete - Ready for Page Migration
**Languages**: English (en) - Default | Spanish (es)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [What's Been Implemented](#whats-been-implemented)
3. [URL Structure](#url-structure)
4. [How to Use Translations](#how-to-use-translations)
5. [Database Localization](#database-localization)
6. [Language Switcher](#language-switcher)
7. [SEO & Hreflang](#seo--hreflang)
8. [Migration Guide](#migration-guide)
9. [Testing](#testing)

---

## Overview

The website now supports bilingual content (English and Spanish) using **next-intl** for Next.js App Router.

### Key Features

- ✅ Path-based routing (`/products` for English, `/es/productos` for Spanish)
- ✅ Auto-detection from browser language settings
- ✅ Cookie-based language preference persistence
- ✅ Database translations for products, categories, addons, and paper stocks
- ✅ SEO-friendly URLs with hreflang support
- ✅ Language switcher component (multiple variants)

---

## What's Been Implemented

### 1. Core Infrastructure

| Component | Status | Location |
|-----------|--------|----------|
| next-intl Package | ✅ Installed | `package.json` |
| i18n Configuration | ✅ Complete | `/src/i18n.ts` |
| Middleware | ✅ Complete | `/middleware.ts` |
| Routing Config | ✅ Complete | `/src/lib/i18n/routing.ts` |
| Navigation Helpers | ✅ Complete | `/src/lib/i18n/navigation.ts` |

### 2. Translation Files

| Language | File | Status | Lines |
|----------|------|--------|-------|
| English | `/messages/en.json` | ✅ Complete | ~320 |
| Spanish | `/messages/es.json` | ✅ Complete | ~320 |

**Translation Coverage**:
- Navigation & menus
- Common UI elements
- Forms & validation
- Auth pages
- Product interface
- Cart & checkout
- Account pages
- Admin panel labels
- Footer & contact

### 3. Database Schema

Added `translations` JSONB field to:
- `Product` - name, description, shortDescription
- `ProductCategory` - name, description, metaTitle, metaDescription
- `AddOn` - name, description, tooltipText
- `PaperStock` - name, tooltipText

**Structure**:
```json
{
  "en": {
    "name": "Business Cards",
    "description": "Professional business cards..."
  },
  "es": {
    "name": "Tarjetas de Presentación",
    "description": "Tarjetas de presentación profesionales..."
  }
}
```

### 4. Utility Functions

Location: `/src/lib/i18n/utils.ts`

**Available Functions**:
- `getLocalizedField()` - Get single translated field
- `getLocalizedFields()` - Get multiple translated fields
- `localizeProduct()` - Localize product model
- `localizeCategory()` - Localize category model
- `localizeAddOn()` - Localize addon model
- `localizePaperStock()` - Localize paper stock model
- `localizeArray()` - Batch localize arrays

### 5. Components

| Component | Location | Status |
|-----------|----------|--------|
| LanguageSwitcher | `/src/components/i18n/language-switcher.tsx` | ✅ Ready |
| Variants | Dropdown, Select, Buttons | ✅ All Available |

---

## URL Structure

### How It Works

**English (Default Locale)**:
- No locale prefix needed
- `/products` → English products page
- `/checkout` → English checkout

**Spanish**:
- Uses `/es/` prefix
- `/es/productos` → Spanish products page
- `/es/checkout` → Spanish checkout (may use English path initially)

**Auto-Detection**:
1. Check user's cookie preference
2. If no cookie, check Accept-Language header
3. Fallback to English (default)

**SEO-Friendly Paths** (Configured in `/src/lib/i18n/routing.ts`):
```typescript
'/products': {
  en: '/products',
  es: '/productos',
},
'/contact': {
  en: '/contact',
  es: '/contacto',
}
```

---

## How to Use Translations

### In Server Components

```typescript
import { useTranslations } from 'next-intl'

export default function ProductPage() {
  const t = useTranslations('products')

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
    </div>
  )
}
```

### In Client Components

```typescript
'use client'
import { useTranslations } from 'next-intl'

export default function AddToCartButton() {
  const t = useTranslations('product')

  return (
    <button>{t('addToCart')}</button>
  )
}
```

### With Next.js Link

```typescript
import { Link } from '@/lib/i18n/navigation'

<Link href="/products">
  {t('navigation.products')}
</Link>
```

### Programmatic Navigation

```typescript
'use client'
import { useRouter } from '@/lib/i18n/navigation'

const router = useRouter()
router.push('/checkout')
```

---

## Database Localization

### Localizing Product Data

**Server-side**:
```typescript
import { localizeProduct } from '@/lib/i18n/utils'
import { getLocale } from 'next-intl/server'

export default async function ProductDetail({ params }) {
  const locale = await getLocale()
  const product = await prisma.product.findUnique({
    where: { slug: params.slug }
  })

  const localizedProduct = {
    ...product,
    ...localizeProduct(product, locale)
  }

  return <div>{localizedProduct.name}</div>
}
```

**Client-side** (in Server Action):
```typescript
'use server'
import { localizeArray, localizeProduct } from '@/lib/i18n/utils'
import { getLocale } from 'next-intl/server'

export async function getProducts() {
  const locale = await getLocale()
  const products = await prisma.product.findMany()

  return localizeArray(products, localizeProduct, locale)
}
```

### Populating Translations

**Example: Adding Spanish translation to a product**:
```typescript
await prisma.product.update({
  where: { id: 'product-id' },
  data: {
    translations: {
      en: {
        name: "Business Cards",
        description: "Professional business cards",
        shortDescription: "High-quality cards"
      },
      es: {
        name: "Tarjetas de Presentación",
        description: "Tarjetas de presentación profesionales",
        shortDescription: "Tarjetas de alta calidad"
      }
    }
  }
})
```

---

## Language Switcher

### Add to Layout/Header

```typescript
import { LanguageSwitcher } from '@/components/i18n/language-switcher'

export default function Header() {
  return (
    <header>
      <nav>
        {/* Other nav items */}
        <LanguageSwitcher variant="dropdown" />
      </nav>
    </header>
  )
}
```

### Available Variants

```typescript
// Dropdown with globe icon (default)
<LanguageSwitcher variant="dropdown" />

// Select dropdown
<LanguageSwitcher variant="select" />

// Button group
<LanguageSwitcher variant="buttons" />

// Compact (mobile-friendly)
<CompactLanguageSwitcher />

// Full (desktop)
<FullLanguageSwitcher />
```

---

## SEO & Hreflang

### Generate Metadata

```typescript
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }) {
  const t = await getTranslations('metadata')

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `https://gangrunprinting.com/products`,
      languages: {
        'en-US': '/products',
        'es-ES': '/es/productos',
      },
    },
  }
}
```

### Hreflang Tags

These are automatically generated by Next.js when you configure `alternates.languages` in metadata.

---

## Migration Guide

### Phase 1: Test Pages (Recommended Start)

1. **Pick a simple page** (e.g., `/about`)
2. **Add translations** to `messages/en.json` and `messages/es.json`
3. **Update the page component** to use `useTranslations()`
4. **Test both languages** manually
5. **Verify URL routing** works correctly

### Phase 2: Core Customer Pages

Priority order:
1. Homepage
2. Products listing
3. Product detail pages
4. Cart
5. Checkout
6. Account pages

### Phase 3: Admin & Secondary Pages

- Admin panel (UI text only)
- Contact
- About
- Legal pages

### Example Migration

**Before**:
```typescript
export default function AboutPage() {
  return (
    <div>
      <h1>About Us</h1>
      <p>Welcome to GangRun Printing</p>
    </div>
  )
}
```

**After**:
```typescript
import { useTranslations } from 'next-intl'

export default function AboutPage() {
  const t = useTranslations('about')

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('welcome')}</p>
    </div>
  )
}
```

**Add to messages/en.json**:
```json
{
  "about": {
    "title": "About Us",
    "welcome": "Welcome to GangRun Printing"
  }
}
```

**Add to messages/es.json**:
```json
{
  "about": {
    "title": "Acerca de Nosotros",
    "welcome": "Bienvenido a GangRun Printing"
  }
}
```

---

## Testing

### Manual Testing

1. **Default Language (English)**:
   - Visit `https://gangrunprinting.com/products`
   - Should show English content

2. **Spanish Language**:
   - Visit `https://gangrunprinting.com/es/productos`
   - Should show Spanish content

3. **Language Switcher**:
   - Click language switcher
   - Should redirect to same page in selected language
   - Cookie should persist selection

4. **Browser Detection**:
   - Set browser language to Spanish
   - Clear cookies
   - Visit homepage
   - Should auto-redirect to `/es/`

### Automated Testing

```bash
# Run TypeScript check
npm run build

# Check for i18n routing issues
curl http://localhost:3002/ # Should show English
curl http://localhost:3002/es/ # Should show Spanish
curl -H "Accept-Language: es" http://localhost:3002/ # Should redirect to /es/
```

---

## Next Steps

1. **Add LanguageSwitcher to header** (customer-facing pages)
2. **Migrate homepage** to use translations
3. **Populate product translations** in database
4. **Update sitemap** to include bilingual URLs
5. **Test complete checkout flow** in both languages
6. **Monitor analytics** for language preferences

---

## Reference Files

- **i18n Config**: `/src/i18n.ts`
- **Middleware**: `/middleware.ts`
- **Routing**: `/src/lib/i18n/routing.ts`
- **Navigation**: `/src/lib/i18n/navigation.ts`
- **Utilities**: `/src/lib/i18n/utils.ts`
- **LanguageSwitcher**: `/src/components/i18n/language-switcher.tsx`
- **English Messages**: `/messages/en.json`
- **Spanish Messages**: `/messages/es.json`
- **Next.js Config**: `/next.config.mjs`

---

## Support

For questions or issues with the bilingual implementation, refer to:
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js i18n Guide](https://nextjs.org/docs/app/building-your-application/routing/internationalization)

---

**Last Updated**: October 23, 2025
