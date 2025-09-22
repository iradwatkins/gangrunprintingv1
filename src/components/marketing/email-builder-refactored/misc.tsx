/**
 * email-builder - misc definitions
 * Auto-refactored by BMAD
 */

import { useState, useCallback, useRef } from 'react'
import {
import {
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
import { Popover, PopoverContent } from '@/components/ui/popover'
import { ColorPicker } from '@/components/ui/color-picker'
import {


'use client'

  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
  Type,
  Image,
  Link,
  Divide,
  Grid,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Palette,
  Settings,
  Eye,
  Code,
  Plus,
  Trash2,
  Copy,
  Move,
  GripVertical,
} from 'lucide-react'
