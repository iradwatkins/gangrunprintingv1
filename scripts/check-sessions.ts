import { prisma } from '../src/lib/prisma'

async function checkSessions() {
  try {
    // Check for user
    const user = await prisma.user.findUnique({
      where: { email: 'iradwatkins@gmail.com' },
    })

    if (user) {
      // Check for sessions
      const sessions = await prisma.session.findMany({
        where: { userId: user.id },
      })

      sessions.forEach(session => {

        console.log('  Expired?:', session.expiresAt < new Date())
      })

      // Check all sessions in DB
      const allSessions = await prisma.session.findMany()

    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSessions()