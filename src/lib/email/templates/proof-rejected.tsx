/**
 * Proof Rejected Email Template
 * Sent to admin when customer requests changes to a proof
 */

import { Button, Heading, Hr, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './email-layout'

interface ProofRejectedEmailProps {
  orderNumber: string
  customerName: string
  customerEmail: string
  proofLabel: string
  changeRequested: string
  orderUrl: string
}

export const ProofRejectedEmail = ({
  orderNumber,
  customerName,
  customerEmail,
  proofLabel,
  changeRequested,
  orderUrl,
}: ProofRejectedEmailProps) => {
  return (
    <EmailLayout preview={`Changes requested for Order ${orderNumber}`}>
      {/* Hero Banner */}
      <Section style={heroBanner}>
        <Heading style={heroHeading}>🔄 Changes Requested</Heading>
        <Text style={heroSubtext}>Order #{orderNumber}</Text>
      </Section>

      {/* Main Content */}
      <Section style={mainSection}>
        <Text style={greeting}>Design Team,</Text>

        <Text style={paragraph}>{customerName} has reviewed the proof and requested changes:</Text>

        {/* Proof Details */}
        <Section style={proofBox}>
          <Text style={proofLabel}>
            <strong>Proof File:</strong> {proofLabel}
          </Text>
          <Text style={proofLabel}>
            <strong>Customer:</strong> {customerName} ({customerEmail})
          </Text>
        </Section>

        {/* Customer Changes */}
        <Section style={changesBox}>
          <Text style={changesHeading}>📝 Requested Changes:</Text>
          <Text style={changesText}>{changeRequested}</Text>
        </Section>

        {/* Action Button */}
        <Section style={buttonContainer}>
          <Button href={orderUrl} style={primaryButton}>
            View Order & Create Revised Proof
          </Button>
        </Section>

        <Hr style={divider} />

        <Text style={footerNote}>
          <strong>Next Steps:</strong>
        </Text>
        <ul style={actionList}>
          <li>Review the customer's change requests carefully</li>
          <li>Make the necessary design revisions</li>
          <li>Upload a new proof file for customer approval</li>
          <li>Add a message explaining what was changed</li>
        </ul>

        <Section style={tipBox}>
          <Text style={tipHeading}>💡 Tip</Text>
          <Text style={tipText}>
            When uploading the revised proof, clearly mention what changes were made so the customer
            can easily verify their requests were addressed.
          </Text>
        </Section>
      </Section>
    </EmailLayout>
  )
}

// Styles
const heroBanner = {
  backgroundColor: '#f59e0b',
  padding: '32px 24px',
  borderRadius: '8px',
  textAlign: 'center' as const,
  marginBottom: '24px',
}

const heroHeading = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 8px',
}

const heroSubtext = {
  color: '#fef3c7',
  fontSize: '18px',
  margin: '0',
}

const mainSection = {
  padding: '0',
}

const greeting = {
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '16px',
  fontWeight: '600',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#374151',
  marginBottom: '24px',
}

const proofBox = {
  backgroundColor: '#f3f4f6',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '24px',
}

const proofLabel = {
  fontSize: '14px',
  margin: '0 0 8px',
  color: '#1f2937',
}

const changesBox = {
  backgroundColor: '#fef3c7',
  padding: '20px',
  borderRadius: '8px',
  border: '2px solid #f59e0b',
  marginBottom: '24px',
}

const changesHeading = {
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 12px',
  color: '#92400e',
}

const changesText = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#78350f',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
}

const buttonContainer = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const primaryButton = {
  backgroundColor: '#1f2937',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
}

const footerNote = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#374151',
  marginBottom: '12px',
  fontWeight: '600',
}

const actionList = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#6b7280',
  paddingLeft: '20px',
  margin: '8px 0 24px',
}

const tipBox = {
  backgroundColor: '#dbeafe',
  padding: '16px',
  borderRadius: '8px',
  borderLeft: '4px solid #3b82f6',
}

const tipHeading = {
  fontSize: '14px',
  fontWeight: '700',
  margin: '0 0 8px',
  color: '#1e40af',
}

const tipText = {
  fontSize: '13px',
  lineHeight: '20px',
  color: '#1e3a8a',
  margin: '0',
}

export default ProofRejectedEmail
