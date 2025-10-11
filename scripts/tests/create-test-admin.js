const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

async function createTestAdmin() {
  try {
    // Generate session ID
    const sessionId = crypto.randomBytes(20).toString('hex')
    const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'testadmin@gangrunprinting.com' },
    })

    if (existingUser) {
      // Update user to admin
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          role: 'ADMIN',
          emailVerified: true,
        },
      })

      // Create new session
      const session = await prisma.session.create({
        data: {
          id: sessionId,
          userId: updatedUser.id,
          expiresAt: sessionExpiresAt,
        },
      })

      return { user: updatedUser, session }
    }

    // Create new admin user
    const newUser = await prisma.user.create({
      data: {
        email: 'testadmin@gangrunprinting.com',
        name: 'Test Admin',
        role: 'ADMIN',
        emailVerified: true,
      },
    })

    // Create session for the user
    const session = await prisma.session.create({
      data: {
        id: sessionId,
        userId: newUser.id,
        expiresAt: sessionExpiresAt,
      },
    })

    return { user: newUser, session }
  } catch (error) {
    console.error('❌ Error creating test admin:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createTestAdmin().catch(console.error)
