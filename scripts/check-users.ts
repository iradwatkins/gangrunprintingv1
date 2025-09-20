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

    console.log('\n📋 All Users in Database:')
    console.log('========================')
    allUsers.forEach((user) => {
      console.log(`
Email: ${user.email}
Name: ${user.name || 'Not set'}
Role: ${user.role}
ID: ${user.id}
Created: ${user.createdAt.toISOString()}
---`)
    })

    // Check for admin users
    const adminUsers = allUsers.filter((u) => u.role === 'ADMIN')
    console.log(`\n👮 Admin Users: ${adminUsers.length}`)
    adminUsers.forEach((admin) => {
      console.log(`  - ${admin.email}`)
    })

    // Ensure iradwatkins@gmail.com is ADMIN
    const iraUser = await prisma.user.findUnique({
      where: { email: 'iradwatkins@gmail.com' },
    })

    if (!iraUser) {
      console.log('\n⚠️  iradwatkins@gmail.com NOT FOUND in database')
      console.log('   User will be created as ADMIN on first Google login')
    } else if (iraUser.role !== 'ADMIN') {
      console.log('\n⚠️  iradwatkins@gmail.com exists but is not ADMIN')
      console.log('   Updating to ADMIN role...')

      await prisma.user.update({
        where: { email: 'iradwatkins@gmail.com' },
        data: { role: 'ADMIN' },
      })

      console.log('✅ Updated iradwatkins@gmail.com to ADMIN')
    } else {
      console.log('\n✅ iradwatkins@gmail.com is correctly set as ADMIN')
    }

    // Remove admin role from any other users
    const otherAdmins = adminUsers.filter((u) => u.email !== 'iradwatkins@gmail.com')
    if (otherAdmins.length > 0) {
      console.log(`\n🔧 Removing ADMIN role from ${otherAdmins.length} other users...`)

      for (const admin of otherAdmins) {
        await prisma.user.update({
          where: { id: admin.id },
          data: { role: 'CUSTOMER' },
        })
        console.log(`   - Changed ${admin.email} to CUSTOMER`)
      }
    }
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()
