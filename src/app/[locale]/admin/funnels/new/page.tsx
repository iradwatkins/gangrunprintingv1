'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { ArrowLeft, Loader2, Plus } from 'lucide-react'
import Link from 'next/link'
import toast from '@/lib/toast'

export default function NewFunnelPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'DRAFT' as 'DRAFT' | 'ACTIVE' | 'PAUSED',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Funnel name is required')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/funnels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || 'Failed to create funnel')
      }

      const data = await response.json()
      toast.success('Funnel created successfully')
      router.push(`/admin/funnels/${data.id}`)
    } catch (error) {
      console.error('Error creating funnel:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create funnel')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
          href="/admin/funnels"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Funnels
        </Link>
        <h1 className="text-3xl font-bold">Create New Funnel</h1>
        <p className="text-muted-foreground mt-1">
          Set up a new sales funnel with multiple steps and conversion tracking
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Funnel Details</CardTitle>
            <CardDescription>
              Basic information about your funnel. You can add steps and configure products after
              creation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Funnel Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Funnel Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Business Card Upsell Funnel"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                A descriptive name to help you identify this funnel
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe the purpose and strategy of this funnel..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Internal notes about this funnel's goals and target audience
              </p>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'DRAFT' | 'ACTIVE' | 'PAUSED') =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft (not visible to customers)</SelectItem>
                  <SelectItem value="ACTIVE">Active (live and accepting orders)</SelectItem>
                  <SelectItem value="PAUSED">Paused (temporarily disabled)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                You can change this status later. Start as Draft to configure steps first.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Button asChild variant="outline">
            <Link href="/admin/funnels">Cancel</Link>
          </Button>
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Funnel
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Help Card */}
      <Card className="mt-8 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">What's Next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>After creating your funnel, you'll be able to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Add funnel steps (landing page, checkout, upsells, downsells)</li>
            <li>Configure products and pricing for each step</li>
            <li>Set up order bumps and one-click upsells</li>
            <li>Customize the page builder for each step</li>
            <li>Track conversion rates and revenue analytics</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
