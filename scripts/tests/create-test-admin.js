const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

async function createTestAdmin() {
  try {
    console.log('🔧 Creating test admin user...')

    // Generate session ID
    const sessionId = crypto.randomBytes(20).toString('hex')
    const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'testadmin@gangrunprinting.com' },
    })

    if (existingUser) {
      console.log('⚠️  User already exists, updating to admin role...')

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

      console.log('✅ User updated to admin')
      console.log('📧 Email:', updatedUser.email)
      console.log('🔑 Session ID:', session.id)
      console.log(
        '🍪 Session Cookie:',
        `lucia_session=${session.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
      )

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

    console.log('✅ Test admin user created successfully!')
    console.log('📧 Email:', newUser.email)
    console.log('👤 Name:', newUser.name)
    console.log('🛡️  Role:', newUser.role)
    console.log('🔑 Session ID:', session.id)
    console.log(
      '🍪 Session Cookie:',
      `lucia_session=${session.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
    )
    console.log('\nUse this session cookie in Playwright tests to authenticate as admin.')

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
