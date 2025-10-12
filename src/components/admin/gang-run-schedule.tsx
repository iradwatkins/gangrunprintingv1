'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useEffect, useState } from 'react'

interface GangRun {
  id: string
  type: string
  slots: { used: number; total: number }
  status: 'filling' | 'ready' | 'production'
  scheduledTime: string
}

export function GangRunSchedule() {
  const [gangRuns, setGangRuns] = useState<GangRun[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGangRuns()
  }, [])

  async function fetchGangRuns() {
    try {
      const response = await fetch('/api/metrics/gang-runs')
      if (response.ok) {
        const data = await response.json()
        setGangRuns(data.gangRuns)
      }
    } catch (error) {
      console.error('Failed to fetch gang runs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Today's Production Batches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Today's Production Batches</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {gangRuns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No active production batches</p>
            <p className="text-sm mt-1">Orders will appear here when they enter production</p>
          </div>
        ) : (
          gangRuns.map((gang) => (
          <div key={gang.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{gang.id}</p>
                <p className="text-sm text-muted-foreground">{gang.type}</p>
              </div>
              <div className="text-right">
                <Badge variant={gang.status === 'ready' ? 'default' : 'secondary'}>
                  {gang.status}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">{gang.scheduledTime}</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Capacity</span>
                <span>
                  {gang.slots.used}/{gang.slots.total} slots
                </span>
              </div>
              <Progress className="h-2" value={(gang.slots.used / gang.slots.total) * 100} />
            </div>
          </div>
        ))
        )}
      </CardContent>
    </Card>
  )
}
