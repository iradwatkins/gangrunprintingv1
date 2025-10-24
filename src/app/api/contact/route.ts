import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendEmail } from '@/lib/resend'
import { prisma } from '@/lib/prisma'

// Validation schema for contact form
const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = contactFormSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const { name, email, phone, company, subject, message } = validationResult.data

    // Save contact form submission to database (for tracking and follow-up)
    // Note: ContactFormSubmission table may not exist yet - skip if not available
    try {
      // Check if table exists before attempting to save
      const hasTable = await prisma.$queryRaw`SELECT to_regclass('public."ContactFormSubmission"') as exists`
      if (hasTable) {
        await prisma.$executeRaw`
          INSERT INTO "ContactFormSubmission" (id, name, email, phone, company, subject, message, status, "submittedAt", "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), ${name}, ${email}, ${phone || null}, ${company || null}, ${subject}, ${message}, 'NEW', NOW(), NOW(), NOW())
        `
      }
    } catch (dbError) {
      // Log but don't fail the request if database save fails
      console.error('[Contact Form] Failed to save to database:', dbError)
    }

    // Admin email address
    const adminEmail = process.env.ADMIN_EMAIL || 'iradwatkins@gmail.com'

    // Send email to admin
    const adminEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background-color: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0; font-size: 24px;">🔔 New Contact Form Submission</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">GangRun Printing - Admin Notification</p>
    </div>

    <!-- Main Content -->
    <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h2 style="color: #111827; margin-top: 0; border-bottom: 2px solid #ef4444; padding-bottom: 10px;">Contact Details</h2>

      <div style="background-color: #fef2f2; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #ef4444;">
        <p style="margin: 5px 0; color: #4b5563;"><strong style="color: #111827;">Name:</strong> ${name}</p>
        <p style="margin: 5px 0; color: #4b5563;"><strong style="color: #111827;">Email:</strong> <a href="mailto:${email}" style="color: #ef4444; text-decoration: none;">${email}</a></p>
        ${phone ? `<p style="margin: 5px 0; color: #4b5563;"><strong style="color: #111827;">Phone:</strong> <a href="tel:${phone}" style="color: #ef4444; text-decoration: none;">${phone}</a></p>` : ''}
        ${company ? `<p style="margin: 5px 0; color: #4b5563;"><strong style="color: #111827;">Company:</strong> ${company}</p>` : ''}
      </div>

      <h3 style="color: #111827; margin-top: 25px;">Subject</h3>
      <p style="background-color: #f9fafb; padding: 12px; border-radius: 6px; color: #374151; font-weight: 600;">
        ${subject}
      </p>

      <h3 style="color: #111827; margin-top: 25px;">Message</h3>
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; color: #374151; line-height: 1.6; white-space: pre-wrap;">
${message}
      </div>

      <div style="margin-top: 30px; padding: 15px; background-color: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
        <p style="margin: 0; color: #92400e; font-size: 14px;">
          <strong>⏰ Action Required:</strong> Please respond to this inquiry within 24 hours
        </p>
      </div>

      <div style="margin-top: 25px; text-align: center;">
        <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" style="display: inline-block; padding: 12px 30px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
          Reply to ${name}
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

      <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
        Submitted on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${new Date().toLocaleTimeString('en-US')}
      </p>
    </div>
  </div>
</body>
</html>
    `

    // Send notification to admin
    await sendEmail({
      to: adminEmail,
      subject: `🔔 New Contact Form: ${subject}`,
      html: adminEmailHtml,
      replyTo: email,
    })

    // Send confirmation email to customer
    const customerEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Contacting Us</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background-color: #000000; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0; font-size: 28px;">GangRun Printing</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Professional Printing Services</p>
    </div>

    <!-- Main Content -->
    <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h2 style="color: #111827; margin-top: 0;">Thank You for Contacting Us!</h2>
      <p style="color: #4b5563; line-height: 1.6;">
        Hi ${name},<br><br>
        We've received your message and our team will review it shortly. We typically respond to all inquiries within 24 hours during business days.
      </p>

      <!-- Message Summary -->}
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #111827;">Your Message Summary</h3>
        <p style="margin: 5px 0; color: #4b5563;"><strong>Subject:</strong> ${subject}</p>
        <p style="margin: 5px 0; color: #4b5563;"><strong>Message:</strong></p>
        <p style="color: #6b7280; font-style: italic; margin: 10px 0 0 0; padding: 10px; background-color: white; border-radius: 4px;">
          "${message.substring(0, 150)}${message.length > 150 ? '...' : ''}"
        </p>
      </div>

      <div style="background-color: #dbeafe; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3b82f6;">
        <p style="margin: 0; color: #1e40af; font-size: 14px;">
          <strong>📧 Response Time:</strong> We'll get back to you within 24 hours
        </p>
      </div>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">

      <h3 style="color: #111827;">Need Immediate Assistance?</h3>
      <p style="color: #4b5563; line-height: 1.6;">
        If your inquiry is urgent, you can also reach us:
      </p>
      <ul style="color: #4b5563; line-height: 1.8;">
        <li><strong>Phone:</strong> 1-800-PRINTING</li>
        <li><strong>Email:</strong> <a href="mailto:support@gangrunprinting.com" style="color: #ef4444; text-decoration: none;">support@gangrunprinting.com</a></li>
        <li><strong>Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM CST</li>
      </ul>

      <div style="margin-top: 30px; text-align: center;">
        <a href="https://gangrunprinting.com/products" style="display: inline-block; padding: 12px 30px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 5px;">
          Browse Products
        </a>
        <a href="https://gangrunprinting.com/track" style="display: inline-block; padding: 12px 30px; background-color: #374151; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 5px;">
          Track Orders
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

      <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
        Best regards,<br>
        <strong>The GangRun Printing Team</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
      <p style="margin: 5px 0;">© ${new Date().getFullYear()} GangRun Printing. All rights reserved.</p>
      <p style="margin: 5px 0;">Professional printing services you can trust</p>
    </div>
  </div>
</body>
</html>
    `

    await sendEmail({
      to: email,
      subject: 'Thank You for Contacting GangRun Printing',
      html: customerEmailHtml,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Your message has been sent successfully. We will get back to you within 24 hours.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Contact Form] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to send message. Please try again later or contact us directly.',
      },
      { status: 500 }
    )
  }
}
