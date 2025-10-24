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
      // Fetch active, non-hidden, top-level categories only
      const response = await fetch('/api/product-categories?active=true&topLevel=true')
      const data = await response.json()
      // API returns array directly, not wrapped in categories property
      const categoriesArray = Array.isArray(data) ? data : data.categories || []
      // Filter out hidden categories and extract only needed fields
      const filteredCategories = categoriesArray
        .filter((cat: any) => !cat.isHidden && cat.isActive)
        .map((cat: any) => ({
          id: cat.id,
          name: cat.name,
        }))
      setCategories(filteredCategories)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        size="sm"
        variant={isBroker ? 'default' : 'outline'}
        onClick={() => setShowModal(true)}
      >
        <Percent className="h-4 w-4 mr-1" />
        %
      </Button>

      {showModal && (
        <BrokerDiscountModal
          categories={categories}
          currentDiscounts={(currentDiscounts as Record<string, number>) || {}}
          customerId={customerId}
          customerName={customerName}
          open={showModal}
          onOpenChange={setShowModal}
        />
      )}
    </>
  )
}
