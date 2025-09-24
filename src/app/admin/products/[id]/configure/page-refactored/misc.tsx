/**
 * page - misc definitions
 * Auto-refactored by BMAD
 */

import { use, useState, useEffect } from 'react'
import {
import toast from '@/lib/toast'

'use client'

  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface PaperStock {
  id: string
  name: string
  basePrice: number
  shippingWeight: number
  isActive: boolean
  coatings: Array<{
    id: string
    label: string
    enabled: boolean
  }>
  sidesOptions: Array<{
    id: string
    label: string
    enabled: boolean
    multiplier: number
  }>
  defaultCoating: string
  defaultSides: string
}

interface Size {
  id: string
  displayName: string
  width: number
  height: number
  squareInches: number
}

interface Quantity {
  id: string
  value: number
  isDefault: boolean
}

interface ProductConfig {
  id: string
  name: string
  sku: string
  selectedPaperStocks: string[]
  selectedSizes: string[]
  selectedQuantities: string[]
  defaultPaperStock: string
  defaultSize: string
  defaultQuantity: string
}
