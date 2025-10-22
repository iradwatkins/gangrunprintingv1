'use client'

import { ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/contexts/cart-context'
import Link from 'next/link'

export function CartButton() {
  const { total, itemCount } = useCart()

  return (
    <Button
      asChild
      aria-label={`Shopping cart: ${itemCount} ${itemCount === 1 ? 'item' : 'items'}, total $${total.toFixed(2)}`}
      className="relative flex items-center gap-2"
      variant="ghost"
    >
      <Link href="/checkout">
        <div className="relative">
          <ShoppingBag className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {itemCount > 9 ? '9+' : itemCount}
            </Badge>
          )}
        </div>
        <span className="font-semibold">{total > 0 ? `$${total.toFixed(2)}` : 'Cart'}</span>
      </Link>
    </Button>
  )
}
