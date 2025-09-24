/**
 * page - misc definitions
 * Auto-refactored by BMAD
 */

'use client'

  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface CoatingOption {
  id: string
  name: string
  description: string | null
}

interface SidesOption {
  id: string
  name: string
  code: string
  description: string | null
}

interface PaperStockSidesRelation {
  sidesOptionId: string
  priceMultiplier: number
  isEnabled: boolean
}

interface PaperStockCoatingRelation {
  coatingId: string
  isDefault: boolean
}

interface PaperStock {
  id: string
  name: string
  weight: number
  pricePerSqInch: number
  tooltipText: string | null
  isActive: boolean
  paperStockCoatings: (PaperStockCoatingRelation & { coating: CoatingOption })[]
  paperStockSides: (PaperStockSidesRelation & { sidesOption: SidesOption })[]
  productsCount?: number
}
