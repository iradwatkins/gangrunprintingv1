import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Search, Filter, Download } from 'lucide-react'

const orders = [
  { id: 'ORD-001', customer: 'Olivia Martin', product: 'Business Cards (500)', amount: '$299.00', status: 'completed', date: '2024-01-15' },
  { id: 'ORD-002', customer: 'Jackson Lee', product: 'Flyers (1000)', amount: '$450.00', status: 'processing', date: '2024-01-14' },
  { id: 'ORD-003', customer: 'Isabella Nguyen', product: 'Posters (50)', amount: '$350.00', status: 'completed', date: '2024-01-14' },
  { id: 'ORD-004', customer: 'William Kim', product: 'Vinyl Banners (10)', amount: '$999.00', status: 'pending', date: '2024-01-13' },
  { id: 'ORD-005', customer: 'Sofia Davis', product: 'Custom T-Shirts (100)', amount: '$1,299.00', status: 'processing', date: '2024-01-13' },
  { id: 'ORD-006', customer: 'Michael Brown', product: 'Brochures (2000)', amount: '$599.00', status: 'completed', date: '2024-01-12' },
  { id: 'ORD-007', customer: 'Emma Wilson', product: 'Stickers (5000)', amount: '$199.00', status: 'completed', date: '2024-01-12' },
  { id: 'ORD-008', customer: 'James Miller', product: 'Letterheads (1000)', amount: '$349.00', status: 'processing', date: '2024-01-11' },
]

const statusColors: { [key: string]: string } = {
  completed: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  pending: 'bg-yellow-100 text-yellow-800',
}

export default function OrdersPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track all printing orders
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Order
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            A list of all orders including their status and details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search orders..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          {/* Orders Table */}
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">Order ID</th>
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-left p-4 font-medium">Product</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="p-4 font-medium">{order.id}</td>
                    <td className="p-4">{order.customer}</td>
                    <td className="p-4">{order.product}</td>
                    <td className="p-4 font-medium">{order.amount}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">{order.date}</td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Showing 1 to 8 of 100 orders
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}