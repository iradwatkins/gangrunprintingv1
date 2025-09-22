/**
 * page - misc definitions
 * Auto-refactored by BMAD
 */

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { box } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
