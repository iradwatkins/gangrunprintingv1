import { NextResponse } from 'next/server'
import { sendTestEmail } from '@/lib/sendgrid'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    const result = await sendTestEmail(email)
    
    if (result.success) {
      return NextResponse.json({ 
        message: 'Test email sent successfully',
        messageId: result.messageId 
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