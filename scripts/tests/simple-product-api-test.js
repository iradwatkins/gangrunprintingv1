#!/usr/bin/env node

/**
 * Simple Product Creation API Test
 * Direct API calls with valid database IDs
 */

const { PrismaClient } = require('@prisma/client')
const { Lucia } = require('lucia')
const { PrismaAdapter } = require('@lucia-auth/adapter-prisma')

const prisma = new PrismaClient()

async function createProducts() {
  console.log('🚀 DIRECT API PRODUCT CREATION TEST')
  console.log('=====================================\n')

  try {
    // Create authentication session
    console.log('🔑 Creating admin authentication...')
    const adapter = new PrismaAdapter(prisma.session, prisma.user)
    const lucia = new Lucia(adapter, {
      sessionCookie: { attributes: { secure: process.env.NODE_ENV === 'production' } },
      getUserAttributes: (attributes) => ({
        email: attributes.email,
        name: attributes.name,
        role: attributes.role,
        emailVerified: attributes.emailVerified,
      }),
    })

    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
    if (!adminUser) {
      throw new Error('No admin user found')
    }

    const session = await lucia.createSession(adminUser.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    console.log('   ✅ Admin session created\n')

    // Verified valid IDs from database
    const validData = {
      paperStockId: 'cmfmved0f000013pxt2616umy', // 16pt C2S Cardstock
      quantityGroupId: 'cmfk2y9d0000u10ij4f2rvy3g', // Business Card Quantities
      sizeGroupId: 'cmfk2y9bs000k10ij4vmmgkgf', // Business Card Sizes
      categoryId: 'business-cards', // Business Cards
    }

    // Test products to create
    const products = [
      {
        name: 'Premium Business Cards',
        sku: 'premium-business-cards',
        description: 'High-quality business cards with premium finish',
        categoryId: validData.categoryId,
        selectedPaperStocks: [validData.paperStockId],
        defaultPaperStock: validData.paperStockId,
        selectedQuantityGroup: validData.quantityGroupId,
        selectedSizeGroup: validData.sizeGroupId,
        basePrice: 29.99,
        setupFee: 15.0,
        productionTime: 3,
        isActive: true,
      },
      {
        name: 'Full-Color Flyers',
        sku: 'full-color-flyers',
        description: 'Vibrant full-color flyers for marketing campaigns',
        categoryId: validData.categoryId,
        selectedPaperStocks: [validData.paperStockId],
        defaultPaperStock: validData.paperStockId,
        selectedQuantityGroup: validData.quantityGroupId,
        selectedSizeGroup: validData.sizeGroupId,
        basePrice: 49.99,
        setupFee: 25.0,
        productionTime: 5,
        isActive: true,
      },
      {
        name: 'Glossy Postcards',
        sku: 'glossy-postcards',
        description: 'Professional glossy postcards for direct mail',
        categoryId: validData.categoryId,
        selectedPaperStocks: [validData.paperStockId],
        defaultPaperStock: validData.paperStockId,
        selectedQuantityGroup: validData.quantityGroupId,
        selectedSizeGroup: validData.sizeGroupId,
        basePrice: 39.99,
        setupFee: 20.0,
        productionTime: 4,
        isActive: true,
      },
      {
        name: 'Large Format Posters',
        sku: 'large-format-posters',
        description: 'Eye-catching large format posters for events',
        categoryId: validData.categoryId,
        selectedPaperStocks: [validData.paperStockId],
        defaultPaperStock: validData.paperStockId,
        selectedQuantityGroup: validData.quantityGroupId,
        selectedSizeGroup: validData.sizeGroupId,
        basePrice: 79.99,
        setupFee: 35.0,
        productionTime: 7,
        isActive: true,
      },
    ]

    // Create products using direct API calls
    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      console.log(`📦 Creating Product ${i + 1}: ${product.name}`)

      try {
        const response = await fetch('https://gangrunprinting.com/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: `${sessionCookie.name}=${sessionCookie.value}`,
            Accept: 'application/json',
          },
          body: JSON.stringify(product),
        })

        if (response.ok) {
          const data = await response.json()
          console.log(`   ✅ Product created successfully! ID: ${data.id}`)
        } else {
          const errorData = await response.json().catch(() => ({}))
          console.log(
            `   ❌ Failed (${response.status}): ${errorData.error || errorData.details || 'Unknown error'}`
          )

          if (errorData.details) {
            console.log(`   📋 Details: ${errorData.details}`)
          }
        }
      } catch (error) {
        console.log(`   ❌ Request failed: ${error.message}`)
      }

      console.log('') // Empty line
    }
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`)
  } finally {
    await prisma.$disconnect()
  }
}

createProducts().catch(console.error)
