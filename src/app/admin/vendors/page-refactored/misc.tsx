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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface VendorAddress {
  street: string
  city: string
  state: string
  zip: string
  country: string
}

interface Vendor {
  id: string
  name: string
  contactEmail: string
  orderEmail?: string
  phone?: string
  website?: string
  address?: VendorAddress
  supportedCarriers: string[]
  isActive: boolean
  notes?: string
  turnaroundDays: number
  minimumOrderAmount?: number
  shippingCostFormula?: string
  n8nWebhookUrl?: string
  _count?: {
    orders: number
    vendorProducts: number
    vendorPaperStocks: number
  }
}

const CARRIER_OPTIONS = ['FEDEX', 'UPS', 'SOUTHWEST_CARGO']
