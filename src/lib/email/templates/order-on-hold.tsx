/**
 * Order On Hold Email
 *
 * Sent when an order is placed on hold and requires customer action
 */

import { Button, Heading, Hr, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './email-layout'

interface OrderOnHoldEmailProps {
  orderNumber: string
  customerName?: string
  holdReason: string
  actionRequired: string
  actionUrl?: string
  urgency?: 'low' | 'medium' | 'high'
  deadline?: string
  contactMethod?: string
}

export const OrderOnHoldEmail = ({
  orderNumber,
  customerName,
  holdReason,
  actionRequired,
  actionUrl,
  urgency = 'medium',
  deadline,
  contactMethod,
}: OrderOnHoldEmailProps) => {
  const urgencyColors = {
    low: { bg: '#fef3c7', border: '#fcd34d', heading: '#92400e', text: '#78350f' },
    medium: { bg: '#fef3c7', border: '#f59e0b', heading: '#92400e', text: '#78350f' },
    high: { bg: '#fef2f2', border: '#f87171', heading: '#dc2626', text: '#991b1b' },
  }

  const colors = urgencyColors[urgency]

  const urgencyLabels = {
    low: '📋',
    medium: '⚠️',
    high: '🚨',
  }

  const urgencyLabel = urgencyLabels[urgency]

  return (
    <EmailLayout preview={`Action Required - Order ${orderNumber} On Hold`}>
      {/* Alert Message */}
      <Section
        style={{ ...alertBox, backgroundColor: colors.bg, border: `2px solid ${colors.border}` }}
      >
        <Heading style={{ ...heading, color: colors.heading }}>
          {urgencyLabel} Action Required: Order On Hold
        </Heading>
        <Text style={{ ...paragraph, color: colors.text }}>
          {customerName ? `Hi ${customerName}, ` : 'Hi, '}
          your order <strong>#{orderNumber}</strong> is currently on hold and requires your
          attention.
        </Text>
        {deadline && (
          <Text style={{ ...deadlineText, color: colors.text }}>
            <strong>⏰ Response needed by: {deadline}</strong>
          </Text>
        )}
      </Section>

      {/* Order Info */}
      <Section style={orderBox}>
        <Text style={orderLabel}>Order Number</Text>
        <Text style={orderValue}>{orderNumber}</Text>
        <Text style={statusText}>Status: ON HOLD</Text>
      </Section>

      <Hr style={divider} />

      {/* Why On Hold */}
      <Section>
        <Heading as="h2" style={subheading}>
          Why is My Order On Hold?
        </Heading>
        <Text style={reasonText}>{holdReason}</Text>
      </Section>

      <Hr style={divider} />

      {/* What You Need to Do */}
      <Section style={actionBox}>
        <Heading as="h3" style={actionHeading}>
          What You Need to Do
        </Heading>
        <Text style={actionText}>{actionRequired}</Text>
        {actionUrl && (
          <Button href={actionUrl} style={actionButton}>
            Take Action Now
          </Button>
        )}
        {contactMethod && (
          <Text style={contactText}>
            <strong>Preferred Contact Method:</strong> {contactMethod}
          </Text>
        )}
      </Section>

      <Hr style={divider} />

      {/* Common Hold Reasons */}
      <Section>
        <Heading as="h2" style={subheading}>
          Common Hold Reasons & Solutions
        </Heading>
        <Section style={reasonItemBox}>
          <Text style={reasonItemHeading}>📄 File Issues</Text>
          <Text style={reasonItemText}>
            • Low resolution images → Upload high-resolution files (300 DPI minimum)
            <br />
            • Wrong file format → Convert to PDF, AI, or high-res PNG/JPG
            <br />• Missing bleed areas → Add 0.125" bleed to all sides
          </Text>
        </Section>
        <Section style={reasonItemBox}>
          <Text style={reasonItemHeading}>💳 Payment Issues</Text>
          <Text style={reasonItemText}>
            • Payment declined → Update payment method
            <br />
            • Billing address mismatch → Verify billing information
            <br />• Insufficient funds → Use different payment method
          </Text>
        </Section>
        <Section style={reasonItemBox}>
          <Text style={reasonItemHeading}>📋 Missing Information</Text>
          <Text style={reasonItemText}>
            • Incomplete address → Provide full shipping details
            <br />
            • Custom specifications unclear → Clarify your requirements
            <br />• Proof approval needed → Review and approve artwork
          </Text>
        </Section>
      </Section>

      <Hr style={divider} />

      {/* Urgency Notice */}
      {(urgency === 'high' || deadline) && (
        <>
          <Section style={urgencyBox}>
            <Text style={urgencyHeading}>⏰ Time-Sensitive</Text>
            <Text style={urgencyText}>
              {deadline
                ? `Please respond by ${deadline} to avoid order cancellation or delays.`
                : 'Please respond as soon as possible to keep your order on schedule.'}
            </Text>
            <Text style={urgencyNote}>
              If we don't hear from you within the deadline, your order may be automatically
              cancelled and refunded.
            </Text>
          </Section>
          <Hr style={divider} />
        </>
      )}

      {/* Need Help */}
      <Section style={helpBox}>
        <Heading as="h3" style={helpHeading}>
          Need Help?
        </Heading>
        <Text style={helpText}>
          Our team is standing by to assist you with any questions or concerns.
        </Text>
        <ul style={helpList}>
          <li style={helpItem}>
            📧 <strong>Email:</strong> support@gangrunprinting.com (fastest response)
          </li>
          <li style={helpItem}>
            📞 <strong>Phone:</strong> 1-877-GANGRUN (Mon-Fri, 8am-6pm CST)
          </li>
          <li style={helpItem}>
            💬 <strong>Live Chat:</strong> Available on our website during business hours
          </li>
        </ul>
        <Text style={helpNote}>
          Please reference order <strong>#{orderNumber}</strong> when contacting us.
        </Text>
      </Section>

      {/* Support */}
      <Section style={supportBox}>
        <Text style={supportText}>
          We're committed to getting your order back on track.
          <br />
          Reply to this email or call us at <strong>1-877-GANGRUN</strong>
        </Text>
      </Section>
    </EmailLayout>
  )
}

// Styles
const alertBox = {
  padding: '24px',
  borderRadius: '8px',
  marginBottom: '24px',
  textAlign: 'center' as const,
}

const heading = {
  fontSize: '26px',
  fontWeight: 'bold',
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
  margin: '0 0 12px',
}

const deadlineText = {
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '8px 0 0',
}

const orderBox = {
  padding: '24px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  textAlign: 'center' as const,
  marginBottom: '24px',
  border: '1px solid #e5e7eb',
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
  margin: '0 0 12px',
}

const statusText = {
  fontSize: '14px',
  color: '#f59e0b',
  fontWeight: 'bold',
  margin: '0',
}

const divider = {
  borderColor: '#e5e5e5',
  margin: '24px 0',
}

const reasonText = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#525252',
  padding: '16px',
  backgroundColor: '#fef3c7',
  borderRadius: '6px',
  border: '1px solid #fcd34d',
  margin: '0',
}

const actionBox = {
  padding: '24px',
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
  border: '2px solid #3b82f6',
  textAlign: 'center' as const,
}

const actionHeading = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1e40af',
  margin: '0 0 12px',
}

const actionText = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#1e3a8a',
  margin: '0 0 20px',
}

const actionButton = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  marginBottom: '12px',
}

const contactText = {
  fontSize: '14px',
  color: '#1e40af',
  margin: '12px 0 0',
}

const reasonItemBox = {
  marginBottom: '16px',
}

const reasonItemHeading = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 8px',
}

const reasonItemText = {
  fontSize: '14px',
  color: '#525252',
  margin: '0',
  lineHeight: '22px',
}

const urgencyBox = {
  padding: '20px',
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  border: '2px solid #f87171',
}

const urgencyHeading = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#dc2626',
  margin: '0 0 8px',
}

const urgencyText = {
  fontSize: '15px',
  color: '#991b1b',
  margin: '0 0 12px',
  fontWeight: '600',
}

const urgencyNote = {
  fontSize: '13px',
  color: '#7f1d1d',
  margin: '0',
  fontStyle: 'italic',
}

const helpBox = {
  padding: '20px',
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  border: '1px solid #86efac',
}

const helpHeading = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#166534',
  margin: '0 0 8px',
}

const helpText = {
  fontSize: '15px',
  color: '#15803d',
  margin: '0 0 12px',
}

const helpList = {
  margin: '12px 0',
  paddingLeft: '0',
  listStyle: 'none',
}

const helpItem = {
  fontSize: '14px',
  color: '#166534',
  marginBottom: '8px',
  paddingLeft: '8px',
}

const helpNote = {
  fontSize: '13px',
  color: '#15803d',
  margin: '12px 0 0',
  fontStyle: 'italic',
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

export default OrderOnHoldEmail
