/**
 * translation-manager - misc definitions
 * Auto-refactored by BMAD
 */

'use client'

  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  DialogTrigger,
} from '@/components/ui/dialog'
  Plus,
  Search,
  Edit,
  Trash2,
  Languages,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react'

interface Translation {
  id: string
  key: string
  namespace: string
  locale: string
  value: string
  context?: string
  isApproved: boolean
  source: 'MANUAL' | 'AUTO_OPENAI' | 'AUTO_GOOGLE' | 'IMPORT' | 'API'
  confidence?: number
  autoTranslated: boolean
  createdAt: string
  updatedAt: string
}

interface TranslationManagerProps {
  searchParams: { [key: string]: string | string[] | undefined }
}
