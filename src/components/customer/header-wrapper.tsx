import { prisma } from '@/lib/prisma'
import Header from './header'

export default async function HeaderWrapper() {
  // Fetch active header menu
  const headerMenu = await prisma.menu.findFirst({
    where: {
      type: 'HEADER',
      isActive: true,
    },
    include: {
      items: {
        where: {
          parentId: null,
          isActive: true,
        },
        orderBy: { sortOrder: 'asc' },
        include: {
          Children: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
      sections: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          items: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
    },
  })

  // Fetch quick links
  const quickLinks = await prisma.quickLink.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })

  // Fallback to categories if no menu configured
  const categories = await prisma.productCategory.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      _count: {
        select: {
          Product: true,
        },
      },
    },
  })

  return <Header fallbackCategories={categories} menu={headerMenu} quickLinks={quickLinks} />
}
