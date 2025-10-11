import { prisma } from '../src/lib/prisma'

async function addBandingAddOn() {
  try {
    // Check if Banding add-on already exists
    const existingAddOn = await prisma.addOn.findFirst({
      where: {
        name: 'Banding',
      },
    })

    if (existingAddOn) {
      // Update existing add-on
      const updated = await prisma.addOn.update({
        where: { id: existingAddOn.id },
        data: {
          description:
            'Have your product bundled in specific individual quantity groups with paper bands or rubber bands',
          tooltipText:
            'Have your product bundled in specific individual quantity groups with paper bands or rubber bands. Please choose the amount you would like in each bundle.',
          pricingModel: 'CUSTOM',
          configuration: {
            type: 'banding',
            pricePerBundle: 0.75,
            displayPrice: '$.75/bundle',
            conditionalFields: {
              bandingType: {
                label: 'Banding Type',
                type: 'select',
                options: [
                  { value: 'paper', label: 'Paper Bands' },
                  { value: 'rubber', label: 'Rubber Bands' },
                ],
                defaultValue: 'paper',
                helpText: 'Please select whether or not you want paper banding or rubber banding.',
                required: true,
              },
              itemsPerBundle: {
                label: 'Items/Bundle',
                type: 'number',
                min: 1,
                max: 10000,
                defaultValue: 100,
                helpText:
                  'Please enter the amount you want in each bundle. If you ordered 5000 quantity and entered 50, you would get 100 bundles.',
                placeholder: '100',
                required: true,
              },
            },
            requiresCheckbox: true,
            showConditionalOnCheck: true,
          },
          sortOrder: 15,
          isActive: true,
          adminNotes: 'Banding service with paper or rubber bands, priced per bundle',
        },
      })
    } else {
      // Create new add-on
      const newAddOn = await prisma.addOn.create({
        data: {
          name: 'Banding',
          description:
            'Have your product bundled in specific individual quantity groups with paper bands or rubber bands',
          tooltipText:
            'Have your product bundled in specific individual quantity groups with paper bands or rubber bands. Please choose the amount you would like in each bundle.',
          pricingModel: 'CUSTOM',
          configuration: {
            type: 'banding',
            pricePerBundle: 0.75,
            displayPrice: '$.75/bundle',
            conditionalFields: {
              bandingType: {
                label: 'Banding Type',
                type: 'select',
                options: [
                  { value: 'paper', label: 'Paper Bands' },
                  { value: 'rubber', label: 'Rubber Bands' },
                ],
                defaultValue: 'paper',
                helpText: 'Please select whether or not you want paper banding or rubber banding.',
                required: true,
              },
              itemsPerBundle: {
                label: 'Items/Bundle',
                type: 'number',
                min: 1,
                max: 10000,
                defaultValue: 100,
                helpText:
                  'Please enter the amount you want in each bundle. If you ordered 5000 quantity and entered 50, you would get 100 bundles.',
                placeholder: '100',
                required: true,
              },
            },
            requiresCheckbox: true,
            showConditionalOnCheck: true,
          },
          additionalTurnaroundDays: 1,
          sortOrder: 15,
          isActive: true,
          adminNotes: 'Banding service with paper or rubber bands, priced per bundle',
        },
      })
    }

    process.exit(0)
  } catch (error) {
    console.error('Error creating Banding add-on:', error)
    process.exit(1)
  }
}

addBandingAddOn()
