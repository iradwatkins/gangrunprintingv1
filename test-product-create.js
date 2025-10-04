const fetch = require('node-fetch');

async function testProductCreate() {
  // Get a valid session first (you'll need to replace with actual admin session cookie)
  const testData = {
    name: 'Test Product ' + Date.now(),
    sku: 'test-product-' + Date.now(),
    categoryId: 'cmg46lnbi000012ymdqcvyyhx', // You'll need to get a real category ID
    description: 'Test description',
    shortDescription: null,
    isActive: true,
    isFeatured: false,
    paperStockSetId: 'cmg46sc7g001a12ymf2vk188w', // You'll need a real paper stock set ID
    quantityGroupId: 'cmg46pa6p000n12ymxb8oi8ww', // Real quantity group ID
    sizeGroupId: 'cmg46pvvn000w12ymwvfaj5ma', // Real size group ID
    selectedAddOns: [],
    turnaroundTimeSetId: null,
    addOnSetId: null,
    productionTime: 3,
    rushAvailable: false,
    rushDays: null,
    rushFee: null,
    basePrice: 0,
    setupFee: 0,
    images: [{
      url: 'https://gangrunprinting.com/images/product-placeholder.jpg',
      thumbnailUrl: 'https://gangrunprinting.com/images/product-placeholder.jpg',
      alt: 'Test image',
      isPrimary: true,
      sortOrder: 0,
      width: 500,
      height: 500,
      fileSize: 1024,
      mimeType: 'image/jpeg'
    }]
  };

  console.log('Testing product creation with data:');
  console.log(JSON.stringify(testData, null, 2));

  try {
    const response = await fetch('http://localhost:3002/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // You'll need to add your admin session cookie here
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('\nResponse status:', response.status);
    console.log('Response body:', JSON.stringify(result, null, 2));

    if (!response.ok) {
      console.error('\n❌ Validation failed!');
      if (result.details?.validationErrors) {
        console.log('\nValidation errors:');
        result.details.validationErrors.forEach(err => {
          console.log(`  - ${err.path.join('.')}: ${err.message}`);
        });
      }
    } else {
      console.log('\n✅ Product created successfully!');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// First, let's get valid IDs from the database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getValidIds() {
  const [category, paperStockSet, quantityGroup, sizeGroup] = await Promise.all([
    prisma.productCategory.findFirst({ where: { isActive: true } }),
    prisma.paperStockSet.findFirst({ where: { isActive: true } }),
    prisma.quantityGroup.findFirst({ where: { isActive: true } }),
    prisma.sizeGroup.findFirst({ where: { isActive: true } })
  ]);

  console.log('Valid IDs found:');
  console.log('Category:', category?.id, category?.name);
  console.log('Paper Stock Set:', paperStockSet?.id, paperStockSet?.name);
  console.log('Quantity Group:', quantityGroup?.id, quantityGroup?.name);
  console.log('Size Group:', sizeGroup?.id, sizeGroup?.name);

  await prisma.$disconnect();

  return { category, paperStockSet, quantityGroup, sizeGroup };
}

getValidIds()
  .then(() => console.log('\nNow testing the validation schema directly...'))
  .then(() => {
    const { z } = require('zod');
    const { createProductSchema } = require('./src/lib/validation');

    const testData = {
      name: 'Test Product',
      sku: 'test-product',
      categoryId: 'cmg46lnbi000012ymdqcvyyhx',
      description: 'Test',
      isActive: true,
      isFeatured: false,
      paperStockSetId: 'cmg46sc7g001a12ymf2vk188w',
      quantityGroupId: 'cmg46pa6p000n12ymxb8oi8ww',
      sizeGroupId: 'cmg46pvvn000w12ymwvfaj5ma',
      selectedAddOns: [],
      images: [{
        url: 'https://gangrunprinting.com/images/test.jpg',
        alt: 'Test',
        isPrimary: true,
        sortOrder: 0
      }]
    };

    try {
      const result = createProductSchema.parse(testData);
      console.log('✅ Validation passed!');
    } catch (error) {
      console.log('❌ Validation failed:');
      console.log(JSON.stringify(error.errors, null, 2));
    }
  })
  .catch(console.error);
