import { Page, expect } from '@playwright/test'
import { randomUUID } from 'crypto'

export interface EntityTestConfig {
  name: string
  route: string
  apiEndpoint: string
  hasComplexRelationships: boolean
  createFields: Record<string, any>
  updateFields: Record<string, any>
  requiredFields: string[]
  uniqueFields: string[]
}

export const ADMIN_ENTITIES: Record<string, EntityTestConfig> = {
  products: {
    name: 'Products',
    route: '/admin/products',
    apiEndpoint: '/api/products',
    hasComplexRelationships: true,
    createFields: {
      name: 'Test Product',
      sku: 'TEST-SKU',
      categoryId: 'default-category',
      description: 'Test product description',
      basePrice: 10.0,
    },
    updateFields: {
      name: 'Updated Test Product',
      description: 'Updated description',
      basePrice: 15.0,
    },
    requiredFields: ['name', 'sku', 'categoryId'],
    uniqueFields: ['sku'],
  },
  categories: {
    name: 'Categories',
    route: '/admin/categories',
    apiEndpoint: '/api/product-categories',
    hasComplexRelationships: false,
    createFields: {
      name: 'Test Category',
      slug: 'test-category',
      description: 'Test category description',
      sortOrder: 1,
    },
    updateFields: {
      name: 'Updated Test Category',
      description: 'Updated description',
      sortOrder: 2,
    },
    requiredFields: ['name', 'slug'],
    uniqueFields: ['name', 'slug'],
  },
  paperStocks: {
    name: 'Paper Stocks',
    route: '/admin/paper-stocks',
    apiEndpoint: '/api/paper-stocks',
    hasComplexRelationships: true,
    createFields: {
      name: 'Test Paper Stock',
      pricePerSqInch: 0.001,
      weight: 0.0015,
      tooltipText: 'Test paper stock',
    },
    updateFields: {
      name: 'Updated Paper Stock',
      pricePerSqInch: 0.002,
      weight: 0.002,
    },
    requiredFields: ['name'],
    uniqueFields: ['name'],
  },
  paperStockSets: {
    name: 'Paper Stock Sets',
    route: '/admin/paper-stock-sets',
    apiEndpoint: '/api/paper-stock-sets',
    hasComplexRelationships: true,
    createFields: {
      name: 'Test Paper Stock Set',
      description: 'Test paper stock set description',
      sortOrder: 1,
    },
    updateFields: {
      name: 'Updated Paper Stock Set',
      description: 'Updated description',
      sortOrder: 2,
    },
    requiredFields: ['name'],
    uniqueFields: ['name'],
  },
  quantities: {
    name: 'Quantities',
    route: '/admin/quantities',
    apiEndpoint: '/api/quantities',
    hasComplexRelationships: false,
    createFields: {
      displayValue: 100,
      calculationValue: 100,
      adjustmentValue: 0,
      sortOrder: 1,
    },
    updateFields: {
      displayValue: 200,
      calculationValue: 200,
      adjustmentValue: 5,
    },
    requiredFields: ['displayValue', 'calculationValue'],
    uniqueFields: ['displayValue'],
  },
  sizes: {
    name: 'Sizes',
    route: '/admin/sizes',
    apiEndpoint: '/api/sizes',
    hasComplexRelationships: false,
    createFields: {
      name: 'Test Size',
      displayName: 'Test Size Display',
      width: 8.5,
      height: 11,
      preCalculatedValue: 93.5,
      sortOrder: 1,
    },
    updateFields: {
      name: 'Updated Test Size',
      displayName: 'Updated Display',
      width: 11,
      height: 17,
    },
    requiredFields: ['name', 'displayName', 'width', 'height'],
    uniqueFields: ['name'],
  },
  addOns: {
    name: 'Add-ons',
    route: '/admin/add-ons',
    apiEndpoint: '/api/add-ons',
    hasComplexRelationships: true,
    createFields: {
      name: 'Test Add-on',
      description: 'Test add-on description',
      pricingModel: 'FLAT',
      configuration: {},
      additionalTurnaroundDays: 0,
      sortOrder: 1,
    },
    updateFields: {
      name: 'Updated Add-on',
      description: 'Updated description',
      additionalTurnaroundDays: 1,
    },
    requiredFields: ['name', 'pricingModel'],
    uniqueFields: ['name'],
  },
  addOnSets: {
    name: 'Add-on Sets',
    route: '/admin/addon-sets',
    apiEndpoint: '/api/addon-sets',
    hasComplexRelationships: true,
    createFields: {
      name: 'Test Add-on Set',
      description: 'Test add-on set description',
      sortOrder: 1,
    },
    updateFields: {
      name: 'Updated Add-on Set',
      description: 'Updated description',
      sortOrder: 2,
    },
    requiredFields: ['name'],
    uniqueFields: ['name'],
  },
  turnaroundTimes: {
    name: 'Turnaround Times',
    route: '/admin/turnaround-times',
    apiEndpoint: '/api/turnaround-times',
    hasComplexRelationships: false,
    createFields: {
      name: 'test-turnaround',
      displayName: 'Test Turnaround',
      description: 'Test turnaround time',
      daysMin: 1,
      daysMax: 3,
      pricingModel: 'FLAT',
      basePrice: 10.0,
      priceMultiplier: 1.0,
      sortOrder: 1,
    },
    updateFields: {
      name: 'updated-turnaround',
      displayName: 'Updated Turnaround',
      description: 'Updated description',
      basePrice: 15.0,
    },
    requiredFields: ['name', 'displayName', 'daysMin', 'pricingModel'],
    uniqueFields: ['name'],
  },
  turnaroundTimeSets: {
    name: 'Turnaround Time Sets',
    route: '/admin/turnaround-time-sets',
    apiEndpoint: '/api/turnaround-time-sets',
    hasComplexRelationships: true,
    createFields: {
      name: 'Test Turnaround Time Set',
      description: 'Test turnaround time set description',
      sortOrder: 1,
    },
    updateFields: {
      name: 'Updated Turnaround Time Set',
      description: 'Updated description',
      sortOrder: 2,
    },
    requiredFields: ['name'],
    uniqueFields: ['name'],
  },
}

/**
 * Setup admin authentication for tests
 */
export async function setupAdminAuth(page: Page) {
  // Mock admin authentication
  await page.route('**/api/auth/me', (route) => {
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: 'admin-user-id',
          email: 'admin@gangrunprinting.com',
          name: 'Test Admin',
          role: 'ADMIN',
        },
      }),
    })
  })

  // Set admin session cookie
  await page.context().addCookies([
    {
      name: 'auth_session',
      value: 'admin-session-id',
      domain: 'localhost',
      path: '/',
    },
  ])
}

/**
 * Generate unique test data for an entity
 */
export function generateTestData(entityKey: string): Record<string, any> {
  const config = ADMIN_ENTITIES[entityKey]
  const testData = { ...config.createFields }

  // Add unique suffixes to unique fields
  const uniqueSuffix = randomUUID().substring(0, 8)
  config.uniqueFields.forEach((field) => {
    if (testData[field] && typeof testData[field] === 'string') {
      testData[field] = `${testData[field]}-${uniqueSuffix}`
    }
  })

  return testData
}

/**
 * Create an entity via API
 */
export async function createEntityViaAPI(
  page: Page,
  entityKey: string,
  data?: Record<string, any>
): Promise<{ id: string; data: Record<string, any> }> {
  const config = ADMIN_ENTITIES[entityKey]
  const testData = data || generateTestData(entityKey)

  const response = await page.request.post(config.apiEndpoint, {
    data: testData,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  expect(response.status()).toBe(201)
  const result = await response.json()

  return {
    id: result.id,
    data: result,
  }
}

/**
 * Get entity via API
 */
export async function getEntityViaAPI(
  page: Page,
  entityKey: string,
  id: string
): Promise<Record<string, any>> {
  const config = ADMIN_ENTITIES[entityKey]

  const response = await page.request.get(`${config.apiEndpoint}/${id}`)
  expect(response.status()).toBe(200)

  return await response.json()
}

/**
 * Update entity via API
 */
export async function updateEntityViaAPI(
  page: Page,
  entityKey: string,
  id: string,
  updateData?: Record<string, any>
): Promise<Record<string, any>> {
  const config = ADMIN_ENTITIES[entityKey]
  const testData = updateData || config.updateFields

  const response = await page.request.put(`${config.apiEndpoint}/${id}`, {
    data: testData,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  expect(response.status()).toBe(200)
  return await response.json()
}

/**
 * Delete entity via API
 */
export async function deleteEntityViaAPI(page: Page, entityKey: string, id: string): Promise<void> {
  const config = ADMIN_ENTITIES[entityKey]

  const response = await page.request.delete(`${config.apiEndpoint}/${id}`)
  expect(response.status()).toBe(200)
}

/**
 * Duplicate entity via API
 */
export async function duplicateEntityViaAPI(
  page: Page,
  entityKey: string,
  id: string
): Promise<Record<string, any>> {
  const config = ADMIN_ENTITIES[entityKey]

  const response = await page.request.post(`${config.apiEndpoint}/${id}/duplicate`, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  expect(response.status()).toBe(200)
  return await response.json()
}

/**
 * Navigate to admin entity page
 */
export async function navigateToAdminPage(page: Page, entityKey: string) {
  const config = ADMIN_ENTITIES[entityKey]
  await page.goto(config.route)
  await page.waitForLoadState('networkidle')
}

/**
 * Wait for entity list to load
 */
export async function waitForEntityList(page: Page) {
  // Wait for the main content area to load
  await page.waitForSelector('[data-testid="entity-list"], table, .grid', {
    timeout: 10000,
  })
}

/**
 * Fill entity form fields
 */
export async function fillEntityForm(page: Page, data: Record<string, any>) {
  for (const [field, value] of Object.entries(data)) {
    const input = page.locator(`[name="${field}"], [data-testid="${field}"]`).first()

    if (await input.isVisible()) {
      if (typeof value === 'boolean') {
        if (value) {
          await input.check()
        } else {
          await input.uncheck()
        }
      } else {
        await input.fill(String(value))
      }
    }
  }
}

/**
 * Submit entity form
 */
export async function submitEntityForm(page: Page) {
  await page.locator('button[type="submit"], [data-testid="submit"]').click()
  await page.waitForLoadState('networkidle')
}

/**
 * Verify entity exists in list
 */
export async function verifyEntityInList(page: Page, entityKey: string, searchText: string) {
  const config = ADMIN_ENTITIES[entityKey]
  await navigateToAdminPage(page, entityKey)
  await waitForEntityList(page)

  // Search for the entity
  const searchBox = page.locator('input[placeholder*="Search"], input[type="search"]').first()
  if (await searchBox.isVisible()) {
    await searchBox.fill(searchText)
    await page.waitForTimeout(1000) // Wait for search results
  }

  // Verify entity appears in list
  await expect(page.locator('text=' + searchText).first()).toBeVisible()
}

/**
 * Clean up test entities
 */
export async function cleanupTestEntities(page: Page, entityKey: string, searchPattern: string) {
  try {
    const config = ADMIN_ENTITIES[entityKey]

    // Get all entities matching the test pattern
    const response = await page.request.get(config.apiEndpoint)
    if (response.status() === 200) {
      const entities = await response.json()

      for (const entity of entities) {
        if (entity.name && entity.name.includes(searchPattern)) {
          await deleteEntityViaAPI(page, entityKey, entity.id)
        }
      }
    }
  } catch (error) {
    console.warn(`Cleanup failed for ${entityKey}:`, error)
  }
}
