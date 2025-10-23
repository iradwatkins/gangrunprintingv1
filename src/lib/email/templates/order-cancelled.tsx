/**
 * Order Cancelled Email
 *
 * Sent when an order has been cancelled by customer or admin
 */

import { Button, Heading, Hr, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './email-layout'

interface OrderCancelledEmailProps {
  orderNumber: string
  customerName?: string
  cancelledBy: 'customer' | 'admin'
  cancelReason?: string
  refundAmount?: number
  refundMethod?: string
  refundEta?: string
  browseProductsUrl?: string
}

export const OrderCancelledEmail = ({
  orderNumber,
  customerName,
  cancelledBy,
  cancelReason,
  refundAmount,
  refundMethod,
  refundEta,
  browseProductsUrl,
}: OrderCancelledEmailProps) => {
  const isByCustomer = cancelledBy === 'customer'

  return (
    <EmailLayout preview={`Order Cancelled - ${orderNumber}`}>
      {/* Alert Message */}
      <Section style={alertBox}>
        <Heading style={heading}>🚫 Order Cancelled</Heading>
        <Text style={paragraph}>
          {customerName ? `Hi ${customerName}, ` : 'Hi, '}
          {isByCustomer
            ? 'your cancellation request has been processed'
            : 'your order has been cancelled'}
          .
        </Text>
      </Section>

      {/* Order Details */}
      <Section style={orderBox}>
        <Text style={orderLabel}>Cancelled Order</Text>
        <Text style={orderValue}>#{orderNumber}</Text>
        {cancelReason && (
          <>
            <Text style={reasonLabel}>Reason:</Text>
            <Text style={reasonText}>{cancelReason}</Text>
          </>
        )}
      </Section>

      {/* Refund Information */}
      {refundAmount && refundAmount > 0 && (
        <>
          <Hr style={divider} />
          <Section style={refundBox}>
            <Heading as="h2" style={subheading}>
              💰 Refund Information
            </Heading>
            <Text style={paragraph}>
              <strong>Refund Amount:</strong> ${(refundAmount / 100).toFixed(2)}
            </Text>
            {refundMethod && (
              <Text style={paragraph}>
                <strong>Refund Method:</strong> {refundMethod}
              </Text>
            )}
            {refundEta && (
              <Text style={paragraph}>
                <strong>Expected By:</strong> {refundEta}
              </Text>
            )}
            <Text style={refundNote}>
              Please note: Refunds may take 5-10 business days to appear on your statement,
              depending on your bank or card issuer.
            </Text>
          </Section>
        </>
      )}

      <Hr style={divider} />

      {/* What This Means */}
      <Section>
        <Heading as="h2" style={subheading}>
          What This Means
        </Heading>
        <ul style={infoList}>
          <li style={infoItem}>
            <strong>No Charges:</strong> If payment was processed, you will receive a full refund
          </li>
          <li style={infoItem}>
            <strong>No Production:</strong> Your order will not enter production
          </li>
          <li style={infoItem}>
            <strong>Files Saved:</strong> Your uploaded files are saved for 30 days if you want to
            reorder
          </li>
        </ul>
      </Section>

      <Hr style={divider} />

      {/* Feedback */}
      {isByCustomer && (
        <>
          <Section style={feedbackBox}>
            <Heading as="h3" style={feedbackHeading}>
              We'd Love Your Feedback
            </Heading>
            <Text style={feedbackText}>
              We're sorry to see you cancel. Would you mind sharing why? Your feedback helps us
              improve our service.
            </Text>
            <ul style={feedbackList}>
              <li style={feedbackItem}>Found a better price?</li>
              <li style={feedbackItem}>Timeline didn't work?</li>
              <li style={feedbackItem}>Changed your mind about the design?</li>
              <li style={feedbackItem}>Other reason?</li>
            </ul>
            <Text style={feedbackText}>
              Reply to this email - we read every response and value your input.
            </Text>
          </Section>
          <Hr style={divider} />
        </>
      )}

      {/* Reorder CTA */}
      {browseProductsUrl && (
        <Section style={ctaBox}>
          <Text style={ctaHeading}>Still Need Printing?</Text>
          <Text style={ctaText}>We're here to help with all your printing needs.</Text>
          <Button href={browseProductsUrl} style={ctaButton}>
            Browse Products
          </Button>
        </Section>
      )}

      {/* Support */}
      <Section style={supportBox}>
        <Text style={supportText}>
          <strong>Questions About This Cancellation?</strong>
          <br />
          <br />
          📧 support@gangrunprinting.com
          <br />
          📞 1-877-GANGRUN
          <br />
          <br />
          Reference Order: <strong>#{orderNumber}</strong>
        </Text>
      </Section>

      {/* Thank You */}
      <Section style={thankYouBox}>
        <Text style={thankYouText}>
          Thank you for considering GangRun Printing.
          <br />
          We hope to serve you in the future!
        </Text>
      </Section>
    </EmailLayout>
  )
}

// Styles
const alertBox = {
  padding: '24px',
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  border: '2px solid #f87171',
  marginBottom: '24px',
  textAlign: 'center' as const,
}

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#dc2626',
  margin: '0 0 16px',
}

const subheading = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 16px',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#525252',
  margin: '0 0 12px',
}

const orderBox = {
  padding: '24px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  textAlign: 'center' as const,
  marginBottom: '24px',
}

const orderLabel = {
  fontSize: '14px',
  color: '#737373',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const orderValue = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 16px',
}

const reasonLabel = {
  fontSize: '14px',
  color: '#737373',
  margin: '0 0 8px',
}

const reasonText = {
  fontSize: '15px',
  color: '#404040',
  margin: '0',
  fontStyle: 'italic',
}

const divider = {
  borderColor: '#e5e5e5',
  margin: '24px 0',
}

const refundBox = {
  padding: '20px',
  backgroundColor: '#ecfdf5',
  borderRadius: '8px',
  border: '1px solid #86efac',
}

const refundNote = {
  fontSize: '13px',
  color: '#166534',
  margin: '16px 0 0',
  fontStyle: 'italic',
}

const infoList = {
  margin: '16px 0',
  paddingLeft: '20px',
}

const infoItem = {
  fontSize: '15px',
  color: '#525252',
  marginBottom: '10px',
  lineHeight: '22px',
}

const feedbackBox = {
  padding: '20px',
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  border: '1px solid #fcd34d',
}

const feedbackHeading = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#92400e',
  margin: '0 0 12px',
}

const feedbackText = {
  fontSize: '14px',
  color: '#78350f',
  margin: '0 0 12px',
}

const feedbackList = {
  margin: '12px 0',
  paddingLeft: '20px',
}

const feedbackItem = {
  fontSize: '14px',
  color: '#78350f',
  marginBottom: '6px',
}

const ctaBox = {
  padding: '24px',
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
  border: '1px solid #93c5fd',
  textAlign: 'center' as const,
  marginBottom: '24px',
}

const ctaHeading = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1e40af',
  margin: '0 0 8px',
}

const ctaText = {
  fontSize: '15px',
  color: '#1e3a8a',
  margin: '0 0 20px',
}

const ctaButton = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 28px',
}

const supportBox = {
  padding: '20px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  textAlign: 'center' as const,
  marginTop: '24px',
  border: '1px solid #e5e7eb',
}

const supportText = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#404040',
  margin: '0',
}

const thankYouBox = {
  padding: '20px',
  textAlign: 'center' as const,
  marginTop: '24px',
}

const thankYouText = {
  fontSize: '15px',
  lineHeight: '22px',
  color: '#737373',
  margin: '0',
}

export default OrderCancelledEmail
