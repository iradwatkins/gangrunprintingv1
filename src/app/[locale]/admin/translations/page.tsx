// Temporarily simplified - i18n disabled
import { Suspense } from 'react';
import { TranslationManager } from '@/components/admin/translation-manager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';

type Props = {
  params: Promise<{locale: string}>;
  searchParams: Promise<{[key: string]: string | string[] | undefined}>;
};

export default async function TranslationsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const search = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Translation Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage translations across multiple languages and tenants
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            Current Language: {locale.toUpperCase()}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="manage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="manage">Manage Translations</TabsTrigger>
          <TabsTrigger value="requests">Translation Requests</TabsTrigger>
          <TabsTrigger value="auto-translate">Auto Translation</TabsTrigger>
          <TabsTrigger value="import-export">Import/Export</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Keys
                </CardTitle>
                <div className="h-4 w-4 rounded-full bg-blue-500" />
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="text-2xl font-bold">-</div>}>
                  <TranslationStats type="total" />
                </Suspense>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Translated
                </CardTitle>
                <div className="h-4 w-4 rounded-full bg-green-500" />
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="text-2xl font-bold">-</div>}>
                  <TranslationStats type="translated" />
                </Suspense>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Missing
                </CardTitle>
                <div className="h-4 w-4 rounded-full bg-red-500" />
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="text-2xl font-bold">-</div>}>
                  <TranslationStats type="missing" />
                </Suspense>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Auto-Generated
                </CardTitle>
                <div className="h-4 w-4 rounded-full bg-orange-500" />
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="text-2xl font-bold">-</div>}>
                  <TranslationStats type="auto" />
                </Suspense>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Translation Management</CardTitle>
              <CardDescription>
                Add, edit, and manage translations for all supported languages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Loading />}>
                <TranslationManager searchParams={search} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Translation Requests</CardTitle>
              <CardDescription>
                Manage pending translation requests and assign translators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Loading />}>
                <TranslationRequestManager />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auto-translate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Auto Translation</CardTitle>
              <CardDescription>
                Automatically translate missing translations using AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Loading />}>
                <AutoTranslationManager />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import-export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import/Export Translations</CardTitle>
              <CardDescription>
                Import and export translation files for external translation services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Loading />}>
                <TranslationImportExport />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Translation Settings</CardTitle>
              <CardDescription>
                Configure translation system settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Loading />}>
                <TranslationSettings />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Component stubs - these will be implemented in separate files
function TranslationStats({ type }: { type: 'total' | 'translated' | 'missing' | 'auto' }) {
  return <div className="text-2xl font-bold">Loading...</div>;
}

function TranslationRequestManager() {
  return <div>Translation Request Manager Component</div>;
}

function AutoTranslationManager() {
  return <div>Auto Translation Manager Component</div>;
}

function TranslationImportExport() {
  return <div>Translation Import/Export Component</div>;
}

function TranslationSettings() {
  return <div>Translation Settings Component</div>;
}