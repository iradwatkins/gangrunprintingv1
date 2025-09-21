import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedCategories() {

  const categoriesData = [
    'Banner',
    'Booklet',
    'Bookmark',
    'Brochure',
    'Bumper Sticker',
    'Business Card',
    'Business Card Sharing',
    'Calendar',
    'Catalog',
    'Custom Flyers',
    'Custom T-shirt',
    'Die Cut Flyer',
    'Door Hanger',
    'Drink Coaster',
    'EDDM Postcard',
    'Envelope',
    'Flyer Sharing',
    'Foil Business Card',
    'Foldable Business Card',
    'Folded Card',
    'Greeting Card',
    'Hang tag',
    'Invitation',
    'Letterhead',
    'Magazine',
    'Magnet',
    'Membership Card',
    'Menu',
    'Notepad',
    'Placemat',
    'Pocket Folder',
    'Postcard',
    'Poster',
    'Poster – Short Run (1-25)',
    'Rack card',
    'Rip Card',
    'Rip Door Hanger',
    'Role Sticker',
    'Sales Sheet',
    'Sticker',
    'Tablet Tent',
    'Tear Off Flyer',
    'Tickets',
    'Wrapping paper',
    'Wristband',
  ]

  let sortOrder = 1

  for (const categoryName of categoriesData) {
    // Create slug from name
    const slug = categoryName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const categoryId = `cat_${slug.replace(/-/g, '_')}`

    const category = {
      id: categoryId,
      name: categoryName,
      slug,
      description: `${categoryName} printing services`,
      sortOrder,
      isActive: true,
      updatedAt: new Date(),
    }

    await prisma.productCategory.upsert({
      where: { slug },
      update: {
        name: categoryName,
        sortOrder,
        isActive: true,
        updatedAt: new Date(),
      },
      create: category,
    })

    sortOrder++
  }

}

seedCategories()
  .catch((e) => {
    console.error('Error seeding categories:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
