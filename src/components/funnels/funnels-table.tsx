'use client'

import { useState } from 'react'
import { type Funnel, type FunnelStep } from '@prisma/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Edit, Copy, Trash2, Rocket } from 'lucide-react'
import { Link } from 'next-intl'
import { useRouter } from 'next/navigation'

interface FunnelsTableProps {
  funnels: (Funnel & {
    FunnelStep: FunnelStep[]
    _count: { FunnelStep: number }
  })[]
}

export function FunnelsTable({ funnels }: FunnelsTableProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this funnel?')) return

    setIsDeleting(id)
    try {
      const res = await fetch(`/api/funnels/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        router.refresh()
      } else {
        alert('Failed to delete funnel')
      }
    } catch (error) {
      alert('Failed to delete funnel')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/funnels/${id}/duplicate`, {
        method: 'POST',
      })

      if (res.ok) {
        router.refresh()
      } else {
        alert('Failed to duplicate funnel')
      }
    } catch (error) {
      alert('Failed to duplicate funnel')
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      ACTIVE: 'default',
      DRAFT: 'secondary',
      PAUSED: 'outline',
      ARCHIVED: 'destructive',
    }
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>
  }

  if (funnels.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed rounded-lg">
        <Rocket className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No funnels yet</h3>
        <p className="text-muted-foreground mt-2">Get started by creating your first funnel</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Steps</TableHead>
            <TableHead>Views</TableHead>
            <TableHead>Conversions</TableHead>
            <TableHead>Revenue</TableHead>
            <TableHead>Conversion Rate</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {funnels.map((funnel) => {
            const conversionRate =
              funnel.totalViews > 0
                ? ((funnel.totalConversions / funnel.totalViews) * 100).toFixed(2)
                : '0.00'

            return (
              <TableRow key={funnel.id}>
                <TableCell className="font-medium">
                  <Link className="hover:underline" href={`/admin/funnels/${funnel.id}`}>
                    {funnel.name}
                  </Link>
                </TableCell>
                <TableCell>{getStatusBadge(funnel.status)}</TableCell>
                <TableCell>{funnel._count.FunnelStep}</TableCell>
                <TableCell>{funnel.totalViews.toLocaleString()}</TableCell>
                <TableCell>{funnel.totalConversions.toLocaleString()}</TableCell>
                <TableCell>${funnel.totalRevenue.toLocaleString()}</TableCell>
                <TableCell>{conversionRate}%</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/funnel/${funnel.slug}`} target="_blank">
                          <Eye className="mr-2 h-4 w-4" />
                          View Live
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/funnels/${funnel.id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(funnel.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        disabled={isDeleting === funnel.id}
                        onClick={() => handleDelete(funnel.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
