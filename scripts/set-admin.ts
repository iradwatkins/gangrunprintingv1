#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setAdminRole() {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'iradwatkins@gmail.com' },
    })

    if (existingUser) {
      // Update existing user to admin
      const updatedUser = await prisma.user.update({
        where: { email: 'iradwatkins@gmail.com' },
        data: {
          role: 'ADMIN',
          name: 'Ira Watkins',
        },
      })

    } else {
      // Create new admin user
      const newUser = await prisma.user.create({
        data: {
          email: 'iradwatkins@gmail.com',
          name: 'Ira Watkins',
          role: 'ADMIN',
          // Clerk will handle the actual authentication
          clerkId: 'pending', // This will be updated when user signs in via Clerk
        },
      })

    }

    // Also check and create admin user with Clerk ID if needed
    // This ensures the user can be matched when they sign in with Clerk

  } catch (error) {
    console.error('❌ Error setting admin role:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setAdminRole()
