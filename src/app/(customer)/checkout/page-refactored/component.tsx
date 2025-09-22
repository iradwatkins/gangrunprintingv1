/**
 * page - component definitions
 * Auto-refactored by BMAD
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
import Image from 'next/image'
import { PaymentMethods } from '@/components/checkout/payment-methods'
import { ShippingRates } from '@/components/checkout/shipping-rates'
import { SquareCardPayment } from '@/components/checkout/square-card-payment'
import { PageErrorBoundary } from '@/components/error-boundary'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCart } from '@/contexts/cart-context'
import toast from '@/lib/toast'
import { cn } from '@/lib/utils'


export default function CheckoutPage() {
  return (
    <PageErrorBoundary pageName="Checkout">
      <CheckoutPageContent />
    </PageErrorBoundary>
  )
}
