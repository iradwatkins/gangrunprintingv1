/**
 * page - misc definitions
 * Auto-refactored by BMAD
 */

import { CSS } from '@dnd-kit/utilities'

'use client'

  Plus,
  Edit,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Eye,
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

interface PaperStock {
  id: string
  name: string
  weight: number
  pricePerSqInch: number
  tooltipText: string | null
  isActive: boolean
  paperStockCoatings: Record<string, unknown>[]
  paperStockSides: Record<string, unknown>[]
}

interface PaperStockGroupItem {
  id: string
  paperStockId: string
  isDefault: boolean
  sortOrder: number
  paperStock: PaperStock
}

interface PaperStockGroup {
  id: string
  name: string
  description: string | null
  sortOrder: number
  isActive: boolean
  paperStockItems: PaperStockGroupItem[]
  productPaperStockGroups?: Record<string, unknown>[]
}

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} className="flex items-center gap-2" style={style}>
      <div {...attributes} {...listeners} className="cursor-move">
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      {children}
    </div>
  )
}
