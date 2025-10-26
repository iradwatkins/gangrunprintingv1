/**
 * StandardModuleTypes.ts
 * Unified type definitions for all product modules to ensure consistency and independence
 */

// =============================================================================
// CORE MODULE INTERFACES
// =============================================================================

/**
 * Base properties that ALL modules must support
 * This ensures consistent behavior across the entire modular system
 */
export interface BaseModuleProps {
  /** Whether the module is disabled (prevents interaction) */
  disabled?: boolean
  /** Whether the module is required (affects validation) */
  required?: boolean
  /** Additional CSS classes for styling */
  className?: string
  /** Whether the module is in a loading state */
  loading?: boolean
}

/**
 * Standard change handler pattern for all modules
 * T represents the value type (string, string[], number, object, etc.)
 */
export interface ModuleChangeHandler<T = any> {
  onChange: (value: T) => void
}

/**
 * Error handling pattern for all modules
 */
export interface ModuleError {
  /** Error message to display */
  message: string
  /** Error type for categorization */
  type?: 'validation' | 'network' | 'processing' | 'configuration'
  /** Additional context for debugging */
  context?: any
}

export interface ModuleErrorHandling {
  /** Current error state */
  error?: ModuleError | null
  /** Function to clear errors */
  onErrorClear?: () => void
}

/**
 * Generic module props interface that all modules should extend
 * T = Item type (e.g., Quantity[], Size[], AddOn[])
 * V = Value type (e.g., string, string[], number, custom object)
 */
export interface StandardModuleProps<TItem = any, TValue = any>
  extends BaseModuleProps,
    ModuleChangeHandler<TValue>,
    ModuleErrorHandling {
  /** The data items this module manages */
  items: TItem[]
  /** Current selected value(s) */
  value: TValue
  /** Module title (optional, can be derived from module type) */
  title?: string
  /** Module description for user guidance */
  description?: string
}

// =============================================================================
// MODULE VALUE INTERFACES
// =============================================================================

/**
 * Base interface for module hook return values
 * All module hooks should extend this
 */
export interface BaseModuleValue {
  /** Whether the module has a valid selection */
  isValid: boolean
  /** Whether the module is in a loading state */
  isLoading?: boolean
  /** Current error state */
  error?: ModuleError | null
}

/**
 * Pricing contribution interface - how each module contributes to final price
 * This enables independent pricing calculations per module
 */
export interface ModulePricingContribution {
  /** Base price contribution from this module */
  basePrice?: number
  /** Multiplier to apply to base product price */
  multiplier?: number
  /** Fixed addon cost from this module */
  addonCost?: number
  /** Per-unit cost from this module */
  perUnitCost?: number
  /** Percentage-based cost from this module */
  percentageCost?: number
  /** Whether this module's pricing is valid */
  isValid: boolean
  /** Calculation details for transparency */
  calculation?: {
    description: string
    breakdown: Array<{ item: string; cost: number; type: string }>
  }
}

/**
 * Standard module value interface that all module hooks should return
 */
export interface StandardModuleValue<TValue = any> extends BaseModuleValue {
  /** Current processed value */
  value: TValue
  /** Pricing contribution from this module */
  pricing: ModulePricingContribution
  /** Display information for UI */
  display: {
    /** Human-readable description of current selection */
    description: string
    /** Summary text for display in other components */
    summary: string
    /** Whether to show in cart/order summaries */
    showInSummary?: boolean
  }
}

// =============================================================================
// SPECIFIC MODULE TYPE DEFINITIONS
// =============================================================================

/**
 * Quantity Module Types
 */
export interface QuantityItem {
  id: string
  label: string
  value: number | null // null for custom quantities
  isCustom?: boolean
  customMin?: number
  customMax?: number
  priceMultiplier?: number
  isDefault?: boolean
}

export interface QuantityValue {
  quantityId: string
  customValue?: number
  actualValue: number
}

export interface QuantityModuleProps extends StandardModuleProps<QuantityItem, string> {
  /** Custom quantity value if custom option is selected */
  customValue?: number
  /** Handler for custom quantity changes */
  onCustomChange?: (customValue: number) => void
}

export interface QuantityModuleValue extends StandardModuleValue<QuantityValue> {
  /** Actual quantity number for calculations */
  actualQuantity: number
}

/**
 * Size Module Types
 */
export interface SizeItem {
  id: string
  name: string
  displayName: string
  width: number | null
  height: number | null
  squareInches: number | null
  priceMultiplier: number
  isDefault: boolean
  isCustom?: boolean
  customMinWidth?: number
  customMaxWidth?: number
  customMinHeight?: number
  customMaxHeight?: number
}

export interface SizeValue {
  sizeId: string
  customWidth?: number
  customHeight?: number
  actualWidth: number
  actualHeight: number
  squareInches: number
}

export interface SizeModuleProps extends StandardModuleProps<SizeItem, string> {
  /** Custom width value if custom size is selected */
  customWidth?: number
  /** Custom height value if custom size is selected */
  customHeight?: number
  /** Whether exact size is required */
  exactSizeRequired?: boolean
  /** Handler for custom dimension changes */
  onCustomChange?: (width?: number, height?: number) => void
  /** Handler for exact size requirement changes */
  onExactSizeChange?: (exactSize: boolean) => void
}

export interface SizeModuleValue extends StandardModuleValue<SizeValue> {
  /** Calculated dimensions for pricing and display */
  dimensions: {
    width: number
    height: number
    squareInches: number
  }
}

/**
 * Paper Stock Module Types
 */
export interface PaperStockItem {
  id: string
  name: string
  description: string
  pricePerUnit: number
  coatings: CoatingItem[]
  sides: SidesItem[]
}

export interface CoatingItem {
  id: string
  name: string
  priceMultiplier: number
  isDefault: boolean
}

export interface SidesItem {
  id: string
  name: string
  priceMultiplier: number
  isDefault: boolean
}

export interface PaperStockValue {
  paperId: string
  coatingId: string
  sidesId: string
  paper?: PaperStockItem
  coating?: CoatingItem
  sides?: SidesItem
}

export interface PaperStockModuleProps extends StandardModuleProps<PaperStockItem, string> {
  /** Current coating selection */
  coatingValue: string
  /** Current sides selection */
  sidesValue: string
  /** Handler for coating changes */
  onCoatingChange: (coatingId: string) => void
  /** Handler for sides changes */
  onSidesChange: (sidesId: string) => void
}

export interface PaperStockModuleValue extends StandardModuleValue<PaperStockValue> {
  /** Available coatings for current paper */
  availableCoatings: CoatingItem[]
  /** Available sides for current paper */
  availableSides: SidesItem[]
  /** Combined multiplier from paper, coating, and sides */
  totalMultiplier: number
}

/**
 * Add-ons Module Types
 */
export interface AddonItem {
  id: string
  name: string
  description: string
  pricingModel: 'FIXED_FEE' | 'PERCENTAGE' | 'PER_UNIT' | 'CUSTOM' | 'FLAT'
  price: number
  priceDisplay: string
  configuration?: any
  isDefault: boolean
  additionalTurnaroundDays: number
  displayPosition?: 'ABOVE_DROPDOWN' | 'IN_DROPDOWN' | 'BELOW_DROPDOWN'
}

export interface AddonValue {
  selectedAddonIds: string[]
  selectedAddons: AddonItem[]
  specialConfigs: {
    variableData?: VariableDataConfig
    perforation?: PerforationConfig
    banding?: BandingConfig
    cornerRounding?: CornerRoundingConfig
  }
}

// Special addon configurations
export interface VariableDataConfig {
  enabled: boolean
  locationsCount: string
  locations: string
}

export interface PerforationConfig {
  enabled: boolean
  verticalCount: string
  verticalPosition: string
  horizontalCount: string
  horizontalPosition: string
}

export interface BandingConfig {
  enabled: boolean
  bandingType: string
  itemsPerBundle: number
}

export interface CornerRoundingConfig {
  enabled: boolean
  cornerType: string
}

export interface AddonsModuleProps extends StandardModuleProps<AddonItem, string[]> {
  /** Grouped addons by display position */
  addonsGrouped?: {
    aboveDropdown: AddonItem[]
    inDropdown: AddonItem[]
    belowDropdown: AddonItem[]
  }
  /** Special addon configurations */
  variableDataConfig?: VariableDataConfig
  perforationConfig?: PerforationConfig
  bandingConfig?: BandingConfig
  cornerRoundingConfig?: CornerRoundingConfig
  /** Handlers for special configurations */
  onVariableDataChange?: (config: VariableDataConfig) => void
  onPerforationChange?: (config: PerforationConfig) => void
  onBandingChange?: (config: BandingConfig) => void
  onCornerRoundingChange?: (config: CornerRoundingConfig) => void
}

export interface AddonsModuleValue extends StandardModuleValue<AddonValue> {
  /** Total addon cost (excluding special addons) */
  totalAddonCost: number
  /** Special addon costs calculated independently */
  specialAddonCosts: number
  /** Total additional turnaround days */
  additionalTurnaroundDays: number
}

/**
 * Turnaround Module Types
 */
export interface TurnaroundItem {
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
}

export interface TurnaroundValue {
  turnaroundId: string
  turnaround?: TurnaroundItem
  estimatedDeliveryDate?: Date
  isValidWithCurrentCoating: boolean
}

export interface TurnaroundModuleProps extends StandardModuleProps<TurnaroundItem, string> {
  /** Current coating selection (for compatibility checks) */
  currentCoating?: string
}

export interface TurnaroundModuleValue extends StandardModuleValue<TurnaroundValue> {
  /** Calculated delivery date */
  estimatedDeliveryDate?: Date
  /** Whether current selection is compatible with coating */
  isCompatible: boolean
  /** Days range for current selection */
  daysRange: { min: number; max: number }
}

/**
 * Image Module Types
 */
export interface ImageItem {
  id: string
  name: string
  description?: string
  url: string
  thumbnailUrl?: string
  alt?: string
  width?: number
  height?: number
  fileSize?: number
  mimeType?: string
  tags: string[]
}

export interface UploadedFile {
  fileId: string
  originalName: string
  size: number
  mimeType: string
  thumbnailUrl?: string
  uploadedAt: string
  isImage: boolean
}

export interface ImageValue {
  uploadedFiles: UploadedFile[]
  selectedImages: ImageItem[]
}

export interface ImageModuleProps extends StandardModuleProps<ImageItem, string[]> {
  /** Currently uploaded files */
  uploadedFiles: UploadedFile[]
  /** Maximum number of files allowed */
  maxFiles?: number
  /** Accepted file types */
  acceptedTypes?: string[]
  /** Maximum file size in bytes */
  maxFileSize?: number
  /** Handler for file uploads */
  onFileUpload?: (files: FileList) => void
  /** Handler for file removal */
  onFileRemove?: (fileId: string) => void
}

export interface ImageModuleValue extends StandardModuleValue<ImageValue> {
  /** Upload progress (0-100) */
  uploadProgress?: number
  /** Whether uploads are in progress */
  isUploading: boolean
  /** Total file size */
  totalFileSize: number
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Type helper to extract item type from module props
 */
export type ExtractModuleItem<T> = T extends StandardModuleProps<infer TItem, any> ? TItem : never

/**
 * Type helper to extract value type from module props
 */
export type ExtractModuleValue<T> =
  T extends StandardModuleProps<any, infer TValue> ? TValue : never

/**
 * Union of all module types for generic handling
 */
export type AnyModuleItem =
  | QuantityItem
  | SizeItem
  | PaperStockItem
  | AddonItem
  | TurnaroundItem
  | ImageItem

/**
 * Union of all module value types
 */
export type AnyModuleValue =
  | QuantityValue
  | SizeValue
  | PaperStockValue
  | AddonValue
  | TurnaroundValue
  | ImageValue

/**
 * Module identification enum
 */
export enum ModuleType {
  QUANTITY = 'quantity',
  SIZE = 'size',
  PAPER_STOCK = 'paper-stock',
  ADDONS = 'addons',
  TURNAROUND = 'turnaround',
  IMAGES = 'images',
}

/**
 * Module metadata for runtime identification
 */
export interface ModuleMetadata {
  type: ModuleType
  name: string
  description: string
  isRequired: boolean
  defaultEnabled: boolean
}

// =============================================================================
// VALIDATION TYPES
// =============================================================================

/**
 * Validation rule interface
 */
export interface ValidationRule<T = any> {
  /** Rule name for identification */
  name: string
  /** Validation function */
  validate: (value: T, context?: any) => boolean | string
  /** Error message for failed validation */
  message: string
  /** When to trigger this validation */
  trigger?: 'onChange' | 'onBlur' | 'onSubmit'
}

/**
 * Validation context passed to rules
 */
export interface ValidationContext {
  /** All module values for cross-validation */
  moduleValues?: Record<string, any>
  /** Current configuration state */
  configuration?: any
  /** Additional context data */
  metadata?: any
}

// Note: Types cannot be exported as default object (they don't exist at runtime)
// Import types individually using named imports instead
