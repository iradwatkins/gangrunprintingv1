const puppeteer = require('puppeteer');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Test all 5 issues reported by user
async function testAllIssues() {
  console.log('\n🧪 COMPREHENSIVE PRODUCT CRUD TEST\n' + '='.repeat(60));

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Create admin session
  const sessionId = 'test-session-' + Date.now();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

  await prisma.session.create({
    data: {
      id: sessionId,
      userId: 'cmg46s7ff0000vuu43qg57vlr',
      expiresAt: expiresAt,
    },
  });

  await page.setCookie({
    name: 'auth_session',
    value: sessionId,
    domain: 'gangrunprinting.com',
    path: '/',
    expires: Math.floor(expiresAt.getTime() / 1000),
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
  });

  console.log('✅ Admin session created\n');

  // Test 1: Product creation (should work now)
  console.log('Test 1: Product Creation');
  console.log('-'.repeat(60));

  await page.goto('https://gangrunprinting.com/admin/products/new', {
    waitUntil: 'networkidle0',
  });

  // Quick fill
  await page.click('button::-p-text(Quick Fill)');
  await new Promise(r => setTimeout(r, 1000));

  // Create product
  await page.click('button::-p-text(Create Product)');
  await new Promise(r => setTimeout(r, 3000));

  // Check if redirected to products list
  const url1 = page.url();
  const productCreated = url1.includes('/admin/products') && !url1.includes('/new');
  console.log(`Product created: ${productCreated ? '✅' : '❌'}`);
  console.log(`Current URL: ${url1}\n`);

  // Get the last created product
  const lastProduct = await prisma.product.findFirst({
    where: { sku: { startsWith: 'test-product-' } },
    orderBy: { createdAt: 'desc' },
  });

  if (!lastProduct) {
    console.log('❌ No product found in database\n');
    await browser.close();
    return;
  }

  console.log(`Product ID: ${lastProduct.id}`);
  console.log(`Product SKU: ${lastProduct.sku}\n`);

  // Test 2: Edit page shows data
  console.log('Test 2: Edit Page Data Loading');
  console.log('-'.repeat(60));

  await page.goto(`https://gangrunprinting.com/admin/products/${lastProduct.id}/edit`, {
    waitUntil: 'networkidle0',
  });

  await new Promise(r => setTimeout(r, 2000));

  // Check if form has data
  const nameValue = await page.$eval('#name', el => el.value);
  const skuValue = await page.$eval('#sku', el => el.value);

  const hasData = nameValue !== '' && skuValue !== '';
  console.log(`Edit form has data: ${hasData ? '✅' : '❌'}`);
  console.log(`Product Name: ${nameValue}`);
  console.log(`Product SKU: ${skuValue}\n`);

  // Test 3: Save changes
  console.log('Test 3: Save Changes');
  console.log('-'.repeat(60));

  // Modify the name
  const newName = `Updated Product ${Date.now()}`;
  await page.$eval('#name', (el, val) => { el.value = val; }, newName);

  // Click save
  await page.click('button::-p-text(Save Changes)');
  await new Promise(r => setTimeout(r, 3000));

  // Check if redirected back to list
  const url3 = page.url();
  const saveWorked = url3.includes('/admin/products') && !url3.includes('/edit');
  console.log(`Save changes worked: ${saveWorked ? '✅' : '❌'}`);

  // Verify in database
  const updatedProduct = await prisma.product.findUnique({
    where: { id: lastProduct.id },
  });

  const nameUpdated = updatedProduct.name === newName;
  console.log(`Name updated in DB: ${nameUpdated ? '✅' : '❌'}`);
  console.log(`New name: ${updatedProduct.name}\n`);

  // Test 4: Automatic SKU generation
  console.log('Test 4: Automatic SKU Generation');
  console.log('-'.repeat(60));

  await page.goto('https://gangrunprinting.com/admin/products/new', {
    waitUntil: 'networkidle0',
  });

  // Enter product name without SKU
  const testName = `SKU Test ${Date.now()}`;
  await page.type('#name', testName);
  await new Promise(r => setTimeout(r, 500));

  // Check if SKU was auto-generated
  const autoSKU = await page.$eval('#sku', el => el.value);
  const skuGenerated = autoSKU !== '';
  console.log(`Auto SKU generated: ${skuGenerated ? '✅' : '❌'}`);
  console.log(`Generated SKU: ${autoSKU || '(empty)'}\n`);

  // Test 5: Image upload (basic check - full test needs actual file)
  console.log('Test 5: Image Upload Component');
  console.log('-'.repeat(60));

  // Check if image upload component exists
  const imageUploadExists = await page.$('input[type="file"]') !== null;
  console.log(`Image upload component exists: ${imageUploadExists ? '✅' : '❌'}\n`);

  // Summary
  console.log('='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`1. Product Creation: ${productCreated ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`2. Edit Page Data: ${hasData ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`3. Save Changes: ${saveWorked && nameUpdated ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`4. Auto SKU: ${skuGenerated ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`5. Image Upload: ${imageUploadExists ? '✅ PASS' : '❌ FAIL'}\n`);

  await browser.close();

  // Clean up test session
  await prisma.session.delete({
    where: { id: sessionId },
  });
}

testAllIssues().catch(console.error).finally(() => process.exit());
