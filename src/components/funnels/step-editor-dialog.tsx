'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  type FunnelStep,
  type Product,
  type ProductImage,
  type ProductCategory,
} from '@prisma/client'
import { ProductSelector } from './product-selector'
import { OrderBumpEditor } from './order-bump-editor'
import { UpsellDownsellEditor } from './upsell-downsell-editor'
import { PageBuilder } from './page-builder'
import { TemplateLibrary } from './template-library'

type StepWithDetails = FunnelStep & {
  FunnelStepProduct: any[]
  OrderBump: any[]
  Upsell: any[]
  Downsell: any[]
  PageVersion?: Array<{
    id: string
    PageElement: any[]
  }>
}

type ProductWithDetails = Product & {
  ProductImage: ProductImage[]
  ProductCategory: ProductCategory
}

interface StepEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  step: StepWithDetails
  funnelId: string
  products: ProductWithDetails[]
  onSuccess: () => void
}

export function StepEditorDialog({
  open,
  onOpenChange,
  step,
  funnelId,
  products,
  onSuccess,
}: StepEditorDialogProps) {
  const [saving, setSaving] = useState(false)

  const handleAddProduct = async (productId: string, data: any) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/funnels/${funnelId}/steps/${step.id}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, ...data }),
      })

      if (res.ok) {
        onSuccess()
      } else {
        alert('Failed to add product')
      }
    } catch (error) {
      alert('Failed to add product')
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveProduct = async (productId: string) => {
    const fsp = step.FunnelStepProduct.find((f) => f.productId === productId)
    if (!fsp) return

    setSaving(true)
    try {
      const res = await fetch(`/api/funnels/${funnelId}/steps/${step.id}/products/${fsp.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        onSuccess()
      } else {
        alert('Failed to remove product')
      }
    } catch (error) {
      alert('Failed to remove product')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateProduct = async (productId: string, data: any) => {
    // Implementation for updating product settings
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Step: {step.name}</DialogTitle>
        </DialogHeader>

        <Tabs className="mt-4" defaultValue="page">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="page">Page Design</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="bumps">Order Bumps</TabsTrigger>
            <TabsTrigger value="offers">Offers</TabsTrigger>
          </TabsList>

          <TabsContent className="mt-4" value="page">
            {step.PageVersion && step.PageVersion.length > 0 ? (
              <PageBuilder
                funnelId={funnelId}
                initialElements={step.PageVersion[0].PageElement || []}
                stepId={step.id}
                versionId={step.PageVersion[0].id}
                onSave={onSuccess}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No page version created yet</p>
                <p className="text-sm mt-2">Create a version from the Templates tab</p>
              </div>
            )}
          </TabsContent>

          <TabsContent className="mt-4" value="templates">
            <TemplateLibrary
              onSelectTemplate={async (templateId) => {
                // Create new page version from template
                const res = await fetch(`/api/funnels/${funnelId}/steps/${step.id}/versions`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    versionName: 'Original',
                    templateId,
                    trafficSplit: 100,
                  }),
                })
                if (res.ok) {
                  onSuccess()
                }
              }}
            />
          </TabsContent>

          <TabsContent className="mt-4" value="products">
            <ProductSelector
              products={products}
              selectedProducts={step.FunnelStepProduct}
              onAddProduct={handleAddProduct}
              onRemoveProduct={handleRemoveProduct}
              onUpdateProduct={handleUpdateProduct}
            />
          </TabsContent>

          <TabsContent className="mt-4" value="bumps">
            <OrderBumpEditor
              funnelId={funnelId}
              products={products}
              step={step}
              onSuccess={onSuccess}
            />
          </TabsContent>

          <TabsContent className="mt-4" value="offers">
            <UpsellDownsellEditor
              funnelId={funnelId}
              products={products}
              step={step}
              onSuccess={onSuccess}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
