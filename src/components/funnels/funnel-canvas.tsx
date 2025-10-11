'use client'

import { useState } from 'react'
import {
  type Funnel,
  type FunnelStep,
  type Product,
  type ProductImage,
  type ProductCategory,
  type FunnelStepProduct,
  type OrderBump,
  type Upsell,
  type Downsell,
} from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, ArrowDown } from 'lucide-react'
import { StepCard } from './step-card'
import { AddStepDialog } from './add-step-dialog'

type FunnelWithSteps = Funnel & {
  FunnelStep: (FunnelStep & {
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
  })[]
}

type ProductWithDetails = Product & {
  ProductImage: ProductImage[]
  ProductCategory: ProductCategory
}

interface FunnelCanvasProps {
  funnel: FunnelWithSteps
  products: ProductWithDetails[]
  onUpdate: () => void
}

export function FunnelCanvas({ funnel, products, onUpdate }: FunnelCanvasProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [insertAfterPosition, setInsertAfterPosition] = useState<number | null>(null)

  const handleAddStep = (position?: number) => {
    setInsertAfterPosition(position ?? null)
    setAddDialogOpen(true)
  }

  if (funnel.FunnelStep.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-2">No steps yet</h3>
          <p className="text-muted-foreground mb-6">Get started by adding your first funnel step</p>
          <Button onClick={() => handleAddStep()}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Step
          </Button>
        </div>

        <AddStepDialog
          funnelId={funnel.id}
          open={addDialogOpen}
          position={1}
          onOpenChange={setAddDialogOpen}
          onSuccess={onUpdate}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add Step at Top */}
      <div className="flex justify-center">
        <Button size="sm" variant="outline" onClick={() => handleAddStep(0)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Step Before
        </Button>
      </div>

      {/* Steps */}
      {funnel.FunnelStep.map((step, index) => (
        <div key={step.id}>
          <StepCard funnelId={funnel.id} products={products} step={step} onUpdate={onUpdate} />

          {/* Add Step Button Between Steps */}
          <div className="flex justify-center items-center py-4">
            <div className="flex flex-col items-center gap-2">
              <ArrowDown className="h-4 w-4 text-muted-foreground" />
              <Button size="sm" variant="ghost" onClick={() => handleAddStep(step.position)}>
                <Plus className="h-3 w-3 mr-1" />
                Add Step
              </Button>
            </div>
          </div>
        </div>
      ))}

      <AddStepDialog
        funnelId={funnel.id}
        open={addDialogOpen}
        position={
          insertAfterPosition !== null ? insertAfterPosition + 1 : funnel.FunnelStep.length + 1
        }
        onOpenChange={setAddDialogOpen}
        onSuccess={onUpdate}
      />
    </div>
  )
}
