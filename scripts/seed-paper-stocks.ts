import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedPaperStocks() {

  const paperStocks = [
    // Business Card Papers
    {
      name: '14pt Cardstock',
      weight: 0.014,
      pricePerSqInch: 0.0015,
      tooltipText: 'Premium uncoated cardstock, perfect for business cards',
      isActive: true,
    },
    {
      name: '16pt Cardstock',
      weight: 0.016,
      pricePerSqInch: 0.0018,
      tooltipText: 'Heavy cardstock with C2S coating for a professional look',
      isActive: true,
    },
    {
      name: '32pt Triple Layer',
      weight: 0.032,
      pricePerSqInch: 0.0045,
      tooltipText: 'Luxury triple-layer cardstock with soft touch coating',
      isActive: true,
    },
    {
      name: 'Pearl Metallic',
      weight: 0.014,
      pricePerSqInch: 0.0035,
      tooltipText: 'Shimmer metallic finish for premium cards',
      isActive: true,
    },
    // Standard Papers
    {
      name: '70lb Text',
      weight: 0.007,
      pricePerSqInch: 0.0008,
      tooltipText: 'Standard text weight paper for flyers and brochures',
      isActive: true,
    },
    {
      name: '80lb Text',
      weight: 0.008,
      pricePerSqInch: 0.0009,
      tooltipText: 'Heavier text paper for quality marketing materials',
      isActive: true,
    },
    {
      name: '100lb Text',
      weight: 0.010,
      pricePerSqInch: 0.0012,
      tooltipText: 'Premium text weight for high-end brochures',
      isActive: true,
    },
    {
      name: '100lb Cover',
      weight: 0.010,
      pricePerSqInch: 0.0014,
      tooltipText: 'Light cardstock for postcards and covers',
      isActive: true,
    },
    // Poster Papers
    {
      name: '100lb Gloss Cover',
      weight: 0.010,
      pricePerSqInch: 0.0015,
      tooltipText: 'Glossy cover stock for vibrant posters',
      isActive: true,
    },
    {
      name: '12pt C2S',
      weight: 0.012,
      pricePerSqInch: 0.0013,
      tooltipText: 'Coated two sides for full-color posters',
      isActive: true,
    },
    {
      name: 'Vinyl Banner',
      weight: 0.020,
      pricePerSqInch: 0.0025,
      tooltipText: 'Durable vinyl for outdoor banners',
      isActive: true,
    },
    // Economy Papers
    {
      name: '60lb Offset',
      weight: 0.006,
      pricePerSqInch: 0.0006,
      tooltipText: 'Economy paper for bulk printing',
      isActive: true,
    },
    {
      name: '20lb Bond',
      weight: 0.002,
      pricePerSqInch: 0.0004,
      tooltipText: 'Standard copy paper',
      isActive: true,
    },
  ]

  for (const stock of paperStocks) {
    await prisma.paperStock.upsert({
      where: { name: stock.name },
      update: stock,
      create: stock,
    })

  }

}

// Run if executed directly
if (require.main === module) {
  seedPaperStocks()
    .then(() => {

      process.exit(0)
    })
    .catch((error) => {
      console.error('Seed failed:', error)
      process.exit(1)
    })
    .finally(() => {
      prisma.$disconnect()
    })
}

export default seedPaperStocks