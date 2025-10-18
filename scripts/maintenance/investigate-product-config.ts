import { prisma } from './src/lib/prisma-singleton'

async function investigateProduct() {
  const productId = '4faaa022-05ac-4607-9e73-2da77aecc7ce'

  console.log('=== Product Configuration Investigation ===\n')

  // Get product details
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      ProductQuantityGroup: {
        include: {
          QuantityGroup: {
            include: {
              QuantityGroupValue: true
            }
          }
        }
      },
      ProductSizeGroup: {
        include: {
          SizeGroup: {
            include: {
              SizeGroupValue: true
            }
          }
        }
      },
      ProductPaperStockGroup: {
        include: {
          PaperStockGroup: {
            include: {
              PaperStock: {
                include: {
                  PaperStockCoating: true,
                  PaperStockSides: true
                }
              }
            }
          }
        }
      },
      ProductAddonSet: {
        include: {
          AddonSet: {
            include: {
              Addon: true
            }
          }
        }
      },
      ProductDesignOptionSet: {
        include: {
          DesignOptionSet: {
            include: {
              DesignOption: true
            }
          }
        }
      }
    }
  })

  if (!product) {
    console.log('❌ Product not found')
    return
  }

  console.log(`✅ Product Found: ${product.name}`)
  console.log(`   Slug: ${product.slug}`)
  console.log(`   ID: ${product.id}\n`)

  // Check QuantityGroups
  console.log('--- Quantity Groups ---')
  if (product.ProductQuantityGroup.length === 0) {
    console.log('❌ NO QUANTITY GROUPS ASSIGNED')
  } else {
    product.ProductQuantityGroup.forEach((pqg, index) => {
      console.log(`  ${index + 1}. ${pqg.QuantityGroup.name}`)
      console.log(`     Values: ${pqg.QuantityGroup.QuantityGroupValue.length} options`)
      if (pqg.QuantityGroup.QuantityGroupValue.length > 0) {
        const values = pqg.QuantityGroup.QuantityGroupValue.map(v => v.value).join(', ')
        console.log(`     Options: ${values}`)
      }
    })
  }

  // Check SizeGroups
  console.log('\n--- Size Groups ---')
  if (product.ProductSizeGroup.length === 0) {
    console.log('❌ NO SIZE GROUPS ASSIGNED')
  } else {
    product.ProductSizeGroup.forEach((psg, index) => {
      console.log(`  ${index + 1}. ${psg.SizeGroup.name}`)
      console.log(`     Values: ${psg.SizeGroup.SizeGroupValue.length} sizes`)
    })
  }

  // Check PaperStockGroups
  console.log('\n--- Paper Stock Groups ---')
  if (product.ProductPaperStockGroup.length === 0) {
    console.log('❌ NO PAPER STOCK GROUPS ASSIGNED')
  } else {
    product.ProductPaperStockGroup.forEach((ppsg, index) => {
      console.log(`  ${index + 1}. ${ppsg.PaperStockGroup.name}`)
      console.log(`     Paper Stocks: ${ppsg.PaperStockGroup.PaperStock.length}`)
    })
  }

  // Check Addon Sets
  console.log('\n--- Addon Sets ---')
  if (product.ProductAddonSet.length === 0) {
    console.log('⚠️  NO ADDON SETS ASSIGNED')
  } else {
    product.ProductAddonSet.forEach((pas, index) => {
      console.log(`  ${index + 1}. ${pas.AddonSet.name}`)
      console.log(`     Addons: ${pas.AddonSet.Addon.length}`)
    })
  }

  // Check Design Option Sets
  console.log('\n--- Design Option Sets ---')
  if (product.ProductDesignOptionSet.length === 0) {
    console.log('⚠️  NO DESIGN OPTION SETS ASSIGNED')
  } else {
    product.ProductDesignOptionSet.forEach((pdos, index) => {
      console.log(`  ${index + 1}. ${pdos.DesignOptionSet.name}`)
      console.log(`     Design Options: ${pdos.DesignOptionSet.DesignOption.length}`)
    })
  }

  console.log('\n=== Summary ===')
  console.log(`Quantity Groups: ${product.ProductQuantityGroup.length}`)
  console.log(`Size Groups: ${product.ProductSizeGroup.length}`)
  console.log(`Paper Stock Groups: ${product.ProductPaperStockGroup.length}`)
  console.log(`Addon Sets: ${product.ProductAddonSet.length}`)
  console.log(`Design Option Sets: ${product.ProductDesignOptionSet.length}`)

  await prisma.$disconnect()
}

investigateProduct().catch(console.error)
