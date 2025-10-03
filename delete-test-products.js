#!/usr/bin/env node

/**
 * Delete all test products from the database
 * This script removes products with test/dummy data
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function deleteTestProducts() {
  console.log('🧹 Cleaning up test products from production...\n')
  
  try {
    // Find test products (products with test-like names/slugs)
    const testProducts = await prisma.product.findMany({
      where: {
        OR: [
          { slug: { contains: 'test' } },
          { name: { in: ['adsfasd', 'test', 'asdfasd'] } },
          { sku: { in: ['asdfasd', 'test', 'TEST'] } },
          { description: { in: ['asdfas', 'test', null] } }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true
      }
    })
    
    if (testProducts.length === 0) {
      console.log('✅ No test products found. Database is clean!')
      return
    }
    
    console.log(`Found ${testProducts.length} test product(s) to delete:`)
    testProducts.forEach(p => {
      console.log(`  - ${p.name} (SKU: ${p.sku}, Slug: ${p.slug})`)
    })
    
    console.log('\n🗑️  Deleting test products...')
    
    // Delete each test product
    for (const product of testProducts) {
      await prisma.product.delete({
        where: { id: product.id }
      })
      console.log(`  ✅ Deleted: ${product.name}`)
    }
    
    console.log(`\n✅ Successfully deleted ${testProducts.length} test product(s)`)
    
    // Show remaining products
    const remainingProducts = await prisma.product.count()
    console.log(`\n📦 Remaining products in database: ${remainingProducts}`)
    
    if (remainingProducts === 0) {
      console.log('\n⚠️  Warning: No products left in database!')
      console.log('👉 Please add real products via the admin panel:')
      console.log('   https://gangrunprinting.com/admin/products/new')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
deleteTestProducts()