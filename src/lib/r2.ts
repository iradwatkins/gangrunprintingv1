import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'gangrunprinting-files';

export interface UploadResult {
  url: string;
  key: string;
  size: number;
}

/**
 * Upload a file to R2
 */
export async function uploadToR2(
  file: Buffer | Uint8Array | string,
  key: string,
  contentType?: string
): Promise<UploadResult> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType || 'application/octet-stream',
    });

    await r2Client.send(command);

    const url = `${process.env.R2_PUBLIC_URL}/${key}`;
    
    return {
      url,
      key,
      size: Buffer.isBuffer(file) ? file.length : file.length,
    };
  } catch (error) {
    console.error('R2 upload error:', error);
    throw new Error(`Failed to upload file to R2: ${error}`);
  }
}

/**
 * Get a signed URL for temporary access
 */
export async function getSignedR2Url(
  key: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(r2Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('R2 signed URL error:', error);
    throw new Error(`Failed to generate signed URL: ${error}`);
  }
}

/**
 * Delete a file from R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);
  } catch (error) {
    console.error('R2 delete error:', error);
    throw new Error(`Failed to delete file from R2: ${error}`);
  }
}

/**
 * List files in R2 bucket
 */
export async function listR2Files(
  prefix?: string,
  maxKeys: number = 1000
): Promise<Array<{ key: string; size: number; lastModified: Date }>> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: maxKeys,
    });

    const response = await r2Client.send(command);
    
    return (response.Contents || []).map(item => ({
      key: item.Key!,
      size: item.Size || 0,
      lastModified: item.LastModified || new Date(),
    }));
  } catch (error) {
    console.error('R2 list error:', error);
    throw new Error(`Failed to list files from R2: ${error}`);
  }
}

/**
 * Generate a unique file key with timestamp
 */
export function generateFileKey(
  category: string,
  filename: string
): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${category}/${timestamp}-${sanitizedFilename}`;
}

/**
 * Upload product image to R2
 */
export async function uploadProductImage(
  file: Buffer,
  productId: string,
  filename: string,
  contentType: string
): Promise<UploadResult> {
  const key = generateFileKey(`products/${productId}`, filename);
  return uploadToR2(file, key, contentType);
}

/**
 * Upload order file to R2
 */
export async function uploadOrderFile(
  file: Buffer,
  orderId: string,
  filename: string,
  contentType: string
): Promise<UploadResult> {
  const key = generateFileKey(`orders/${orderId}`, filename);
  return uploadToR2(file, key, contentType);
}

/**
 * Upload design file to R2
 */
export async function uploadDesignFile(
  file: Buffer,
  userId: string,
  filename: string,
  contentType: string
): Promise<UploadResult> {
  const key = generateFileKey(`designs/${userId}`, filename);
  return uploadToR2(file, key, contentType);
}