'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

type PageElement = {
  id: string
  type: string
  content: Record<string, any>
  styles: Record<string, any>
  position: Record<string, any>
  parentId?: string | null
  sortOrder: number
  isVisible: boolean
}

type ElementEditorProps = {
  element: PageElement
  onUpdate: (updates: Partial<PageElement>) => void
}

export function ElementEditor({ element, onUpdate }: ElementEditorProps) {
  const [localContent, setLocalContent] = useState(element.content)
  const [localStyles, setLocalStyles] = useState(element.styles)

  useEffect(() => {
    setLocalContent(element.content)
    setLocalStyles(element.styles)
  }, [element.id])

  const updateContent = (key: string, value: any) => {
    const newContent = { ...localContent, [key]: value }
    setLocalContent(newContent)
    onUpdate({ content: newContent })
  }

  const updateStyle = (key: string, value: any) => {
    const newStyles = { ...localStyles, [key]: value }
    setLocalStyles(newStyles)
    onUpdate({ styles: newStyles })
  }

  const renderContentEditor = () => {
    switch (element.type) {
      case 'HEADING':
        return (
          <>
            <div className="space-y-2">
              <Label>Text</Label>
              <Input
                placeholder="Enter heading text"
                value={localContent.text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Level</Label>
              <Select
                value={localContent.level || 'h2'}
                onValueChange={(val) => updateContent('level', val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h1">H1</SelectItem>
                  <SelectItem value="h2">H2</SelectItem>
                  <SelectItem value="h3">H3</SelectItem>
                  <SelectItem value="h4">H4</SelectItem>
                  <SelectItem value="h5">H5</SelectItem>
                  <SelectItem value="h6">H6</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )

      case 'TEXT':
        return (
          <>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                placeholder="Enter text content"
                rows={4}
                value={localContent.text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Alignment</Label>
              <Select
                value={localContent.alignment || 'left'}
                onValueChange={(val) => updateContent('alignment', val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="justify">Justify</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )

      case 'IMAGE':
        return (
          <>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={localContent.url || ''}
                onChange={(e) => updateContent('url', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Alt Text</Label>
              <Input
                placeholder="Image description"
                value={localContent.alt || ''}
                onChange={(e) => updateContent('alt', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Width</Label>
              <Input
                placeholder="100%"
                value={localContent.width || '100%'}
                onChange={(e) => updateContent('width', e.target.value)}
              />
            </div>
          </>
        )

      case 'BUTTON':
        return (
          <>
            <div className="space-y-2">
              <Label>Button Text</Label>
              <Input
                placeholder="Click Me"
                value={localContent.text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Link URL</Label>
              <Input
                placeholder="https://example.com"
                value={localContent.link || ''}
                onChange={(e) => updateContent('link', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Style</Label>
              <Select
                value={localContent.style || 'primary'}
                onValueChange={(val) => updateContent('style', val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                  <SelectItem value="outline">Outline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )

      case 'VIDEO':
        return (
          <>
            <div className="space-y-2">
              <Label>Video URL</Label>
              <Input
                placeholder="https://example.com/video.mp4"
                value={localContent.url || ''}
                onChange={(e) => updateContent('url', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Autoplay</Label>
              <Select
                value={localContent.autoplay ? 'true' : 'false'}
                onValueChange={(val) => updateContent('autoplay', val === 'true')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">No</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )

      case 'TESTIMONIAL':
        return (
          <>
            <div className="space-y-2">
              <Label>Quote</Label>
              <Textarea
                placeholder="Customer testimonial..."
                rows={3}
                value={localContent.quote || ''}
                onChange={(e) => updateContent('quote', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Author</Label>
              <Input
                placeholder="John Doe"
                value={localContent.author || ''}
                onChange={(e) => updateContent('author', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input
                placeholder="Company Name"
                value={localContent.company || ''}
                onChange={(e) => updateContent('company', e.target.value)}
              />
            </div>
          </>
        )

      case 'SPACER':
        return (
          <div className="space-y-2">
            <Label>Height (px)</Label>
            <Input
              type="number"
              value={localContent.height || 40}
              onChange={(e) => updateContent('height', parseInt(e.target.value))}
            />
          </div>
        )

      case 'DIVIDER':
        return (
          <>
            <div className="space-y-2">
              <Label>Style</Label>
              <Select
                value={localContent.style || 'solid'}
                onValueChange={(val) => updateContent('style', val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="dashed">Dashed</SelectItem>
                  <SelectItem value="dotted">Dotted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <Input
                type="color"
                value={localContent.color || '#e5e7eb'}
                onChange={(e) => updateContent('color', e.target.value)}
              />
            </div>
          </>
        )

      case 'HTML':
        return (
          <div className="space-y-2">
            <Label>HTML Code</Label>
            <Textarea
              className="font-mono text-sm"
              placeholder="<div>Custom HTML</div>"
              rows={6}
              value={localContent.code || ''}
              onChange={(e) => updateContent('code', e.target.value)}
            />
          </div>
        )

      default:
        return <p className="text-sm text-gray-500">No content options for this element type</p>
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h4 className="font-medium mb-4">Content</h4>
        <div className="space-y-4">{renderContentEditor()}</div>
      </Card>

      <Card className="p-4">
        <h4 className="font-medium mb-4">Styles</h4>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Font Size</Label>
            <Input
              placeholder="16px"
              value={localStyles.fontSize || '16px'}
              onChange={(e) => updateStyle('fontSize', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Text Color</Label>
            <Input
              type="color"
              value={localStyles.color || '#000000'}
              onChange={(e) => updateStyle('color', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Padding</Label>
            <Input
              placeholder="10px"
              value={localStyles.padding || '10px'}
              onChange={(e) => updateStyle('padding', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Margin</Label>
            <Input
              placeholder="0px"
              value={localStyles.margin || '0px'}
              onChange={(e) => updateStyle('margin', e.target.value)}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
