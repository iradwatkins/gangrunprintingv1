const { PrismaClient } = require('@prisma/client')
const { createId } = require('@paralleldrive/cuid2')

const prisma = new PrismaClient()

async function createTestOrder() {
  console.log('Creating test order with cash payment...')

  // Check if user exists
  let user = await prisma.user.findUnique({
    where: { email: 'iradwatkins@gmail.com' },
  })

  // Create user if not exists
  if (!user) {
    console.log('User not found, creating...')
    user = await prisma.user.create({
      data: {
        id: createId(),
        email: 'iradwatkins@gmail.com',
        name: 'Ira Watkins',
        role: 'CUSTOMER',
        emailVerified: true,
        updatedAt: new Date(),
      },
    })
    console.log('User created:', user.id)
  } else {
    console.log('User exists:', user.id)
  }

  // Get product
  const product = await prisma.product.findFirst()
  if (!product) {
    throw new Error('No product found')
  }
  console.log('Product found:', product.name)

  // Create order
  const orderNumber = `ORD-${Date.now()}`
  const order = await prisma.order.create({
    data: {
      id: createId(),
      orderNumber: orderNumber,
      userId: user.id,
      email: user.email,
      phone: '555-0123',
      status: 'PAID',
      subtotal: 49.99,
      shipping: 9.99,
      tax: 5.39,
      total: 65.37,
      shippingMethod: 'STANDARD',
      shippingAddress: {
        name: 'Ira Watkins',
        street: '123 Test Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'US',
      },
      billingAddress: {
        name: 'Ira Watkins',
        street: '123 Test Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'US',
      },
      paidAt: new Date(),
      updatedAt: new Date(),
      OrderItem: {
        create: {
          id: createId(),
          productName: product.name,
          productSku: product.sku,
          quantity: 500,
          price: 49.99,
          options: {
            paperStock: '9pt C2S Cardstock',
            finish: 'Glossy',
            paymentMethod: 'CASH',
          },
        },
      },
    },
    include: {
      OrderItem: true,
      User: true,
    },
  })

  console.log('\\n✅ TEST ORDER CREATED SUCCESSFULLY!')
  console.log('========================================')
  console.log('Order Number:', order.orderNumber)
  console.log('Order ID:', order.id)
  console.log('Customer Email:', order.email)
  console.log('Customer Name:', order.User.name)
  console.log('Payment Method: CASH')
  console.log('Status:', order.status)
  console.log('Subtotal: $' + order.subtotal.toFixed(2))
  console.log('Shipping: $' + order.shipping.toFixed(2))
  console.log('Tax: $' + order.tax.toFixed(2))
  console.log('Total: $' + order.total.toFixed(2))
  console.log('========================================')
  console.log('\\nOrder Items:')
  order.OrderItem.forEach((item, i) => {
    console.log(`  ${i + 1}. ${item.productName}`)
    console.log(`     SKU: ${item.productSku}`)
    console.log(`     Quantity: ${item.quantity}`)
    console.log(`     Price: $${item.price}`)
    console.log(`     Options:`, JSON.stringify(item.options, null, 2))
  })
  console.log('========================================')
  console.log('\\n📧 Order confirmation email should be sent to:', order.email)

  await prisma.$disconnect()
  return order
}

createTestOrder().catch((error) => {
  console.error('❌ Error creating test order:', error.message)
  process.exit(1)
})
