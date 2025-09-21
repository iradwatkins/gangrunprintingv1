import { prisma } from '../src/lib/prisma'

async function checkSessions() {
  try {
    // Check for user
    const user = await prisma.user.findUnique({
      where: { email: 'iradwatkins@gmail.com' },
    })

    console.log('User found:', user)

    if (user) {
      // Check for sessions
      const sessions = await prisma.session.findMany({
        where: { userId: user.id },
      })

      console.log('\nSessions found:', sessions.length)
      sessions.forEach(session => {
        console.log('- Session ID:', session.id)
        console.log('  Expires:', session.expiresAt)
        console.log('  Expired?:', session.expiresAt < new Date())
      })

      // Check all sessions in DB
      const allSessions = await prisma.session.findMany()
      console.log('\nTotal sessions in database:', allSessions.length)
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSessions()