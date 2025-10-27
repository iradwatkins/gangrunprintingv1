'use client'

/**
 * ModifierSelector Component - Quick-Select Modifier Buttons + Guided Mode
 *
 * Purpose: Display quick-select buttons for modifier categories
 * Allows multi-select for STYLE/TECHNICAL/NEGATIVE, single-select for HOLIDAY/LOCATION/CAMERA
 *
 * NEW: Camera Guided Mode - Intelligent workflow for camera selection
 *
 * Date: October 27, 2025
 */

import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Loader2, CheckCircle2, Circle, Sparkles, Wand2 } from 'lucide-react'
import { CameraGuidedWorkflow } from './camera-guided-workflow'

interface Modifier {
  id: string
  label: string
  value: string
  description: string | null
  sortOrder: number
}

interface ModifiersByCategory {
  [key: string]: Modifier[]
}

interface SelectedModifiers {
  style: string[]
  technical: string[]
  negative: string[]
  holiday: string
  location: string
  camera: string
}

interface ModifierSelectorProps {
  selectedModifiers: SelectedModifiers
  onChange: (modifiers: SelectedModifiers) => void
  promptId?: string // For auto-saving when guided recommendations applied
}

export function ModifierSelector({ selectedModifiers, onChange, promptId }: ModifierSelectorProps) {
  const [modifiers, setModifiers] = useState<ModifiersByCategory>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [guidedMode, setGuidedMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch modifiers from API
  useEffect(() => {
    async function fetchModifiers() {
      try {
        const res = await fetch('/api/modifiers')
        if (!res.ok) throw new Error('Failed to fetch modifiers')
        const data = await res.json()
        setModifiers(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load modifiers')
      } finally {
        setLoading(false)
      }
    }

    fetchModifiers()
  }, [])

  // Handle multi-select toggle (STYLE, TECHNICAL, NEGATIVE)
  const toggleMultiSelect = (category: 'style' | 'technical' | 'negative', value: string) => {
    const current = selectedModifiers[category] || []
    const newSelection = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]

    onChange({
      ...selectedModifiers,
      [category]: newSelection,
    })
  }

  // Handle single-select (HOLIDAY, LOCATION, CAMERA)
  const selectSingle = (category: 'holiday' | 'location' | 'camera', value: string) => {
    onChange({
      ...selectedModifiers,
      [category]: value,
    })
  }

  // Handle guided workflow apply
  const handleGuidedApply = async (recommendation: {
    camera: string
    technical: string[]
    style: string[]
    negative: string[]
  }) => {
    // Apply all recommendations to state first
    const newModifiers = {
      ...selectedModifiers,
      camera: recommendation.camera,
      technical: recommendation.technical,
      style: recommendation.style,
      negative: recommendation.negative,
    }

    onChange(newModifiers)

    // Auto-save to database if promptId is provided
    if (promptId) {
      setIsSaving(true)
      try {
        const response = await fetch(`/api/prompts/${promptId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selectedModifiers: newModifiers,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to save recommendations')
        }
      } catch (error) {
        console.error('Error saving recommendations:', error)
        setError('Recommendations applied but failed to save. Please click Save button manually.')
        setTimeout(() => setError(null), 5000)
      } finally {
        setIsSaving(false)
      }
    }

    // Close guided mode
    setGuidedMode(false)
  }

  // Handle guided workflow cancel
  const handleGuidedCancel = () => {
    setGuidedMode(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading modifiers...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive p-4">
        <p className="text-sm text-destructive">Error: {error}</p>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
      {/* Guided Mode Toggle (for Camera section) */}
      <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
        <div className="flex items-center gap-3">
          <Wand2 className="h-5 w-5 text-primary" />
          <div>
            <div className="font-semibold">Camera Guided Mode</div>
            <div className="text-xs text-muted-foreground">
              Intelligent workflow: Camera → Picture Type → Angle → Auto-fill
            </div>
          </div>
        </div>
        <Button
          type="button"
          variant={guidedMode ? 'default' : 'outline'}
          size="sm"
          onClick={() => setGuidedMode(!guidedMode)}
        >
          {guidedMode ? (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Guided Mode Active
            </>
          ) : (
            'Enable Guided Mode'
          )}
        </Button>
      </div>

      {/* Show guided workflow OR quick-select modifiers */}
      {guidedMode ? (
        <CameraGuidedWorkflow
          onApply={handleGuidedApply}
          onCancel={handleGuidedCancel}
        />
      ) : (
        <>
          {/* STYLE MODIFIERS */}
      {modifiers.STYLE && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Style Modifiers</h3>
            <Badge variant="secondary" className="text-xs">
              {selectedModifiers.style.length} selected
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {modifiers.STYLE.map((mod) => {
              const isSelected = selectedModifiers.style.includes(mod.value)
              return (
                <Tooltip key={mod.id}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleMultiSelect('style', mod.value)}
                      className="h-8"
                    >
                      {isSelected ? (
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                      ) : (
                        <Circle className="mr-1 h-3 w-3" />
                      )}
                      {mod.label}
                    </Button>
                  </TooltipTrigger>
                  {mod.description && (
                    <TooltipContent>
                      <p>{mod.description}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              )
            })}
          </div>
        </div>
      )}

      {/* TECHNICAL SPECS */}
      {modifiers.TECHNICAL && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Technical Specs</h3>
            <Badge variant="secondary" className="text-xs">
              {selectedModifiers.technical.length} selected
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {modifiers.TECHNICAL.map((mod) => {
              const isSelected = selectedModifiers.technical.includes(mod.value)
              return (
                <Tooltip key={mod.id}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleMultiSelect('technical', mod.value)}
                      className="h-8"
                    >
                      {isSelected ? (
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                      ) : (
                        <Circle className="mr-1 h-3 w-3" />
                      )}
                      {mod.label}
                    </Button>
                  </TooltipTrigger>
                  {mod.description && (
                    <TooltipContent>
                      <p>{mod.description}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              )
            })}
          </div>
        </div>
      )}

      {/* NEGATIVE PROMPTS */}
      {modifiers.NEGATIVE && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Negative Prompts</h3>
            <Badge variant="secondary" className="text-xs">
              {selectedModifiers.negative.length} selected
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {modifiers.NEGATIVE.map((mod) => {
              const isSelected = selectedModifiers.negative.includes(mod.value)
              return (
                <Tooltip key={mod.id}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={isSelected ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => toggleMultiSelect('negative', mod.value)}
                      className="h-8"
                    >
                      {isSelected ? (
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                      ) : (
                        <Circle className="mr-1 h-3 w-3" />
                      )}
                      {mod.label}
                    </Button>
                  </TooltipTrigger>
                  {mod.description && (
                    <TooltipContent>
                      <p>{mod.description}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              )
            })}
          </div>
        </div>
      )}

      {/* HOLIDAY/SEASON */}
      {modifiers.HOLIDAY && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Holiday/Season</h3>
            {selectedModifiers.holiday && (
              <Badge variant="secondary" className="text-xs">
                Selected
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {modifiers.HOLIDAY.map((mod) => {
              const isSelected = selectedModifiers.holiday === mod.value
              return (
                <Tooltip key={mod.id}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => selectSingle('holiday', mod.value)}
                      className="h-8"
                    >
                      {mod.label}
                    </Button>
                  </TooltipTrigger>
                  {mod.description && (
                    <TooltipContent>
                      <p>{mod.description}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              )
            })}
          </div>
        </div>
      )}

      {/* LOCATION/SETTING */}
      {modifiers.LOCATION && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Location/Setting</h3>
            {selectedModifiers.location && (
              <Badge variant="secondary" className="text-xs">
                Selected
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {modifiers.LOCATION.map((mod) => {
              const isSelected = selectedModifiers.location === mod.value
              return (
                <Tooltip key={mod.id}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => selectSingle('location', mod.value)}
                      className="h-8"
                    >
                      {mod.label}
                    </Button>
                  </TooltipTrigger>
                  {mod.description && (
                    <TooltipContent>
                      <p>{mod.description}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              )
            })}
          </div>
        </div>
      )}

      {/* CAMERA/EQUIPMENT */}
      {modifiers.CAMERA && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Camera/Equipment</h3>
            {selectedModifiers.camera && (
              <Badge variant="secondary" className="text-xs">
                Selected
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {modifiers.CAMERA.map((mod) => {
              const isSelected = selectedModifiers.camera === mod.value
              return (
                <Tooltip key={mod.id}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => selectSingle('camera', mod.value)}
                      className="h-8"
                    >
                      {mod.label}
                    </Button>
                  </TooltipTrigger>
                  {mod.description && (
                    <TooltipContent>
                      <p>{mod.description}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              )
            })}
          </div>
        </div>
      )}
        </>
      )}
      </div>
    </TooltipProvider>
  )
}
