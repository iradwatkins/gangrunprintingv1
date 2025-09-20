import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('Iw2006js!', 10)

  const adminUser = await prisma.user.upsert({
    where: { email: 'iradwatkins@gmail.com' },
    update: {
      role: 'ADMIN',
    },
    create: {
      email: 'iradwatkins@gmail.com',
      name: 'Ira Watkins',
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })

  console.log('Admin user created:', adminUser)

  // Create product categories
  const categories = [
    'Business Cards',
    'Flyers',
    'Brochures',
    'Posters',
    'Banners',
    'Stickers',
    'T-Shirts',
    'Promotional Items',
  ]

  // Create sample products
  const products = [
    {
      name: 'Standard Business Cards',
      description: 'Professional business cards with multiple finish options',
      category: 'Business Cards',
      basePrice: 29.99,
      sizes: ['3.5" x 2"'],
      paperTypes: ['14pt Cardstock', '16pt Cardstock', '32pt Triple Layer'],
      finishes: ['Matte', 'Gloss', 'UV Coating'],
      turnaroundDays: 3,
    },
    {
      name: 'Premium Flyers',
      description: 'High-quality flyers for marketing and promotions',
      category: 'Flyers',
      basePrice: 49.99,
      sizes: ['8.5" x 11"', '5.5" x 8.5"', '4" x 6"'],
      paperTypes: ['100lb Gloss', '100lb Matte'],
      finishes: ['Gloss', 'Matte'],
      turnaroundDays: 5,
    },
    {
      name: 'Tri-Fold Brochures',
      description: 'Professional tri-fold brochures for your business',
      category: 'Brochures',
      basePrice: 89.99,
      sizes: ['8.5" x 11"', '11" x 17"'],
      paperTypes: ['100lb Gloss Text', '100lb Matte Text'],
      finishes: ['Gloss', 'Matte', 'Soft Touch'],
      turnaroundDays: 7,
    },
    {
      name: 'Custom Posters',
      description: 'Eye-catching posters in various sizes',
      category: 'Posters',
      basePrice: 24.99,
      sizes: ['11" x 17"', '18" x 24"', '24" x 36"'],
      paperTypes: ['100lb Gloss', '100lb Matte', 'Vinyl'],
      finishes: ['Gloss', 'Matte'],
      turnaroundDays: 5,
    },
    {
      name: 'Vinyl Banners',
      description: 'Durable outdoor vinyl banners',
      category: 'Banners',
      basePrice: 79.99,
      sizes: ["2' x 4'", "3' x 6'", "4' x 8'"],
      paperTypes: ['13oz Vinyl', '18oz Vinyl'],
      finishes: ['Matte', 'Gloss'],
      turnaroundDays: 7,
    },
    {
      name: 'Die-Cut Stickers',
      description: 'Custom die-cut stickers in any shape',
      category: 'Stickers',
      basePrice: 39.99,
      sizes: ['2" x 2"', '3" x 3"', '4" x 4"', 'Custom'],
      paperTypes: ['Vinyl', 'Paper'],
      finishes: ['Gloss', 'Matte', 'Clear'],
      turnaroundDays: 5,
    },
    {
      name: 'Custom T-Shirts',
      description: 'Screen printed or DTG custom t-shirts',
      category: 'T-Shirts',
      basePrice: 12.99,
      sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
      paperTypes: ['100% Cotton', '50/50 Blend', 'Tri-Blend'],
      finishes: ['Screen Print', 'DTG', 'Vinyl Transfer'],
      turnaroundDays: 10,
    },
  ]

  console.log('Seeding products...')

  for (const product of products) {
    await prisma.$executeRaw`
      INSERT INTO "Product" (name, description, category, "basePrice", sizes, "paperTypes", finishes, "turnaroundDays", "createdAt", "updatedAt")
      VALUES (${product.name}, ${product.description}, ${product.category}, ${product.basePrice}, 
              ${product.sizes}::text[], ${product.paperTypes}::text[], ${product.finishes}::text[], 
              ${product.turnaroundDays}, NOW(), NOW())
      ON CONFLICT (name) DO UPDATE SET
        description = EXCLUDED.description,
        category = EXCLUDED.category,
        "basePrice" = EXCLUDED."basePrice",
        sizes = EXCLUDED.sizes,
        "paperTypes" = EXCLUDED."paperTypes",
        finishes = EXCLUDED.finishes,
        "turnaroundDays" = EXCLUDED."turnaroundDays",
        "updatedAt" = NOW()
    `
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
