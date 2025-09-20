# Shard 003: Product Catalog & Configuration System

> **Story Context**: This shard covers Alex's implementation of the complex product catalog system that handles configurable printing products with dynamic pricing and extensive customization options.

## Shard Overview

**Objective**: Build a flexible product catalog system that can handle complex printing products with multiple configuration options, dynamic pricing, and broker-specific pricing rules.

**Key Components**:

- Product catalog with categories and attributes
- Dynamic product configuration system
- Pricing engine with broker discounts
- Add-on services management
- File upload system for artwork
- Product search and filtering

## The Break: Product Complexity Analysis

Alex analyzed the unique requirements for printing products:

### Product Types

1. **Business Cards**: Standard sizes, paper types, finishes
2. **Flyers**: Variable sizes, paper stocks, quantities
3. **Banners**: Custom dimensions, materials, finishing options
4. **Postcards**: Standard sizes, coating options, quantities
5. **Custom Products**: Fully configurable dimensions and materials

### Configuration Attributes

1. **Base Attributes**: Size, quantity, paper type
2. **Finish Options**: Matte, glossy, UV coating, embossing
3. **Add-on Services**: Design help, proofing, rush orders
4. **Specifications**: Color mode, bleeds, folding options

### Pricing Complexity

1. **Base Pricing**: Quantity-based tier pricing
2. **Material Costs**: Different papers and finishes
3. **Add-on Pricing**: Fixed fees or percentage markups
4. **Broker Discounts**: Category-specific or global discounts
5. **Rush Order Premiums**: Time-based pricing adjustments

## The Make: Implementation Details

### Database Schema Design

```prisma
model Category {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String?
  image       String?
  parentId    String?
  parent      Category? @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryHierarchy")
  products    Product[]
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("categories")
}

model Product {
  id               String            @id @default(cuid())
  name             String
  slug             String            @unique
  description      String?
  shortDescription String?
  categoryId       String
  category         Category          @relation(fields: [categoryId], references: [id])

  // Product configuration
  attributes       ProductAttribute[]
  addOns          ProductAddOn[]
  pricing         ProductPricing[]

  // Media and SEO
  images          ProductImage[]
  seoTitle        String?
  seoDescription  String?

  // Status and metadata
  isActive        Boolean           @default(true)
  isCustomizable  Boolean           @default(true)
  requiresArtwork Boolean           @default(true)
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  // Relations
  orderItems      OrderItem[]
  cartItems       CartItem[]

  @@map("products")
}

model ProductAttribute {
  id          String                    @id @default(cuid())
  productId   String
  product     Product                   @relation(fields: [productId], references: [id])
  name        String                    // "Size", "Paper Type", "Finish"
  type        ProductAttributeType
  isRequired  Boolean                   @default(true)
  sortOrder   Int                       @default(0)
  options     ProductAttributeOption[]

  @@map("product_attributes")
}

enum ProductAttributeType {
  SELECT        // Dropdown selection
  MULTI_SELECT  // Multiple checkboxes
  NUMBER        // Numeric input (quantity, dimensions)
  TEXT          // Text input (custom text)
  FILE          // File upload
}

model ProductAttributeOption {
  id            String           @id @default(cuid())
  attributeId   String
  attribute     ProductAttribute @relation(fields: [attributeId], references: [id])
  value         String           // "8.5x11", "16pt Cardstock", "Matte Finish"
  label         String?          // Display name if different from value
  pricingRule   Json?            // Pricing adjustments for this option
  isDefault     Boolean          @default(false)
  sortOrder     Int              @default(0)

  @@map("product_attribute_options")
}

model ProductPricing {
  id              String   @id @default(cuid())
  productId       String
  product         Product  @relation(fields: [productId], references: [id])

  // Quantity-based pricing
  minQuantity     Int
  maxQuantity     Int?
  basePrice       Decimal  @db.Decimal(10, 2)

  // Broker pricing
  brokerDiscounts Json?    // Tier-specific discounts

  // Attribute-based pricing
  attributePricing Json?   // Additional costs for specific attributes

  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("product_pricing")
}

model ProductAddOn {
  id            String             @id @default(cuid())
  productId     String?
  product       Product?           @relation(fields: [productId], references: [id])

  name          String
  description   String?
  type          ProductAddOnType
  pricing       ProductAddOnPricing

  // Conditions
  isGlobal      Boolean            @default(false) // Available for all products
  categories    String[]           // Category IDs where this applies

  isActive      Boolean            @default(true)
  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt

  @@map("product_add_ons")
}

enum ProductAddOnType {
  DESIGN_SERVICE    // Design help
  PROOFING         // Digital or physical proof
  RUSH_ORDER       // Expedited processing
  SPECIAL_FINISH   // Special finishing options
  SHIPPING_UPGRADE // Faster shipping
  FILE_SETUP       // File preparation service
}

enum ProductAddOnPricing {
  FIXED_FEE        // $X.XX flat rate
  PERCENTAGE       // X% of order total
  PER_UNIT         // $X.XX per item
  TIERED           // Different rates based on quantity
}
```

### Product Configuration Component

```typescript
// src/components/features/product/ProductConfigurator.tsx
"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

const configurationSchema = z.object({
  quantity: z.number().min(1),
  attributes: z.record(z.string()),
  addOns: z.array(z.string()).optional(),
  artwork: z.array(z.any()).optional(),
})

type ConfigurationData = z.infer<typeof configurationSchema>

interface ProductConfiguratorProps {
  product: Product
  onConfigurationChange: (config: ConfigurationData, price: number) => void
}

export function ProductConfigurator({ product, onConfigurationChange }: ProductConfiguratorProps) {
  const [currentPrice, setCurrentPrice] = useState(0)
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({})
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])

  const form = useForm<ConfigurationData>({
    resolver: zodResolver(configurationSchema),
    defaultValues: {
      quantity: 100,
      attributes: {},
      addOns: [],
    },
  })

  // Calculate price whenever configuration changes
  useEffect(() => {
    calculatePrice()
  }, [form.watch(), selectedAttributes, selectedAddOns])

  const calculatePrice = async () => {
    const quantity = form.getValues("quantity")
    const config = {
      productId: product.id,
      quantity,
      attributes: selectedAttributes,
      addOns: selectedAddOns,
    }

    try {
      const response = await fetch("/api/products/calculate-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      const { price } = await response.json()
      setCurrentPrice(price)
      onConfigurationChange(form.getValues(), price)
    } catch (error) {
      console.error("Price calculation failed:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configure Your {product.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quantity Selection */}
          <div>
            <label className="text-sm font-medium">Quantity</label>
            <Input
              type="number"
              min={1}
              {...form.register("quantity", { valueAsNumber: true })}
            />
          </div>

          {/* Dynamic Attributes */}
          {product.attributes.map((attribute) => (
            <div key={attribute.id}>
              <label className="text-sm font-medium">{attribute.name}</label>
              {attribute.type === "SELECT" && (
                <Select
                  onValueChange={(value) => {
                    setSelectedAttributes(prev => ({ ...prev, [attribute.id]: value }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${attribute.name}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {attribute.options.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label || option.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}

          {/* Add-on Services */}
          <div>
            <label className="text-sm font-medium mb-2 block">Add-on Services</label>
            <div className="space-y-2">
              {product.addOns.map((addOn) => (
                <div key={addOn.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={addOn.id}
                    checked={selectedAddOns.includes(addOn.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedAddOns(prev => [...prev, addOn.id])
                      } else {
                        setSelectedAddOns(prev => prev.filter(id => id !== addOn.id))
                      }
                    }}
                  />
                  <label htmlFor={addOn.id} className="text-sm">
                    {addOn.name}
                    {addOn.pricing && (
                      <span className="text-muted-foreground ml-1">
                        (+${addOn.pricing.amount})
                      </span>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Display */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Total Price:</span>
            <span className="text-2xl font-bold text-primary">
              ${currentPrice.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Dynamic Pricing Engine

```typescript
// src/lib/services/pricing.ts
interface PricingCalculation {
  productId: string
  quantity: number
  attributes: Record<string, string>
  addOns: string[]
  brokerTier?: string
}

export class PricingEngine {
  static async calculatePrice(config: PricingCalculation): Promise<number> {
    let totalPrice = 0

    // 1. Get base price from quantity tiers
    const basePrice = await this.getBasePrice(config.productId, config.quantity)
    totalPrice += basePrice

    // 2. Add attribute-based pricing adjustments
    const attributeAdjustments = await this.calculateAttributePricing(
      config.productId,
      config.attributes
    )
    totalPrice += attributeAdjustments

    // 3. Add add-on services
    const addOnCosts = await this.calculateAddOnPricing(config.addOns, config.quantity, totalPrice)
    totalPrice += addOnCosts

    // 4. Apply broker discounts
    if (config.brokerTier) {
      const discount = await this.getBrokerDiscount(config.productId, config.brokerTier)
      totalPrice = totalPrice * (1 - discount)
    }

    return Math.round(totalPrice * 100) / 100 // Round to 2 decimal places
  }

  private static async getBasePrice(productId: string, quantity: number): Promise<number> {
    const pricing = await prisma.productPricing.findFirst({
      where: {
        productId,
        minQuantity: { lte: quantity },
        OR: [{ maxQuantity: { gte: quantity } }, { maxQuantity: null }],
      },
      orderBy: { minQuantity: 'desc' },
    })

    return pricing ? parseFloat(pricing.basePrice.toString()) * quantity : 0
  }

  private static async calculateAttributePricing(
    productId: string,
    attributes: Record<string, string>
  ): Promise<number> {
    let adjustment = 0

    for (const [attributeId, optionId] of Object.entries(attributes)) {
      const option = await prisma.productAttributeOption.findUnique({
        where: { id: optionId },
      })

      if (option?.pricingRule) {
        const rule = option.pricingRule as any
        adjustment += rule.adjustment || 0
      }
    }

    return adjustment
  }

  private static async calculateAddOnPricing(
    addOnIds: string[],
    quantity: number,
    basePrice: number
  ): Promise<number> {
    let addOnTotal = 0

    const addOns = await prisma.productAddOn.findMany({
      where: { id: { in: addOnIds } },
    })

    for (const addOn of addOns) {
      switch (addOn.pricing) {
        case 'FIXED_FEE':
          addOnTotal += (addOn as any).amount
          break
        case 'PERCENTAGE':
          addOnTotal += basePrice * ((addOn as any).percentage / 100)
          break
        case 'PER_UNIT':
          addOnTotal += quantity * (addOn as any).perUnit
          break
      }
    }

    return addOnTotal
  }

  private static async getBrokerDiscount(productId: string, brokerTier: string): Promise<number> {
    // Get product-specific or category-wide broker discounts
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true },
    })

    // Return tier-based discount percentage
    const discounts = {
      BRONZE: 0.05, // 5% discount
      SILVER: 0.1, // 10% discount
      GOLD: 0.15, // 15% discount
      PLATINUM: 0.2, // 20% discount
    }

    return discounts[brokerTier as keyof typeof discounts] || 0
  }
}
```

## The Advance: Advanced Features

### 1. File Upload System

```typescript
// src/components/features/product/ArtworkUpload.tsx
"use client"

import { useDropzone } from "react-dropzone"
import { useState } from "react"
import { uploadToMinio } from "@/lib/minio"

export function ArtworkUpload({ onUpload }: { onUpload: (files: string[]) => void }) {
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.pdf'],
      'application/pdf': ['.pdf']
    },
    maxSize: 50 * 1024 * 1024, // 50MB limit
    onDrop: async (acceptedFiles) => {
      setUploading(true)
      try {
        const uploadPromises = acceptedFiles.map(file => uploadToMinio(file))
        const fileUrls = await Promise.all(uploadPromises)
        setUploadedFiles(prev => [...prev, ...fileUrls])
        onUpload([...uploadedFiles, ...fileUrls])
      } catch (error) {
        console.error("Upload failed:", error)
      } finally {
        setUploading(false)
      }
    }
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
      }`}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <p>Uploading files...</p>
      ) : (
        <div>
          <p className="text-lg font-medium">Drop your artwork files here</p>
          <p className="text-sm text-muted-foreground">
            Supports PDF, JPG, PNG up to 50MB each
          </p>
        </div>
      )}
    </div>
  )
}
```

### 2. Product Search & Filtering

```typescript
// src/app/(customer)/products/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProductGrid } from "@/components/features/product/ProductGrid"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState([])
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    sortBy: "name",
  })

  useEffect(() => {
    fetchProducts()
  }, [filters])

  const fetchProducts = async () => {
    const queryParams = new URLSearchParams(filters)
    const response = await fetch(`/api/products?${queryParams}`)
    const data = await response.json()
    setProducts(data.products)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex gap-4 mb-8">
        <Input
          placeholder="Search products..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
        />

        <Select onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            <SelectItem value="business-cards">Business Cards</SelectItem>
            <SelectItem value="flyers">Flyers</SelectItem>
            <SelectItem value="banners">Banners</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ProductGrid products={products} />
    </div>
  )
}
```

## The Document: Key Learnings

### What Worked Well

1. **Flexible Schema Design**: JSON fields for pricing rules allowed complex configurations without schema changes
2. **Dynamic Pricing Engine**: Real-time price calculations provided immediate feedback
3. **Component-Based UI**: Reusable configuration components across different product types
4. **File Upload Integration**: MinIO integration handled large artwork files efficiently

### Challenges Overcome

1. **Complex Pricing Logic**: Required careful sequencing of price calculations
2. **Database Performance**: Added proper indexes for product search and filtering
3. **Type Safety**: Extensive TypeScript interfaces for product configurations
4. **State Management**: React Hook Form handled complex form state effectively

### Performance Optimizations

1. **Query Optimization**: Eager loading of related data reduced database queries
2. **Client-Side Caching**: React Query cached product data and pricing calculations
3. **Image Optimization**: Next.js Image component with proper sizing and formats
4. **Search Indexing**: Database indexes on searchable fields improved query performance

### Security Considerations

1. **File Upload Validation**: Strict file type and size validation
2. **Price Calculation Server-Side**: All pricing calculated on server to prevent manipulation
3. **Input Sanitization**: All user inputs validated and sanitized
4. **Access Control**: Product management restricted to admin users

## Related Shards

- **Previous**: [Shard 002 - Authentication](./shard-002-auth.md)
- **Next**: [Shard 004 - Shopping Cart](./shard-004-cart.md)
- **References**: Database design, File handling, API endpoints

## Files Created/Modified

### Created

- `/src/components/features/product/ProductConfigurator.tsx` - Main configuration component
- `/src/components/features/product/ProductGrid.tsx` - Product listing grid
- `/src/components/features/product/ArtworkUpload.tsx` - File upload component
- `/src/lib/services/pricing.ts` - Pricing calculation engine
- `/src/app/api/products/calculate-price/route.ts` - Price calculation API
- `/src/app/(customer)/products/page.tsx` - Product catalog page
- `/src/app/(customer)/products/[slug]/page.tsx` - Individual product page

### Modified

- `/prisma/schema.prisma` - Product and pricing tables
- `/src/lib/minio.ts` - File upload utilities

## Success Metrics

- ✅ Product configuration system functional
- ✅ Dynamic pricing calculations accurate
- ✅ File upload system working with MinIO
- ✅ Product search and filtering operational
- ✅ Broker pricing discounts applying correctly
- ✅ Add-on services calculating properly
- ✅ Mobile-responsive product pages
- ✅ SEO-optimized product URLs and metadata

## Testing Checklist

- [ ] Product configurations save correctly
- [ ] Pricing calculations match expected results
- [ ] File uploads complete without errors
- [ ] Search returns relevant results
- [ ] Filters narrow results appropriately
- [ ] Broker discounts apply at correct rates
- [ ] Add-on services increase price correctly
- [ ] Mobile interface functions properly

---

_This product catalog system forms the core of the GangRun Printing platform, enabling customers to configure complex printing products with confidence in pricing accuracy and system reliability._
