export interface TurnaroundTimeOption {
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
  restrictedOptions?: any
  totalPrice: number // Calculated total price for this turnaround option
  pricePerUnit: number // Calculated price per unit
}

export interface CartItem {
  id: string
  productId: string
  productName: string
  productSlug: string
  sku: string
  price: number
  quantity: number
  subtotal: number
  image?: string
  turnaround: TurnaroundTimeOption
  options: {
    size?: string
    paperStock?: string
    paperStockId?: string
    coating?: string
    sides?: string
    addOns?: Array<{
      id: string
      name: string
      price: number
      configuration?: any
    }>
  }
  fileUrl?: string
  fileName?: string
  fileSize?: number
  designNotes?: string
}

export interface CartState {
  items: CartItem[]
  isOpen: boolean
  lastUpdated: string
}

export interface CartContextType {
  items: CartItem[]
  isOpen: boolean
  itemCount: number
  subtotal: number
  tax: number
  shipping: number
  total: number
  addItem: (item: Omit<CartItem, 'id' | 'subtotal'>) => void
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  isLoading: boolean
}

export interface ProductConfiguration {
  productId: string
  productName: string
  productSlug: string
  sku: string
  basePrice: number
  quantity: number
  size?: string
  paperStock?: string
  paperStockId?: string
  coating?: string
  sides?: string
  turnaround: TurnaroundTimeOption
  image?: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
  designNotes?: string
  addOns?: Array<{
    id: string
    name: string
    price: number
    configuration?: any
  }>
}
