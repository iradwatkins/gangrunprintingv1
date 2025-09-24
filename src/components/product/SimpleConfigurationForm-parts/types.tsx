/**
 * Type definitions
 */

interface SimpleConfigData {
  quantities: Array<{
    id: string
    value: number | null
    label: string
    isCustom?: boolean
    customMin?: number
    customMax?: number
  }>
  sizes: Array<{
    id: string
    name: string
    displayName: string
    width: number | null
    height: number | null
    squareInches: number | null
    priceMultiplier: number
    isDefault: boolean
    isCustom?: boolean
    customMinWidth?: number | null
    customMaxWidth?: number | null
    customMinHeight?: number | null
    customMaxHeight?: number | null
  }>
  paperStocks: Array<{
    id: string
    name: string
    description: string
    pricePerUnit: number
    coatings: Array<{
      id: string
      name: string
      priceMultiplier: number
      isDefault: boolean
    }>
    sides: Array<{
      id: string
      name: string
      priceMultiplier: number
      isDefault: boolean
    }>
  }>
  addons: Array<{
    id: string
    name: string
    description: string
    pricingModel: 'FIXED_FEE' | 'PERCENTAGE' | 'PER_UNIT' | 'CUSTOM' | 'FLAT'
    price: number
    priceDisplay: string
    isDefault: boolean
    additionalTurnaroundDays: number
    configuration?: Record<string, unknown>
  }>
  turnaroundTimes: Array<{
    id: string
    name: string
    displayName: string
    description?: string
    daysMin: number
    daysMax?: number
    pricingModel: 'FLAT' | 'PERCENTAGE' | 'PER_UNIT' | 'CUSTOM'
    basePrice: number
    priceMultiplier: number
    requiresNoCoating: boolean
    restrictedCoatings: string[]
    isDefault: boolean
  }>
  defaults: {
    quantity: string
    size: string
    paper: string
    coating: string
    sides: string
    addons: string[]
    turnaround: string
  }
}

interface UploadedFile {
  fileId: string
  originalName: string
  size: number
  mimeType: string
  thumbnailUrl?: string
  uploadedAt: string
  isImage: boolean
}

interface VariableDataConfig {
  enabled: boolean
  locationsCount: string
  locations: string
}

interface PerforationConfig {
  enabled: boolean
  verticalCount: string
  verticalPosition: string
  horizontalCount: string
  horizontalPosition: string
}

interface BandingConfig {
  enabled: boolean
  bandingType: string
  itemsPerBundle: number
}

interface CornerRoundingConfig {
  enabled: boolean
  cornerType: string
}

interface SimpleProductConfiguration {
  quantity: string
  customQuantity?: number // For custom quantity input when "Custom" is selected
  size: string
  customWidth?: number // For custom width input when "Custom" size is selected
  customHeight?: number // For custom height input when "Custom" size is selected
  paper: string
  coating: string
  sides: string
  turnaround: string
  uploadedFiles: UploadedFile[]
  selectedAddons: string[]
  variableDataConfig?: VariableDataConfig // For Variable Data add-on
  perforationConfig?: PerforationConfig // For Perforation add-on
  bandingConfig?: BandingConfig // For Banding add-on
  cornerRoundingConfig?: CornerRoundingConfig // For Corner Rounding add-on
}

interface SimpleConfigurationFormProps {
  productId: string
  onConfigurationChange?: (config: SimpleProductConfiguration, price: number) => void
}

export default function SimpleConfigurationForm({
  productId,
  onConfigurationChange,
}: SimpleConfigurationFormProps) {
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

    // Add Variable Data cost if enabled
    if (config.variableDataConfig?.enabled) {
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

    // Add Variable Data cost if enabled
    if (config.variableDataConfig?.enabled) {
