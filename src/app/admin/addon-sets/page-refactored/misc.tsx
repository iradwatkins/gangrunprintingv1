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


'use client'

  Plus,
  Edit,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Eye,
  Copy,
  ArrowUp,
  ArrowDown,
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

interface AddOn {
  id: string
  name: string
  description: string | null
  pricingModel: string
  configuration: any
  isActive: boolean
}

interface AddOnSetItem {
  id: string
  addOnId: string
  displayPosition: 'ABOVE_DROPDOWN' | 'IN_DROPDOWN' | 'BELOW_DROPDOWN'
  isDefault: boolean
  sortOrder: number
  addOn: AddOn
}

interface AddOnSet {
  id: string
  name: string
  description: string | null
  sortOrder: number
  isActive: boolean
  addOnSetItems: AddOnSetItem[]
  _count: {
    addOnSetItems: number
    productAddOnSets: number
  }
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
    <div ref={setNodeRef} style={style} {...attributes}>
      {children}
      <div {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  )
}
