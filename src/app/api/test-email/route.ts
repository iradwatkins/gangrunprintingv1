import { NextResponse } from 'next/server'
import { sendEmail, sendTestEmail } from '@/lib/sendgrid'
import { getOrderConfirmationEmail, getOrderStatusUpdateEmail } from '@/lib/email-templates'

export async function POST(request: Request) {
  try {
    const { to, orderNumber, type = 'test' } = await request.json()
    
    const email = to || process.env.SENDGRID_TEST_EMAIL || 'test@gangrunprinting.com'
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    let result
    
    switch (type) {
      case 'order_confirmation':
        const confirmationEmail = getOrderConfirmationEmail({
          orderNumber: orderNumber || 'TEST-' + Date.now(),
          customerName: 'Test Customer',
          email,
          items: [
            {
              name: 'Premium Flyers - 4x6',
              quantity: 500,
              price: 9999,
              options: {
                paper: '16pt Gloss',
                coating: 'UV Coating',
                sides: 'Double Sided'
              }
            }
          ],
          subtotal: 9999,
          tax: 800,
          shipping: 1500,
          total: 12299,
          estimatedDelivery: '3-5 business days',
          shippingAddress: {
            street: '123 Test Street',
            city: 'Test City',
            state: 'TX',
            zip: '12345'
          }
        })
        
        result = await sendEmail({
          to: email,
          subject: confirmationEmail.subject,
          html: confirmationEmail.html,
          text: confirmationEmail.text
        })
        break
        
      case 'status_update':
        const statusEmail = getOrderStatusUpdateEmail({
          orderNumber: orderNumber || 'TEST-' + Date.now(),
          customerName: 'Test Customer',
          status: 'SHIPPED',
          trackingNumber: '1Z999AA10123456784',
          estimatedDelivery: '2 business days'
        })
        
        result = await sendEmail({
          to: email,
          subject: statusEmail.subject,
          html: statusEmail.html,
          text: statusEmail.text
        })
        break
        
      default:
        result = await sendTestEmail(email)
    }
    
    if (result.success) {
      return NextResponse.json({ 
        message: `Test email (${type}) sent successfully to ${email}`,
        messageId: result.messageId,
        type
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Test email error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send test email' },
      { status: 500 }
    )
  }
}