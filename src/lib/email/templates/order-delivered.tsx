/**
 * Order Delivered Email
 *
 * Sent when an order has been successfully delivered
 */

import { Button, Heading, Hr, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './email-layout'

interface OrderDeliveredEmailProps {
  orderNumber: string
  customerName?: string
  deliveredAt: string
  trackingNumber?: string
  reviewUrl?: string
  reorderUrl?: string
}

export const OrderDeliveredEmail = ({
  orderNumber,
  customerName,
  deliveredAt,
  trackingNumber,
  reviewUrl,
  reorderUrl,
}: OrderDeliveredEmailProps) => {
  return (
    <EmailLayout preview={`Your Order Has Been Delivered - ${orderNumber}`}>
      {/* Success Message */}
      <Section style={successBox}>
        <Heading style={heading}>✅ Order Delivered!</Heading>
        <Text style={paragraph}>
          {customerName ? `Hi ${customerName}, ` : 'Hi, '}
          great news! Your order has been successfully delivered.
        </Text>
      </Section>

      {/* Delivery Details */}
      <Section style={deliveryBox}>
        <Text style={deliveryLabel}>Delivered On</Text>
        <Text style={deliveryValue}>{deliveredAt}</Text>
        <Text style={orderNumberText}>Order #{orderNumber}</Text>
        {trackingNumber && <Text style={trackingText}>Tracking: {trackingNumber}</Text>}
      </Section>

      <Hr style={divider} />

      {/* Quality Check */}
      <Section>
        <Heading as="h2" style={subheading}>
          Please Inspect Your Order
        </Heading>
        <Text style={paragraph}>
          We take pride in our print quality. Please inspect your order carefully:
        </Text>
        <ul style={checkList}>
          <li style={checkItem}>✓ Check for any damage during shipping</li>
          <li style={checkItem}>✓ Verify colors and print quality</li>
          <li style={checkItem}>✓ Confirm quantity and specifications</li>
        </ul>
        <Text style={paragraph}>
          <strong>Found an issue?</strong> Contact us within 48 hours for the fastest resolution.
        </Text>
      </Section>

      <Hr style={divider} />

      {/* Feedback Request */}
      {reviewUrl && (
        <>
          <Section style={reviewBox}>
            <Heading as="h3" style={reviewHeading}>
              Love Your Prints? Share Your Experience!
            </Heading>
            <Text style={reviewText}>
              Your feedback helps us improve and helps other customers make informed decisions.
            </Text>
            <Button href={reviewUrl} style={reviewButton}>
              Leave a Review
            </Button>
          </Section>
          <Hr style={divider} />
        </>
      )}

      {/* Reorder CTA */}
      {reorderUrl && (
        <Section style={reorderBox}>
          <Text style={reorderHeading}>Need More?</Text>
          <Text style={reorderText}>
            Reorder the same design with just one click – we've saved all your specifications!
          </Text>
          <Button href={reorderUrl} style={reorderButton}>
            Reorder Now
          </Button>
        </Section>
      )}

      {/* Support */}
      <Section style={supportBox}>
        <Text style={supportText}>
          <strong>Questions or Issues?</strong>
          <br />
          We're here to help! Contact us at:
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
          Thank you for choosing GangRun Printing! 🎉
          <br />
          We appreciate your business and look forward to serving you again.
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
  border: '2px solid #22c55e',
  marginBottom: '24px',
  textAlign: 'center' as const,
}

const heading = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#15803d',
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

const deliveryBox = {
  padding: '32px 24px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  textAlign: 'center' as const,
  marginBottom: '24px',
}

const deliveryLabel = {
  fontSize: '14px',
  color: '#737373',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  fontWeight: '600',
}

const deliveryValue = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#15803d',
  margin: '0 0 16px',
}

const orderNumberText = {
  fontSize: '16px',
  color: '#404040',
  margin: '0 0 8px',
}

const trackingText = {
  fontSize: '13px',
  color: '#737373',
  margin: '0',
  fontFamily: 'monospace',
}

const divider = {
  borderColor: '#e5e5e5',
  margin: '24px 0',
}

const checkList = {
  margin: '16px 0',
  paddingLeft: '0',
  listStyle: 'none',
}

const checkItem = {
  fontSize: '15px',
  color: '#525252',
  marginBottom: '10px',
  paddingLeft: '8px',
}

const reviewBox = {
  padding: '24px',
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  border: '1px solid #fcd34d',
  textAlign: 'center' as const,
}

const reviewHeading = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#92400e',
  margin: '0 0 12px',
}

const reviewText = {
  fontSize: '15px',
  color: '#78350f',
  margin: '0 0 20px',
}

const reviewButton = {
  backgroundColor: '#f59e0b',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 28px',
}

const reorderBox = {
  padding: '24px',
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
  border: '1px solid #93c5fd',
  textAlign: 'center' as const,
  marginBottom: '24px',
}

const reorderHeading = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1e40af',
  margin: '0 0 8px',
}

const reorderText = {
  fontSize: '15px',
  color: '#1e3a8a',
  margin: '0 0 20px',
}

const reorderButton = {
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
  fontSize: '16px',
  lineHeight: '24px',
  color: '#166534',
  margin: '0',
  fontWeight: '500',
}

export default OrderDeliveredEmail
