// Pricing Calculator for Gang Run Printing
// Based on documentation specifications

export interface PricingInputs {
  // Base product info
  paperStock: {
    pricePerSquareInch: number
    secondSideMarkup?: number // For double-sided printing
  }

  // Product configuration
  printSize: {
    width: number
    height: number
  }

  quantity: number
  sides: 'single' | 'double'

  // Turnaround
  turnaroundMarkup?: number // Percentage (e.g., 25 for 25%)

  // Broker discount
  brokerDiscount?: number // Percentage (e.g., 10 for 10%)

  // Add-ons
  addOns?: Array<{
    id: string
    name: string
    pricingModel: 'FLAT' | 'PERCENTAGE' | 'PER_UNIT' | 'CUSTOM'
    configuration: Record<string, unknown>
    quantity?: number // For per-unit pricing
  }>
}

export interface PricingBreakdown {
  basePaperPrintPrice: number
  brokerDiscountAmount: number
  adjustedBasePrice: number
  exactSizeMarkup: number
  priceAfterExactSize: number
  turnaroundMarkup: number
  priceAfterTurnaround: number
  addOnsCost: number
  finalPrice: number
  unitPrice: number

  // Detailed breakdown
  breakdown: {
    paperCost: number
    sizeInSquareInches: number
    sidesMultiplier: number
    quantityUsed: number
    addOnsBreakdown: Array<{
      name: string
      cost: number
      calculation: string
    }>
  }
}

export class PricingCalculator {
  /**
   * Calculate the complete pricing for a print product
   */
  static calculate(inputs: PricingInputs): PricingBreakdown {
    // Step 1: Calculate Base Paper Print Price
    const sizeInSquareInches = inputs.printSize.width * inputs.printSize.height
    const sidesMultiplier =
      inputs.sides === 'double' ? 1 + (inputs.paperStock.secondSideMarkup || 100) / 100 : 1

    const basePaperPrintPrice =
      inputs.paperStock.pricePerSquareInch * sizeInSquareInches * inputs.quantity * sidesMultiplier

    // Step 2: Apply Broker Discount (if applicable)
    const brokerDiscountAmount = inputs.brokerDiscount
      ? basePaperPrintPrice * (inputs.brokerDiscount / 100)
      : 0

    const adjustedBasePrice = basePaperPrintPrice - brokerDiscountAmount

    // Step 3: Check for Exact Size add-on
    let exactSizeMarkup = 0
    let priceAfterExactSize = adjustedBasePrice

    const exactSizeAddOn = inputs.addOns?.find((a) => a.name.toLowerCase().includes('exact size'))

    if (exactSizeAddOn) {
      exactSizeMarkup = adjustedBasePrice * 0.125 // 12.5% markup
      priceAfterExactSize = adjustedBasePrice + exactSizeMarkup
    }

    // Step 4: Apply Turnaround Markup
    const turnaroundMarkup = inputs.turnaroundMarkup
      ? priceAfterExactSize * (inputs.turnaroundMarkup / 100)
      : 0

    const priceAfterTurnaround = priceAfterExactSize + turnaroundMarkup

    // Step 5: Calculate Add-ons Cost
    const addOnsBreakdown: Array<{
      name: string
      cost: number
      calculation: string
    }> = []

    let totalAddOnsCost = 0

    if (inputs.addOns) {
      for (const addOn of inputs.addOns) {
        // Skip Exact Size as it's already calculated
        if (addOn.name.toLowerCase().includes('exact size')) {
          continue
        }

        let addOnCost = 0
        let calculation = ''

        switch (addOn.pricingModel) {
          case 'FLAT':
            addOnCost = (addOn.configuration.price as number | undefined) || 0
            calculation = `Flat fee: $${addOnCost}`
            break

          case 'PERCENTAGE':
            const percentage = (addOn.configuration.percentage as number) || 0
            const appliesTo = addOn.configuration.appliesTo || 'base_price'

            let baseForPercentage = basePaperPrintPrice
            if (appliesTo === 'adjusted_base_price') {
              baseForPercentage = adjustedBasePrice
            } else if (appliesTo === 'total') {
              baseForPercentage = priceAfterTurnaround
            }

            addOnCost = baseForPercentage * (percentage / 100)
            calculation = `${percentage}% of ${appliesTo}: $${addOnCost.toFixed(2)}`
            break

          case 'PER_UNIT':
            const pricePerUnit = (addOn.configuration.pricePerUnit as number) || 0
            const units = (addOn.quantity as number) || inputs.quantity
            addOnCost = pricePerUnit * units
            calculation = `$${pricePerUnit} × ${units} units = $${addOnCost.toFixed(2)}`
            break

          case 'CUSTOM':
            // Handle custom pricing models
            const config = addOn.configuration

            // Handle setup fee + per piece pricing
            if (config.setupFee !== undefined) {
              addOnCost += (config.setupFee as number)
              calculation = `Setup: $${config.setupFee}`
            }

            if (config.pricePerPiece !== undefined) {
              const pieceCost = (config.pricePerPiece as number) * inputs.quantity
              addOnCost += pieceCost
              calculation += `${calculation ? ' + ' : ''}$${config.pricePerPiece}/pc × ${inputs.quantity} = $${pieceCost.toFixed(2)}`
            }

            // Handle per bundle pricing
            if (config.pricePerBundle !== undefined) {
              const itemsPerBundle = (config.defaultItemsPerBundle as number) || 100
              const bundles = Math.ceil(inputs.quantity / itemsPerBundle)
              addOnCost = (config.pricePerBundle as number) * bundles
              calculation = `$${config.pricePerBundle} × ${bundles} bundles = $${addOnCost.toFixed(2)}`
            }

            // Handle complex configurations (like folding)
            if (config.textPaper || config.cardStock) {
              // This would need paper type information to calculate correctly
              calculation = 'Variable based on paper type'
            }

            break
        }

        totalAddOnsCost += addOnCost

        addOnsBreakdown.push({
          name: addOn.name,
          cost: addOnCost,
          calculation,
        })
      }
    }

    // Step 6: Calculate Final Price
    const finalPrice = priceAfterTurnaround + totalAddOnsCost
    const unitPrice = finalPrice / inputs.quantity

    return {
      basePaperPrintPrice,
      brokerDiscountAmount,
      adjustedBasePrice,
      exactSizeMarkup,
      priceAfterExactSize,
      turnaroundMarkup,
      priceAfterTurnaround,
      addOnsCost: totalAddOnsCost,
      finalPrice,
      unitPrice,
      breakdown: {
        paperCost: inputs.paperStock.pricePerSquareInch,
        sizeInSquareInches,
        sidesMultiplier,
        quantityUsed: inputs.quantity,
        addOnsBreakdown,
      },
    }
  }

  /**
   * Format a pricing breakdown for display
   */
  static formatBreakdown(breakdown: PricingBreakdown): string[] {
    const lines: string[] = []

    lines.push(`Base Paper Print Price: $${breakdown.basePaperPrintPrice.toFixed(2)}`)
    lines.push(
      `  (${breakdown.breakdown.sizeInSquareInches} sq in × $${breakdown.breakdown.paperCost}/sq in × ${breakdown.breakdown.quantityUsed} qty × ${breakdown.breakdown.sidesMultiplier}x sides)`
    )

    if (breakdown.brokerDiscountAmount > 0) {
      lines.push(`Broker Discount: -$${breakdown.brokerDiscountAmount.toFixed(2)}`)
      lines.push(`Adjusted Base Price: $${breakdown.adjustedBasePrice.toFixed(2)}`)
    }

    if (breakdown.exactSizeMarkup > 0) {
      lines.push(`Exact Size Markup (12.5%): +$${breakdown.exactSizeMarkup.toFixed(2)}`)
      lines.push(`After Exact Size: $${breakdown.priceAfterExactSize.toFixed(2)}`)
    }

    if (breakdown.turnaroundMarkup > 0) {
      lines.push(`Rush Turnaround Markup: +$${breakdown.turnaroundMarkup.toFixed(2)}`)
      lines.push(`After Turnaround: $${breakdown.priceAfterTurnaround.toFixed(2)}`)
    }

    if (breakdown.breakdown.addOnsBreakdown.length > 0) {
      lines.push(`Add-ons:`)
      breakdown.breakdown.addOnsBreakdown.forEach((addOn) => {
        lines.push(`  ${addOn.name}: $${addOn.cost.toFixed(2)}`)
        lines.push(`    (${addOn.calculation})`)
      })
      lines.push(`Total Add-ons: $${breakdown.addOnsCost.toFixed(2)}`)
    }

    lines.push(``)
    lines.push(`Final Price: $${breakdown.finalPrice.toFixed(2)}`)
    lines.push(`Unit Price: $${breakdown.unitPrice.toFixed(2)}`)

    return lines
  }
}

// Example usage:
/*
const pricing = PricingCalculator.calculate({
  paperStock: {
    pricePerSquareInch: 0.0025, // $0.0025 per square inch
    secondSideMarkup: 80 // 80% markup for second side
  },
  printSize: {
    width: 4,
    height: 6
  },
  quantity: 1000,
  sides: 'double',
  turnaroundMarkup: 25, // 25% rush
  brokerDiscount: 10, // 10% broker discount
  addOns: [
    {
      id: '1',
      name: 'Digital Proof',
      pricingModel: 'FLAT',
      configuration: { price: 5 }
    },
    {
      id: '2',
      name: 'Perforation',
      pricingModel: 'CUSTOM',
      configuration: { setupFee: 20, pricePerPiece: 0.01 }
    }
  ]
})

.join('\n'))
*/
