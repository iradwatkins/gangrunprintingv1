'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Palette,
  Upload,
  Download,
  Trash2,
  Check,
  Eye,
  Code,
  FileText,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Theme {
  id: string;
  name: string;
  description?: string;
  cssVariables: Record<string, string>;
  darkModeVariables?: Record<string, string>;
  customCSS?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function ThemeManager() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [deleteTheme, setDeleteTheme] = useState<Theme | null>(null);
  const [uploadDialog, setUploadDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [uploadForm, setUploadForm] = useState({
    name: '',
    description: '',
    file: null as File | null,
  });

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      const response = await fetch('/api/themes');
      if (response.ok) {
        const data = await response.json();
        setThemes(data);
      }
    } catch (error) {
      console.error('Error fetching themes:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch themes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/css') {
      setUploadForm(prev => ({ ...prev, file }));
    } else {
      toast({
        title: 'Invalid file',
        description: 'Please select a CSS file',
        variant: 'destructive',
      });
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.name) {
      toast({
        title: 'Missing fields',
        description: 'Please provide a name and select a CSS file',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('name', uploadForm.name);
      formData.append('description', uploadForm.description);

      const response = await fetch('/api/themes', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const newTheme = await response.json();
        setThemes(prev => [...prev, newTheme]);
        setUploadDialog(false);
        setUploadForm({ name: '', description: '', file: null });

        toast({
          title: 'Success',
          description: 'Theme uploaded and activated successfully',
        });

        // Reload page to apply new theme
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error('Failed to upload theme');
      }
    } catch (error) {
      console.error('Error uploading theme:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload theme',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleActivate = async (themeId: string) => {
    try {
      const response = await fetch(`/api/themes/${themeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activate: true }),
      });

      if (response.ok) {
        setThemes(prev =>
          prev.map(theme => ({
            ...theme,
            isActive: theme.id === themeId,
          }))
        );

        toast({
          title: 'Success',
          description: 'Theme activated successfully',
        });

        // Reload page to apply new theme
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('Error activating theme:', error);
      toast({
        title: 'Error',
        description: 'Failed to activate theme',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTheme) return;

    try {
      const response = await fetch(`/api/themes/${deleteTheme.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setThemes(prev => prev.filter(theme => theme.id !== deleteTheme.id));
        setDeleteTheme(null);

        toast({
          title: 'Success',
          description: 'Theme deleted successfully',
        });
      }
    } catch (error) {
      console.error('Error deleting theme:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete theme',
        variant: 'destructive',
      });
    }
  };

  const downloadTheme = (theme: Theme) => {
    let css = '';

    // Generate :root variables
    if (theme.cssVariables) {
      css += ':root {\n';
      for (const [key, value] of Object.entries(theme.cssVariables)) {
        css += `  ${key}: ${value};\n`;
      }
      css += '}\n\n';
    }

    // Generate .dark variables
    if (theme.darkModeVariables) {
      css += '.dark {\n';
      for (const [key, value] of Object.entries(theme.darkModeVariables)) {
        css += `  ${key}: ${value};\n`;
      }
      css += '}\n\n';
    }

    // Add custom CSS
    if (theme.customCSS) {
      css += theme.customCSS;
    }

    // Create download
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${theme.name.toLowerCase().replace(/\s+/g, '-')}.css`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">Loading themes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Theme Manager</CardTitle>
              <CardDescription>
                Upload and manage custom CSS themes for your application
              </CardDescription>
            </div>
            <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Theme
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload CSS Theme</DialogTitle>
                  <DialogDescription>
                    Upload a CSS file containing theme variables to customize the application appearance
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Theme Name</Label>
                    <Input
                      id="name"
                      placeholder="My Custom Theme"
                      value={uploadForm.name}
                      onChange={(e) =>
                        setUploadForm(prev => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="A brief description of your theme"
                      rows={3}
                      value={uploadForm.description}
                      onChange={(e) =>
                        setUploadForm(prev => ({ ...prev, description: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="file">CSS File</Label>
                    <Input
                      ref={fileInputRef}
                      accept=".css"
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                    />
                    {uploadForm.file && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Selected: {uploadForm.file.name}
                      </p>
                    )}
                  </div>

                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Note:</strong> Your CSS file should contain CSS variables in :root and .dark selectors.
                    </p>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setUploadDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button disabled={uploading} onClick={handleUpload}>
                      {uploading ? 'Uploading...' : 'Upload & Apply'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {themes.map((theme) => (
                <TableRow key={theme.id}>
                  <TableCell className="font-medium">{theme.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {theme.description || 'No description'}
                  </TableCell>
                  <TableCell>
                    {theme.isActive ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(theme.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {!theme.isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleActivate(theme.id)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedTheme(theme)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadTheme(theme)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        disabled={theme.isActive}
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteTheme(theme)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Theme Preview Dialog */}
      <Dialog
        open={!!selectedTheme}
        onOpenChange={() => setSelectedTheme(null)}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTheme?.name}</DialogTitle>
            <DialogDescription>
              {selectedTheme?.description || 'Theme preview and CSS variables'}
            </DialogDescription>
          </DialogHeader>

          {selectedTheme && (
            <Tabs defaultValue="variables">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="variables">Variables</TabsTrigger>
                <TabsTrigger value="dark">Dark Mode</TabsTrigger>
                <TabsTrigger value="custom">Custom CSS</TabsTrigger>
              </TabsList>

              <TabsContent className="space-y-2" value="variables">
                <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                  <pre>{JSON.stringify(selectedTheme.cssVariables, null, 2)}</pre>
                </div>
              </TabsContent>

              <TabsContent className="space-y-2" value="dark">
                <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                  <pre>{JSON.stringify(selectedTheme.darkModeVariables || {}, null, 2)}</pre>
                </div>
              </TabsContent>

              <TabsContent className="space-y-2" value="custom">
                <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                  <pre>{selectedTheme.customCSS || 'No custom CSS'}</pre>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTheme}
        onOpenChange={() => setDeleteTheme(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Theme</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTheme?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}