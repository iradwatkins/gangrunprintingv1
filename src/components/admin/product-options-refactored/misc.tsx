/**
 * product-options - misc definitions
 * Auto-refactored by BMAD
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
import {
import {
import {
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'


'use client'

  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
  Plus,
  X,
  Edit2,
  Trash2,
  Settings,
  DollarSign,
  GripVertical,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

type OptionType = 'SELECT' | 'RADIO' | 'CHECKBOX' | 'TEXT' | 'NUMBER'

interface OptionValue {
  id?: string
  value: string
  label: string
  additionalPrice: number
  isDefault: boolean
  sortOrder: number
}

interface ProductOption {
  id?: string
  name: string
  type: OptionType
  required: boolean
  values: OptionValue[]
  sortOrder: number
}

interface ProductOptionsProps {
  options: ProductOption[]
  onOptionsChange: (options: ProductOption[]) => void
}

function SortableOption({ option, index, onEdit, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: option.name,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const [expanded, setExpanded] = useState(false)

  return (
    <div ref={setNodeRef} style={style}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div {...attributes} {...listeners} className="cursor-move">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{option.name}</CardTitle>
                  <Badge variant="outline">{option.type}</Badge>
                  {option.required && <Badge variant="secondary">Required</Badge>}
                </div>
                <CardDescription className="mt-1">
                  {option.values.length} value{option.values.length !== 1 ? 's' : ''}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => setExpanded(!expanded)}>
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onEdit(index)}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onDelete(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        {expanded && (
          <CardContent>
            <div className="space-y-2">
              {option.values.map((value: OptionValue, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>{value.label}</span>
                    {value.isDefault && (
                      <Badge className="text-xs" variant="outline">
                        Default
                      </Badge>
                    )}
                  </div>
                  {value.additionalPrice > 0 && (
                    <span className="text-muted-foreground">
                      +${value.additionalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
