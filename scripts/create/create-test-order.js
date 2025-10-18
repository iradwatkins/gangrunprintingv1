/**
 * Create Test Order for Bobby Watkins
 * Simulates a complete order with real data to test admin panel
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestOrder() {
  console.log('🛒 Creating test order for Bobby Watkins...\n')

  try {
    // 1. Find Bobby Watkins
    const bobby = await prisma.user.findUnique({
      where: { email: 'appvillagellc@gmail.com' },
    })

    if (!bobby) {
      throw new Error('Bobby Watkins not found')
    }
    console.log(`✅ Found customer: ${bobby.name} (${bobby.email})`)

    // 2. Find Premium Business Cards product
    const product = await prisma.product.findFirst({
      where: { slug: 'premium-business-cards' },
      include: {
        pricingTiers: true,
        productCategory: true,
      },
    })

    if (!product) {
      throw new Error('Premium Business Cards product not found')
    }
    console.log(`✅ Found product: ${product.name} - $${product.basePrice}`)

    // 3. Find paper stock (16pt Coated Gloss)
    const paperStock = await prisma.paperStock.findFirst({
      where: { name: '16pt Coated Gloss' },
    })

    // 4. Generate order number
    const orderNumber = `GRP-${Date.now().toString().slice(-6)}`

    // 5. Calculate pricing for 1000 quantity
    const quantity = 1000
    const tier = product.pricingTiers.find(
      (t) => quantity >= t.minQuantity && (!t.maxQuantity || quantity <= t.maxQuantity)
    )
    const unitPrice = tier ? tier.unitPrice : product.basePrice / 500 // fallback
    const productTotal = quantity * unitPrice

    // 6. Add-on calculations
    const rushProduction = productTotal * 0.5 // 50% surcharge
    const uvCoating = quantity * 3.5 * 0.15 // 3.5" x 2" = 7 sq inches * $0.15
    const roundedCorners = 15 // flat fee
    const dieCutting = 45 // custom pricing for circle

    const subtotal = productTotal + rushProduction + uvCoating + roundedCorners + dieCutting
    const taxRate = 0.1025 // Chicago, IL tax rate
    const tax = subtotal * taxRate
    const shipping = 12.5
    const total = subtotal + tax + shipping

    // 7. Create the order
    const order = await prisma.order.create({
      data: {
        orderNumber: orderNumber,
        userId: bobby.id,
        email: bobby.email,
        phone: bobby.phoneNumber,
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        shipping: shipping,
        total: parseFloat(total.toFixed(2)),
        status: 'PAID',
        paidAt: new Date(),
        squarePaymentId: `sqr_test_${Date.now()}`,
        squareOrderId: `sqr_order_${Date.now()}`,
        shippingAddress: {
          name: bobby.name,
          company: 'AppVillage LLC',
          address: '2740 W 83rd Pl',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60652',
          country: 'US',
        },
        billingAddress: {
          name: bobby.name,
          company: 'AppVillage LLC',
          address: '2740 W 83rd Pl',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60652',
          country: 'US',
        },
        adminNotes: 'Test order created with all add-ons for demonstration',
      },
    })

    console.log(`✅ Created order: ${order.orderNumber}`)

    // 8. Create order item
    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: order.id,
        quantity: quantity,
        price: productTotal,
        productName: product.name,
        productSku: product.sku,
        paperStockId: paperStock?.id,
        options: {
          size: '3.5" x 2"',
          paperStock: paperStock?.name || '16pt Coated Gloss',
          sides: 'Double Sided (4/4)',
          coating: 'Gloss',
          finish: 'Standard',
        },
        dimensions: {
          width: 3.5,
          height: 2,
          area: 7,
        },
        calculatedWeight: quantity * (paperStock?.weight || 0.016),
      },
    })

    console.log(`✅ Created order item: ${orderItem.productName} (${orderItem.quantity} qty)`)

    // 9. Create add-on records (if add-ons exist)
    try {
      const addOns = await prisma.addOn.findMany({
        where: {
          name: {
            in: ['Rush Production', 'UV Spot Coating', 'Rounded Corners', 'Die Cutting'],
          },
        },
      })

      for (const addOn of addOns) {
        let calculatedPrice = 0
        let configuration = {}

        switch (addOn.name) {
          case 'Rush Production':
            calculatedPrice = rushProduction
            configuration = { percentage: 50 }
            break
          case 'UV Spot Coating':
            calculatedPrice = uvCoating
            configuration = {
              pricePerSqInch: 0.15,
              area: 7,
              coverage: 'Logo Only',
              thickness: 'Thick (2 mil)',
            }
            break
          case 'Rounded Corners':
            calculatedPrice = roundedCorners
            configuration = { flatFee: 15 }
            break
          case 'Die Cutting':
            calculatedPrice = dieCutting
            configuration = {
              basePrice: 45,
              shape: 'Circle',
              complexity: 1,
            }
            break
        }

        await prisma.orderItemAddOn.create({
          data: {
            orderItemId: orderItem.id,
            addOnId: addOn.id,
            configuration: configuration,
            calculatedPrice: calculatedPrice,
          },
        })

        console.log(`✅ Added add-on: ${addOn.name} (+$${calculatedPrice.toFixed(2)})`)
      }
    } catch (addOnError) {
      console.log('⚠️  Add-ons not found, continuing without them')
    }

    // 10. Create status history
    await prisma.statusHistory.create({
      data: {
        orderId: order.id,
        fromStatus: 'PENDING_PAYMENT',
        toStatus: 'PAID',
        notes: 'Test order payment processed successfully',
        changedBy: bobby.id,
      },
    })

    console.log(`✅ Created status history`)

    // 11. Summary
    console.log('\n📊 ORDER SUMMARY:')
    console.log(`Order Number: ${order.orderNumber}`)
    console.log(`Customer: ${bobby.name} (${bobby.email})`)
    console.log(`Product: ${product.name}`)
    console.log(`Quantity: ${quantity}`)
    console.log(`Paper Stock: ${paperStock?.name || '16pt Coated Gloss'}`)
    console.log(`\nPRICING BREAKDOWN:`)
    console.log(`Product (${quantity} @ $${unitPrice}): $${productTotal.toFixed(2)}`)
    console.log(`Rush Production (+50%): $${rushProduction.toFixed(2)}`)
    console.log(`UV Spot Coating: $${uvCoating.toFixed(2)}`)
    console.log(`Rounded Corners: $${roundedCorners.toFixed(2)}`)
    console.log(`Die Cutting: $${dieCutting.toFixed(2)}`)
    console.log(`Subtotal: $${subtotal.toFixed(2)}`)
    console.log(`Tax (10.25%): $${tax.toFixed(2)}`)
    console.log(`Shipping: $${shipping.toFixed(2)}`)
    console.log(`TOTAL: $${total.toFixed(2)}`)
    console.log(`\nStatus: PAID`)
    console.log(`Payment ID: ${order.squarePaymentId}`)

    console.log('\n🎉 Test order created successfully!')
    console.log(`\n👀 View in admin panel: https://gangrunprinting.com/admin/orders`)
    console.log(`📋 Order details: https://gangrunprinting.com/admin/orders/${order.id}`)
  } catch (error) {
    console.error('❌ Error creating test order:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createTestOrder()
  .then(() => {
    console.log('\n✅ Test order creation completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Test order creation failed:', error.message)
    process.exit(1)
  })
