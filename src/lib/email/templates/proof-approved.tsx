/**
 * Proof Approved Email Template
 * Sent to admin when customer approves a proof
 */

import { Button, Heading, Hr, Link, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './email-layout'

interface ProofApprovedEmailProps {
  orderNumber: string
  customerName: string
  customerEmail: string
  proofLabel: string
  customerMessage?: string
  orderUrl: string
  allProofsApproved: boolean
}

export const ProofApprovedEmail = ({
  orderNumber,
  customerName,
  customerEmail,
  proofLabel,
  customerMessage,
  orderUrl,
  allProofsApproved,
}: ProofApprovedEmailProps) => {
  return (
    <EmailLayout preview={`Proof approved for Order ${orderNumber}`}>
      {/* Hero Banner */}
      <Section style={allProofsApproved ? heroBannerSuccess : heroBannerInfo}>
        <Heading style={heroHeading}>
          {allProofsApproved ? '✅ All Proofs Approved!' : '✓ Proof Approved'}
        </Heading>
        <Text style={heroSubtext}>Order #{orderNumber}</Text>
      </Section>

      {/* Main Content */}
      <Section style={mainSection}>
        <Text style={greeting}>Production Team,</Text>

        <Text style={paragraph}>{customerName} has approved the following proof:</Text>

        {/* Proof Details */}
        <Section style={proofBox}>
          <Text style={proofLabel}>
            <strong>Proof File:</strong> {proofLabel}
          </Text>
          <Text style={proofLabel}>
            <strong>Customer:</strong> {customerName} ({customerEmail})
          </Text>
          {customerMessage && (
            <Text style={customerMessageBox}>
              <strong>Customer message:</strong>
              <br />
              {customerMessage}
            </Text>
          )}
        </Section>

        {/* All Proofs Approved Alert */}
        {allProofsApproved && (
          <Section style={successBox}>
            <Text style={successHeading}>🎉 Ready for Production</Text>
            <Text style={successText}>
              All proofs for this order have been approved. The order is now ready to begin
              production.
            </Text>
          </Section>
        )}

        {/* Action Button */}
        <Section style={buttonContainer}>
          <Button href={orderUrl} style={primaryButton}>
            View Order in Admin
          </Button>
        </Section>

        <Hr style={divider} />

        <Text style={footerNote}>
          <strong>Next Steps:</strong>
        </Text>
        <ul style={actionList}>
          {allProofsApproved ? (
            <>
              <li>Assign vendor for production</li>
              <li>Update order status to "IN_PRODUCTION"</li>
              <li>Notify customer when printing begins</li>
            </>
          ) : (
            <>
              <li>Continue waiting for remaining proof approvals</li>
              <li>Check order page for status updates</li>
            </>
          )}
        </ul>
      </Section>
    </EmailLayout>
  )
}

// Styles
const heroBannerSuccess = {
  backgroundColor: '#10b981',
  padding: '32px 24px',
  borderRadius: '8px',
  textAlign: 'center' as const,
  marginBottom: '24px',
}

const heroBannerInfo = {
  backgroundColor: '#3b82f6',
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
  color: '#ffffff',
  opacity: 0.9,
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

const customerMessageBox = {
  fontSize: '14px',
  margin: '16px 0 0',
  color: '#4b5563',
  backgroundColor: '#e0e7ff',
  padding: '12px',
  borderRadius: '6px',
}

const successBox = {
  backgroundColor: '#d1fae5',
  padding: '20px',
  borderRadius: '8px',
  border: '2px solid #10b981',
  marginBottom: '24px',
}

const successHeading = {
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 12px',
  color: '#065f46',
}

const successText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#047857',
  margin: '0',
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
  margin: '8px 0',
}

export default ProofApprovedEmail
