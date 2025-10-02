/**
 * Test Data Generators
 * Generate consistent test data for module testing
 */

class DataGenerators {
  /**
   * Generate quantity test configurations
   */
  static generateQuantityConfigs() {
    return {
      standard: [
        { type: 'standard', value: '25', expected: 25 },
        { type: 'standard', value: '100', expected: 100 },
        { type: 'standard', value: '500', expected: 500 },
        { type: 'standard', value: '1000', expected: 1000 },
        { type: 'standard', value: '5000', expected: 5000 }
      ],
      custom: [
        { type: 'custom', value: 55000, expected: 55000 },
        { type: 'custom', value: 75000, expected: 75000 },
        { type: 'custom', value: 100000, expected: 100000 }
      ],
      invalid: [
        { type: 'custom', value: 54999, shouldError: true },
        { type: 'custom', value: 100001, shouldError: true },
        { type: 'custom', value: 'abc123', shouldError: true }
      ]
    };
  }

  /**
   * Generate size test configurations
   */
  static generateSizeConfigs() {
    return {
      standard: [
        { type: 'standard', value: '4x6', expected: { width: 4, height: 6 } },
        { type: 'standard', value: '5x7', expected: { width: 5, height: 7 } },
        { type: 'standard', value: '8.5x11', expected: { width: 8.5, height: 11 } },
        { type: 'standard', value: '11x17', expected: { width: 11, height: 17 } }
      ],
      custom: [
        { type: 'custom', width: 4.25, height: 5.5, exactSize: false },
        { type: 'custom', width: 5.75, height: 8.25, exactSize: true },
        { type: 'custom', width: 8.75, height: 11.25, exactSize: false }
      ],
      invalid: [
        { type: 'custom', width: 4.3, height: 5.5, shouldError: true },
        { type: 'custom', width: 5.67, height: 8.25, shouldError: true },
        { type: 'custom', width: 8.123, height: 11.456, shouldError: true }
      ]
    };
  }

  /**
   * Generate paper stock test configurations
   */
  static generatePaperStockConfigs() {
    return {
      combinations: [
        {
          paper: '14pt-cardstock',
          coating: 'matte',
          sides: 'single',
          description: '14pt Cardstock with Matte coating, Single-sided'
        },
        {
          paper: '16pt-cardstock',
          coating: 'gloss',
          sides: 'double',
          description: '16pt Cardstock with Gloss coating, Double-sided'
        },
        {
          paper: '100lb-text',
          coating: 'uncoated',
          sides: 'single',
          description: '100lb Text with Uncoated finish, Single-sided'
        },
        {
          paper: '14pt-cardstock',
          coating: 'uv',
          sides: 'double',
          description: '14pt Cardstock with UV coating, Double-sided'
        }
      ],
      cascadeTests: [
        {
          initialPaper: '14pt-cardstock',
          changeToPaper: '16pt-cardstock',
          expectedCoatingChange: true,
          expectedSidesChange: false
        }
      ]
    };
  }

  /**
   * Generate addon test configurations
   */
  static generateAddonConfigs() {
    return {
      basic: [
        { addons: ['variable-data'], description: 'Variable Data only' },
        { addons: ['perforation'], description: 'Perforation only' },
        { addons: ['corner-rounding'], description: 'Corner Rounding only' },
        { addons: ['banding'], description: 'Banding only' }
      ],
      complex: [
        {
          variableData: { enabled: true, locations: 5 },
          perforation: { enabled: true, vertical: 2, horizontal: 1 },
          description: 'Variable Data + Perforation'
        },
        {
          cornerRounding: { enabled: true, type: '4-corners' },
          banding: { enabled: true, itemsPerBundle: 25 },
          description: 'Corner Rounding + Banding'
        }
      ],
      comprehensive: {
        variableData: { enabled: true, locations: 10 },
        perforation: { enabled: true, vertical: 3, horizontal: 2 },
        cornerRounding: { enabled: true, type: '2-corners' },
        banding: { enabled: true, itemsPerBundle: 50 },
        description: 'All addons enabled'
      }
    };
  }

  /**
   * Generate turnaround test configurations
   */
  static generateTurnaroundConfigs() {
    return {
      basic: [
        { turnaroundId: 'rush-1day', expected: { days: 1, type: 'rush' } },
        { turnaroundId: 'standard-3day', expected: { days: 3, type: 'standard' } },
        { turnaroundId: 'economy-7day', expected: { days: 7, type: 'economy' } }
      ],
      restrictions: [
        {
          turnaroundId: 'rush-1day',
          requiresNoCoating: true,
          expectedCoatingChange: 'no-coating'
        }
      ],
      pricing: [
        { turnaroundId: 'rush-1day', expectedPremium: true },
        { turnaroundId: 'standard-3day', expectedPremium: false },
        { turnaroundId: 'economy-7day', expectedDiscount: true }
      ]
    };
  }

  /**
   * Generate complete product configurations for integration tests
   */
  static generateCompleteProductConfigs() {
    return [
      {
        name: 'Business Cards - Standard Configuration',
        basic: {
          name: 'Standard Business Cards',
          category: 'business-cards'
        },
        quantity: { type: 'standard', value: '1000' },
        size: { type: 'standard', value: '3.5x2' },
        paperStock: { paper: '14pt-cardstock', coating: 'matte', sides: 'double' },
        addons: { variableData: { enabled: true, locations: 5 } },
        turnaround: { turnaroundId: 'standard-3day' }
      },
      {
        name: 'Custom Flyers - Rush Order',
        basic: {
          name: 'Custom Marketing Flyers',
          category: 'flyers'
        },
        quantity: { type: 'custom', value: 75000 },
        size: { type: 'custom', width: 5.25, height: 8.75, exactSize: true },
        paperStock: { paper: '100lb-text', coating: 'gloss', sides: 'single' },
        addons: {
          perforation: { enabled: true, vertical: 2 },
          cornerRounding: { enabled: true, type: '4-corners' }
        },
        turnaround: { turnaroundId: 'rush-1day' }
      },
      {
        name: 'Premium Brochures - Full Configuration',
        basic: {
          name: 'Premium Tri-fold Brochures',
          category: 'brochures'
        },
        quantity: { type: 'standard', value: '2500' },
        size: { type: 'standard', value: '8.5x11' },
        paperStock: { paper: '16pt-cardstock', coating: 'uv', sides: 'double' },
        addons: {
          variableData: { enabled: true, locations: 10 },
          perforation: { enabled: true, vertical: 1, horizontal: 2 },
          cornerRounding: { enabled: true, type: '2-corners' },
          banding: { enabled: true, itemsPerBundle: 25 }
        },
        turnaround: { turnaroundId: 'standard-5day' }
      },
      {
        name: 'Basic Postcards - Minimal Configuration',
        basic: {
          name: 'Simple Postcards',
          category: 'postcards'
        },
        quantity: { type: 'standard', value: '500' },
        size: { type: 'standard', value: '4x6' },
        paperStock: { paper: '14pt-cardstock', coating: 'matte', sides: 'single' },
        addons: {},
        turnaround: { turnaroundId: 'economy-7day' }
      },
      {
        name: 'Complex Door Hangers - All Modules',
        basic: {
          name: 'Custom Door Hangers',
          category: 'door-hangers'
        },
        quantity: { type: 'custom', value: 85000 },
        size: { type: 'custom', width: 4.25, height: 11, exactSize: false },
        paperStock: { paper: '16pt-cardstock', coating: 'gloss', sides: 'double' },
        addons: {
          variableData: { enabled: true, locations: 3 },
          perforation: { enabled: true, vertical: 1 },
          cornerRounding: { enabled: true, type: '4-corners' }
        },
        turnaround: { turnaroundId: 'rush-2day' }
      }
    ];
  }

  /**
   * Generate error test scenarios
   */
  static generateErrorScenarios() {
    return {
      quantity: [
        { input: -100, expectedError: 'Quantity must be positive' },
        { input: 'invalid', expectedError: 'Please enter a valid number' },
        { input: 150000, expectedError: 'Maximum quantity exceeded' }
      ],
      size: [
        { width: 0.1, height: 5, expectedError: 'Minimum width not met' },
        { width: 5, height: 0.1, expectedError: 'Minimum height not met' },
        { width: 4.33, height: 5, expectedError: 'Must be in 0.25" increments' }
      ],
      addons: [
        { variableData: { locations: -1 }, expectedError: 'Invalid location count' },
        { banding: { itemsPerBundle: 0 }, expectedError: 'Items per bundle must be positive' }
      ]
    };
  }

  /**
   * Generate performance test data
   */
  static generatePerformanceTestData() {
    return {
      largeQuantity: { type: 'custom', value: 100000 },
      complexAddons: {
        variableData: { enabled: true, locations: 50 },
        perforation: { enabled: true, vertical: 10, horizontal: 10 },
        cornerRounding: { enabled: true },
        banding: { enabled: true, itemsPerBundle: 100 }
      },
      rapidConfigChanges: [
        { module: 'quantity', changes: 10 },
        { module: 'size', changes: 8 },
        { module: 'paperStock', changes: 12 },
        { module: 'addons', changes: 15 },
        { module: 'turnaround', changes: 5 }
      ]
    };
  }

  /**
   * Get random test configuration
   */
  static getRandomConfig(type) {
    const configs = {
      quantity: this.generateQuantityConfigs(),
      size: this.generateSizeConfigs(),
      paperStock: this.generatePaperStockConfigs(),
      addons: this.generateAddonConfigs(),
      turnaround: this.generateTurnaroundConfigs()
    };

    const typeConfigs = configs[type];
    if (!typeConfigs) return null;

    // Get random config from the type
    const keys = Object.keys(typeConfigs);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const configArray = typeConfigs[randomKey];

    if (Array.isArray(configArray)) {
      return configArray[Math.floor(Math.random() * configArray.length)];
    }

    return configArray;
  }

  /**
   * Generate test matrix for comprehensive coverage
   */
  static generateTestMatrix() {
    const quantities = this.generateQuantityConfigs().standard.slice(0, 3);
    const sizes = this.generateSizeConfigs().standard.slice(0, 3);
    const papers = this.generatePaperStockConfigs().combinations.slice(0, 3);
    const turnarounds = this.generateTurnaroundConfigs().basic;

    const matrix = [];

    // Generate all combinations
    quantities.forEach(quantity => {
      sizes.forEach(size => {
        papers.forEach(paper => {
          turnarounds.forEach(turnaround => {
            matrix.push({
              quantity,
              size,
              paperStock: paper,
              turnaround
            });
          });
        });
      });
    });

    return matrix;
  }
}

module.exports = DataGenerators;