import { prisma } from '../src/lib/prisma'

async function addCornerRoundingAddOn() {
  try {
    // Check if Corner Rounding add-on already exists
    const existingAddOn = await prisma.addOn.findFirst({
      where: {
        name: 'Corner Rounding'
      }
    })

    if (existingAddOn) {
      // Update existing add-on
      const updated = await prisma.addOn.update({
        where: { id: existingAddOn.id },
        data: {
          description: 'Remove sharp corners on your print job with rounded corners',
          tooltipText: 'Corner Rounding is an option that will remove the sharp corners on your print job and add a 1/4 inch radius to business cards and a 3/16 inch radius to all other products.',
          pricingModel: 'CUSTOM',
          configuration: {
            type: 'corner_rounding',
            basePrice: 20,
            pricePerPiece: 0.01,
            displayPrice: '$20.00 + $0.01/piece',
            conditionalFields: {
              cornerType: {
                label: 'ROUNDED CORNERS',
                type: 'select',
                options: [
                  { value: 'All Four', label: 'All Four' },
                  { value: 'Top Two', label: 'Top Two' },
                  { value: 'Bottom Two', label: 'Bottom Two' },
                  { value: 'Left Two', label: 'Left Two' },
                  { value: 'Right Two', label: 'Right Two' },
                  { value: 'Top Left', label: 'Top Left' },
                  { value: 'Top Right', label: 'Top Right' },
                  { value: 'Bottom Left', label: 'Bottom Left' },
                  { value: 'Bottom Right', label: 'Bottom Right' },
                  { value: 'Top Left & Bottom Right', label: 'Top Left & Bottom Right' },
                  { value: 'Top Right & Bottom Left', label: 'Top Right & Bottom Left' }
                ],
                defaultValue: 'All Four',
                helpText: 'Select the type of corner rounding for your order.',
                required: true
              }
            },
            requiresCheckbox: true,
            showConditionalOnCheck: true
          },
          sortOrder: 15,
          isActive: true,
          adminNotes: 'Corner Rounding service with multiple corner configuration options'
        }
      })
      console.log('Corner Rounding add-on updated:', updated.id)
    } else {
      // Create new add-on
      const newAddOn = await prisma.addOn.create({
        data: {
          name: 'Corner Rounding',
          description: 'Remove sharp corners on your print job with rounded corners',
          tooltipText: 'Corner Rounding is an option that will remove the sharp corners on your print job and add a 1/4 inch radius to business cards and a 3/16 inch radius to all other products.',
          pricingModel: 'CUSTOM',
          configuration: {
            type: 'corner_rounding',
            basePrice: 20,
            pricePerPiece: 0.01,
            displayPrice: '$20.00 + $0.01/piece',
            conditionalFields: {
              cornerType: {
                label: 'ROUNDED CORNERS',
                type: 'select',
                options: [
                  { value: 'All Four', label: 'All Four' },
                  { value: 'Top Two', label: 'Top Two' },
                  { value: 'Bottom Two', label: 'Bottom Two' },
                  { value: 'Left Two', label: 'Left Two' },
                  { value: 'Right Two', label: 'Right Two' },
                  { value: 'Top Left', label: 'Top Left' },
                  { value: 'Top Right', label: 'Top Right' },
                  { value: 'Bottom Left', label: 'Bottom Left' },
                  { value: 'Bottom Right', label: 'Bottom Right' },
                  { value: 'Top Left & Bottom Right', label: 'Top Left & Bottom Right' },
                  { value: 'Top Right & Bottom Left', label: 'Top Right & Bottom Left' }
                ],
                defaultValue: 'All Four',
                helpText: 'Select the type of corner rounding for your order.',
                required: true
              }
            },
            requiresCheckbox: true,
            showConditionalOnCheck: true
          },
          additionalTurnaroundDays: 1,
          sortOrder: 15,
          isActive: true,
          adminNotes: 'Corner Rounding service with multiple corner configuration options'
        }
      })
      console.log('Corner Rounding add-on created:', newAddOn.id)
    }

    process.exit(0)
  } catch (error) {
    console.error('Error creating Corner Rounding add-on:', error)
    process.exit(1)
  }
}

addCornerRoundingAddOn()