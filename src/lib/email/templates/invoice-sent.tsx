/**
 * Invoice Sent Email
 *
 * Sent when an admin creates an order and sends an invoice for payment
 */

import { Button, Column, Heading, Hr, Row, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './email-layout'

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface InvoiceSentEmailProps {
  invoiceNumber: string
  orderNumber?: string
  customerName?: string
  invoiceDate: string
  dueDate: string
  subtotal: number
  tax: number
  shipping: number
  total: number
  items: InvoiceItem[]
  paymentUrl: string
  notes?: string
  paymentTerms?: string
}

export const InvoiceSentEmail = ({
  invoiceNumber,
  orderNumber,
  customerName,
  invoiceDate,
  dueDate,
  subtotal,
  tax,
  shipping,
  total,
  items,
  paymentUrl,
  notes,
  paymentTerms,
}: InvoiceSentEmailProps) => {
  return (
    <EmailLayout preview={`Invoice ${invoiceNumber} - Payment Due`}>
      {/* Header */}
      <Section style={headerBox}>
        <Heading style={heading}>📄 Invoice Received</Heading>
        <Text style={paragraph}>
          {customerName ? `Hi ${customerName}, ` : 'Hi, '}
          you've received an invoice from GangRun Printing.
        </Text>
      </Section>

      {/* Invoice Details */}
      <Section style={invoiceBox}>
        <Row>
          <Column>
            <Text style={invoiceLabel}>Invoice Number</Text>
            <Text style={invoiceValue}>{invoiceNumber}</Text>
          </Column>
          <Column align="right">
            <Text style={invoiceLabel}>Amount Due</Text>
            <Text style={invoiceTotal}>${(total / 100).toFixed(2)}</Text>
          </Column>
        </Row>
        <Hr style={dividerThin} />
        <Row>
          <Column>
            <Text style={detailLabel}>Invoice Date:</Text>
            <Text style={detailValue}>{invoiceDate}</Text>
          </Column>
          <Column align="right">
            <Text style={detailLabel}>Due Date:</Text>
            <Text style={dueDateValue}>{dueDate}</Text>
          </Column>
        </Row>
        {orderNumber && (
          <Row style={{ marginTop: '12px' }}>
            <Column>
              <Text style={detailLabel}>Order Number:</Text>
              <Text style={detailValue}>{orderNumber}</Text>
            </Column>
          </Row>
        )}
      </Section>

      {/* Pay Now Button */}
      <Section style={ctaSection}>
        <Button href={paymentUrl} style={payButton}>
          Pay Invoice Now
        </Button>
        <Text style={ctaHelperText}>
          Click the button above to securely pay your invoice online.
        </Text>
      </Section>

      <Hr style={divider} />

      {/* Line Items */}
      <Section>
        <Heading as="h2" style={subheading}>
          Invoice Details
        </Heading>
        <table style={itemsTable}>
          <thead>
            <tr style={tableHeaderRow}>
              <th style={tableHeaderCell}>Description</th>
              <th style={tableHeaderCellCenter}>Qty</th>
              <th style={tableHeaderCellRight}>Price</th>
              <th style={tableHeaderCellRight}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} style={tableRow}>
                <td style={tableCell}>{item.description}</td>
                <td style={tableCellCenter}>{item.quantity}</td>
                <td style={tableCellRight}>${(item.unitPrice / 100).toFixed(2)}</td>
                <td style={tableCellRight}>
                  <strong>${(item.total / 100).toFixed(2)}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Hr style={divider} />

      {/* Totals */}
      <Section>
        <Row style={totalRow}>
          <Column>
            <Text style={totalLabel}>Subtotal:</Text>
          </Column>
          <Column align="right">
            <Text style={totalValue}>${(subtotal / 100).toFixed(2)}</Text>
          </Column>
        </Row>
        {tax > 0 && (
          <Row style={totalRow}>
            <Column>
              <Text style={totalLabel}>Tax:</Text>
            </Column>
            <Column align="right">
              <Text style={totalValue}>${(tax / 100).toFixed(2)}</Text>
            </Column>
          </Row>
        )}
        {shipping > 0 && (
          <Row style={totalRow}>
            <Column>
              <Text style={totalLabel}>Shipping:</Text>
            </Column>
            <Column align="right">
              <Text style={totalValue}>${(shipping / 100).toFixed(2)}</Text>
            </Column>
          </Row>
        )}
        <Hr style={dividerThin} />
        <Row style={totalRow}>
          <Column>
            <Text style={grandTotalLabel}>Total Due:</Text>
          </Column>
          <Column align="right">
            <Text style={grandTotalValue}>${(total / 100).toFixed(2)}</Text>
          </Column>
        </Row>
      </Section>

      <Hr style={divider} />

      {/* Payment Terms */}
      {paymentTerms && (
        <>
          <Section style={termsBox}>
            <Text style={termsHeading}>Payment Terms</Text>
            <Text style={termsText}>{paymentTerms}</Text>
          </Section>
          <Hr style={divider} />
        </>
      )}

      {/* Notes */}
      {notes && (
        <>
          <Section style={notesBox}>
            <Text style={notesHeading}>Additional Notes</Text>
            <Text style={notesText}>{notes}</Text>
          </Section>
          <Hr style={divider} />
        </>
      )}

      {/* Payment Methods */}
      <Section style={paymentMethodsBox}>
        <Heading as="h3" style={paymentMethodsHeading}>
          💳 Accepted Payment Methods
        </Heading>
        <Text style={paymentMethodsText}>
          • Credit/Debit Cards (Visa, Mastercard, Amex, Discover)
          <br />
          • Bank Transfer / ACH
          <br />
          • PayPal
          <br />• Other payment options available upon request
        </Text>
      </Section>

      {/* Support */}
      <Section style={supportBox}>
        <Text style={supportText}>
          <strong>Questions About This Invoice?</strong>
          <br />
          <br />
          📧 support@gangrunprinting.com
          <br />
          📞 1-877-GANGRUN
          <br />
          <br />
          Reference Invoice: <strong>{invoiceNumber}</strong>
          {orderNumber && (
            <>
              <br />
              Order: <strong>#{orderNumber}</strong>
            </>
          )}
        </Text>
      </Section>

      {/* Footer Note */}
      <Section style={footerNoteBox}>
        <Text style={footerNoteText}>
          This invoice was created by our team for your custom order. If you didn't request this,
          please contact us immediately.
        </Text>
      </Section>
    </EmailLayout>
  )
}

// Styles
const headerBox = {
  padding: '24px',
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
  border: '1px solid #93c5fd',
  marginBottom: '24px',
  textAlign: 'center' as const,
}

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#1e40af',
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
  margin: '0',
}

const invoiceBox = {
  padding: '24px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  border: '2px solid #e5e7eb',
  marginBottom: '24px',
}

const invoiceLabel = {
  fontSize: '12px',
  color: '#737373',
  margin: '0 0 6px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const invoiceValue = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0',
  fontFamily: 'monospace',
}

const invoiceTotal = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#2563eb',
  margin: '0',
}

const detailLabel = {
  fontSize: '13px',
  color: '#737373',
  margin: '0 0 4px',
}

const detailValue = {
  fontSize: '14px',
  color: '#1a1a1a',
  margin: '0',
}

const dueDateValue = {
  fontSize: '14px',
  color: '#dc2626',
  fontWeight: 'bold',
  margin: '0',
}

const divider = {
  borderColor: '#e5e5e5',
  margin: '24px 0',
}

const dividerThin = {
  borderColor: '#e5e5e5',
  margin: '16px 0',
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '24px 0',
}

const payButton = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '18px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 40px',
}

const ctaHelperText = {
  fontSize: '14px',
  color: '#737373',
  margin: '12px 0 0',
}

const itemsTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  marginBottom: '16px',
}

const tableHeaderRow = {
  backgroundColor: '#f9fafb',
  borderBottom: '2px solid #e5e7eb',
}

const tableHeaderCell = {
  padding: '12px 8px',
  textAlign: 'left' as const,
  fontSize: '13px',
  fontWeight: 'bold',
  color: '#374151',
}

const tableHeaderCellCenter = {
  padding: '12px 8px',
  textAlign: 'center' as const,
  fontSize: '13px',
  fontWeight: 'bold',
  color: '#374151',
}

const tableHeaderCellRight = {
  padding: '12px 8px',
  textAlign: 'right' as const,
  fontSize: '13px',
  fontWeight: 'bold',
  color: '#374151',
}

const tableRow = {
  borderBottom: '1px solid #e5e7eb',
}

const tableCell = {
  padding: '12px 8px',
  fontSize: '14px',
  color: '#1a1a1a',
}

const tableCellCenter = {
  padding: '12px 8px',
  textAlign: 'center' as const,
  fontSize: '14px',
  color: '#1a1a1a',
}

const tableCellRight = {
  padding: '12px 8px',
  textAlign: 'right' as const,
  fontSize: '14px',
  color: '#1a1a1a',
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
  color: '#1a1a1a',
  fontWeight: '500',
  margin: '0',
}

const grandTotalLabel = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0',
}

const grandTotalValue = {
  fontSize: '22px',
  fontWeight: 'bold',
  color: '#2563eb',
  margin: '0',
}

const termsBox = {
  padding: '16px',
  backgroundColor: '#fef3c7',
  borderRadius: '6px',
  border: '1px solid #fcd34d',
}

const termsHeading = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#92400e',
  margin: '0 0 8px',
}

const termsText = {
  fontSize: '14px',
  color: '#78350f',
  margin: '0',
  lineHeight: '20px',
}

const notesBox = {
  padding: '16px',
  backgroundColor: '#f0fdf4',
  borderRadius: '6px',
  border: '1px solid #86efac',
}

const notesHeading = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#166534',
  margin: '0 0 8px',
}

const notesText = {
  fontSize: '14px',
  color: '#15803d',
  margin: '0',
  lineHeight: '20px',
}

const paymentMethodsBox = {
  padding: '20px',
  backgroundColor: '#fafafa',
  borderRadius: '6px',
  border: '1px solid #e5e7eb',
}

const paymentMethodsHeading = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 12px',
}

const paymentMethodsText = {
  fontSize: '14px',
  color: '#525252',
  margin: '0',
  lineHeight: '22px',
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

const footerNoteBox = {
  padding: '16px',
  textAlign: 'center' as const,
  marginTop: '24px',
}

const footerNoteText = {
  fontSize: '12px',
  color: '#9ca3af',
  margin: '0',
  fontStyle: 'italic',
}

export default InvoiceSentEmail
