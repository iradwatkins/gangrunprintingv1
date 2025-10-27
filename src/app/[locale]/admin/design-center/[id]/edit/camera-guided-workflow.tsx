'use client'

/**
 * Camera-Guided Workflow Component
 *
 * Purpose: Intelligent wizard for camera → picture type → angle → auto-fill
 *
 * Workflow:
 * 1. Select Camera Type → See "Best for: [Picture Types]"
 * 2. Select Picture Type → See "Recommended Angles: [Shot Types]"
 * 3. Select Angle → Preview recommended modifiers
 * 4. Apply/Edit → Auto-fill technical specs, style, negative modifiers
 *
 * Date: October 27, 2025
 */

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Camera,
  Image,
  Focus,
  Sparkles,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  Circle,
} from 'lucide-react'

interface CameraType {
  value: string
  label: string
  description: string
}

interface PictureType {
  value: string
  label: string
  description: string
}

interface AngleType {
  value: string
  label: string
  description: string
}

interface ModifierRecommendation {
  camera: string
  pictureType: string
  angle: string
  technical: string[]
  style: string[]
  negative: string[]
}

interface CameraGuidedWorkflowProps {
  onApply: (modifiers: {
    camera: string
    technical: string[]
    style: string[]
    negative: string[]
  }) => void
  onCancel: () => void
}

export function CameraGuidedWorkflow({ onApply, onCancel }: CameraGuidedWorkflowProps) {
  // Workflow steps
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  // Available options
  const [cameras, setCameras] = useState<CameraType[]>([])
  const [pictureTypes, setPictureTypes] = useState<PictureType[]>([])
  const [angles, setAngles] = useState<AngleType[]>([])

  // User selections
  const [selectedCamera, setSelectedCamera] = useState<CameraType | null>(null)
  const [selectedPictureType, setSelectedPictureType] = useState<PictureType | null>(null)
  const [selectedAngle, setSelectedAngle] = useState<AngleType | null>(null)
  const [recommendation, setRecommendation] = useState<ModifierRecommendation | null>(null)

  // User customization (checkboxes)
  const [selectedTechnical, setSelectedTechnical] = useState<string[]>([])
  const [selectedStyle, setSelectedStyle] = useState<string[]>([])
  const [selectedNegative, setSelectedNegative] = useState<string[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1: Load cameras on mount
  useEffect(() => {
    async function loadCameras() {
      try {
        setLoading(true)
        const res = await fetch('/api/admin/design-center/camera-recommendations/cameras')
        if (!res.ok) throw new Error('Failed to load cameras')
        const data = await res.json()
        setCameras(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cameras')
      } finally {
        setLoading(false)
      }
    }
    loadCameras()
  }, [])

  // Step 2: Load picture types when camera selected
  useEffect(() => {
    if (!selectedCamera) return

    async function loadPictureTypes() {
      try {
        setLoading(true)
        const res = await fetch(
          `/api/admin/design-center/camera-recommendations/picture-types?camera=${encodeURIComponent(selectedCamera.value)}`
        )
        if (!res.ok) throw new Error('Failed to load picture types')
        const data = await res.json()
        setPictureTypes(data)
        setStep(2)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load picture types')
      } finally {
        setLoading(false)
      }
    }
    loadPictureTypes()
  }, [selectedCamera])

  // Step 3: Load angles when picture type selected
  useEffect(() => {
    if (!selectedCamera || !selectedPictureType) return

    async function loadAngles() {
      try {
        setLoading(true)
        const res = await fetch(
          `/api/admin/design-center/camera-recommendations/angles?camera=${encodeURIComponent(
            selectedCamera.value
          )}&pictureType=${encodeURIComponent(selectedPictureType.value)}`
        )
        if (!res.ok) throw new Error('Failed to load angles')
        const data = await res.json()
        setAngles(data)
        setStep(3)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load angles')
      } finally {
        setLoading(false)
      }
    }
    loadAngles()
  }, [selectedCamera, selectedPictureType])

  // Step 4: Load recommendation when angle selected
  useEffect(() => {
    if (!selectedCamera || !selectedPictureType || !selectedAngle) return

    async function loadRecommendation() {
      try {
        setLoading(true)
        const res = await fetch(
          `/api/admin/design-center/camera-recommendations/recommendation?camera=${encodeURIComponent(
            selectedCamera.value
          )}&pictureType=${encodeURIComponent(selectedPictureType.value)}&angle=${encodeURIComponent(
            selectedAngle.value
          )}`
        )
        if (!res.ok) throw new Error('Failed to load recommendation')
        const data = await res.json()
        setRecommendation(data)

        // Auto-select all recommended modifiers by default
        setSelectedTechnical(data.technical || [])
        setSelectedStyle(data.style || [])
        setSelectedNegative(data.negative || [])

        setStep(4)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load recommendation')
      } finally {
        setLoading(false)
      }
    }
    loadRecommendation()
  }, [selectedCamera, selectedPictureType, selectedAngle])

  const handleReset = () => {
    setStep(1)
    setSelectedCamera(null)
    setSelectedPictureType(null)
    setSelectedAngle(null)
    setRecommendation(null)
    setSelectedTechnical([])
    setSelectedStyle([])
    setSelectedNegative([])
    setPictureTypes([])
    setAngles([])
  }

  const handleApply = () => {
    if (!selectedCamera) return

    onApply({
      camera: selectedCamera.value,
      technical: selectedTechnical,
      style: selectedStyle,
      negative: selectedNegative,
    })
  }

  return (
    <div className="space-y-4">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={step >= 1 ? 'default' : 'outline'}>
            <Camera className="mr-1 h-3 w-3" />
            Camera
          </Badge>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Badge variant={step >= 2 ? 'default' : 'outline'}>
            <Image className="mr-1 h-3 w-3" />
            Picture Type
          </Badge>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Badge variant={step >= 3 ? 'default' : 'outline'}>
            <Focus className="mr-1 h-3 w-3" />
            Angle
          </Badge>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Badge variant={step >= 4 ? 'default' : 'outline'}>
            <Sparkles className="mr-1 h-3 w-3" />
            Preview
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>

      {error && (
        <Card className="border-destructive p-4">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      {/* Step 1: Select Camera */}
      {step === 1 && (
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Step 1: Choose Your Camera</h3>
          <p className="mb-6 text-sm text-muted-foreground">
            Each camera type excels at different photography styles. Select the one that matches your needs.
          </p>
          <div className="space-y-3">
            {cameras.map((camera) => (
              <button
                key={camera.value}
                onClick={() => setSelectedCamera(camera)}
                className="w-full rounded-lg border p-4 text-left transition-all hover:border-primary hover:bg-primary/5 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Camera className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 font-semibold text-base">{camera.label}</div>
                    <div className="text-sm text-muted-foreground leading-relaxed">{camera.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Step 2: Select Picture Type */}
      {step === 2 && selectedCamera && (
        <Card className="p-6">
          <h3 className="mb-2 text-lg font-semibold">
            Step 2: What Will You Photograph?
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {selectedCamera.label} is best for these types of photography:
          </p>
          <div className="space-y-2">
            {pictureTypes.map((pictureType) => (
              <button
                key={pictureType.value}
                onClick={() => setSelectedPictureType(pictureType)}
                className="w-full rounded-lg border p-4 text-left transition-all hover:border-primary hover:bg-primary/5"
              >
                <div className="font-semibold">{pictureType.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {pictureType.description}
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Step 3: Select Angle */}
      {step === 3 && selectedCamera && selectedPictureType && (
        <Card className="p-6">
          <h3 className="mb-2 text-lg font-semibold">
            Step 3: Choose Your Angle
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Recommended angles for {selectedPictureType.label}:
          </p>
          <div className="grid grid-cols-2 gap-3">
            {angles.map((angle) => (
              <button
                key={angle.value}
                onClick={() => setSelectedAngle(angle)}
                className="rounded-lg border p-4 text-left transition-all hover:border-primary hover:bg-primary/5"
              >
                <div className="flex items-start gap-2">
                  <Focus className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-semibold">{angle.label}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{angle.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Step 4: Preview & Customize */}
      {step === 4 && recommendation && (
        <div className="space-y-4">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Step 4: Review Recommendations</h3>
              <Badge>
                {selectedTechnical.length + selectedStyle.length + selectedNegative.length}{' '}
                modifiers selected
              </Badge>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              Based on your selections, we recommend these modifiers. Uncheck any you don't
              want to include.
            </p>

            {/* Technical Specs */}
            {recommendation.technical.length > 0 && (
              <div className="mb-6">
                <Label className="mb-3 flex items-center gap-2">
                  <span className="font-semibold">Technical Specs</span>
                  <Badge variant="secondary">{selectedTechnical.length} selected</Badge>
                </Label>
                <div className="space-y-2">
                  {recommendation.technical.map((tech) => (
                    <div key={tech} className="flex items-center gap-2">
                      <Checkbox
                        id={`tech-${tech}`}
                        checked={selectedTechnical.includes(tech)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTechnical([...selectedTechnical, tech])
                          } else {
                            setSelectedTechnical(selectedTechnical.filter((t) => t !== tech))
                          }
                        }}
                      />
                      <label
                        htmlFor={`tech-${tech}`}
                        className="flex-1 cursor-pointer text-sm"
                      >
                        {tech}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Style Modifiers */}
            {recommendation.style.length > 0 && (
              <div className="mb-6">
                <Label className="mb-3 flex items-center gap-2">
                  <span className="font-semibold">Style Modifiers</span>
                  <Badge variant="secondary">{selectedStyle.length} selected</Badge>
                </Label>
                <div className="space-y-2">
                  {recommendation.style.map((style) => (
                    <div key={style} className="flex items-center gap-2">
                      <Checkbox
                        id={`style-${style}`}
                        checked={selectedStyle.includes(style)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedStyle([...selectedStyle, style])
                          } else {
                            setSelectedStyle(selectedStyle.filter((s) => s !== style))
                          }
                        }}
                      />
                      <label
                        htmlFor={`style-${style}`}
                        className="flex-1 cursor-pointer text-sm"
                      >
                        {style}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Negative Prompts */}
            {recommendation.negative.length > 0 && (
              <div>
                <Label className="mb-3 flex items-center gap-2">
                  <span className="font-semibold">Negative Prompts (Things to Avoid)</span>
                  <Badge variant="secondary">{selectedNegative.length} selected</Badge>
                </Label>
                <div className="space-y-2">
                  {recommendation.negative.map((neg) => (
                    <div key={neg} className="flex items-center gap-2">
                      <Checkbox
                        id={`neg-${neg}`}
                        checked={selectedNegative.includes(neg)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedNegative([...selectedNegative, neg])
                          } else {
                            setSelectedNegative(selectedNegative.filter((n) => n !== neg))
                          }
                        }}
                      />
                      <label htmlFor={`neg-${neg}`} className="flex-1 cursor-pointer text-sm">
                        {neg}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleApply} className="flex-1">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Apply Recommendations
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
