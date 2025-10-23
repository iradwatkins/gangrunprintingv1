'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Save } from 'lucide-react'

type Menu = any

interface MenuSettingsProps {
  menu: Menu
  onUpdate: () => void
}

export default function MenuSettings({ menu, onUpdate }: MenuSettingsProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: menu.name,
    type: menu.type,
    description: menu.description || '',
    isActive: menu.isActive,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/menus/${menu.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to update menu')

      onUpdate()
      alert('Menu settings updated successfully')
    } catch (error) {
      console.error('Error updating menu:', error)
      alert('Failed to update menu settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Menu Settings</h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Menu Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Main Header, Footer, Mobile Menu"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Menu Type *</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => setFormData({ ...formData, type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="HEADER">Header Menu</SelectItem>
            <SelectItem value="FOOTER">Footer Menu</SelectItem>
            <SelectItem value="MOBILE">Mobile Menu</SelectItem>
            <SelectItem value="SIDEBAR">Sidebar Menu</SelectItem>
            <SelectItem value="CUSTOM">Custom Menu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Optional description for this menu"
          rows={3}
        />
      </div>

      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="space-y-0.5">
          <Label htmlFor="isActive">Active Menu</Label>
          <p className="text-sm text-muted-foreground">
            Make this menu visible on your website
          </p>
        </div>
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        <Save className="mr-2 h-4 w-4" />
        {loading ? 'Saving...' : 'Save Settings'}
      </Button>
    </form>
  )
}
