'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Save, Plus, Eye } from 'lucide-react'
import Link from 'next/link'
import MenuItemsList from './menu-items-list'
import MenuSectionsList from './menu-sections-list'
import MenuSettings from './menu-settings'
import MenuPreview from './menu-preview'

type Menu = any // Will be properly typed
type Category = { id: string; name: string; slug: string }
type Product = { id: string; name: string; slug: string; Category: { name: string } | null }

interface MenuBuilderClientProps {
  menu: Menu
  categories: Category[]
  products: Product[]
}

export default function MenuBuilderClient({ menu, categories, products }: MenuBuilderClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('items')
  const [showPreview, setShowPreview] = useState(false)
  const [menuData, setMenuData] = useState(menu)

  const refreshMenu = async () => {
    router.refresh()
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/menus">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{menu.name}</h1>
            <p className="text-muted-foreground">
              {menu.type} Menu - {menu.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="mr-2 h-4 w-4" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="items">Menu Items</TabsTrigger>
                  <TabsTrigger value="sections">Sections</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="items" className="mt-6">
                  <MenuItemsList
                    menuId={menu.id}
                    items={menu.items}
                    sections={menu.sections}
                    categories={categories}
                    products={products}
                    onUpdate={refreshMenu}
                  />
                </TabsContent>

                <TabsContent value="sections" className="mt-6">
                  <MenuSectionsList
                    menuId={menu.id}
                    sections={menu.sections}
                    onUpdate={refreshMenu}
                  />
                </TabsContent>

                <TabsContent value="settings" className="mt-6">
                  <MenuSettings
                    menu={menu}
                    onUpdate={refreshMenu}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {showPreview && (
          <div className="lg:col-span-1">
            <MenuPreview menu={menuData} />
          </div>
        )}
      </div>
    </div>
  )
}
