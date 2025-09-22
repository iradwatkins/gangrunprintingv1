/**
 * product-form - misc definitions
 * Auto-refactored by BMAD
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import toast from '@/lib/toast'
import { generateSlug } from '@/lib/utils'
import {
import { ProductImageUpload } from './product-image-upload'
import { ProductPaperStocks } from './product-paper-stocks'
import { ProductOptions } from './product-options'
import { PricingCalculator } from './pricing-calculator'
import { ProductQuantities } from './product-quantities'
import { ProductSizes } from './product-sizes'


'use client'

  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

  Package,
  DollarSign,
  Clock,
  Layers,
  FileText,
  Image as ImageIcon,
  Settings,
  Zap,
  Save,
  Loader2,
  Ruler,
} from 'lucide-react'

interface ProductFormProps {
  product?: any
}
