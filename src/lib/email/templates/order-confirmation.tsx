/**
 * Order Confirmation Email
 *
 * Sent immediately after payment is received
 */

import {
  Button,
  Column,
  Heading,
  Hr,
  Row,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './email-layout'

interface OrderItem {
  productName: string
  quantity: number
  price: number
  options?: Record<string, string>
}

interface OrderConfirmationEmailProps {
  orderNumber: string
  customerName?: string
  items: OrderItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  shippingAddress: {
    name: string
    street: string
    city: string
    state: string
    zipCode: string
  }
  estimatedDelivery?: string
  trackingUrl: string
}

export const OrderConfirmationEmail = ({
  orderNumber,
  customerName,
  items,
  subtotal,
  tax,
  shipping,
  total,
  shippingAddress,
  estimatedDelivery,
  trackingUrl,
}: OrderConfirmationEmailProps) => {
  return (
    <EmailLayout preview={`Order Confirmed - ${orderNumber}`}>
      {/* Success Message */}
      <Section style={messageBox}>
        <Heading style={heading}>Order Confirmed! 🎉</Heading>
        <Text style={paragraph}>
          Thank you{customerName ? `, ${customerName}` : ''} for your order!
        </Text>
        <Text style={paragraph}>
          Your payment has been received and we're reviewing your files now. We'll have your order
          to our print partner within 24 hours.
        </Text>
      </Section>

      {/* Order Number */}
      <Section style={orderInfoBox}>
        <Text style={orderNumberLabel}>Order Number</Text>
        <Text style={orderNumberValue}>{orderNumber}</Text>
        <Button href={trackingUrl} style={button}>
          Track Your Order
        </Button>
      </Section>

      <Hr style={divider} />

      {/* Order Items */}
      <Section>
        <Heading as="h2" style={subheading}>
          Order Summary
        </Heading>
        {items.map((item, index) => (
          <Row key={index} style={itemRow}>
            <Column style={itemName}>
              <Text style={itemText}>
                <strong>{item.productName}</strong>
              </Text>
              {item.options && (
                <Text style={itemOptions}>
                  {Object.entries(item.options)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ')}
                </Text>
              )}
            </Column>
            <Column style={itemQty}>
              <Text style={itemText}>Qty: {item.quantity}</Text>
            </Column>
            <Column style={itemPrice}>
              <Text style={itemText}>${(item.price / 100).toFixed(2)}</Text>
            </Column>
          </Row>
        ))}
      </Section>

      <Hr style={divider} />

      {/* Order Totals */}
      <Section>
        <Row style={totalRow}>
          <Column>
            <Text style={totalLabel}>Subtotal:</Text>
          </Column>
          <Column align="right">
            <Text style={totalValue}>${(subtotal / 100).toFixed(2)}</Text>
          </Column>
        </Row>
        <Row style={totalRow}>
          <Column>
            <Text style={totalLabel}>Tax:</Text>
          </Column>
          <Column align="right">
            <Text style={totalValue}>${(tax / 100).toFixed(2)}</Text>
          </Column>
        </Row>
        <Row style={totalRow}>
          <Column>
            <Text style={totalLabel}>Shipping:</Text>
          </Column>
          <Column align="right">
            <Text style={totalValue}>${(shipping / 100).toFixed(2)}</Text>
          </Column>
        </Row>
        <Hr style={divider} />
        <Row style={totalRow}>
          <Column>
            <Text style={totalLabelBold}>Total:</Text>
          </Column>
          <Column align="right">
            <Text style={totalValueBold}>${(total / 100).toFixed(2)}</Text>
          </Column>
        </Row>
      </Section>

      <Hr style={divider} />

      {/* Shipping Address */}
      <Section>
        <Heading as="h2" style={subheading}>
          Shipping Address
        </Heading>
        <Text style={addressText}>
          {shippingAddress.name}
          <br />
          {shippingAddress.street}
          <br />
          {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
        </Text>
        {estimatedDelivery && (
          <Text style={estimatedDeliveryText}>
            <strong>Estimated Delivery:</strong> {estimatedDelivery}
          </Text>
        )}
      </Section>

      <Hr style={divider} />

      {/* What's Next */}
      <Section>
        <Heading as="h2" style={subheading}>
          What Happens Next?
        </Heading>
        <Text style={paragraph}>
          <strong>1. File Review</strong> (within 2 hours)
          <br />
          Our team will review your uploaded files to ensure they're print-ready.
        </Text>
        <Text style={paragraph}>
          <strong>2. Production</strong> (same business day)
          <br />
          Once approved, we'll send your order to our trusted print partner.
        </Text>
        <Text style={paragraph}>
          <strong>3. Printing</strong> (3-5 business days)
          <br />
          Your order will be printed with premium quality materials.
        </Text>
        <Text style={paragraph}>
          <strong>4. Shipping</strong>
          <br />
          You'll receive tracking information as soon as your order ships!
        </Text>
      </Section>

      {/* Support */}
      <Section style={supportBox}>
        <Text style={supportText}>
          Questions about your order?
          <br />
          Reply to this email or call us at <strong>1-800-PRINTING</strong>
        </Text>
      </Section>
    </EmailLayout>
  )
}

// Styles
const messageBox = {
  padding: '24px',
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  border: '1px solid #86efac',
  marginBottom: '24px',
}

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#1a1a1a',
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

const orderInfoBox = {
  padding: '24px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  textAlign: 'center' as const,
  marginBottom: '24px',
}

const orderNumberLabel = {
  fontSize: '14px',
  color: '#737373',
  margin: '0 0 8px',
}

const orderNumberValue = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 16px',
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
  padding: '12px 24px',
}

const divider = {
  borderColor: '#e5e5e5',
  margin: '24px 0',
}

const itemRow = {
  marginBottom: '12px',
}

const itemName = {
  width: '60%',
}

const itemQty = {
  width: '20%',
}

const itemPrice = {
  width: '20%',
  textAlign: 'right' as const,
}

const itemText = {
  fontSize: '14px',
  color: '#404040',
  margin: '0',
}

const itemOptions = {
  fontSize: '12px',
  color: '#737373',
  margin: '4px 0 0',
}

const totalRow = {
  marginBottom: '8px',
}

const totalLabel = {
  fontSize: '14px',
  color: '#525252',
  margin: '0',
}

const totalValue = {
  fontSize: '14px',
  color: '#525252',
  margin: '0',
}

const totalLabelBold = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0',
}

const totalValueBold = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#16a34a',
  margin: '0',
}

const addressText = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#404040',
  margin: '0',
}

const estimatedDeliveryText = {
  fontSize: '14px',
  color: '#0070f3',
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

export default OrderConfirmationEmail
