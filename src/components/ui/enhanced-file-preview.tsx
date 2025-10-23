'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FileText,
  Image,
  Download,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize,
  MoreVertical,
  Share2,
  Copy,
  FileImage,
  FileArchive,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilePreviewProps {
  filename: string;
  fileUrl: string;
  thumbnailUrl?: string;
  mimeType?: string;
  fileSize?: number;
  label?: string;
  className?: string;
  showActions?: boolean;
  showFileInfo?: boolean;
  onPreview?: () => void;
  onDownload?: () => void;
}

// File type detection helpers
const getFileType = (filename: string, mimeType?: string): string => {
  const ext = filename.toLowerCase().split('.').pop() || '';
  
  if (mimeType?.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf' || ext === 'pdf') return 'pdf';
  if (['ai', 'eps'].includes(ext)) return 'vector';
  if (['psd', 'psb'].includes(ext)) return 'photoshop';
  if (['doc', 'docx'].includes(ext)) return 'document';
  if (['zip', 'rar', '7z'].includes(ext)) return 'archive';
  
  return 'unknown';
};

const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case 'image': return Image;
    case 'pdf': return FileText;
    case 'vector': return FileImage;
    case 'photoshop': return FileImage;
    case 'document': return FileText;
    case 'archive': return FileArchive;
    default: return FileText;
  }
};

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

export function EnhancedFilePreview({
  filename,
  fileUrl,
  thumbnailUrl,
  mimeType,
  fileSize,
  label,
  className,
  showActions = true,
  showFileInfo = true,
  onPreview,
  onDownload,
}: FilePreviewProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const fileType = getFileType(filename, mimeType);
  const FileIcon = getFileIcon(fileType);
  const isImage = fileType === 'image';
  const isPdf = fileType === 'pdf';
  const displayName = label || filename;

  // Reset zoom and rotation when opening preview
  useEffect(() => {
    if (previewOpen) {
      setZoom(100);
      setRotation(0);
    }
  }, [previewOpen]);

  const handlePreview = useCallback(() => {
    setPreviewOpen(true);
    onPreview?.();
  }, [onPreview]);

  const handleDownload = useCallback(async () => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      onDownload?.();
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(fileUrl, '_blank');
    }
  }, [fileUrl, filename, onDownload]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fileUrl);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  }, [fileUrl]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: displayName,
          url: fileUrl,
        });
      } catch (error) {
        // User cancelled or share failed
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  }, [displayName, fileUrl, handleCopyLink]);

  const zoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
  const zoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
  const resetZoom = () => setZoom(100);
  const rotate = () => setRotation(prev => (prev + 90) % 360);

  return (
    <>
      <Card className={cn('group hover:shadow-md transition-shadow', className)}>
        <CardContent className="p-4">
          {/* File Preview Thumbnail */}
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden mb-3">
            {/* Loading state */}
            {imageLoading && (isImage || thumbnailUrl) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Image preview */}
            {(isImage || thumbnailUrl) && !imageError ? (
              <img
                src={thumbnailUrl || fileUrl}
                alt={displayName}
                className={cn(
                  'object-contain w-full h-full cursor-pointer transition-all duration-200',
                  'group-hover:scale-105',
                  imageLoading && 'opacity-0'
                )}
                loading="lazy"
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
                onClick={handlePreview}
              />
            ) : (
              /* Fallback icon */
              <div 
                className="flex flex-col items-center justify-center h-full text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={handlePreview}
              >
                <FileIcon className="h-12 w-12 mb-2" />
                <p className="text-sm font-medium text-center px-2">{displayName}</p>
                {fileSize && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatFileSize(fileSize)}
                  </p>
                )}
              </div>
            )}

            {/* File type badge */}
            <Badge 
              variant="secondary" 
              className="absolute top-2 left-2 text-xs opacity-90"
            >
              {fileType.toUpperCase()}
            </Badge>

            {/* Quick preview button overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 hover:bg-white"
                onClick={handlePreview}
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
            </div>
          </div>

          {/* File info */}
          {showFileInfo && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm truncate" title={displayName}>
                {displayName}
              </h4>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{filename.split('.').pop()?.toUpperCase()}</span>
                {fileSize && <span>{formatFileSize(fileSize)}</span>}
              </div>
            </div>
          )}

          {/* Action buttons */}
          {showActions && (
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={handlePreview}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyLink}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.open(fileUrl, '_blank')}>
                    <Maximize className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-7xl max-h-[95vh] p-0">
          <DialogHeader className="p-6 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-left">{displayName}</DialogTitle>
                <DialogDescription className="text-left">
                  {mimeType} • {fileSize && formatFileSize(fileSize)}
                </DialogDescription>
              </div>
              
              {/* Toolbar for images */}
              {isImage && (
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={zoomOut} disabled={zoom <= 25}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={resetZoom}>
                    {zoom}%
                  </Button>
                  <Button size="sm" variant="outline" onClick={zoomIn} disabled={zoom >= 300}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={rotate}>
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>
          
          <div className="overflow-auto flex-1 p-6 pt-2">
            {isImage ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <img
                  src={fileUrl}
                  alt={displayName}
                  className="max-w-full max-h-full object-contain transition-transform duration-200"
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  }}
                  loading="lazy"
                />
              </div>
            ) : isPdf ? (
              <div className="w-full h-[80vh]">
                <iframe
                  src={fileUrl}
                  title={displayName}
                  className="w-full h-full border-0 rounded-lg"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-6">
                <div className="text-center">
                  <FileIcon className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Preview Not Available</h3>
                  <p className="text-muted-foreground mb-4">
                    This file type cannot be previewed in the browser.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <Button onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download to View
                  </Button>
                  <Button variant="outline" onClick={() => window.open(fileUrl, '_blank')}>
                    <Maximize className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </Button>
                </div>
                
                {/* File details */}
                <Card className="w-full max-w-md">
                  <CardContent className="p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Filename:</span>
                        <span className="font-mono text-right">{filename}</span>
                      </div>
                      {mimeType && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <span className="font-mono">{mimeType}</span>
                        </div>
                      )}
                      {fileSize && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Size:</span>
                          <span className="font-mono">{formatFileSize(fileSize)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}