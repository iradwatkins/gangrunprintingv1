'use client'

import { LoadingSkeleton, ErrorState } from '@/components/common/loading'
import { useProductConfiguration } from '@/hooks/useProductConfiguration'
import { usePriceCalculation } from '@/hooks/usePriceCalculation'

// Import all modules
import {
  QuantityModule,
  SizeModule,
  PaperStockModule,
  AddonsModule,
  TurnaroundModule
} from './modules'

interface ProductConfiguration {
  quantity: string
  size: string
  exactSize: boolean
  sides: string
  paperStock: string
  coating: string
  turnaround: string
  selectedAddons: string[]
  variableDataConfig?: any
  perforationConfig?: any
  bandingConfig?: any
  cornerRoundingConfig?: any
}

interface ModularProductConfigurationFormProps {
  productId: string
  basePrice?: number
  setupFee?: number
  onConfigurationChange?: (config: ProductConfiguration, isComplete: boolean) => void
  onPriceChange?: (price: number) => void
}

export default function ModularProductConfigurationForm({
  productId,
  basePrice = 0,
  setupFee = 0,
  onConfigurationChange,
  onPriceChange,
}: ModularProductConfigurationFormProps) {
  // Use the refactored hooks for state management
  const {
    configData,
    configuration,
    loading,
    error,
    updateConfiguration,
    updateQuantity,
    updateSize,
    updateTurnaround,
    getQuantityValue,
    getSizeDimensions,
  } = useProductConfiguration({
    productId,
    onConfigurationChange: (config) => {
      const isComplete = Boolean(
        config.quantity &&
        config.size &&
        config.sides &&
        config.paper &&
        config.coating &&
        config.turnaround
      )

      // Convert to legacy format for backward compatibility
      const legacyConfig: ProductConfiguration = {
        quantity: config.quantity,
        size: config.size,
        exactSize: false, // TODO: Add exact size to configuration
        sides: config.sides,
        paperStock: config.paper,
        coating: config.coating,
        turnaround: config.turnaround,
        selectedAddons: config.selectedAddons,
        variableDataConfig: config.variableDataConfig,
        perforationConfig: config.perforationConfig,
        bandingConfig: config.bandingConfig,
        cornerRoundingConfig: config.cornerRoundingConfig,
      }

      onConfigurationChange?.(legacyConfig, isComplete)

      // Calculate price and trigger price change
      const price = calculateFinalPrice(config)
      onPriceChange?.(price)
    },
  })

  // Price calculation using the new hook
  const { calculateFinalPrice } = usePriceCalculation({
    configData,
    getQuantityValue,
  })

  // Calculate current price using the new hook
  const currentPrice = calculateFinalPrice(configuration)

  // Loading state
  if (loading) {
    return <LoadingSkeleton count={8} />
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        message={error}
        title="Configuration Error"
        onRetry={() => window.location.reload()}
      />
    )
  }

  // No data state
  if (!configData) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No configuration data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quantity Module */}
      <QuantityModule
        quantities={configData.quantities || []}
        value={configuration.quantity}
        customValue={configuration.customQuantity}
        onChange={updateQuantity}
        required
      />

      {/* Size Module */}
      <SizeModule
        sizes={configData.sizes || []}
        value={configuration.size}
        customWidth={configuration.customWidth}
        customHeight={configuration.customHeight}
        onChange={updateSize}
        exactSizeRequired={false}
        onExactSizeChange={(exactSize) => {
          // Handle exact size change if needed
          console.log('Exact size:', exactSize)
        }}
        required
      />

      {/* Paper Stock Module */}
      <PaperStockModule
        paperStocks={configData.paperStocks || []}
        paperValue={configuration.paper}
        coatingValue={configuration.coating}
        sidesValue={configuration.sides}
        onPaperChange={(paperId) => {
          updateConfiguration({ paper: paperId })
        }}
        onCoatingChange={(coatingId) => {
          updateConfiguration({ coating: coatingId })
        }}
        onSidesChange={(sidesId) => {
          updateConfiguration({ sides: sidesId })
        }}
        required
      />

      {/* Addons Module */}
      <AddonsModule
        addons={configData.addons || []}
        addonsGrouped={configData.addonsGrouped}
        selectedAddons={configuration.selectedAddons}
        onAddonChange={(selectedAddonIds) => {
          updateConfiguration({ selectedAddons: selectedAddonIds })
        }}
        variableDataConfig={configuration.variableDataConfig}
        onVariableDataChange={(config) => {
          updateConfiguration({ variableDataConfig: config })
        }}
        perforationConfig={configuration.perforationConfig}
        onPerforationChange={(config) => {
          updateConfiguration({ perforationConfig: config })
        }}
        bandingConfig={configuration.bandingConfig}
        onBandingChange={(config) => {
          updateConfiguration({ bandingConfig: config })
        }}
        cornerRoundingConfig={configuration.cornerRoundingConfig}
        onCornerRoundingChange={(config) => {
          updateConfiguration({ cornerRoundingConfig: config })
        }}
        turnaroundTimes={configData.turnaroundTimes}
        quantity={getQuantityValue(configuration)}
      />

      {/* Turnaround Module */}
      <TurnaroundModule
        turnaroundTimes={configData.turnaroundTimes || []}
        selectedTurnaroundId={configuration.turnaround}
        onTurnaroundChange={updateTurnaround}
        baseProductPrice={currentPrice}
        quantity={getQuantityValue(configuration)}
        currentCoating={configuration.coating}
        required
      />
    </div>
  )
}