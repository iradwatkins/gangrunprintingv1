'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Lightbulb,
  Camera,
  Palette,
  Sparkles,
  CheckCircle2,
  Trophy
} from 'lucide-react'
import Image from 'next/image'

interface AIVariation {
  id: string
  imageUrl: string
  type: 'lighting' | 'composition' | 'style'
  prompt: string
  explanation: string
  priority: number
}

interface AIVariationGridProps {
  variations: AIVariation[]
  aiAnalysis: string
  onSelectWinner?: (variationId: string) => void
  selectedWinners?: string[]
}

export function AIVariationGrid({
  variations,
  aiAnalysis,
  onSelectWinner,
  selectedWinners = []
}: AIVariationGridProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const getVariationIcon = (type: string) => {
    switch (type) {
      case 'lighting':
        return <Lightbulb className="h-4 w-4" />
      case 'composition':
        return <Camera className="h-4 w-4" />
      case 'style':
        return <Palette className="h-4 w-4" />
      default:
        return <Sparkles className="h-4 w-4" />
    }
  }

  const getVariationColor = (type: string) => {
    switch (type) {
      case 'lighting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'composition':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'style':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getRankingEmoji = (priority: number) => {
    switch (priority) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      case 4: return '4️⃣'
      default: return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* AI Analysis Section */}
      {aiAnalysis && (
        <Card className="bg-gradient-to-r from-violet-50 to-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-purple-900 mb-2">
                  AI Analysis & Rankings
                </h3>
                <div className="prose prose-sm max-w-none text-purple-800 whitespace-pre-wrap">
                  {aiAnalysis}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Variations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {variations.map((variation) => {
          const isSelected = selectedWinners.includes(variation.id)
          const isExpanded = expandedId === variation.id

          return (
            <Card
              key={variation.id}
              className={`transition-all ${
                isSelected
                  ? 'ring-2 ring-green-500 shadow-lg'
                  : 'hover:shadow-md'
              }`}
            >
              <CardContent className="p-4 space-y-3">
                {/* Header with badge and ranking */}
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={`${getVariationColor(variation.type)} flex items-center gap-1`}
                  >
                    {getVariationIcon(variation.type)}
                    <span className="capitalize">{variation.type}</span>
                  </Badge>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getRankingEmoji(variation.priority)}</span>
                    {isSelected && (
                      <Trophy className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>

                {/* Image */}
                <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={variation.imageUrl}
                    alt={`${variation.type} variation`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  )}
                </div>

                {/* AI Explanation */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">
                    AI Suggestion:
                  </p>
                  <p className="text-sm leading-relaxed">
                    {variation.explanation}
                  </p>
                </div>

                {/* Prompt (collapsible) */}
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedId(isExpanded ? null : variation.id)}
                    className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {isExpanded ? '▼' : '▶'} View Modified Prompt
                  </Button>

                  {isExpanded && (
                    <div className="text-xs bg-gray-50 p-3 rounded border text-gray-700 font-mono">
                      {variation.prompt}
                    </div>
                  )}
                </div>

                {/* Select as Winner */}
                {onSelectWinner && (
                  <div className="pt-2 border-t">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onSelectWinner(variation.id)}
                      />
                      <span className="text-sm font-medium">
                        {isSelected ? 'Selected as Winner' : 'Select as Winner'}
                      </span>
                    </label>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-sm text-blue-800 space-y-2">
            <p className="font-medium">How to use AI variations:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Review the AI analysis and rankings above</li>
              <li>Compare the 4 variations and their visual results</li>
              <li>Select one or more winners that best meet your needs</li>
              <li>Click on "View Modified Prompt" to see exact prompt changes</li>
              <li>Use the winning prompt(s) to update your base template</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
