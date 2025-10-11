'use client'

import { useState } from 'react'
import {
  type FunnelStep,
  type Product,
  type ProductImage,
  type ProductCategory,
} from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, X } from 'lucide-react'

type StepWithDetails = FunnelStep & {
  Upsell: any[]
  Downsell: any[]
}

type ProductWithDetails = Product & {
  ProductImage: ProductImage[]
  ProductCategory: ProductCategory
}

interface UpsellDownsellEditorProps {
  step: StepWithDetails
  funnelId: string
  products: ProductWithDetails[]
  onSuccess: () => void
}

export function UpsellDownsellEditor({
  step,
  funnelId,
  products,
  onSuccess,
}: UpsellDownsellEditorProps) {
  const [formData, setFormData] = useState({
    productId: '',
    headline: '',
    description: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountValue: '',
  })

  const handleCreateUpsell = async () => {
    try {
      await fetch(`/api/funnels/${funnelId}/steps/${step.id}/upsells`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          discountValue: formData.discountValue ? parseFloat(formData.discountValue) : null,
        }),
      })
      setFormData({
        productId: '',
        headline: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
      })
      onSuccess()
    } catch (error) {
      alert('Failed to create upsell')
    }
  }

  const handleCreateDownsell = async () => {
    try {
      await fetch(`/api/funnels/${funnelId}/steps/${step.id}/downsells`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          discountValue: formData.discountValue ? parseFloat(formData.discountValue) : null,
        }),
      })
      setFormData({
        productId: '',
        headline: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
      })
      onSuccess()
    } catch (error) {
      alert('Failed to create downsell')
    }
  }

  return (
    <Tabs defaultValue="upsells">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="upsells">Upsells ({step.Upsell.length})</TabsTrigger>
        <TabsTrigger value="downsells">Downsells ({step.Downsell.length})</TabsTrigger>
      </TabsList>

      <TabsContent className="space-y-4 mt-4" value="upsells">
        {step.Upsell.map((upsell) => {
          const product = products.find((p) => p.id === upsell.productId)
          return (
            <Card key={upsell.id}>
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <CardTitle className="text-base">{upsell.headline}</CardTitle>
                    <p className="text-sm text-muted-foreground">{product?.name}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await fetch(
                        `/api/funnels/${funnelId}/steps/${step.id}/upsells/${upsell.id}`,
                        { method: 'DELETE' }
                      )
                      onSuccess()
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          )
        })}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add Upsell</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Product</Label>
              <Select
                value={formData.productId}
                onValueChange={(v) => setFormData({ ...formData, productId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Headline</Label>
              <Input
                placeholder="Wait! Special offer..."
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Discount Type</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(v: any) => setFormData({ ...formData, discountType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FIXED">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Discount Value</Label>
                <Input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                />
              </div>
            </div>
            <Button
              className="w-full"
              disabled={!formData.productId || !formData.headline}
              onClick={handleCreateUpsell}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Upsell
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent className="space-y-4 mt-4" value="downsells">
        {step.Downsell.map((downsell) => {
          const product = products.find((p) => p.id === downsell.productId)
          return (
            <Card key={downsell.id}>
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <CardTitle className="text-base">{downsell.headline}</CardTitle>
                    <p className="text-sm text-muted-foreground">{product?.name}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await fetch(
                        `/api/funnels/${funnelId}/steps/${step.id}/downsells/${downsell.id}`,
                        { method: 'DELETE' }
                      )
                      onSuccess()
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          )
        })}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add Downsell</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Product</Label>
              <Select
                value={formData.productId}
                onValueChange={(v) => setFormData({ ...formData, productId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Headline</Label>
              <Input
                placeholder="Last chance offer..."
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Discount Type</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(v: any) => setFormData({ ...formData, discountType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FIXED">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Discount Value</Label>
                <Input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                />
              </div>
            </div>
            <Button
              className="w-full"
              disabled={!formData.productId || !formData.headline}
              onClick={handleCreateDownsell}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Downsell
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
