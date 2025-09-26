import { describe, it, expect } from '@jest/globals'
import {
  transformProductForFrontend,
  transformCategoryForFrontend,
  transformImagesForFrontend,
  transformSizesForFrontend,
  transformQuantitiesForFrontend,
  transformPaperStocksForFrontend,
  transformAddonsForFrontend,
  transformProductsForFrontend
} from '@/lib/data-transformers'

describe('Data Transformers', () => {
  describe('transformProductForFrontend', () => {
    it('should transform product with camelCase to PascalCase', () => {
      const product = {
        id: 'prod-1',
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test description',
        basePrice: 10.99,
        turnaroundTime: 5,
        isActive: true,
        isFeatured: false,
        minQuantity: 1,
        maxQuantity: 1000,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
      }

      const result = transformProductForFrontend(product)

      expect(result).toEqual({
        Id: 'prod-1',
        Name: 'Test Product',
        Slug: 'test-product',
        Description: 'Test description',
        BasePrice: 10.99,
        TurnaroundTime: 5,
        IsActive: true,
        IsFeatured: false,
        MinQuantity: 1,
        MaxQuantity: 1000,
        CreatedAt: '2024-01-01',
        UpdatedAt: '2024-01-02',
        ProductCategory: null,
        ProductImages: [],
        ProductSizes: [],
        ProductQuantities: [],
        ProductPaperStocks: [],
        ProductAddons: [],
        productCategory: undefined,
        productImages: undefined,
      })
    })

    it('should handle snake_case properties', () => {
      const product = {
        id: 'prod-2',
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test description',
        base_price: 15.99,
        turnaround_time: 3,
        is_active: false,
        is_featured: true,
        min_quantity: 10,
        max_quantity: 500,
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
      }

      const result = transformProductForFrontend(product)

      expect(result?.BasePrice).toBe(15.99)
      expect(result?.TurnaroundTime).toBe(3)
      expect(result?.IsActive).toBe(false)
      expect(result?.IsFeatured).toBe(true)
      expect(result?.MinQuantity).toBe(10)
      expect(result?.MaxQuantity).toBe(500)
    })

    it('should handle null product', () => {
      const result = transformProductForFrontend(null)
      expect(result).toBeNull()
    })

    it('should handle undefined product', () => {
      const result = transformProductForFrontend(undefined)
      expect(result).toBeNull()
    })

    it('should transform product with relations', () => {
      const product = {
        id: 'prod-3',
        name: 'Product with Relations',
        slug: 'product-with-relations',
        description: 'Description',
        basePrice: 20.00,
        productCategory: {
          id: 'cat-1',
          name: 'Business Cards',
          slug: 'business-cards',
          description: 'Professional business cards',
          isActive: true,
        },
        productImages: [
          {
            id: 'img-1',
            url: '/images/product1.jpg',
            thumbnailUrl: '/images/product1_thumb.jpg',
            isPrimary: true,
            displayOrder: 1,
          }
        ],
      }

      const result = transformProductForFrontend(product)

      expect(result?.ProductCategory).toEqual({
        Id: 'cat-1',
        Name: 'Business Cards',
        Slug: 'business-cards',
        Description: 'Professional business cards',
        IsActive: true,
      })

      expect(result?.ProductImages).toHaveLength(1)
      expect(result?.ProductImages[0]).toEqual({
        Id: 'img-1',
        Url: '/images/product1.jpg',
        ThumbnailUrl: '/images/product1_thumb.jpg',
        MediumUrl: undefined,
        LargeUrl: undefined,
        AltText: '',
        IsPrimary: true,
        DisplayOrder: 1,
      })
    })
  })

  describe('transformCategoryForFrontend', () => {
    it('should transform category correctly', () => {
      const category = {
        id: 'cat-1',
        name: 'Flyers',
        slug: 'flyers',
        description: 'Marketing flyers',
        isActive: true,
      }

      const result = transformCategoryForFrontend(category)

      expect(result).toEqual({
        Id: 'cat-1',
        Name: 'Flyers',
        Slug: 'flyers',
        Description: 'Marketing flyers',
        IsActive: true,
      })
    })

    it('should handle snake_case category', () => {
      const category = {
        id: 'cat-2',
        name: 'Posters',
        slug: 'posters',
        description: 'Large format posters',
        is_active: false,
      }

      const result = transformCategoryForFrontend(category)
      expect(result?.IsActive).toBe(false)
    })

    it('should handle null category', () => {
      const result = transformCategoryForFrontend(null)
      expect(result).toBeNull()
    })

    it('should handle undefined category', () => {
      const result = transformCategoryForFrontend(undefined)
      expect(result).toBeNull()
    })
  })

  describe('transformImagesForFrontend', () => {
    it('should transform images array correctly', () => {
      const images = [
        {
          id: 'img-1',
          url: '/image1.jpg',
          thumbnailUrl: '/thumb1.jpg',
          mediumUrl: '/medium1.jpg',
          largeUrl: '/large1.jpg',
          altText: 'Product image 1',
          isPrimary: true,
          displayOrder: 1,
        },
        {
          id: 'img-2',
          url: '/image2.jpg',
          thumbnail_url: '/thumb2.jpg',
          medium_url: '/medium2.jpg',
          large_url: '/large2.jpg',
          alt_text: 'Product image 2',
          is_primary: false,
          display_order: 2,
        }
      ]

      const result = transformImagesForFrontend(images)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        Id: 'img-1',
        Url: '/image1.jpg',
        ThumbnailUrl: '/thumb1.jpg',
        MediumUrl: '/medium1.jpg',
        LargeUrl: '/large1.jpg',
        AltText: 'Product image 1',
        IsPrimary: true,
        DisplayOrder: 1,
      })
      expect(result[1]).toEqual({
        Id: 'img-2',
        Url: '/image2.jpg',
        ThumbnailUrl: '/thumb2.jpg',
        MediumUrl: '/medium2.jpg',
        LargeUrl: '/large2.jpg',
        AltText: 'Product image 2',
        IsPrimary: false,
        DisplayOrder: 2,
      })
    })

    it('should handle empty images array', () => {
      const result = transformImagesForFrontend([])
      expect(result).toEqual([])
    })

    it('should handle null images', () => {
      const result = transformImagesForFrontend(null)
      expect(result).toEqual([])
    })

    it('should handle undefined images', () => {
      const result = transformImagesForFrontend(undefined)
      expect(result).toEqual([])
    })

    it('should handle non-array images', () => {
      const result = transformImagesForFrontend('not an array' as any)
      expect(result).toEqual([])
    })

    it('should provide default values for missing properties', () => {
      const images = [
        {
          id: 'img-3',
          url: '/image3.jpg',
        }
      ]

      const result = transformImagesForFrontend(images)

      expect(result[0]).toEqual({
        Id: 'img-3',
        Url: '/image3.jpg',
        ThumbnailUrl: undefined,
        MediumUrl: undefined,
        LargeUrl: undefined,
        AltText: '',
        IsPrimary: false,
        DisplayOrder: 0,
      })
    })
  })

  describe('transformProductsForFrontend', () => {
    it('should transform multiple products', () => {
      const products = [
        {
          id: 'prod-1',
          name: 'Product 1',
          slug: 'product-1',
          description: 'Description 1',
          basePrice: 10.00,
        },
        {
          id: 'prod-2',
          name: 'Product 2',
          slug: 'product-2',
          description: 'Description 2',
          base_price: 20.00,
        }
      ]

      const result = transformProductsForFrontend(products)

      expect(result).toHaveLength(2)
      expect(result[0].Id).toBe('prod-1')
      expect(result[0].BasePrice).toBe(10.00)
      expect(result[1].Id).toBe('prod-2')
      expect(result[1].BasePrice).toBe(20.00)
    })

    it('should handle empty products array', () => {
      const result = transformProductsForFrontend([])
      expect(result).toEqual([])
    })

    it('should filter out null products', () => {
      const products = [
        { id: 'prod-1', name: 'Product 1', slug: 'p1', description: 'D1', basePrice: 10 },
        null,
        { id: 'prod-2', name: 'Product 2', slug: 'p2', description: 'D2', basePrice: 20 },
        undefined,
      ]

      const result = transformProductsForFrontend(products)

      expect(result).toHaveLength(2)
      expect(result[0].Id).toBe('prod-1')
      expect(result[1].Id).toBe('prod-2')
    })

    it('should handle malformed product data gracefully', () => {
      const products = [
        {
          id: 'prod-1',
          name: 'Valid Product',
          slug: 'valid-product',
          description: 'Valid description',
          basePrice: 10.00,
        },
        {
          // Missing required fields
          id: 'prod-2',
        },
        {
          id: 'prod-3',
          name: 'Another Valid',
          slug: 'another-valid',
          description: 'Another description',
          base_price: 30.00,
        }
      ]

      const result = transformProductsForFrontend(products)

      // Should still transform all products, even with missing data
      expect(result).toHaveLength(3)
      expect(result[0].Name).toBe('Valid Product')
      expect(result[1].Name).toBeUndefined()
      expect(result[2].Name).toBe('Another Valid')
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle mixed camelCase and snake_case in same object', () => {
      const product = {
        id: 'prod-mixed',
        name: 'Mixed Case Product',
        slug: 'mixed-case',
        description: 'Description',
        basePrice: 15.00,
        base_price: 25.00, // Both present - should prefer camelCase
        turnaroundTime: 5,
        turnaround_time: 10, // Both present - should prefer camelCase
        isActive: true,
        is_featured: true, // Only snake_case version
      }

      const result = transformProductForFrontend(product)

      expect(result?.BasePrice).toBe(15.00) // Should use camelCase version
      expect(result?.TurnaroundTime).toBe(5) // Should use camelCase version
      expect(result?.IsActive).toBe(true)
      expect(result?.IsFeatured).toBe(true)
    })

    it('should handle deeply nested undefined values', () => {
      const product = {
        id: 'prod-nested',
        name: 'Nested Product',
        slug: 'nested',
        description: 'Description',
        basePrice: 20.00,
        productCategory: undefined,
        productImages: undefined,
        images: null,
        sizes: undefined,
      }

      const result = transformProductForFrontend(product)

      expect(result).toBeTruthy()
      expect(result?.ProductCategory).toBeNull()
      expect(result?.ProductImages).toEqual([])
      expect(result?.ProductSizes).toEqual([])
    })

    it('should handle circular references without crashing', () => {
      const category: any = {
        id: 'cat-circular',
        name: 'Circular Category',
        slug: 'circular',
        description: 'Description',
        isActive: true,
      }

      const product: any = {
        id: 'prod-circular',
        name: 'Circular Product',
        slug: 'circular',
        description: 'Description',
        basePrice: 30.00,
        productCategory: category,
      }

      // Create circular reference
      category.product = product

      // Should handle without stack overflow
      const result = transformProductForFrontend(product)
      expect(result).toBeTruthy()
      expect(result?.Id).toBe('prod-circular')
    })
  })
})