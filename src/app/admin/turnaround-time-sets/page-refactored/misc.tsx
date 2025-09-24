/**
 * page - misc definitions
 * Auto-refactored by BMAD
 */

import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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

interface TurnaroundTime {
  id: string
  name: string
  displayName: string
  daysMin: number
  daysMax: number | null
  priceMultiplier: number
  basePrice: number
  isActive: boolean
}

interface TurnaroundTimeSetItem {
  id: string
  turnaroundTimeId: string
  TurnaroundTime: TurnaroundTime
  isDefault: boolean
  sortOrder: number
  priceOverride?: number
}

interface TurnaroundTimeSet {
  id: string
  name: string
  description: string | null
  isActive: boolean
  sortOrder: number
  TurnaroundTimeSetItem: TurnaroundTimeSetItem[]
}

function SortableSetItem({
  item,
  onToggle,
  onRemove,
  onSetDefault,
  onUpdatePriceOverride,
}: {
  item: TurnaroundTimeSetItem
  onToggle: () => void
  onRemove: () => void
  onSetDefault: () => void
  onUpdatePriceOverride: (price: number | null) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg ${
        isDragging ? 'shadow-lg' : ''
      }`}
      style={style}
    >
      <div {...attributes} {...listeners} className="cursor-grab">
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{item.TurnaroundTime.displayName}</span>
          {item.isDefault && (
            <Badge className="text-xs" variant="default">
              Default
            </Badge>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {item.TurnaroundTime.daysMin}-{item.TurnaroundTime.daysMax || 'same'} days •
          {item.TurnaroundTime.priceMultiplier > 1
            ? ` ${((item.TurnaroundTime.priceMultiplier - 1) * 100).toFixed(0)}% surcharge`
            : ` +$${item.TurnaroundTime.basePrice.toFixed(2)}`}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Input
          className="w-24"
          placeholder="Override price"
          type="number"
          value={item.priceOverride || ''}
          onChange={(e) =>
            onUpdatePriceOverride(e.target.value ? parseFloat(e.target.value) : null)
          }
        />
        <Button disabled={item.isDefault} size="sm" variant="ghost" onClick={onSetDefault}>
          Set Default
        </Button>
        <Button className="h-8 w-8" size="icon" variant="ghost" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
