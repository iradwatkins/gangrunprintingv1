'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'
import { EditCustomerModal } from './edit-customer-modal'

interface EditCustomerButtonProps {
  customer: {
    id: string
    name: string
    email: string
    phoneNumber?: string | null
  }
}

export function EditCustomerButton({ customer }: EditCustomerButtonProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Button variant="outline" onClick={() => setShowModal(true)}>
        <Edit className="mr-2 h-4 w-4" />
        Edit Profile
      </Button>

      <EditCustomerModal
        customer={customer}
        open={showModal}
        onOpenChange={setShowModal}
      />
    </>
  )
}
