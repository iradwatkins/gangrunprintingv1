/**
 * Customer Artwork Uploaded Email Template
 * Sent to admin when customer uploads design files
 */

import {
  Button,
  Heading,
  Hr,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './email-layout';

interface ArtworkUploadedEmailProps {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  fileCount: number;
  fileNames: string[];
  orderUrl: string;
}

export const ArtworkUploadedEmail = ({
  orderNumber,
  customerName,
  customerEmail,
  fileCount,
  fileNames,
  orderUrl,
}: ArtworkUploadedEmailProps) => {
  return (
    <EmailLayout preview={`New artwork uploaded for Order ${orderNumber}`}>
      {/* Hero Banner */}
      <Section style={heroBanner}>
        <Heading style={heroHeading}>🎨 New Artwork Uploaded</Heading>
        <Text style={heroSubtext}>Order #{orderNumber}</Text>
      </Section>

      {/* Main Content */}
      <Section style={mainSection}>
        <Text style={greeting}>Production Team,</Text>

        <Text style={paragraph}>
          {customerName} has uploaded {fileCount} design file{fileCount !== 1 ? 's' : ''} for
          their order:
        </Text>

        {/* Customer Info */}
        <Section style={customerBox}>
          <Text style={customerLabel}>
            <strong>Customer:</strong> {customerName}
          </Text>
          <Text style={customerLabel}>
            <strong>Email:</strong> {customerEmail}
          </Text>
          <Text style={customerLabel}>
            <strong>Order:</strong> #{orderNumber}
          </Text>
        </Section>

        {/* Uploaded Files */}
        <Section style={filesBox}>
          <Text style={filesHeading}>📁 Uploaded Files:</Text>
          <ul style={filesList}>
            {fileNames.map((fileName, index) => (
              <li key={index} style={filesListItem}>
                {fileName}
              </li>
            ))}
          </ul>
        </Section>

        {/* Action Button */}
        <Section style={buttonContainer}>
          <Button href={orderUrl} style={primaryButton}>
            Review Files & Create Proof
          </Button>
        </Section>

        <Hr style={divider} />

        <Text style={footerNote}>
          <strong>Next Steps:</strong>
        </Text>
        <ul style={actionList}>
          <li>Download and review all customer artwork files</li>
          <li>Check file quality, resolution, and design elements</li>
          <li>Create a proof for customer approval</li>
          <li>Upload the proof and notify the customer</li>
        </ul>

        <Section style={tipBox}>
          <Text style={tipHeading}>⚠️ Important</Text>
          <Text style={tipText}>
            Please review the files promptly so we can get the proof to the customer for
            approval. Fast turnaround time keeps customers happy!
          </Text>
        </Section>
      </Section>
    </EmailLayout>
  );
};

// Styles
const heroBanner = {
  backgroundColor: '#8b5cf6',
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
  color: '#ede9fe',
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
  fontWeight: '600',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#374151',
  marginBottom: '24px',
};

const customerBox = {
  backgroundColor: '#f3f4f6',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '24px',
};

const customerLabel = {
  fontSize: '14px',
  margin: '0 0 8px',
  color: '#1f2937',
};

const filesBox = {
  backgroundColor: '#ede9fe',
  padding: '20px',
  borderRadius: '8px',
  border: '2px solid #8b5cf6',
  marginBottom: '24px',
};

const filesHeading = {
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 12px',
  color: '#5b21b6',
};

const filesList = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#6b21a8',
  paddingLeft: '20px',
  margin: '0',
};

const filesListItem = {
  marginBottom: '4px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

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
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const footerNote = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#374151',
  marginBottom: '12px',
  fontWeight: '600',
};

const actionList = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#6b7280',
  paddingLeft: '20px',
  margin: '8px 0 24px',
};

const tipBox = {
  backgroundColor: '#fee2e2',
  padding: '16px',
  borderRadius: '8px',
  borderLeft: '4px solid #ef4444',
};

const tipHeading = {
  fontSize: '14px',
  fontWeight: '700',
  margin: '0 0 8px',
  color: '#991b1b',
};

const tipText = {
  fontSize: '13px',
  lineHeight: '20px',
  color: '#7f1d1d',
  margin: '0',
};

export default ArtworkUploadedEmail;
