import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // Get credentials from environment variables
    const email = process.env.ADMIN_EMAIL || 'iradwatkins@gmail.com'
    const password = process.env.ADMIN_PASSWORD

    // Validate that password is provided
    if (!password) {
      console.error('❌ Error: ADMIN_PASSWORD environment variable is not set')

      process.exit(1)
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      // Update existing user to admin
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          role: 'ADMIN',
          password: hashedPassword,
          name: 'Ira Watkins',
        },
      })
    } else {
      // Create new admin user
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: 'Ira Watkins',
          role: 'ADMIN',
          emailVerified: new Date(),
        },
      })
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
