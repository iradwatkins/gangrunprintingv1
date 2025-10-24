import * as React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components'
import { EmailLayout } from './email-layout'

interface OrderDelayNotificationProps {
  orderNumber: string
  customerName: string
  originalDeliveryDate: string
  newEstimatedDate: string
  delayReason: string
  orderTrackingUrl?: string
}

export const OrderDelayNotification = ({
  orderNumber = 'GRP-12345',
  customerName = 'Valued Customer',
  originalDeliveryDate = 'October 25, 2025',
  newEstimatedDate = 'October 28, 2025',
  delayReason = 'High order volume',
  orderTrackingUrl = 'https://gangrunprinting.com/track/GRP-12345',
}: OrderDelayNotificationProps) => {
  return (
    <EmailLayout preview={`Order ${orderNumber} - Delivery Update`}>
      <Heading style={heading}>Order Delay Notification</Heading>

      <Text style={text}>Hi {customerName},</Text>

      <Text style={text}>
        We're writing to update you on your order <strong>#{orderNumber}</strong>.
      </Text>

      <Section style={alertBox}>
        <Heading as="h2" style={alertHeading}>
          ⏰ Updated Delivery Timeline
        </Heading>
        <Text style={alertText}>
          <strong>Original Estimate:</strong> {originalDeliveryDate}
        </Text>
        <Text style={alertText}>
          <strong>New Estimate:</strong> {newEstimatedDate}
        </Text>
        <Text style={alertText}>
          <strong>Reason:</strong> {delayReason}
        </Text>
      </Section>

      <Text style={text}>
        We sincerely apologize for this delay. We're working hard to get your order completed and
        shipped as quickly as possible while maintaining our high quality standards.
      </Text>

      <Text style={text}>
        Your order is currently in production and we'll send you an update as soon as it ships.
      </Text>

      {orderTrackingUrl && (
        <Section style={buttonContainer}>
          <Button href={orderTrackingUrl} style={button}>
            Track Your Order
          </Button>
        </Section>
      )}

      <Hr style={hr} />

      <Text style={footer}>
        Questions about your order? Reply to this email or contact our support team - we're here to
        help!
      </Text>

      <Text style={footer}>
        Thank you for your patience and understanding.
        <br />
        <br />
        Best regards,
        <br />
        The GangRun Printing Team
      </Text>
    </EmailLayout>
  )
}

export default OrderDelayNotification

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  marginTop: '0',
  marginBottom: '24px',
  color: '#111827',
}

const text = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#374151',
  marginBottom: '16px',
}

const alertBox = {
  background: '#FEF3C7',
  border: '2px solid #F59E0B',
  borderRadius: '8px',
  padding: '24px',
  marginTop: '24px',
  marginBottom: '24px',
}

const alertHeading = {
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
  color: '#92400E',
}

const alertText = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#78350F',
  marginBottom: '8px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
  marginBottom: '32px',
}

const button = {
  backgroundColor: '#EF4444',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
}

const hr = {
  borderColor: '#E5E7EB',
  marginTop: '32px',
  marginBottom: '32px',
}

const footer = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#6B7280',
  marginTop: '16px',
}
