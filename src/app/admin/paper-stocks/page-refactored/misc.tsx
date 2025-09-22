/**
 * page - misc definitions
 * Auto-refactored by BMAD
 */

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Palette, Square, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import {
import {
import { Textarea } from '@/components/ui/textarea'
import { CoatingCreationModal } from '@/components/admin/coating-creation-modal'
import { SidesCreationModal } from '@/components/admin/sides-creation-modal'
import toast from '@/lib/toast'


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
  DialogFooter,
} from '@/components/ui/dialog'

interface CoatingOption {
  id: string
  name: string
  description: string | null
}

interface SidesOption {
  id: string
  name: string
  code: string
  description: string | null
}

interface PaperStockSidesRelation {
  sidesOptionId: string
  priceMultiplier: number
  isEnabled: boolean
}

interface PaperStockCoatingRelation {
  coatingId: string
  isDefault: boolean
}

interface PaperStock {
  id: string
  name: string
  weight: number
  pricePerSqInch: number
  tooltipText: string | null
  isActive: boolean
  paperStockCoatings: (PaperStockCoatingRelation & { coating: CoatingOption })[]
  paperStockSides: (PaperStockSidesRelation & { sidesOption: SidesOption })[]
  productsCount?: number
}
