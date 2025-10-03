'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Percent } from 'lucide-react'
import { BrokerDiscountModal } from './broker-discount-modal'

interface BrokerDiscountButtonProps {
  customerId: string
  customerName: string
  isBroker: boolean
  currentDiscounts: Record<string, number> | null
}

export function BrokerDiscountButton({
  customerId,
  customerName,
  isBroker,
  currentDiscounts,
}: BrokerDiscountButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Fetch product categories when modal needs to open
    if (showModal && categories.length === 0) {
      fetchCategories()
    }
  }, [showModal])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/product-categories')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant={isBroker ? 'default' : 'outline'}
        size="sm"
        onClick={() => setShowModal(true)}
      >
        <Percent className="h-4 w-4 mr-2" />
        {isBroker ? 'Manage' : 'Set'} Broker Discounts
      </Button>

      {showModal && (
        <BrokerDiscountModal
          open={showModal}
          onOpenChange={setShowModal}
          customerId={customerId}
          customerName={customerName}
          categories={categories}
          currentDiscounts={(currentDiscounts as Record<string, number>) || {}}
        />
      )}
    </>
  )
}
