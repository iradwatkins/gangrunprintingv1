'use client'

import { useState } from 'react'
import { type Funnel } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Button } from '@/components/ui/button'

interface FunnelSettingsProps {
  funnel: Funnel
  onUpdate: (funnel: Funnel) => void
}

export function FunnelSettings({ funnel, onUpdate }: FunnelSettingsProps) {
  const [formData, setFormData] = useState({
    name: funnel.name,
    description: funnel.description || '',
    status: funnel.status,
    seoTitle: funnel.seoTitle || '',
    seoDescription: funnel.seoDescription || '',
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Basic funnel information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Funnel Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value })
                onUpdate({ ...funnel, name: e.target.value })
              }}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value })
                onUpdate({ ...funnel, description: e.target.value })
              }}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => {
                setFormData({ ...formData, status: value })
                onUpdate({ ...funnel, status: value })
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PAUSED">Paused</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO Settings</CardTitle>
          <CardDescription>Search engine optimization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="seoTitle">SEO Title</Label>
            <Input
              id="seoTitle"
              placeholder="Enter SEO title"
              value={formData.seoTitle}
              onChange={(e) => {
                setFormData({ ...formData, seoTitle: e.target.value })
                onUpdate({ ...funnel, seoTitle: e.target.value })
              }}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="seoDescription">SEO Description</Label>
            <Textarea
              id="seoDescription"
              placeholder="Enter SEO description"
              rows={3}
              value={formData.seoDescription}
              onChange={(e) => {
                setFormData({ ...formData, seoDescription: e.target.value })
                onUpdate({ ...funnel, seoDescription: e.target.value })
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
