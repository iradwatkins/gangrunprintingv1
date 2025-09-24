/**
 * workflow-designer - misc definitions
 * Auto-refactored by BMAD
 */

'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  Connection,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Handle,
  Position,
  type NodeTypes,
} from 'reactflow'

  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
  Mail,
  MessageSquare,
  Clock,
  GitBranch,
  Webhook,
  Tag,
  User,
  Play,
  Plus,
  Settings,
  Trash2,
  Save,
  Eye,
} from 'lucide-react'

interface WorkflowDesignerProps {
  workflow?: {
    id?: string
    name: string
    description: string | null
    trigger: WorkflowTrigger
    steps: WorkflowStep[]
    isActive: boolean
  }
  onSave: (workflow: Record<string, unknown>) => void
  onPreview: (workflow: Record<string, unknown>) => void
}

const STEP_TYPES = [
  {
    type: 'email',
    icon: Mail,
    label: 'Send Email',
    color: '#3b82f6',
    description: 'Send an email to the contact',
  },
  {
    type: 'sms',
    icon: MessageSquare,
    label: 'Send SMS',
    color: '#10b981',
    description: 'Send an SMS to the contact',
  },
  {
    type: 'wait',
    icon: Clock,
    label: 'Wait',
    color: '#f59e0b',
    description: 'Wait for a specified time',
  },
  {
    type: 'condition',
    icon: GitBranch,
    label: 'Condition',
    color: '#8b5cf6',
    description: 'Branch based on a condition',
  },
  {
    type: 'webhook',
    icon: Webhook,
    label: 'Webhook',
    color: '#ef4444',
    description: 'Send data to an external URL',
  },
  {
    type: 'tag',
    icon: Tag,
    label: 'Add/Remove Tag',
    color: '#06b6d4',
    description: 'Modify contact tags',
  },
  {
    type: 'update_user',
    icon: User,
    label: 'Update Contact',
    color: '#84cc16',
    description: 'Update contact information',
  },
]

const TRIGGER_TYPES = [
  {
    type: 'event',
    label: 'Event Based',
    description: 'Trigger when a specific event occurs',
    events: [
      { value: 'user_registered', label: 'User Registered' },
      { value: 'order_placed', label: 'Order Placed' },
      { value: 'email_opened', label: 'Email Opened' },
      { value: 'email_clicked', label: 'Email Clicked' },
      { value: 'cart_abandoned', label: 'Cart Abandoned' },
      { value: 'user_login', label: 'User Login' },
    ],
  },
  {
    type: 'schedule',
    label: 'Time Based',
    description: 'Trigger at specific times or intervals',
  },
  {
    type: 'condition',
    label: 'Condition Based',
    description: 'Trigger when a condition is met',
  },
]

// Custom Node Components
function WorkflowStepNode({ data }: { data: Record<string, unknown> }) {
  const stepType = STEP_TYPES.find((t) => t.type === data.type)
  const Icon = stepType?.icon || Mail

  return (
    <div
      className={`px-4 py-3 shadow-md rounded-md bg-white border-2 min-w-[200px] ${
        data.selected ? 'border-blue-500' : 'border-gray-200'
      }`}
      onClick={() => data.onSelect(data.id)}
    >
      <Handle className="w-3 h-3" position={Position.Top} type="target" />

      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white"
          style={{ backgroundColor: stepType?.color }}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm">{data.name || stepType?.label}</div>
          <div className="text-xs text-gray-500">{stepType?.label}</div>
        </div>
      </div>

      {data.type === 'condition' && (
        <>
          <Handle
            className="w-3 h-3"
            id="true"
            position={Position.Bottom}
            style={{ left: '30%' }}
            type="source"
          />
          <Handle
            className="w-3 h-3"
            id="false"
            position={Position.Bottom}
            style={{ left: '70%' }}
            type="source"
          />
        </>
      )}

      {data.type !== 'condition' && (
        <Handle className="w-3 h-3" position={Position.Bottom} type="source" />
      )}

      <div className="absolute top-1 right-1">
        <Button
          className="h-6 w-6 p-0 hover:bg-red-100"
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation()
            data.onDelete(data.id)
          }}
        >
          <Trash2 className="w-3 h-3 text-red-500" />
        </Button>
      </div>

    </div>
  )
}

function TriggerNode({ data }: { data: Record<string, unknown> }) {
  return (
    <div
      className={`px-4 py-3 shadow-md rounded-md bg-green-50 border-2 min-w-[200px] ${
        data.selected ? 'border-green-500' : 'border-green-200'
      }`}
      onClick={() => data.onSelect('trigger')}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
          <Play className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm">Trigger</div>
          <div className="text-xs text-gray-600">{data.triggerType}</div>
        </div>
      </div>

      <Handle className="w-3 h-3" position={Position.Bottom} type="source" />
    </div>
  )
}

const nodeTypes: NodeTypes = {
  workflowStep: WorkflowStepNode,
  trigger: TriggerNode,
}

function StepEditor({
  step,
  onUpdate,
}: {
  step: WorkflowStep
  onUpdate: (updates: Partial<WorkflowStep>) => void
}) {
  const stepType = STEP_TYPES.find((t) => t.type === step.type)

  const updateSettings = (updates: Record<string, unknown>) => {
    onUpdate({ settings: { ...step.settings, ...updates } })
  }

  switch (step.type) {
    case 'email':
      return (
        <div className="space-y-4">
          <div>
            <Label>Subject</Label>
            <Input
              placeholder="Email subject"
              value={step.settings?.subject || ''}
              onChange={(e) => updateSettings({ subject: e.target.value })}
            />
          </div>

          <div>
            <Label>Content</Label>
            <Textarea
              placeholder="Email content (HTML)"
              rows={6}
              value={step.settings?.content?.html || ''}
              onChange={(e) =>
                updateSettings({
                  content: { html: e.target.value, type: 'html' },
                })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Sender Name</Label>
              <Input
                value={step.settings?.senderName || 'GangRun Printing'}
                onChange={(e) => updateSettings({ senderName: e.target.value })}
              />
            </div>

            <div>
              <Label>Sender Email</Label>
              <Input
                value={step.settings?.senderEmail || 'noreply@gangrunprinting.com'}
                onChange={(e) => updateSettings({ senderEmail: e.target.value })}
              />
            </div>
          </div>
        </div>
      )

    case 'sms':
      return (
        <div className="space-y-4">
          <div>
            <Label>Message</Label>
            <Textarea
              maxLength={160}
              placeholder="SMS message content"
              rows={4}
              value={step.settings?.message || ''}
              onChange={(e) => updateSettings({ message: e.target.value })}
            />
            <div className="text-xs text-gray-500 mt-1">
              {(step.settings?.message || '').length}/160 characters
            </div>
          </div>
        </div>
      )

    case 'wait':
      return (
        <div className="space-y-4">
          <div>
            <Label>Wait Duration</Label>
            <div className="flex gap-2">
              <Input
                className="flex-1"
                type="number"
                value={step.settings?.duration || 60}
                onChange={(e) => updateSettings({ duration: parseInt(e.target.value) })}
              />
              <Select
                value={step.settings?.unit || 'minutes'}
                onValueChange={(value) => updateSettings({ unit: value })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )

    case 'condition':
      return (
        <div className="space-y-4">
          <div>
            <Label>Condition Field</Label>
            <Select
              value={step.settings?.condition?.field || ''}
              onValueChange={(value) =>
                updateSettings({
                  condition: { ...step.settings?.condition, field: value },
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user.email">User Email</SelectItem>
                <SelectItem value="user.name">User Name</SelectItem>
                <SelectItem value="user.orderCount">Order Count</SelectItem>
                <SelectItem value="user.totalSpent">Total Spent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Operator</Label>
            <Select
              value={step.settings?.condition?.operator || ''}
              onValueChange={(value) =>
                updateSettings({
                  condition: { ...step.settings?.condition, operator: value },
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select operator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equals">Equals</SelectItem>
                <SelectItem value="not_equals">Not Equals</SelectItem>
                <SelectItem value="greater_than">Greater Than</SelectItem>
                <SelectItem value="less_than">Less Than</SelectItem>
                <SelectItem value="contains">Contains</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Value</Label>
            <Input
              placeholder="Condition value"
              value={step.settings?.condition?.value || ''}
              onChange={(e) =>
                updateSettings({
                  condition: { ...step.settings?.condition, value: e.target.value },
                })
              }
            />

          </div>
        </div>
      )

    case 'webhook':
      return (
        <div className="space-y-4">
          <div>
            <Label>Webhook URL</Label>
            <Input
              placeholder="https://example.com/webhook"
              value={step.settings?.url || ''}
              onChange={(e) => updateSettings({ url: e.target.value })}
            />
          </div>

          <div>
            <Label>Method</Label>
            <Select
              value={step.settings?.method || 'POST'}
              onValueChange={(value) => updateSettings({ method: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Payload (JSON)</Label>
            <Textarea
              placeholder='{"key": "value"}'
              rows={4}
              value={JSON.stringify(step.settings?.payload || {}, null, 2)}
              onChange={(e) => {
                try {
                  const payload = JSON.parse(e.target.value)
                  updateSettings({ payload })
                } catch (error) {
                  // Invalid JSON, don't update
                }
              }}
            />
          </div>
        </div>
      )

    case 'tag':
      return (
        <div className="space-y-4">
          <div>
            <Label>Action</Label>
            <Select
              value={step.settings?.action || 'add'}
              onValueChange={(value) => updateSettings({ action: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Add Tags</SelectItem>
                <SelectItem value="remove">Remove Tags</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Tags (comma separated)</Label>
            <Input
              placeholder="tag1, tag2, tag3"
              value={(step.settings?.tags || []).join(', ')}
              onChange={(e) =>
                updateSettings({
                  tags: e.target.value
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
        </div>
      )

    case 'update_user':
      return (
        <div className="space-y-4">
          <div>
            <Label>Field to Update</Label>
            <Select
              value={step.settings?.field || ''}
              onValueChange={(value) => updateSettings({ field: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="marketingOptIn">Marketing Opt-in</SelectItem>
                <SelectItem value="smsOptIn">SMS Opt-in</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>New Value</Label>
            <Input
              placeholder="New value"
              value={step.settings?.value || ''}
              onChange={(e) => updateSettings({ value: e.target.value })}
            />
          </div>
        </div>
      )

    default:
      return <div>No editor available for this step type</div>
  }
}

function TriggerEditor({
  trigger,
  onUpdate,
}: {
  trigger: WorkflowTrigger
  onUpdate: (updates: Partial<WorkflowTrigger>) => void
}) {
  const triggerType = TRIGGER_TYPES.find((t) => t.type === trigger.type)

  switch (trigger.type) {
    case 'event':
      return (
        <div className="space-y-4">
          <div>
            <Label>Event Type</Label>
            <Select
              value={trigger.event || ''}
              onValueChange={(value) => onUpdate({ event: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select event" />
              </SelectTrigger>
              <SelectContent>
                {triggerType?.events?.map((event) => (
                  <SelectItem key={event.value} value={event.value}>
                    {event.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )

    case 'schedule':
      return (
        <div className="space-y-4">
          <div>
            <Label>Schedule Type</Label>
            <Select
              value={trigger.schedule?.type || 'immediate'}
              onValueChange={(value) =>
                onUpdate({
                  schedule: { ...trigger.schedule, type: value as any },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="delay">Delay</SelectItem>
                <SelectItem value="recurring">Recurring</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {trigger.schedule?.type === 'delay' && (
            <div>
              <Label>Delay (minutes)</Label>
              <Input
                type="number"
                value={trigger.schedule?.delay || 0}
                onChange={(e) =>
                  onUpdate({
                    schedule: { ...trigger.schedule, delay: parseInt(e.target.value) },
                  })
                }
              />
            </div>
          )}

          {trigger.schedule?.type === 'recurring' && (
            <div>
              <Label>Cron Expression</Label>
              <Input
                placeholder="0 9 * * *"
                value={trigger.schedule?.recurringPattern || ''}
                onChange={(e) =>
                  onUpdate({
                    schedule: { ...trigger.schedule, recurringPattern: e.target.value },
                  })
                }
              />
            </div>
          )}
        </div>
      )

    case 'condition':
      return (
        <div className="space-y-4">
          <div>
            <Label>Condition Field</Label>
            <Select
              value={trigger.condition?.field || ''}
              onValueChange={(value) =>
                onUpdate({
                  condition: { ...trigger.condition, field: value },
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user.daysSinceLastOrder">Days Since Last Order</SelectItem>
                <SelectItem value="user.totalSpent">Total Spent</SelectItem>
                <SelectItem value="user.orderCount">Order Count</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Operator</Label>
            <Select
              value={trigger.condition?.operator || ''}
              onValueChange={(value) =>
                onUpdate({
                  condition: { ...trigger.condition, operator: value },
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select operator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equals">Equals</SelectItem>
                <SelectItem value="greater_than">Greater Than</SelectItem>
                <SelectItem value="less_than">Less Than</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Value</Label>
            <Input
              placeholder="Condition value"
              value={trigger.condition?.value || ''}
              onChange={(e) =>
                onUpdate({
                  condition: { ...trigger.condition, value: e.target.value },
                })
              }
            />
          </div>
        </div>
      )

    default:
      return <div>No editor available for this trigger type</div>
  }
}
