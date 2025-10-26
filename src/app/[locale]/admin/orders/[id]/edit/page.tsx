import { notFound } from 'next/navigation'
import { Link } from '@/lib/i18n/navigation'
import { prisma } from '@/lib/prisma'
import { ArrowLeft } from 'lucide-react'
import { EditOrderForm } from '@/components/admin/orders/edit-order-form'

interface PageProps {
  params: Promise<{ locale: string; id: string }>
}

async function getOrder(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      User: true,
      OrderItem: {
        include: {
          OrderItemAddOn: {
            include: {
              AddOn: true,
            },
          },
        },
      },
    },
  })

  return order
}

export default async function EditOrderPage({ params }: PageProps) {
  const { id } = await params
  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            href={`/admin/orders/${order.id}`}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Order {order.orderNumber}</h1>
            <p className="text-muted-foreground">Modify order details and configuration</p>
          </div>
        </div>
      </div>

      {/* Edit Order Form */}
      <EditOrderForm order={order} />
    </div>
  )
}
