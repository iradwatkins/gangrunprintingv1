/**
 * product-form - Refactored Entry Point
 * Original: 594 lines
 * Refactored: Multiple modules < 300 lines each
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

// Re-export refactored modules
export * from './product-form-refactored/misc';
export * from './product-form-refactored/component';

// Main export (if component file)

