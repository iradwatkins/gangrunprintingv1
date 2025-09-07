'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileText, Image, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import toast from 'react-hot-toast'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  preview?: string
  progress: number
  status: 'uploading' | 'completed' | 'error'
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      progress: 0,
      status: 'uploading' as const
    }))

    setFiles(prev => [...prev, ...newFiles])
    setUploading(true)

    // Simulate file upload with progress
    for (const [index, file] of newFiles.entries()) {
      const fileIndex = files.length + index
      
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        
        setFiles(prev => prev.map((f, i) => 
          i === fileIndex 
            ? { ...f, progress, status: progress === 100 ? 'completed' : 'uploading' }
            : f
        ))
      }
    }

    setUploading(false)
    toast.success('Files uploaded successfully!')
  }, [files.length])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
      'application/pdf': ['.pdf'],
      'application/postscript': ['.ai', '.eps'],
      'application/x-indesign': ['.indd'],
      'image/x-adobe-photoshop': ['.psd']
    },
    maxSize: 100 * 1024 * 1024 // 100MB
  })

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const proceedToConfiguration = () => {
    // Navigate to product configuration with uploaded files
    console.log('Proceeding with files:', files)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Upload Your Files</h1>
        <p className="text-muted-foreground mb-8">
          Upload your artwork files and we'll help you configure your print order
        </p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload Artwork</CardTitle>
            <CardDescription>
              Accepted formats: PDF, AI, EPS, PSD, INDD, PNG, JPG, SVG (Max 100MB per file)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-colors duration-200
                ${isDragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                }
              `}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-lg">Drop the files here...</p>
              ) : (
                <>
                  <p className="text-lg mb-2">
                    Drag & drop your files here, or click to select
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You can upload multiple files at once
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Files ({files.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {files.map(file => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : file.type === 'application/pdf' ? (
                      <FileText className="w-12 h-12 text-red-500" />
                    ) : (
                      <Image className="w-12 h-12 text-blue-500" />
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm truncate">{file.name}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                      
                      {file.status === 'uploading' ? (
                        <Progress value={file.progress} className="h-2" />
                      ) : file.status === 'completed' ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs">Uploaded</span>
                        </div>
                      ) : null}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      disabled={file.status === 'uploading'}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => setFiles([])}>
                  Clear All
                </Button>
                <Button 
                  onClick={proceedToConfiguration}
                  disabled={uploading || files.length === 0}
                >
                  Configure Print Options
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}