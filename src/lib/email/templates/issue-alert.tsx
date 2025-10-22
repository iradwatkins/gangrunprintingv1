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

interface IssueAlertProps {
  orderNumber: string
  customerName: string
  issueType: string
  issueDescription: string
  actionRequired?: string
  supportPhone?: string
  supportEmail?: string
  orderTrackingUrl?: string
}

export const IssueAlert = ({
  orderNumber = 'GRP-12345',
  customerName = 'Valued Customer',
  issueType = 'File Quality',
  issueDescription = 'We need a higher resolution version of your artwork file',
  actionRequired = 'Please upload a new file with at least 300 DPI resolution',
  supportPhone = '(555) 123-4567',
  supportEmail = 'support@gangrunprinting.com',
  orderTrackingUrl = 'https://gangrunprinting.com/track/GRP-12345',
}: IssueAlertProps) => {
  return (
    <EmailLayout preview={`Order ${orderNumber} - Action Required`}>
      <Heading style={heading}>⚠️ Action Required for Your Order</Heading>

      <Text style={text}>Hi {customerName},</Text>

      <Text style={text}>
        We've encountered an issue with your order <strong>#{orderNumber}</strong> that requires
        your attention.
      </Text>

      <Section style={alertBox}>
        <Heading as="h2" style={alertHeading}>
          Issue Details
        </Heading>
        <Text style={alertText}>
          <strong>Type:</strong> {issueType}
        </Text>
        <Text style={alertText}>
          <strong>Description:</strong> {issueDescription}
        </Text>
        {actionRequired && (
          <Text style={actionBox}>
            <strong>Action Required:</strong> {actionRequired}
          </Text>
        )}
      </Section>

      <Text style={text}>
        Don't worry - this is a common issue and we're here to help you resolve it quickly. Your
        order is on hold until we receive the necessary information or files from you.
      </Text>

      {orderTrackingUrl && (
        <Section style={buttonContainer}>
          <Button style={button} href={orderTrackingUrl}>
            View Order Details
          </Button>
        </Section>
      )}

      <Hr style={hr} />

      <Section style={contactBox}>
        <Heading as="h3" style={contactHeading}>
          Need Help?
        </Heading>
        <Text style={contactText}>Our support team is ready to assist you:</Text>
        <Text style={contactText}>
          📧 Email: {supportEmail}
          <br />
          📞 Phone: {supportPhone}
        </Text>
      </Section>

      <Text style={footer}>
        We'll resolve this as quickly as possible once we hear back from you. Thank you for your
        prompt attention to this matter.
        <br />
        <br />
        Best regards,
        <br />
        The GangRun Printing Team
      </Text>
    </EmailLayout>
  )
}

export default IssueAlert

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
  background: '#FEE2E2',
  border: '2px solid #DC2626',
  borderRadius: '8px',
  padding: '24px',
  marginTop: '24px',
  marginBottom: '24px',
}

const alertHeading = {
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
  color: '#991B1B',
}

const alertText = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#7F1D1D',
  marginBottom: '8px',
}

const actionBox = {
  background: '#FFFFFF',
  padding: '16px',
  borderRadius: '6px',
  border: '1px solid #FCA5A5',
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#991B1B',
  marginTop: '16px',
  fontWeight: 'bold' as const,
}

const buttonContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
  marginBottom: '32px',
}

const button = {
  backgroundColor: '#DC2626',
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

const contactBox = {
  background: '#F3F4F6',
  borderRadius: '8px',
  padding: '20px',
  marginTop: '24px',
}

const contactHeading = {
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
  color: '#111827',
}

const contactText = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#374151',
  marginBottom: '8px',
}

const footer = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#6B7280',
  marginTop: '24px',
}
