// Vendor Webhook Handler for Print Broker Platform
// Processes status updates from printing vendors via N8N

import { OrderStatus } from '../orders/state-machine';

export interface VendorWebhookPayload {
  orderId: string;
  vendorId: string;
  status: string;
  timestamp: string;
  details?: {
    trackingNumber?: string;
    holdReason?: string;
    estimatedDelivery?: string;
    message?: string;
  };
}

export interface VendorStatusMapping {
  vendorStatus: string;
  internalStatus: OrderStatus;
  event: string;
}

// Map vendor-specific statuses to our internal status system
export const VENDOR_STATUS_MAPPINGS: Record<string, VendorStatusMapping[]> = {
  // Generic vendor mapping (can be customized per vendor)
  default: [
    { vendorStatus: 'received', internalStatus: OrderStatus.PREPRESS, event: 'vendor_accepted' },
    { vendorStatus: 'prepress', internalStatus: OrderStatus.PREPRESS, event: 'vendor_accepted' },
    { vendorStatus: 'in_production', internalStatus: OrderStatus.PRODUCTION, event: 'files_approved' },
    { vendorStatus: 'printing', internalStatus: OrderStatus.PRODUCTION, event: 'files_approved' },
    { vendorStatus: 'shipped', internalStatus: OrderStatus.SHIPPED, event: 'order_shipped' },
    { vendorStatus: 'delivered', internalStatus: OrderStatus.DELIVERED, event: 'order_delivered' },

    // Hold statuses
    { vendorStatus: 'hold_bad_files', internalStatus: OrderStatus.ON_HOLD_BAD_FILES, event: 'bad_files_detected' },
    { vendorStatus: 'hold_bad_images', internalStatus: OrderStatus.ON_HOLD_BAD_IMAGES, event: 'bad_images_detected' },
    { vendorStatus: 'hold_missing_files', internalStatus: OrderStatus.ON_HOLD_FILE_MISSING, event: 'file_missing' },
    { vendorStatus: 'hold_text_edges', internalStatus: OrderStatus.ON_HOLD_TEXT_CLOSE_TO_EDGES, event: 'text_edge_issue' }
  ],

  // Vendor-specific mappings can be added here
  // Example: PrintVendorA might use different status names
  printvendor_a: [
    { vendorStatus: 'file_review', internalStatus: OrderStatus.PREPRESS, event: 'vendor_accepted' },
    { vendorStatus: 'production_queue', internalStatus: OrderStatus.PRODUCTION, event: 'files_approved' },
    { vendorStatus: 'dispatched', internalStatus: OrderStatus.SHIPPED, event: 'order_shipped' }
  ]
};

export class VendorWebhookHandler {
  private vendorMappings: Record<string, VendorStatusMapping[]>;

  constructor() {
    this.vendorMappings = VENDOR_STATUS_MAPPINGS;
  }

  // Process incoming webhook from vendor (via N8N)
  async processWebhook(payload: VendorWebhookPayload): Promise<{
    success: boolean;
    internalStatus?: OrderStatus;
    event?: string;
    error?: string;
  }> {
    try {
      // Get vendor-specific mappings or use default
      const mappings = this.vendorMappings[payload.vendorId] || this.vendorMappings.default;

      // Find matching status mapping
      const mapping = mappings.find(m =>
        m.vendorStatus.toLowerCase() === payload.status.toLowerCase()
      );

      if (!mapping) {
        return {
          success: false,
          error: `Unknown vendor status: ${payload.status} from vendor: ${payload.vendorId}`
        };
      }

      return {
        success: true,
        internalStatus: mapping.internalStatus,
        event: mapping.event
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to process webhook: ${error}`
      };
    }
  }

  // Register custom vendor status mappings
  registerVendorMappings(vendorId: string, mappings: VendorStatusMapping[]) {
    this.vendorMappings[vendorId] = mappings;
  }

  // Format webhook response for N8N
  formatN8NResponse(success: boolean, data?: any, error?: string) {
    return {
      success,
      timestamp: new Date().toISOString(),
      ...(data && { data }),
      ...(error && { error })
    };
  }

  // Validate webhook signature (if vendor provides one)
  validateWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    // Implement vendor-specific signature validation
    // This is a placeholder - actual implementation depends on vendor
    return true;
  }
}