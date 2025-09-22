/**
 * email-builder - types definitions
 * Auto-refactored by BMAD
 */


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
