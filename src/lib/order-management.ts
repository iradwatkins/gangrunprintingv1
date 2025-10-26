/**
 * Order Management System for Gang Run Printing
 * Handles order lifecycle, status transitions, and workflow management
 */

import { OrderStatus } from '@prisma/client'

export interface OrderStatusInfo {
  status: OrderStatus
  label: string
  color: string
  bgColor: string
  description: string
  nextStatuses: OrderStatus[]
  icon?: string
}

// Define the complete order status workflow with allowed transitions
export const ORDER_STATUS_CONFIG: Record<OrderStatus, OrderStatusInfo> = {
  [OrderStatus.PENDING_PAYMENT]: {
    status: OrderStatus.PENDING_PAYMENT,
    label: 'Pending Payment',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    description: 'Waiting for payment confirmation',
    nextStatuses: [OrderStatus.PAID, OrderStatus.CANCELLED, OrderStatus.PAYMENT_FAILED],
    icon: 'clock',
  },
  [OrderStatus.PAID]: {
    status: OrderStatus.PAID,
    label: 'Paid',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    description: 'Payment received successfully',
    nextStatuses: [OrderStatus.CONFIRMATION, OrderStatus.CANCELLED],
    icon: 'check-circle',
  },
  [OrderStatus.CONFIRMATION]: {
    status: OrderStatus.CONFIRMATION,
    label: 'Order Confirmed',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    description: 'Order has been confirmed and is ready for processing',
    nextStatuses: [OrderStatus.PRE_PRESS, OrderStatus.ON_HOLD, OrderStatus.CANCELLED],
    icon: 'clipboard-check',
  },
  [OrderStatus.PRE_PRESS]: {
    status: OrderStatus.PRE_PRESS,
    label: 'Pre-Press',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-100',
    description: 'Preparing files for printing',
    nextStatuses: [OrderStatus.PRODUCTION, OrderStatus.ON_HOLD, OrderStatus.CANCELLED],
    icon: 'file-text',
  },
  [OrderStatus.ON_HOLD]: {
    status: OrderStatus.ON_HOLD,
    label: 'On Hold',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    description: 'Order is temporarily on hold',
    nextStatuses: [OrderStatus.PRE_PRESS, OrderStatus.PRODUCTION, OrderStatus.CANCELLED],
    icon: 'pause-circle',
  },
  [OrderStatus.PROCESSING]: {
    status: OrderStatus.PROCESSING,
    label: 'Processing',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    description: 'Order is being processed',
    nextStatuses: [OrderStatus.PRODUCTION, OrderStatus.ON_HOLD, OrderStatus.CANCELLED],
    icon: 'settings',
  },
  [OrderStatus.PRODUCTION]: {
    status: OrderStatus.PRODUCTION,
    label: 'In Production',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    description: 'Order is in production',
    nextStatuses: [OrderStatus.PRINTING, OrderStatus.QUALITY_CHECK, OrderStatus.ON_HOLD],
    icon: 'tool',
  },
  [OrderStatus.PRINTING]: {
    status: OrderStatus.PRINTING,
    label: 'Printing',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    description: 'Currently being printed',
    nextStatuses: [OrderStatus.QUALITY_CHECK, OrderStatus.BINDERY, OrderStatus.ON_HOLD],
    icon: 'printer',
  },
  [OrderStatus.QUALITY_CHECK]: {
    status: OrderStatus.QUALITY_CHECK,
    label: 'Quality Check',
    color: 'text-teal-700',
    bgColor: 'bg-teal-100',
    description: 'Undergoing quality control inspection',
    nextStatuses: [OrderStatus.BINDERY, OrderStatus.PACKAGING, OrderStatus.PRODUCTION],
    icon: 'search',
  },
  [OrderStatus.BINDERY]: {
    status: OrderStatus.BINDERY,
    label: 'Bindery',
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-100',
    description: 'In bindery for finishing work',
    nextStatuses: [OrderStatus.PACKAGING, OrderStatus.QUALITY_CHECK],
    icon: 'layers',
  },
  [OrderStatus.PACKAGING]: {
    status: OrderStatus.PACKAGING,
    label: 'Packaging',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    description: 'Being packaged for shipment',
    nextStatuses: [OrderStatus.READY_FOR_PICKUP, OrderStatus.SHIPPED],
    icon: 'package',
  },
  [OrderStatus.READY_FOR_PICKUP]: {
    status: OrderStatus.READY_FOR_PICKUP,
    label: 'Ready for Pickup',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    description: 'Order is ready for customer pickup',
    nextStatuses: [OrderStatus.DELIVERED],
    icon: 'map-pin',
  },
  [OrderStatus.SHIPPED]: {
    status: OrderStatus.SHIPPED,
    label: 'Shipped',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-100',
    description: 'Order has been shipped',
    nextStatuses: [OrderStatus.DELIVERED],
    icon: 'truck',
  },
  [OrderStatus.DELIVERED]: {
    status: OrderStatus.DELIVERED,
    label: 'Delivered',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    description: 'Order has been delivered successfully',
    nextStatuses: [OrderStatus.REFUNDED],
    icon: 'check-square',
  },
  [OrderStatus.CANCELLED]: {
    status: OrderStatus.CANCELLED,
    label: 'Cancelled',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    description: 'Order has been cancelled',
    nextStatuses: [],
    icon: 'x-circle',
  },
  [OrderStatus.REFUNDED]: {
    status: OrderStatus.REFUNDED,
    label: 'Refunded',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    description: 'Order has been refunded',
    nextStatuses: [],
    icon: 'rotate-ccw',
  },
  [OrderStatus.PAYMENT_FAILED]: {
    status: OrderStatus.PAYMENT_FAILED,
    label: 'Payment Failed',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    description: 'Payment processing failed',
    nextStatuses: [OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED],
    icon: 'alert-circle',
  },
  [OrderStatus.PAYMENT_DECLINED]: {
    status: OrderStatus.PAYMENT_DECLINED,
    label: 'Payment Declined',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    description: 'Payment was declined',
    nextStatuses: [OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED],
    icon: 'x-circle',
  },
  [OrderStatus.ON_THE_WAY]: {
    status: OrderStatus.ON_THE_WAY,
    label: 'On the Way',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    description: 'Order is on the way to destination',
    nextStatuses: [OrderStatus.DELIVERED],
    icon: 'truck',
  },
  [OrderStatus.PICKED_UP]: {
    status: OrderStatus.PICKED_UP,
    label: 'Picked Up',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    description: 'Order has been picked up by customer',
    nextStatuses: [],
    icon: 'check-circle',
  },
  [OrderStatus.REPRINT]: {
    status: OrderStatus.REPRINT,
    label: 'Reprint',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    description: 'Order requires reprinting',
    nextStatuses: [OrderStatus.PRE_PRESS, OrderStatus.PRODUCTION],
    icon: 'rotate-cw',
  },
}

// Helper function to check if a status transition is valid
export function canTransitionTo(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
  const statusInfo = ORDER_STATUS_CONFIG[currentStatus]
  return statusInfo.nextStatuses.includes(newStatus)
}

// Get all possible next statuses for a given status
export function getNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
  return ORDER_STATUS_CONFIG[currentStatus].nextStatuses
}

// Get status display information
export function getStatusInfo(status: OrderStatus): OrderStatusInfo {
  return ORDER_STATUS_CONFIG[status]
}

// Generate reference number in format GRP-XXXXX
export function generateReferenceNumber(orderId: number): string {
  return `GRP-${orderId.toString().padStart(5, '0')}`
}

// Calculate estimated delivery date based on status and turnaround time
export function calculateEstimatedDelivery(
  orderDate: Date,
  turnaroundDays: number,
  currentStatus: OrderStatus
): Date | null {
  // Only calculate for active orders
  if (
    [OrderStatus.CANCELLED, OrderStatus.REFUNDED, OrderStatus.PAYMENT_FAILED].includes(
      currentStatus as any
    )
  ) {
    return null
  }

  // If already delivered, return actual delivery date
  if (currentStatus === OrderStatus.DELIVERED) {
    return new Date() // Should be replaced with actual delivery date from database
  }

  const estimatedDate = new Date(orderDate)
  estimatedDate.setDate(estimatedDate.getDate() + turnaroundDays)

  // Skip weekends
  while (estimatedDate.getDay() === 0 || estimatedDate.getDay() === 6) {
    estimatedDate.setDate(estimatedDate.getDate() + 1)
  }

  return estimatedDate
}

// Check if order should trigger Google Review request (3 days after delivery)
export function shouldRequestReview(deliveryDate: Date): boolean {
  const daysSinceDelivery = Math.floor(
    (new Date().getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  return daysSinceDelivery === 3
}

// Get progress percentage based on status
export function getOrderProgress(status: OrderStatus): number {
  const progressMap: Record<OrderStatus, number> = {
    [OrderStatus.PENDING_PAYMENT]: 5,
    [OrderStatus.PAID]: 10,
    [OrderStatus.CONFIRMATION]: 15,
    [OrderStatus.PRE_PRESS]: 25,
    [OrderStatus.ON_HOLD]: 30,
    [OrderStatus.PROCESSING]: 35,
    [OrderStatus.PRODUCTION]: 45,
    [OrderStatus.PRINTING]: 55,
    [OrderStatus.QUALITY_CHECK]: 65,
    [OrderStatus.BINDERY]: 75,
    [OrderStatus.PACKAGING]: 85,
    [OrderStatus.READY_FOR_PICKUP]: 90,
    [OrderStatus.SHIPPED]: 95,
    [OrderStatus.DELIVERED]: 100,
    [OrderStatus.CANCELLED]: 0,
    [OrderStatus.REFUNDED]: 0,
    [OrderStatus.PAYMENT_FAILED]: 0,
    [OrderStatus.PAYMENT_DECLINED]: 0,
    [OrderStatus.ON_THE_WAY]: 97,
    [OrderStatus.PICKED_UP]: 100,
    [OrderStatus.REPRINT]: 25,
  }

  return progressMap[status] || 0
}

// Format status for display with icon
export function formatStatusDisplay(status: OrderStatus): {
  label: string
  className: string
  icon: string
} {
  const info = getStatusInfo(status)
  return {
    label: info.label,
    className: `${info.color} ${info.bgColor}`,
    icon: info.icon || 'circle',
  }
}

// Order status timeline for tracking
export interface OrderTimeline {
  status: OrderStatus
  timestamp: Date
  notes?: string
  updatedBy?: string
}

// Build timeline from status history
export function buildOrderTimeline(
  statusHistory: Array<{
    toStatus: OrderStatus
    createdAt: Date
    notes?: string | null
    changedBy?: string | null
  }>
): OrderTimeline[] {
  return statusHistory
    .map((history) => ({
      status: history.toStatus,
      timestamp: history.createdAt,
      notes: history.notes || undefined,
      updatedBy: history.changedBy || undefined,
    }))
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
}
