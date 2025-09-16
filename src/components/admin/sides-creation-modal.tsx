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
import { Loader2, Square } from 'lucide-react'

interface SidesOption {
  id: string
  name: string
  code: string
  description: string | null
}

interface SidesCreationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSidesCreated: (sides: SidesOption) => void
}

export function SidesCreationModal({
  open,
  onOpenChange,
  onSidesCreated
}: SidesCreationModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const resetForm = () => {
    setFormData({ name: '', code: '', description: '' })
    setErrors({})
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Sides option name is required'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be less than 100 characters'
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Code is required'
    } else if (formData.code.length < 2) {
      newErrors.code = 'Code must be at least 2 characters'
    } else if (formData.code.length > 10) {
      newErrors.code = 'Code must be less than 10 characters'
    } else if (!/^[A-Z0-9_-]+$/.test(formData.code)) {
      newErrors.code = 'Code must contain only uppercase letters, numbers, hyphens, and underscores'
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
      const response = await fetch('/api/sides-options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          description: formData.description.trim() || null
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create sides option')
      }

      const newSides = await response.json()

      toast.success(`Sides option "${newSides.name}" created successfully`)
      onSidesCreated(newSides)
      resetForm()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message)
      if (error.message.includes('already exists')) {
        if (error.message.includes('name')) {
          setErrors({ name: 'A sides option with this name already exists' })
        } else if (error.message.includes('code')) {
          setErrors({ code: 'A sides option with this code already exists' })
        } else {
          setErrors({ name: 'A sides option with this name or code already exists' })
        }
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

  const handleCodeChange = (value: string) => {
    // Auto-convert to uppercase and remove invalid characters
    const cleanedCode = value.toUpperCase().replace(/[^A-Z0-9_-]/g, '')
    setFormData({ ...formData, code: cleanedCode })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Square className="h-5 w-5" />
              Create New Sides Option
            </DialogTitle>
            <DialogDescription>
              Add a new printing sides option with pricing multiplier support.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sides-name">
                Sides Option Name *
              </Label>
              <Input
                id="sides-name"
                required
                placeholder="e.g., Different Image Both Sides"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sides-code">
                Code *
              </Label>
              <Input
                id="sides-code"
                required
                placeholder="e.g., DIFF"
                value={formData.code}
                onChange={(e) => handleCodeChange(e.target.value)}
                className={errors.code ? 'border-red-500' : ''}
              />
              {errors.code && (
                <p className="text-sm text-red-600">{errors.code}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Short code for internal reference (uppercase letters, numbers, hyphens, underscores only)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sides-description">
                Description
              </Label>
              <Textarea
                id="sides-description"
                placeholder="Optional description of this printing option"
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
              Create Sides Option
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}