import { PrismaClient } from '@prisma/client'
import { createId } from '@paralleldrive/cuid2'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting basic seed...')

  // Create admin user first
  const adminUser = await prisma.user.upsert({
    where: { email: 'iradwatkins@gmail.com' },
    update: {
      role: 'ADMIN',
    },
    create: {
      email: 'iradwatkins@gmail.com',
      name: 'Ira Watkins',
      role: 'ADMIN',
      emailVerified: true,
    },
  })
  console.log('Created admin user:', adminUser.email)

  // Create basic categories
  const categoriesData = [
    { name: 'Business Cards', slug: 'business-cards', description: 'Professional business cards', sortOrder: 1 },
    { name: 'Flyers', slug: 'flyers', description: 'Marketing flyers and handouts', sortOrder: 2 },
    { name: 'Brochures', slug: 'brochures', description: 'Folded brochures', sortOrder: 3 },
    { name: 'Posters', slug: 'posters', description: 'Large format posters', sortOrder: 4 },
    { name: 'Banners', slug: 'banners', description: 'Vinyl and fabric banners', sortOrder: 5 },
    { name: 'Stickers', slug: 'stickers', description: 'Custom stickers and labels', sortOrder: 6 },
    { name: 'T-Shirts', slug: 't-shirts', description: 'Custom printed apparel', sortOrder: 7 },
    { name: 'Promotional Items', slug: 'promotional-items', description: 'Branded promotional products', sortOrder: 8 },
  ]

  const categories = []
  for (const catData of categoriesData) {
    const category = await prisma.productCategory.upsert({
      where: { slug: catData.slug },
      update: catData,
      create: catData,
    })
    categories.push(category)
    console.log('Created category:', category.name)
  }

  // Create sample vendors
  const vendor1 = await prisma.vendor.upsert({
    where: { name: 'Print Partner 1' },
    update: {},
    create: {
      name: 'Print Partner 1',
      contactEmail: 'vendor1@gangrun.com',
      orderEmail: 'orders@vendor1.com',
      phone: '555-0001',
      website: 'https://vendor1.com',
      isActive: true,
      supportedCarriers: ['USPS', 'UPS', 'FedEx'],
      turnaroundDays: 3,
      minimumOrderAmount: 50.0,
      address: {
        street: '123 Print St',
        city: 'Houston',
        state: 'TX',
        zip: '77001'
      }
    }
  })
  console.log('Created vendor:', vendor1.name)

  const vendor2 = await prisma.vendor.upsert({
    where: { name: 'Print Partner 2' },
    update: {},
    create: {
      name: 'Print Partner 2',
      contactEmail: 'vendor2@gangrun.com',
      orderEmail: 'orders@vendor2.com',
      phone: '555-0002',
      website: 'https://vendor2.com',
      isActive: true,
      supportedCarriers: ['USPS', 'UPS'],
      turnaroundDays: 5,
      minimumOrderAmount: 100.0,
      address: {
        street: '456 Banner Ave',
        city: 'Dallas',
        state: 'TX',
        zip: '75201'
      }
    }
  })
  console.log('Created vendor:', vendor2.name)

  // Create sample products
  const productsData = [
    {
      name: 'Standard Business Cards',
      slug: 'standard-business-cards',
      sku: 'BC-STD-001',
      description: 'Professional business cards with multiple finish options',
      categoryId: categories[0].id, // Business Cards
      basePrice: 29.99,
      productionTime: 3,
      isFeatured: true,
      shortDescription: 'High-quality business cards',
      setupFee: 0,
      metadata: {
        defaultQuantity: 500,
        defaultSize: '3.5" x 2"',
      }
    },
    {
      name: 'Premium Flyers',
      slug: 'premium-flyers',
      sku: 'FLY-PRM-001',
      description: 'High-quality flyers for marketing and promotions',
      categoryId: categories[1].id, // Flyers
      basePrice: 49.99,
      productionTime: 5,
      isFeatured: true,
      shortDescription: 'Eye-catching marketing flyers',
      setupFee: 0,
      metadata: {
        defaultQuantity: 1000,
        defaultSize: '8.5" x 11"',
      }
    },
    {
      name: 'Tri-Fold Brochures',
      slug: 'tri-fold-brochures',
      sku: 'BRO-TRI-001',
      description: 'Professional tri-fold brochures for your business',
      categoryId: categories[2].id, // Brochures
      basePrice: 89.99,
      productionTime: 7,
      shortDescription: 'Informative tri-fold brochures',
      setupFee: 25,
      metadata: {
        defaultQuantity: 500,
        defaultSize: '8.5" x 11"',
      }
    },
    {
      name: 'Custom Posters',
      slug: 'custom-posters',
      sku: 'POS-CUS-001',
      description: 'Eye-catching posters in various sizes',
      categoryId: categories[3].id, // Posters
      basePrice: 24.99,
      productionTime: 5,
      shortDescription: 'Vibrant custom posters',
      setupFee: 0,
      metadata: {
        defaultQuantity: 10,
        defaultSize: '18" x 24"',
      }
    },
    {
      name: 'Vinyl Banners',
      slug: 'vinyl-banners',
      sku: 'BAN-VIN-001',
      description: 'Durable outdoor vinyl banners',
      categoryId: categories[4].id, // Banners
      basePrice: 79.99,
      productionTime: 7,
      shortDescription: 'Weather-resistant vinyl banners',
      setupFee: 50,
      rushAvailable: true,
      rushDays: 3,
      rushFee: 100,
      metadata: {
        defaultQuantity: 1,
        defaultSize: '3ft x 6ft',
      }
    },
    {
      name: 'Die-Cut Stickers',
      slug: 'die-cut-stickers',
      sku: 'STI-DIE-001',
      description: 'Custom die-cut stickers in any shape',
      categoryId: categories[5].id, // Stickers
      basePrice: 39.99,
      productionTime: 5,
      shortDescription: 'Custom shape stickers',
      setupFee: 15,
      metadata: {
        defaultQuantity: 250,
        defaultSize: '3" x 3"',
      }
    },
  ]

  for (const productData of productsData) {
    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: productData,
      create: productData,
    })
    console.log('Created product:', product.name)

    // Create vendor product association
    await prisma.vendorProduct.upsert({
      where: {
        vendorId_productId: {
          vendorId: productData.categoryId === categories[0].id ? vendor1.id : vendor2.id,
          productId: product.id
        }
      },
      update: {},
      create: {
        vendorId: productData.categoryId === categories[0].id ? vendor1.id : vendor2.id,
        productId: product.id,
        vendorPrice: productData.basePrice * 0.6, // Vendor gets 60% of base price
        isPreferred: true,
        vendorSku: `SKU-${product.slug.toUpperCase()}`,
      }
    })
  }

  // Create a test order for the admin user
  const testOrder = await prisma.order.create({
    data: {
      userId: adminUser.id,
      orderNumber: `ORD-${Date.now()}`,
      email: adminUser.email,
      status: 'PENDING_PAYMENT',
      subtotal: 29.99,
      tax: 2.40,
      shipping: 9.99,
      total: 42.38,
      shippingAddress: {
        name: 'Ira Watkins',
        address1: '123 Main St',
        city: 'Houston',
        state: 'TX',
        zip: '77001',
        country: 'US',
      },
      metadata: {
        source: 'seed-script',
        notes: 'Test order created during seeding'
      }
    }
  })
  console.log('Created test order:', testOrder.orderNumber)

  console.log('Basic seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })