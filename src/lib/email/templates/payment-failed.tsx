/**
 * Payment Failed Email
 *
 * Sent when a payment processing error occurs (not a decline, but a technical failure)
 */

import { Button, Heading, Hr, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './email-layout'

interface PaymentFailedEmailProps {
  orderNumber: string
  customerName?: string
  total: number
  errorMessage?: string
  retryPaymentUrl: string
  supportUrl?: string
}

export const PaymentFailedEmail = ({
  orderNumber,
  customerName,
  total,
  errorMessage,
  retryPaymentUrl,
  supportUrl,
}: PaymentFailedEmailProps) => {
  return (
    <EmailLayout preview={`Payment Processing Error - Order ${orderNumber}`}>
      {/* Alert Message */}
      <Section style={alertBox}>
        <Heading style={heading}>⚠️ Payment Processing Error</Heading>
        <Text style={paragraph}>
          {customerName ? `Hi ${customerName}, ` : 'Hi, '}
          we encountered a technical issue while processing your payment for order{' '}
          <strong>#{orderNumber}</strong>.
        </Text>
        <Text style={paragraph}>
          <strong>This is not a decline</strong> – there was a temporary processing error on our
          end or with the payment processor.
        </Text>
      </Section>

      {/* Error Details */}
      {errorMessage && (
        <Section style={errorBox}>
          <Text style={errorLabel}>Technical Details:</Text>
          <Text style={errorText}>{errorMessage}</Text>
          <Text style={errorNote}>
            Don't worry – this information helps our team resolve the issue faster.
          </Text>
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

      {/* What Happened */}
      <Section>
        <Heading as="h2" style={subheading}>
          What Happened?
        </Heading>
        <Text style={paragraph}>
          Payment processing systems occasionally experience technical glitches. This could be due
          to:
        </Text>
        <ul style={list}>
          <li style={listItem}>Temporary server issues with the payment processor</li>
          <li style={listItem}>Network connectivity problems</li>
          <li style={listItem}>System maintenance or updates</li>
        </ul>
        <Text style={paragraph}>
          <strong>Your payment method has NOT been charged.</strong>
        </Text>
      </Section>

      <Hr style={divider} />

      {/* Next Steps */}
      <Section>
        <Heading as="h2" style={subheading}>
          Next Steps
        </Heading>
        <Text style={paragraph}>
          <strong>Option 1: Try Again (Recommended)</strong>
          <br />
          Most payment errors resolve themselves. Click the button below to retry your payment.
        </Text>
        <Section style={buttonSection}>
          <Button href={retryPaymentUrl} style={button}>
            Retry Payment Now
          </Button>
        </Section>
        <Text style={paragraph}>
          <strong>Option 2: Contact Support</strong>
          <br />
          If the issue persists, our team can help you complete your order manually.
        </Text>
      </Section>

      <Hr style={divider} />

      {/* Support */}
      <Section style={supportBox}>
        <Text style={supportHeading}>We're Here to Help</Text>
        <Text style={supportText}>
          Our support team is standing by to assist you:
          <br />
          <br />
          📧 <strong>Email:</strong> support@gangrunprinting.com
          <br />
          📞 <strong>Phone:</strong> 1-877-GANGRUN
          <br />
          <br />
          Please reference order <strong>#{orderNumber}</strong> when contacting us.
        </Text>
        {supportUrl && (
          <Button href={supportUrl} style={secondaryButton}>
            Contact Support
          </Button>
        )}
      </Section>

      {/* Assurance */}
      <Section style={assuranceBox}>
        <Text style={assuranceText}>
          🔒 <strong>Your Security Matters</strong>
          <br />
          Your payment information is encrypted and secure. This error does not compromise your data
          in any way.
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
  border: '2px solid #f97316',
  marginBottom: '24px',
}

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#ea580c',
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

const errorBox = {
  padding: '20px',
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  border: '1px solid #eab308',
  marginBottom: '24px',
}

const errorLabel = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#92400e',
  margin: '0 0 8px',
}

const errorText = {
  fontSize: '14px',
  color: '#78350f',
  margin: '0 0 12px',
  fontFamily: 'monospace',
  backgroundColor: '#fef9c3',
  padding: '12px',
  borderRadius: '4px',
}

const errorNote = {
  fontSize: '12px',
  color: '#a16207',
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
  color: '#ea580c',
  margin: '0',
}

const list = {
  margin: '16px 0',
  paddingLeft: '24px',
}

const listItem = {
  fontSize: '16px',
  color: '#525252',
  marginBottom: '8px',
}

const divider = {
  borderColor: '#e5e5e5',
  margin: '24px 0',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '24px 0',
}

const button = {
  backgroundColor: '#ea580c',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
}

const secondaryButton = {
  backgroundColor: '#0070f3',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '10px 24px',
  marginTop: '12px',
}

const supportBox = {
  padding: '24px',
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
  textAlign: 'center' as const,
  marginTop: '24px',
}

const supportHeading = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1e40af',
  margin: '0 0 12px',
}

const supportText = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#404040',
  margin: '0 0 16px',
}

const assuranceBox = {
  padding: '16px',
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  border: '1px solid #86efac',
  marginTop: '24px',
}

const assuranceText = {
  fontSize: '13px',
  lineHeight: '20px',
  color: '#166534',
  margin: '0',
}

export default PaymentFailedEmail
