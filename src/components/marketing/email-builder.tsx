'use client'

import React, { useState, useCallback, useRef } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ColorPicker } from '@/components/ui/color-picker'
import {
  Type,
  Image,
  Link,
  Divide,
  Grid,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Palette,
  Settings,
  Eye,
  Code,
  Plus,
  Trash2,
  Copy,
  Move,
  GripVertical,
} from 'lucide-react'

export interface EmailComponent {
  id: string
  type: 'text' | 'image' | 'button' | 'divider' | 'columns' | 'header' | 'footer'
  content: any
  styles: any
}

export interface EmailTemplate {
  id?: string
  name: string
  subject: string
  previewText: string
  components: EmailComponent[]
  globalStyles: {
    backgroundColor: string
    fontFamily: string
    fontSize: string
    lineHeight: string
    textColor: string
  }
}

interface EmailBuilderProps {
  template?: EmailTemplate
  onSave: (template: EmailTemplate) => void
  onPreview: (template: EmailTemplate) => void
}

const COMPONENT_TYPES = [
  {
    type: 'text',
    icon: Type,
    label: 'Text Block',
    defaultContent: { text: 'Click to edit this text' },
    defaultStyles: { fontSize: '16px', color: '#333333', textAlign: 'left' },
  },
  {
    type: 'image',
    icon: Image,
    label: 'Image',
    defaultContent: { src: '', alt: '', width: '100%' },
    defaultStyles: { textAlign: 'center' },
  },
  {
    type: 'button',
    icon: Link,
    label: 'Button',
    defaultContent: { text: 'Click Here', url: '#' },
    defaultStyles: {
      backgroundColor: '#007bff',
      color: '#ffffff',
      padding: '12px 24px',
      borderRadius: '4px',
      textAlign: 'center',
    },
  },
  {
    type: 'divider',
    icon: Divide,
    label: 'Divider',
    defaultContent: {},
    defaultStyles: { height: '1px', backgroundColor: '#e5e5e5', margin: '20px 0' },
  },
  {
    type: 'columns',
    icon: Grid,
    label: 'Columns',
    defaultContent: { columns: 2, items: [] },
    defaultStyles: { gap: '20px' },
  },
]

function SortableComponent({
  component,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
}: {
  component: EmailComponent
  isSelected: boolean
  onSelect: (id: string) => void
  onUpdate: (id: string, updates: Partial<EmailComponent>) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: component.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const renderComponent = () => {
    switch (component.type) {
      case 'text':
        return (
          <div
            className="min-h-[40px] p-2 border-2 border-dashed border-transparent hover:border-blue-300 cursor-text"
            style={component.styles}
            onClick={() => onSelect(component.id)}
          >
            {component.content.text || 'Click to edit text'}
          </div>
        )

      case 'image':
        return (
          <div
            className="min-h-[100px] p-2 border-2 border-dashed border-transparent hover:border-blue-300 cursor-pointer"
            style={component.styles}
            onClick={() => onSelect(component.id)}
          >
            {component.content.src ? (
              <img
                alt={component.content.alt}
                className="max-w-full h-auto"
                src={component.content.src}
                style={{ width: component.content.width }}
              />
            ) : (
              <div className="bg-gray-100 flex items-center justify-center h-32 text-gray-500">
                <Image className="w-8 h-8" />
                <span className="ml-2">Click to add image</span>
              </div>
            )}
          </div>
        )

      case 'button':
        return (
          <div
            className="p-2 border-2 border-dashed border-transparent hover:border-blue-300 cursor-pointer"
            style={{ textAlign: component.styles.textAlign }}
            onClick={() => onSelect(component.id)}
          >
            <button
              style={{
                ...component.styles,
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'none',
              }}
            >
              {component.content.text}
            </button>
          </div>
        )

      case 'divider':
        return (
          <div
            className="p-2 border-2 border-dashed border-transparent hover:border-blue-300 cursor-pointer"
            onClick={() => onSelect(component.id)}
          >
            <div style={component.styles}></div>
          </div>
        )

      case 'columns':
        return (
          <div
            className="p-2 border-2 border-dashed border-transparent hover:border-blue-300 cursor-pointer"
            onClick={() => onSelect(component.id)}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${component.content.columns}, 1fr)`,
                gap: component.styles.gap,
              }}
            >
              {Array.from({ length: component.content.columns }, (_, i) => (
                <div key={i} className="bg-gray-50 p-4 min-h-[100px] rounded">
                  Column {i + 1}
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return <div>Unknown component type</div>
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={`relative group ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={style}
    >
      {renderComponent()}

      {/* Component controls */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button className="h-6 w-6 p-0" size="sm" variant="outline" {...attributes} {...listeners}>
          <GripVertical className="w-3 h-3" />
        </Button>
        <Button
          className="h-6 w-6 p-0"
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            onDuplicate(component.id)
          }}
        >
          <Copy className="w-3 h-3" />
        </Button>
        <Button
          className="h-6 w-6 p-0"
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(component.id)
          }}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  )
}

function ComponentEditor({
  component,
  onUpdate,
}: {
  component: EmailComponent
  onUpdate: (updates: Partial<EmailComponent>) => void
}) {
  const updateContent = (updates: any) => {
    onUpdate({ content: { ...component.content, ...updates } })
  }

  const updateStyles = (updates: any) => {
    onUpdate({ styles: { ...component.styles, ...updates } })
  }

  switch (component.type) {
    case 'text':
      return (
        <div className="space-y-4">
          <div>
            <Label>Content</Label>
            <Textarea
              placeholder="Enter your text here..."
              rows={4}
              value={component.content.text || ''}
              onChange={(e) => updateContent({ text: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Font Size</Label>
              <Select
                value={component.styles.fontSize || '16px'}
                onValueChange={(value) => updateStyles({ fontSize: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12px">12px</SelectItem>
                  <SelectItem value="14px">14px</SelectItem>
                  <SelectItem value="16px">16px</SelectItem>
                  <SelectItem value="18px">18px</SelectItem>
                  <SelectItem value="20px">20px</SelectItem>
                  <SelectItem value="24px">24px</SelectItem>
                  <SelectItem value="32px">32px</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Text Color</Label>
              <ColorPicker
                value={component.styles.color || '#333333'}
                onChange={(color) => updateStyles({ color })}
              />
            </div>
          </div>

          <div>
            <Label>Alignment</Label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={component.styles.textAlign === 'left' ? 'default' : 'outline'}
                onClick={() => updateStyles({ textAlign: 'left' })}
              >
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={component.styles.textAlign === 'center' ? 'default' : 'outline'}
                onClick={() => updateStyles({ textAlign: 'center' })}
              >
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={component.styles.textAlign === 'right' ? 'default' : 'outline'}
                onClick={() => updateStyles({ textAlign: 'right' })}
              >
                <AlignRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )

    case 'image':
      return (
        <div className="space-y-4">
          <div>
            <Label>Image URL</Label>
            <Input
              placeholder="https://example.com/image.jpg"
              value={component.content.src || ''}
              onChange={(e) => updateContent({ src: e.target.value })}
            />
          </div>

          <div>
            <Label>Alt Text</Label>
            <Input
              placeholder="Description of the image"
              value={component.content.alt || ''}
              onChange={(e) => updateContent({ alt: e.target.value })}
            />
          </div>

          <div>
            <Label>Width</Label>
            <Select
              value={component.content.width || '100%'}
              onValueChange={(value) => updateContent({ width: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25%">25%</SelectItem>
                <SelectItem value="50%">50%</SelectItem>
                <SelectItem value="75%">75%</SelectItem>
                <SelectItem value="100%">100%</SelectItem>
                <SelectItem value="200px">200px</SelectItem>
                <SelectItem value="300px">300px</SelectItem>
                <SelectItem value="400px">400px</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Alignment</Label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={component.styles.textAlign === 'left' ? 'default' : 'outline'}
                onClick={() => updateStyles({ textAlign: 'left' })}
              >
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={component.styles.textAlign === 'center' ? 'default' : 'outline'}
                onClick={() => updateStyles({ textAlign: 'center' })}
              >
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={component.styles.textAlign === 'right' ? 'default' : 'outline'}
                onClick={() => updateStyles({ textAlign: 'right' })}
              >
                <AlignRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )

    case 'button':
      return (
        <div className="space-y-4">
          <div>
            <Label>Button Text</Label>
            <Input
              placeholder="Click Here"
              value={component.content.text || ''}
              onChange={(e) => updateContent({ text: e.target.value })}
            />
          </div>

          <div>
            <Label>Link URL</Label>
            <Input
              placeholder="https://example.com"
              value={component.content.url || ''}
              onChange={(e) => updateContent({ url: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Background Color</Label>
              <ColorPicker
                value={component.styles.backgroundColor || '#007bff'}
                onChange={(color) => updateStyles({ backgroundColor: color })}
              />
            </div>

            <div>
              <Label>Text Color</Label>
              <ColorPicker
                value={component.styles.color || '#ffffff'}
                onChange={(color) => updateStyles({ color })}
              />
            </div>
          </div>

          <div>
            <Label>Border Radius</Label>
            <Select
              value={component.styles.borderRadius || '4px'}
              onValueChange={(value) => updateStyles({ borderRadius: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0px">None</SelectItem>
                <SelectItem value="4px">Small</SelectItem>
                <SelectItem value="8px">Medium</SelectItem>
                <SelectItem value="16px">Large</SelectItem>
                <SelectItem value="50px">Round</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Alignment</Label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={component.styles.textAlign === 'left' ? 'default' : 'outline'}
                onClick={() => updateStyles({ textAlign: 'left' })}
              >
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={component.styles.textAlign === 'center' ? 'default' : 'outline'}
                onClick={() => updateStyles({ textAlign: 'center' })}
              >
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={component.styles.textAlign === 'right' ? 'default' : 'outline'}
                onClick={() => updateStyles({ textAlign: 'right' })}
              >
                <AlignRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )

    case 'divider':
      return (
        <div className="space-y-4">
          <div>
            <Label>Height</Label>
            <Select
              value={component.styles.height || '1px'}
              onValueChange={(value) => updateStyles({ height: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1px">1px</SelectItem>
                <SelectItem value="2px">2px</SelectItem>
                <SelectItem value="3px">3px</SelectItem>
                <SelectItem value="5px">5px</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Color</Label>
            <ColorPicker
              value={component.styles.backgroundColor || '#e5e5e5'}
              onChange={(color) => updateStyles({ backgroundColor: color })}
            />
          </div>
        </div>
      )

    case 'columns':
      return (
        <div className="space-y-4">
          <div>
            <Label>Number of Columns</Label>
            <Select
              value={component.content.columns.toString()}
              onValueChange={(value) => updateContent({ columns: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 Columns</SelectItem>
                <SelectItem value="3">3 Columns</SelectItem>
                <SelectItem value="4">4 Columns</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Gap</Label>
            <Select
              value={component.styles.gap || '20px'}
              onValueChange={(value) => updateStyles({ gap: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10px">Small</SelectItem>
                <SelectItem value="20px">Medium</SelectItem>
                <SelectItem value="30px">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )

    default:
      return <div>No editor available for this component type</div>
  }
}

export function EmailBuilder({ template, onSave, onPreview }: EmailBuilderProps) {
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate>(
    template || {
      name: 'New Email Template',
      subject: '',
      previewText: '',
      components: [],
      globalStyles: {
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        lineHeight: '1.5',
        textColor: '#333333',
      },
    }
  )

  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setCurrentTemplate((prev) => {
        const oldIndex = prev.components.findIndex((c) => c.id === active.id)
        const newIndex = prev.components.findIndex((c) => c.id === over?.id)

        return {
          ...prev,
          components: arrayMove(prev.components, oldIndex, newIndex),
        }
      })
    }

    setActiveId(null)
  }

  const addComponent = (type: string) => {
    const componentType = COMPONENT_TYPES.find((t) => t.type === type)
    if (!componentType) return

    const newComponent: EmailComponent = {
      id: `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      content: componentType.defaultContent,
      styles: componentType.defaultStyles,
    }

    setCurrentTemplate((prev) => ({
      ...prev,
      components: [...prev.components, newComponent],
    }))
  }

  const updateComponent = (id: string, updates: Partial<EmailComponent>) => {
    setCurrentTemplate((prev) => ({
      ...prev,
      components: prev.components.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }))
  }

  const deleteComponent = (id: string) => {
    setCurrentTemplate((prev) => ({
      ...prev,
      components: prev.components.filter((c) => c.id !== id),
    }))
    setSelectedComponentId(null)
  }

  const duplicateComponent = (id: string) => {
    const component = currentTemplate.components.find((c) => c.id === id)
    if (!component) return

    const newComponent = {
      ...component,
      id: `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }

    setCurrentTemplate((prev) => ({
      ...prev,
      components: [...prev.components, newComponent],
    }))
  }

  const selectedComponent = currentTemplate.components.find((c) => c.id === selectedComponentId)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Components */}
      <div className="w-64 bg-white border-r p-4 overflow-y-auto">
        <h3 className="font-semibold mb-4">Components</h3>
        <div className="space-y-2">
          {COMPONENT_TYPES.map((componentType) => {
            const Icon = componentType.icon
            return (
              <Button
                key={componentType.type}
                className="w-full justify-start"
                variant="outline"
                onClick={() => addComponent(componentType.type)}
              >
                <Icon className="w-4 h-4 mr-2" />
                {componentType.label}
              </Button>
            )
          })}
        </div>

        <Separator className="my-6" />

        <h3 className="font-semibold mb-4">Global Styles</h3>
        <div className="space-y-4">
          <div>
            <Label>Background Color</Label>
            <ColorPicker
              value={currentTemplate.globalStyles.backgroundColor}
              onChange={(color) =>
                setCurrentTemplate((prev) => ({
                  ...prev,
                  globalStyles: { ...prev.globalStyles, backgroundColor: color },
                }))
              }
            />
          </div>

          <div>
            <Label>Font Family</Label>
            <Select
              value={currentTemplate.globalStyles.fontFamily}
              onValueChange={(value) =>
                setCurrentTemplate((prev) => ({
                  ...prev,
                  globalStyles: { ...prev.globalStyles, fontFamily: value },
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                <SelectItem value="Georgia, serif">Georgia</SelectItem>
                <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                <SelectItem value="Helvetica, sans-serif">Helvetica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Text Color</Label>
            <ColorPicker
              value={currentTemplate.globalStyles.textColor}
              onChange={(color) =>
                setCurrentTemplate((prev) => ({
                  ...prev,
                  globalStyles: { ...prev.globalStyles, textColor: color },
                }))
              }
            />
          </div>
        </div>
      </div>

      {/* Center - Email Canvas */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          {/* Email Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Template Name</Label>
                <Input
                  value={currentTemplate.name}
                  onChange={(e) =>
                    setCurrentTemplate((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div>
                <Label>Subject Line</Label>
                <Input
                  value={currentTemplate.subject}
                  onChange={(e) =>
                    setCurrentTemplate((prev) => ({ ...prev, subject: e.target.value }))
                  }
                />
              </div>

              <div>
                <Label>Preview Text</Label>
                <Input
                  placeholder="This appears in the inbox preview"
                  value={currentTemplate.previewText}
                  onChange={(e) =>
                    setCurrentTemplate((prev) => ({ ...prev, previewText: e.target.value }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Email Canvas */}
          <Card>
            <CardContent className="p-0">
              <div
                className="min-h-[600px] p-6"
                style={{
                  backgroundColor: currentTemplate.globalStyles.backgroundColor,
                  fontFamily: currentTemplate.globalStyles.fontFamily,
                  fontSize: currentTemplate.globalStyles.fontSize,
                  lineHeight: currentTemplate.globalStyles.lineHeight,
                  color: currentTemplate.globalStyles.textColor,
                }}
              >
                <DndContext
                  collisionDetection={closestCenter}
                  sensors={sensors}
                  onDragEnd={handleDragEnd}
                  onDragStart={handleDragStart}
                >
                  <SortableContext
                    items={currentTemplate.components.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {currentTemplate.components.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <p>No components yet. Add some from the sidebar!</p>
                      </div>
                    ) : (
                      currentTemplate.components.map((component) => (
                        <SortableComponent
                          key={component.id}
                          component={component}
                          isSelected={selectedComponentId === component.id}
                          onDelete={deleteComponent}
                          onDuplicate={duplicateComponent}
                          onSelect={setSelectedComponentId}
                          onUpdate={updateComponent}
                        />
                      ))
                    )}
                  </SortableContext>

                  <DragOverlay>
                    {activeId ? (
                      <div className="bg-white p-4 rounded shadow-lg">
                        <GripVertical className="w-4 h-4" />
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <Button variant="outline" onClick={() => onPreview(currentTemplate)}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button onClick={() => onSave(currentTemplate)}>Save Template</Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Component Editor */}
      <div className="w-80 bg-white border-l p-4 overflow-y-auto">
        {selectedComponent ? (
          <>
            <h3 className="font-semibold mb-4">
              Edit{' '}
              {selectedComponent.type.charAt(0).toUpperCase() + selectedComponent.type.slice(1)}
            </h3>
            <ComponentEditor
              component={selectedComponent}
              onUpdate={(updates) => updateComponent(selectedComponent.id, updates)}
            />
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Settings className="w-8 h-8 mx-auto mb-2" />
            <p>Select a component to edit its properties</p>
          </div>
        )}
      </div>
    </div>
  )
}
