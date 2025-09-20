#!/usr/bin/env node

/**
 * Debug script to test lucia session validation
 */

const { PrismaClient } = require('@prisma/client')
const { Lucia } = require('lucia')
const { PrismaAdapter } = require('@lucia-auth/adapter-prisma')

const prisma = new PrismaClient()

async function debugAuth() {
  console.log('🔍 Debugging authentication system...')

  try {
    // Initialize lucia the same way as in the app
    const adapter = new PrismaAdapter(prisma.session, prisma.user)

    const lucia = new Lucia(adapter, {
      sessionCookie: {
        attributes: {
          secure: process.env.NODE_ENV === 'production',
        },
      },
      getUserAttributes: (attributes) => {
        return {
          email: attributes.email,
          name: attributes.name,
          role: attributes.role,
          emailVerified: attributes.emailVerified,
        }
      },
    })

    console.log('✅ Lucia initialized')
    console.log('📍 Session cookie name:', lucia.sessionCookieName)

    // Get a known session from database
    const session = await prisma.session.findFirst({
      where: {
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
      orderBy: {
        expiresAt: 'desc',
      },
    })

    if (!session) {
      console.log('❌ No valid sessions found in database')
      return
    }

    console.log(`✅ Found session: ${session.id.substring(0, 10)}...`)
    console.log(`📧 User email: ${session.user.email}`)
    console.log(`👤 User role: ${session.user.role}`)
    console.log(`⏰ Session expires: ${session.expiresAt}`)

    // Test session validation
    console.log('\n🔍 Testing session validation...')
    const result = await lucia.validateSession(session.id)

    console.log('📋 Validation result:')
    console.log('- Session valid:', !!result.session)
    console.log('- User found:', !!result.user)

    if (result.session) {
      console.log('- Session ID:', result.session.id)
      console.log('- Session fresh:', result.session.fresh)
      console.log('- Session expires:', result.session.expiresAt)
    }

    if (result.user) {
      console.log('- User ID:', result.user.id)
      console.log('- User email:', result.user.email)
      console.log('- User role:', result.user.role)
    }

    // Test creating session cookie
    if (result.session) {
      console.log('\n🍪 Testing session cookie creation...')
      const sessionCookie = lucia.createSessionCookie(result.session.id)
      console.log('Cookie name:', sessionCookie.name)
      console.log('Cookie value length:', sessionCookie.value.length)
      console.log('Cookie attributes:', sessionCookie.attributes)
    }
  } catch (error) {
    console.error(`❌ Debug failed: ${error.message}`)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

debugAuth().catch(console.error)
