import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    const email = 'iradwatkins@gmail.com'
    const password = 'Iw2006js!'
    const hashedPassword = await bcrypt.hash(password, 12)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      // Update existing user to admin
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          role: 'ADMIN',
          password: hashedPassword,
          name: 'Ira Watkins'
        }
      })
      console.log('✅ Updated existing user to admin:', updatedUser.email)
    } else {
      // Create new admin user
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: 'Ira Watkins',
          role: 'ADMIN',
          emailVerified: new Date()
        }
      })
      console.log('✅ Created new admin user:', newUser.email)
    }

    console.log('\n📧 Admin Login Credentials:')
    console.log('Email:', email)
    console.log('Password:', password)
    console.log('\n🔗 Login URL: https://gangrunprinting.com/admin/login')

  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()