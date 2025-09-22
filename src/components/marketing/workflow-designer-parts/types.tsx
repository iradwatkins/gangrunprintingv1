/**
 * Type definitions
 */

  type Connection,
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
  onSave: (workflow: any) => void
  onPreview: (workflow: any) => void
}

  const stepType = STEP_TYPES.find((t) => t.type === data.type)
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

  const stepType = STEP_TYPES.find((t) => t.type === step.type)

  const triggerType = TRIGGER_TYPES.find((t) => t.type === trigger.type)

  switch (trigger.type) {
    case 'event':
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
    const stepTypeConfig = STEP_TYPES.find((t) => t.type === stepType)
    if (!stepTypeConfig) return

    const newStep: WorkflowStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: stepType as any,
      name: stepTypeConfig.label,
      settings: {},
    }

    const newWorkflow = {
      ...currentWorkflow,
      steps: [...currentWorkflow.steps, newStep],
    }

    setCurrentWorkflow(newWorkflow)

    // Add node
    const newNode = {
      id: newStep.id,
      type: 'workflowStep',
      position: { x: 250, y: 150 + currentWorkflow.steps.length * 120 },
      data: {
        ...newStep,
        selected: false,
        onSelect: setSelectedElement,
        onDelete: deleteStep,
      },
    }

    setNodes((nds) => [...nds, newNode])

    // Add edge
    const sourceId =
      currentWorkflow.steps.length === 0
        ? 'trigger'
        : currentWorkflow.steps[currentWorkflow.steps.length - 1].id
    const newEdge = {
      id: `${sourceId}-${newStep.id}`,
      source: sourceId,
      target: newStep.id,
    }

    setEdges((eds) => [...eds, newEdge])
    setShowStepTypes(false)
  }

  function deleteStep(stepId: string) {
    const newWorkflow = {
      ...currentWorkflow,
      steps: currentWorkflow.steps.filter((s) => s.id !== stepId),
    }

    setCurrentWorkflow(newWorkflow)
    setNodes((nds) => nds.filter((n) => n.id !== stepId))
    setEdges((eds) => eds.filter((e) => e.source !== stepId && e.target !== stepId))

    if (selectedElement === stepId) {
      setSelectedElement(null)
    }
  }

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    const newWorkflow = {
      ...currentWorkflow,
      steps: currentWorkflow.steps.map((s) => (s.id === stepId ? { ...s, ...updates } : s)),
    }

    setCurrentWorkflow(newWorkflow)

    // Update node data
    setNodes((nds) =>
      nds.map((n) => (n.id === stepId ? { ...n, data: { ...n.data, ...updates } } : n))
    )
  }

  const updateTrigger = (updates: Partial<WorkflowTrigger>) => {
    const newWorkflow = {
      ...currentWorkflow,
      trigger: { ...currentWorkflow.trigger, ...updates },
    }

    setCurrentWorkflow(newWorkflow)

    // Update trigger node
    setNodes((nds) =>
      nds.map((n) =>
        n.id === 'trigger'
          ? {
              ...n,
              data: { ...n.data, triggerType: updates.type || currentWorkflow.trigger.type },
            }
          : n
      )
    )
  }

  const selectedStep = currentWorkflow.steps.find((s) => s.id === selectedElement)
