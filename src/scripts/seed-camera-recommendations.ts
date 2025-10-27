/**
 * Seed Camera Recommendations
 *
 * Purpose: Populate intelligent camera-guided workflow recommendations
 *
 * Workflow:
 * 1. User selects camera type
 * 2. System shows what picture types this camera is best for
 * 3. User selects picture type
 * 4. System shows recommended angles for that combo
 * 5. User selects angle
 * 6. System auto-fills technical specs, style, and negative modifiers
 *
 * Date: October 27, 2025
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface CameraRecommendation {
  cameraType: string
  cameraLabel: string
  pictureType: string
  pictureTypeDesc: string
  angleType: string
  angleDesc: string
  recommendedTechnical: string[]
  recommendedStyle: string[]
  recommendedNegative: string[]
  sortOrder: number
}

const recommendations: CameraRecommendation[] = [
  // ============================================================================
  // DSLR CAMERA - Best for versatile professional product photography
  // ============================================================================
  {
    cameraType: 'DSLR Camera',
    cameraLabel: 'DSLR Camera',
    pictureType: 'Product Photography',
    pictureTypeDesc: 'Still life, commercial products, detail shots with excellent depth control',
    angleType: 'Eye Level',
    angleDesc: 'Standard perspective, natural viewpoint, professional look',
    recommendedTechnical: ['8K resolution', 'Sharp focus', 'Studio lighting', 'Bokeh background'],
    recommendedStyle: ['Professional', 'Clean', 'Commercial'],
    recommendedNegative: ['Blurry', 'Low quality', 'Overexposed', 'Motion blur'],
    sortOrder: 1,
  },
  {
    cameraType: 'DSLR Camera',
    cameraLabel: 'DSLR Camera',
    pictureType: 'Product Photography',
    pictureTypeDesc: 'Still life, commercial products, detail shots with excellent depth control',
    angleType: '45 Degree Angle',
    angleDesc: 'Dynamic perspective, shows depth and dimension',
    recommendedTechnical: ['8K resolution', 'Sharp focus', 'Studio lighting', 'Soft shadows'],
    recommendedStyle: ['Professional', 'Dynamic', 'Commercial'],
    recommendedNegative: ['Blurry', 'Low quality', 'Harsh shadows'],
    sortOrder: 2,
  },
  {
    cameraType: 'DSLR Camera',
    cameraLabel: 'DSLR Camera',
    pictureType: 'Product Photography',
    pictureTypeDesc: 'Still life, commercial products, detail shots with excellent depth control',
    angleType: 'Top Down Shot',
    angleDesc: 'Flat lay, overhead perspective, ideal for layouts',
    recommendedTechnical: ['8K resolution', 'Sharp focus', 'Even lighting', 'High contrast'],
    recommendedStyle: ['Clean', 'Minimalist', 'Organized'],
    recommendedNegative: ['Shadows', 'Uneven lighting', 'Distortion'],
    sortOrder: 3,
  },
  {
    cameraType: 'DSLR Camera',
    cameraLabel: 'DSLR Camera',
    pictureType: 'Commercial Work',
    pictureTypeDesc: 'Professional advertising, marketing materials, high-end catalogs',
    angleType: 'Eye Level',
    angleDesc: 'Professional standard for commercial photography',
    recommendedTechnical: ['8K resolution', 'Sharp focus', 'Studio lighting', 'Color accuracy'],
    recommendedStyle: ['Professional', 'Polished', 'Commercial', 'High-end'],
    recommendedNegative: ['Low quality', 'Amateur look', 'Inconsistent lighting'],
    sortOrder: 4,
  },
  {
    cameraType: 'DSLR Camera',
    cameraLabel: 'DSLR Camera',
    pictureType: 'Studio Shots',
    pictureTypeDesc: 'Controlled environment, professional lighting setups',
    angleType: 'Eye Level',
    angleDesc: 'Professional standard perspective',
    recommendedTechnical: ['Sharp focus', 'Studio lighting', 'Controlled environment', 'High contrast'],
    recommendedStyle: ['Professional', 'Clean', 'Dramatic'],
    recommendedNegative: ['Natural light', 'Outdoor', 'Ambient lighting'],
    sortOrder: 5,
  },

  // ============================================================================
  // MIRRORLESS CAMERA - Best for modern product shots and action photography
  // ============================================================================
  {
    cameraType: 'Mirrorless Camera',
    cameraLabel: 'Mirrorless Camera',
    pictureType: 'Modern Product Shots',
    pictureTypeDesc: 'Contemporary products, tech items, lifestyle integration',
    angleType: 'Eye Level',
    angleDesc: 'Clean, modern perspective',
    recommendedTechnical: ['4K resolution', 'Fast autofocus', 'Natural lighting', 'Depth of field'],
    recommendedStyle: ['Modern', 'Sleek', 'Contemporary'],
    recommendedNegative: ['Vintage look', 'Dated', 'Heavy grain'],
    sortOrder: 6,
  },
  {
    cameraType: 'Mirrorless Camera',
    cameraLabel: 'Mirrorless Camera',
    pictureType: 'Modern Product Shots',
    pictureTypeDesc: 'Contemporary products, tech items, lifestyle integration',
    angleType: 'Low Angle Shot',
    angleDesc: 'Dynamic, attention-grabbing perspective',
    recommendedTechnical: ['4K resolution', 'Fast autofocus', 'Dramatic lighting'],
    recommendedStyle: ['Modern', 'Bold', 'Dynamic'],
    recommendedNegative: ['Flat', 'Static', 'Boring'],
    sortOrder: 7,
  },
  {
    cameraType: 'Mirrorless Camera',
    cameraLabel: 'Mirrorless Camera',
    pictureType: 'Action Photography',
    pictureTypeDesc: 'Movement, fast-paced, dynamic action shots',
    angleType: 'Eye Level',
    angleDesc: 'Captures motion at natural perspective',
    recommendedTechnical: ['Fast autofocus', 'High frame rate', 'Action freeze'],
    recommendedStyle: ['Dynamic', 'Energetic', 'Motion'],
    recommendedNegative: ['Static', 'Motion blur', 'Slow shutter'],
    sortOrder: 8,
  },
  {
    cameraType: 'Mirrorless Camera',
    cameraLabel: 'Mirrorless Camera',
    pictureType: 'Video Content',
    pictureTypeDesc: 'Video production, promotional videos, social media content',
    angleType: 'Eye Level',
    angleDesc: 'Standard video perspective',
    recommendedTechnical: ['4K resolution', 'Cinematic', 'Smooth motion'],
    recommendedStyle: ['Cinematic', 'Professional', 'Smooth'],
    recommendedNegative: ['Jerky motion', 'Low framerate', 'Shaky'],
    sortOrder: 9,
  },

  // ============================================================================
  // MEDIUM FORMAT CAMERA - Best for high-resolution commercial work
  // ============================================================================
  {
    cameraType: 'Medium Format Camera',
    cameraLabel: 'Medium Format Camera',
    pictureType: 'High-Resolution Commercial',
    pictureTypeDesc: 'Maximum detail, large format prints, premium advertising',
    angleType: 'Eye Level',
    angleDesc: 'Professional standard for high-end work',
    recommendedTechnical: ['Maximum resolution', 'Exceptional detail', 'Studio lighting', 'Color accuracy'],
    recommendedStyle: ['Premium', 'High-end', 'Luxury', 'Professional'],
    recommendedNegative: ['Low resolution', 'Compression', 'Loss of detail'],
    sortOrder: 10,
  },
  {
    cameraType: 'Medium Format Camera',
    cameraLabel: 'Medium Format Camera',
    pictureType: 'High-Resolution Commercial',
    pictureTypeDesc: 'Maximum detail, large format prints, premium advertising',
    angleType: '45 Degree Angle',
    angleDesc: 'Shows dimension with maximum detail',
    recommendedTechnical: ['Maximum resolution', 'Exceptional detail', 'Studio lighting', 'Soft shadows'],
    recommendedStyle: ['Premium', 'High-end', 'Elegant'],
    recommendedNegative: ['Low resolution', 'Harsh shadows', 'Noise'],
    sortOrder: 11,
  },
  {
    cameraType: 'Medium Format Camera',
    cameraLabel: 'Medium Format Camera',
    pictureType: 'Fashion Photography',
    pictureTypeDesc: 'High-end fashion, luxury products, editorial work',
    angleType: 'Eye Level',
    angleDesc: 'Classic fashion photography angle',
    recommendedTechnical: ['Maximum resolution', 'Studio lighting', 'Color accuracy', 'Smooth tones'],
    recommendedStyle: ['Elegant', 'Luxury', 'High-end', 'Fashion'],
    recommendedNegative: ['Casual', 'Amateur', 'Low quality'],
    sortOrder: 12,
  },
  {
    cameraType: 'Medium Format Camera',
    cameraLabel: 'Medium Format Camera',
    pictureType: 'Large Format Prints',
    pictureTypeDesc: 'Billboard-sized, gallery prints, maximum detail required',
    angleType: 'Eye Level',
    angleDesc: 'Standard perspective for large reproduction',
    recommendedTechnical: ['Maximum resolution', 'Exceptional detail', 'Perfect exposure', 'No compression'],
    recommendedStyle: ['Professional', 'Gallery-quality', 'Premium'],
    recommendedNegative: ['Compression', 'Noise', 'Artifacts', 'Low resolution'],
    sortOrder: 13,
  },

  // ============================================================================
  // LARGE FORMAT CAMERA - Best for maximum detail and fine art prints
  // ============================================================================
  {
    cameraType: 'Large Format Camera',
    cameraLabel: 'Large Format Camera',
    pictureType: 'Maximum Detail Photography',
    pictureTypeDesc: 'Architectural details, fine art, museum-quality work',
    angleType: 'Eye Level',
    angleDesc: 'Precise perspective control',
    recommendedTechnical: ['Maximum resolution', 'Tilt-shift', 'Perfect geometry', 'No distortion'],
    recommendedStyle: ['Architectural', 'Precise', 'Technical', 'Professional'],
    recommendedNegative: ['Distortion', 'Perspective error', 'Soft focus'],
    sortOrder: 14,
  },
  {
    cameraType: 'Large Format Camera',
    cameraLabel: 'Large Format Camera',
    pictureType: 'Fine Art Prints',
    pictureTypeDesc: 'Gallery exhibitions, museum collections, art photography',
    angleType: 'Eye Level',
    angleDesc: 'Classic fine art perspective',
    recommendedTechnical: ['Maximum resolution', 'Perfect tonal range', 'No compression', 'Archival quality'],
    recommendedStyle: ['Artistic', 'Gallery-quality', 'Timeless', 'Elegant'],
    recommendedNegative: ['Digital look', 'Over-processed', 'Noise'],
    sortOrder: 15,
  },
  {
    cameraType: 'Large Format Camera',
    cameraLabel: 'Large Format Camera',
    pictureType: 'Architectural Photography',
    pictureTypeDesc: 'Buildings, interiors, real estate, construction documentation',
    angleType: 'Eye Level',
    angleDesc: 'Maintains vertical lines, no distortion',
    recommendedTechnical: ['Tilt-shift', 'Perfect geometry', 'Wide angle', 'HDR'],
    recommendedStyle: ['Architectural', 'Precise', 'Professional'],
    recommendedNegative: ['Distortion', 'Converging lines', 'Fish-eye'],
    sortOrder: 16,
  },

  // ============================================================================
  // FILM CAMERA - Best for authentic vintage aesthetic
  // ============================================================================
  {
    cameraType: 'Film Camera',
    cameraLabel: 'Film Camera',
    pictureType: 'Vintage Aesthetic',
    pictureTypeDesc: 'Retro products, nostalgic themes, analog feel',
    angleType: 'Eye Level',
    angleDesc: 'Classic vintage perspective',
    recommendedTechnical: ['Film grain', 'Analog texture', 'Soft focus', 'Natural color'],
    recommendedStyle: ['Vintage', 'Retro', 'Nostalgic', 'Authentic'],
    recommendedNegative: ['Digital', 'Sharp', 'Modern', 'HDR'],
    sortOrder: 17,
  },
  {
    cameraType: 'Film Camera',
    cameraLabel: 'Film Camera',
    pictureType: 'Vintage Aesthetic',
    pictureTypeDesc: 'Retro products, nostalgic themes, analog feel',
    angleType: 'Low Angle Shot',
    angleDesc: 'Classic film photography composition',
    recommendedTechnical: ['Film grain', 'Analog texture', 'Natural lighting'],
    recommendedStyle: ['Vintage', 'Retro', 'Classic', 'Timeless'],
    recommendedNegative: ['Digital', 'Over-processed', 'HDR'],
    sortOrder: 18,
  },
  {
    cameraType: 'Film Camera',
    cameraLabel: 'Film Camera',
    pictureType: 'Authentic Photography',
    pictureTypeDesc: 'Real film look, organic feel, unprocessed aesthetic',
    angleType: 'Eye Level',
    angleDesc: 'Natural, unforced perspective',
    recommendedTechnical: ['Film grain', 'Analog texture', 'Natural color', 'Organic look'],
    recommendedStyle: ['Authentic', 'Natural', 'Organic', 'Real'],
    recommendedNegative: ['Digital', 'Artificial', 'Over-edited', 'Perfect'],
    sortOrder: 19,
  },
  {
    cameraType: 'Film Camera',
    cameraLabel: 'Film Camera',
    pictureType: 'Lifestyle Photography',
    pictureTypeDesc: 'Candid moments, everyday life, natural settings',
    angleType: 'Eye Level',
    angleDesc: 'Natural, documentary-style perspective',
    recommendedTechnical: ['Film grain', 'Natural lighting', 'Soft focus'],
    recommendedStyle: ['Natural', 'Candid', 'Lifestyle', 'Organic'],
    recommendedNegative: ['Staged', 'Studio', 'Artificial'],
    sortOrder: 20,
  },
]

async function main() {
  console.log('🎥 Starting camera recommendations seed...\n')

  // Check if --reset flag is passed
  const shouldReset = process.argv.includes('--reset')

  if (shouldReset) {
    console.log('🗑️  Deleting existing camera recommendations...')
    const deleted = await prisma.cameraRecommendation.deleteMany({})
    console.log(`   ✅ Deleted ${deleted.count} existing recommendations\n`)
  }

  console.log('📊 Creating camera recommendations...\n')

  let created = 0
  for (const rec of recommendations) {
    try {
      await prisma.cameraRecommendation.create({
        data: rec,
      })
      created++
      console.log(
        `   ✅ ${rec.cameraType} → ${rec.pictureType} → ${rec.angleType}`
      )
    } catch (error) {
      console.error(`   ❌ Failed to create recommendation:`, error)
    }
  }

  console.log(`\n✨ Successfully created ${created}/${recommendations.length} camera recommendations`)

  // Summary
  console.log('\n📊 Summary by Camera Type:')
  const summary = recommendations.reduce((acc, rec) => {
    if (!acc[rec.cameraType]) acc[rec.cameraType] = 0
    acc[rec.cameraType]++
    return acc
  }, {} as Record<string, number>)

  Object.entries(summary).forEach(([camera, count]) => {
    console.log(`   ${camera}: ${count} recommendations`)
  })

  console.log('\n✅ Camera recommendations seed complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
