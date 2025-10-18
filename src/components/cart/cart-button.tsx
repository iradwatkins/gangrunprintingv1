'use client'

import { ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-context'
import { useRouter } from 'next/navigation'

export function CartButton() {
  const { itemCount } = useCart()
  const router = useRouter()

  return (
    <Button
      aria-label={`Shopping cart with ${itemCount} items`}
      className="relative"
      size="icon"
      variant="ghost"
      onClick={() => router.push('/cart')}
    >
      <ShoppingBag className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center font-semibold">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Button>
  )
}
