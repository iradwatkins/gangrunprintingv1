import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating sample email template...')

  const template = await prisma.emailTemplate.create({
    data: {
      id: "welcome-new-customer",
      name: 'Welcome Email - New Customer',
      category: 'welcome',
      subject: 'Welcome to GangRun Printing! 🎉',
      previewText: 'Get started with your first order and receive 10% off',
      thumbnail: '/templates/welcome-thumb.png',
      isPublic: true,
      content: {
        type: 'email-builder',
        components: [
          {
            id: 'header-1',
            type: 'image',
            content: {
              src: 'https://gangrunprinting.com/logo.png',
              alt: 'GangRun Printing Logo',
              width: '200px'
            },
            styles: {
              textAlign: 'center',
              padding: '20px 0'
            }
          },
          {
            id: 'text-1',
            type: 'text',
            content: {
              text: '<h1 style="color: #333; font-size: 32px; margin: 0;">Welcome to GangRun Printing!</h1>'
            },
            styles: {
              textAlign: 'center',
              padding: '20px 0'
            }
          },
          {
            id: 'text-2',
            type: 'text',
            content: {
              text: '<p style="font-size: 16px; line-height: 1.6; color: #666;">Thank you for creating an account with us. We are excited to help you bring your printing projects to life!</p>'
            },
            styles: {
              padding: '10px 0'
            }
          },
          {
            id: 'text-3',
            type: 'text',
            content: {
              text: '<p style="font-size: 16px; line-height: 1.6; color: #666;">As a welcome gift, enjoy <strong>10% off</strong> your first order with code: <strong>WELCOME10</strong></p>'
            },
            styles: {
              textAlign: 'center',
              padding: '20px',
              backgroundColor: '#f7f7f7',
              borderRadius: '8px',
              margin: '20px 0'
            }
          },
          {
            id: 'button-1',
            type: 'button',
            content: {
              text: 'Start Your First Order',
              url: 'https://gangrunprinting.com/products'
            },
            styles: {
              backgroundColor: '#ff6b35',
              color: '#ffffff',
              padding: '15px 30px',
              borderRadius: '5px',
              textAlign: 'center',
              fontSize: '16px',
              fontWeight: 'bold',
              margin: '20px 0'
            }
          },
          {
            id: 'divider-1',
            type: 'divider',
            content: {},
            styles: {
              borderTop: '1px solid #e0e0e0',
              margin: '30px 0'
            }
          },
          {
            id: 'text-4',
            type: 'text',
            content: {
              text: '<h2 style="color: #333; font-size: 24px;">What You Can Do:</h2><ul style="line-height: 1.8;"><li>Browse our full catalog of printing products</li><li>Upload your custom designs</li><li>Track your orders in real-time</li><li>Access exclusive member discounts</li></ul>'
            },
            styles: {
              padding: '10px 0'
            }
          },
          {
            id: 'text-5',
            type: 'text',
            content: {
              text: '<p style="font-size: 14px; color: #999; text-align: center;">© 2025 GangRun Printing. All rights reserved.</p>'
            },
            styles: {
              padding: '30px 0 10px 0'
            }
          }
        ],
        globalStyles: {
          backgroundColor: '#ffffff',
          fontFamily: 'Arial, sans-serif',
          fontSize: '16px',
          lineHeight: '1.6',
          textColor: '#333333'
        }
      },
      createdBy: 'admin'
    }
  })

  console.log('✅ Sample template created:', template.id)
  console.log('Template name:', template.name)
  console.log('Category:', template.category)
  console.log('\nYou can view it at: https://gangrunprinting.com/admin/marketing/email-builder?templateId=' + template.id)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
