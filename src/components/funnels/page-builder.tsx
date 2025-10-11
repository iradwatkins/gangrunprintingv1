'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react'
import { ElementToolbox } from './page-builder/element-toolbox'
import { ElementEditor } from './page-builder/element-editor'
import { PageCanvas } from './page-builder/page-canvas'

type PageElement = {
  id: string
  type: string
  content: Record<string, any>
  styles: Record<string, any>
  position: Record<string, any>
  parentId?: string | null
  sortOrder: number
  isVisible: boolean
  Children?: PageElement[]
}

type PageBuilderProps = {
  versionId: string
  funnelId: string
  stepId: string
  initialElements?: PageElement[]
  onSave?: () => void
}

export function PageBuilder({
  versionId,
  funnelId,
  stepId,
  initialElements = [],
  onSave,
}: PageBuilderProps) {
  const [elements, setElements] = useState<PageElement[]>(initialElements)
  const [selectedElement, setSelectedElement] = useState<PageElement | null>(null)
  const [showToolbox, setShowToolbox] = useState(true)

  const addElement = async (type: string) => {
    const defaultContent: Record<string, any> = {
      HEADING: { text: 'New Heading', level: 'h2' },
      TEXT: { text: 'Enter your text here...', alignment: 'left' },
      IMAGE: { url: '', alt: '', width: '100%' },
      BUTTON: { text: 'Click Me', link: '#', style: 'primary' },
      FORM: { fields: [], submitText: 'Submit', action: '' },
      VIDEO: { url: '', autoplay: false },
      COUNTDOWN: { endDate: new Date(Date.now() + 86400000).toISOString(), style: 'default' },
      TESTIMONIAL: { quote: '', author: '', avatar: '', company: '' },
      FEATURE_LIST: { items: [] },
      PRICING_TABLE: { plans: [] },
      SPACER: { height: 40 },
      DIVIDER: { style: 'solid', color: '#e5e7eb' },
      HTML: { code: '<div>Custom HTML</div>' },
      CONTAINER: { padding: 20, backgroundColor: 'transparent' },
      COLUMN: { width: '50%', padding: 10 },
    }

    const defaultStyles: Record<string, any> = {
      fontSize: '16px',
      color: '#000000',
      padding: '10px',
      margin: '0px',
    }

    const defaultPosition = {
      x: 0,
      y: elements.length * 100,
      width: '100%',
      height: 'auto',
    }

    const response = await fetch(
      `/api/funnels/${funnelId}/steps/${stepId}/versions/${versionId}/elements`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          content: defaultContent[type] || {},
          styles: defaultStyles,
          position: defaultPosition,
          sortOrder: elements.length,
        }),
      }
    )

    if (response.ok) {
      const newElement = await response.json()
      setElements([...elements, newElement])
      setSelectedElement(newElement)
      onSave?.()
    }
  }

  const updateElement = async (elementId: string, updates: Partial<PageElement>) => {
    const response = await fetch(`/api/page-templates/${versionId}/elements/${elementId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })

    if (response.ok) {
      const updated = await response.json()
      setElements(elements.map((el) => (el.id === elementId ? updated : el)))
      if (selectedElement?.id === elementId) {
        setSelectedElement(updated)
      }
      onSave?.()
    }
  }

  const deleteElement = async (elementId: string) => {
    const response = await fetch(`/api/page-templates/${versionId}/elements/${elementId}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      setElements(elements.filter((el) => el.id !== elementId))
      if (selectedElement?.id === elementId) {
        setSelectedElement(null)
      }
      onSave?.()
    }
  }

  const toggleVisibility = async (elementId: string) => {
    const element = elements.find((el) => el.id === elementId)
    if (element) {
      await updateElement(elementId, { isVisible: !element.isVisible })
    }
  }

  return (
    <div className="flex h-screen">
      {/* Toolbox */}
      {showToolbox && (
        <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Elements</h3>
            <Button size="sm" variant="ghost" onClick={() => setShowToolbox(false)}>
              ×
            </Button>
          </div>
          <ElementToolbox onAddElement={addElement} />
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 overflow-y-auto bg-white">
        {!showToolbox && (
          <Button className="m-4" size="sm" variant="outline" onClick={() => setShowToolbox(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Show Elements
          </Button>
        )}

        <PageCanvas
          elements={elements}
          selectedElement={selectedElement}
          onSelectElement={setSelectedElement}
          onUpdateElement={updateElement}
        />

        {elements.length === 0 && (
          <div className="flex flex-col items-center justify-center h-96 text-gray-400">
            <Plus className="w-16 h-16 mb-4" />
            <p>Click an element from the toolbox to get started</p>
          </div>
        )}
      </div>

      {/* Element Editor */}
      {selectedElement && (
        <div className="w-80 border-l bg-gray-50 p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Element Settings</h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => toggleVisibility(selectedElement.id)}
              >
                {selectedElement.isVisible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => deleteElement(selectedElement.id)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>

          <ElementEditor
            element={selectedElement}
            onUpdate={(updates) => updateElement(selectedElement.id, updates)}
          />
        </div>
      )}
    </div>
  )
}
