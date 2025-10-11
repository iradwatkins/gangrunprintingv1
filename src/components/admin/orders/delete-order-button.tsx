'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface DeleteOrderButtonProps {
  orderId: string
  orderNumber: string
  variant?: 'default' | 'destructive' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showIcon?: boolean
  redirectAfterDelete?: string
}

export function DeleteOrderButton({
  orderId,
  orderNumber,
  variant = 'destructive',
  size = 'default',
  showIcon = true,
  redirectAfterDelete = '/admin/orders',
}: DeleteOrderButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/delete`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete order')
      }

      toast.success('Order deleted successfully', {
        description: `Order ${orderNumber} and ${data.filesDeleted} associated files have been deleted.`,
      })

      setIsOpen(false)

      // Redirect after successful deletion
      if (redirectAfterDelete) {
        router.push(redirectAfterDelete)
        router.refresh()
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error('Error deleting order:', error)
      toast.error('Failed to delete order', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button disabled={isDeleting} size={size} variant={variant}>
          {showIcon && <Trash2 className="h-4 w-4 mr-2" />}
          {isDeleting ? 'Deleting...' : 'Delete Order'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete order <strong>{orderNumber}</strong> and all associated
            files from the system. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? 'Deleting...' : 'Delete Order'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
