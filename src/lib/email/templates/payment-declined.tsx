/**
 * Payment Declined Email
 *
 * Sent when a customer's payment is declined by their payment processor
 */

import { Button, Heading, Hr, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './email-layout'

interface PaymentDeclinedEmailProps {
  orderNumber: string
  customerName?: string
  total: number
  declineReason?: string
  retryPaymentUrl: string
}

export const PaymentDeclinedEmail = ({
  orderNumber,
  customerName,
  total,
  declineReason,
  retryPaymentUrl,
}: PaymentDeclinedEmailProps) => {
  return (
    <EmailLayout preview={`Payment Declined - Order ${orderNumber}`}>
      {/* Alert Message */}
      <Section style={alertBox}>
        <Heading style={heading}>⚠️ Payment Declined</Heading>
        <Text style={paragraph}>
          {customerName ? `Hi ${customerName}, ` : 'Hi, '}
          we were unable to process your payment for order <strong>#{orderNumber}</strong>.
        </Text>
      </Section>

      {/* Decline Reason */}
      {declineReason && (
        <Section style={reasonBox}>
          <Text style={reasonLabel}>Decline Reason:</Text>
          <Text style={reasonText}>{declineReason}</Text>
        </Section>
      )}

      {/* Order Details */}
      <Section style={orderInfoBox}>
        <Text style={orderLabel}>Order Number</Text>
        <Text style={orderValue}>{orderNumber}</Text>
        <Text style={totalLabel}>Order Total</Text>
        <Text style={totalValue}>${(total / 100).toFixed(2)}</Text>
      </Section>

      <Hr style={divider} />

      {/* What to Do */}
      <Section>
        <Heading as="h2" style={subheading}>
          What You Can Do
        </Heading>
        <Text style={paragraph}>
          <strong>1. Check Your Payment Method</strong>
          <br />
          Ensure your card has sufficient funds and hasn't expired.
        </Text>
        <Text style={paragraph}>
          <strong>2. Contact Your Bank</strong>
          <br />
          Sometimes banks block online purchases for security. Call your bank to authorize the
          charge.
        </Text>
        <Text style={paragraph}>
          <strong>3. Try a Different Payment Method</strong>
          <br />
          You can use a different card or payment option to complete your order.
        </Text>
      </Section>

      <Hr style={divider} />

      {/* Action Button */}
      <Section style={buttonSection}>
        <Button href={retryPaymentUrl} style={button}>
          Retry Payment
        </Button>
        <Text style={buttonHelperText}>
          Or reply to this email for assistance: support@gangrunprinting.com
        </Text>
      </Section>

      {/* Support */}
      <Section style={supportBox}>
        <Text style={supportText}>
          <strong>Need Help?</strong>
          <br />
          Our team is here to assist you. Call us at <strong>1-877-GANGRUN</strong> or reply to
          this email.
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
  border: '2px solid #ef4444',
  marginBottom: '24px',
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

const reasonBox = {
  padding: '20px',
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  border: '1px solid #f59e0b',
  marginBottom: '24px',
}

const reasonLabel = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#92400e',
  margin: '0 0 8px',
}

const reasonText = {
  fontSize: '16px',
  color: '#78350f',
  margin: '0',
  fontStyle: 'italic',
}

const orderInfoBox = {
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
}

const orderValue = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 16px',
}

const totalLabel = {
  fontSize: '14px',
  color: '#737373',
  margin: '0 0 8px',
}

const totalValue = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#dc2626',
  margin: '0',
}

const divider = {
  borderColor: '#e5e5e5',
  margin: '24px 0',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
}

const buttonHelperText = {
  fontSize: '14px',
  color: '#737373',
  margin: '16px 0 0',
}

const supportBox = {
  padding: '20px',
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
  textAlign: 'center' as const,
  marginTop: '24px',
}

const supportText = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#404040',
  margin: '0',
}

export default PaymentDeclinedEmail
