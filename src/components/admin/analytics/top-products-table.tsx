'use client'

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
import { Eye, TrendingUp, TrendingDown } from 'lucide-react'

interface TopProductsTableProps {
  products: Array<{
    id: string
    name: string
    orderCount: number
    revenue: number
    category: string
  }>
}

export function TopProductsTable({ products }: TopProductsTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getPerformanceIcon = (index: number) => {
    if (index < 3) {
      return <TrendingUp className="h-4 w-4 text-green-600" />
    }
    return <TrendingDown className="h-4 w-4 text-red-600" />
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Business Cards': 'bg-blue-100 text-blue-800',
      'Flyers': 'bg-green-100 text-green-800',
      'Banners': 'bg-purple-100 text-purple-800',
      'Apparel': 'bg-orange-100 text-orange-800',
      'Marketing': 'bg-pink-100 text-pink-800',
      'Stationery': 'bg-indigo-100 text-indigo-800'
    }

    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No product data available
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">#{index + 1}</span>
                  {getPerformanceIcon(index)}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{product.name}</div>
              </TableCell>
              <TableCell>
                <Badge className={getCategoryColor(product.category)}>
                  {product.category}
                </Badge>
              </TableCell>
              <TableCell>{product.orderCount}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(product.revenue)}
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="ghost">
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}