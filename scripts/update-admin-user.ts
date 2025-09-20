import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateAdminUser() {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'iradwatkins@gmail.com' },
    })

    if (existingUser) {
      // Update existing user to ADMIN role
      const updatedUser = await prisma.user.update({
        where: { email: 'iradwatkins@gmail.com' },
        data: {
          role: 'ADMIN',
          name: existingUser.name || 'Ira Watkins',
        },
      })
      console.log('✅ Updated user to ADMIN role:', updatedUser.email)
    } else {
      // Create new admin user
      const newUser = await prisma.user.create({
        data: {
          email: 'iradwatkins@gmail.com',
          name: 'Ira Watkins',
          role: 'ADMIN',
          emailVerified: new Date(),
        },
      })
      console.log('✅ Created new ADMIN user:', newUser.email)
    }

    // Verify the update
    const adminUser = await prisma.user.findUnique({
      where: { email: 'iradwatkins@gmail.com' },
      select: { email: true, role: true, name: true },
    })

    console.log('Admin user status:', adminUser)
  } catch (error) {
    console.error('❌ Error updating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateAdminUser()
