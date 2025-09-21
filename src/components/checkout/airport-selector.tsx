'use client'

import { useState, useEffect } from 'react'
import { Plane, MapPin, Clock, AlertCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

interface Airport {
  id: string
  code: string
  name: string
  city: string
  state: string
}

interface AirportSelectorProps {
  onAirportSelected: (airportId: string | null) => void
  selectedAirportId?: string | null
}

export function AirportSelector({ onAirportSelected, selectedAirportId }: AirportSelectorProps) {
  const [airports, setAirports] = useState<Airport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAirports()
  }, [])

  const fetchAirports = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/airports')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch airports')
      }

      setAirports(data.airports || [])
    } catch (err) {
      console.error('Error fetching airports:', err)
      setError(err instanceof Error ? err.message : 'Failed to load airports')
    } finally {
      setLoading(false)
    }
  }

  const formatAirportOption = (airport: Airport) => {
    return `${airport.name} (${airport.code})`
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Select Airport Pickup Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (airports.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No airport pickup locations are currently available. Please contact support for
          assistance.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5" />
          Select Airport Pickup Location
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose an airport location where you'll pick up your order
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedAirportId || 'none'} onValueChange={handleAirportChange}>
          <SelectTrigger>
            <SelectValue placeholder="Choose an airport..." />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectItem value="none">Select an airport...</SelectItem>
            {airports.map((airport) => (
              <SelectItem key={airport.id} value={airport.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{formatAirportOption(airport)}</span>
                  <Badge className="ml-2 text-xs" variant="outline">
                    {airport.state}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedAirportId && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Pickup location details will be provided in your order confirmation
                </p>
                <p className="text-xs text-muted-foreground">
                  You'll receive complete address, hours, and contact information for your selected
                  airport
                </p>
              </div>
            </div>
          </div>
        )}

        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Important:</strong> Airport pickup locations have specific operating hours and
            requirements. Please review the pickup details in your order confirmation and bring
            valid ID for pickup.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
