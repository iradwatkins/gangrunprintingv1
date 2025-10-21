'use client'

import { ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-context'
import Link from 'next/link'

export function CartButton() {
  const { total, itemCount } = useCart()

  return (
    <Button
      asChild
      aria-label={`Shopping cart total $${total.toFixed(2)}`}
      className="relative flex items-center gap-2"
      variant="ghost"
    >
      <Link href="/checkout">
        <ShoppingBag className="h-5 w-5" />
        <span className="font-semibold">
          {total > 0 ? `$${total.toFixed(2)}` : 'Cart'}
        </span>
      </Link>
    </Button>
  )
}
