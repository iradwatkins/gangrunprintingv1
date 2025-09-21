import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    // Get all users with their roles
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    allUsers.forEach((user) => {

    })

    // Check for admin users
    const adminUsers = allUsers.filter((u) => u.role === 'ADMIN')

    adminUsers.forEach((admin) => {

    })

    // Ensure iradwatkins@gmail.com is ADMIN
    const iraUser = await prisma.user.findUnique({
      where: { email: 'iradwatkins@gmail.com' },
    })

    if (!iraUser) {

    } else if (iraUser.role !== 'ADMIN') {

      await prisma.user.update({
        where: { email: 'iradwatkins@gmail.com' },
        data: { role: 'ADMIN' },
      })

    } else {

    }

    // Remove admin role from any other users
    const otherAdmins = adminUsers.filter((u) => u.email !== 'iradwatkins@gmail.com')
    if (otherAdmins.length > 0) {

      for (const admin of otherAdmins) {
        await prisma.user.update({
          where: { id: admin.id },
          data: { role: 'CUSTOMER' },
        })

      }
    }
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()
