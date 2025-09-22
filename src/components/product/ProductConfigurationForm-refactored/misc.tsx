/**
 * ProductConfigurationForm - misc definitions
 * Auto-refactored by BMAD
 */

import { useEffect, useMemo, useState } from 'react'
import { Info } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import AddonAccordion from './AddonAccordion'
import TurnaroundTimeSelector from './TurnaroundTimeSelector'


'use client'


  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'


// Types for configuration data
interface PaperStock {
  id: string
  name: string
  weight: number
  pricePerSqInch: number
  tooltipText?: string
  paperStockCoatings: Array<{
    coatingId: string
    isDefault: boolean
    coating: {
      id: string
      name: string
    }
  }>
  paperStockSides: Array<{
    sidesOptionId: string
    priceMultiplier: number
    isEnabled: boolean
    sidesOption: {
      id: string
      name: string
    }
  }>
}

interface TurnaroundTime {
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

interface Addon {
  id: string
  name: string
  description: string
  pricingModel: 'FIXED_FEE' | 'PERCENTAGE' | 'PER_UNIT'
  price: number
  priceDisplay: string
  isDefault: boolean
  additionalTurnaroundDays: number
}

interface ConfigurationData {
  quantities: Array<{
    id: string
    value: number
    label: string
  }>
  sizes: Array<{
    id: string
    name: string
    displayName: string
    width: number
    height: number
    squareInches: number
    priceMultiplier: number
    isDefault: boolean
  }>
  paperStocks: PaperStock[]
  turnaroundTimes: TurnaroundTime[]
  addons: Addon[]
  defaults: {
    quantity?: string
    size?: string
    paper?: string
    coating?: string
    sides?: string
    turnaround?: string
    addons?: string[]
  }
}

interface ProductConfiguration {
  quantity: string
  size: string
  exactSize: boolean
  sides: string
  paperStock: string
  coating: string
  turnaround: string
  selectedAddons: string[]
}

interface ProductConfigurationFormProps {
  productId: string
  basePrice?: number
  setupFee?: number
  onConfigurationChange?: (config: ProductConfiguration, isComplete: boolean) => void
  onPriceChange?: (price: number) => void
}
