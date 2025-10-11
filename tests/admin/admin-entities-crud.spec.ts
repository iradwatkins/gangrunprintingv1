import { test, expect } from '@playwright/test'
import {
  setupAdminAuth,
  ADMIN_ENTITIES,
  createEntityViaAPI,
  getEntityViaAPI,
  updateEntityViaAPI,
  deleteEntityViaAPI,
  duplicateEntityViaAPI,
  generateTestData,
  navigateToAdminPage,
  waitForEntityList,
  fillEntityForm,
  submitEntityForm,
  verifyEntityInList,
  cleanupTestEntities,
} from '../utils/admin-test-helpers'

test.describe('Admin Entities CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await setupAdminAuth(page)
  })

  // Test each entity individually
  Object.entries(ADMIN_ENTITIES).forEach(([entityKey, config]) => {
    test.describe(`${config.name} Entity Tests`, () => {
      let createdEntityId: string
      const testIdentifier = `test-${Date.now()}`

      test.afterEach(async ({ page }) => {
        // Clean up created entities
        await cleanupTestEntities(page, entityKey, testIdentifier)
      })

      test(`should create ${config.name.toLowerCase()} via API`, async ({ page }) => {
        const testData = generateTestData(entityKey)

        // Add test identifier to name field for cleanup
        if (testData.name) {
          testData.name = `${testData.name}-${testIdentifier}`
        }

        const result = await createEntityViaAPI(page, entityKey, testData)

        expect(result.id).toBeTruthy()
        expect(result.data).toBeTruthy()

        // Verify required fields are saved
        config.requiredFields.forEach((field) => {
          expect(result.data[field]).toBeTruthy()
        })

        createdEntityId = result.id
      })

      test(`should retrieve ${config.name.toLowerCase()} via API`, async ({ page }) => {
        // First create an entity
        const testData = generateTestData(entityKey)
        if (testData.name) {
          testData.name = `${testData.name}-${testIdentifier}`
        }

        const created = await createEntityViaAPI(page, entityKey, testData)

        // Then retrieve it
        const retrieved = await getEntityViaAPI(page, entityKey, created.id)

        expect(retrieved.id).toBe(created.id)

        // Verify all created fields are retrieved
        config.requiredFields.forEach((field) => {
          expect(retrieved[field]).toBeTruthy()
        })

        createdEntityId = created.id
      })

      test(`should update ${config.name.toLowerCase()} via API`, async ({ page }) => {
        // First create an entity
        const testData = generateTestData(entityKey)
        if (testData.name) {
          testData.name = `${testData.name}-${testIdentifier}`
        }

        const created = await createEntityViaAPI(page, entityKey, testData)

        // Then update it
        const updateData = { ...config.updateFields }
        if (updateData.name) {
          updateData.name = `${updateData.name}-${testIdentifier}`
        }

        const updated = await updateEntityViaAPI(page, entityKey, created.id, updateData)

        expect(updated.id).toBe(created.id)

        // Verify updated fields
        Object.keys(updateData).forEach((field) => {
          if (updateData[field] !== undefined) {
            expect(updated[field]).toBe(updateData[field])
          }
        })

        createdEntityId = created.id
      })

      test(`should duplicate ${config.name.toLowerCase()} via API`, async ({ page }) => {
        // First create an entity
        const testData = generateTestData(entityKey)
        if (testData.name) {
          testData.name = `${testData.name}-${testIdentifier}`
        }

        const created = await createEntityViaAPI(page, entityKey, testData)

        // Then duplicate it
        const duplicated = await duplicateEntityViaAPI(page, entityKey, created.id)

        expect(duplicated.id).toBeTruthy()
        expect(duplicated.id).not.toBe(created.id)

        // Verify duplicated entity has copied data
        if (duplicated.name) {
          expect(duplicated.name).toContain('Copy')
        }

        // Clean up both entities
        await deleteEntityViaAPI(page, entityKey, created.id)
        await deleteEntityViaAPI(page, entityKey, duplicated.id)
      })

      test(`should delete ${config.name.toLowerCase()} via API`, async ({ page }) => {
        // First create an entity
        const testData = generateTestData(entityKey)
        if (testData.name) {
          testData.name = `${testData.name}-${testIdentifier}`
        }

        const created = await createEntityViaAPI(page, entityKey, testData)

        // Then delete it
        await deleteEntityViaAPI(page, entityKey, created.id)

        // Verify it's deleted by trying to retrieve it
        const response = await page.request.get(`${config.apiEndpoint}/${created.id}`)
        expect(response.status()).toBe(404)
      })

      test(`should handle ${config.name.toLowerCase()} admin UI navigation`, async ({ page }) => {
        await navigateToAdminPage(page, entityKey)

        // Verify page loads correctly
        await expect(page).toHaveTitle(new RegExp(config.name, 'i'))

        // Wait for entity list to load
        await waitForEntityList(page)

        // Verify admin navigation elements
        await expect(page.locator('nav, [data-testid="admin-nav"]')).toBeVisible()
      })

      test(`should create ${config.name.toLowerCase()} via UI form`, async ({ page }) => {
        await navigateToAdminPage(page, entityKey)
        await waitForEntityList(page)

        // Look for "New", "Add", or "Create" button
        const createButton = page
          .locator(
            'button:has-text("New"), button:has-text("Add"), button:has-text("Create"), [data-testid="create-button"]'
          )
          .first()

        if (await createButton.isVisible()) {
          await createButton.click()

          // Fill form with test data
          const testData = generateTestData(entityKey)
          if (testData.name) {
            testData.name = `${testData.name}-${testIdentifier}-ui`
          }

          await fillEntityForm(page, testData)
          await submitEntityForm(page)

          // Verify success (look for success message or redirect)
          await page.waitForLoadState('networkidle')

          // Verify entity appears in list
          if (testData.name) {
            await verifyEntityInList(page, entityKey, testData.name)
          }
        } else {
          test.skip('No create button found - UI create test skipped')
        }
      })

      test(`should validate required fields for ${config.name.toLowerCase()}`, async ({ page }) => {
        const response = await page.request.post(config.apiEndpoint, {
          data: {}, // Empty data to trigger validation
          headers: {
            'Content-Type': 'application/json',
          },
        })

        // Should return validation error
        expect(response.status()).toBe(400)

        const error = await response.json()
        expect(error.error || error.message).toBeTruthy()
      })

      if (config.uniqueFields.length > 0) {
        test(`should enforce unique constraints for ${config.name.toLowerCase()}`, async ({
          page,
        }) => {
          const testData = generateTestData(entityKey)
          if (testData.name) {
            testData.name = `${testData.name}-${testIdentifier}-unique`
          }

          // Create first entity
          const created = await createEntityViaAPI(page, entityKey, testData)
          createdEntityId = created.id

          // Try to create duplicate with same unique field values
          const response = await page.request.post(config.apiEndpoint, {
            data: testData,
            headers: {
              'Content-Type': 'application/json',
            },
          })

          // Should return conflict error
          expect(response.status()).toBe(400)
        })
      }
    })
  })

  test.describe('Cross-Entity Integration Tests', () => {
    test('should maintain referential integrity across entities', async ({ page }) => {
      // Test that deleting a referenced entity is handled properly
      // This is a placeholder for more complex integration tests

      // Create a category
      const categoryData = generateTestData('categories')
      categoryData.name = `integration-category-${Date.now()}`
      const category = await createEntityViaAPI(page, 'categories', categoryData)

      // Create a product that references the category
      const productData = generateTestData('products')
      productData.name = `integration-product-${Date.now()}`
      productData.categoryId = category.id
      const product = await createEntityViaAPI(page, 'products', productData)

      // Verify the relationship exists
      const retrievedProduct = await getEntityViaAPI(page, 'products', product.id)
      expect(retrievedProduct.categoryId).toBe(category.id)

      // Clean up
      await deleteEntityViaAPI(page, 'products', product.id)
      await deleteEntityViaAPI(page, 'categories', category.id)
    })

    test('should handle bulk operations performance', async ({ page }) => {
      const testIdentifier = `bulk-test-${Date.now()}`
      const createdEntities: string[] = []

      try {
        // Create multiple entities quickly
        const promises = Array.from({ length: 5 }, async (_, i) => {
          const testData = generateTestData('categories')
          testData.name = `${testData.name}-${testIdentifier}-${i}`
          testData.slug = `${testData.slug}-${testIdentifier}-${i}`

          const result = await createEntityViaAPI(page, 'categories', testData)
          createdEntities.push(result.id)
          return result
        })

        const startTime = Date.now()
        await Promise.all(promises)
        const endTime = Date.now()

        // Should complete within reasonable time (5 seconds for 5 entities)
        expect(endTime - startTime).toBeLessThan(5000)
      } finally {
        // Clean up created entities
        for (const id of createdEntities) {
          try {
            await deleteEntityViaAPI(page, 'categories', id)
          } catch (error) {
            console.warn('Cleanup failed for entity:', id)
          }
        }
      }
    })
  })

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle malformed API requests gracefully', async ({ page }) => {
      const config = ADMIN_ENTITIES['categories']

      // Test with invalid JSON
      const response = await page.request.post(config.apiEndpoint, {
        data: 'invalid-json',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      expect(response.status()).toBe(400)
    })

    test('should handle non-existent entity IDs', async ({ page }) => {
      const config = ADMIN_ENTITIES['categories']
      const fakeId = 'non-existent-id-12345'

      const response = await page.request.get(`${config.apiEndpoint}/${fakeId}`)
      expect(response.status()).toBe(404)
    })

    test('should handle duplicate operations on non-existent entities', async ({ page }) => {
      const config = ADMIN_ENTITIES['categories']
      const fakeId = 'non-existent-id-12345'

      const response = await page.request.post(`${config.apiEndpoint}/${fakeId}/duplicate`)
      expect(response.status()).toBe(404)
    })
  })
})
