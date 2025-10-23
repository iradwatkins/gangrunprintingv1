# Customer File Upload Integration Guide

## Overview

The customer file upload system allows customers to upload design files (artwork) when ordering print products. Files are uploaded temporarily during product configuration and then associated with orders after checkout.

---

## System Architecture

### 1. **Temporary Upload Phase** (Product Page)

**Component:** `FileUploadZone.tsx`
**Location:** `/src/components/product/FileUploadZone.tsx`
**API:** `/api/upload/temporary`

Customers upload files while configuring their product. Files are:

- Uploaded to temporary storage
- Stored in sessionStorage with key `uploaded_images_${productId}`
- Displayed in checkout summary

**Supported File Types:**

- PDF (application/pdf)
- Images (JPEG, PNG, SVG, WebP)
- Design files (AI, PSD, EPS)

**File Limits:**

- Max 10MB per file
- Max 50MB total
- Max 10 files per order

### 2. **Order Association Phase** (After Checkout)

**API:** `/api/orders/[id]/files/associate-temp`
**Service:** `order-file-service.ts`

After order creation, temporary uploads are converted to permanent `OrderFile` records:

- File type: `CUSTOMER_ARTWORK`
- Approval status: `NOT_REQUIRED` (customer artwork doesn't need approval)
- Uploaded by role: `CUSTOMER`
- Notifies admin: `true`

---

## Usage Guide

### For Product Configuration Pages

If you want to add file upload to a product page, use the `FileUploadZone` component:

```tsx
import FileUploadZone from '@/components/product/FileUploadZone'

function ProductPage({ product }: Props) {
  const [uploadedFiles, setUploadedFiles] = useState([])

  const handleFilesUploaded = (files) => {
    setUploadedFiles(files)
    // Store in sessionStorage for checkout
    sessionStorage.setItem(`uploaded_images_${product.id}`, JSON.stringify(files))
  }

  return (
    <div>
      <h2>Upload Your Design Files</h2>
      <FileUploadZone
        onFilesUploaded={handleFilesUploaded}
        maxFiles={10}
        maxFileSize={10}
        maxTotalSize={50}
      />
    </div>
  )
}
```

### For Checkout Integration

The checkout page already displays uploaded files. To associate them with an order after creation:

```typescript
import {
  associateTemporaryFilesWithOrder,
  getUploadedFilesFromSession,
} from '@/lib/services/order-file-service'

async function handleOrderCreated(orderId: string, productId: string) {
  // Get uploaded files from session
  const tempFiles = getUploadedFilesFromSession(productId)

  if (tempFiles.length > 0) {
    // Associate files with order
    const result = await associateTemporaryFilesWithOrder(orderId, tempFiles)

    if (result.success) {
      console.log(`${result.files?.length} files associated with order`)
      // Clean up sessionStorage
      clearUploadedFilesFromSession(productId)
    } else {
      console.error('Failed to associate files:', result.error)
      // Handle error - maybe notify user
    }
  }
}
```

### Example: Checkout Success Page Integration

```typescript
// src/app/(customer)/checkout/success/page.tsx
'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { associateTemporaryFilesWithOrder, getUploadedFilesFromSession } from '@/lib/services/order-file-service';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const productId = searchParams.get('productId');

  useEffect(() => {
    if (orderId && productId) {
      // Associate uploaded files with order
      const tempFiles = getUploadedFilesFromSession(productId);

      if (tempFiles.length > 0) {
        associateTemporaryFilesWithOrder(orderId, tempFiles)
          .then((result) => {
            if (result.success) {
              console.log('Files successfully associated with order');
            }
          });
      }
    }
  }, [orderId, productId]);

  return (
    <div>
      <h1>Order Successful!</h1>
      <p>Your files have been uploaded and will be reviewed by our team.</p>
    </div>
  );
}
```

---

## API Reference

### POST `/api/orders/[id]/files/associate-temp`

Associate temporary uploads with an order.

**Request Body:**

```json
{
  "tempFiles": [
    {
      "fileId": "temp_abc123",
      "originalName": "design.pdf",
      "size": 1024000,
      "mimeType": "application/pdf",
      "thumbnailUrl": "/api/upload/temporary/thumbnail/abc123",
      "isImage": false
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "files": [
    {
      "id": "file_xyz789",
      "orderId": "order_123",
      "filename": "design.pdf",
      "fileUrl": "/api/upload/temporary/temp_abc123",
      "fileType": "CUSTOMER_ARTWORK",
      "approvalStatus": "NOT_REQUIRED",
      "uploadedByRole": "CUSTOMER"
    }
  ],
  "message": "1 file(s) associated with order"
}
```

**Authentication:** Required (user must own the order)

**Errors:**

- `401` - Unauthorized (not logged in)
- `403` - Forbidden (user doesn't own order)
- `404` - Order not found
- `400` - Invalid request data
- `500` - Server error

---

## Service Layer Functions

### `associateTemporaryFilesWithOrder(orderId, tempFiles)`

Associates temporary uploads with an order via API call.

**Parameters:**

- `orderId` (string) - Order ID
- `tempFiles` (TempFile[]) - Array of temporary file metadata

**Returns:** Promise<{ success: boolean, files?: any[], error?: string }>

### `getUploadedFilesFromSession(productId)`

Retrieves uploaded files from sessionStorage.

**Parameters:**

- `productId` (string) - Product ID

**Returns:** TempFile[] - Array of file metadata or empty array

### `clearUploadedFilesFromSession(productId)`

Clears uploaded files from sessionStorage after successful order creation.

**Parameters:**

- `productId` (string) - Product ID

---

## File Storage Flow

### Current Implementation:

1. **Upload** → Temporary storage (`/tmp` directory)
2. **Checkout** → Files referenced in sessionStorage
3. **Order Created** → Files associated with order via API
4. **Storage** → Files remain in temporary location

### TODO: MinIO Integration

1. **Upload** → Temporary storage
2. **Order Created** → Copy to permanent MinIO bucket
3. **Storage** → Files in MinIO at `gangrun-orders/{orderId}/customer-artwork/`
4. **Cleanup** → Delete temporary files after 24 hours

---

## Error Handling

### Upload Errors

- **File too large:** Max 10MB per file
- **Too many files:** Max 10 files
- **Total size exceeded:** Max 50MB total
- **Invalid file type:** Only PDF, images, AI, PSD, EPS allowed

**User Experience:** Errors displayed inline in FileUploadZone with dismiss option

### Association Errors

- **Order not found:** User may have entered invalid order ID
- **Permission denied:** User trying to associate files with someone else's order
- **Network error:** API call failed

**User Experience:** Log error to console, optionally notify user

---

## Admin View

After files are associated with an order, admins can view them in:

**Location:** `/admin/orders/[id]`

**Component:** `OrderFilesManager`

**Features:**

- View all customer-uploaded artwork
- Download files
- Add messages/comments
- Upload proofs for customer approval
- See file metadata (size, type, upload date)

---

## Testing Checklist

- [ ] Upload single file on product page
- [ ] Upload multiple files (up to 10)
- [ ] Test file type validation (reject invalid types)
- [ ] Test file size validation (reject files >10MB)
- [ ] Test total size validation (reject if total >50MB)
- [ ] Verify files appear in checkout summary
- [ ] Complete checkout and verify association API called
- [ ] Verify OrderFile records created in database
- [ ] Verify files appear in admin order detail page
- [ ] Test with guest checkout (no user login)
- [ ] Test with logged-in customer
- [ ] Verify sessionStorage cleared after successful order
- [ ] Test error handling (network failure, invalid order, etc.)

---

## Security Considerations

### Current Implementation:

- ✅ File type validation (whitelist of allowed types)
- ✅ File size limits
- ✅ Authentication required for association
- ✅ Order ownership verification

### TODO:

- 🚧 Virus scanning on upload
- 🚧 Rate limiting on upload endpoints
- 🚧 Move to permanent secure storage (MinIO with signed URLs)
- 🚧 Automatic cleanup of temporary files after 24 hours

---

## Future Enhancements

1. **Real-time Upload Progress** - WebSocket updates for large files
2. **Image Optimization** - Automatic compression for large images
3. **AI Proof Generation** - Auto-generate proofs from uploaded artwork
4. **Version Control** - Track file revisions when customers re-upload
5. **Bulk Upload** - ZIP file support for multiple files
6. **Design Validation** - Check file resolution, color mode, bleed areas

---

**Last Updated:** October 15, 2025
**Status:** Customer upload interface complete ✅ | Order association complete ✅ | MinIO integration pending 🚧
