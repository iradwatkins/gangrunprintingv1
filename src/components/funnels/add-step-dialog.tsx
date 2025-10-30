'use client'

import { useState } from 'react'
import { useRouter } from '@/lib/i18n/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AddStepDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  funnelId: string
  position: number
  onSuccess: () => void
}

export function AddStepDialog({
  open,
  onOpenChange,
  funnelId,
  position,
  onSuccess,
}: AddStepDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'LANDING' as 'LANDING' | 'CHECKOUT' | 'UPSELL' | 'DOWNSELL' | 'THANKYOU',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    try {
      const res = await fetch(`/api/funnels/${funnelId}/steps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug,
          type: formData.type,
          position,
          config: {},
          isActive: true,
        }),
      })

      if (res.ok) {
        setFormData({ name: '', type: 'LANDING' })
        onOpenChange(false)
        onSuccess()
      } else {
        alert('Failed to create step')
      }
    } catch (error) {
      alert('Failed to create step')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Funnel Step</DialogTitle>
            <DialogDescription>Create a new step in your funnel</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Step Name</Label>
              <Input
                required
                id="name"
                placeholder="e.g., Landing Page, Checkout, Thank You"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Step Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LANDING">Landing Page</SelectItem>
                  <SelectItem value="CHECKOUT">Checkout</SelectItem>
                  <SelectItem value="UPSELL">Upsell</SelectItem>
                  <SelectItem value="DOWNSELL">Downsell</SelectItem>
                  <SelectItem value="THANKYOU">Thank You</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button disabled={loading || !formData.name} type="submit">
              {loading ? 'Creating...' : 'Create Step'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
