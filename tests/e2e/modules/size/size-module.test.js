/**
 * Size Module Testing Suite
 * 5 comprehensive tests for size selection functionality
 */

const puppeteer = require('puppeteer');
const TestHelpers = require('../utils/test-helpers');
const DataGenerators = require('../utils/data-generators');
const selectors = require('../utils/selectors');

describe('Size Module Tests', () => {
  let browser;
  let page;
  let helpers;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false,
      slowMo: 50,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
  });

  beforeEach(async () => {
    page = await browser.newPage();
    helpers = new TestHelpers(page);
    await page.setViewport({ width: 1920, height: 1080 });
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  });

  afterEach(async () => {
    await helpers.takeScreenshot('size-test-end');
    await page.close();
  });

  afterAll(async () => {
    await browser.close();
  });

  /**
   * TEST 1: Standard Size Selection
   * Tests all standard size options and dimension display
   */
  describe('Test 1: Standard Size Selection', () => {
    test('should select standard sizes and verify dimensions display', async () => {
      console.log('🧪 Starting Size Test 1: Standard Size Selection');

      await helpers.navigateToProductCreation();
      await helpers.takeScreenshot('size-test1-start');

      // Basic setup
      const productData = await helpers.fillBasicProductInfo({
        name: 'Size Test 1 - Standard Sizes',
        category: 'business-cards'
      });

      await helpers.uploadDemoImage();
      await helpers.takeScreenshot('size-test1-image-uploaded');

      // Configure basic quantity first
      await helpers.configureQuantity({ type: 'standard', value: '1000' });

      // Get standard size configurations
      const sizeConfigs = DataGenerators.generateSizeConfigs().standard;
      const sizeResults = [];

      for (const config of sizeConfigs) {
        console.log(`Testing standard size: ${config.value} (${config.expected.width}"×${config.expected.height}")`);

        // Configure size
        await helpers.configureSize(config);
        await helpers.takeScreenshot(`size-test1-${config.value.replace('x', 'by')}`);

        // Wait for size processing
        await page.waitForTimeout(2000);

        // Verify size selection
        const selectedText = await page.textContent(selectors.size.dropdown);
        console.log(`Selected size text: ${selectedText}`);

        // Check for dimensions display
        const dimensionsElement = await page.$(selectors.size.dimensionsDisplay);
        if (dimensionsElement) {
          const dimensionsText = await dimensionsElement.textContent();
          console.log(`Dimensions display: ${dimensionsText}`);
          expect(dimensionsText).toContain(config.expected.width.toString());
          expect(dimensionsText).toContain(config.expected.height.toString());
        }

        // Verify price updates with size
        const currentPrice = await helpers.getCurrentPrice();
        if (currentPrice !== null) {
          console.log(`Price for ${config.value}: $${currentPrice}`);
          sizeResults.push({
            size: config.value,
            price: currentPrice,
            width: config.expected.width,
            height: config.expected.height,
            area: config.expected.width * config.expected.height
          });
        }
      }

      // Verify that larger sizes generally cost more
      sizeResults.sort((a, b) => a.area - b.area);
      for (let i = 1; i < sizeResults.length; i++) {
        if (sizeResults[i].area > sizeResults[i-1].area * 1.5) {
          expect(sizeResults[i].price).toBeGreaterThanOrEqual(sizeResults[i-1].price);
        }
      }

      const saved = await helpers.saveProduct();
      expect(saved).toBe(true);

      await helpers.takeScreenshot('size-test1-saved');
      console.log('✅ Size Test 1 completed successfully');
      console.log('Size results:', sizeResults);
    }, 120000);
  });

  /**
   * TEST 2: Custom Size Input
   * Tests custom dimension input functionality
   */
  describe('Test 2: Custom Size Input', () => {
    test('should handle custom dimension inputs correctly', async () => {
      console.log('🧪 Starting Size Test 2: Custom Size Input');

      await helpers.navigateToProductCreation();
      await helpers.takeScreenshot('size-test2-start');

      // Basic setup
      await helpers.fillBasicProductInfo({
        name: 'Size Test 2 - Custom Dimensions',
        category: 'flyers'
      });

      await helpers.uploadDemoImage();
      await helpers.configureQuantity({ type: 'standard', value: '1000' });

      // Get custom size configurations
      const customConfigs = DataGenerators.generateSizeConfigs().custom;

      for (const config of customConfigs) {
        console.log(`Testing custom size: ${config.width}"×${config.height}"`);

        // Configure custom size
        await helpers.configureSize(config);
        await helpers.takeScreenshot(`size-test2-custom-${config.width}x${config.height}`);

        // Wait for processing
        await page.waitForTimeout(3000);

        // Verify custom inputs show correct values
        const widthInput = await page.$(selectors.size.customWidth);
        const heightInput = await page.$(selectors.size.customHeight);

        if (widthInput && heightInput) {
          const widthValue = await widthInput.evaluate(el => el.value);
          const heightValue = await heightInput.evaluate(el => el.value);

          expect(parseFloat(widthValue)).toBe(config.width);
          expect(parseFloat(heightValue)).toBe(config.height);

          console.log(`Custom dimensions confirmed: ${widthValue}"×${heightValue}"`);
        }

        // Verify exact size checkbox if specified
        if (config.exactSize) {
          const checkbox = await page.$(selectors.size.exactSizeCheckbox);
          if (checkbox) {
            const isChecked = await checkbox.evaluate(el => el.checked);
            expect(isChecked).toBe(true);
            console.log('Exact size requirement confirmed');
          }
        }

        // Verify no error messages for valid dimensions
        const errorElement = await page.$(selectors.size.errorMessage);
        if (errorElement) {
          const errorText = await errorElement.textContent();
          expect(errorText).toBe('');
        }

        // Calculate and verify square inches
        const expectedArea = config.width * config.height;
        console.log(`Expected area: ${expectedArea} square inches`);

        // Verify price calculation
        const currentPrice = await helpers.getCurrentPrice();
        expect(currentPrice).toBeGreaterThan(0);
        console.log(`Price for ${config.width}"×${config.height}": $${currentPrice}`);
      }

      const saved = await helpers.saveProduct();
      expect(saved).toBe(true);

      await helpers.takeScreenshot('size-test2-saved');
      console.log('✅ Size Test 2 completed successfully');
    }, 120000);
  });

  /**
   * TEST 3: Size Validation (0.25" Increments)
   * Tests the critical 0.25" increment validation
   */
  describe('Test 3: Size Validation (0.25" Increments)', () => {
    test('should enforce 0.25" increment rule and show helpful errors', async () => {
      console.log('🧪 Starting Size Test 3: Size Validation (0.25" Increments)');

      await helpers.navigateToProductCreation();
      await helpers.takeScreenshot('size-test3-start');

      // Basic setup
      await helpers.fillBasicProductInfo({
        name: 'Size Test 3 - Validation',
        category: 'postcards'
      });

      await helpers.uploadDemoImage();
      await helpers.configureQuantity({ type: 'standard', value: '1000' });

      // Get invalid size configurations
      const invalidConfigs = DataGenerators.generateSizeConfigs().invalid;

      for (const config of invalidConfigs) {
        console.log(`Testing invalid dimensions: ${config.width}"×${config.height}" (should error)`);

        // Try to configure invalid dimensions
        await helpers.configureSize(config);
        await helpers.takeScreenshot(`size-test3-invalid-${config.width}x${config.height}`);

        // Wait for validation
        await page.waitForTimeout(3000);

        // Check for error messages
        const widthErrorExists = await helpers.waitForSelectorSafe(selectors.size.errorMessage, 5000);

        if (widthErrorExists) {
          const errorText = await page.textContent(selectors.size.errorMessage);
          console.log(`Error message for ${config.width}×${config.height}: "${errorText}"`);

          // Verify error mentions 0.25" increments
          expect(errorText.toLowerCase()).toContain('0.25');
          expect(errorText.toLowerCase()).toContain('increment');

          // Verify error suggests valid alternatives
          const suggestion = errorText.match(/Try ([\d.]+)"|or ([\d.]+)"/g);
          if (suggestion) {
            console.log('Error provides helpful suggestions:', suggestion);
          }
        } else {
          // Alternative: check if invalid values are rejected/corrected
          const widthInput = await page.$(selectors.size.customWidth);
          const heightInput = await page.$(selectors.size.customHeight);

          if (widthInput && heightInput) {
            const widthValue = await widthInput.evaluate(el => el.value);
            const heightValue = await heightInput.evaluate(el => el.value);

            // Values should either be cleared or auto-corrected to valid increments
            if (widthValue && heightValue) {
              const width = parseFloat(widthValue);
              const height = parseFloat(heightValue);

              // Check if auto-corrected to valid increments
              expect(width % 0.25).toBe(0);
              expect(height % 0.25).toBe(0);

              console.log(`Auto-corrected to valid dimensions: ${width}"×${height}"`);
            }
          }
        }
      }

      // Test boundary cases
      const boundaryTests = [
        { width: 0.25, height: 0.25, description: 'Minimum valid size' },
        { width: 48, height: 48, description: 'Large valid size' },
        { width: 4.75, height: 6.25, description: 'Common valid increments' }
      ];

      for (const test of boundaryTests) {
        console.log(`Testing boundary case: ${test.description} (${test.width}"×${test.height}")`);

        await helpers.configureSize({
          type: 'custom',
          width: test.width,
          height: test.height
        });

        await page.waitForTimeout(2000);

        // Should have no errors
        const errorElement = await page.$(selectors.size.errorMessage);
        if (errorElement) {
          const errorText = await errorElement.textContent();
          expect(errorText).toBe('');
        }

        await helpers.takeScreenshot(`size-test3-boundary-${test.width}x${test.height}`);
      }

      // Reset to valid size for save
      await helpers.configureSize({ type: 'standard', value: '4x6' });

      const saved = await helpers.saveProduct();
      expect(saved).toBe(true);

      await helpers.takeScreenshot('size-test3-saved');
      console.log('✅ Size Test 3 completed successfully');
    }, 150000);
  });

  /**
   * TEST 4: Exact Size Requirement
   * Tests exact size checkbox functionality
   */
  describe('Test 4: Exact Size Requirement', () => {
    test('should handle exact size requirement correctly', async () => {
      console.log('🧪 Starting Size Test 4: Exact Size Requirement');

      await helpers.navigateToProductCreation();
      await helpers.takeScreenshot('size-test4-start');

      // Basic setup
      await helpers.fillBasicProductInfo({
        name: 'Size Test 4 - Exact Size Requirement',
        category: 'brochures'
      });

      await helpers.uploadDemoImage();
      await helpers.configureQuantity({ type: 'standard', value: '1000' });

      // Test exact size with standard sizes
      console.log('Testing exact size with standard size selection');

      await helpers.configureSize({ type: 'standard', value: '8.5x11' });
      await page.waitForTimeout(2000);

      // Check exact size checkbox
      const exactSizeCheckbox = await page.$(selectors.size.exactSizeCheckbox);
      if (exactSizeCheckbox) {
        // Test checking the checkbox
        await exactSizeCheckbox.click();
        await page.waitForTimeout(1000);

        const isChecked = await exactSizeCheckbox.evaluate(el => el.checked);
        expect(isChecked).toBe(true);

        console.log('Exact size checkbox checked successfully');
        await helpers.takeScreenshot('size-test4-exact-checked');

        // Test unchecking
        await exactSizeCheckbox.click();
        await page.waitForTimeout(1000);

        const isUnchecked = await exactSizeCheckbox.evaluate(el => el.checked);
        expect(isUnchecked).toBe(false);

        console.log('Exact size checkbox unchecked successfully');
      }

      // Test exact size with custom dimensions
      console.log('Testing exact size with custom dimensions');

      await helpers.configureSize({
        type: 'custom',
        width: 5.25,
        height: 8.75,
        exactSize: true
      });

      await page.waitForTimeout(2000);
      await helpers.takeScreenshot('size-test4-custom-exact');

      // Verify checkbox state persists
      if (exactSizeCheckbox) {
        const isCheckedAfterCustom = await exactSizeCheckbox.evaluate(el => el.checked);
        expect(isCheckedAfterCustom).toBe(true);
        console.log('Exact size requirement persisted with custom dimensions');
      }

      // Test exact size affects pricing (if implemented)
      const priceWithExact = await helpers.getCurrentPrice();

      // Uncheck exact size and compare price
      if (exactSizeCheckbox) {
        await exactSizeCheckbox.click();
        await page.waitForTimeout(2000);

        const priceWithoutExact = await helpers.getCurrentPrice();

        if (priceWithExact && priceWithoutExact) {
          console.log(`Price with exact size: $${priceWithExact}`);
          console.log(`Price without exact size: $${priceWithoutExact}`);

          // Exact size might have a premium (implementation dependent)
          // At minimum, prices should be positive
          expect(priceWithExact).toBeGreaterThan(0);
          expect(priceWithoutExact).toBeGreaterThan(0);
        }
      }

      // Test multiple size changes with exact size
      const testSizes = [
        { type: 'standard', value: '4x6' },
        { type: 'custom', width: 6.5, height: 9 },
        { type: 'standard', value: '11x17' }
      ];

      for (const size of testSizes) {
        console.log(`Testing exact size persistence with: ${JSON.stringify(size)}`);

        // Enable exact size
        if (exactSizeCheckbox) {
          await exactSizeCheckbox.click();
          await page.waitForTimeout(500);
        }

        // Change size
        await helpers.configureSize(size);
        await page.waitForTimeout(2000);

        // Verify exact size is still checked
        if (exactSizeCheckbox) {
          const stillChecked = await exactSizeCheckbox.evaluate(el => el.checked);
          expect(stillChecked).toBe(true);
          console.log(`Exact size persisted through size change to ${JSON.stringify(size)}`);
        }

        await helpers.takeScreenshot(`size-test4-persistence-${size.type}`);
      }

      const saved = await helpers.saveProduct();
      expect(saved).toBe(true);

      await helpers.takeScreenshot('size-test4-saved');
      console.log('✅ Size Test 4 completed successfully');
    }, 150000);
  });

  /**
   * TEST 5: Size-Based Paper Compatibility
   * Tests size interaction with paper stock limitations
   */
  describe('Test 5: Size-Based Paper Compatibility', () => {
    test('should handle size-paper compatibility correctly', async () => {
      console.log('🧪 Starting Size Test 5: Size-Based Paper Compatibility');

      await helpers.navigateToProductCreation();
      await helpers.takeScreenshot('size-test5-start');

      // Basic setup
      await helpers.fillBasicProductInfo({
        name: 'Size Test 5 - Paper Compatibility',
        category: 'door-hangers'
      });

      await helpers.uploadDemoImage();
      await helpers.configureQuantity({ type: 'standard', value: '1000' });

      // Test with different size configurations
      const sizeTestCases = [
        {
          size: { type: 'standard', value: '4x6' },
          description: 'Small standard size',
          expectMostPapersAvailable: true
        },
        {
          size: { type: 'custom', width: 12, height: 18 },
          description: 'Large custom size',
          expectSomePapersRestricted: true
        },
        {
          size: { type: 'custom', width: 24, height: 36 },
          description: 'Very large custom size',
          expectManyPapersRestricted: true
        }
      ];

      for (const testCase of sizeTestCases) {
        console.log(`Testing size-paper compatibility: ${testCase.description}`);

        // Configure size
        await helpers.configureSize(testCase.size);
        await page.waitForTimeout(3000); // Wait for size-based filtering

        await helpers.takeScreenshot(`size-test5-${testCase.description.replace(/\s+/g, '-')}`);

        // Check available paper options
        const paperDropdownExists = await helpers.waitForSelectorSafe(selectors.paperStock.paperDropdown, 5000);

        if (paperDropdownExists) {
          // Click paper dropdown to see options
          await page.click(selectors.paperStock.paperDropdown);
          await page.waitForTimeout(1000);

          // Count available paper options
          const paperOptions = await page.$$('[role="option"]');
          const availablePaperCount = paperOptions.length;

          console.log(`Available paper options for ${testCase.description}: ${availablePaperCount}`);

          // Verify compatibility expectations
          if (testCase.expectMostPapersAvailable) {
            expect(availablePaperCount).toBeGreaterThan(3);
          }

          if (testCase.expectSomePapersRestricted) {
            // Some papers should still be available, but possibly fewer than with small sizes
            expect(availablePaperCount).toBeGreaterThan(0);
          }

          // Try selecting a paper option
          if (paperOptions.length > 0) {
            await paperOptions[0].click();
            await page.waitForTimeout(1000);
            console.log('Successfully selected paper with size configuration');
          }

          // Close dropdown if still open
          try {
            await page.click(selectors.paperStock.paperDropdown);
            await page.waitForTimeout(500);
          } catch (error) {
            // Dropdown already closed
          }
        }

        // Verify price updates with size-paper combination
        const currentPrice = await helpers.getCurrentPrice();
        expect(currentPrice).toBeGreaterThan(0);

        console.log(`Price for ${testCase.description} with paper: $${currentPrice}`);
      }

      // Test size change after paper selection
      console.log('Testing size change after paper selection');

      // Select a specific paper first
      const paperDropdownExists = await helpers.waitForSelectorSafe(selectors.paperStock.paperDropdown, 5000);
      if (paperDropdownExists) {
        await page.click(selectors.paperStock.paperDropdown);
        await page.waitForTimeout(1000);

        const paperOptions = await page.$$('[role="option"]');
        if (paperOptions.length > 0) {
          await paperOptions[0].click();
          await page.waitForTimeout(1000);
        }
      }

      // Now change size and verify paper selection updates if needed
      await helpers.configureSize({ type: 'standard', value: '8.5x11' });
      await page.waitForTimeout(3000);

      // Verify paper is still selected or appropriately updated
      const finalPrice = await helpers.getCurrentPrice();
      expect(finalPrice).toBeGreaterThan(0);

      await helpers.takeScreenshot('size-test5-final-compatibility');

      const saved = await helpers.saveProduct();
      expect(saved).toBe(true);

      await helpers.takeScreenshot('size-test5-saved');
      console.log('✅ Size Test 5 completed successfully');
    }, 180000);
  });
});

// Additional integration helper for size module
describe('Size Module Integration Helpers', () => {
  test('should export proper size configuration for other modules', async () => {
    const sizeConfigs = DataGenerators.generateSizeConfigs();

    expect(sizeConfigs).toHaveProperty('standard');
    expect(sizeConfigs).toHaveProperty('custom');
    expect(sizeConfigs).toHaveProperty('invalid');

    expect(sizeConfigs.standard.length).toBeGreaterThan(0);
    expect(sizeConfigs.custom.length).toBeGreaterThan(0);
    expect(sizeConfigs.invalid.length).toBeGreaterThan(0);

    // Verify 0.25" increment validation in data
    const customConfigs = sizeConfigs.custom;
    for (const config of customConfigs) {
      expect(config.width % 0.25).toBe(0);
      expect(config.height % 0.25).toBe(0);
    }

    console.log('✅ Size module data generators working correctly');
  });
});