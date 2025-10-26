/**
 * Order Refunded Email
 *
 * Sent when a refund has been processed for an order
 */

import { Button, Column, Heading, Hr, Row, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './email-layout'

interface OrderRefundedEmailProps {
  orderNumber: string
  customerName?: string
  refundAmount: number
  refundReason?: string
  refundMethod: string
  originalPaymentMethod?: string
  refundDate: string
  refundEta?: string
  transactionId?: string
  browseProductsUrl?: string
}

export const OrderRefundedEmail = ({
  orderNumber,
  customerName,
  refundAmount,
  refundReason,
  refundMethod,
  originalPaymentMethod,
  refundDate,
  refundEta,
  transactionId,
  browseProductsUrl,
}: OrderRefundedEmailProps) => {
  return (
    <EmailLayout preview={`Refund Processed - Order ${orderNumber}`}>
      {/* Success Message */}
      <Section style={successBox}>
        <Heading style={heading}>💰 Refund Processed</Heading>
        <Text style={paragraph}>
          {customerName ? `Hi ${customerName}, ` : 'Hi, '}
          your refund has been processed successfully.
        </Text>
      </Section>

      {/* Refund Amount */}
      <Section style={refundBox}>
        <Text style={refundLabel}>Refund Amount</Text>
        <Text style={refundAmountStyle}>${(refundAmount / 100).toFixed(2)}</Text>
        <Text style={orderNumberText}>Order #{orderNumber}</Text>
      </Section>

      <Hr style={divider} />

      {/* Refund Details */}
      <Section>
        <Heading as="h2" style={subheading}>
          Refund Details
        </Heading>
        <Row style={detailRow}>
          <Column>
            <Text style={detailLabel}>Refund Method:</Text>
          </Column>
          <Column align="right">
            <Text style={detailValue}>{refundMethod}</Text>
          </Column>
        </Row>
        {originalPaymentMethod && (
          <Row style={detailRow}>
            <Column>
              <Text style={detailLabel}>Original Payment:</Text>
            </Column>
            <Column align="right">
              <Text style={detailValue}>{originalPaymentMethod}</Text>
            </Column>
          </Row>
        )}
        <Row style={detailRow}>
          <Column>
            <Text style={detailLabel}>Processed Date:</Text>
          </Column>
          <Column align="right">
            <Text style={detailValue}>{refundDate}</Text>
          </Column>
        </Row>
        {refundEta && (
          <Row style={detailRow}>
            <Column>
              <Text style={detailLabel}>Expected By:</Text>
            </Column>
            <Column align="right">
              <Text style={detailValue}>{refundEta}</Text>
            </Column>
          </Row>
        )}
        {transactionId && (
          <Row style={detailRow}>
            <Column>
              <Text style={detailLabel}>Transaction ID:</Text>
            </Column>
            <Column align="right">
              <Text style={detailValueMono}>{transactionId}</Text>
            </Column>
          </Row>
        )}
      </Section>

      {/* Reason */}
      {refundReason && (
        <>
          <Hr style={divider} />
          <Section style={reasonBox}>
            <Text style={reasonLabel}>Refund Reason</Text>
            <Text style={reasonText}>{refundReason}</Text>
          </Section>
        </>
      )}

      <Hr style={divider} />

      {/* What to Expect */}
      <Section>
        <Heading as="h2" style={subheading}>
          What to Expect
        </Heading>
        <ul style={expectList}>
          <li style={expectItem}>
            <strong>Processing Time:</strong> Refunds typically take 5-10 business days to appear on
            your statement
          </li>
          <li style={expectItem}>
            <strong>Statement Description:</strong> Look for "GANGRUN PRINTING" or "REFUND" on your
            statement
          </li>
          <li style={expectItem}>
            <strong>Bank Delays:</strong> Some banks take longer to process refunds - contact your
            bank if it's been over 10 business days
          </li>
          <li style={expectItem}>
            <strong>Different Card:</strong> If your original card has expired or been replaced, the
            refund will still process to your account
          </li>
        </ul>
      </Section>

      <Hr style={divider} />

      {/* Important Notice */}
      <Section style={noticeBox}>
        <Text style={noticeHeading}>📋 Important Information</Text>
        <Text style={noticeText}>
          • Keep this email as proof of refund processing
          <br />
          • The refund will appear on the same payment method used for the original purchase
          <br />• If you don't see the refund after {refundEta || '10 business days'}, contact your
          bank first
          <br />• Still have questions? We're here to help - contact us below
        </Text>
      </Section>

      {/* Reorder CTA */}
      {browseProductsUrl && (
        <>
          <Hr style={divider} />
          <Section style={ctaBox}>
            <Text style={ctaHeading}>We'd Love to Serve You Again</Text>
            <Text style={ctaText}>
              We're sorry this order didn't work out. We'd appreciate another chance to exceed your
              expectations!
            </Text>
            <Button href={browseProductsUrl} style={ctaButton}>
              Browse Our Products
            </Button>
          </Section>
        </>
      )}

      {/* Support */}
      <Section style={supportBox}>
        <Text style={supportText}>
          <strong>Questions About Your Refund?</strong>
          <br />
          <br />
          📧 support@gangrunprinting.com
          <br />
          📞 1-877-GANGRUN
          <br />
          <br />
          Reference Order: <strong>#{orderNumber}</strong>
          {transactionId && (
            <>
              <br />
              Transaction ID: <strong>{transactionId}</strong>
            </>
          )}
        </Text>
      </Section>
    </EmailLayout>
  )
}

// Styles
const successBox = {
  padding: '24px',
  backgroundColor: '#ecfdf5',
  borderRadius: '8px',
  border: '2px solid #86efac',
  marginBottom: '24px',
  textAlign: 'center' as const,
}

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#166534',
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
  margin: '0',
}

const refundBox = {
  padding: '32px 24px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  textAlign: 'center' as const,
  marginBottom: '24px',
  border: '1px solid #e5e7eb',
}

const refundLabel = {
  fontSize: '14px',
  color: '#737373',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  fontWeight: '600',
}

const refundAmountStyle = {
  fontSize: '36px',
  fontWeight: 'bold',
  color: '#166534',
  margin: '0 0 16px',
}

const orderNumberText = {
  fontSize: '16px',
  color: '#404040',
  margin: '0',
}

const divider = {
  borderColor: '#e5e5e5',
  margin: '24px 0',
}

const detailRow = {
  marginBottom: '12px',
}

const detailLabel = {
  fontSize: '14px',
  color: '#737373',
  margin: '0',
}

const detailValue = {
  fontSize: '14px',
  color: '#1a1a1a',
  fontWeight: '500',
  margin: '0',
}

const detailValueMono = {
  fontSize: '13px',
  color: '#1a1a1a',
  fontWeight: '500',
  margin: '0',
  fontFamily: 'monospace',
}

const reasonBox = {
  padding: '20px',
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  border: '1px solid #fcd34d',
}

const reasonLabel = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#92400e',
  margin: '0 0 8px',
}

const reasonText = {
  fontSize: '15px',
  color: '#78350f',
  margin: '0',
}

const expectList = {
  margin: '16px 0',
  paddingLeft: '20px',
}

const expectItem = {
  fontSize: '14px',
  color: '#525252',
  marginBottom: '12px',
  lineHeight: '22px',
}

const noticeBox = {
  padding: '20px',
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
  border: '1px solid #93c5fd',
}

const noticeHeading = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1e40af',
  margin: '0 0 12px',
}

const noticeText = {
  fontSize: '14px',
  color: '#1e3a8a',
  margin: '0',
  lineHeight: '22px',
}

const ctaBox = {
  padding: '24px',
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  border: '1px solid #86efac',
  textAlign: 'center' as const,
}

const ctaHeading = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#166534',
  margin: '0 0 8px',
}

const ctaText = {
  fontSize: '15px',
  color: '#15803d',
  margin: '0 0 20px',
}

const ctaButton = {
  backgroundColor: '#16a34a',
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

export default OrderRefundedEmail
