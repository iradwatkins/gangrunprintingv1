/**
 * Verify Orders in Database and Admin Panel
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyOrders() {
  console.log('🔍 VERIFYING ORDERS FOR BOBBY WATKINS\n');

  try {
    // 1. Check Bobby's account
    const bobby = await prisma.user.findUnique({
      where: { email: 'appvillagellc@gmail.com' }
    });

    console.log(`👤 Customer: ${bobby.name} (${bobby.email})`);

    // 2. Find all orders for Bobby
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { userId: bobby.id },
          { email: bobby.email }
        ]
      },
      include: {
        OrderItem: {
          include: {
            OrderItemAddOn: {
              include: {
                AddOn: true
              }
            }
          }
        },
        StatusHistory: true,
        User: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\n📦 ORDERS FOUND: ${orders.length}\n`);

    orders.forEach((order, index) => {
      console.log(`🛒 ORDER #${index + 1}:`);
      console.log(`   Order Number: ${order.orderNumber}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Total: $${order.total}`);
      console.log(`   Customer: ${order.User?.name || 'Guest'} (${order.email})`);
      console.log(`   Created: ${order.createdAt.toISOString()}`);

      if (order.squarePaymentId) {
        console.log(`   Payment ID: ${order.squarePaymentId}`);
      }

      if (order.OrderItem.length > 0) {
        console.log(`   Items:`);
        order.OrderItem.forEach(item => {
          console.log(`      - ${item.productName} (${item.quantity} qty) - $${item.price}`);

          if (item.OrderItemAddOn.length > 0) {
            console.log(`      Add-ons:`);
            item.OrderItemAddOn.forEach(addon => {
              console.log(`         + ${addon.AddOn.name} - $${addon.calculatedPrice}`);
            });
          }
        });
      }

      console.log(`   Shipping Address: ${JSON.stringify(order.shippingAddress, null, 2)}`);
      console.log('');
    });

    // 3. Total count verification
    const totalOrders = await prisma.order.count();
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Total orders in database: ${totalOrders}`);
    console.log(`   Orders for Bobby Watkins: ${orders.length}`);

    // 4. Admin panel links
    console.log(`\n🔗 ADMIN PANEL LINKS:`);
    console.log(`   All Orders: https://gangrunprinting.com/admin/orders`);

    orders.forEach(order => {
      console.log(`   Order ${order.orderNumber}: https://gangrunprinting.com/admin/orders/${order.id}`);
    });

    // 5. Login instructions
    console.log(`\n👑 ADMIN LOGIN INSTRUCTIONS:`);
    console.log(`   1. Go to: https://gangrunprinting.com/admin/login`);
    console.log(`   2. Login as: iradwatkins@gmail.com (Ira Watkins - Admin)`);
    console.log(`   3. Navigate to: Orders section`);
    console.log(`   4. You should see Bobby's order(s) listed`);

    console.log(`\n🎯 TEST COMPLETE!`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifyOrders()
  .then(() => {
    console.log('\n✅ Order verification completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
  });