'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { GripVertical } from 'lucide-react'

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

type PageCanvasProps = {
  elements: PageElement[]
  selectedElement: PageElement | null
  onSelectElement: (element: PageElement) => void
  onUpdateElement: (elementId: string, updates: Partial<PageElement>) => void
}

export function PageCanvas({
  elements,
  selectedElement,
  onSelectElement,
  onUpdateElement,
}: PageCanvasProps) {
  const renderElement = (element: PageElement) => {
    const isSelected = selectedElement?.id === element.id
    const baseStyles = {
      opacity: element.isVisible ? 1 : 0.5,
      ...element.styles,
    }

    const renderContent = () => {
      switch (element.type) {
        case 'HEADING':
          const HeadingTag = element.content.level || 'h2'
          return React.createElement(
            HeadingTag,
            { style: baseStyles },
            element.content.text || 'Heading'
          )

        case 'TEXT':
          return (
            <p style={{ ...baseStyles, textAlign: element.content.alignment || 'left' }}>
              {element.content.text || 'Text content'}
            </p>
          )

        case 'IMAGE':
          return (
            <img
              alt={element.content.alt || ''}
              loading="lazy" src={element.content.url || 'https://via.placeholder.com/400x300'}
              style={{ ...baseStyles, width: element.content.width || '100%' }}
            />
          )

        case 'BUTTON':
          return (
            <button
              style={{
                ...baseStyles,
                padding: '10px 24px',
                backgroundColor: element.content.style === 'primary' ? '#3b82f6' : '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              {element.content.text || 'Button'}
            </button>
          )

        case 'FORM':
          return (
            <div style={baseStyles}>
              <div className="space-y-3 p-4 border rounded">
                <p className="font-medium mb-3">Contact Form</p>
                {element.content.fields?.length > 0 ? (
                  element.content.fields.map((field: any, i: number) => (
                    <div key={i}>
                      <label className="text-sm">{field.label}</label>
                      <input
                        className="w-full border rounded px-3 py-2 mt-1"
                        placeholder={field.placeholder}
                        type={field.type}
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No fields configured</p>
                )}
                <button
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                  }}
                >
                  {element.content.submitText || 'Submit'}
                </button>
              </div>
            </div>
          )

        case 'VIDEO':
          return (
            <div style={baseStyles}>
              {element.content.url ? (
                <video
                  controls
                  autoPlay={element.content.autoplay}
                  src={element.content.url}
                  style={{ width: '100%' }}
                />
              ) : (
                <div className="bg-gray-200 h-48 flex items-center justify-center text-gray-500">
                  Video Placeholder
                </div>
              )}
            </div>
          )

        case 'COUNTDOWN':
          return (
            <div
              style={{ ...baseStyles, textAlign: 'center', fontSize: '2rem', fontWeight: 'bold' }}
            >
              00:00:00:00
            </div>
          )

        case 'TESTIMONIAL':
          return (
            <div className="border-l-4 border-blue-500 pl-4 py-2" style={baseStyles}>
              <p className="italic mb-2">
                &ldquo;{element.content.quote || 'Testimonial quote'}&rdquo;
              </p>
              <p className="text-sm font-medium">{element.content.author || 'Author Name'}</p>
              {element.content.company && (
                <p className="text-sm text-gray-600">{element.content.company}</p>
              )}
            </div>
          )

        case 'FEATURE_LIST':
          return (
            <ul className="space-y-2" style={baseStyles}>
              {element.content.items?.length > 0 ? (
                element.content.items.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No features added</li>
              )}
            </ul>
          )

        case 'PRICING_TABLE':
          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={baseStyles}>
              {element.content.plans?.length > 0 ? (
                element.content.plans.map((plan: any, i: number) => (
                  <div key={i} className="border rounded p-4">
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                    <p className="text-3xl font-bold my-3">${plan.price}</p>
                    <ul className="text-sm space-y-2">
                      {plan.features?.map((feature: string, j: number) => (
                        <li key={j}>✓ {feature}</li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">No pricing plans</div>
              )}
            </div>
          )

        case 'SPACER':
          return <div style={{ height: element.content.height || 40 }} />

        case 'DIVIDER':
          return (
            <hr
              style={{
                borderStyle: element.content.style || 'solid',
                borderColor: element.content.color || '#e5e7eb',
                margin: '20px 0',
              }}
            />
          )

        case 'HTML':
          return (
            <div
              dangerouslySetInnerHTML={{
                __html: element.content.code || '<div>HTML Content</div>',
              }}
              style={baseStyles}
            />
          )

        case 'CONTAINER':
          return (
            <div
              style={{
                ...baseStyles,
                padding: element.content.padding || 20,
                backgroundColor: element.content.backgroundColor || 'transparent',
                border: '1px dashed #ccc',
                minHeight: '100px',
              }}
            >
              Container
            </div>
          )

        case 'COLUMN':
          return (
            <div
              style={{
                ...baseStyles,
                width: element.content.width || '50%',
                padding: element.content.padding || 10,
                border: '1px dashed #ccc',
                minHeight: '100px',
              }}
            >
              Column
            </div>
          )

        default:
          return <div style={baseStyles}>Unknown element type</div>
      }
    }

    return (
      <Card
        key={element.id}
        className={`mb-4 cursor-pointer transition-all ${
          isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-gray-300'
        }`}
        onClick={() => onSelectElement(element)}
      >
        <div className="flex items-start gap-2 p-2">
          <div className="cursor-move text-gray-400 hover:text-gray-600">
            <GripVertical className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">{renderContent()}</div>
        </div>
      </Card>
    )
  }

  const visibleElements = elements
    .filter((el) => !el.parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  return <div className="max-w-4xl mx-auto p-8">{visibleElements.map(renderElement)}</div>
}
