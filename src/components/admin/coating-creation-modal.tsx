'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import toast from '@/lib/toast'
import { Loader2, Palette } from 'lucide-react'

interface CoatingOption {
  id: string
  name: string
  description: string | null
}

interface CoatingCreationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCoatingCreated: (coating: CoatingOption) => void
}

export function CoatingCreationModal({
  open,
  onOpenChange,
  onCoatingCreated
}: CoatingCreationModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const resetForm = () => {
    setFormData({ name: '', description: '' })
    setErrors({})
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Coating name is required'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Coating name must be at least 2 characters'
    } else if (formData.name.length > 50) {
      newErrors.name = 'Coating name must be less than 50 characters'
    }

    if (formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/coating-options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create coating option')
      }

      const newCoating = await response.json()

      toast.success(`Coating option "${newCoating.name}" created successfully`)
      onCoatingCreated(newCoating)
      resetForm()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message)
      if (error.message.includes('already exists')) {
        setErrors({ name: 'A coating option with this name already exists' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !loading) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Create New Coating Option
            </DialogTitle>
            <DialogDescription>
              Add a new coating option that can be applied to paper stocks.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="coating-name">
                Coating Name *
              </Label>
              <Input
                id="coating-name"
                required
                placeholder="e.g., High Gloss UV"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="coating-description">
                Description
              </Label>
              <Textarea
                id="coating-description"
                placeholder="Optional description of the coating properties and finish"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/200 characters
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Coating
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}