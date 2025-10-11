import { PrismaClient } from '@prisma/client'
import { createId } from '@paralleldrive/cuid2'

const prisma = new PrismaClient()

async function restoreAndProtectAllAddons() {
  console.log('='.repeat(60))

  console.log('='.repeat(60))

  try {
    // First, verify Corner Rounding is safe

    const cornerRounding = await prisma.addOn.findFirst({
      where: { name: 'Corner Rounding' },
    })

    if (cornerRounding) {
      const config = cornerRounding.configuration as any
      if (config?.conditionalFields?.cornerType?.label === 'ROUNDED CORNERS') {
      } else {
        await updateCornerRounding(cornerRounding.id)
      }
    } else {
      await createCornerRounding()
    }

    // Now restore all missing addons

    const allAddons = [
      {
        name: 'Variable Data Printing',
        pricingModel: 'CUSTOM',
        configuration: {
          type: 'variable_data',
          basePrice: 60,
          pricePerPiece: 0.02,
          displayPrice: '$60.00 + $0.02/piece',
          conditionalFields: {
            dataFields: {
              label: 'Variable Fields',
              type: 'multiselect',
              options: [
                'Name Personalization',
                'Sequential Numbering',
                'Unique QR Codes',
                'Custom Addresses',
                'Personalized Images',
                'Variable Barcodes',
              ],
              required: true,
              displayType: 'checkbox',
            },
          },
        },
        tooltipText: 'Print unique information on each piece',
        isActive: true,
      },
      {
        name: 'Perforation',
        pricingModel: 'CUSTOM',
        configuration: {
          type: 'perforation',
          basePrice: 25,
          pricePerPiece: 0.005,
          displayPrice: '$25.00 + $0.005/piece',
          conditionalFields: {
            position: {
              label: 'Perforation Position',
              type: 'select',
              options: ['Horizontal', 'Vertical', 'Both'],
              required: true,
              displayType: 'dropdown',
            },
          },
        },
        tooltipText: 'Add tear-away perforations for coupons or tickets',
        isActive: true,
      },
      {
        name: 'Banding',
        pricingModel: 'CUSTOM',
        configuration: {
          type: 'banding',
          basePrice: 15,
          pricePerBundle: 2,
          displayPrice: '$15.00 + $2.00/bundle',
          conditionalFields: {
            bandType: {
              label: 'Band Type',
              type: 'select',
              options: ['Paper Band', 'Rubber Band'],
              required: true,
              displayType: 'dropdown',
            },
          },
        },
        tooltipText: 'Bundle your products with paper or rubber bands',
        isActive: true,
      },
      {
        name: 'Foil Stamping',
        pricingModel: 'PERCENTAGE',
        configuration: {
          type: 'foil_stamping',
          percentage: 35,
          displayPrice: '+35% of base price',
        },
        tooltipText: 'Add metallic foil accents for premium appeal',
        isActive: true,
      },
      {
        name: 'Embossing',
        pricingModel: 'PERCENTAGE',
        configuration: {
          type: 'embossing',
          percentage: 30,
          displayPrice: '+30% of base price',
        },
        tooltipText: 'Create raised impressions for elegant texture',
        isActive: true,
      },
      {
        name: 'Die Cutting',
        pricingModel: 'CUSTOM',
        configuration: {
          type: 'die_cutting',
          basePrice: 50,
          pricePerPiece: 0.02,
          displayPrice: '$50.00 + $0.02/piece',
        },
        tooltipText: 'Custom shapes and cuts for unique designs',
        isActive: true,
      },
      {
        name: 'Spot UV',
        pricingModel: 'PERCENTAGE',
        configuration: {
          type: 'spot_uv',
          percentage: 25,
          displayPrice: '+25% of base price',
        },
        tooltipText: 'Glossy UV coating on specific areas',
        isActive: true,
      },
      {
        name: 'Raised Spot UV',
        pricingModel: 'PERCENTAGE',
        configuration: {
          type: 'raised_spot_uv',
          percentage: 40,
          displayPrice: '+40% of base price',
        },
        tooltipText: 'Raised glossy coating for premium texture',
        isActive: true,
      },
      {
        name: 'Letterpress',
        pricingModel: 'PERCENTAGE',
        configuration: {
          type: 'letterpress',
          percentage: 45,
          displayPrice: '+45% of base price',
        },
        tooltipText: 'Traditional pressed printing for vintage appeal',
        isActive: true,
      },
      {
        name: 'Edge Painting',
        pricingModel: 'CUSTOM',
        configuration: {
          type: 'edge_painting',
          basePrice: 30,
          pricePerPiece: 0.03,
          displayPrice: '$30.00 + $0.03/piece',
        },
        tooltipText: 'Color the edges of thick cards',
        isActive: true,
      },
      {
        name: 'Plastic Card',
        pricingModel: 'PERCENTAGE',
        configuration: {
          type: 'plastic_card',
          percentage: 60,
          displayPrice: '+60% of base price',
        },
        tooltipText: 'Durable plastic cards instead of paper',
        isActive: true,
      },
      {
        name: 'Magnetic Strip',
        pricingModel: 'CUSTOM',
        configuration: {
          type: 'magnetic_strip',
          basePrice: 40,
          pricePerPiece: 0.05,
          displayPrice: '$40.00 + $0.05/piece',
        },
        tooltipText: 'Add magnetic strip for card functionality',
        isActive: true,
      },
      {
        name: 'Signature Strip',
        pricingModel: 'CUSTOM',
        configuration: {
          type: 'signature_strip',
          basePrice: 10,
          pricePerPiece: 0.01,
          displayPrice: '$10.00 + $0.01/piece',
        },
        tooltipText: 'White strip for signatures on cards',
        isActive: true,
      },
      {
        name: 'Scratch-off Panel',
        pricingModel: 'CUSTOM',
        configuration: {
          type: 'scratch_off',
          basePrice: 35,
          pricePerPiece: 0.04,
          displayPrice: '$35.00 + $0.04/piece',
        },
        tooltipText: 'Add scratch-off areas for promotions',
        isActive: true,
      },
      {
        name: 'Folding',
        pricingModel: 'CUSTOM',
        configuration: {
          type: 'folding',
          basePrice: 20,
          pricePerPiece: 0.01,
          displayPrice: '$20.00 + $0.01/piece',
        },
        tooltipText: 'Professional folding for brochures',
        isActive: true,
      },
      {
        name: 'Scoring',
        pricingModel: 'CUSTOM',
        configuration: {
          type: 'scoring',
          basePrice: 15,
          pricePerPiece: 0.005,
          displayPrice: '$15.00 + $0.005/piece',
        },
        tooltipText: 'Pre-score for clean folds',
        isActive: true,
      },
      {
        name: 'Hole Drilling',
        pricingModel: 'CUSTOM',
        configuration: {
          type: 'hole_drilling',
          basePrice: 10,
          pricePerHole: 5,
          displayPrice: '$10.00 + $5.00/hole',
        },
        tooltipText: 'Add holes for hanging or binding',
        isActive: true,
      },
      {
        name: 'Shrink Wrapping',
        pricingModel: 'CUSTOM',
        configuration: {
          type: 'shrink_wrapping',
          basePrice: 25,
          pricePerBundle: 3,
          displayPrice: '$25.00 + $3.00/bundle',
        },
        tooltipText: 'Protective shrink wrap packaging',
        isActive: true,
      },
    ]

    // Restore each missing addon
    for (const addonData of allAddons) {
      const existing = await prisma.addOn.findFirst({
        where: { name: addonData.name },
      })

      if (!existing) {
        await prisma.addOn.create({
          data: {
            ...addonData,
            id: createId(),
            updatedAt: new Date(),
          } as any,
        })
      } else {
      }
    }

    // Verify all addons are present

    const allAddonsInDb = await prisma.addOn.findMany({
      orderBy: { name: 'asc' },
    })

    // Specifically verify Corner Rounding
    const finalCornerCheck = allAddonsInDb.find((a) => a.name === 'Corner Rounding')
    if (finalCornerCheck) {
      const config = finalCornerCheck.configuration as any
      if (config?.conditionalFields?.cornerType?.label === 'ROUNDED CORNERS') {
      }
    }

    // Create protection verification file
    await createProtectionVerificationFile()
  } catch (error) {
    console.error('Error in restoration:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function updateCornerRounding(id: string) {
  await prisma.addOn.update({
    where: { id },
    data: {
      configuration: {
        type: 'corner_rounding',
        basePrice: 20,
        pricePerPiece: 0.01,
        displayPrice: '$20.00 + $0.01/piece',
        requiresCheckbox: true,
        conditionalFields: {
          cornerType: {
            label: 'ROUNDED CORNERS',
            type: 'select',
            options: [
              { label: 'All Four', value: 'All Four' },
              { label: 'Top Two', value: 'Top Two' },
              { label: 'Bottom Two', value: 'Bottom Two' },
              { label: 'Top Left', value: 'Top Left' },
              { label: 'Top Right', value: 'Top Right' },
              { label: 'Bottom Left', value: 'Bottom Left' },
              { label: 'Bottom Right', value: 'Bottom Right' },
              { label: 'Top Left & Bottom Right', value: 'Top Left & Bottom Right' },
              { label: 'Top Right & Bottom Left', value: 'Top Right & Bottom Left' },
            ],
            required: true,
            defaultValue: 'All Four',
            helpText: 'Select the type of corner rounding for your order.',
            displayType: 'dropdown',
          },
        },
        showConditionalOnCheck: true,
      },
    },
  })
}

async function createCornerRounding() {
  await prisma.addOn.create({
    data: {
      id: createId(),
      name: 'Corner Rounding',
      pricingModel: 'CUSTOM',
      configuration: {
        type: 'corner_rounding',
        basePrice: 20,
        pricePerPiece: 0.01,
        displayPrice: '$20.00 + $0.01/piece',
        requiresCheckbox: true,
        conditionalFields: {
          cornerType: {
            label: 'ROUNDED CORNERS',
            type: 'select',
            options: [
              { label: 'All Four', value: 'All Four' },
              { label: 'Top Two', value: 'Top Two' },
              { label: 'Bottom Two', value: 'Bottom Two' },
              { label: 'Top Left', value: 'Top Left' },
              { label: 'Top Right', value: 'Top Right' },
              { label: 'Bottom Left', value: 'Bottom Left' },
              { label: 'Bottom Right', value: 'Bottom Right' },
              { label: 'Top Left & Bottom Right', value: 'Top Left & Bottom Right' },
              { label: 'Top Right & Bottom Left', value: 'Top Right & Bottom Left' },
            ],
            required: true,
            defaultValue: 'All Four',
            helpText: 'Select the type of corner rounding for your order.',
            displayType: 'dropdown',
          },
        },
        showConditionalOnCheck: true,
      },
      tooltipText: 'Add rounded corners for a professional, modern look',
      isActive: true,
      updatedAt: new Date(),
    },
  })
}

async function createProtectionVerificationFile() {
  const verificationScript = `#!/bin/bash
# ADDON DATA PROTECTION VERIFICATION
# Run this to verify Corner Rounding and all addons are intact

echo "🛡️ Verifying Addon Data Protection..."
echo "Checking Corner Rounding with ROUNDED CORNERS..."

# Run the TypeScript verification
npx tsx scripts/check-corner-rounding.ts

echo ""
echo "If Corner Rounding is missing or ROUNDED CORNERS field is gone, run:"
echo "npx tsx scripts/restore-and-protect-all-addons.ts"
`

  const fs = require('fs').promises
  await fs.writeFile('/root/websites/gangrunprinting/verify-addons.sh', verificationScript)
}

restoreAndProtectAllAddons()
