'use client'

import { useState } from 'react'
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
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Mail, Search, Filter, Download, UserCheck, UserX } from 'lucide-react'

interface Customer {
  id: string
  name: string
  email: string
  createdAt: Date
  totalOrders: number
  totalSpent: number
  lastOrderDate: Date | null
  status: 'verified' | 'unverified'
}

interface CustomersTableProps {
  customers: Customer[]
}

export function CustomersTable({ customers }: CustomersTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'name' | 'spent' | 'orders' | 'date'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Ensure customers is always an array to prevent errors
  const safeCustomers = customers || []

  // Filter customers based on search
  const filteredCustomers = safeCustomers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Sort customers
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'spent':
        comparison = a.totalSpent - b.totalSpent
        break
      case 'orders':
        comparison = a.totalOrders - b.totalOrders
        break
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })

  const toggleCustomerSelection = (customerId: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId) ? prev.filter((id) => id !== customerId) : [...prev, customerId]
    )
  }

  const selectAllCustomers = () => {
    if (selectedCustomers.length === sortedCustomers.length) {
      setSelectedCustomers([])
    } else {
      setSelectedCustomers(sortedCustomers.map((customer) => customer.id))
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button size="sm" variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
        <Button size="sm" variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Selected Actions */}
      {selectedCustomers.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
          <span className="text-sm text-muted-foreground">
            {selectedCustomers.length} customer(s) selected
          </span>
          <Button size="sm" variant="outline">
            Send Email
          </Button>
          <Button size="sm" variant="outline">
            Export Selected
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <input
                  checked={
                    selectedCustomers.length === sortedCustomers.length &&
                    sortedCustomers.length > 0
                  }
                  className="rounded border-gray-300"
                  type="checkbox"
                  onChange={selectAllCustomers}
                />
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground"
                onClick={() => handleSort('name')}
              >
                Customer {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground"
                onClick={() => handleSort('orders')}
              >
                Orders {sortBy === 'orders' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground"
                onClick={() => handleSort('spent')}
              >
                Total Spent {sortBy === 'spent' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Last Order</TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground"
                onClick={() => handleSort('date')}
              >
                Joined {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCustomers.length === 0 ? (
              <TableRow>
                <TableCell className="text-center py-8 text-muted-foreground" colSpan={8}>
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              sortedCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <input
                      checked={selectedCustomers.includes(customer.id)}
                      className="rounded border-gray-300"
                      type="checkbox"
                      onChange={() => toggleCustomerSelection(customer.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-muted-foreground">{customer.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.status === 'verified' ? (
                      <Badge className="gap-1" variant="default">
                        <UserCheck className="h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="gap-1" variant="secondary">
                        <UserX className="h-3 w-3" />
                        Unverified
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{customer.totalOrders}</TableCell>
                  <TableCell>${(customer.totalSpent / 100).toFixed(2)}</TableCell>
                  <TableCell>{formatDate(customer.lastOrderDate)}</TableCell>
                  <TableCell>{formatDate(customer.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="h-8 w-8 p-0" variant="ghost">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/customers/${customer.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Orders</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete Customer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {sortedCustomers.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {sortedCustomers.length} of {customers.length} customers
          </p>
          <div className="flex gap-2">
            <Button disabled size="sm" variant="outline">
              Previous
            </Button>
            <Button disabled size="sm" variant="outline">
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
