/**
 * Seed Script: Modifier Presets for Design Center Quick-Select UI
 *
 * Purpose: Populate the ModifierPreset table with common modifiers
 * for faster template creation.
 *
 * Usage: npx tsx src/scripts/seed-modifiers.ts
 *
 * Date: October 27, 2025
 */

import { PrismaClient, ModifierCategory } from '@prisma/client'

const prisma = new PrismaClient()

interface ModifierData {
  category: ModifierCategory
  label: string
  value: string
  description: string
  sortOrder: number
}

const MODIFIER_PRESETS: ModifierData[] = [
  // ==================== STYLE MODIFIERS ====================
  {
    category: 'STYLE',
    label: 'Professional',
    value: 'professional photography style, clean corporate aesthetic',
    description: 'Clean, corporate look perfect for business materials',
    sortOrder: 1,
  },
  {
    category: 'STYLE',
    label: 'Lifestyle',
    value: 'lifestyle photography, casual real-world setting',
    description: 'Natural, everyday scenarios that feel authentic',
    sortOrder: 2,
  },
  {
    category: 'STYLE',
    label: 'Minimalist',
    value: 'minimalist style, simple clean composition, negative space',
    description: 'Simple, uncluttered design with plenty of breathing room',
    sortOrder: 3,
  },
  {
    category: 'STYLE',
    label: 'Vibrant',
    value: 'vibrant colors, energetic mood, bold saturated tones',
    description: 'Eye-catching, colorful design that pops',
    sortOrder: 4,
  },
  {
    category: 'STYLE',
    label: 'Elegant',
    value: 'elegant refined aesthetic, sophisticated styling',
    description: 'Upscale, refined look for premium feel',
    sortOrder: 5,
  },
  {
    category: 'STYLE',
    label: 'Modern',
    value: 'modern contemporary design, current trends',
    description: 'On-trend, current aesthetic',
    sortOrder: 6,
  },
  {
    category: 'STYLE',
    label: 'Bold',
    value: 'bold dramatic style, high contrast, strong visual impact',
    description: 'Strong, attention-grabbing design',
    sortOrder: 7,
  },
  {
    category: 'STYLE',
    label: 'Clean',
    value: 'clean crisp aesthetic, organized layout',
    description: 'Neat, well-organized appearance',
    sortOrder: 8,
  },
  {
    category: 'STYLE',
    label: 'Artistic',
    value: 'artistic creative style, unique perspective',
    description: 'Creative, unique artistic approach',
    sortOrder: 9,
  },
  {
    category: 'STYLE',
    label: 'Corporate',
    value: 'corporate business style, traditional professional',
    description: 'Traditional business aesthetic',
    sortOrder: 10,
  },
  {
    category: 'STYLE',
    label: 'Casual',
    value: 'casual relaxed vibe, friendly approachable',
    description: 'Friendly, approachable feel',
    sortOrder: 11,
  },

  // ==================== TECHNICAL SPECS ====================
  {
    category: 'TECHNICAL',
    label: 'High Resolution',
    value: 'high resolution, ultra detailed, sharp crisp detail',
    description: 'Maximum detail and clarity',
    sortOrder: 1,
  },
  {
    category: 'TECHNICAL',
    label: 'Studio Lighting',
    value: 'professional studio lighting, controlled even illumination',
    description: 'Perfect, controlled lighting setup',
    sortOrder: 2,
  },
  {
    category: 'TECHNICAL',
    label: 'Sharp Focus',
    value: 'tack sharp focus, crystal clear details',
    description: 'Perfectly focused throughout',
    sortOrder: 3,
  },
  {
    category: 'TECHNICAL',
    label: '4K Quality',
    value: '4K quality, ultra high definition',
    description: 'Ultra high definition output',
    sortOrder: 4,
  },
  {
    category: 'TECHNICAL',
    label: 'HDR',
    value: 'HDR lighting, high dynamic range, balanced exposure',
    description: 'Excellent highlight and shadow detail',
    sortOrder: 5,
  },
  {
    category: 'TECHNICAL',
    label: 'Macro Detail',
    value: 'macro photography, extreme close-up detail',
    description: 'Very close-up, detailed view',
    sortOrder: 6,
  },
  {
    category: 'TECHNICAL',
    label: 'Wide Angle',
    value: 'wide angle view, expansive perspective',
    description: 'Broad field of view',
    sortOrder: 7,
  },
  {
    category: 'TECHNICAL',
    label: 'Bokeh Effect',
    value: 'shallow depth of field, beautiful bokeh, blurred background',
    description: 'Blurred background for subject focus',
    sortOrder: 8,
  },
  {
    category: 'TECHNICAL',
    label: 'Natural Lighting',
    value: 'natural daylight, soft window light',
    description: 'Soft, natural light appearance',
    sortOrder: 9,
  },
  {
    category: 'TECHNICAL',
    label: 'Soft Shadows',
    value: 'soft diffused shadows, gentle lighting gradient',
    description: 'Gentle, flattering shadows',
    sortOrder: 10,
  },
  {
    category: 'TECHNICAL',
    label: 'Even Lighting',
    value: 'perfectly even lighting, no harsh shadows',
    description: 'Uniform illumination throughout',
    sortOrder: 11,
  },
  {
    category: 'TECHNICAL',
    label: 'Color Accurate',
    value: 'color accurate, true to life colors, proper white balance',
    description: 'True-to-life color reproduction',
    sortOrder: 12,
  },

  // ==================== NEGATIVE PROMPTS ====================
  {
    category: 'NEGATIVE',
    label: 'No Blur',
    value: 'blurry, out of focus, soft focus',
    description: 'Avoid any blur or soft focus',
    sortOrder: 1,
  },
  {
    category: 'NEGATIVE',
    label: 'No Low Quality',
    value: 'low quality, poor resolution, compressed, artifacts',
    description: 'Avoid low quality or compression',
    sortOrder: 2,
  },
  {
    category: 'NEGATIVE',
    label: 'No Overexposure',
    value: 'overexposed, blown out highlights, too bright',
    description: 'Avoid overly bright or washed out',
    sortOrder: 3,
  },
  {
    category: 'NEGATIVE',
    label: 'No Underexposure',
    value: 'underexposed, too dark, crushed blacks',
    description: 'Avoid too dark or muddy shadows',
    sortOrder: 4,
  },
  {
    category: 'NEGATIVE',
    label: 'No Distortion',
    value: 'distorted, warped, stretched, skewed',
    description: 'Avoid distorted or warped appearance',
    sortOrder: 5,
  },
  {
    category: 'NEGATIVE',
    label: 'No Pixelation',
    value: 'pixelated, blocky, low resolution, jaggy',
    description: 'Avoid pixelated or blocky look',
    sortOrder: 6,
  },
  {
    category: 'NEGATIVE',
    label: 'No Dark Images',
    value: 'dark, dim, poorly lit, shadowy',
    description: 'Avoid overly dark images',
    sortOrder: 7,
  },
  {
    category: 'NEGATIVE',
    label: 'No Grain',
    value: 'grainy, noisy, high ISO noise',
    description: 'Avoid grain or digital noise',
    sortOrder: 8,
  },
  {
    category: 'NEGATIVE',
    label: 'No Washed Out',
    value: 'washed out, faded, low contrast, flat',
    description: 'Avoid washed out or faded look',
    sortOrder: 9,
  },
  {
    category: 'NEGATIVE',
    label: 'No Poor Composition',
    value: 'poor composition, cluttered, awkward framing',
    description: 'Avoid cluttered or awkward layouts',
    sortOrder: 10,
  },
  {
    category: 'NEGATIVE',
    label: 'No Text',
    value: 'text, words, letters, typography, written content',
    description: 'Avoid any text or typography in image',
    sortOrder: 11,
  },

  // ==================== HOLIDAYS/SEASONS ====================
  {
    category: 'HOLIDAY',
    label: 'None',
    value: '',
    description: 'No holiday or seasonal theme',
    sortOrder: 0,
  },
  {
    category: 'HOLIDAY',
    label: 'Christmas',
    value: 'Christmas theme, festive holiday spirit, red and green colors, winter celebration',
    description: 'Christmas holiday theme with festive elements',
    sortOrder: 1,
  },
  {
    category: 'HOLIDAY',
    label: 'Easter',
    value: 'Easter theme, spring celebration, pastel colors, renewal',
    description: 'Easter spring theme with pastel tones',
    sortOrder: 2,
  },
  {
    category: 'HOLIDAY',
    label: 'Halloween',
    value: 'Halloween theme, autumn celebration, orange and black, spooky fun',
    description: 'Halloween theme with autumn colors',
    sortOrder: 3,
  },
  {
    category: 'HOLIDAY',
    label: 'Thanksgiving',
    value: 'Thanksgiving theme, autumn harvest, warm earth tones, gratitude',
    description: 'Thanksgiving harvest theme',
    sortOrder: 4,
  },
  {
    category: 'HOLIDAY',
    label: "Valentine's Day",
    value: "Valentine's Day theme, romantic, red and pink colors, love celebration",
    description: "Valentine's romantic theme",
    sortOrder: 5,
  },
  {
    category: 'HOLIDAY',
    label: "New Year's",
    value: "New Year's celebration, fresh start, festive champagne, midnight celebration",
    description: "New Year's celebration theme",
    sortOrder: 6,
  },
  {
    category: 'HOLIDAY',
    label: 'Summer',
    value: 'summer season, bright sunny, vibrant warm colors, outdoor energy',
    description: 'Bright, energetic summer theme',
    sortOrder: 7,
  },
  {
    category: 'HOLIDAY',
    label: 'Fall/Autumn',
    value: 'fall autumn season, warm earth tones, cozy atmosphere',
    description: 'Warm, cozy autumn theme',
    sortOrder: 8,
  },
  {
    category: 'HOLIDAY',
    label: 'Winter',
    value: 'winter season, cool tones, crisp clean, peaceful calm',
    description: 'Cool, crisp winter theme',
    sortOrder: 9,
  },
  {
    category: 'HOLIDAY',
    label: 'Spring',
    value: 'spring season, fresh renewal, light pastels, blooming growth',
    description: 'Fresh, renewing spring theme',
    sortOrder: 10,
  },
  {
    category: 'HOLIDAY',
    label: "Mother's Day",
    value: "Mother's Day celebration, appreciation, soft feminine colors",
    description: "Mother's Day appreciation theme",
    sortOrder: 11,
  },
  {
    category: 'HOLIDAY',
    label: "Father's Day",
    value: "Father's Day celebration, appreciation, strong masculine tones",
    description: "Father's Day appreciation theme",
    sortOrder: 12,
  },
  {
    category: 'HOLIDAY',
    label: 'Fourth of July',
    value: 'Fourth of July, Independence Day, red white blue, patriotic American celebration',
    description: 'American patriotic theme',
    sortOrder: 13,
  },

  // ==================== LOCATION/SETTING ====================
  {
    category: 'LOCATION',
    label: 'Office',
    value: 'professional office setting, modern workspace, desk environment',
    description: 'Professional office environment',
    sortOrder: 1,
  },
  {
    category: 'LOCATION',
    label: 'Outside Office',
    value: 'outside office building, corporate exterior, business district',
    description: 'Exterior office or business area',
    sortOrder: 2,
  },
  {
    category: 'LOCATION',
    label: 'Home',
    value: 'home setting, residential interior, comfortable living space',
    description: 'Residential home environment',
    sortOrder: 3,
  },
  {
    category: 'LOCATION',
    label: 'Warehouse',
    value: 'warehouse facility, industrial storage, large open space',
    description: 'Industrial warehouse setting',
    sortOrder: 4,
  },
  {
    category: 'LOCATION',
    label: 'Factory',
    value: 'factory floor, manufacturing facility, production environment',
    description: 'Manufacturing facility setting',
    sortOrder: 5,
  },
  {
    category: 'LOCATION',
    label: 'Studio',
    value: 'photo studio, pure white background, controlled environment',
    description: 'Clean studio with white backdrop',
    sortOrder: 6,
  },
  {
    category: 'LOCATION',
    label: 'Outdoor',
    value: 'outdoor setting, natural environment, open air',
    description: 'Natural outdoor environment',
    sortOrder: 7,
  },
  {
    category: 'LOCATION',
    label: 'Retail Store',
    value: 'retail store, shopping environment, commercial space',
    description: 'Retail shopping environment',
    sortOrder: 8,
  },
  {
    category: 'LOCATION',
    label: 'Coffee Shop',
    value: 'coffee shop cafe, casual meeting place, warm inviting',
    description: 'Casual coffee shop setting',
    sortOrder: 9,
  },
  {
    category: 'LOCATION',
    label: 'Urban',
    value: 'urban city setting, downtown environment, metropolitan',
    description: 'City or downtown setting',
    sortOrder: 10,
  },
  {
    category: 'LOCATION',
    label: 'Nature',
    value: 'natural outdoor environment, scenic landscape, greenery',
    description: 'Natural landscape setting',
    sortOrder: 11,
  },
  {
    category: 'LOCATION',
    label: 'Restaurant',
    value: 'restaurant dining setting, food service environment',
    description: 'Restaurant or dining setting',
    sortOrder: 12,
  },
  {
    category: 'LOCATION',
    label: 'Event Space',
    value: 'event venue, conference hall, gathering space',
    description: 'Event or conference venue',
    sortOrder: 13,
  },
  {
    category: 'LOCATION',
    label: 'Print Shop',
    value: 'print shop facility, printing equipment, production area',
    description: 'Printing facility environment',
    sortOrder: 14,
  },
  {
    category: 'LOCATION',
    label: 'Indoors',
    value: 'indoor environment, interior setting, controlled indoor space',
    description: 'Indoor environment or interior setting',
    sortOrder: 15,
  },
  {
    category: 'LOCATION',
    label: 'Outdoors',
    value: 'outdoor environment, exterior setting, natural outdoor space',
    description: 'Outdoor environment or exterior setting',
    sortOrder: 16,
  },

  // ==================== CAMERA/EQUIPMENT ====================
  {
    category: 'CAMERA',
    label: 'DSLR Camera',
    value: 'professional DSLR camera, versatile professional photography, commercial work, studio shots',
    description: 'Best for versatile professional product photography, commercial work, and studio shots',
    sortOrder: 1,
  },
  {
    category: 'CAMERA',
    label: 'Mirrorless Camera',
    value: 'mirrorless camera system, modern product shots, action photography, video content',
    description: 'Best for modern product shots, action photography, and video content',
    sortOrder: 2,
  },
  {
    category: 'CAMERA',
    label: 'Medium Format Camera',
    value: 'medium format camera, high-end product photography, fashion, commercial campaigns, maximum detail',
    description: 'Best for high-resolution commercial work, fashion photography, and large format prints',
    sortOrder: 3,
  },
  {
    category: 'CAMERA',
    label: 'Large Format Camera',
    value: 'large format camera, architectural photography, fine art prints, ultra-high resolution product shots',
    description: 'Best for maximum detail photography, fine art prints, and architectural work',
    sortOrder: 4,
  },
  {
    category: 'CAMERA',
    label: 'Film Camera',
    value: 'analog film photography, vintage aesthetic product shots, artistic photography, unique character',
    description: 'Best for vintage aesthetic product shots, artistic photography, and unique character',
    sortOrder: 5,
  },
  {
    category: 'CAMERA',
    label: 'Wide Angle Lens',
    value: 'wide angle lens, expansive field of view, architectural perspective',
    description: 'Wide angle lens for expansive views',
    sortOrder: 6,
  },
  {
    category: 'CAMERA',
    label: 'Telephoto Lens',
    value: 'telephoto lens, compressed perspective, shallow depth of field',
    description: 'Telephoto lens for compressed perspective',
    sortOrder: 7,
  },
  {
    category: 'CAMERA',
    label: 'Macro Lens',
    value: 'macro lens, extreme close-up detail, magnified view',
    description: 'Macro lens for extreme close-up detail',
    sortOrder: 8,
  },
  {
    category: 'CAMERA',
    label: 'Prime Lens',
    value: 'prime lens, sharp crisp optics, exceptional image quality',
    description: 'Prime lens with exceptional sharpness',
    sortOrder: 9,
  },
  {
    category: 'CAMERA',
    label: 'Tilt-Shift Lens',
    value: 'tilt-shift lens, perspective control, miniature effect',
    description: 'Tilt-shift lens for perspective control',
    sortOrder: 10,
  },
  {
    category: 'CAMERA',
    label: 'Fisheye Lens',
    value: 'fisheye lens, ultra wide distortion, spherical perspective',
    description: 'Fisheye lens with ultra wide distortion',
    sortOrder: 11,
  },
  {
    category: 'CAMERA',
    label: 'Studio Shot',
    value: 'professional studio photography setup, controlled environment, seamless backdrop',
    description: 'Professional studio photography setup',
    sortOrder: 12,
  },
  {
    category: 'CAMERA',
    label: 'Lifestyle Shot',
    value: 'lifestyle photography, natural candid moments, authentic scene',
    description: 'Natural lifestyle photography',
    sortOrder: 13,
  },
  {
    category: 'CAMERA',
    label: 'Product Shot',
    value: 'commercial product photography, catalog style, clean presentation',
    description: 'Commercial product photography',
    sortOrder: 14,
  },
  {
    category: 'CAMERA',
    label: 'Editorial Shot',
    value: 'editorial photography, magazine quality, artistic composition',
    description: 'Editorial magazine-quality photography',
    sortOrder: 15,
  },
  {
    category: 'CAMERA',
    label: 'Environmental Portrait',
    value: 'environmental portrait, subject in context, location storytelling',
    description: 'Environmental portrait with context',
    sortOrder: 16,
  },
  {
    category: 'CAMERA',
    label: "Bird's Eye View",
    value: "overhead bird's eye view, top-down perspective, flat lay composition",
    description: 'Overhead top-down perspective',
    sortOrder: 17,
  },
  {
    category: 'CAMERA',
    label: 'Low Angle Shot',
    value: 'low angle shot, dramatic upward perspective, powerful viewpoint',
    description: 'Low angle dramatic perspective',
    sortOrder: 18,
  },
  {
    category: 'CAMERA',
    label: 'In Front Of',
    value: 'positioned in front of subject, foreground perspective, frontal composition',
    description: 'Camera positioned in front of subject',
    sortOrder: 19,
  },
  {
    category: 'CAMERA',
    label: 'In Back Of',
    value: 'positioned behind subject, background perspective, rear view composition',
    description: 'Camera positioned behind subject',
    sortOrder: 20,
  },
]

async function main() {
  console.log('🌱 Starting modifier preset seed...')

  // Count existing modifiers
  const existingCount = await prisma.modifierPreset.count()
  console.log(`📊 Found ${existingCount} existing modifier presets`)

  if (existingCount > 0) {
    console.log('⚠️  Database already has modifiers. Options:')
    console.log('   1. Delete all and reseed: npx tsx src/scripts/seed-modifiers.ts --reset')
    console.log('   2. Keep existing and skip: (doing nothing)')

    const shouldReset = process.argv.includes('--reset')

    if (shouldReset) {
      console.log('🗑️  Deleting all existing modifiers...')
      await prisma.modifierPreset.deleteMany()
      console.log('✅ Deleted all existing modifiers')
    } else {
      console.log('⏭️  Skipping seed (use --reset flag to reseed)')
      return
    }
  }

  let createdCount = 0
  let skippedCount = 0

  for (const modifier of MODIFIER_PRESETS) {
    try {
      await prisma.modifierPreset.create({
        data: modifier,
      })
      createdCount++
      console.log(`✅ Created: [${modifier.category}] ${modifier.label}`)
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        skippedCount++
        console.log(`⏭️  Skipped (exists): [${modifier.category}] ${modifier.label}`)
      } else {
        console.error(`❌ Error creating ${modifier.label}:`, error)
        throw error
      }
    }
  }

  console.log('\n📈 Seed Summary:')
  console.log(`   ✅ Created: ${createdCount}`)
  console.log(`   ⏭️  Skipped: ${skippedCount}`)
  console.log(`   📊 Total: ${MODIFIER_PRESETS.length}`)

  // Show breakdown by category
  const counts = await prisma.modifierPreset.groupBy({
    by: ['category'],
    _count: true,
  })

  console.log('\n📋 Breakdown by Category:')
  counts.forEach((count) => {
    console.log(`   ${count.category}: ${count._count} modifiers`)
  })

  console.log('\n🎉 Modifier preset seed complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
