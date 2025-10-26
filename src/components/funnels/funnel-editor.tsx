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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, Eye, Plus, Settings } from 'lucide-react'
import { Link } from '@/lib/i18n/navigation'
import { useRouter } from 'next/navigation'
import { FunnelCanvas } from './funnel-canvas'
import { FunnelSettings } from './funnel-settings'

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

interface FunnelEditorProps {
  funnel: FunnelWithSteps
  products: ProductWithDetails[]
}

export function FunnelEditor({ funnel: initialFunnel, products }: FunnelEditorProps) {
  const router = useRouter()
  const [funnel, setFunnel] = useState(initialFunnel)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('steps')

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/funnels/${funnel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: funnel.name,
          description: funnel.description,
          status: funnel.status,
          seoTitle: funnel.seoTitle,
          seoDescription: funnel.seoDescription,
        }),
      })

      if (res.ok) {
        router.refresh()
        alert('Funnel saved successfully!')
      } else {
        alert('Failed to save funnel')
      }
    } catch (error) {
      alert('Failed to save funnel')
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      ACTIVE: 'default',
      DRAFT: 'secondary',
      PAUSED: 'outline',
      ARCHIVED: 'destructive',
    }
    return colors[status] || 'secondary'
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/funnels">
            <Button size="sm" variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{funnel.name}</h1>
              <Badge variant={getStatusColor(funnel.status)}>{funnel.status}</Badge>
            </div>
            <p className="text-muted-foreground mt-1">{funnel.description || 'No description'}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/funnel/${funnel.slug}`} target="_blank">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </Link>
          <Button disabled={saving} onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Main Editor Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="steps">Funnel Steps</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent className="mt-6" value="steps">
          <FunnelCanvas funnel={funnel} products={products} onUpdate={() => router.refresh()} />
        </TabsContent>

        <TabsContent className="mt-6" value="settings">
          <FunnelSettings funnel={funnel} onUpdate={(updated) => setFunnel(updated)} />
        </TabsContent>

        <TabsContent className="mt-6" value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Funnel Analytics</CardTitle>
              <CardDescription>
                Track your funnel performance and conversion metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{funnel.totalViews.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {funnel.totalConversions.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${funnel.totalRevenue.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
