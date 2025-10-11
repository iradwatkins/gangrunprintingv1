import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkCornerRounding() {
  try {
    console.log('🔍 Checking for Corner Rounding addon...\n')

    // Check if addon exists
    const addon = await prisma.addOn.findFirst({
      where: {
        name: {
          contains: 'Corner',
          mode: 'insensitive',
        },
      },
      include: {
        addOnSubOptions: true,
      },
    })

    if (addon) {
      console.log('✅ Corner Rounding addon found:')
      console.log(JSON.stringify(addon, null, 2))
    } else {
      console.log('❌ Corner Rounding addon NOT found')
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCornerRounding()
