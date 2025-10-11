import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Example script: Mark Corner Rounding as mandatory for a specific product
 *
 * Usage:
 * npx tsx scripts/set-addon-mandatory.ts <productId> <addonName> <true|false>
 *
 * Example:
 * npx tsx scripts/set-addon-mandatory.ts abc123 "Corner Rounding" true
 */

async function setAddonMandatory() {
  try {
    const productId = process.argv[2]
    const addonName = process.argv[3]
    const isMandatory = process.argv[4] === 'true'

    if (!productId || !addonName) {
      console.log(
        '❌ Usage: npx tsx scripts/set-addon-mandatory.ts <productId> <addonName> <true|false>'
      )
      console.log('')
      console.log('Example: npx tsx scripts/set-addon-mandatory.ts abc123 "Corner Rounding" true')
      process.exit(1)
    }

    console.log('\n🔧 Setting addon mandatory status...\n')

    // Find the addon by name
    const addon = await prisma.addOn.findFirst({
      where: { name: addonName },
    })

    if (!addon) {
      console.error(`❌ Addon "${addonName}" not found`)
      process.exit(1)
    }

    // Find the product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { name: true },
    })

    if (!product) {
      console.error(`❌ Product with ID "${productId}" not found`)
      process.exit(1)
    }

    console.log(`Product: ${product.name}`)
    console.log(`Addon: ${addon.name}`)
    console.log(`Setting mandatory: ${isMandatory}`)
    console.log('')

    // Upsert ProductAddOn relationship
    const productAddOn = await prisma.productAddOn.upsert({
      where: {
        productId_addOnId: {
          productId,
          addOnId: addon.id,
        },
      },
      create: {
        productId,
        addOnId: addon.id,
        isMandatory,
      },
      update: {
        isMandatory,
      },
    })

    console.log('✅ Success!')
    console.log('')
    console.log('Result:')
    console.log(`  - Product ID: ${productAddOn.productId}`)
    console.log(`  - Addon ID: ${productAddOn.addOnId}`)
    console.log(`  - Is Mandatory: ${productAddOn.isMandatory}`)
    console.log('')
    console.log('This addon will now be:')
    if (isMandatory) {
      console.log('  ✓ Pre-selected for customers')
      console.log('  ✓ Disabled (cannot be unchecked)')
      console.log('  ✓ Shows "Included" badge')
      console.log('  ✓ Price already reflected in product')
    } else {
      console.log('  ✓ Optional for customers')
      console.log('  ✓ Can be selected/deselected')
    }
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

setAddonMandatory()
