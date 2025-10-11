# Validation Schemas

This directory contains Zod validation schemas for runtime type checking across the application.

## Why Zod?

- **Runtime Type Safety**: Catch invalid data before it reaches your database
- **Type Inference**: TypeScript types are automatically inferred from schemas
- **Clear Error Messages**: User-friendly validation error messages
- **Transformations**: Automatically transform data (e.g., trim strings, normalize phone numbers)

## Directory Structure

```
validations/
├── index.ts           # Main export point
├── common.ts          # Shared validation schemas (email, phone, UUID, etc.)
├── checkout.ts        # Checkout and order validation schemas
├── product.ts         # Product configuration validation schemas
└── README.md          # This file
```

## Usage Examples

### Basic Validation

```typescript
import { emailSchema, phoneSchema } from '@/lib/validations'

// Validate email
const result = emailSchema.safeParse('user@example.com')
if (result.success) {
  console.log('Valid email:', result.data)
} else {
  console.log('Error:', result.error.errors[0].message)
}

// Or use helper function
import { safeValidate } from '@/lib/validations'

const validation = safeValidate(emailSchema, 'user@example.com')
if (validation.success) {
  console.log('Valid:', validation.data)
} else {
  console.log('Error:', validation.error)
}
```

### Checkout Data Validation

```typescript
import { validateCheckoutData, type CheckoutData } from '@/lib/validations/checkout'

function processCheckout(data: unknown) {
  const result = validateCheckoutData(data)

  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  // Now data is fully typed and validated
  const checkoutData: CheckoutData = result.data
  console.log('Valid checkout data:', checkoutData)
}
```

### Product Configuration Validation

```typescript
import {
  validateProductConfiguration,
  type ProductConfiguration
} from '@/lib/validations/product'

async function loadProductConfig(productId: string) {
  const data = await fetchProductConfig(productId)

  const result = validateProductConfiguration(data)

  if (!result.success) {
    console.error('Invalid configuration:', result.error)
    return null
  }

  return result.data // Fully typed ProductConfiguration
}
```

### API Route Validation

```typescript
import { NextResponse } from 'next/server'
import { createOrderRequestSchema, getFirstError } from '@/lib/validations'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate request body
    const result = createOrderRequestSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: getFirstError(result.error) },
        { status: 400 }
      )
    }

    // Process valid data
    const orderData = result.data
    // ... create order

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
```

### Form Validation with React

```typescript
import { useState } from 'react'
import { customerInfoSchema, type CustomerInfo } from '@/lib/validations/checkout'

function CheckoutForm() {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (formData: unknown) => {
    const result = customerInfoSchema.safeParse(formData)

    if (!result.success) {
      // Convert Zod errors to form errors
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string
        fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    // Valid data - proceed with submission
    const customerInfo: CustomerInfo = result.data
    submitOrder(customerInfo)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields with error display */}
      {errors.email && <span className="error">{errors.email}</span>}
    </form>
  )
}
```

### Type Inference

```typescript
import { z } from 'zod'
import { cartItemSchema } from '@/lib/validations/checkout'

// Type is automatically inferred from schema
type CartItem = z.infer<typeof cartItemSchema>

function processCartItem(item: CartItem) {
  // TypeScript knows all the fields and types
  console.log(item.productId)      // string (UUID)
  console.log(item.quantity)       // number
  console.log(item.options?.size)  // string | undefined
}
```

## Common Patterns

### 1. Validate Before Database Operations

```typescript
import { createOrderRequestSchema } from '@/lib/validations/checkout'
import { prisma } from '@/lib/prisma'

async function createOrder(data: unknown) {
  // Validate first
  const result = createOrderRequestSchema.safeParse(data)
  if (!result.success) {
    throw new Error('Invalid order data')
  }

  // Now safe to insert into database
  const order = await prisma.order.create({
    data: result.data
  })

  return order
}
```

### 2. Validate API Responses

```typescript
import { productConfigurationSchema } from '@/lib/validations/product'

async function fetchProductConfig(productId: string) {
  const response = await fetch(`/api/products/${productId}/configuration`)
  const data = await response.json()

  // Validate response data
  const result = productConfigurationSchema.safeParse(data)

  if (!result.success) {
    console.error('API returned invalid data:', result.error)
    throw new Error('Invalid API response')
  }

  return result.data // Type-safe, validated data
}
```

### 3. Partial Validation (for Updates)

```typescript
import { customerInfoSchema } from '@/lib/validations/checkout'

// Create partial schema for updates
const updateCustomerSchema = customerInfoSchema.partial()

function updateCustomer(updates: unknown) {
  const result = updateCustomerSchema.safeParse(updates)

  if (!result.success) {
    return { error: 'Invalid update data' }
  }

  // Only provided fields are included
  return { success: true, data: result.data }
}
```

## Best Practices

1. **Always validate external data**: API requests, database queries, user input
2. **Use safeParse in production**: Returns result object instead of throwing
3. **Provide clear error messages**: Users should understand what's wrong
4. **Transform data consistently**: Use schema transforms for normalization
5. **Keep schemas reusable**: Break complex schemas into composable parts
6. **Type inference over manual types**: Let Zod generate your TypeScript types

## Error Handling

```typescript
import { formatZodError, getFirstError } from '@/lib/validations'
import { z } from 'zod'

function handleValidationError(error: z.ZodError) {
  // Get all errors as formatted string
  const allErrors = formatZodError(error)
  console.log('All errors:', allErrors)

  // Get just the first error for user display
  const firstError = getFirstError(error)
  toast.error(firstError)

  // Get detailed error information
  error.errors.forEach((err) => {
    console.log('Field:', err.path.join('.'))
    console.log('Message:', err.message)
    console.log('Code:', err.code)
  })
}
```

## Testing

```typescript
import { describe, it, expect } from 'vitest'
import { customerInfoSchema } from '@/lib/validations/checkout'

describe('customerInfoSchema', () => {
  it('should validate correct customer info', () => {
    const validData = {
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '555-123-4567',
    }

    const result = customerInfoSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const invalidData = {
      email: 'not-an-email',
      firstName: 'John',
      lastName: 'Doe',
      phone: '555-123-4567',
    }

    const result = customerInfoSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('email')
    }
  })
})
```

## Performance Considerations

- Zod validation is fast (~1ms for typical objects)
- Use schema caching for frequently validated objects
- Consider validation in middleware for API routes
- Validate once at entry points, not repeatedly

## Migration Guide

If you have existing TypeScript interfaces:

```typescript
// Old way
interface CustomerInfo {
  email: string
  firstName: string
  lastName: string
}

// New way - schema with validation
import { customerInfoSchema, type CustomerInfo } from '@/lib/validations/checkout'

// Type is inferred, plus you get runtime validation
const result = customerInfoSchema.safeParse(data)
```

## Resources

- [Zod Documentation](https://zod.dev)
- [Zod Error Map](https://zod.dev/ERROR_HANDLING)
- [Type Inference Guide](https://zod.dev/?id=type-inference)
