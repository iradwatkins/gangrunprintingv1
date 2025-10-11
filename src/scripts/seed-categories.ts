import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// All product categories from the list
const categories = [
  // Business Cards & Cards
  {
    name: 'Business Card',
    slug: 'business-card',
    description: 'Professional business cards',
    sortOrder: 1,
  },
  {
    name: 'Business Card Sharing',
    slug: 'business-card-sharing',
    description: 'Digital business card sharing solutions',
    sortOrder: 2,
  },
  {
    name: 'Foil Business Card',
    slug: 'foil-business-card',
    description: 'Premium foil-stamped business cards',
    sortOrder: 3,
  },
  {
    name: 'Foldable Business Card',
    slug: 'foldable-business-card',
    description: 'Unique foldable business cards',
    sortOrder: 4,
  },

  // Marketing Materials - Flyers & Postcards
  { name: 'Flyer', slug: 'flyer', description: 'Marketing flyers and handouts', sortOrder: 10 },
  {
    name: 'Flyer Sharing',
    slug: 'flyer-sharing',
    description: 'Shared flyer printing',
    sortOrder: 11,
  },
  {
    name: 'Die Cut Flyer',
    slug: 'die-cut-flyer',
    description: 'Custom die-cut flyers',
    sortOrder: 12,
  },
  {
    name: 'Tear Off Flyer',
    slug: 'tear-off-flyer',
    description: 'Flyers with tear-off tabs',
    sortOrder: 13,
  },
  { name: 'Postcard', slug: 'postcard', description: 'Standard postcards', sortOrder: 14 },
  {
    name: 'EDDM Postcard',
    slug: 'eddm-postcard',
    description: 'Every Door Direct Mail postcards',
    sortOrder: 15,
  },

  // Brochures & Folded Materials
  {
    name: 'Brochure',
    slug: 'brochure',
    description: 'Tri-fold and bi-fold brochures',
    sortOrder: 20,
  },
  { name: 'Booklet', slug: 'booklet', description: 'Saddle-stitched booklets', sortOrder: 21 },
  { name: 'Catalog', slug: 'catalog', description: 'Product catalogs', sortOrder: 22 },
  { name: 'Magazine', slug: 'magazine', description: 'Custom magazines', sortOrder: 23 },
  { name: 'Comic Book', slug: 'comic-book', description: 'Comic book printing', sortOrder: 24 },
  { name: 'Newsletter', slug: 'newsletter', description: 'Company newsletters', sortOrder: 25 },

  // Large Format
  { name: 'Banner', slug: 'banner', description: 'Vinyl and fabric banners', sortOrder: 30 },
  { name: 'Poster', slug: 'poster', description: 'Standard posters', sortOrder: 31 },
  {
    name: 'Poster - Short Run (1-100)',
    slug: 'poster-short-run',
    description: 'Small quantity poster runs',
    sortOrder: 32,
  },

  // Business Stationery
  { name: 'Letterhead', slug: 'letterhead', description: 'Professional letterhead', sortOrder: 40 },
  { name: 'Envelope', slug: 'envelope', description: 'Custom envelopes', sortOrder: 41 },
  { name: 'Notepad', slug: 'notepad', description: 'Custom notepads', sortOrder: 42 },
  {
    name: 'Carbonless Form',
    slug: 'carbonless-form',
    description: 'NCR forms and invoices',
    sortOrder: 43,
  },
  {
    name: 'Pocket Folder',
    slug: 'pocket-folder',
    description: 'Presentation folders',
    sortOrder: 44,
  },

  // Cards & Invitations
  {
    name: 'Greeting Card',
    slug: 'greeting-card',
    description: 'Custom greeting cards',
    sortOrder: 50,
  },
  { name: 'Invitation', slug: 'invitation', description: 'Event invitations', sortOrder: 51 },
  { name: 'Folded Card', slug: 'folded-card', description: 'Folded note cards', sortOrder: 52 },
  {
    name: 'Membership Card',
    slug: 'membership-card',
    description: 'Plastic membership cards',
    sortOrder: 53,
  },

  // Marketing Specialties
  { name: 'Door Hanger', slug: 'door-hanger', description: 'Door hanger marketing', sortOrder: 60 },
  {
    name: 'Rip Door Hanger',
    slug: 'rip-door-hanger',
    description: 'Door hangers with tear-off',
    sortOrder: 61,
  },
  { name: 'Rack Card', slug: 'rack-card', description: 'Display rack cards', sortOrder: 62 },
  { name: 'Sales Sheet', slug: 'sales-sheet', description: 'Product sales sheets', sortOrder: 63 },
  { name: 'Menu', slug: 'menu', description: 'Restaurant menus', sortOrder: 64 },
  { name: 'Table Tent', slug: 'table-tent', description: 'Table tent displays', sortOrder: 65 },
  { name: 'Hang Tag', slug: 'hang-tag', description: 'Product hang tags', sortOrder: 66 },

  // Labels & Stickers
  { name: 'Label', slug: 'label', description: 'Custom labels', sortOrder: 70 },
  { name: 'Sticker', slug: 'sticker', description: 'Die-cut stickers', sortOrder: 71 },

  // Promotional Items
  { name: 'Calendar', slug: 'calendar', description: 'Wall and desk calendars', sortOrder: 80 },
  { name: 'Bookmark', slug: 'bookmark', description: 'Custom bookmarks', sortOrder: 81 },
  { name: 'Ticket', slug: 'ticket', description: 'Event and raffle tickets', sortOrder: 82 },
  { name: 'Wristband', slug: 'wristband', description: 'Event wristbands', sortOrder: 83 },
  {
    name: 'Drink Coaster',
    slug: 'drink-coaster',
    description: 'Custom drink coasters',
    sortOrder: 84,
  },
  { name: 'Placemat', slug: 'placemat', description: 'Restaurant placemats', sortOrder: 85 },
  { name: 'Magnet', slug: 'magnet', description: 'Promotional magnets', sortOrder: 86 },

  // Specialty Items
  {
    name: 'Rip Card',
    slug: 'rip-card',
    description: 'Cards with perforated sections',
    sortOrder: 90,
  },
  {
    name: 'Wrapping Paper',
    slug: 'wrapping-paper',
    description: 'Custom wrapping paper',
    sortOrder: 91,
  },
]

async function seedCategories() {
  for (const category of categories) {
    try {
      await prisma.productCategory.upsert({
        where: { slug: category.slug },
        update: {
          name: category.name,
          description: category.description,
          sortOrder: category.sortOrder,
          updatedAt: new Date(),
        },
        create: {
          id: `cat_${category.slug.replace(/-/g, '_')}`,
          name: category.name,
          slug: category.slug,
          description: category.description,
          sortOrder: category.sortOrder,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    } catch (error) {}
  }
}

seedCategories()
  .catch((e) => {
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
