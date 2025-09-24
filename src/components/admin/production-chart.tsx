'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function ProductionChart() : unknown {
  // Sample data for production metrics
  const productionData = [
    { time: '9AM', jobs: 12, completed: 8 },
    { time: '10AM', jobs: 18, completed: 15 },
    { time: '11AM', jobs: 24, completed: 20 },
    { time: '12PM', jobs: 15, completed: 12 },
    { time: '1PM', jobs: 20, completed: 18 },
    { time: '2PM', jobs: 28, completed: 24 },
    { time: '3PM', jobs: 32, completed: 28 },
    { time: '4PM', jobs: 25, completed: 22 },
  ]

  const maxJobs = Math.max(...productionData.map((d) => d.jobs))

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
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold">174</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-primary">149</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">85.6%</p>
              </div>
            </div>
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
