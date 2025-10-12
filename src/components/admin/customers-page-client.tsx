'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import { AddCustomerModal } from './add-customer-modal'

export function AddCustomerButton() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Button onClick={() => setShowModal(true)}>
        <UserPlus className="mr-2 h-4 w-4" />
        Add Customer
      </Button>

      <AddCustomerModal open={showModal} onOpenChange={setShowModal} />
    </>
  )
}
