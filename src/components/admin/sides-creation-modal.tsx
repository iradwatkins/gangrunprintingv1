'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
}

interface SidesCreationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSidesCreated: (sides: SidesOption) => void
}

export function SidesCreationModal({
  open,
  onOpenChange,
  onSidesCreated,
}: SidesCreationModalProps) {
  const [formData, setFormData] = useState({
    name: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const resetForm = () => {
    setFormData({ name: '' })
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
    } catch (error) {
      toast.error(error.message)
      if (error.message.includes('already exists')) {
        setErrors({ name: 'A sides option with this name already exists' })
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
              <Square className="h-5 w-5" />
              Create New Sides Option
            </DialogTitle>
            <DialogDescription>Add a new printing sides option.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sides-name">Sides Option Name *</Label>
              <Input
                required
                className={errors.name ? 'border-red-500' : ''}
                id="sides-name"
                placeholder="e.g., Different Image Both Sides"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button
              disabled={loading}
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button disabled={loading} type="submit">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Sides Option
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
