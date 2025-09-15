export * from './minio';

export const BUCKETS = {
  UPLOADS: 'gangrun-uploads',
  PRODUCTS: 'gangrun-products',
};

export {
  initializeBuckets,
  getPresignedUploadUrl,
  getPresignedDownloadUrl,
  isMinioAvailable,
  resetMinioClient
} from './minio';