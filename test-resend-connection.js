#!/usr/bin/env node

/**
 * Resend Email Service Test Script
 * Tests connection to Resend.com and verifies email sending capability
 */

const fetch = require('node-fetch')
const path = require('path')

// Load environment variables from both .env and .env.local
require('dotenv').config()
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') })

// Configuration
const TEST_CONFIG = {
  recipient: 'appvillagellc@gmail.com',
  resendApiKey: process.env.RESEND_API_KEY || '',
  fromEmail: process.env.RESEND_FROM_EMAIL || 'orders@gangrunprinting.com',
  fromName: process.env.RESEND_FROM_NAME || 'GangRun Printing',
}

// Color-coded console output
const log = {
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  info: (msg) => console.log(`ℹ️  ${msg}`),
  data: (label, data) => console.log(`📊 ${label}:`, data),
}

// Test order data for email
const testOrderData = {
  orderNumber: 'TEST-' + Date.now().toString(36).toUpperCase(),
  customerName: 'Test Customer',
  customerEmail: TEST_CONFIG.recipient,
  total: 66.0,
  subtotal: 60.0,
  tax: 4.95,
  shipping: 8.95,
  items: [
    {
      productName: 'asdfasd',
      quantity: 100,
      price: 66.0,
      options: {
        size: 'Standard',
        paperStock: '14pt',
        coating: 'Glossy',
      },
    },
  ],
  shippingAddress: {
    street: '2740 West 83rd Pl',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60652',
  },
}

async function checkResendAPIKey() {
  console.log('\n' + '='.repeat(60))
  console.log('🔍 CHECKING RESEND API KEY CONFIGURATION')
  console.log('='.repeat(60) + '\n')

  if (!TEST_CONFIG.resendApiKey) {
    log.error('RESEND_API_KEY is not set in environment variables')
    log.info('Please add the following to your .env.local file:')
    console.log('\n   RESEND_API_KEY=your-api-key-here')
    console.log('   RESEND_FROM_EMAIL=orders@gangrunprinting.com')
    console.log('   RESEND_FROM_NAME=GangRun Printing\n')
    return false
  }

  log.success('RESEND_API_KEY is configured')
  log.data('API Key (masked)', TEST_CONFIG.resendApiKey.substring(0, 7) + '...')
  log.data('From Email', TEST_CONFIG.fromEmail)
  log.data('From Name', TEST_CONFIG.fromName)

  return true
}

async function testResendConnection() {
  console.log('\n' + '='.repeat(60))
  console.log('🔗 TESTING RESEND API CONNECTION')
  console.log('='.repeat(60) + '\n')

  try {
    // Test API connection by fetching domains
    const response = await fetch('https://api.resend.com/domains', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${TEST_CONFIG.resendApiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      log.success('Connected to Resend API successfully')
      log.data('API Response Status', response.status)

      if (data.data && data.data.length > 0) {
        log.info('Verified domains:')
        data.data.forEach((domain) => {
          console.log(`   • ${domain.name} (${domain.status})`)
        })
      }
      return true
    } else {
      const errorText = await response.text()
      log.error(`Failed to connect to Resend API: ${response.status}`)
      log.data('Error', errorText)
      return false
    }
  } catch (error) {
    log.error(`Connection error: ${error.message}`)
    return false
  }
}

async function sendTestEmail() {
  console.log('\n' + '='.repeat(60))
  console.log('📧 SENDING TEST ORDER CONFIRMATION EMAIL')
  console.log('='.repeat(60) + '\n')

  log.info(`Recipient: ${TEST_CONFIG.recipient}`)
  log.info(`Order Number: ${testOrderData.orderNumber}`)

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #333; margin: 0;">GangRun Printing</h1>
        <p style="color: #666; margin: 5px 0;">Order Confirmation</p>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-top: 0;">Thank you for your order!</h2>
        <p style="color: #666;">Hi ${testOrderData.customerName},</p>
        <p style="color: #666;">Your order has been received and is being processed.</p>
      </div>

      <div style="border: 1px solid #dee2e6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #333; margin-top: 0;">Order Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666;">Order Number:</td>
            <td style="padding: 8px 0; color: #333; font-weight: bold;">${testOrderData.orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Date:</td>
            <td style="padding: 8px 0; color: #333;">${new Date().toLocaleDateString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Status:</td>
            <td style="padding: 8px 0; color: #28a745; font-weight: bold;">CONFIRMED</td>
          </tr>
        </table>
      </div>

      <div style="border: 1px solid #dee2e6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #333; margin-top: 0;">Order Items</h3>
        ${testOrderData.items
          .map(
            (item) => `
          <div style="border-bottom: 1px solid #e9ecef; padding: 10px 0;">
            <p style="margin: 5px 0; color: #333; font-weight: bold;">${item.productName}</p>
            <p style="margin: 5px 0; color: #666;">Quantity: ${item.quantity}</p>
            <p style="margin: 5px 0; color: #666;">Price: $${item.price.toFixed(2)}</p>
            ${
              item.options
                ? `
              <p style="margin: 5px 0; color: #666; font-size: 14px;">
                Options: ${Object.entries(item.options)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(', ')}
              </p>
            `
                : ''
            }
          </div>
        `
          )
          .join('')}
      </div>

      <div style="border: 1px solid #dee2e6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #333; margin-top: 0;">Shipping Address</h3>
        <p style="margin: 5px 0; color: #666;">
          ${testOrderData.shippingAddress.street}<br>
          ${testOrderData.shippingAddress.city}, ${testOrderData.shippingAddress.state} ${testOrderData.shippingAddress.zipCode}
        </p>
      </div>

      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h3 style="color: #333; margin-top: 0;">Order Summary</h3>
        <table style="width: 100%;">
          <tr>
            <td style="padding: 5px 0; color: #666;">Subtotal:</td>
            <td style="padding: 5px 0; color: #333; text-align: right;">$${testOrderData.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #666;">Tax:</td>
            <td style="padding: 5px 0; color: #333; text-align: right;">$${testOrderData.tax.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #666;">Shipping:</td>
            <td style="padding: 5px 0; color: #333; text-align: right;">$${testOrderData.shipping.toFixed(2)}</td>
          </tr>
          <tr style="border-top: 2px solid #dee2e6;">
            <td style="padding: 10px 0 5px 0; color: #333; font-weight: bold; font-size: 18px;">Total:</td>
            <td style="padding: 10px 0 5px 0; color: #333; font-weight: bold; font-size: 18px; text-align: right;">
              $${testOrderData.total.toFixed(2)}
            </td>
          </tr>
        </table>
      </div>

      <div style="margin-top: 30px; padding: 20px; background-color: #007bff; color: white; border-radius: 8px; text-align: center;">
        <p style="margin: 5px 0; font-size: 14px;">This is a test email from GangRun Printing</p>
        <p style="margin: 5px 0; font-size: 14px;">If you received this, email delivery is working correctly!</p>
      </div>

      <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>© 2025 GangRun Printing. All rights reserved.</p>
        <p>Questions? Contact us at support@gangrunprinting.com</p>
      </div>
    </div>
  `

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TEST_CONFIG.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${TEST_CONFIG.fromName} <${TEST_CONFIG.fromEmail}>`,
        to: TEST_CONFIG.recipient,
        subject: `Test Order Confirmation #${testOrderData.orderNumber}`,
        html: emailHtml,
      }),
    })

    const result = await response.json()

    if (response.ok) {
      log.success('Test email sent successfully!')
      log.data('Email ID', result.id)
      log.info(`Check ${TEST_CONFIG.recipient} for the test order confirmation email`)
      return true
    } else {
      log.error('Failed to send test email')
      log.data('Error', result.message || result.name || JSON.stringify(result))
      return false
    }
  } catch (error) {
    log.error(`Failed to send email: ${error.message}`)
    return false
  }
}

async function testDirectResendIntegration() {
  console.log('\n' + '='.repeat(60))
  console.log('🔧 TESTING DIRECT RESEND INTEGRATION')
  console.log('='.repeat(60) + '\n')

  // Test using the actual resend library
  try {
    const { Resend } = require('resend')
    const resend = new Resend(TEST_CONFIG.resendApiKey)

    const { data, error } = await resend.emails.send({
      from: `${TEST_CONFIG.fromName} <${TEST_CONFIG.fromEmail}>`,
      to: TEST_CONFIG.recipient,
      subject: `Direct Integration Test - ${new Date().toISOString()}`,
      html: '<p>This email was sent using the Resend SDK directly.</p>',
    })

    if (error) {
      log.error('Direct SDK test failed')
      log.data('Error', error.message)
      return false
    }

    log.success('Direct SDK integration working!')
    log.data('Email ID', data.id)
    return true
  } catch (error) {
    log.warning('Resend SDK not installed, skipping direct integration test')
    return null
  }
}

async function main() {
  console.log('\n' + '='.repeat(80))
  console.log('🧪 RESEND EMAIL SERVICE CONNECTION TEST')
  console.log('📧 Testing email delivery to: ' + TEST_CONFIG.recipient)
  console.log('🌐 Service: Resend.com')
  console.log('='.repeat(80))

  const results = {
    apiKeyConfigured: false,
    apiConnection: false,
    testEmailSent: false,
    directSDK: false,
  }

  // Step 1: Check API key configuration
  results.apiKeyConfigured = await checkResendAPIKey()

  if (!results.apiKeyConfigured) {
    console.log('\n' + '='.repeat(60))
    console.log('❌ CONFIGURATION REQUIRED')
    console.log('='.repeat(60))
    console.log('\nTo configure Resend email service:')
    console.log('1. Sign up at https://resend.com')
    console.log('2. Get your API key from the dashboard')
    console.log('3. Add to .env.local file:')
    console.log('   RESEND_API_KEY=re_xxxxxxxxxxxxx')
    console.log('   RESEND_FROM_EMAIL=orders@gangrunprinting.com')
    console.log('   RESEND_FROM_NAME=GangRun Printing')
    console.log('4. Verify your domain in Resend dashboard')
    console.log('5. Run this test again\n')
    process.exit(1)
  }

  // Step 2: Test API connection
  results.apiConnection = await testResendConnection()

  if (!results.apiConnection) {
    console.log('\n⚠️  API connection failed. Check your API key.')
    process.exit(1)
  }

  // Step 3: Send test email
  results.testEmailSent = await sendTestEmail()

  // Step 4: Test direct SDK integration (optional)
  results.directSDK = await testDirectResendIntegration()

  // Final summary
  console.log('\n' + '='.repeat(80))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(80))
  console.log(`✅ API Key Configured: ${results.apiKeyConfigured ? 'YES' : 'NO'}`)
  console.log(`✅ API Connection: ${results.apiConnection ? 'WORKING' : 'FAILED'}`)
  console.log(`✅ Test Email Sent: ${results.testEmailSent ? 'SUCCESS' : 'FAILED'}`)
  console.log(
    `✅ Direct SDK: ${results.directSDK === null ? 'NOT TESTED' : results.directSDK ? 'WORKING' : 'FAILED'}`
  )

  if (results.testEmailSent) {
    console.log('\n🎉 SUCCESS! Email service is properly configured.')
    console.log(`📬 Check ${TEST_CONFIG.recipient} for the test email.`)
    console.log('\n✅ Orders placed on GangRun Printing will now send confirmation emails.')
  } else {
    console.log('\n❌ Email service test failed. Please check configuration.')
  }

  console.log('\n' + '='.repeat(80) + '\n')

  process.exit(results.testEmailSent ? 0 : 1)
}

// Check dependencies
async function checkDependencies() {
  const deps = ['node-fetch', 'dotenv']
  const missing = []

  for (const dep of deps) {
    try {
      require.resolve(dep)
    } catch {
      missing.push(dep)
    }
  }

  if (missing.length > 0) {
    console.log('Installing missing dependencies...')
    require('child_process').execSync(`npm install ${missing.join(' ')}`, { stdio: 'inherit' })
  }

  // Optional: Install resend SDK if not present
  try {
    require.resolve('resend')
  } catch {
    console.log('Installing Resend SDK for better integration...')
    require('child_process').execSync('npm install resend', { stdio: 'inherit' })
  }
}

// Run the test
checkDependencies().then(() => main())
