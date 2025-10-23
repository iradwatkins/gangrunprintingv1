'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye } from 'lucide-react'

type Menu = any

interface MenuPreviewProps {
  menu: Menu
}

export default function MenuPreview({ menu }: MenuPreviewProps) {
  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Live Preview
        </CardTitle>
        <CardDescription>
          Preview how your menu will look on the website
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed">
            <p className="text-sm font-medium mb-2">{menu.name}</p>
            <div className="space-y-2">
              {menu.items && menu.items.length > 0 ? (
                menu.items.map((item: any) => (
                  <div key={item.id} className="bg-white rounded p-2 text-sm">
                    <div className="font-medium">{item.label}</div>
                    {item.Children && item.Children.length > 0 && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.Children.map((child: any) => (
                          <div key={child.id} className="text-xs text-muted-foreground">
                            • {child.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No menu items to preview
                </p>
              )}
            </div>
          </div>

          {menu.sections && menu.sections.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Sections</p>
              <div className="space-y-2">
                {menu.sections.map((section: any) => (
                  <div key={section.id} className="bg-gray-50 rounded p-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{section.title}</span>
                      <Badge variant="outline" className="text-xs">
                        Col {section.column}
                      </Badge>
                    </div>
                    {section.items && section.items.length > 0 && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {section.items.length} items
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
