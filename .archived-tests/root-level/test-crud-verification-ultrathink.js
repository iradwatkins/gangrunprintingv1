/**
 * 🔬 ULTRA-THINK CRUD VERIFICATION TEST
 * Tests product CRUD operations 3 times with full verification
 *
 * Tests:
 * 1. Product creation with images
 * 2. Database verification (ProductImage records)
 * 3. Product retrieval and display
 * 4. Product edit/update
 * 5. Product delete
 *
 * Each test runs 3 times to ensure reliability
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Test results storage
const testResults = {
  timestamp: new Date().toISOString(),
  rounds: [],
  summary: {
    totalTests: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const icons = {
    info: '📝',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    test: '🧪',
    db: '🗄️',
    api: '🔌',
    image: '🖼️'
  };
  const icon = icons[type] || '📝';
  console.log(`[${timestamp}] ${icon} ${message}`);
}

function recordTest(testName, passed, details = {}) {
  testResults.summary.totalTests++;
  if (passed) {
    testResults.summary.passed++;
  } else {
    testResults.summary.failed++;
  }

  return {
    testName,
    passed,
    timestamp: new Date().toISOString(),
    ...details
  };
}

// ========================================
// DATABASE VERIFICATION FUNCTIONS
// ========================================

async function verifyProductInDatabase(productId) {
  log(`Verifying product ${productId} in database...`, 'db');

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        ProductImage: {
          include: {
            Image: true
          }
        },
        ProductCategory: true,
        ProductPaperStockSet: {
          include: {
            PaperStockSet: true
          }
        },
        ProductQuantityGroup: {
          include: {
            QuantityGroup: true
          }
        },
        ProductSizeGroup: {
          include: {
            SizeGroup: true
          }
        }
      }
    });

    if (!product) {
      log(`Product ${productId} NOT found in database!`, 'error');
      return { found: false };
    }

    log(`Product found: ${product.name}`, 'success');
    log(`  - SKU: ${product.sku}`, 'info');
    log(`  - Slug: ${product.slug}`, 'info');
    log(`  - Active: ${product.isActive}`, 'info');
    log(`  - Images: ${product.ProductImage.length}`, 'image');
    log(`  - Category: ${product.ProductCategory?.name || 'N/A'}`, 'info');
    log(`  - Paper Stock Set: ${product.ProductPaperStockSet?.[0]?.PaperStockSet?.name || 'N/A'}`, 'info');
    log(`  - Quantity Group: ${product.ProductQuantityGroup?.[0]?.QuantityGroup?.name || 'N/A'}`, 'info');
    log(`  - Size Group: ${product.ProductSizeGroup?.[0]?.SizeGroup?.name || 'N/A'}`, 'info');

    // Detailed image verification
    if (product.ProductImage.length > 0) {
      log(`\nImage Details:`, 'image');
      product.ProductImage.forEach((pi, idx) => {
        log(`  Image ${idx + 1}:`, 'image');
        log(`    - ProductImage ID: ${pi.id}`, 'info');
        log(`    - Image ID: ${pi.imageId}`, 'info');
        log(`    - Image URL: ${pi.Image?.url || 'N/A'}`, 'info');
        log(`    - Thumbnail: ${pi.Image?.thumbnailUrl || 'N/A'}`, 'info');
        log(`    - Primary: ${pi.isPrimary}`, 'info');
        log(`    - Sort Order: ${pi.sortOrder}`, 'info');
      });
    }

    return {
      found: true,
      product,
      imageCount: product.ProductImage.length,
      hasCategory: !!product.ProductCategory,
      hasPaperStock: product.ProductPaperStockSet.length > 0,
      hasQuantityGroup: product.ProductQuantityGroup.length > 0,
      hasSizeGroup: product.ProductSizeGroup.length > 0
    };
  } catch (error) {
    log(`Database verification error: ${error.message}`, 'error');
    return { found: false, error: error.message };
  }
}

async function verifyProductImagesLinked(productId) {
  log(`Verifying ProductImage links for ${productId}...`, 'db');

  try {
    const productImages = await prisma.productImage.findMany({
      where: { productId },
      include: {
        Image: true
      }
    });

    log(`Found ${productImages.length} ProductImage records`, 'db');

    const allValid = productImages.every(pi => {
      const valid = pi.imageId && pi.Image && pi.Image.url;
      if (!valid) {
        log(`  Invalid ProductImage: ${pi.id} - Missing imageId or Image`, 'error');
      }
      return valid;
    });

    return {
      count: productImages.length,
      allValid,
      images: productImages
    };
  } catch (error) {
    log(`ProductImage verification error: ${error.message}`, 'error');
    return { count: 0, allValid: false, error: error.message };
  }
}

async function getTestCategory() {
  log('Getting test category...', 'db');

  const category = await prisma.productCategory.findFirst({
    where: { isActive: true }
  });

  if (!category) {
    log('No active categories found!', 'error');
    return null;
  }

  log(`Using category: ${category.name} (${category.id})`, 'success');
  return category;
}

async function getTestPaperStockSet() {
  log('Getting test paper stock set...', 'db');

  const paperStockSet = await prisma.paperStockSet.findFirst({
    where: { isActive: true }
  });

  if (!paperStockSet) {
    log('No active paper stock sets found!', 'error');
    return null;
  }

  log(`Using paper stock set: ${paperStockSet.name} (${paperStockSet.id})`, 'success');
  return paperStockSet;
}

async function getTestQuantityGroup() {
  log('Getting test quantity group...', 'db');

  const quantityGroup = await prisma.quantityGroup.findFirst({
    where: { isActive: true }
  });

  if (!quantityGroup) {
    log('No active quantity groups found!', 'error');
    return null;
  }

  log(`Using quantity group: ${quantityGroup.name} (${quantityGroup.id})`, 'success');
  return quantityGroup;
}

async function getTestSizeGroup() {
  log('Getting test size group...', 'db');

  const sizeGroup = await prisma.sizeGroup.findFirst({
    where: { isActive: true }
  });

  if (!sizeGroup) {
    log('No active size groups found!', 'error');
    return null;
  }

  log(`Using size group: ${sizeGroup.name} (${sizeGroup.id})`, 'success');
  return sizeGroup;
}

async function getTestTurnaroundTimeSet() {
  log('Getting test turnaround time set...', 'db');

  const turnaroundTimeSet = await prisma.turnaroundTimeSet.findFirst({
    where: { isActive: true }
  });

  if (!turnaroundTimeSet) {
    log('No active turnaround time sets found - will skip', 'warning');
    return null;
  }

  log(`Using turnaround time set: ${turnaroundTimeSet.name} (${turnaroundTimeSet.id})`, 'success');
  return turnaroundTimeSet;
}

async function createTestImage(productName, index) {
  log(`Creating test image ${index} for ${productName}...`, 'image');

  const { randomUUID } = require('crypto');

  try {
    const image = await prisma.image.create({
      data: {
        id: randomUUID(), // FIX: Prisma requires explicit ID
        name: `test-image-${productName}-${index}-${Date.now()}`,
        url: `https://gangrunprinting.com/test-images/product-${index}.jpg`,
        thumbnailUrl: `https://gangrunprinting.com/test-images/product-${index}-thumb.jpg`,
        alt: `Test image ${index} for ${productName}`,
        width: 800,
        height: 600,
        fileSize: 150000,
        mimeType: 'image/jpeg',
        category: 'product',
        updatedAt: new Date() // FIX: Prisma requires updatedAt
      }
    });

    log(`Created image: ${image.id}`, 'success');
    return image;
  } catch (error) {
    log(`Failed to create image: ${error.message}`, 'error');
    throw error;
  }
}

// ========================================
// TEST ROUND 1: CREATE PRODUCT
// ========================================

async function testRound1_CreateProduct(roundNum) {
  log(`\n${'='.repeat(80)}`, 'test');
  log(`TEST ROUND ${roundNum}: CREATE PRODUCT WITH IMAGES`, 'test');
  log('='.repeat(80), 'test');

  const roundResults = {
    round: roundNum,
    tests: []
  };

  try {
    // Step 1: Get test data
    log('\nStep 1: Gathering test data...', 'test');
    const [category, paperStockSet, quantityGroup, sizeGroup, turnaroundTimeSet] = await Promise.all([
      getTestCategory(),
      getTestPaperStockSet(),
      getTestQuantityGroup(),
      getTestSizeGroup(),
      getTestTurnaroundTimeSet()
    ]);

    if (!category || !paperStockSet || !quantityGroup || !sizeGroup) {
      log('Missing required test data!', 'error');
      roundResults.tests.push(recordTest('Get Test Data', false, { error: 'Missing required data' }));
      return roundResults;
    }

    roundResults.tests.push(recordTest('Get Test Data', true, {
      category: category.name,
      paperStockSet: paperStockSet.name,
      quantityGroup: quantityGroup.name,
      sizeGroup: sizeGroup.name,
      turnaroundTimeSet: turnaroundTimeSet?.name || 'N/A'
    }));

    // Step 2: Create test images
    log('\nStep 2: Creating test images...', 'test');
    const productName = `UltraTest Product Round ${roundNum} ${Date.now()}`;
    const testImages = [];

    try {
      for (let i = 0; i < 2; i++) {
        const image = await createTestImage(productName, i + 1);
        testImages.push(image);
      }
      log(`Created ${testImages.length} test images`, 'success');
      roundResults.tests.push(recordTest('Create Test Images', true, {
        imageCount: testImages.length,
        imageIds: testImages.map(img => img.id)
      }));
    } catch (error) {
      log(`Failed to create test images: ${error.message}`, 'error');
      roundResults.tests.push(recordTest('Create Test Images', false, { error: error.message }));
      return roundResults;
    }

    // Step 3: Create product
    log('\nStep 3: Creating product...', 'test');
    const productData = {
      name: productName,
      sku: `ultratest-${roundNum}-${Date.now()}`,
      slug: `ultratest-product-${roundNum}-${Date.now()}`,
      categoryId: category.id,
      description: `Test product for round ${roundNum} - Created by UltraThink test`,
      shortDescription: `Round ${roundNum} test product`,
      isActive: true,
      isFeatured: false,
      basePrice: 99.99,
      setupFee: 0,
      productionTime: 3,
      rushAvailable: false
    };

    let product;
    try {
      const { randomUUID } = require('crypto');
      product = await prisma.product.create({
        data: {
          ...productData,
          id: randomUUID(), // FIX: Prisma requires explicit ID
          updatedAt: new Date()
        }
      });
      log(`Created product: ${product.id}`, 'success');
      roundResults.tests.push(recordTest('Create Product', true, {
        productId: product.id,
        productName: product.name,
        sku: product.sku
      }));
    } catch (error) {
      log(`Failed to create product: ${error.message}`, 'error');
      roundResults.tests.push(recordTest('Create Product', false, { error: error.message }));
      return roundResults;
    }

    // Step 4: Link paper stock set
    log('\nStep 4: Linking paper stock set...', 'test');
    try {
      const { randomUUID } = require('crypto');
      await prisma.productPaperStockSet.create({
        data: {
          id: randomUUID(),
          productId: product.id,
          paperStockSetId: paperStockSet.id,
          isDefault: true,
          updatedAt: new Date()
        }
      });
      log('Linked paper stock set', 'success');
      roundResults.tests.push(recordTest('Link Paper Stock Set', true));
    } catch (error) {
      log(`Failed to link paper stock set: ${error.message}`, 'error');
      roundResults.tests.push(recordTest('Link Paper Stock Set', false, { error: error.message }));
    }

    // Step 5: Link quantity group
    log('\nStep 5: Linking quantity group...', 'test');
    try {
      const { randomUUID } = require('crypto');
      await prisma.productQuantityGroup.create({
        data: {
          id: randomUUID(),
          productId: product.id,
          quantityGroupId: quantityGroup.id,
          updatedAt: new Date()
        }
      });
      log('Linked quantity group', 'success');
      roundResults.tests.push(recordTest('Link Quantity Group', true));
    } catch (error) {
      log(`Failed to link quantity group: ${error.message}`, 'error');
      roundResults.tests.push(recordTest('Link Quantity Group', false, { error: error.message }));
    }

    // Step 6: Link size group
    log('\nStep 6: Linking size group...', 'test');
    try {
      const { randomUUID } = require('crypto');
      await prisma.productSizeGroup.create({
        data: {
          id: randomUUID(),
          productId: product.id,
          sizeGroupId: sizeGroup.id,
          updatedAt: new Date()
        }
      });
      log('Linked size group', 'success');
      roundResults.tests.push(recordTest('Link Size Group', true));
    } catch (error) {
      log(`Failed to link size group: ${error.message}`, 'error');
      roundResults.tests.push(recordTest('Link Size Group', false, { error: error.message }));
    }

    // Step 7: Link turnaround time set (optional)
    if (turnaroundTimeSet) {
      log('\nStep 7: Linking turnaround time set...', 'test');
      try {
        const { randomUUID } = require('crypto');
        await prisma.productTurnaroundTimeSet.create({
          data: {
            id: randomUUID(),
            productId: product.id,
            turnaroundTimeSetId: turnaroundTimeSet.id,
            isDefault: true,
            updatedAt: new Date()
          }
        });
        log('Linked turnaround time set', 'success');
        roundResults.tests.push(recordTest('Link Turnaround Time Set', true));
      } catch (error) {
        log(`Failed to link turnaround time set: ${error.message}`, 'error');
        roundResults.tests.push(recordTest('Link Turnaround Time Set', false, { error: error.message }));
      }
    }

    // Step 8: Link images to product via ProductImage
    log('\nStep 8: Linking images to product...', 'test');
    try {
      const { randomUUID } = require('crypto');
      for (let i = 0; i < testImages.length; i++) {
        const image = testImages[i];
        await prisma.productImage.create({
          data: {
            id: randomUUID(),
            productId: product.id,
            imageId: image.id,
            sortOrder: i,
            isPrimary: i === 0,
            updatedAt: new Date()
          }
        });
        log(`Linked image ${i + 1}: ${image.id}`, 'success');
      }
      roundResults.tests.push(recordTest('Link Product Images', true, {
        imageCount: testImages.length
      }));
    } catch (error) {
      log(`Failed to link images: ${error.message}`, 'error');
      roundResults.tests.push(recordTest('Link Product Images', false, { error: error.message }));
    }

    // Step 9: Verify in database
    log('\nStep 9: Verifying product in database...', 'test');
    const dbVerification = await verifyProductInDatabase(product.id);
    roundResults.tests.push(recordTest('Verify Product in Database', dbVerification.found, dbVerification));

    // Step 10: Verify ProductImage records
    log('\nStep 10: Verifying ProductImage links...', 'test');
    const imageVerification = await verifyProductImagesLinked(product.id);
    const imagesCorrect = imageVerification.count === testImages.length && imageVerification.allValid;
    roundResults.tests.push(recordTest('Verify ProductImage Links', imagesCorrect, imageVerification));

    // Step 11: Test product retrieval via API simulation
    log('\nStep 11: Testing product retrieval...', 'test');
    try {
      const retrievedProduct = await prisma.product.findUnique({
        where: { id: product.id },
        include: {
          ProductImage: {
            include: {
              Image: true
            },
            orderBy: { sortOrder: 'asc' }
          },
          ProductCategory: true
        }
      });

      const hasImages = retrievedProduct.ProductImage.length > 0;
      const imagesHaveUrls = retrievedProduct.ProductImage.every(pi => pi.Image?.url);
      const hasPrimaryImage = retrievedProduct.ProductImage.some(pi => pi.isPrimary);

      log(`Product retrieved successfully`, 'success');
      log(`  - Has images: ${hasImages}`, hasImages ? 'success' : 'error');
      log(`  - All images have URLs: ${imagesHaveUrls}`, imagesHaveUrls ? 'success' : 'error');
      log(`  - Has primary image: ${hasPrimaryImage}`, hasPrimaryImage ? 'success' : 'error');

      roundResults.tests.push(recordTest('Retrieve Product with Images',
        hasImages && imagesHaveUrls && hasPrimaryImage, {
        imageCount: retrievedProduct.ProductImage.length,
        hasImages,
        imagesHaveUrls,
        hasPrimaryImage
      }));
    } catch (error) {
      log(`Product retrieval failed: ${error.message}`, 'error');
      roundResults.tests.push(recordTest('Retrieve Product with Images', false, { error: error.message }));
    }

    // Store product ID for next round
    roundResults.productId = product.id;
    roundResults.productName = product.name;

  } catch (error) {
    log(`\nTest round ${roundNum} failed with error: ${error.message}`, 'error');
    roundResults.error = error.message;
  }

  return roundResults;
}

// ========================================
// TEST ROUND 2: EDIT PRODUCT
// ========================================

async function testRound2_EditProduct(productId, roundNum) {
  log(`\n${'='.repeat(80)}`, 'test');
  log(`TEST ROUND ${roundNum}: EDIT/UPDATE PRODUCT`, 'test');
  log('='.repeat(80), 'test');

  const roundResults = {
    round: roundNum,
    tests: []
  };

  try {
    // Step 1: Retrieve product before edit
    log('\nStep 1: Retrieving product before edit...', 'test');
    const productBefore = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        ProductImage: {
          include: {
            Image: true
          }
        }
      }
    });

    if (!productBefore) {
      log(`Product ${productId} not found!`, 'error');
      roundResults.tests.push(recordTest('Retrieve Product Before Edit', false));
      return roundResults;
    }

    const imageCountBefore = productBefore.ProductImage.length;
    log(`Product found with ${imageCountBefore} images`, 'success');
    roundResults.tests.push(recordTest('Retrieve Product Before Edit', true, {
      imageCountBefore
    }));

    // Step 2: Update product (test that images are preserved)
    log('\nStep 2: Updating product...', 'test');
    try {
      await prisma.product.update({
        where: { id: productId },
        data: {
          description: `UPDATED: ${productBefore.description} - Edited in round ${roundNum}`,
          basePrice: 149.99
        }
      });
      log('Product updated successfully', 'success');
      roundResults.tests.push(recordTest('Update Product', true));
    } catch (error) {
      log(`Failed to update product: ${error.message}`, 'error');
      roundResults.tests.push(recordTest('Update Product', false, { error: error.message }));
      return roundResults;
    }

    // Step 3: Verify images still linked after update
    log('\nStep 3: Verifying images preserved after update...', 'test');
    const productAfter = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        ProductImage: {
          include: {
            Image: true
          }
        }
      }
    });

    const imageCountAfter = productAfter.ProductImage.length;
    const imagesPreserved = imageCountAfter === imageCountBefore;

    log(`Images after update: ${imageCountAfter}`, imagesPreserved ? 'success' : 'error');
    if (!imagesPreserved) {
      log(`❌ CRITICAL: Images were NOT preserved! Before: ${imageCountBefore}, After: ${imageCountAfter}`, 'error');
    }

    roundResults.tests.push(recordTest('Verify Images Preserved After Update', imagesPreserved, {
      imageCountBefore,
      imageCountAfter,
      imagesPreserved
    }));

    // Step 4: Add another image
    log('\nStep 4: Adding new image to product...', 'test');
    try {
      const newImage = await createTestImage(productBefore.name, 99);
      const { randomUUID } = require('crypto');
      await prisma.productImage.create({
        data: {
          id: randomUUID(),
          productId: productId,
          imageId: newImage.id,
          sortOrder: imageCountAfter,
          isPrimary: false,
          updatedAt: new Date()
        }
      });
      log('New image added successfully', 'success');
      roundResults.tests.push(recordTest('Add New Image', true, { newImageId: newImage.id }));
    } catch (error) {
      log(`Failed to add new image: ${error.message}`, 'error');
      roundResults.tests.push(recordTest('Add New Image', false, { error: error.message }));
    }

    // Step 5: Verify final image count
    log('\nStep 5: Verifying final image count...', 'test');
    const productFinal = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        ProductImage: true
      }
    });

    const finalImageCount = productFinal.ProductImage.length;
    const correctCount = finalImageCount === (imageCountBefore + 1);

    log(`Final image count: ${finalImageCount} (expected ${imageCountBefore + 1})`, correctCount ? 'success' : 'error');
    roundResults.tests.push(recordTest('Verify Final Image Count', correctCount, {
      finalImageCount,
      expectedCount: imageCountBefore + 1
    }));

  } catch (error) {
    log(`\nTest round ${roundNum} failed with error: ${error.message}`, 'error');
    roundResults.error = error.message;
  }

  return roundResults;
}

// ========================================
// TEST ROUND 3: DELETE PRODUCT
// ========================================

async function testRound3_DeleteProduct(productId, roundNum) {
  log(`\n${'='.repeat(80)}`, 'test');
  log(`TEST ROUND ${roundNum}: DELETE PRODUCT`, 'test');
  log('='.repeat(80), 'test');

  const roundResults = {
    round: roundNum,
    tests: []
  };

  try {
    // Step 1: Verify product exists before delete
    log('\nStep 1: Verifying product exists...', 'test');
    const productBefore = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        ProductImage: true
      }
    });

    if (!productBefore) {
      log(`Product ${productId} not found!`, 'error');
      roundResults.tests.push(recordTest('Verify Product Exists', false));
      return roundResults;
    }

    const imageCountBefore = productBefore.ProductImage.length;
    log(`Product found with ${imageCountBefore} images`, 'success');
    roundResults.tests.push(recordTest('Verify Product Exists', true, {
      imageCountBefore
    }));

    // Step 2: Delete ProductImage records first (if not cascading)
    log('\nStep 2: Checking ProductImage cleanup...', 'test');
    const productImagesBefore = await prisma.productImage.count({
      where: { productId }
    });
    log(`ProductImage records before delete: ${productImagesBefore}`, 'info');

    // Step 3: Delete product
    log('\nStep 3: Deleting product...', 'test');
    try {
      await prisma.product.delete({
        where: { id: productId }
      });
      log('Product deleted successfully', 'success');
      roundResults.tests.push(recordTest('Delete Product', true));
    } catch (error) {
      log(`Failed to delete product: ${error.message}`, 'error');
      roundResults.tests.push(recordTest('Delete Product', false, { error: error.message }));
      return roundResults;
    }

    // Step 4: Verify product is gone
    log('\nStep 4: Verifying product is deleted...', 'test');
    const productAfter = await prisma.product.findUnique({
      where: { id: productId }
    });

    const isDeleted = productAfter === null;
    log(`Product deletion verified: ${isDeleted}`, isDeleted ? 'success' : 'error');
    roundResults.tests.push(recordTest('Verify Product Deleted', isDeleted));

    // Step 5: Verify ProductImage records cleaned up
    log('\nStep 5: Verifying ProductImage cleanup...', 'test');
    const productImagesAfter = await prisma.productImage.count({
      where: { productId }
    });

    const cleanedUp = productImagesAfter === 0;
    log(`ProductImage records after delete: ${productImagesAfter}`, cleanedUp ? 'success' : 'warning');
    roundResults.tests.push(recordTest('Verify ProductImage Cleanup', cleanedUp, {
      productImagesBefore,
      productImagesAfter
    }));

  } catch (error) {
    log(`\nTest round ${roundNum} failed with error: ${error.message}`, 'error');
    roundResults.error = error.message;
  }

  return roundResults;
}

// ========================================
// MAIN TEST EXECUTION
// ========================================

async function runAllTests() {
  console.log('\n' + '='.repeat(80));
  console.log('🔬 ULTRA-THINK CRUD VERIFICATION TEST - RUNNING 3 ROUNDS');
  console.log('='.repeat(80) + '\n');

  try {
    // Run 3 test rounds
    for (let i = 1; i <= 3; i++) {
      log(`\n\n${'#'.repeat(80)}`, 'test');
      log(`STARTING TEST CYCLE ${i} OF 3`, 'test');
      log('#'.repeat(80), 'test');

      // Round 1: Create product with images
      const round1Results = await testRound1_CreateProduct(i);
      testResults.rounds.push(round1Results);

      if (!round1Results.productId) {
        log(`\nTest cycle ${i} failed at creation - skipping edit and delete`, 'error');
        testResults.summary.warnings++;
        continue;
      }

      // Small delay between operations
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Round 2: Edit product
      const round2Results = await testRound2_EditProduct(round1Results.productId, i);
      testResults.rounds.push(round2Results);

      // Small delay before delete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Round 3: Delete product
      const round3Results = await testRound3_DeleteProduct(round1Results.productId, i);
      testResults.rounds.push(round3Results);

      log(`\nCompleted test cycle ${i}`, 'success');
    }

    // Generate final report
    log('\n\n' + '='.repeat(80), 'test');
    log('📊 FINAL TEST RESULTS', 'test');
    log('='.repeat(80), 'test');

    log(`\nTotal Tests Run: ${testResults.summary.totalTests}`, 'info');
    log(`✅ Passed: ${testResults.summary.passed}`, 'success');
    log(`❌ Failed: ${testResults.summary.failed}`, 'error');
    log(`⚠️  Warnings: ${testResults.summary.warnings}`, 'warning');

    const successRate = ((testResults.summary.passed / testResults.summary.totalTests) * 100).toFixed(2);
    log(`\nSuccess Rate: ${successRate}%`, successRate >= 90 ? 'success' : 'warning');

    // Save detailed results
    const reportPath = `./test-results-ultrathink-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
    log(`\nDetailed results saved to: ${reportPath}`, 'success');

    // Print summary of each round
    log('\n' + '='.repeat(80), 'test');
    log('ROUND-BY-ROUND SUMMARY', 'test');
    log('='.repeat(80), 'test');

    testResults.rounds.forEach((round, idx) => {
      const roundNum = Math.floor(idx / 3) + 1;
      const roundType = ['CREATE', 'EDIT', 'DELETE'][idx % 3];
      const passed = round.tests.filter(t => t.passed).length;
      const total = round.tests.length;

      log(`\nRound ${roundNum} - ${roundType}: ${passed}/${total} tests passed`,
        passed === total ? 'success' : 'warning');
    });

    // Final assessment
    log('\n' + '='.repeat(80), 'test');
    log('🎯 FINAL ASSESSMENT', 'test');
    log('='.repeat(80), 'test');

    if (testResults.summary.failed === 0) {
      log('\n✅ ALL TESTS PASSED! CRUD operations are working correctly.', 'success');
      log('✅ Product creation works', 'success');
      log('✅ Images are saved to database', 'success');
      log('✅ ProductImage links are correct', 'success');
      log('✅ Images are retrieved with products', 'success');
      log('✅ Product updates preserve images', 'success');
      log('✅ Product deletion works', 'success');
    } else {
      log('\n⚠️  SOME TESTS FAILED - Review details above', 'warning');
      log(`Failed tests: ${testResults.summary.failed}`, 'error');
    }

  } catch (error) {
    log(`\nFatal error during test execution: ${error.message}`, 'error');
    console.error(error);
  } finally {
    await prisma.$disconnect();
    log('\nTest execution complete', 'success');
  }
}

// Run the tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
