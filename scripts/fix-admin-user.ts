import { prisma } from '../src/lib/prisma'

async function fixAdminUser() {
  try {

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: 'iradwatkins@gmail.com' },
    })

    if (!user) {

      user = await prisma.user.create({
        data: {
          email: 'iradwatkins@gmail.com',
          name: 'Ira Watkins',
          role: 'ADMIN',
          emailVerified: true,
        },
      })

    } else {

      // Check if user has ADMIN role
      if (user.role !== 'ADMIN') {

        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: 'ADMIN' },
        })

      } else {

      }
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixAdminUser()