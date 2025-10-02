/**
 * CSS Selectors for Product Configuration Modules
 * These target the modular components we created
 */

module.exports = {
  // Admin Product Creation Page
  admin: {
    productForm: '[data-testid="product-form"]',
    basicInfo: {
      name: '#name',
      sku: '#sku',
      category: '#category',
      description: '#description'
    },
    imageUpload: {
      uploadZone: '[data-testid="image-upload-zone"]',
      fileInput: 'input[type="file"]',
      uploadButton: '[data-testid="upload-button"]',
      uploadProgress: '[data-testid="upload-progress"]',
      uploadSuccess: '[data-testid="upload-success"]'
    },
    saveButton: '[data-testid="save-product"]',
    publishButton: '[data-testid="publish-product"]'
  },

  // Quantity Module Selectors
  quantity: {
    module: '[data-testid="quantity-module"]',
    dropdown: '#quantity',
    trigger: '[data-testid="quantity-trigger"]',
    customOption: '[data-value="custom"]',
    customInput: 'input[placeholder*="custom quantity"]',
    errorMessage: '[data-testid="quantity-error"]',
    value: (value) => `[data-value="${value}"]`,
    selectedValue: '[data-testid="quantity-selected"]'
  },

  // Size Module Selectors
  size: {
    module: '[data-testid="size-module"]',
    dropdown: '#size',
    trigger: '[data-testid="size-trigger"]',
    customOption: '[data-value="custom"]',
    customWidth: '#width',
    customHeight: '#height',
    exactSizeCheckbox: '#exactSize',
    errorMessage: '[data-testid="size-error"]',
    dimensionsDisplay: '[data-testid="size-dimensions"]',
    value: (value) => `[data-value="${value}"]`
  },

  // Paper Stock Module Selectors
  paperStock: {
    module: '[data-testid="paper-stock-module"]',
    paperDropdown: '[data-testid="paper-select"]',
    coatingDropdown: '[data-testid="coating-select"]',
    sidesDropdown: '[data-testid="sides-select"]',
    paperOption: (paperId) => `[data-value="${paperId}"]`,
    coatingOption: (coatingId) => `[data-value="${coatingId}"]`,
    sidesOption: (sidesId) => `[data-value="${sidesId}"]`,
    tooltip: '[data-testid="paper-tooltip"]',
    description: '[data-testid="paper-description"]'
  },

  // Addons Module Selectors
  addons: {
    module: '[data-testid="addons-module"]',
    accordion: '[data-testid="addons-accordion"]',
    trigger: '[data-testid="addons-trigger"]',
    checkbox: (addonId) => `[data-testid="addon-${addonId}"]`,
    variableData: {
      enable: '[data-testid="variable-data-enable"]',
      locations: '[data-testid="variable-data-locations"]',
      locationsInput: '[data-testid="variable-data-locations-input"]'
    },
    perforation: {
      enable: '[data-testid="perforation-enable"]',
      vertical: '[data-testid="perforation-vertical"]',
      horizontal: '[data-testid="perforation-horizontal"]'
    },
    cornerRounding: {
      enable: '[data-testid="corner-rounding-enable"]',
      type: '[data-testid="corner-rounding-type"]'
    },
    banding: {
      enable: '[data-testid="banding-enable"]',
      type: '[data-testid="banding-type"]',
      itemsPerBundle: '[data-testid="banding-items"]'
    }
  },

  // Turnaround Module Selectors
  turnaround: {
    module: '[data-testid="turnaround-module"]',
    dropdown: '[data-testid="turnaround-select"]',
    option: (turnaroundId) => `[data-value="${turnaroundId}"]`,
    deliveryDate: '[data-testid="delivery-date"]',
    businessDays: '[data-testid="business-days"]',
    rushPricing: '[data-testid="rush-pricing"]',
    description: '[data-testid="turnaround-description"]'
  },

  // Price Display
  pricing: {
    basePrice: '[data-testid="base-price"]',
    totalPrice: '[data-testid="total-price"]',
    quantityPrice: '[data-testid="quantity-price"]',
    sizePrice: '[data-testid="size-price"]',
    paperPrice: '[data-testid="paper-price"]',
    addonPrice: '[data-testid="addon-price"]',
    turnaroundPrice: '[data-testid="turnaround-price"]',
    priceBreakdown: '[data-testid="price-breakdown"]'
  },

  // Customer Frontend Selectors
  customer: {
    productPage: '[data-testid="product-page"]',
    configurationForm: '[data-testid="configuration-form"]',
    addToCart: '[data-testid="add-to-cart"]',
    priceDisplay: '[data-testid="price-display"]',
    quantitySelector: '[data-testid="customer-quantity"]',
    sizeSelector: '[data-testid="customer-size"]',
    paperSelector: '[data-testid="customer-paper"]',
    addonsSelector: '[data-testid="customer-addons"]',
    turnaroundSelector: '[data-testid="customer-turnaround"]'
  },

  // General UI Elements
  ui: {
    loading: '[data-testid="loading"]',
    error: '[data-testid="error"]',
    success: '[data-testid="success"]',
    modal: '[data-testid="modal"]',
    modalClose: '[data-testid="modal-close"]',
    tooltip: '[data-testid="tooltip"]',
    dropdown: '[role="combobox"]',
    dropdownOption: '[role="option"]',
    button: 'button',
    input: 'input',
    select: 'select'
  }
};