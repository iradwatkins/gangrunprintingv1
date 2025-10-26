'use client'

import { useState } from 'react'
import { Link } from '@/lib/i18n/navigation'
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
import {
  MoreHorizontal,
  Eye,
  Mail,
  Search,
  Filter,
  Download,
  Percent,
  Phone,
  Edit,
} from 'lucide-react'
import { BrokerDiscountButton } from './broker-discount-button'
import { EditCustomerModal } from './edit-customer-modal'

interface Customer {
  id: string
  name: string
  email: string
  phoneNumber?: string | null
  createdAt: Date
  totalOrders: number
  totalSpent: number
  lastOrderDate: Date | null
  isBroker?: boolean
  brokerDiscounts?: Record<string, number> | null
}

interface CustomersTableProps {
  customers: Customer[]
}

export function CustomersTable({ customers }: CustomersTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'name' | 'spent' | 'orders' | 'date'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

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
                  name="selectAllCustomers"
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
              <TableHead>Contact</TableHead>
              <TableHead>Broker</TableHead>
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
                <TableCell className="text-center py-8 text-muted-foreground" colSpan={9}>
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
                      name={`selectCustomer-${customer.id}`}
                      type="checkbox"
                      onChange={() => toggleCustomerSelection(customer.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <Link
                        className="font-medium hover:underline text-blue-600"
                        href={`/admin/customers/${customer.id}`}
                      >
                        {customer.name}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <a
                        className="flex items-center gap-1.5 text-sm hover:underline text-blue-600"
                        href={`mailto:${customer.email}`}
                      >
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </a>
                      {customer.phoneNumber && (
                        <a
                          className="flex items-center gap-1.5 text-sm hover:underline text-blue-600"
                          href={`tel:${customer.phoneNumber}`}
                        >
                          <Phone className="h-3 w-3" />
                          {customer.phoneNumber}
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.isBroker ? (
                      <div className="flex flex-col gap-1">
                        <Badge className="gap-1 w-fit" variant="default">
                          <Percent className="h-3 w-3" />
                          Broker
                        </Badge>
                        {customer.brokerDiscounts &&
                          Object.keys(customer.brokerDiscounts).length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {Object.keys(customer.brokerDiscounts).length} categories
                            </span>
                          )}
                      </div>
                    ) : (
                      <Badge variant="outline">Regular</Badge>
                    )}
                  </TableCell>
                  <TableCell>{customer.totalOrders}</TableCell>
                  <TableCell>${(customer.totalSpent / 100).toFixed(2)}</TableCell>
                  <TableCell>{formatDate(customer.lastOrderDate)}</TableCell>
                  <TableCell>{formatDate(customer.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <BrokerDiscountButton
                        currentDiscounts={customer.brokerDiscounts || null}
                        customerId={customer.id}
                        customerName={customer.name}
                        isBroker={customer.isBroker || false}
                      />
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
                          <DropdownMenuItem onClick={() => setEditingCustomer(customer)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Customer
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
                    </div>
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

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <EditCustomerModal
          customer={{
            id: editingCustomer.id,
            name: editingCustomer.name,
            email: editingCustomer.email,
            phoneNumber: editingCustomer.phoneNumber,
          }}
          open={!!editingCustomer}
          onOpenChange={(open) => {
            if (!open) setEditingCustomer(null)
          }}
        />
      )}
    </div>
  )
}
