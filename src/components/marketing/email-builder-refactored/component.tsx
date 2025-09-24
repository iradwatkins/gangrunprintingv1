/**
 * email-builder - component definitions
 * Auto-refactored by BMAD
 */

import { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ColorPicker } from '@/components/ui/color-picker'
import { EmailBuilderProps, EmailTemplate } from './types'

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
