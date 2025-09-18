'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import toast from '@/lib/toast'

export default function NewSimpleProductPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    basePrice: '',
    setupFee: '',
    productionTime: '3',
    paperType: 'standard', // simplified paper options
    isActive: true
  })

  const handleSubmit = async () => {
    if (!formData.name || !formData.sku || !formData.basePrice) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
          sku: formData.sku,
          description: formData.description,
          shortDescription: formData.description.substring(0, 100),
          categoryId: 'business-cards', // hardcoded for simplicity
          basePrice: parseFloat(formData.basePrice),
          setupFee: parseFloat(formData.setupFee || '0'),
          productionTime: parseInt(formData.productionTime),
          isActive: formData.isActive,
          isFeatured: false,
          gangRunEligible: false,
          rushAvailable: false,
          paperType: formData.paperType,
          // Minimal required relationships
          selectedPaperStocks: ['cmfmved18000313px6rzra4u5'], // default paper stock
          defaultPaperStock: 'cmfmved18000313px6rzra4u5',
          selectedQuantityGroup: 'cmfk2y9d0000u10ij4f2rvy3g', // default quantity group
          selectedSizeGroup: 'cmfk2y9bs000k10ij4vmmgkgf', // default size group
          selectedAddOns: []
        })
      })

      if (response.ok) {
        toast.success('Product created successfully!')
        router.push('/admin/products')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to create product')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error('Failed to create product')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Simple Product</h1>
            <p className="text-muted-foreground">Create a basic paper printing product</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Basic Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Product Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value
                  const sku = name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 8)
                  setFormData(prev => ({ ...prev, name, sku }))
                }}
                placeholder="e.g., Premium Business Cards"
                required
              />
            </div>

            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku" className="text-sm font-medium">
                SKU *
              </Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                placeholder="Auto-generated from name"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your product..."
                rows={4}
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice" className="text-sm font-medium">
                  Base Price * ($)
                </Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, basePrice: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="setupFee" className="text-sm font-medium">
                  Setup Fee ($)
                </Label>
                <Input
                  id="setupFee"
                  type="number"
                  step="0.01"
                  value={formData.setupFee}
                  onChange={(e) => setFormData(prev => ({ ...prev, setupFee: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Production Time */}
            <div className="space-y-2">
              <Label htmlFor="productionTime" className="text-sm font-medium">
                Production Time (days)
              </Label>
              <Select
                value={formData.productionTime}
                onValueChange={(value) => setFormData(prev => ({ ...prev, productionTime: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="2">2 days</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="5">5 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Paper Type */}
            <div className="space-y-2">
              <Label htmlFor="paperType" className="text-sm font-medium">
                Paper Type
              </Label>
              <Select
                value={formData.paperType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, paperType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (100 lb Gloss)</SelectItem>
                  <SelectItem value="premium">Premium (16pt Cardstock)</SelectItem>
                  <SelectItem value="recycled">Recycled (14pt Matte)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="min-w-32"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Product
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}