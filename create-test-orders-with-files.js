/**
 * Complete Customer Order Testing with File Uploads - BMAD Method
 *
 * Creates 3 test orders with different configurations
 * Uploads a test image file to MinIO for each order
 * Creates OrderFile records to link files to orders
 */

const { PrismaClient } = require('@prisma/client');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

// Test customer data
const TEST_CUSTOMER = {
  email: 'test-customer@gangrunprinting.com',
  name: 'Test Customer',
  role: 'CUSTOMER'
};

// Product ID
const PRODUCT_ID = 'ac24cea0-bf8d-4f1e-9642-4c9a05033bac';

// Test image path
const TEST_IMAGE_PATH = '/root/.claude-code/mcp-servers/puppeteer-mcp/test/golden-chrome/white.jpg';

// Load environment variables
require('dotenv').config();

// MinIO/S3 Configuration - Use localhost since script runs on host
const s3Client = new S3Client({
  endpoint: 'http://localhost:9002', // MinIO exposed on host port 9002
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY,
    secretAccessKey: process.env.MINIO_SECRET_KEY
  },
  forcePathStyle: true
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME;

// Test order configurations
const TEST_ORDERS = [
  {
    name: 'Test Order 1: Standard Configuration',
    config: {
      quantity: 250,
      turnaround: 'Standard (5-7 days)',
      basePrice: 45.00,
      turnaroundPrice: 4.50,
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
      turnaroundPrice: 42.50,
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
      turnaroundPrice: 16.50,
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
 * Upload file to MinIO
 */
async function uploadFileToMinIO(orderId, testNumber) {
  try {
    // Read test image
    const fileBuffer = fs.readFileSync(TEST_IMAGE_PATH);
    const fileStats = fs.statSync(TEST_IMAGE_PATH);

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `test-order-${testNumber}-${timestamp}.jpg`;
    const s3Key = `orders/${orderId}/${filename}`;

    console.log(`   - Uploading file to MinIO: ${s3Key}`);

    // Upload to MinIO
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: 'image/jpeg'
    });

    await s3Client.send(uploadCommand);

    // Construct file URL using public endpoint
    const fileUrl = `${process.env.MINIO_PUBLIC_ENDPOINT}/${BUCKET_NAME}/${s3Key}`;

    console.log(`   ✓ File uploaded successfully`);

    return {
      filename,
      fileUrl,
      fileSize: fileStats.size,
      mimeType: 'image/jpeg',
      s3Key
    };
  } catch (error) {
    console.error(`   ✗ File upload failed:`, error.message);
    throw error;
  }
}

/**
 * Create OrderFile record
 */
async function createOrderFile(orderId, orderItemId, fileData, userId) {
  try {
    const orderFile = await prisma.orderFile.create({
      data: {
        id: `file_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        orderId,
        orderItemId,
        filename: fileData.filename,
        fileUrl: fileData.fileUrl,
        fileSize: fileData.fileSize,
        mimeType: fileData.mimeType,
        fileType: 'CUSTOMER_ARTWORK',
        approvalStatus: 'WAITING',
        uploadedBy: userId,
        uploadedByRole: 'CUSTOMER',
        isVisible: true,
        notifyCustomer: true,
        notifyAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log(`   ✓ OrderFile record created: ${orderFile.id}`);
    return orderFile;
  } catch (error) {
    console.error(`   ✗ OrderFile creation failed:`, error.message);
    throw error;
  }
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
 * Create a single test order with file upload
 */
async function createTestOrderWithFile(orderConfig, user, testNumber) {
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
  console.log('Step 1/3: Creating order...');
  const order = await prisma.order.create({
    data: {
      id: `order_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      orderNumber,
      status: 'CONFIRMATION',
      subtotal,
      shipping: shipping.shippingCost,
      tax: 0,
      total,
      shippingAddress: shippingAddressObj,
      billingAddress: billingAddressObj,
      email: user.email,
      shippingMethod: shipping.shippingMethod,
      createdAt: new Date(),
      updatedAt: new Date(),
      User: {
        connect: { id: user.id }
      },
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

  // Get the order item ID
  const orderItemId = order.OrderItem[0].id;

  // Upload file to MinIO
  console.log('Step 2/3: Uploading file to MinIO...');
  const fileData = await uploadFileToMinIO(order.id, testNumber);

  // Create OrderFile record
  console.log('Step 3/3: Creating OrderFile record...');
  await createOrderFile(order.id, orderItemId, fileData, user.id);

  // Print order summary
  console.log(`\n✅ Order Complete:`);
  console.log(`  - Order Number: ${orderNumber}`);
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
  console.log(`  - File: ${fileData.filename} (${(fileData.fileSize / 1024).toFixed(2)} KB)`);

  return order;
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Creating Test Orders with File Uploads - BMAD Method\n');
  console.log('📦 Product: 4x6 Flyers - 9pt Card Stock');
  console.log(`🎯 Creating ${TEST_ORDERS.length} test orders with file uploads`);
  console.log(`📁 Test Image: ${TEST_IMAGE_PATH}\n`);

  try {
    // Verify test image exists
    if (!fs.existsSync(TEST_IMAGE_PATH)) {
      throw new Error(`Test image not found: ${TEST_IMAGE_PATH}`);
    }
    console.log(`✓ Test image found: ${path.basename(TEST_IMAGE_PATH)}\n`);

    // Get or create test customer
    const user = await getTestCustomer();

    // Create each test order with file upload
    const createdOrders = [];
    for (let i = 0; i < TEST_ORDERS.length; i++) {
      const order = await createTestOrderWithFile(TEST_ORDERS[i], user, i + 1);
      createdOrders.push(order);

      // Small delay between orders
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Verify orders in database
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 VERIFICATION');
    console.log(`${'='.repeat(60)}\n`);

    const totalOrders = await prisma.order.count({
      where: { User: { email: user.email } }
    });

    const totalItems = await prisma.orderItem.count({
      where: { Order: { User: { email: user.email } } }
    });

    const totalFiles = await prisma.orderFile.count({
      where: { Order: { User: { email: user.email } } }
    });

    console.log(`✅ Total Orders Created: ${totalOrders}`);
    console.log(`✅ Total Order Items: ${totalItems}`);
    console.log(`✅ Total Files Uploaded: ${totalFiles}`);
    console.log(`✅ Customer: ${user.email}`);

    // List all orders
    console.log(`\n📋 Order Summary:`);
    createdOrders.forEach((order, idx) => {
      console.log(`   ${idx + 1}. ${order.orderNumber} - $${order.total.toFixed(2)} - ${order.status} - 1 file`);
    });

    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ SUCCESS - All test orders created with files!');
    console.log(`${'='.repeat(60)}\n`);

    console.log('🔍 Next Steps:');
    console.log('1. Sign in as test customer: test-customer@gangrunprinting.com');
    console.log('2. Navigate to: https://gangrunprinting.com/en/account/orders');
    console.log('3. Verify all 3 orders appear with uploaded files');
    console.log('4. Click each order to view file details');

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
