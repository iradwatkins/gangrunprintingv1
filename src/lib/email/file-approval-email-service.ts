/**
 * File Approval Email Service
 *
 * Handles sending all file-related emails using React Email + Resend
 */

import { render } from '@react-email/render'
import { sendEmail, downloadFileFromMinIO } from '@/lib/resend'
import { getMinioClient, BUCKETS } from '@/lib/minio-client'
import { ProofReadyEmail } from './templates/proof-ready'
import { ProofApprovedEmail } from './templates/proof-approved'
import { ProofRejectedEmail } from './templates/proof-rejected'
import { ArtworkUploadedEmail } from './templates/artwork-uploaded'

interface OrderData {
  id: string
  orderNumber: string
  email: string
  User?: {
    name?: string | null
  }
}

export class FileApprovalEmailService {
  private static readonly FROM_EMAIL = 'orders@gangrunprinting.com'
  private static readonly FROM_NAME = 'GangRun Printing'
  private static readonly ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'iradwatkins@gmail.com'

  /**
   * Send proof ready notification to customer
   */
  static async sendProofReadyNotification(
    order: OrderData,
    proofFile: {
      id: string
      label?: string
      filename: string
    },
    adminMessage?: string
  ): Promise<void> {
    try {
      const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://gangrunprinting.com'}/en/track/${order.orderNumber}`
      const proofUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://gangrunprinting.com'}/api/orders/${order.id}/files/${proofFile.id}`

      const emailHtml = render(
        ProofReadyEmail({
          customerName: order.User?.name || undefined,
          orderNumber: order.orderNumber,
          proofLabel: proofFile.label || proofFile.filename,
          proofUrl,
          trackingUrl,
          adminMessage,
        })
      )

      await sendEmail({
        to: order.email,
        from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
        subject: `Your Proof is Ready for Review - Order ${order.orderNumber} 📄`,
        html: emailHtml,
        text: this.generateProofReadyText(order, proofFile, trackingUrl),
      })
    } catch (error) {
      console.error('[Email] Failed to send proof ready notification:', error)
      throw error
    }
  }

  /**
   * Send proof with image attachment to customer
   * This is the enhanced version that includes the actual image file
   */
  static async sendProofWithAttachment(
    order: OrderData,
    proofFile: {
      id: string
      label?: string
      filename: string
      fileUrl: string
      mimeType?: string
      fileSize?: number
    },
    adminMessage?: string
  ): Promise<void> {
    try {
      const approveUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://gangrunprinting.com'}/en/proof-approval/${order.id}/${proofFile.id}?action=approve`
      const rejectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://gangrunprinting.com'}/en/proof-approval/${order.id}/${proofFile.id}?action=reject`
      const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://gangrunprinting.com'}/en/track/${order.orderNumber}`

      // Download file from MinIO as attachment
      let attachment
      try {
        // Extract the MinIO object path from the file URL
        const minioPath = proofFile.fileUrl
          .replace(/^\/api\/upload\/temporary\//, '')
          .replace(/^\/api\/files\/permanent\//, '')
        const fileBuffer = await downloadFileFromMinIO(BUCKETS.UPLOADS, minioPath)

        attachment = {
          filename: proofFile.filename,
          content: fileBuffer,
          contentType: proofFile.mimeType || 'application/octet-stream',
        }
      } catch (attachmentError) {
        console.warn(
          '[Email] Failed to download file as attachment, sending without attachment:',
          attachmentError
        )
        attachment = null
      }

      const emailHtml = render(
        ProofReadyEmail({
          customerName: order.User?.name || undefined,
          orderNumber: order.orderNumber,
          proofLabel: proofFile.label || proofFile.filename,
          proofUrl: proofFile.fileUrl,
          trackingUrl,
          adminMessage,
          approveUrl,
          rejectUrl,
          hasAttachment: !!attachment,
        })
      )

      const emailData: any = {
        to: order.email,
        from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
        subject: `📧 Your Proof is Ready for Approval - Order ${order.orderNumber}`,
        html: emailHtml,
        text: this.generateProofWithAttachmentText(
          order,
          proofFile,
          approveUrl,
          rejectUrl,
          adminMessage
        ),
      }

      // Add attachment if successfully downloaded
      if (attachment) {
        emailData.attachments = [attachment]
      }

      await sendEmail(emailData)
    } catch (error) {
      console.error('[Email] Failed to send proof with attachment:', error)
      throw error
    }
  }

  /**
   * Send proof approved notification to admin
   */
  static async sendProofApprovedNotification(
    order: OrderData,
    proofFile: {
      id: string
      label?: string
      filename: string
    },
    customerMessage?: string,
    allProofsApproved: boolean = false
  ): Promise<void> {
    try {
      const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://gangrunprinting.com'}/admin/orders/${order.id}`

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
      )

      const subject = allProofsApproved
        ? `🎉 All Proofs Approved - Ready for Production - ${order.orderNumber}`
        : `Proof Approved - Order ${order.orderNumber} ✓`

      await sendEmail({
        to: this.ADMIN_EMAIL,
        from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
        subject,
        html: emailHtml,
        text: this.generateProofApprovedText(order, proofFile, allProofsApproved),
      })
    } catch (error) {
      console.error('[Email] Failed to send proof approved notification:', error)
      throw error
    }
  }

  /**
   * Send proof rejected notification to admin
   */
  static async sendProofRejectedNotification(
    order: OrderData,
    proofFile: {
      id: string
      label?: string
      filename: string
    },
    changeRequested: string
  ): Promise<void> {
    try {
      const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://gangrunprinting.com'}/admin/orders/${order.id}`

      const emailHtml = render(
        ProofRejectedEmail({
          orderNumber: order.orderNumber,
          customerName: order.User?.name || 'Customer',
          customerEmail: order.email,
          proofLabel: proofFile.label || proofFile.filename,
          changeRequested,
          orderUrl,
        })
      )

      await sendEmail({
        to: this.ADMIN_EMAIL,
        from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
        subject: `Changes Requested - Order ${order.orderNumber} 🔄`,
        html: emailHtml,
        text: this.generateProofRejectedText(order, proofFile, changeRequested),
      })
    } catch (error) {
      console.error('[Email] Failed to send proof rejected notification:', error)
      throw error
    }
  }

  /**
   * Send customer artwork uploaded notification to admin
   */
  static async sendArtworkUploadedNotification(
    order: OrderData,
    files: Array<{
      filename: string
      label?: string
    }>
  ): Promise<void> {
    try {
      const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://gangrunprinting.com'}/admin/orders/${order.id}`
      const fileNames = files.map((f) => f.label || f.filename)

      const emailHtml = render(
        ArtworkUploadedEmail({
          orderNumber: order.orderNumber,
          customerName: order.User?.name || 'Customer',
          customerEmail: order.email,
          fileCount: files.length,
          fileNames,
          orderUrl,
        })
      )

      await sendEmail({
        to: this.ADMIN_EMAIL,
        from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
        subject: `New Artwork Uploaded - Order ${order.orderNumber} 🎨`,
        html: emailHtml,
        text: this.generateArtworkUploadedText(order, files),
      })
    } catch (error) {
      console.error('[Email] Failed to send artwork uploaded notification:', error)
      throw error
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
    `.trim()
  }

  /**
   * Helper: Generate plain text for proof approved email
   */
  private static generateProofApprovedText(
    order: OrderData,
    proofFile: { label?: string; filename: string },
    allProofsApproved: boolean
  ): string {
    const status = allProofsApproved
      ? 'All Proofs Approved - Ready for Production!'
      : 'Proof Approved'
    return `
${status}

Order #${order.orderNumber}
Customer: ${order.User?.name || 'Customer'} (${order.email})
Proof: ${proofFile.label || proofFile.filename}

${allProofsApproved ? 'All proofs have been approved. This order is ready to begin production.' : 'Customer has approved this proof. Waiting for remaining proofs.'}

GangRun Printing Admin
    `.trim()
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
    `.trim()
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
    `.trim()
  }

  /**
   * Helper: Generate plain text for proof with attachment email
   */
  private static generateProofWithAttachmentText(
    order: OrderData,
    proofFile: { label?: string; filename: string },
    approveUrl: string,
    rejectUrl: string,
    adminMessage?: string
  ): string {
    return `
Your Proof is Ready for Approval!

Order #${order.orderNumber}

${order.User?.name ? `Hi ${order.User.name}` : 'Hello'},

Your proof file "${proofFile.label || proofFile.filename}" is ready for review and is attached to this email.

${adminMessage ? `Message from our team:\n${adminMessage}\n` : ''}

IMPORTANT: Please review your proof carefully and check for:
- Spelling and grammar
- Colors and image quality  
- Layout and alignment
- Contact information accuracy

TO APPROVE: Click here or reply with "APPROVE"
${approveUrl}

TO REQUEST CHANGES: Click here or reply with your requested changes
${rejectUrl}

We cannot be held responsible for errors that are approved in the proof.

Questions? Reply to this email or call 1-800-PRINTING

GangRun Printing
    `.trim()
  }
}

export default FileApprovalEmailService
