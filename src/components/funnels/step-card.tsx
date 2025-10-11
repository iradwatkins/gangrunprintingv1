'use client'

import { useState } from 'react'
import {
  type FunnelStep,
  type Product,
  type ProductImage,
  type ProductCategory,
  type FunnelStepProduct,
  type OrderBump,
  type Upsell,
  type Downsell,
} from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreVertical,
  Edit,
  Trash2,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { StepEditorDialog } from './step-editor-dialog'

type StepWithDetails = FunnelStep & {
  FunnelStepProduct: (FunnelStepProduct & {
    Product: Product & {
      ProductImage: ProductImage[]
      ProductCategory: ProductCategory
    }
  })[]
  OrderBump: (OrderBump & {
    Product: Product & {
      ProductImage: ProductImage[]
    }
  })[]
  Upsell: (Upsell & {
    Product: Product & {
      ProductImage: ProductImage[]
    }
  })[]
  Downsell: (Downsell & {
    Product: Product & {
      ProductImage: ProductImage[]
    }
  })[]
}

type ProductWithDetails = Product & {
  ProductImage: ProductImage[]
  ProductCategory: ProductCategory
}

interface StepCardProps {
  step: StepWithDetails
  funnelId: string
  products: ProductWithDetails[]
  onUpdate: () => void
}

export function StepCard({ step, funnelId, products, onUpdate }: StepCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${step.name}"?`)) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/funnels/${funnelId}/steps/${step.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        onUpdate()
      } else {
        alert('Failed to delete step')
      }
    } catch (error) {
      alert('Failed to delete step')
    } finally {
      setIsDeleting(false)
    }
  }

  const getStepIcon = () => {
    switch (step.type) {
      case 'LANDING':
        return '🎯'
      case 'CHECKOUT':
        return '🛒'
      case 'UPSELL':
        return '⬆️'
      case 'DOWNSELL':
        return '⬇️'
      case 'THANKYOU':
        return '🎉'
      default:
        return '📄'
    }
  }

  const getStepTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      LANDING: 'Landing Page',
      CHECKOUT: 'Checkout',
      UPSELL: 'Upsell',
      DOWNSELL: 'Downsell',
      THANKYOU: 'Thank You',
    }
    return labels[type] || type
  }

  return (
    <>
      <Card className="relative">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="text-3xl">{getStepIcon()}</div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">{step.name}</CardTitle>
                  <Badge variant="outline">{getStepTypeLabel(step.type)}</Badge>
                  <Badge variant={step.isActive ? 'default' : 'secondary'}>
                    {step.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Position: {step.position} • Slug: /{step.slug}
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Step
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  disabled={isDeleting}
                  onClick={handleDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Products */}
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Products</p>
                <p className="text-sm text-muted-foreground">{step.FunnelStepProduct.length}</p>
              </div>
            </div>

            {/* Order Bumps */}
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Order Bumps</p>
                <p className="text-sm text-muted-foreground">{step.OrderBump.length}</p>
              </div>
            </div>

            {/* Upsells */}
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Upsells</p>
                <p className="text-sm text-muted-foreground">{step.Upsell.length}</p>
              </div>
            </div>

            {/* Downsells */}
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Downsells</p>
                <p className="text-sm text-muted-foreground">{step.Downsell.length}</p>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm font-medium">Views</p>
              <p className="text-2xl font-bold">{step.views.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Conversions</p>
              <p className="text-2xl font-bold">{step.conversions.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Revenue</p>
              <p className="text-2xl font-bold">${step.revenue.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <StepEditorDialog
        funnelId={funnelId}
        open={editDialogOpen}
        products={products}
        step={step}
        onOpenChange={setEditDialogOpen}
        onSuccess={onUpdate}
      />
    </>
  )
}
