'use client'

import Link from 'next/link'
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
import { Eye, Mail } from 'lucide-react'

interface TopCustomersTableProps {
  customers: Array<{
    id: string
    name: string
    email: string
    totalSpent: number
    orderCount: number
  }>
}

export function TopCustomersTable({ customers }: TopCustomersTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getCustomerTier = (totalSpent: number) => {
    if (totalSpent >= 5000) return { label: 'VIP', variant: 'default' as const }
    if (totalSpent >= 1000) return { label: 'Gold', variant: 'secondary' as const }
    if (totalSpent >= 500) return { label: 'Silver', variant: 'outline' as const }
    return { label: 'Bronze', variant: 'outline' as const }
  }

  if (!customers || customers.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No customer data available</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Tier</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead className="text-right">Total Spent</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer, index) => {
            const tier = getCustomerTier(customer.totalSpent)

            return (
              <TableRow key={customer.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-muted-foreground">{customer.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={tier.variant}>{tier.label}</Badge>
                </TableCell>
                <TableCell>{customer.orderCount}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(customer.totalSpent)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/admin/customers/${customer.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
