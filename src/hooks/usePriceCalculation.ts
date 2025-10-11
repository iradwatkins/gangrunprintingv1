'use client'

import { useCallback } from 'react'
import type { SimpleConfigData, SimpleProductConfiguration } from './useProductConfiguration'

interface UsePriceCalculationProps {
  configData: SimpleConfigData | null
  getQuantityValue: (config: SimpleProductConfiguration) => number
}

export function usePriceCalculation({ configData, getQuantityValue }: UsePriceCalculationProps) {
  // Calculate base price without turnaround
  const calculateBasePrice = useCallback(
    (config: SimpleProductConfiguration): number => {
      if (!configData) return 0

      const quantityOption = configData.quantities.find((q) => q.id === config.quantity)
      const sizeOption = configData.sizes.find((s) => s.id === config.size)
      const paperOption = configData.paperStocks.find((p) => p.id === config.paper)

      if (!sizeOption || !paperOption) return 0

      // Find coating and sides options for the selected paper
      const coatingOption = paperOption.coatings.find((c) => c.id === config.coating)
      const sidesOption = paperOption.sides.find((s) => s.id === config.sides)

      if (!coatingOption || !sidesOption) return 0

      const quantity = getQuantityValue(config)
      const basePrice = paperOption.pricePerUnit

      // Calculate size multiplier
      let sizeMultiplier = sizeOption.priceMultiplier
      if (sizeOption.isCustom && config.customWidth && config.customHeight) {
        const squareInches = config.customWidth * config.customHeight
        // Progressive pricing based on square inches
        if (squareInches <= 10) sizeMultiplier = 1.0
        else if (squareInches <= 25) sizeMultiplier = 1.2
        else if (squareInches <= 50) sizeMultiplier = 1.5
        else if (squareInches <= 100) sizeMultiplier = 2.0
        else sizeMultiplier = 2.5 + (squareInches - 100) * 0.01
      }

      const coatingMultiplier = coatingOption.priceMultiplier
      const sidesMultiplier = sidesOption.priceMultiplier

      // Calculate base product price
      const baseProductPrice =
        quantity * basePrice * sizeMultiplier * coatingMultiplier * sidesMultiplier

      // Calculate addon costs (excluding special addons handled separately)
      let addonCosts = 0
      if (config.selectedAddons && config.selectedAddons.length > 0) {
        config.selectedAddons.forEach((addonId) => {
          const addon = configData.addons?.find((a) => a.id === addonId)
          if (addon) {
            // Skip special addons handled separately
            if (
              addon.configuration?.type === 'variable_data' ||
              addon.configuration?.type === 'perforation' ||
              addon.configuration?.type === 'banding'
            ) {
              return
            }

            switch (addon.pricingModel) {
              case 'FIXED_FEE':
              case 'FLAT':
                addonCosts += addon.price
                break
              case 'PERCENTAGE':
                addonCosts += baseProductPrice * addon.price
                break
              case 'PER_UNIT':
                addonCosts += quantity * addon.price
                break
            }
          }
        })
      }

      // Add special addon costs
      addonCosts += calculateSpecialAddonCosts(config, quantity)

      return baseProductPrice + addonCosts
    },
    [configData, getQuantityValue]
  )

  // Calculate special addon costs (Variable Data, Perforation, Banding, Corner Rounding)
  const calculateSpecialAddonCosts = useCallback(
    (config: SimpleProductConfiguration, quantity: number): number => {
      let specialAddonCosts = 0

      // Variable Data cost
      if (config.variableDataConfig?.enabled) {
        specialAddonCosts += 60 + 0.02 * quantity
      }

      // Perforation cost
      if (config.perforationConfig?.enabled) {
        specialAddonCosts += 20 + 0.01 * quantity
      }

      // Banding cost
      if (config.bandingConfig?.enabled && config.bandingConfig.itemsPerBundle > 0) {
        const numberOfBundles = Math.ceil(quantity / config.bandingConfig.itemsPerBundle)
        specialAddonCosts += numberOfBundles * 0.75
      }

      // Corner Rounding cost
      if (config.cornerRoundingConfig?.enabled) {
        specialAddonCosts += 20 + 0.01 * quantity
      }

      return specialAddonCosts
    },
    []
  )

  // Calculate final price with turnaround
  const calculateFinalPrice = useCallback(
    (config: SimpleProductConfiguration): number => {
      if (!configData) return 0

      const basePrice = calculateBasePrice(config)
      const turnaroundOption = configData.turnaroundTimes?.find((t) => t.id === config.turnaround)

      if (!turnaroundOption) return basePrice

      const quantity = getQuantityValue(config)

      switch (turnaroundOption.pricingModel) {
        case 'FLAT':
          return basePrice + turnaroundOption.basePrice
        case 'PERCENTAGE':
          return basePrice * turnaroundOption.priceMultiplier
        case 'PER_UNIT':
          return basePrice + quantity * turnaroundOption.basePrice
        default:
          return basePrice
      }
    },
    [configData, calculateBasePrice, getQuantityValue]
  )

  // Get price breakdown for display
  const getPriceBreakdown = useCallback(
    (config: SimpleProductConfiguration) => {
      if (!configData) return null

      const quantity = getQuantityValue(config)
      const basePrice = calculateBasePrice(config)
      const finalPrice = calculateFinalPrice(config)
      const turnaroundCost = finalPrice - basePrice

      const paperOption = configData.paperStocks.find((p) => p.id === config.paper)
      const sizeOption = configData.sizes.find((s) => s.id === config.size)
      const turnaroundOption = configData.turnaroundTimes?.find((t) => t.id === config.turnaround)

      return {
        quantity,
        basePrice,
        turnaroundCost,
        finalPrice,
        unitPrice: finalPrice / quantity,
        paperType: paperOption?.name || '',
        sizeDescription: sizeOption?.displayName || '',
        turnaroundDescription: turnaroundOption?.displayName || '',
        specialAddonCosts: calculateSpecialAddonCosts(config, quantity),
      }
    },
    [
      configData,
      getQuantityValue,
      calculateBasePrice,
      calculateFinalPrice,
      calculateSpecialAddonCosts,
    ]
  )

  return {
    calculateBasePrice,
    calculateFinalPrice,
    calculateSpecialAddonCosts,
    getPriceBreakdown,
  }
}
