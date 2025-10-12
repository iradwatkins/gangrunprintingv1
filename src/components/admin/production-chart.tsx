'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEffect, useState } from 'react'

interface ProductionData {
  time: string
  jobs: number
  completed: number
}

interface ProductionMetrics {
  totalJobs: number
  completed: number
  completionRate: number
}

export function ProductionChart() {
  const [productionData, setProductionData] = useState<ProductionData[]>([])
  const [metrics, setMetrics] = useState<ProductionMetrics>({ totalJobs: 0, completed: 0, completionRate: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProductionData()
  }, [])

  async function fetchProductionData() {
    try {
      // Fetch today's orders grouped by hour
      const response = await fetch('/api/metrics/production-by-hour')
      if (response.ok) {
        const data = await response.json()
        setProductionData(data.hourlyData)
        setMetrics(data.metrics)
      }
    } catch (error) {
      console.error('Failed to fetch production data:', error)
    } finally {
      setLoading(false)
    }
  }

  const maxJobs = productionData.length > 0 ? Math.max(...productionData.map((d) => d.jobs)) : 1

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Production Overview</CardTitle>
        <CardDescription>Hourly production metrics and completion rates</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs className="space-y-4" defaultValue="today">
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
          <TabsContent className="space-y-4" value="today">
            <div className="h-[300px]">
              {/* Simple bar chart visualization */}
              <div className="flex items-end justify-between h-full gap-2">
                {productionData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center justify-end gap-2">
                    <div className="w-full flex flex-col gap-1">
                      <div
                        className="bg-primary/20 rounded-t"
                        style={{
                          height: `${(data.jobs / maxJobs) * 250}px`,
                        }}
                      >
                        <div
                          className="bg-primary rounded-t"
                          style={{
                            height: `${(data.completed / data.jobs) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{data.time}</span>
                  </div>
                ))}
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-[100px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Total Jobs</p>
                  <p className="text-2xl font-bold">{metrics.totalJobs}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-primary">{metrics.completed}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold">{metrics.completionRate.toFixed(1)}%</p>
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="week">
            <div className="text-center py-8 text-muted-foreground">
              Weekly production data will be displayed here
            </div>
          </TabsContent>
          <TabsContent value="month">
            <div className="text-center py-8 text-muted-foreground">
              Monthly production data will be displayed here
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
