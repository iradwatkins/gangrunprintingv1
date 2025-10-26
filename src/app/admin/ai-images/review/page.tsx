import { Metadata } from 'next'
import { ImageReviewClient } from './image-review-client'

export const metadata: Metadata = {
  title: 'AI Image Review | Admin',
  description: 'Review and approve AI-generated images',
}

export default function ImageReviewPage() {
  return <ImageReviewClient />
}
