// Order State Machine for Print Broker Platform
// Handles order status transitions based on vendor updates

export enum OrderStatus {
  // Initial state when order is placed
  PENDING = 'pending',

  // Order sent to vendor, awaiting file review
  PREPRESS = 'prepress',

  // File issue states (vendor holds)
  ON_HOLD_BAD_FILES = 'on_hold_bad_files',
  ON_HOLD_BAD_IMAGES = 'on_hold_bad_images',
  ON_HOLD_FILE_MISSING = 'on_hold_file_missing',
  ON_HOLD_TEXT_CLOSE_TO_EDGES = 'on_hold_text_close_to_edges',

  // Active production at vendor
  PRODUCTION = 'production',

  // Order shipped by vendor
  SHIPPED = 'shipped',

  // Final states
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export interface OrderTransition {
  from: OrderStatus[];
  to: OrderStatus;
  event: string;
  requiresVendorUpdate?: boolean;
  notifyCustomer?: boolean;
}

export const ORDER_TRANSITIONS: OrderTransition[] = [
  // Initial order placement
  {
    from: [OrderStatus.PENDING],
    to: OrderStatus.PREPRESS,
    event: 'vendor_accepted',
    requiresVendorUpdate: true,
    notifyCustomer: true
  },

  // Prepress can go to production or any hold status
  {
    from: [OrderStatus.PREPRESS],
    to: OrderStatus.PRODUCTION,
    event: 'files_approved',
    requiresVendorUpdate: true,
    notifyCustomer: true
  },
  {
    from: [OrderStatus.PREPRESS],
    to: OrderStatus.ON_HOLD_BAD_FILES,
    event: 'bad_files_detected',
    requiresVendorUpdate: true,
    notifyCustomer: true
  },
  {
    from: [OrderStatus.PREPRESS],
    to: OrderStatus.ON_HOLD_BAD_IMAGES,
    event: 'bad_images_detected',
    requiresVendorUpdate: true,
    notifyCustomer: true
  },
  {
    from: [OrderStatus.PREPRESS],
    to: OrderStatus.ON_HOLD_FILE_MISSING,
    event: 'file_missing',
    requiresVendorUpdate: true,
    notifyCustomer: true
  },
  {
    from: [OrderStatus.PREPRESS],
    to: OrderStatus.ON_HOLD_TEXT_CLOSE_TO_EDGES,
    event: 'text_edge_issue',
    requiresVendorUpdate: true,
    notifyCustomer: true
  },

  // Any hold status can return to prepress after customer fixes
  {
    from: [
      OrderStatus.ON_HOLD_BAD_FILES,
      OrderStatus.ON_HOLD_BAD_IMAGES,
      OrderStatus.ON_HOLD_FILE_MISSING,
      OrderStatus.ON_HOLD_TEXT_CLOSE_TO_EDGES
    ],
    to: OrderStatus.PREPRESS,
    event: 'files_resubmitted',
    requiresVendorUpdate: false,
    notifyCustomer: false
  },

  // Production to shipped
  {
    from: [OrderStatus.PRODUCTION],
    to: OrderStatus.SHIPPED,
    event: 'order_shipped',
    requiresVendorUpdate: true,
    notifyCustomer: true
  },

  // Shipped to delivered
  {
    from: [OrderStatus.SHIPPED],
    to: OrderStatus.DELIVERED,
    event: 'order_delivered',
    requiresVendorUpdate: true,
    notifyCustomer: true
  },

  // Cancellation can happen from most states
  {
    from: [
      OrderStatus.PENDING,
      OrderStatus.PREPRESS,
      OrderStatus.ON_HOLD_BAD_FILES,
      OrderStatus.ON_HOLD_BAD_IMAGES,
      OrderStatus.ON_HOLD_FILE_MISSING,
      OrderStatus.ON_HOLD_TEXT_CLOSE_TO_EDGES
    ],
    to: OrderStatus.CANCELLED,
    event: 'order_cancelled',
    requiresVendorUpdate: false,
    notifyCustomer: true
  }
];

export class OrderStateMachine {
  private currentStatus: OrderStatus;

  constructor(initialStatus: OrderStatus = OrderStatus.PENDING) {
    this.currentStatus = initialStatus;
  }

  canTransition(event: string): boolean {
    const transition = ORDER_TRANSITIONS.find(
      t => t.event === event && t.from.includes(this.currentStatus)
    );
    return !!transition;
  }

  transition(event: string): {
    success: boolean;
    newStatus?: OrderStatus;
    notifyCustomer?: boolean;
    error?: string;
  } {
    const transition = ORDER_TRANSITIONS.find(
      t => t.event === event && t.from.includes(this.currentStatus)
    );

    if (!transition) {
      return {
        success: false,
        error: `Cannot transition from ${this.currentStatus} with event ${event}`
      };
    }

    this.currentStatus = transition.to;

    return {
      success: true,
      newStatus: transition.to,
      notifyCustomer: transition.notifyCustomer
    };
  }

  getCurrentStatus(): OrderStatus {
    return this.currentStatus;
  }

  isOnHold(): boolean {
    return [
      OrderStatus.ON_HOLD_BAD_FILES,
      OrderStatus.ON_HOLD_BAD_IMAGES,
      OrderStatus.ON_HOLD_FILE_MISSING,
      OrderStatus.ON_HOLD_TEXT_CLOSE_TO_EDGES
    ].includes(this.currentStatus);
  }

  isFinalState(): boolean {
    return [
      OrderStatus.DELIVERED,
      OrderStatus.CANCELLED
    ].includes(this.currentStatus);
  }

  getHoldReason(): string | null {
    const holdReasons: Record<string, string> = {
      [OrderStatus.ON_HOLD_BAD_FILES]: 'Files do not meet printing specifications',
      [OrderStatus.ON_HOLD_BAD_IMAGES]: 'Image resolution or quality issues detected',
      [OrderStatus.ON_HOLD_FILE_MISSING]: 'Required files are missing from submission',
      [OrderStatus.ON_HOLD_TEXT_CLOSE_TO_EDGES]: 'Text is too close to trim edges'
    };

    return holdReasons[this.currentStatus] || null;
  }
}