/**
 * page - misc definitions
 * Auto-refactored by BMAD
 */

'use client'

  Plus,
  Edit,
  Trash2,
  Copy,
  Ruler,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  Maximize2,
  Layers,
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

interface SizeGroup {
  id: string
  name: string
  description: string | null
  values: string
  defaultValue: string
  customMinWidth: number | null
  customMaxWidth: number | null
  customMinHeight: number | null
  customMaxHeight: number | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  valuesList?: string[]
  hasCustomOption?: boolean
  _count: {
    products: number
  }
}
