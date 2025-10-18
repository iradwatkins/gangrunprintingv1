const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAdminUsers() {
  try {
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, email: true, role: true, name: true },
    })

    console.log('Admin users found:', adminUsers.length)
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.name}) - Role: ${user.role}`)
    })

    if (adminUsers.length === 0) {
      console.log('❌ No admin users found. Need to create one for testing.')
    }
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdminUsers()
