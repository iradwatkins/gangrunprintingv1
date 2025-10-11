/**
 * Base Email Layout for GangRun Printing
 *
 * Provides consistent branding and structure for all emails
 */

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface EmailLayoutProps {
  preview: string
  children: React.ReactNode
}

export const EmailLayout = ({ preview, children }: EmailLayoutProps) => {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              alt="GangRun Printing"
              height="33"
              src="https://gangrunprinting.com/gangrunprinting_logo_new_1448921366__42384-432x65.png"
              style={logo}
              width="216"
            />
          </Section>

          {/* Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} GangRun Printing. All rights reserved.
            </Text>
            <Text style={footerText}>
              <Link href="https://gangrunprinting.com" style={footerLink}>
                gangrunprinting.com
              </Link>
              {' | '}
              <Link href="mailto:support@gangrunprinting.com" style={footerLink}>
                support@gangrunprinting.com
              </Link>
              {' | '}
              <Link href="tel:1-800-PRINTING" style={footerLink}>
                1-800-PRINTING
              </Link>
            </Text>
            <Text style={footerSmall}>
              This is an automated email. Please do not reply directly to this message.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  padding: '32px 24px',
  textAlign: 'center' as const,
  backgroundColor: '#1a1a1a',
}

const logo = {
  margin: '0 auto',
}

const content = {
  padding: '24px',
}

const footer = {
  padding: '24px',
  textAlign: 'center' as const,
  backgroundColor: '#f6f9fc',
}

const footerText = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '8px 0',
}

const footerLink = {
  color: '#556cd6',
  textDecoration: 'underline',
}

const footerSmall = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '16px 0 0',
}

export default EmailLayout
