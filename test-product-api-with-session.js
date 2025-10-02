const https = require('https');

// Query database to get admin user session
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testProductCreation() {
  try {
    // Get admin user with active session
    const session = await prisma.session.findFirst({
      where: {
        expiresAt: { gt: new Date() },
        user: { role: 'ADMIN' }
      },
      include: { user: true }
    });

    if (!session) {
      console.error('No admin user with active session found');
      process.exit(1);
    }

    const sessionId = session.id;
    console.log('Using admin session:', sessionId);
    console.log('Admin user:', session.user.email);

    // Prepare test data
    const testData = {
      name: 'Test Product - Direct API with Session',
      sku: 'test-product-direct-api-with-session',
      categoryId: 'cat_banner',
      description: 'Testing API with admin session',
      shortDescription: null,
      isActive: true,
      isFeatured: false,
      paperStockSetId: 'cmg46sc60000f12ymdo48kpb0',  // Using first paper stock ID as set ID
      quantityGroupId: 'cmg5i6poy000094pu856umjxa',
      sizeGroupId: 'b180aadd-1ed7-42e5-9640-9460a58e9f72',
      selectedAddOns: [],
      turnaroundTimeSetId: 'cmg46sc7u001k12ymd9w3p9uk',
      addOnSetId: null,
      productionTime: 3,
      rushAvailable: false,
      rushDays: null,
      rushFee: null,
      basePrice: 25.99,
      setupFee: 0,
      images: []
    };

    console.log('\nRequest Data:');
    console.log(JSON.stringify(testData, null, 2));

    // Make API request
    const postData = JSON.stringify(testData);

    const options = {
      hostname: 'gangrunprinting.com',
      port: 443,
      path: '/api/products',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Cookie': `auth_session=${sessionId}`
      },
      rejectUnauthorized: false
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', async () => {
        console.log('\n=== API RESPONSE ===');
        console.log('Status:', res.statusCode);
        console.log('Headers:', JSON.stringify(res.headers, null, 2));
        console.log('\nResponse Body:');
        try {
          const parsed = JSON.parse(responseData);
          console.log(JSON.stringify(parsed, null, 2));
        } catch (e) {
          console.log(responseData);
        }

        await prisma.$disconnect();
        process.exit(res.statusCode === 201 ? 0 : 1);
      });
    });

    req.on('error', async (error) => {
      console.error('Request Error:', error);
      await prisma.$disconnect();
      process.exit(1);
    });

    req.write(postData);
    req.end();

  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testProductCreation();
