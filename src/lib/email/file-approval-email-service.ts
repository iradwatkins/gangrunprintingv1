/**
 * File Approval Email Service
 *
 * Handles sending all file-related emails using React Email + Resend
 */

import { render } from '@react-email/render';
import { sendEmail } from '@/lib/resend';
import { ProofReadyEmail } from './templates/proof-ready';
import { ProofApprovedEmail } from './templates/proof-approved';
import { ProofRejectedEmail } from './templates/proof-rejected';
import { ArtworkUploadedEmail } from './templates/artwork-uploaded';

interface OrderData {
  id: string;
  orderNumber: string;
  email: string;
  User?: {
    name?: string | null;
  };
}

export class FileApprovalEmailService {
  private static readonly FROM_EMAIL = 'orders@gangrunprinting.com';
  private static readonly FROM_NAME = 'GangRun Printing';
  private static readonly ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'iradwatkins@gmail.com';

  /**
   * Send proof ready notification to customer
   */
  static async sendProofReadyNotification(
    order: OrderData,
    proofFile: {
      id: string;
      label?: string;
      filename: string;
    },
    adminMessage?: string
  ): Promise<void> {
    try {
      const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://gangrunprinting.com'}/track/${order.orderNumber}`;
      const proofUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://gangrunprinting.com'}/api/orders/${order.id}/files/${proofFile.id}`;

      const emailHtml = render(
        ProofReadyEmail({
          customerName: order.User?.name || undefined,
          orderNumber: order.orderNumber,
          proofLabel: proofFile.label || proofFile.filename,
          proofUrl,
          trackingUrl,
          adminMessage,
        })
      );

      await sendEmail({
        to: order.email,
        from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
        subject: `Your Proof is Ready for Review - Order ${order.orderNumber} 📄`,
        html: emailHtml,
        text: this.generateProofReadyText(order, proofFile, trackingUrl),
      });

      // console.log(`[Email] Proof ready notification sent to ${order.email}`);
    } catch (error) {
      console.error('[Email] Failed to send proof ready notification:', error);
      throw error;
    }
  }

  /**
   * Send proof approved notification to admin
   */
  static async sendProofApprovedNotification(
    order: OrderData,
    proofFile: {
      id: string;
      label?: string;
      filename: string;
    },
    customerMessage?: string,
    allProofsApproved: boolean = false
  ): Promise<void> {
    try {
      const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://gangrunprinting.com'}/admin/orders/${order.id}`;

      const emailHtml = render(
        ProofApprovedEmail({
          orderNumber: order.orderNumber,
          customerName: order.User?.name || 'Customer',
          customerEmail: order.email,
          proofLabel: proofFile.label || proofFile.filename,
          customerMessage,
          orderUrl,
          allProofsApproved,
        })
      );

      const subject = allProofsApproved
        ? `🎉 All Proofs Approved - Ready for Production - ${order.orderNumber}`
        : `Proof Approved - Order ${order.orderNumber} ✓`;

      await sendEmail({
        to: this.ADMIN_EMAIL,
        from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
        subject,
        html: emailHtml,
        text: this.generateProofApprovedText(order, proofFile, allProofsApproved),
      });

      // console.log(`[Email] Proof approved notification sent to admin`);
    } catch (error) {
      console.error('[Email] Failed to send proof approved notification:', error);
      throw error;
    }
  }

  /**
   * Send proof rejected notification to admin
   */
  static async sendProofRejectedNotification(
    order: OrderData,
    proofFile: {
      id: string;
      label?: string;
      filename: string;
    },
    changeRequested: string
  ): Promise<void> {
    try {
      const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://gangrunprinting.com'}/admin/orders/${order.id}`;

      const emailHtml = render(
        ProofRejectedEmail({
          orderNumber: order.orderNumber,
          customerName: order.User?.name || 'Customer',
          customerEmail: order.email,
          proofLabel: proofFile.label || proofFile.filename,
          changeRequested,
          orderUrl,
        })
      );

      await sendEmail({
        to: this.ADMIN_EMAIL,
        from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
        subject: `Changes Requested - Order ${order.orderNumber} 🔄`,
        html: emailHtml,
        text: this.generateProofRejectedText(order, proofFile, changeRequested),
      });

      // console.log(`[Email] Proof rejected notification sent to admin`);
    } catch (error) {
      console.error('[Email] Failed to send proof rejected notification:', error);
      throw error;
    }
  }

  /**
   * Send customer artwork uploaded notification to admin
   */
  static async sendArtworkUploadedNotification(
    order: OrderData,
    files: Array<{
      filename: string;
      label?: string;
    }>
  ): Promise<void> {
    try {
      const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://gangrunprinting.com'}/admin/orders/${order.id}`;
      const fileNames = files.map((f) => f.label || f.filename);

      const emailHtml = render(
        ArtworkUploadedEmail({
          orderNumber: order.orderNumber,
          customerName: order.User?.name || 'Customer',
          customerEmail: order.email,
          fileCount: files.length,
          fileNames,
          orderUrl,
        })
      );

      await sendEmail({
        to: this.ADMIN_EMAIL,
        from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
        subject: `New Artwork Uploaded - Order ${order.orderNumber} 🎨`,
        html: emailHtml,
        text: this.generateArtworkUploadedText(order, files),
      });

      // console.log(`[Email] Artwork uploaded notification sent to admin`);
    } catch (error) {
      console.error('[Email] Failed to send artwork uploaded notification:', error);
      throw error;
    }
  }

  /**
   * Helper: Generate plain text for proof ready email
   */
  private static generateProofReadyText(
    order: OrderData,
    proofFile: { label?: string; filename: string },
    trackingUrl: string
  ): string {
    return `
Your Proof is Ready for Review!

Order #${order.orderNumber}

Your proof file "${proofFile.label || proofFile.filename}" is ready for review.

Please review your proof carefully and check for:
- Spelling and grammar
- Colors and image quality
- Layout and alignment
- Contact information accuracy

Review and approve at: ${trackingUrl}

Questions? Reply to this email or call 1-800-PRINTING

GangRun Printing
    `.trim();
  }

  /**
   * Helper: Generate plain text for proof approved email
   */
  private static generateProofApprovedText(
    order: OrderData,
    proofFile: { label?: string; filename: string },
    allProofsApproved: boolean
  ): string {
    const status = allProofsApproved ? 'All Proofs Approved - Ready for Production!' : 'Proof Approved';
    return `
${status}

Order #${order.orderNumber}
Customer: ${order.User?.name || 'Customer'} (${order.email})
Proof: ${proofFile.label || proofFile.filename}

${allProofsApproved ? 'All proofs have been approved. This order is ready to begin production.' : 'Customer has approved this proof. Waiting for remaining proofs.'}

GangRun Printing Admin
    `.trim();
  }

  /**
   * Helper: Generate plain text for proof rejected email
   */
  private static generateProofRejectedText(
    order: OrderData,
    proofFile: { label?: string; filename: string },
    changeRequested: string
  ): string {
    return `
Changes Requested

Order #${order.orderNumber}
Customer: ${order.User?.name || 'Customer'} (${order.email})
Proof: ${proofFile.label || proofFile.filename}

Requested Changes:
${changeRequested}

Please create a revised proof addressing these changes.

GangRun Printing Admin
    `.trim();
  }

  /**
   * Helper: Generate plain text for artwork uploaded email
   */
  private static generateArtworkUploadedText(
    order: OrderData,
    files: Array<{ filename: string; label?: string }>
  ): string {
    return `
New Artwork Uploaded

Order #${order.orderNumber}
Customer: ${order.User?.name || 'Customer'} (${order.email})

Files Uploaded (${files.length}):
${files.map((f) => `- ${f.label || f.filename}`).join('\n')}

Please review the files and create a proof for customer approval.

GangRun Printing Admin
    `.trim();
  }
}

export default FileApprovalEmailService;
