import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Percent } from 'lucide-react'

interface BrokerDiscountDisplayProps {
  isBroker: boolean
  discounts: Record<string, number> | null
}

export function BrokerDiscountDisplay({ isBroker, discounts }: BrokerDiscountDisplayProps) {
  if (!isBroker) {
    return null
  }

  const discountEntries = discounts ? Object.entries(discounts) : []
  const hasDiscounts = discountEntries.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Percent className="h-4 w-4" />
          Broker Discounts
          <Badge className="ml-auto" variant="secondary">
            {discountEntries.length} Categories
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasDiscounts ? (
          <p className="text-sm text-muted-foreground">No broker discounts configured</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {discountEntries.map(([category, percentage]) => (
              <div
                key={category}
                className="flex items-center justify-between p-2 border rounded text-sm"
              >
                <span className="font-medium truncate">{category}</span>
                <Badge variant="outline">{percentage}%</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
