import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const gangRuns = [
  {
    id: 'BC-Gang-04',
    type: 'Business Cards',
    slots: { used: 8, total: 10 },
    status: 'filling',
    scheduledTime: '14:00'
  },
  {
    id: 'FL-Gang-12',
    type: 'Flyers 4x6',
    slots: { used: 6, total: 8 },
    status: 'ready',
    scheduledTime: '15:30'
  },
  {
    id: 'BR-Gang-08',
    type: 'Brochures',
    slots: { used: 4, total: 6 },
    status: 'filling',
    scheduledTime: '16:00'
  },
  {
    id: 'PC-Gang-15',
    type: 'Postcards',
    slots: { used: 10, total: 10 },
    status: 'ready',
    scheduledTime: '17:00'
  }
]

export function GangRunSchedule() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Today's Gang Runs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {gangRuns.map((gang) => (
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
                <p className="text-sm text-muted-foreground mt-1">
                  {gang.scheduledTime}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Capacity</span>
                <span>{gang.slots.used}/{gang.slots.total} slots</span>
              </div>
              <Progress 
                className="h-2" 
                value={(gang.slots.used / gang.slots.total) * 100}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}