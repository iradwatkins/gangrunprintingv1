import { describe, test, expect } from 'vitest'
import {
  transformQuantityGroup,
  transformQuantityGroups,
  findDefaultQuantity,
  validateCustomQuantity,
  getQuantityDisplayText,
  type QuantityGroup,
  type Quantity,
} from '../quantity-transformer'

// Mock data for testing
const mockQuantityGroup: QuantityGroup = {
  id: 'test-group-1',
  name: 'Test Quantities',
  description: 'Test quantity options',
  values: '100,250,500,1000,custom',
  defaultValue: '500',
  customMin: 10,
  customMax: 50000,
  sortOrder: 0,
  isActive: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  valuesList: ['100', '250', '500', '1000', 'custom'],
  hasCustomOption: true,
  _count: { products: 2 },
}

const mockQuantityGroupNoCustom: QuantityGroup = {
  id: 'test-group-2',
  name: 'Standard Quantities',
  description: 'Standard quantity options only',
  values: '25,50,100,250',
  defaultValue: '100',
  customMin: null,
  customMax: null,
  sortOrder: 1,
  isActive: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  valuesList: ['25', '50', '100', '250'],
  hasCustomOption: false,
  _count: { products: 1 },
}

describe('quantity-transformer', () => {
  describe('transformQuantityGroup', () => {
    test('transforms quantity group with custom option correctly', () => {
      const result = transformQuantityGroup(mockQuantityGroup)

      expect(result).toHaveLength(5)

      // Check standard quantities
      expect(result[0]).toEqual({
        id: 'test-group-1-0',
        name: '100',
        value: 100,
        isCustom: false,
        minValue: null,
        maxValue: null,
      })

      expect(result[3]).toEqual({
        id: 'test-group-1-3',
        name: '1000',
        value: 1000,
        isCustom: false,
        minValue: null,
        maxValue: null,
      })

      // Check custom quantity
      expect(result[4]).toEqual({
        id: 'test-group-1-4',
        name: 'Custom...',
        value: null,
        isCustom: true,
        minValue: 10,
        maxValue: 50000,
      })
    })

    test('transforms quantity group without custom option correctly', () => {
      const result = transformQuantityGroup(mockQuantityGroupNoCustom)

      expect(result).toHaveLength(4)

      result.forEach((quantity, index) => {
        expect(quantity.isCustom).toBe(false)
        expect(quantity.minValue).toBeNull()
        expect(quantity.maxValue).toBeNull()
        expect(quantity.id).toBe(`test-group-2-${index}`)
      })

      expect(result[2]).toEqual({
        id: 'test-group-2-2',
        name: '100',
        value: 100,
        isCustom: false,
        minValue: null,
        maxValue: null,
      })
    })

    test('handles empty values string', () => {
      const emptyGroup: QuantityGroup = {
        ...mockQuantityGroup,
        values: '',
      }

      const result = transformQuantityGroup(emptyGroup)
      expect(result).toHaveLength(0)
    })

    test('handles malformed values string', () => {
      const malformedGroup: QuantityGroup = {
        ...mockQuantityGroup,
        values: '100,,250,   ,500',
      }

      const result = transformQuantityGroup(malformedGroup)
      expect(result).toHaveLength(3)
      expect(result.map((q) => q.name)).toEqual(['100', '250', '500'])
    })

    test('handles case-insensitive custom detection', () => {
      const customGroup: QuantityGroup = {
        ...mockQuantityGroup,
        values: '100,250,Custom,500',
      }

      const result = transformQuantityGroup(customGroup)
      expect(result).toHaveLength(4)
      expect(result[2].isCustom).toBe(true)
      expect(result[2].name).toBe('Custom...')
    })
  })

  describe('transformQuantityGroups', () => {
    test('transforms multiple quantity groups correctly', () => {
      const groups = [mockQuantityGroup, mockQuantityGroupNoCustom]
      const result = transformQuantityGroups(groups)

      expect(result).toHaveLength(9) // 5 + 4

      // Check that IDs are unique across groups
      const ids = result.map((q) => q.id)
      expect(new Set(ids).size).toBe(ids.length)

      // Check custom quantity exists
      const customQuantities = result.filter((q) => q.isCustom)
      expect(customQuantities).toHaveLength(1)
      expect(customQuantities[0].minValue).toBe(10)
      expect(customQuantities[0].maxValue).toBe(50000)
    })

    test('handles empty array', () => {
      const result = transformQuantityGroups([])
      expect(result).toHaveLength(0)
    })
  })

  describe('findDefaultQuantity', () => {
    const transformedQuantities = transformQuantityGroup(mockQuantityGroup)

    test('finds default quantity by value', () => {
      const defaultQuantity = findDefaultQuantity(transformedQuantities, '500')

      expect(defaultQuantity).not.toBeNull()
      expect(defaultQuantity?.value).toBe(500)
      expect(defaultQuantity?.name).toBe('500')
    })

    test('finds custom default quantity', () => {
      const defaultQuantity = findDefaultQuantity(transformedQuantities, 'custom')

      expect(defaultQuantity).not.toBeNull()
      expect(defaultQuantity?.isCustom).toBe(true)
      expect(defaultQuantity?.name).toBe('Custom...')
    })

    test('returns null for non-existent default', () => {
      const defaultQuantity = findDefaultQuantity(transformedQuantities, '999')
      expect(defaultQuantity).toBeNull()
    })
  })

  describe('validateCustomQuantity', () => {
    const customQuantity: Quantity = {
      id: 'custom-1',
      name: 'Custom...',
      value: null,
      isCustom: true,
      minValue: 100,
      maxValue: 10000,
    }

    test('validates valid custom quantity', () => {
      const result = validateCustomQuantity(500, customQuantity)
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    test('rejects quantity below minimum', () => {
      const result = validateCustomQuantity(50, customQuantity)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Minimum quantity is 100')
    })

    test('rejects quantity above maximum', () => {
      const result = validateCustomQuantity(15000, customQuantity)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Maximum quantity is 10,000')
    })

    test('rejects zero or negative quantity', () => {
      const result = validateCustomQuantity(0, customQuantity)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Quantity must be greater than 0')
    })

    test('handles quantity without min/max constraints', () => {
      const unconstrainedQuantity: Quantity = {
        ...customQuantity,
        minValue: null,
        maxValue: null,
      }

      const result = validateCustomQuantity(500, unconstrainedQuantity)
      expect(result.isValid).toBe(true)
    })

    test('rejects non-custom quantity', () => {
      const standardQuantity: Quantity = {
        id: 'standard-1',
        name: '500',
        value: 500,
        isCustom: false,
        minValue: null,
        maxValue: null,
      }

      const result = validateCustomQuantity(500, standardQuantity)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Quantity is not a custom option')
    })
  })

  describe('getQuantityDisplayText', () => {
    const standardQuantity: Quantity = {
      id: 'standard-1',
      name: '500',
      value: 500,
      isCustom: false,
      minValue: null,
      maxValue: null,
    }

    const customQuantity: Quantity = {
      id: 'custom-1',
      name: 'Custom...',
      value: null,
      isCustom: true,
      minValue: 100,
      maxValue: 10000,
    }

    test('displays standard quantity correctly', () => {
      const result = getQuantityDisplayText(standardQuantity)
      expect(result).toBe('500 units')
    })

    test('displays custom quantity with value', () => {
      const result = getQuantityDisplayText(customQuantity, 1500)
      expect(result).toBe('Custom: 1,500 units')
    })

    test('displays custom quantity without value', () => {
      const result = getQuantityDisplayText(customQuantity)
      expect(result).toBe('Custom quantity')
    })

    test('handles quantity without value', () => {
      const quantityNoValue: Quantity = {
        id: 'test-1',
        name: 'Test Quantity',
        value: null,
        isCustom: false,
        minValue: null,
        maxValue: null,
      }

      const result = getQuantityDisplayText(quantityNoValue)
      expect(result).toBe('Test Quantity')
    })
  })

  describe('edge cases and error handling', () => {
    test('handles null values in quantity group', () => {
      const nullGroup: QuantityGroup = {
        ...mockQuantityGroup,
        values: null as any,
      }

      const result = transformQuantityGroup(nullGroup)
      expect(result).toHaveLength(0)
    })

    test('handles non-numeric values', () => {
      const mixedGroup: QuantityGroup = {
        ...mockQuantityGroup,
        values: 'abc,100,xyz,250,custom',
      }

      const result = transformQuantityGroup(mixedGroup)
      expect(result).toHaveLength(5)

      // Non-numeric values should have null value but keep name
      expect(result[0]).toEqual({
        id: 'test-group-1-0',
        name: 'abc',
        value: null,
        isCustom: false,
        minValue: null,
        maxValue: null,
      })

      expect(result[1].value).toBe(100)
      expect(result[4].isCustom).toBe(true)
    })
  })
})
