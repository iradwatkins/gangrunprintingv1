const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

async function createAuthSession() {
  try {

    // Find the admin user (iradwatkins)
    const adminUser = await prisma.user.findUnique({
      where: { email: 'iradwatkins@gmail.com' },
    })

    if (!adminUser) {

      // Create admin user
      const newAdmin = await prisma.user.create({
        data: {
          email: 'iradwatkins@gmail.com',
          name: 'Ira Watkins',
          role: 'ADMIN',
          emailVerified: true,
        },
      })

      adminUser = newAdmin

    } else {

      // Ensure user is admin
      if (adminUser.role !== 'ADMIN') {
        await prisma.user.update({
          where: { id: adminUser.id },
          data: { role: 'ADMIN' },
        })

      }
    }

    // Create a new session
    const sessionId = crypto.randomBytes(20).toString('hex')
    const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    // Delete any existing sessions for this user
    await prisma.session.deleteMany({
      where: { userId: adminUser.id },
    })

    // Create new session
    const session = await prisma.session.create({
      data: {
        id: sessionId,
        userId: adminUser.id,
        expiresAt: sessionExpiresAt,
      },
    })

    return { user: adminUser, session }
  } catch (error) {
    console.error('❌ Error creating session:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createAuthSession().catch(console.error)
