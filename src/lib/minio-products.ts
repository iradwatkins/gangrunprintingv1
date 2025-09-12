export * from './minio';

export const validateImage = (file: File) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
  }
  
  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum size is 5MB.');
  }
  
  return true;
};

export const uploadProductImage = async (file: File, productId: string) => {
  // Implementation would go here
  return `/api/products/${productId}/image`;
};

export const deleteProductImage = async (productId: string, imageId: string) => {
  // Implementation would go here
  return true;
};