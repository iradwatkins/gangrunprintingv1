'use client'

import { Button } from '@/components/ui/button'
import {
  Heading,
  Type,
  Image,
  MousePointer,
  FileText,
  Video,
  Clock,
  MessageSquare,
  List,
  DollarSign,
  Minus,
  Divide,
  Code,
  Square,
  Columns,
} from 'lucide-react'

type ElementToolboxProps = {
  onAddElement: (type: string) => void
}

const elementTypes = [
  { type: 'HEADING', label: 'Heading', icon: Heading, description: 'Add a heading (H1-H6)' },
  { type: 'TEXT', label: 'Text', icon: Type, description: 'Add a text paragraph' },
  { type: 'IMAGE', label: 'Image', icon: Image, description: 'Add an image' },
  { type: 'BUTTON', label: 'Button', icon: MousePointer, description: 'Add a clickable button' },
  { type: 'FORM', label: 'Form', icon: FileText, description: 'Add a contact form' },
  { type: 'VIDEO', label: 'Video', icon: Video, description: 'Embed a video' },
  { type: 'COUNTDOWN', label: 'Countdown', icon: Clock, description: 'Add a countdown timer' },
  {
    type: 'TESTIMONIAL',
    label: 'Testimonial',
    icon: MessageSquare,
    description: 'Add a testimonial',
  },
  { type: 'FEATURE_LIST', label: 'Features', icon: List, description: 'List of features' },
  { type: 'PRICING_TABLE', label: 'Pricing', icon: DollarSign, description: 'Add pricing table' },
  { type: 'SPACER', label: 'Spacer', icon: Minus, description: 'Add vertical space' },
  { type: 'DIVIDER', label: 'Divider', icon: Divide, description: 'Add a horizontal line' },
  { type: 'HTML', label: 'HTML', icon: Code, description: 'Custom HTML code' },
  { type: 'CONTAINER', label: 'Container', icon: Square, description: 'Add a container' },
  { type: 'COLUMN', label: 'Column', icon: Columns, description: 'Add a column layout' },
]

export function ElementToolbox({ onAddElement }: ElementToolboxProps) {
  return (
    <div className="space-y-2">
      {elementTypes.map((element) => {
        const Icon = element.icon
        return (
          <Button
            key={element.type}
            className="w-full justify-start text-left h-auto py-3"
            variant="outline"
            onClick={() => onAddElement(element.type)}
          >
            <div className="flex items-start gap-3">
              <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium">{element.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{element.description}</div>
              </div>
            </div>
          </Button>
        )
      })}
    </div>
  )
}
