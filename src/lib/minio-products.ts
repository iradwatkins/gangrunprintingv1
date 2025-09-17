export * from './minio';
import { uploadFile } from './minio';

export const validateImage = (buffer: Buffer, fileName?: string, mimeType?: string) => {
  const maxSize = 10 * 1024 * 1024; // 10MB (increased from 5MB)
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  // If mimeType is provided, validate it
  if (mimeType && !allowedTypes.includes(mimeType)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'
    };
  }

  // Validate buffer size
  if (buffer.length > maxSize) {
    return {
      valid: false,
      error: 'File size too large. Maximum size is 10MB.'
    };
  }

  // Basic image signature validation
  const signatures = {
    jpeg: [0xFF, 0xD8, 0xFF],
    png: [0x89, 0x50, 0x4E, 0x47],
    gif: [0x47, 0x49, 0x46],
    webp: [0x52, 0x49, 0x46, 0x46] // RIFF signature (WebP uses RIFF container)
  };

  let isValidImage = false;
  for (const [format, signature] of Object.entries(signatures)) {
    if (signature.every((byte, index) => buffer[index] === byte)) {
      isValidImage = true;
      break;
    }
  }

  if (!isValidImage) {
    return {
      valid: false,
      error: 'Invalid image file. File does not appear to be a valid image.'
    };
  }

  return { valid: true };
};

export const uploadProductImage = async (buffer: Buffer, fileName: string, mimeType: string) => {
  try {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const objectName = `products/${timestamp}-${cleanFileName}`;

    // Upload to MinIO - use explicit bucket signature
    const uploadResult = await uploadFile(
      'gangrun-products',
      objectName,
      buffer,
      {
        'Content-Type': mimeType,
        'x-amz-meta-original-name': fileName,
        'x-amz-meta-upload-timestamp': timestamp.toString()
      }
    );

    // Return structure expected by frontend
    return {
      url: uploadResult.url,
      thumbnailUrl: uploadResult.url, // For now, use same URL for thumbnail
      objectName: uploadResult.objectName,
      size: uploadResult.size,
      mimeType: mimeType,
      originalName: fileName
    };
  } catch (error) {
    console.error('Error uploading product image:', error);
    throw new Error('Failed to upload image to storage');
  }
};

export const deleteProductImage = async (objectName: string) => {
  try {
    // Note: Implementation would require MinIO client delete operation
    // For now, return success - actual deletion can be implemented later
    console.log('Image deletion requested for:', objectName);
    return true;
  } catch (error) {
    console.error('Error deleting product image:', error);
    throw new Error('Failed to delete image from storage');
  }
};