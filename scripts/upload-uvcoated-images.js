#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

const UPLOADS_DIR = '/tmp/uploads-extracted';
const API_URL = 'http://localhost:3015/api/admin/media';
const BATCH_SIZE = 10; // Upload 10 images at a time

// Filter out thumbnails and resized versions
function isOriginalImage(filename) {
  // Skip WordPress thumbnail sizes like -100x100, -150x150, -300x200, etc.
  const thumbnailPattern = /-\d+x\d+\.(jpg|jpeg|png|webp|gif)$/i;
  return !thumbnailPattern.test(filename);
}

function findAllImages(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findAllImages(filePath, fileList);
    } else if (/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file)) {
      if (isOriginalImage(file)) {
        fileList.push(filePath);
      }
    }
  }

  return fileList;
}

async function uploadImage(imagePath, index, total) {
  const fileName = path.basename(imagePath);
  const relativePath = path.relative(UPLOADS_DIR, imagePath);

  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(imagePath));
    formData.append('type', 'WEBSITE_MEDIA');
    formData.append('title', fileName.replace(/\.[^/.]+$/, '').replace(/-/g, ' '));
    formData.append('tags', JSON.stringify(['uvcoated', 'imported']));

    const response = await axios.post(API_URL, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    console.log(`✅ [${index}/${total}] Uploaded: ${relativePath}`);
    return { success: true, file: relativePath };
  } catch (error) {
    console.error(`❌ [${index}/${total}] Failed: ${relativePath} - ${error.message}`);
    return { success: false, file: relativePath, error: error.message };
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function uploadInBatches(images) {
  const results = {
    total: images.length,
    uploaded: 0,
    failed: 0,
    errors: []
  };

  console.log(`\n📦 Found ${images.length} original images to upload\n`);

  for (let i = 0; i < images.length; i += BATCH_SIZE) {
    const batch = images.slice(i, Math.min(i + BATCH_SIZE, images.length));
    const promises = batch.map((img, idx) =>
      uploadImage(img, i + idx + 1, images.length)
    );

    const batchResults = await Promise.all(promises);

    batchResults.forEach(result => {
      if (result.success) {
        results.uploaded++;
      } else {
        results.failed++;
        results.errors.push({ file: result.file, error: result.error });
      }
    });

    // Small delay between batches to avoid overwhelming the server
    if (i + BATCH_SIZE < images.length) {
      await sleep(500);
    }
  }

  return results;
}

async function main() {
  console.log('🔍 Scanning for images...');

  if (!fs.existsSync(UPLOADS_DIR)) {
    console.error(`❌ Directory not found: ${UPLOADS_DIR}`);
    process.exit(1);
  }

  const allImages = findAllImages(UPLOADS_DIR);

  console.log(`📊 Total images found: ${allImages.length}`);

  const results = await uploadInBatches(allImages);

  console.log('\n' + '='.repeat(60));
  console.log('📊 UPLOAD SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total images: ${results.total}`);
  console.log(`✅ Uploaded: ${results.uploaded}`);
  console.log(`❌ Failed: ${results.failed}`);

  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    results.errors.slice(0, 10).forEach(err => {
      console.log(`  - ${err.file}: ${err.error}`);
    });
    if (results.errors.length > 10) {
      console.log(`  ... and ${results.errors.length - 10} more errors`);
    }
  }

  console.log('='.repeat(60) + '\n');
}

main().catch(console.error);
