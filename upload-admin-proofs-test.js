/**
 * Upload 2 Admin Proof Images to Existing Test Order
 *
 * Purpose: Test admin proof upload functionality
 * - Uploads 2 different images as ADMIN_PROOF type
 * - Creates OrderFile records
 * - Uploads to MinIO storage
 * - Tests thumbnail display for both admin and customer
 */

const { PrismaClient } = require('@prisma/client');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

// Load environment variables
require('dotenv').config();

// MinIO/S3 Configuration
const s3Client = new S3Client({
  endpoint: 'http://localhost:9002',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY,
    secretAccessKey: process.env.MINIO_SECRET_KEY
  },
  forcePathStyle: true
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME;

// Test images
const TEST_IMAGES = [
  {
    path: '/root/.claude-code/mcp-servers/puppeteer-mcp/test/golden-chrome/white.jpg',
    label: 'Admin Proof 1 - Chrome Test'
  },
  {
    path: '/root/.claude-code/mcp-servers/puppeteer-mcp/test/golden-firefox/white.jpg',
    label: 'Admin Proof 2 - Firefox Test'
  }
];

// Use existing test order
const TEST_ORDER_ID = 'order_1761419631886_sna7n'; // TEST-19631886-A9UM

/**
 * Upload file to MinIO
 */
async function uploadFileToMinIO(orderId, imagePath, imageNumber) {
  try {
    // Read image file
    const fileBuffer = fs.readFileSync(imagePath);
    const fileStats = fs.statSync(imagePath);
    const originalFilename = path.basename(imagePath);

    // Generate unique filename
    const timestamp = Date.now();
    const extension = path.extname(originalFilename);
    const filename = `admin-proof-${imageNumber}-${timestamp}${extension}`;
    const s3Key = `orders/${orderId}/${filename}`;

    console.log(`   - Uploading: ${filename}`);
    console.log(`   - Size: ${(fileStats.size / 1024).toFixed(2)} KB`);

    // Upload to MinIO
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: 'image/jpeg'
    });

    await s3Client.send(uploadCommand);

    // Construct file URL
    const fileUrl = `${process.env.MINIO_PUBLIC_ENDPOINT}/${BUCKET_NAME}/${s3Key}`;

    console.log(`   ✓ Uploaded successfully`);

    return {
      filename,
      fileUrl,
      fileSize: fileStats.size,
      mimeType: 'image/jpeg',
      s3Key
    };
  } catch (error) {
    console.error(`   ✗ Upload failed:`, error.message);
    throw error;
  }
}

/**
 * Create OrderFile record
 */
async function createOrderFile(orderId, orderItemId, fileData, label) {
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
        fileType: 'ADMIN_PROOF', // Admin uploading proof for customer approval
        label,
        approvalStatus: 'WAITING', // Customer needs to approve
        uploadedBy: 'admin_test', // Simulated admin
        uploadedByRole: 'ADMIN',
        isVisible: true,
        notifyCustomer: true, // Notify customer about new proof
        notifyAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log(`   ✓ OrderFile created: ${orderFile.id}`);
    return orderFile;
  } catch (error) {
    console.error(`   ✗ OrderFile creation failed:`, error.message);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Uploading Admin Proof Images\n');
  console.log(`📦 Target Order: ${TEST_ORDER_ID}`);
  console.log(`📁 Uploading ${TEST_IMAGES.length} proof images\n`);

  try {
    // Verify order exists and get order item
    const order = await prisma.order.findUnique({
      where: { id: TEST_ORDER_ID },
      include: {
        OrderItem: true
      }
    });

    if (!order) {
      throw new Error(`Order not found: ${TEST_ORDER_ID}`);
    }

    console.log(`✓ Order found: ${order.orderNumber}`);

    if (!order.OrderItem || order.OrderItem.length === 0) {
      throw new Error('Order has no items');
    }

    const orderItemId = order.OrderItem[0].id;
    console.log(`✓ Order item: ${orderItemId}\n`);

    // Upload each image
    const uploadedFiles = [];

    for (let i = 0; i < TEST_IMAGES.length; i++) {
      const testImage = TEST_IMAGES[i];

      console.log(`${'='.repeat(60)}`);
      console.log(`Uploading Proof ${i + 1} of ${TEST_IMAGES.length}`);
      console.log(`${'='.repeat(60)}`);

      // Verify image exists
      if (!fs.existsSync(testImage.path)) {
        console.log(`   ✗ Image not found: ${testImage.path}`);
        continue;
      }

      console.log(`   Source: ${testImage.path}`);

      // Upload to MinIO
      const fileData = await uploadFileToMinIO(TEST_ORDER_ID, testImage.path, i + 1);

      // Create OrderFile record
      const orderFile = await createOrderFile(
        TEST_ORDER_ID,
        orderItemId,
        fileData,
        testImage.label
      );

      uploadedFiles.push(orderFile);
      console.log();
    }

    // Summary
    console.log(`${'='.repeat(60)}`);
    console.log('📊 UPLOAD SUMMARY');
    console.log(`${'='.repeat(60)}\n`);

    console.log(`✅ Successfully uploaded ${uploadedFiles.length} proof images`);
    console.log(`✅ Order: ${order.orderNumber}`);
    console.log(`✅ Type: ADMIN_PROOF (awaiting customer approval)\n`);

    // List uploaded files
    console.log('📋 Uploaded Files:');
    uploadedFiles.forEach((file, idx) => {
      console.log(`   ${idx + 1}. ${file.label}`);
      console.log(`      - ${file.filename}`);
      console.log(`      - ${(file.fileSize / 1024).toFixed(2)} KB`);
      console.log(`      - Status: ${file.approvalStatus}`);
    });

    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ SUCCESS - Admin proofs uploaded!');
    console.log(`${'='.repeat(60)}\n`);

    console.log('🔍 Next Steps:');
    console.log('1. Admin Panel: https://gangrunprinting.com/en/admin/orders/' + TEST_ORDER_ID);
    console.log('   - Verify proofs display with thumbnails');
    console.log('   - Test download functionality');
    console.log();
    console.log('2. Customer Panel: https://gangrunprinting.com/en/account/orders/' + TEST_ORDER_ID);
    console.log('   - Sign in as: test-customer@gangrunprinting.com');
    console.log('   - Verify proofs display with thumbnails');
    console.log('   - Test download and approval functionality');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run
main();
