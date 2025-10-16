/**
 * Proof Ready for Review Email Template
 * Sent to customer when admin uploads a proof file
 */

import {
  Button,
  Heading,
  Hr,
  Link,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './email-layout';

interface ProofReadyEmailProps {
  customerName?: string;
  orderNumber: string;
  proofLabel: string;
  proofUrl: string;
  trackingUrl: string;
  adminMessage?: string;
}

export const ProofReadyEmail = ({
  customerName,
  orderNumber,
  proofLabel,
  proofUrl,
  trackingUrl,
  adminMessage,
}: ProofReadyEmailProps) => {
  return (
    <EmailLayout preview={`Your proof is ready for approval - Order ${orderNumber}`}>
      {/* Hero Banner */}
      <Section style={heroBanner}>
        <Heading style={heroHeading}>📄 Your Proof is Ready!</Heading>
        <Text style={heroSubtext}>Order #{orderNumber}</Text>
      </Section>

      {/* Main Content */}
      <Section style={mainSection}>
        <Text style={greeting}>
          {customerName ? `Hi ${customerName}` : 'Hello'},
        </Text>

        <Text style={paragraph}>
          Great news! Your proof is ready for review. Please take a moment to check it carefully
          before we proceed with production.
        </Text>

        {/* Proof Details */}
        <Section style={proofBox}>
          <Text style={proofLabel}>
            <strong>Proof File:</strong> {proofLabel}
          </Text>
          {adminMessage && (
            <Text style={proofMessage}>
              <strong>Message from our team:</strong><br />
              {adminMessage}
            </Text>
          )}
        </Section>

        {/* Action Buttons */}
        <Section style={buttonContainer}>
          <Button href={trackingUrl} style={primaryButton}>
            Review & Approve Proof
          </Button>
        </Section>

        <Hr style={divider} />

        {/* Important Info */}
        <Section style={infoBox}>
          <Text style={infoHeading}>⚠️ Important</Text>
          <Text style={infoText}>
            Please review your proof carefully and check for:
          </Text>
          <ul style={infoList}>
            <li>Spelling and grammar</li>
            <li>Colors and image quality</li>
            <li>Layout and alignment</li>
            <li>Contact information accuracy</li>
          </ul>
          <Text style={infoText}>
            We cannot be held responsible for errors that are approved in the proof.
          </Text>
        </Section>

        <Hr style={divider} />

        <Text style={footerNote}>
          <strong>Need changes?</strong> No problem! Just reject the proof and let us know what
          needs to be adjusted. We'll create a revised proof for you to review.
        </Text>

        <Text style={footerNote}>
          Questions? Reply to this email or call us at{' '}
          <Link href="tel:1-800-PRINTING" style={link}>
            1-800-PRINTING
          </Link>
        </Text>
      </Section>
    </EmailLayout>
  );
};

// Styles
const heroBanner = {
  backgroundColor: '#3b82f6',
  padding: '32px 24px',
  borderRadius: '8px',
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const heroHeading = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 8px',
};

const heroSubtext = {
  color: '#dbeafe',
  fontSize: '18px',
  margin: '0',
};

const mainSection = {
  padding: '0',
};

const greeting = {
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '16px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#374151',
  marginBottom: '24px',
};

const proofBox = {
  backgroundColor: '#f3f4f6',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '24px',
};

const proofLabel = {
  fontSize: '14px',
  margin: '0 0 12px',
  color: '#1f2937',
};

const proofMessage = {
  fontSize: '14px',
  margin: '12px 0 0',
  color: '#4b5563',
  backgroundColor: '#e5e7eb',
  padding: '12px',
  borderRadius: '6px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const primaryButton = {
  backgroundColor: '#10b981',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const infoBox = {
  backgroundColor: '#fef3c7',
  padding: '20px',
  borderRadius: '8px',
  border: '2px solid #fbbf24',
  marginBottom: '24px',
};

const infoHeading = {
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 12px',
  color: '#92400e',
};

const infoText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#78350f',
  margin: '0 0 8px',
};

const infoList = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#78350f',
  paddingLeft: '20px',
  margin: '8px 0',
};

const footerNote = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#6b7280',
  marginBottom: '12px',
};

const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
};

export default ProofReadyEmail;
