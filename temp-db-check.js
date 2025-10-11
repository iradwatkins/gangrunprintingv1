const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkImages() {
  const images = await prisma.image.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { products: true },
  })

  console.log(
    JSON.stringify({
      count: images.length,
      images: images.map((img) => ({
        id: img.id,
        url: img.url,
        productCount: img.products.length,
      })),
    })
  )

  await prisma.$disconnect()
}

checkImages().catch(console.error)
