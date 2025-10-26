'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Eye, Copy, Trash2, Search } from 'lucide-react'

type PageTemplate = {
  id: string
  name: string
  description?: string
  thumbnail?: string
  category?: string
  isPublic: boolean
  useCount: number
  _count?: {
    PageElement: number
  }
}

type TemplateLibraryProps = {
  onSelectTemplate: (templateId: string) => void
}

export function TemplateLibrary({ onSelectTemplate }: TemplateLibraryProps) {
  const [templates, setTemplates] = useState<PageTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<PageTemplate[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTemplates()
  }, [])

  useEffect(() => {
    filterTemplates()
  }, [searchQuery, selectedCategory, templates])

  const loadTemplates = async () => {
    setLoading(true)
    const response = await fetch('/api/page-templates?includePublic=true')
    if (response.ok) {
      const data = await response.json()
      setTemplates(data)
    }
    setLoading(false)
  }

  const filterTemplates = () => {
    let filtered = templates

    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter((t) => t.category === selectedCategory)
    }

    setFilteredTemplates(filtered)
  }

  const categories = Array.from(new Set(templates.map((t) => t.category).filter(Boolean)))

  const duplicateTemplate = async (templateId: string) => {
    const response = await fetch(`/api/page-templates/${templateId}/duplicate`, {
      method: 'POST',
    })

    if (response.ok) {
      await loadTemplates()
    }
  }

  const deleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    const response = await fetch(`/api/page-templates/${templateId}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      setTemplates(templates.filter((t) => t.id !== templateId))
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={selectedCategory === null ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              size="sm"
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category || null)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading templates...</div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {searchQuery || selectedCategory
            ? 'No templates found matching your criteria'
            : 'No templates available'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Thumbnail */}
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                {template.thumbnail ? (
                  <img
                    alt={template.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    src={template.thumbnail}
                  />
                ) : (
                  <div className="text-4xl text-blue-300">
                    {template.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  {template.isPublic && (
                    <Badge className="ml-2" variant="secondary">
                      Public
                    </Badge>
                  )}
                </div>

                {template.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{template._count?.PageElement || 0} elements</span>
                  <span>{template.useCount} uses</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    size="sm"
                    onClick={() => onSelectTemplate(template.id)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Use Template
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => duplicateTemplate(template.id)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>

                  {!template.isPublic && (
                    <Button size="sm" variant="outline" onClick={() => deleteTemplate(template.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
