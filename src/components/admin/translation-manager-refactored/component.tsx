/**
 * translation-manager - component definitions
 * Auto-refactored by BMAD
 */

import { useState, useEffect, useMemo } from 'react'
import { useDebounce } from 'use-debounce'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function TranslationManager({ searchParams }: TranslationManagerProps) {
  const [translations, setTranslations] = useState<Translation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNamespace, setSelectedNamespace] = useState('all')
  const [selectedLocale, setSelectedLocale] = useState('all')
  const [selectedSource, setSelectedSource] = useState('all')
  const [showUnapproved, setShowUnapproved] = useState(false)
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300)
  const { toast } = useToast()

  // Available locales and namespaces
  const locales = ['en', 'es']
  const namespaces = ['common', 'auth', 'admin', 'home', 'products', 'navigation']

  // Load translations
  useEffect(() => {
    loadTranslations()
  }, [debouncedSearchTerm, selectedNamespace, selectedLocale, selectedSource, showUnapproved])

  const loadTranslations = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm)
      if (selectedNamespace !== 'all') params.append('namespace', selectedNamespace)
      if (selectedLocale !== 'all') params.append('locale', selectedLocale)
      if (selectedSource !== 'all') params.append('source', selectedSource)
      if (showUnapproved) params.append('unapproved', 'true')

      const response = await fetch(`/api/admin/translations?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTranslations(data.translations || [])
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load translations',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter translations
  const filteredTranslations = useMemo(() => {
    return translations.filter((translation) => {
      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase()
        return (
          translation.key.toLowerCase().includes(searchLower) ||
          translation.value.toLowerCase().includes(searchLower) ||
          translation.namespace.toLowerCase().includes(searchLower)
        )
      }
      return true
    })
  }, [translations, debouncedSearchTerm])

  // Group translations by key for comparison
  const groupedTranslations = useMemo(() => {
    const groups: { [key: string]: Translation[] } = {}
    filteredTranslations.forEach((translation) => {
      const groupKey = `${translation.namespace}.${translation.key}`
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(translation)
    })
    return groups
  }, [filteredTranslations])

  const handleSaveTranslation = async (translation: Partial<Translation>) => {
    try {
      const method = translation.id ? 'PUT' : 'POST'
      const url = translation.id
        ? `/api/admin/translations/${translation.id}`
        : '/api/admin/translations'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(translation),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: translation.id ? 'Translation updated' : 'Translation created',
        })
        loadTranslations()
        setEditingTranslation(null)
        setIsAddDialogOpen(false)
      } else {
        throw new Error('Failed to save translation')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save translation',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteTranslation = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/translations/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Translation deleted',
        })
        loadTranslations()
      } else {
        throw new Error('Failed to delete translation')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete translation',
        variant: 'destructive',
      })
    }
  }

  const handleApproveTranslation = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/translations/${id}/approve`, {
        method: 'POST',
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Translation approved',
        })
        loadTranslations()
      } else {
        throw new Error('Failed to approve translation')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve translation',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              id="search"
              placeholder="Search translations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="namespace">Namespace</Label>
          <Select value={selectedNamespace} onValueChange={setSelectedNamespace}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Namespaces</SelectItem>
              {namespaces.map((ns) => (
                <SelectItem key={ns} value={ns}>
                  {ns}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="locale">Language</Label>
          <Select value={selectedLocale} onValueChange={setSelectedLocale}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {locales.map((locale) => (
                <SelectItem key={locale} value={locale}>
                  {locale.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="source">Source</Label>
          <Select value={selectedSource} onValueChange={setSelectedSource}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="MANUAL">Manual</SelectItem>
              <SelectItem value="AUTO_OPENAI">AI Generated</SelectItem>
              <SelectItem value="IMPORT">Imported</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            variant={showUnapproved ? 'default' : 'outline'}
            onClick={() => setShowUnapproved(!showUnapproved)}
          >
            {showUnapproved ? 'Show All' : 'Show Unapproved'}
          </Button>
        </div>

        <div className="flex items-end">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Translation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <TranslationDialog
                translation={null}
                onClose={() => setIsAddDialogOpen(false)}
                onSave={handleSaveTranslation}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Translation Groups */}
      <div className="space-y-4">
        {Object.entries(groupedTranslations).map(([groupKey, groupTranslations]) => (
          <Card key={groupKey}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{groupKey}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {groupTranslations.length} language{groupTranslations.length !== 1 ? 's' : ''}
                  </Badge>
                  {groupTranslations.some((t) => !t.isApproved) && (
                    <Badge variant="destructive">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Pending Approval
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {groupTranslations.map((translation) => (
                  <div
                    key={translation.id}
                    className={`p-4 border rounded-lg space-y-2 ${
                      !translation.isApproved ? 'border-orange-200 bg-orange-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{translation.locale.toUpperCase()}</Badge>
                        {translation.autoTranslated && (
                          <Badge className="text-xs" variant="outline">
                            <Languages className="w-3 h-3 mr-1" />
                            AI
                          </Badge>
                        )}
                        {translation.isApproved ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingTranslation(translation)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteTranslation(translation.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {!translation.isApproved && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleApproveTranslation(translation.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{translation.value}</p>
                      {translation.context && (
                        <p className="text-xs text-gray-500 mt-1">Context: {translation.context}</p>
                      )}
                      {translation.confidence && (
                        <p className="text-xs text-gray-500 mt-1">
                          Confidence: {Math.round(translation.confidence * 100)}%
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      {editingTranslation && (
        <Dialog open={!!editingTranslation} onOpenChange={() => setEditingTranslation(null)}>
          <DialogContent className="max-w-2xl">
            <TranslationDialog
              translation={editingTranslation}
              onClose={() => setEditingTranslation(null)}
              onSave={handleSaveTranslation}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Translation edit/add dialog
function TranslationDialog({
  translation,
  onSave,
  onClose,
}: {
  translation: Translation | null
  onSave: (translation: Partial<Translation>) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    key: translation?.key || '',
    namespace: translation?.namespace || 'common',
    locale: translation?.locale || 'en',
    value: translation?.value || '',
    context: translation?.context || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...translation,
      ...formData,
    })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{translation ? 'Edit Translation' : 'Add Translation'}</DialogTitle>
        <DialogDescription>
          {translation ? 'Update the translation details' : 'Add a new translation'}
        </DialogDescription>
      </DialogHeader>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="namespace">Namespace</Label>
            <Select
              value={formData.namespace}

              onValueChange={(value) => setFormData((prev) => ({ ...prev, namespace: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="common">common</SelectItem>
                <SelectItem value="auth">auth</SelectItem>
                <SelectItem value="admin">admin</SelectItem>
                <SelectItem value="home">home</SelectItem>
                <SelectItem value="products">products</SelectItem>
                <SelectItem value="navigation">navigation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="locale">Language</Label>
            <Select
              value={formData.locale}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, locale: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="key">Key</Label>
          <Input
            required
            id="key"
            placeholder="e.g., welcome.title"
            value={formData.key}
            onChange={(e) => setFormData((prev) => ({ ...prev, key: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="value">Translation Value</Label>
          <Textarea
            required
            id="value"
            placeholder="Enter the translated text"
            rows={3}
            value={formData.value}
            onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="context">Context (Optional)</Label>
          <Textarea
            id="context"
            placeholder="Provide context for translators"
            rows={2}
            value={formData.context}
            onChange={(e) => setFormData((prev) => ({ ...prev, context: e.target.value }))}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{translation ? 'Update' : 'Create'}</Button>
        </DialogFooter>
      </form>
    </>
  )
}
