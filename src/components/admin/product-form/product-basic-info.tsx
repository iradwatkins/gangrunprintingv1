'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'

interface ProductCategory {
  id: string
  name: string
}

interface ProductBasicInfoProps {
  formData: {
    name: string
    sku: string
    categoryId: string
    description: string
    isActive: boolean
    isFeatured: boolean
  }
  categories: ProductCategory[]
  onUpdate: (data: Partial<ProductBasicInfoProps['formData']>) => void
}

export function ProductBasicInfo({ formData, categories, onUpdate }: ProductBasicInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Basic Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Premium Business Cards"
              value={formData.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="sku">SKU (Auto-generated)</Label>
            <Input readOnly className="bg-gray-50" id="sku" value={formData.sku} />
          </div>
        </div>

        <div>
          <Label htmlFor="category">Product Category *</Label>
          <Select
            value={formData.categoryId}
            onValueChange={(value) => onUpdate({ categoryId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a category..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="description">Product Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your product..."
            rows={4}
            value={formData.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Active Status</Label>
            <Switch
              checked={formData.isActive}
              id="isActive"
              onCheckedChange={(checked) => onUpdate({ isActive: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="isFeatured">Featured Product</Label>
            <Switch
              checked={formData.isFeatured}
              id="isFeatured"
              onCheckedChange={(checked) => onUpdate({ isFeatured: checked })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
