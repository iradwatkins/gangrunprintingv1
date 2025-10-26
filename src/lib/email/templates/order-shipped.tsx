/**
 * Order Shipped Email
 *
 * Sent when an order has been shipped with tracking information
 */

import { Button, Column, Heading, Hr, Row, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './email-layout'

interface OrderShippedEmailProps {
  orderNumber: string
  customerName?: string
  trackingNumber: string
  carrier: 'FEDEX' | 'UPS' | 'SOUTHWEST_CARGO' | string
  estimatedDelivery?: string
  shippingAddress: {
    name: string
    street: string
    city: string
    state: string
    zipCode: string
  }
  trackingUrl: string
}

export const OrderShippedEmail = ({
  orderNumber,
  customerName,
  trackingNumber,
  carrier,
  estimatedDelivery,
  shippingAddress,
  trackingUrl,
}: OrderShippedEmailProps) => {
  const carrierNames: Record<string, string> = {
    FEDEX: 'FedEx',
    UPS: 'UPS',
    SOUTHWEST_CARGO: 'Southwest Cargo',
  }

  const carrierName = carrierNames[carrier] || carrier

  return (
    <EmailLayout preview={`Your Order Has Shipped - ${orderNumber}`}>
      {/* Success Message */}
      <Section style={successBox}>
        <Heading style={heading}>📦 Your Order Has Shipped!</Heading>
        <Text style={paragraph}>
          {customerName ? `Great news, ${customerName}!` : 'Great news!'} Your order is on its way
          to you.
        </Text>
      </Section>

      {/* Tracking Information */}
      <Section style={trackingBox}>
        <Text style={trackingLabel}>Tracking Number</Text>
        <Text style={trackingNumberStyle}>{trackingNumber}</Text>
        <Text style={carrierText}>Shipped via {carrierName}</Text>
        {estimatedDelivery && (
          <Text style={estimatedDeliveryText}>
            <strong>Estimated Delivery:</strong> {estimatedDelivery}
          </Text>
        )}
        <Button href={trackingUrl} style={trackButton}>
          Track Your Package
        </Button>
      </Section>

      <Hr style={divider} />

      {/* Order Details */}
      <Section>
        <Heading as="h2" style={subheading}>
          Order Details
        </Heading>
        <Row style={detailRow}>
          <Column>
            <Text style={detailLabel}>Order Number:</Text>
          </Column>
          <Column align="right">
            <Text style={detailValue}>{orderNumber}</Text>
          </Column>
        </Row>
        <Row style={detailRow}>
          <Column>
            <Text style={detailLabel}>Carrier:</Text>
          </Column>
          <Column align="right">
            <Text style={detailValue}>{carrierName}</Text>
          </Column>
        </Row>
      </Section>

      <Hr style={divider} />

      {/* Shipping Address */}
      <Section>
        <Heading as="h2" style={subheading}>
          Shipping To
        </Heading>
        <Text style={addressText}>
          {shippingAddress.name}
          <br />
          {shippingAddress.street}
          <br />
          {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
        </Text>
      </Section>

      <Hr style={divider} />

      {/* Delivery Tips */}
      <Section style={tipsBox}>
        <Heading as="h3" style={tipsHeading}>
          📋 Delivery Tips
        </Heading>
        <ul style={tipsList}>
          <li style={tipItem}>
            <strong>Track Regularly:</strong> Check tracking for real-time updates
          </li>
          <li style={tipItem}>
            <strong>Signature Required:</strong> Someone must be available to sign for delivery
          </li>
          <li style={tipItem}>
            <strong>Inspect Upon Arrival:</strong> Check your package for any damage before signing
          </li>
          <li style={tipItem}>
            <strong>Contact Carrier:</strong> Use tracking number to arrange alternate delivery if
            needed
          </li>
        </ul>
      </Section>

      <Hr style={divider} />

      {/* Issues */}
      <Section style={issuesBox}>
        <Text style={issuesHeading}>Package Issues?</Text>
        <Text style={issuesText}>
          If your package is delayed, damaged, or you have any concerns:
        </Text>
        <ul style={issuesList}>
          <li style={issueItem}>
            <strong>First 48 hours:</strong> Contact the carrier directly using your tracking number
          </li>
          <li style={issueItem}>
            <strong>After 48 hours:</strong> Contact us at support@gangrunprinting.com or call
            1-877-GANGRUN
          </li>
          <li style={issueItem}>
            <strong>Damaged goods:</strong> Take photos before opening and contact us immediately
          </li>
        </ul>
      </Section>

      {/* Support */}
      <Section style={supportBox}>
        <Text style={supportText}>
          Questions about your shipment?
          <br />
          Contact us at <strong>support@gangrunprinting.com</strong> or call{' '}
          <strong>1-877-GANGRUN</strong>
          <br />
          <br />
          Reference Order: <strong>#{orderNumber}</strong>
        </Text>
      </Section>
    </EmailLayout>
  )
}

// Styles
const successBox = {
  padding: '24px',
  backgroundColor: '#f0fdf4',
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

const trackingBox = {
  padding: '32px 24px',
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
  border: '1px solid #93c5fd',
  textAlign: 'center' as const,
  marginBottom: '24px',
}

const trackingLabel = {
  fontSize: '14px',
  color: '#1e40af',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  fontWeight: '600',
}

const trackingNumberStyle = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#1e3a8a',
  margin: '0 0 12px',
  fontFamily: 'monospace',
}

const carrierText = {
  fontSize: '16px',
  color: '#3b82f6',
  margin: '0 0 20px',
}

const estimatedDeliveryText = {
  fontSize: '15px',
  color: '#1e40af',
  margin: '0 0 24px',
}

const trackButton = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
}

const divider = {
  borderColor: '#e5e5e5',
  margin: '24px 0',
}

const detailRow = {
  marginBottom: '8px',
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

const addressText = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#404040',
  margin: '0',
}

const tipsBox = {
  padding: '20px',
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  border: '1px solid #fcd34d',
}

const tipsHeading = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#92400e',
  margin: '0 0 12px',
}

const tipsList = {
  margin: '0',
  paddingLeft: '20px',
}

const tipItem = {
  fontSize: '14px',
  color: '#78350f',
  marginBottom: '10px',
  lineHeight: '20px',
}

const issuesBox = {
  padding: '20px',
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  border: '1px solid #fecaca',
}

const issuesHeading = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#991b1b',
  margin: '0 0 8px',
}

const issuesText = {
  fontSize: '14px',
  color: '#7f1d1d',
  margin: '0 0 12px',
}

const issuesList = {
  margin: '0',
  paddingLeft: '20px',
}

const issueItem = {
  fontSize: '13px',
  color: '#7f1d1d',
  marginBottom: '8px',
  lineHeight: '18px',
}

const supportBox = {
  padding: '20px',
  backgroundColor: '#f9fafb',
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

export default OrderShippedEmail
