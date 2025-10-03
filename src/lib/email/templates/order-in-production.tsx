/**
 * Order In Production Email
 * Sent when vendor is assigned and printing begins
 */

import { Button, Heading, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './email-layout'

interface OrderInProductionEmailProps {
  orderNumber: string
  customerName?: string
  estimatedCompletion: string
  shippingMethod: string
  trackingUrl: string
}

export const OrderInProductionEmail = ({
  orderNumber,
  customerName,
  estimatedCompletion,
  shippingMethod,
  trackingUrl,
}: OrderInProductionEmailProps) => {
  return (
    <EmailLayout preview={`Your Order is Printing! - ${orderNumber}`}>
      <Section style={heroBox}>
        <Text style={emoji}>🖨️</Text>
        <Heading style={heading}>Your Order is Printing!</Heading>
        <Text style={subtext}>Order #{orderNumber}</Text>
      </Section>

      <Text style={paragraph}>
        Great news{customerName ? `, ${customerName}` : ''}!
      </Text>

      <Text style={paragraph}>
        Your order has been approved and sent to our print partner. They're working on it right now!
      </Text>

      <Section style={infoBox}>
        <Text style={infoLabel}>Estimated Completion</Text>
        <Text style={infoValue}>{estimatedCompletion}</Text>

        <Text style={infoLabel}>Shipping Method</Text>
        <Text style={infoValue}>{shippingMethod}</Text>
      </Section>

      <Text style={paragraph}>
        You'll receive another email with tracking information as soon as your order ships.
      </Text>

      <Section style={buttonSection}>
        <Button href={trackingUrl} style={button}>
          Track Your Order
        </Button>
      </Section>
    </EmailLayout>
  )
}

const heroBox = {
  textAlign: 'center' as const,
  padding: '32px 0',
}

const emoji = {
  fontSize: '48px',
  margin: '0 0 16px',
}

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 8px',
}

const subtext = {
  fontSize: '16px',
  color: '#737373',
  margin: '0',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#525252',
  margin: '0 0 16px',
}

const infoBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const infoLabel = {
  fontSize: '12px',
  color: '#737373',
  textTransform: 'uppercase' as const,
  fontWeight: 'bold',
  margin: '16px 0 4px',
}

const infoValue = {
  fontSize: '18px',
  color: '#1a1a1a',
  fontWeight: 'bold',
  margin: '0 0 8px',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#0070f3',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
}

export default OrderInProductionEmail
