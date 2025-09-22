/**
 * page - misc definitions
 * Auto-refactored by BMAD
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Mail, Phone, Globe, Truck, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
import {
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import toast from '@/lib/toast'
import { Checkbox } from '@/components/ui/checkbox'


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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface VendorAddress {
  street: string
  city: string
  state: string
  zip: string
  country: string
}

interface Vendor {
  id: string
  name: string
  contactEmail: string
  orderEmail?: string
  phone?: string
  website?: string
  address?: VendorAddress
  supportedCarriers: string[]
  isActive: boolean
  notes?: string
  turnaroundDays: number
  minimumOrderAmount?: number
  shippingCostFormula?: string
  n8nWebhookUrl?: string
  _count?: {
    orders: number
    vendorProducts: number
    vendorPaperStocks: number
  }
}

const CARRIER_OPTIONS = ['FEDEX', 'UPS', 'SOUTHWEST_CARGO']
