/**
 * workflow-designer - component definitions
 * Auto-refactored by BMAD
 */

import { useState, useCallback } from 'react'
import {
import 'reactflow/dist/style.css'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs'
import {
import {
import { type WorkflowStep, type WorkflowTrigger } from '@/lib/marketing/workflow-engine'


export function WorkflowDesigner({ workflow, onSave, onPreview }: WorkflowDesignerProps) {
  const [currentWorkflow, setCurrentWorkflow] = useState(
    workflow || {
      name: 'New Workflow',
      description: '',
      trigger: { type: 'event' as const, event: 'user_registered' },
      steps: [],
      isActive: false,
    }
  )

  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [showStepTypes, setShowStepTypes] = useState(false)

  // Initialize nodes and edges from workflow
  const initialNodes = [
    {
      id: 'trigger',
      type: 'trigger',
      position: { x: 250, y: 50 },
      data: {
        triggerType: currentWorkflow.trigger.type,
        selected: selectedElement === 'trigger',
        onSelect: setSelectedElement,
      },
    },
    ...currentWorkflow.steps.map((step, index) => ({
      id: step.id,
      type: 'workflowStep',
      position: { x: 250, y: 150 + index * 120 },
      data: {
        ...step,
        selected: selectedElement === step.id,
        onSelect: setSelectedElement,
        onDelete: deleteStep,
      },
    })),
  ]

  const initialEdges = currentWorkflow.steps.map((step, index) => {
    const sourceId = index === 0 ? 'trigger' : currentWorkflow.steps[index - 1].id
    return {
      id: `${sourceId}-${step.id}`,
      source: sourceId,
      target: step.id,
    }
  })

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const addStep = (stepType: string) => {
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Step Types */}
      <div className="w-64 bg-white border-r p-4 overflow-y-auto">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-3">Workflow Settings</h3>
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input
                  value={currentWorkflow.name}
                  onChange={(e) =>
                    setCurrentWorkflow((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  value={currentWorkflow.description || ''}
                  onChange={(e) =>
                    setCurrentWorkflow((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Add Steps</h3>
            <div className="space-y-2">
              {STEP_TYPES.map((stepType) => {
                const Icon = stepType.icon
                return (
                  <Button
                    key={stepType.type}
                    className="w-full justify-start text-left"
                    variant="outline"
                    onClick={() => addStep(stepType.type)}
                  >
                    <div

                      className="w-6 h-6 rounded-full flex items-center justify-center text-white mr-3"
                      style={{ backgroundColor: stepType.color }}
                    >
                      <Icon className="w-3 h-3" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{stepType.label}</div>
                      <div className="text-xs text-gray-500">{stepType.description}</div>
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Center - Workflow Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          fitView
          className="bg-gray-50"
          edges={edges}
          nodes={nodes}
          nodeTypes={nodeTypes}
          onConnect={onConnect}
          onEdgesChange={onEdgesChange}
          onNodesChange={onNodesChange}
        >
          <Background />
          <Controls />
        </ReactFlow>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button variant="outline" onClick={() => onPreview(currentWorkflow)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={() => onSave(currentWorkflow)}>
            <Save className="w-4 h-4 mr-2" />
            Save Workflow
          </Button>
        </div>
      </div>

      {/* Right Sidebar - Element Editor */}
      <div className="w-80 bg-white border-l p-4 overflow-y-auto">
        {selectedElement === 'trigger' ? (
          <>
            <h3 className="font-semibold mb-4">Trigger Settings</h3>
            <div className="space-y-4">
              <div>
                <Label>Trigger Type</Label>
                <Select
                  value={currentWorkflow.trigger.type}
                  onValueChange={(value) => updateTrigger({ type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_TYPES.map((triggerType) => (
                      <SelectItem key={triggerType.type} value={triggerType.type}>
                        {triggerType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <TriggerEditor trigger={currentWorkflow.trigger} onUpdate={updateTrigger} />
            </div>
          </>
        ) : selectedStep ? (
          <>
            <h3 className="font-semibold mb-4">Edit {selectedStep.name}</h3>
            <div className="space-y-4">
              <div>
                <Label>Step Name</Label>
                <Input
                  value={selectedStep.name}
                  onChange={(e) => updateStep(selectedStep.id, { name: e.target.value })}
                />
              </div>

              <StepEditor
                step={selectedStep}
                onUpdate={(updates) => updateStep(selectedStep.id, updates)}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Settings className="w-8 h-8 mx-auto mb-2" />
            <p>Select a trigger or step to edit its properties</p>
          </div>
        )}
      </div>
    </div>
  )
}
