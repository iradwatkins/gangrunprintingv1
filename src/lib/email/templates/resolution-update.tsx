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

interface ResolutionUpdateProps {
  orderNumber: string
  customerName: string
  issueType: string
  resolutionDescription: string
  nextSteps: string
  newEstimatedDate?: string
  orderTrackingUrl?: string
}

export const ResolutionUpdate = ({
  orderNumber = 'GRP-12345',
  customerName = 'Valued Customer',
  issueType = 'File Quality',
  resolutionDescription = 'We received your updated file and it looks perfect!',
  nextSteps = 'Your order is now back in production and will ship on schedule',
  newEstimatedDate,
  orderTrackingUrl = 'https://gangrunprinting.com/track/GRP-12345',
}: ResolutionUpdateProps) => {
  return (
    <EmailLayout preview={`Order ${orderNumber} - Issue Resolved`}>
      <Heading style={heading}>✅ Issue Resolved - Order Back on Track</Heading>

      <Text style={text}>Hi {customerName},</Text>

      <Text style={text}>
        Great news! We've resolved the issue with your order <strong>#{orderNumber}</strong> and
        everything is back on track.
      </Text>

      <Section style={successBox}>
        <Heading as="h2" style={successHeading}>
          ✓ Resolution Details
        </Heading>
        <Text style={successText}>
          <strong>Issue:</strong> {issueType}
        </Text>
        <Text style={successText}>
          <strong>Resolution:</strong> {resolutionDescription}
        </Text>
        <Text style={successText}>
          <strong>Next Steps:</strong> {nextSteps}
        </Text>
        {newEstimatedDate && (
          <Text style={estimateBox}>
            <strong>Updated Delivery Estimate:</strong> {newEstimatedDate}
          </Text>
        )}
      </Section>

      <Text style={text}>
        Thank you for your patience and cooperation in resolving this issue. Your order is now
        moving forward and we'll keep you updated on its progress.
      </Text>

      {orderTrackingUrl && (
        <Section style={buttonContainer}>
          <Button style={button} href={orderTrackingUrl}>
            Track Your Order
          </Button>
        </Section>
      )}

      <Hr style={hr} />

      <Text style={footer}>
        We appreciate your business and look forward to delivering your high-quality printed
        materials!
        <br />
        <br />
        Best regards,
        <br />
        The GangRun Printing Team
      </Text>
    </EmailLayout>
  )
}

export default ResolutionUpdate

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

const successBox = {
  background: '#D1FAE5',
  border: '2px solid #10B981',
  borderRadius: '8px',
  padding: '24px',
  marginTop: '24px',
  marginBottom: '24px',
}

const successHeading = {
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
  color: '#065F46',
}

const successText = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#064E3B',
  marginBottom: '8px',
}

const estimateBox = {
  background: '#FFFFFF',
  padding: '16px',
  borderRadius: '6px',
  border: '1px solid #6EE7B7',
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#065F46',
  marginTop: '16px',
  fontWeight: 'bold' as const,
}

const buttonContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
  marginBottom: '32px',
}

const button = {
  backgroundColor: '#10B981',
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
