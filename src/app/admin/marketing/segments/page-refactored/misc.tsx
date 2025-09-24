/**
 * page - misc definitions
 * Auto-refactored by BMAD
 */

import {
import {
import {

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
  DialogTrigger,
} from '@/components/ui/dialog'
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
  Target,
  Plus,
  Users,
  TrendingUp,
  RefreshCw,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  BarChart3,
} from 'lucide-react'

interface Segment {
  id: string
  name: string
  description: string | null
  count: number
  isActive: boolean
  isDynamic: boolean
  lastUpdated: string
  createdAt: string
}

interface SegmentRule {
  field: string
  operator: string
  value: Record<string, unknown>
  type: 'user' | 'order' | 'custom'
}

const FIELD_OPTIONS = [
  { value: 'email', label: 'Email', type: 'user' },
  { value: 'name', label: 'Name', type: 'user' },
  { value: 'role', label: 'Role', type: 'user' },
  { value: 'emailVerified', label: 'Email Verified', type: 'user' },
  { value: 'marketingOptIn', label: 'Marketing Opt-in', type: 'user' },
  { value: 'createdAt', label: 'Registration Date', type: 'user' },
  { value: 'total', label: 'Order Total', type: 'order' },
  { value: 'orderCount', label: 'Number of Orders', type: 'order' },
  { value: 'totalSpent', label: 'Total Spent', type: 'order' },
  { value: 'lastOrderDate', label: 'Days Since Last Order', type: 'order' },
  { value: 'rfmScore', label: 'RFM Score', type: 'custom' },
  { value: 'engagementScore', label: 'Engagement Score', type: 'custom' },
]

const OPERATOR_OPTIONS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'contains', label: 'Contains' },
  { value: 'in', label: 'In' },
  { value: 'not_in', label: 'Not In' },
  { value: 'between', label: 'Between' },
]
