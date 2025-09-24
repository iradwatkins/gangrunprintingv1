/**
 * pricing-engine - types definitions
 * Auto-refactored by BMAD
 */

export interface PaperStock {
  id: string
  name: string
  pricePerSqInch: number
  secondSideMarkupPercent: number
  defaultCoatingId?: string
}

export interface PrintSize {
  id: string
  name: string
  width: number // inches
  height: number // inches
  isCustom: boolean
}

export interface TurnaroundTime {
  id: string
  name: string
  priceMarkupPercent: number
  businessDays: number
}

export interface AddOnConfiguration {
  // Our Tagline - 5% discount
  ourTagline?: {
    selected: boolean
    discountPercentage: number
  }

  // Exact Size - 12.5% markup
  exactSize?: {
    selected: boolean
    markupPercentage: number
  }

  // Digital Proof - $5.00 flat fee
  digitalProof?: {
    selected: boolean
    price: number
  }

  // Perforation - $20.00 setup + $0.01/piece
  perforation?: {
    selected: boolean
    setupFee: number
    pricePerPiece: number
    orientation: 'vertical' | 'horizontal'
    position: string
  }

  // Score Only - $17.00 setup + ($0.01 * scores)/piece
  scoreOnly?: {
    selected: boolean
    setupFee: number
    pricePerScorePerPiece: number
    numberOfScores: number
    positions: string
  }

  // Folding - Text: $0.17 + $0.01/pc, Card: $0.34 + $0.02/pc
  folding?: {
    selected: boolean
    foldType: string
    paperType: 'text_paper' | 'card_stock'
  }

  // Design Services - Variable pricing
  design?: {
    selected: boolean
    serviceType:
      | 'upload_artwork'
      | 'standard_custom'
      | 'rush_custom'
      | 'minor_changes'
      | 'major_changes'
    sides: 'one' | 'two'
  }

  // Banding - $0.75/bundle
  banding?: {
    selected: boolean
    pricePerBundle: number
    bandType: 'paper' | 'rubber'
    itemsPerBundle: number
  }

  // Shrink Wrapping - $0.30/bundle
  shrinkWrapping?: {
    selected: boolean
    pricePerBundle: number
    itemsPerBundle: number
  }

  // QR Code - $5.00 flat fee
  qrCode?: {
    selected: boolean
    price: number
    content: string
  }

  // Postal Delivery (DDU) - $30.00/box
  postalDelivery?: {
    selected: boolean
    pricePerBox: number
    numberOfBoxes: number
  }

  // EDDM Process & Postage - $50.00 + $0.239/piece
  eddmProcess?: {
    selected: boolean
    setupFee: number
    pricePerPiece: number
    routeSelection: 'us_select' | 'customer_provides'
    mandatoryBanding: boolean
  }

  // Hole Drilling - $20.00 + variable per-piece
  holeDrilling?: {
    selected: boolean
    setupFee: number
    holeType: 'custom' | 'binder_punch'
    numberOfHoles?: number
    binderType?: '2-hole' | '3-hole'
    holeSize: string
    position: string
  }
}

export interface BrokerDiscount {
  categoryId: string
  discountPercentage: number
}

export interface ProductConfiguration {
  paperStock: PaperStock
  printSize: PrintSize
  quantity: number
  sides: 'single' | 'double'
  turnaroundTime: TurnaroundTime
  addOns: AddOnConfiguration
  isBroker: boolean
  brokerDiscounts?: BrokerDiscount[]
  categoryId: string
}

export interface PriceCalculation {
  // Step 1: Base calculation
  effectiveQuantity: number
  effectiveArea: number
  paperStockBasePricePerSqInch: number
  sidesFactor: number
  basePaperPrintPrice: number

  // Step 2: Adjusted base
  brokerDiscountApplied: boolean
  brokerDiscountPercentage: number
  ourTaglineDiscountApplied: boolean
  taglineDiscountPercentage: number
  adjustedBasePrice: number

  // Step 3: Base modifiers
  exactSizeApplied: boolean
  exactSizeMarkupPercentage: number
  priceAfterBasePercentageModifiers: number

  // Step 4: Turnaround
  turnaroundMarkupPercentage: number
  priceAfterTurnaround: number

  // Step 5: Add-ons
  discreteAddonCosts: Array<{
    name: string
    cost: number
    calculationDetails: string
  }>
  totalAddonCost: number

  // Final
  calculatedProductSubtotalBeforeShippingTax: number

  // Display breakdown
  breakdown: {
    basePrinting: number
    brokerSavings?: number
    taglineSavings?: number
    exactSizeMarkup?: number
    turnaroundMarkup: number
    addons: number
    total: number
  }
}

export class PricingEngine {
  calculatePrice(config: ProductConfiguration): PriceCalculation {
    const result: PriceCalculation = {
      effectiveQuantity: config.quantity,
      effectiveArea: config.printSize.width * config.printSize.height,
      paperStockBasePricePerSqInch: config.paperStock.pricePerSqInch,
      sidesFactor: this.calculateSidesFactor(config.sides, config.paperStock),
      basePaperPrintPrice: 0,

      brokerDiscountApplied: false,
      brokerDiscountPercentage: 0,
      ourTaglineDiscountApplied: false,
      taglineDiscountPercentage: 5.0,
      adjustedBasePrice: 0,

      exactSizeApplied: false,
      exactSizeMarkupPercentage: 12.5,
      priceAfterBasePercentageModifiers: 0,

      turnaroundMarkupPercentage: config.turnaroundTime.priceMarkupPercent,
      priceAfterTurnaround: 0,

      discreteAddonCosts: [],
      totalAddonCost: 0,
      calculatedProductSubtotalBeforeShippingTax: 0,

      breakdown: {
        basePrinting: 0,
        turnaroundMarkup: 0,
        addons: 0,
        total: 0,
      },
    }

    // Step 1: Calculate Base Paper Print Price
    result.basePaperPrintPrice =
      result.effectiveQuantity *
      result.effectiveArea *
      result.paperStockBasePricePerSqInch *
      result.sidesFactor

    // Step 2: Calculate Adjusted Base Price
    result.adjustedBasePrice = result.basePaperPrintPrice

    // Apply broker discount if applicable
    if (config.isBroker && config.brokerDiscounts) {
      const categoryDiscount = config.brokerDiscounts.find(
        (bd) => bd.categoryId === config.categoryId
      )
      if (categoryDiscount) {
        result.brokerDiscountApplied = true
        result.brokerDiscountPercentage = categoryDiscount.discountPercentage
        result.adjustedBasePrice =
          result.basePaperPrintPrice * (1 - result.brokerDiscountPercentage / 100)
        result.breakdown.brokerSavings = result.basePaperPrintPrice - result.adjustedBasePrice
      }
    }
    // Apply "Our Tagline" discount (hidden for brokers with discount)
    else if (config.addOns.ourTagline?.selected && !result.brokerDiscountApplied) {
      result.ourTaglineDiscountApplied = true
      const taglineDiscountAmount =
        result.basePaperPrintPrice * (result.taglineDiscountPercentage / 100)
      result.adjustedBasePrice -= taglineDiscountAmount
      result.breakdown.taglineSavings = taglineDiscountAmount
    }

    // Step 3: Apply Base Percentage Modifiers
    result.priceAfterBasePercentageModifiers = result.adjustedBasePrice

    if (config.addOns.exactSize?.selected) {
      result.exactSizeApplied = true
      const exactSizeMarkup = result.adjustedBasePrice * (result.exactSizeMarkupPercentage / 100)
      result.priceAfterBasePercentageModifiers += exactSizeMarkup
      result.breakdown.exactSizeMarkup = exactSizeMarkup
    }

    // Step 4: Apply Turnaround Markup
    result.priceAfterTurnaround =
      result.priceAfterBasePercentageModifiers * (1 + result.turnaroundMarkupPercentage / 100)
    result.breakdown.turnaroundMarkup =
      result.priceAfterTurnaround - result.priceAfterBasePercentageModifiers

    // Step 5: Calculate Add-on Services
    result.discreteAddonCosts = this.calculateAddonCosts(config)
    result.totalAddonCost = result.discreteAddonCosts.reduce((sum, addon) => sum + addon.cost, 0)
    result.breakdown.addons = result.totalAddonCost

    // Final Calculation
    result.calculatedProductSubtotalBeforeShippingTax =
      result.priceAfterTurnaround + result.totalAddonCost

    // Set breakdown totals
    result.breakdown.basePrinting = result.adjustedBasePrice
    result.breakdown.total = result.calculatedProductSubtotalBeforeShippingTax

    return result
  }

  private calculateSidesFactor(sides: 'single' | 'double', paperStock: PaperStock): number {
    if (sides === 'single') {
      return 1.0
    } else {
      // Double sided: 1 + (2nd Side Markup % / 100)
      return 1.0 + paperStock.secondSideMarkupPercent / 100
    }
  }

  private calculateAddonCosts(
    config: ProductConfiguration
  ): Array<{ name: string; cost: number; calculationDetails: string }> {
    const costs: Array<{ name: string; cost: number; calculationDetails: string }> = []
    const addons = config.addOns

    // Digital Proof - $5.00
    if (addons.digitalProof?.selected) {
      costs.push({
        name: 'Digital Proof',
        cost: addons.digitalProof.price || 5.0,
        calculationDetails: '$5.00 flat fee',
      })
    }

    // Perforation - $20.00 + $0.01/piece
    if (addons.perforation?.selected) {
      const setupFee = addons.perforation.setupFee || 20.0
      const perPiece = addons.perforation.pricePerPiece || 0.01
      const cost = setupFee + perPiece * config.quantity
      costs.push({
        name: 'Perforation',
        cost: cost,
        calculationDetails: `$${setupFee} setup + $${perPiece} × ${config.quantity} pieces`,
      })
    }

    // Score Only - $17.00 + ($0.01 * scores)/piece
    if (addons.scoreOnly?.selected) {
      const setupFee = addons.scoreOnly.setupFee || 17.0
      const perScore = addons.scoreOnly.pricePerScorePerPiece || 0.01
      const numScores = addons.scoreOnly.numberOfScores || 1
      const cost = setupFee + perScore * numScores * config.quantity
      costs.push({
        name: 'Score Only',
        cost: cost,
        calculationDetails: `$${setupFee} setup + $${perScore} × ${numScores} scores × ${config.quantity} pieces`,
      })
    }

    // Folding
    if (addons.folding?.selected) {
      let setupFee = 0
      let pricePerPiece = 0

      if (addons.folding.paperType === 'text_paper') {

        setupFee = 0.17
        pricePerPiece = 0.01
      } else if (addons.folding.paperType === 'card_stock') {
        setupFee = 0.34
        pricePerPiece = 0.02
      }

      const cost = setupFee + pricePerPiece * config.quantity
      const note =
        addons.folding.paperType === 'card_stock' ? ' (includes mandatory basic score)' : ''
      costs.push({
        name: 'Folding',
        cost: cost,
        calculationDetails: `$${setupFee} setup + $${pricePerPiece} × ${config.quantity} pieces${note}`,
      })
    }

    // Design Services
    if (addons.design?.selected && addons.design.serviceType !== 'upload_artwork') {
      let cost = 0
      let description = ''

      switch (addons.design.serviceType) {
        case 'standard_custom':
          cost =
            addons.design.sides === 'one'
              ? PRICING.DESIGN_COST_ONE_SIDE
              : PRICING.DESIGN_COST_TWO_SIDE
          description = `Standard Custom Design (${addons.design.sides} side${addons.design.sides === 'two' ? 's' : ''})`
          break
        case 'rush_custom':
          cost =
            addons.design.sides === 'one'
              ? PRICING.BUSINESS_CARD_DESIGN_ONE_SIDE
              : PRICING.BUSINESS_CARD_DESIGN_TWO_SIDE
          description = `Rush Custom Design (${addons.design.sides} side${addons.design.sides === 'two' ? 's' : ''})`
          break
        case 'minor_changes':
          cost = 22.5
          description = 'Design Changes - Minor'
          break
        case 'major_changes':
          cost = 45.0
          description = 'Design Changes - Major'
          break
      }

      if (cost > 0) {
        costs.push({
          name: 'Design Services',
          cost: cost,
          calculationDetails: description,
        })
      }
    }

    // Banding - $0.75/bundle
    if (addons.banding?.selected) {
      const itemsPerBundle = addons.banding.itemsPerBundle || PRICING.DEFAULT_ITEMS_PER_BUNDLE
      const pricePerBundle = addons.banding.pricePerBundle || 0.75
      const bundles = Math.ceil(config.quantity / itemsPerBundle)
      const cost = bundles * pricePerBundle
      costs.push({
        name: 'Banding',
        cost: cost,
        calculationDetails: `${bundles} bundles × $${pricePerBundle} (${itemsPerBundle} items/bundle)`,
      })
    }

    // Shrink Wrapping - $0.30/bundle
    if (addons.shrinkWrapping?.selected) {
      const itemsPerBundle =
        addons.shrinkWrapping.itemsPerBundle || PRICING.DEFAULT_ITEMS_PER_BUNDLE
      const pricePerBundle = addons.shrinkWrapping.pricePerBundle || 0.3
      const bundles = Math.ceil(config.quantity / itemsPerBundle)
      const cost = bundles * pricePerBundle
      costs.push({
        name: 'Shrink Wrapping',
        cost: cost,
        calculationDetails: `${bundles} bundles × $${pricePerBundle} (${itemsPerBundle} items/bundle)`,
      })
    }

    // QR Code - $5.00
    if (addons.qrCode?.selected) {
      costs.push({
        name: 'QR Code',
        cost: addons.qrCode.price || 5.0,
        calculationDetails: '$5.00 flat fee',
      })
    }

    // Postal Delivery (DDU) - $30.00/box
    if (addons.postalDelivery?.selected) {
      const numberOfBoxes = addons.postalDelivery.numberOfBoxes || 1
      const pricePerBox = addons.postalDelivery.pricePerBox || 30.0
      const cost = numberOfBoxes * pricePerBox
      costs.push({
        name: 'Postal Delivery (DDU)',
        cost: cost,
        calculationDetails: `${numberOfBoxes} boxes × $${pricePerBox}`,
      })
    }

    // EDDM Process & Postage - $50.00 + $0.239/piece
    if (addons.eddmProcess?.selected) {
      const setupFee = addons.eddmProcess.setupFee || PRICING.EDDM_BASE_FEE
      const pricePerPiece = addons.eddmProcess.pricePerPiece || PRICING.EDDM_PRICE_PER_PIECE
      const cost = setupFee + pricePerPiece * config.quantity
      costs.push({
        name: 'EDDM Process & Postage',
        cost: cost,
        calculationDetails: `$${setupFee} setup + $${pricePerPiece} × ${config.quantity} pieces (includes mandatory banding)`,
      })
    }

    // Hole Drilling - $20.00 + variable
    if (addons.holeDrilling?.selected) {
      const setupFee = addons.holeDrilling.setupFee || 20.0
      let perPieceCost = 0
      let description = ''

      if (addons.holeDrilling.holeType === 'custom' && addons.holeDrilling.numberOfHoles) {
        perPieceCost = addons.holeDrilling.numberOfHoles * 0.02 // $0.02 per hole per piece
        description = `${addons.holeDrilling.numberOfHoles} custom holes`
      } else if (addons.holeDrilling.holeType === 'binder_punch') {
        perPieceCost = 0.01 // $0.01 per piece for binder punch
        description = `${addons.holeDrilling.binderType} binder punch`
      }

      const cost = setupFee + perPieceCost * config.quantity
      costs.push({
        name: 'Hole Drilling',
        cost: cost,
        calculationDetails: `$${setupFee} setup + $${perPieceCost} × ${config.quantity} pieces (${description})`,
      })
    }

    return costs
  }
}
