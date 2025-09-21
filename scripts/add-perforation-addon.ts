import { prisma } from '../src/lib/prisma'

async function addPerforationAddOn() {
  try {
    // Check if Perforation add-on already exists
    const existingAddOn = await prisma.addOn.findFirst({
      where: {
        name: 'Perforation'
      }
    })

    if (existingAddOn) {
      // Update existing add-on
      const updated = await prisma.addOn.update({
        where: { id: existingAddOn.id },
        data: {
          description: 'A straight row of tiny holes punched in the paper so that a part can be torn off easily',
          tooltipText: 'A straight row of tiny holes punched in the paper so that a part can be torn off easily. This perforation row goes completely across the sheet from one side to the other.',
          pricingModel: 'CUSTOM',
          configuration: {
            type: 'perforation',
            basePrice: 20,
            pricePerPiece: 0.01,
            displayPrice: '$20.00 + $0.01/piece',
            conditionalFields: {
              verticalCount: {
                label: 'How Many Vertical',
                type: 'select',
                options: [
                  { value: '0', label: '0' },
                  { value: '1', label: '1' },
                  { value: '2', label: '2' },
                  { value: '3', label: '3' },
                  { value: '4', label: '4' },
                  { value: '5', label: '5' }
                ],
                defaultValue: '0',
                helpText: 'Select the number of vertical perforation rows that you need.',
                required: false
              },
              verticalPosition: {
                label: 'Vertical Position',
                type: 'text',
                helpText: 'Enter the position of the vertical perforation. For example, 2 inches from the right front.',
                placeholder: 'e.g., 2 inches from the right front',
                required: false,
                showWhen: 'verticalCount > 0'
              },
              horizontalCount: {
                label: 'How Many Horizontal',
                type: 'select',
                options: [
                  { value: '0', label: '0' },
                  { value: '1', label: '1' },
                  { value: '2', label: '2' },
                  { value: '3', label: '3' },
                  { value: '4', label: '4' },
                  { value: '5', label: '5' }
                ],
                defaultValue: '0',
                helpText: 'Select the number of horizontal perforation rows that you need.',
                required: false
              },
              horizontalPosition: {
                label: 'Horizontal Position',
                type: 'text',
                helpText: 'Enter the position of the horizontal perforation. For example, 2 inches from the top front.',
                placeholder: 'e.g., 2 inches from the top front',
                required: false,
                showWhen: 'horizontalCount > 0'
              }
            },
            requiresCheckbox: true,
            showConditionalOnCheck: true
          },
          sortOrder: 14,
          isActive: true,
          adminNotes: 'Perforation service with conditional fields for vertical and horizontal positioning'
        }
      })

    } else {
      // Create new add-on
      const newAddOn = await prisma.addOn.create({
        data: {
          name: 'Perforation',
          description: 'A straight row of tiny holes punched in the paper so that a part can be torn off easily',
          tooltipText: 'A straight row of tiny holes punched in the paper so that a part can be torn off easily. This perforation row goes completely across the sheet from one side to the other.',
          pricingModel: 'CUSTOM',
          configuration: {
            type: 'perforation',
            basePrice: 20,
            pricePerPiece: 0.01,
            displayPrice: '$20.00 + $0.01/piece',
            conditionalFields: {
              verticalCount: {
                label: 'How Many Vertical',
                type: 'select',
                options: [
                  { value: '0', label: '0' },
                  { value: '1', label: '1' },
                  { value: '2', label: '2' },
                  { value: '3', label: '3' },
                  { value: '4', label: '4' },
                  { value: '5', label: '5' }
                ],
                defaultValue: '0',
                helpText: 'Select the number of vertical perforation rows that you need.',
                required: false
              },
              verticalPosition: {
                label: 'Vertical Position',
                type: 'text',
                helpText: 'Enter the position of the vertical perforation. For example, 2 inches from the right front.',
                placeholder: 'e.g., 2 inches from the right front',
                required: false,
                showWhen: 'verticalCount > 0'
              },
              horizontalCount: {
                label: 'How Many Horizontal',
                type: 'select',
                options: [
                  { value: '0', label: '0' },
                  { value: '1', label: '1' },
                  { value: '2', label: '2' },
                  { value: '3', label: '3' },
                  { value: '4', label: '4' },
                  { value: '5', label: '5' }
                ],
                defaultValue: '0',
                helpText: 'Select the number of horizontal perforation rows that you need.',
                required: false
              },
              horizontalPosition: {
                label: 'Horizontal Position',
                type: 'text',
                helpText: 'Enter the position of the horizontal perforation. For example, 2 inches from the top front.',
                placeholder: 'e.g., 2 inches from the top front',
                required: false,
                showWhen: 'horizontalCount > 0'
              }
            },
            requiresCheckbox: true,
            showConditionalOnCheck: true
          },
          additionalTurnaroundDays: 1,
          sortOrder: 14,
          isActive: true,
          adminNotes: 'Perforation service with conditional fields for vertical and horizontal positioning'
        }
      })

    }

    process.exit(0)
  } catch (error) {
    console.error('Error creating Perforation add-on:', error)
    process.exit(1)
  }
}

addPerforationAddOn()