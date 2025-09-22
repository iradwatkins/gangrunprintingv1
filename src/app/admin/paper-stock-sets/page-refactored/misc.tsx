/**
 * page - misc definitions
 * Auto-refactored by BMAD
 */

import { useState, useEffect } from 'react'
import {
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import {
import {
import {
import { Textarea } from '@/components/ui/textarea'
import toast from '@/lib/toast'
import {
import {
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'


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
  paperStockCoatings: any[]
  paperStockSides: any[]
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
  productPaperStockGroups?: any[]
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
