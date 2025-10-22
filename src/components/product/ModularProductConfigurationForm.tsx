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
  TurnaroundModule,
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
        required
        customValue={configuration.customQuantity}
        quantities={configData.quantities || []}
        value={configuration.quantity}
        onChange={updateQuantity}
      />

      {/* Size Module */}
      <SizeModule
        required
        customHeight={configuration.customHeight}
        customWidth={configuration.customWidth}
        exactSizeRequired={false}
        sizes={configData.sizes || []}
        value={configuration.size}
        onChange={updateSize}
        onExactSizeChange={(exactSize) => {
          // Handle exact size change if needed
        }}
      />

      {/* Paper Stock Module */}
      <PaperStockModule
        required
        coatingValue={configuration.coating}
        paperStocks={configData.paperStocks || []}
        paperValue={configuration.paper}
        sidesValue={configuration.sides}
        onCoatingChange={(coatingId) => {
          updateConfiguration({ coating: coatingId })
        }}
        onPaperChange={(paperId) => {
          updateConfiguration({ paper: paperId })
        }}
        onSidesChange={(sidesId) => {
          updateConfiguration({ sides: sidesId })
        }}
      />

      {/* Addons Module */}
      <AddonsModule
        addons={configData.addons || []}
        addonsGrouped={configData.addonsGrouped}
        bandingConfig={configuration.bandingConfig}
        cornerRoundingConfig={configuration.cornerRoundingConfig}
        perforationConfig={configuration.perforationConfig}
        quantity={getQuantityValue(configuration)}
        selectedAddons={configuration.selectedAddons}
        turnaroundTimes={configData.turnaroundTimes}
        variableDataConfig={configuration.variableDataConfig}
        onAddonChange={(selectedAddonIds) => {
          updateConfiguration({ selectedAddons: selectedAddonIds })
        }}
        onBandingChange={(config) => {
          updateConfiguration({ bandingConfig: config })
        }}
        onCornerRoundingChange={(config) => {
          updateConfiguration({ cornerRoundingConfig: config })
        }}
        onPerforationChange={(config) => {
          updateConfiguration({ perforationConfig: config })
        }}
        onVariableDataChange={(config) => {
          updateConfiguration({ variableDataConfig: config })
        }}
      />

      {/* Turnaround Module */}
      <TurnaroundModule
        required
        baseProductPrice={currentPrice}
        currentCoating={configuration.coating}
        quantity={getQuantityValue(configuration)}
        selectedTurnaroundId={configuration.turnaround}
        turnaroundTimes={configData.turnaroundTimes || []}
        onTurnaroundChange={updateTurnaround}
      />
    </div>
  )
}
