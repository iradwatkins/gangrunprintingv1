import { describe, it, expect } from 'vitest'
import { formatCurrency, calculateTax, validateEmail, generateOrderNumber } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(123.45)).toBe('$123.45')
      expect(formatCurrency(0)).toBe('$0.00')
      expect(formatCurrency(1000)).toBe('$1,000.00')
    })

    it('should handle negative values', () => {
      expect(formatCurrency(-123.45)).toBe('-$123.45')
    })

    it('should round to 2 decimal places', () => {
      expect(formatCurrency(123.456)).toBe('$123.46')
      expect(formatCurrency(123.454)).toBe('$123.45')
    })
  })

  describe('calculateTax', () => {
    it('should calculate tax correctly', () => {
      expect(calculateTax(100, 0.08)).toBe(8.0)
      expect(calculateTax(250, 0.0625)).toBe(15.63)
    })

    it('should handle zero amounts', () => {
      expect(calculateTax(0, 0.08)).toBe(0)
    })

    it('should handle zero tax rate', () => {
      expect(calculateTax(100, 0)).toBe(0)
    })

    it('should round to 2 decimal places', () => {
      expect(calculateTax(100, 0.08125)).toBe(8.13)
    })
  })

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validateEmail('test+label@example.org')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('@domain.com')).toBe(false)
      expect(validateEmail('user@')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(validateEmail('a@b.c')).toBe(true)
      expect(validateEmail('test@domain')).toBe(false)
      expect(validateEmail('test..test@domain.com')).toBe(false)
    })
  })

  describe('generateOrderNumber', () => {
    it('should generate valid order numbers', () => {
      const orderNumber = generateOrderNumber()
      expect(orderNumber).toMatch(/^GRP-\d{8}-[A-Z0-9]{4}$/)
    })

    it('should generate unique order numbers', () => {
      const orderNumbers = new Set()
      for (let i = 0; i < 100; i++) {
        orderNumbers.add(generateOrderNumber())
      }
      expect(orderNumbers.size).toBe(100)
    })

    it('should include current date in order number', () => {
      const orderNumber = generateOrderNumber()
      const dateString = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      expect(orderNumber).toContain(dateString)
    })
  })
})
