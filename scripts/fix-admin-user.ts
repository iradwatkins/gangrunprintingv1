import { prisma } from '../src/lib/prisma'

async function fixAdminUser() {
  try {
    console.log('Checking for admin user: iradwatkins@gmail.com')

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: 'iradwatkins@gmail.com' },
    })

    if (!user) {
      console.log('User not found. Creating admin user...')
      user = await prisma.user.create({
        data: {
          email: 'iradwatkins@gmail.com',
          name: 'Ira Watkins',
          role: 'ADMIN',
          emailVerified: true,
        },
      })
      console.log('Admin user created:', user)
    } else {
      console.log('User found:', user)

      // Check if user has ADMIN role
      if (user.role !== 'ADMIN') {
        console.log('User role is:', user.role, '- Updating to ADMIN...')
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: 'ADMIN' },
        })
        console.log('User role updated to ADMIN')
      } else {
        console.log('User already has ADMIN role')
      }
    }

    console.log('Final user data:', user)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixAdminUser()