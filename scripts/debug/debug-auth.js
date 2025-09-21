#!/usr/bin/env node

/**
 * Debug script to test lucia session validation
 */

const { PrismaClient } = require('@prisma/client')
const { Lucia } = require('lucia')
const { PrismaAdapter } = require('@lucia-auth/adapter-prisma')

const prisma = new PrismaClient()

async function debugAuth() {

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

      return
    }

    // Test session validation

    const result = await lucia.validateSession(session.id)

    if (result.session) {

    }

    if (result.user) {

    }

    // Test creating session cookie
    if (result.session) {

      const sessionCookie = lucia.createSessionCookie(result.session.id)

    }
  } catch (error) {
    console.error(`❌ Debug failed: ${error.message}`)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

debugAuth().catch(console.error)
