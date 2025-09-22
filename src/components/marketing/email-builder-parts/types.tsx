/**
 * Type definitions
 */

  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
