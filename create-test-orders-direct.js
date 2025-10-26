/**
 * Direct Test Order Creation - BMAD Method
 *
 * Creates 3 test orders with different configurations
 * Tests the complete order flow from database perspective
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Test customer data
const TEST_CUSTOMER = {
  email: 'test-customer@gangrunprinting.com',
  name: 'Test Customer',
  role: 'CUSTOMER'
};

// Product ID (we know there's only 1 product)
const PRODUCT_ID = 'ac24cea0-bf8d-4f1e-9642-4c9a05033bac';

// Test order configurations
const TEST_ORDERS = [
  {
    name: 'Test Order 1: Standard Configuration',
    config: {
      quantity: 250,
      turnaround: 'Standard (5-7 days)',
      basePrice: 45.00,
      turnaroundPrice: 4.50, // 10% markup
      addons: [],
      totalPrice: 49.50
    },
    shipping: {
      firstName: 'Test',
      lastName: 'Customer One',
      address: '123 Test Street',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75201',
      country: 'US',
      shippingMethod: 'Ground',
      shippingCost: 8.99
    }
  },
  {
    name: 'Test Order 2: Rush with UV Coating',
    config: {
      quantity: 500,
      turnaround: 'Rush (2-3 days)',
      basePrice: 85.00,
      turnaroundPrice: 42.50, // 50% markup for rush
      addons: [
        { name: 'UV Coating', price: 15.00 }
      ],
      totalPrice: 142.50
    },
    shipping: {
      firstName: 'Test',
      lastName: 'Customer Two',
      address: '456 Rush Ave',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      country: 'US',
      shippingMethod: 'Express',
      shippingCost: 24.99
    }
  },
  {
    name: 'Test Order 3: Large Quantity with Multiple Addons',
    config: {
      quantity: 1000,
      turnaround: 'Standard (5-7 days)',
      basePrice: 165.00,
      turnaroundPrice: 16.50, // 10% markup
      addons: [
        { name: 'UV Coating', price: 25.00 },
        { name: 'Round Corners', price: 18.00 }
      ],
      totalPrice: 224.50
    },
    shipping: {
      firstName: 'Test',
      lastName: 'Customer Three',
      address: '789 Bulk Blvd',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      country: 'US',
      shippingMethod: 'Ground',
      shippingCost: 12.99
    }
  }
];

/**
 * Generate unique order number
 */
function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TEST-${timestamp}-${random}`;
}

/**
 * Create or get test customer
 */
async function getTestCustomer() {
  let user = await prisma.user.findUnique({
    where: { email: TEST_CUSTOMER.email }
  });

  if (!user) {
    console.log('Creating test customer...');
    user = await prisma.user.create({
      data: {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        email: TEST_CUSTOMER.email,
        name: TEST_CUSTOMER.name,
        role: TEST_CUSTOMER.role,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    console.log(`✓ Test customer created: ${user.email}`);
  } else {
    console.log(`✓ Using existing test customer: ${user.email}`);
  }

  return user;
}

/**
 * Create a single test order
 */
async function createTestOrder(orderConfig, user, testNumber) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Creating ${orderConfig.name}...`);
  console.log(`${'='.repeat(60)}`);

  const orderNumber = generateOrderNumber();
  const { config, shipping } = orderConfig;

  // Calculate final total
  const addonTotal = config.addons.reduce((sum, addon) => sum + addon.price, 0);
  const subtotal = config.basePrice + config.turnaroundPrice + addonTotal;
  const total = subtotal + shipping.shippingCost;

  // Prepare address objects
  const shippingAddressObj = {
    firstName: shipping.firstName,
    lastName: shipping.lastName,
    address: shipping.address,
    city: shipping.city,
    state: shipping.state,
    zipCode: shipping.zipCode,
    country: shipping.country
  };

  const billingAddressObj = { ...shippingAddressObj };

  // Create order
  const order = await prisma.order.create({
    data: {
      id: `order_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      orderNumber,
      status: 'CONFIRMATION',

      // Pricing
      subtotal,
      shipping: shipping.shippingCost, // Use 'shipping' not 'shippingCost'
      tax: 0,
      total,

      // Addresses as JSON
      shippingAddress: shippingAddressObj,
      billingAddress: billingAddressObj,

      // Contact
      email: user.email,

      // Shipping method
      shippingMethod: shipping.shippingMethod,

      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),

      // User relation
      User: {
        connect: { id: user.id }
      },

      // Order items
      OrderItem: {
        create: {
          id: `item_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          productName: '4x6 Flyers - 9pt Card Stock',
          productSku: '4x6-flyers-9pt-card-stock',
          quantity: config.quantity,
          price: config.basePrice,
          options: {
            quantity: config.quantity,
            turnaround: config.turnaround,
            turnaroundPrice: config.turnaroundPrice,
            addons: config.addons,
            basePrice: config.basePrice,
            totalPrice: config.totalPrice
          },
          createdAt: new Date()
        }
      }
    },
    include: {
      OrderItem: true
    }
  });

  console.log(`✓ Order created: ${orderNumber}`);
  console.log(`  - Product: 4x6 Flyers - 9pt Card Stock`);
  console.log(`  - Quantity: ${config.quantity}`);
  console.log(`  - Turnaround: ${config.turnaround}`);
  console.log(`  - Base Price: $${config.basePrice.toFixed(2)}`);
  console.log(`  - Turnaround Fee: $${config.turnaroundPrice.toFixed(2)}`);

  if (config.addons.length > 0) {
    console.log(`  - Addons:`);
    config.addons.forEach(addon => {
      console.log(`    * ${addon.name}: $${addon.price.toFixed(2)}`);
    });
  }

  console.log(`  - Subtotal: $${subtotal.toFixed(2)}`);
  console.log(`  - Shipping (${shipping.shippingMethod}): $${shipping.shippingCost.toFixed(2)}`);
  console.log(`  - Total: $${total.toFixed(2)}`);
  console.log(`  - Status: ${order.status}`);

  return order;
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Creating Test Orders - BMAD Method\n');
  console.log('📦 Product: 4x6 Flyers - 9pt Card Stock');
  console.log(`🎯 Creating ${TEST_ORDERS.length} test orders\n`);

  try {
    // Get or create test customer
    const user = await getTestCustomer();

    // Create each test order
    const createdOrders = [];
    for (let i = 0; i < TEST_ORDERS.length; i++) {
      const order = await createTestOrder(TEST_ORDERS[i], user, i + 1);
      createdOrders.push(order);

      // Small delay between orders
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Verify orders in database
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 VERIFICATION');
    console.log(`${'='.repeat(60)}\n`);

    const totalOrders = await prisma.order.count({
      where: { userId: user.id }
    });

    const totalItems = await prisma.orderItem.count({
      where: { order: { userId: user.id } }
    });

    console.log(`✅ Total Orders Created: ${totalOrders}`);
    console.log(`✅ Total Order Items: ${totalItems}`);
    console.log(`✅ Customer: ${user.email}`);

    // List all orders
    console.log(`\n📋 Order Summary:`);
    createdOrders.forEach((order, idx) => {
      console.log(`   ${idx + 1}. ${order.orderNumber} - $${order.total.toFixed(2)} - ${order.status}`);
    });

    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ SUCCESS - All test orders created!');
    console.log(`${'='.repeat(60)}\n`);

    console.log('🔍 Next Steps:');
    console.log('1. Sign in as test customer: test-customer@gangrunprinting.com');
    console.log('2. Navigate to: https://gangrunprinting.com/en/account/orders');
    console.log('3. Verify all 3 orders appear in the order list');

  } catch (error) {
    console.error('\n❌ Error creating test orders:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run
main();
