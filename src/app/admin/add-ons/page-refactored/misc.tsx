/**
 * page - misc definitions
 * Auto-refactored by BMAD
 */

import {
import {
import {
import {
import toast from '@/lib/toast'

'use client'

  Plus,
  Edit,
  Trash2,
  DollarSign,
  Percent,
  Package,
  Settings,
  Search,
  Save,
  X,
  Copy,
} from 'lucide-react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AddOn {
  id: string
  name: string
  description: string | null
  tooltipText: string | null
  pricingModel: 'FLAT' | 'PERCENTAGE' | 'PER_UNIT' | 'CUSTOM'
  configuration: Record<string, unknown>
  additionalTurnaroundDays: number
  sortOrder: number
  isActive: boolean
  adminNotes: string | null
  createdAt: string
  updatedAt: string
}

const pricingModelIcons = {
  FLAT: <DollarSign className="h-4 w-4" />,
  PERCENTAGE: <Percent className="h-4 w-4" />,
  PER_UNIT: <Package className="h-4 w-4" />,
  CUSTOM: <Settings className="h-4 w-4" />,
}

const pricingModelLabels = {
  FLAT: 'Flat Fee',
  PERCENTAGE: 'Percentage',
  PER_UNIT: 'Per Unit',
  CUSTOM: 'Custom',
}
