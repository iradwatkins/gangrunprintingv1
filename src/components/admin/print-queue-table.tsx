'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const printJobs = [
  {
    id: 'GR-2024-001',
    customer: 'ABC Company',
    product: 'Business Cards - 1000qty',
    gangRun: 'BC-Gang-04',
    status: 'prepress',
    priority: 'urgent',
    deadline: '2024-01-16 14:00',
  },
  {
    id: 'GR-2024-002',
    customer: 'XYZ Design Studio',
    product: 'Flyers 4x6 - 5000qty',
    gangRun: 'FL-Gang-12',
    status: 'printing',
    priority: 'normal',
    deadline: '2024-01-17 10:00',
  },
  {
    id: 'GR-2024-003',
    customer: 'Tech Startup Inc',
    product: 'Brochures Tri-fold - 2500qty',
    gangRun: 'BR-Gang-08',
    status: 'finishing',
    priority: 'normal',
    deadline: '2024-01-17 16:00',
  },
  {
    id: 'GR-2024-004',
    customer: 'Local Restaurant',
    product: 'Menus 8.5x11 - 500qty',
    gangRun: 'MN-Gang-02',
    status: 'ready',
    priority: 'urgent',
    deadline: '2024-01-16 12:00',
  },
  {
    id: 'GR-2024-005',
    customer: 'Marketing Agency',
    product: 'Postcards 6x4 - 10000qty',
    gangRun: 'PC-Gang-15',
    status: 'prepress',
    priority: 'normal',
    deadline: '2024-01-18 09:00',
  },
]

const statusColors: Record<string, string> = {
  prepress: 'bg-chart-2/10 text-chart-2',
  printing: 'bg-accent/10 text-accent-foreground',
  finishing: 'bg-secondary/10 text-secondary-foreground',
  ready: 'bg-primary/10 text-primary',
  shipped: 'bg-muted text-muted-foreground',
}

export function PrintQueueTable() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Active Print Queue</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              Export CSV
            </Button>
            <Button size="sm">Add Job</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Gang Run</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {printJobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-mono text-sm">{job.id}</TableCell>
                <TableCell>{job.customer}</TableCell>
                <TableCell>{job.product}</TableCell>
                <TableCell>
                  <Badge variant="outline">{job.gangRun}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[job.status]}>{job.status}</Badge>
                </TableCell>
                <TableCell>
                  {job.priority === 'urgent' && <Badge variant="destructive">Urgent</Badge>}
                  {job.priority === 'normal' && <Badge variant="secondary">Normal</Badge>}
                </TableCell>
                <TableCell className="text-sm">{job.deadline}</TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
