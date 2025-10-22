'use client'

import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'

interface Airport {
  id: string
  code: string
  name: string
  city: string
  state: string
}

interface AirportSelectorProps {
  state: string
  onAirportSelected: (airportId: string | null) => void
  selectedAirportId?: string | null
}

export function AirportSelector({ state, onAirportSelected, selectedAirportId }: AirportSelectorProps) {
  const [airports, setAirports] = useState<Airport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (state) {
      fetchAirports()
    }
  }, [state])

  const fetchAirports = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch ALL airports (we want to show all 82 airports regardless of state)
      const response = await fetch('/api/airports')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch airports')
      }

      // If no airports available for any state, don't show the selector at all
      if (!data.airports || data.airports.length === 0) {
        setAirports([])
      } else {
        setAirports(data.airports)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load airports')
    } finally {
      setLoading(false)
    }
  }

  const formatAirportOption = (airport: Airport) => {
    return `${airport.city} (${airport.code})`
  }

  const handleAirportChange = (value: string) => {
    if (value === 'none') {
      onAirportSelected(null)
    } else {
      onAirportSelected(value)
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>Airport Pickup (Southwest)</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (error) {
    return null // Don't show error, just hide the component
  }

  if (airports.length === 0) {
    return null // Don't show if no airports available
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="airport-selector">Airport Pickup (Southwest)</Label>
      <Select value={selectedAirportId || 'none'} onValueChange={handleAirportChange}>
        <SelectTrigger id="airport-selector">
          <SelectValue placeholder="-- Select One --" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          <SelectItem value="none">-- Select One --</SelectItem>
          {airports.map((airport) => (
            <SelectItem key={airport.id} value={airport.id}>
              {formatAirportOption(airport)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
