// Test MinIO upload functionality from Docker environment
const { Client } = require('minio');

const minioClient = new Client({
  endPoint: 'localhost',
  port: 9002,
  useSSL: false,
  accessKey: 'gangrun_minio_access',
  secretKey: 'gangrun_minio_secret_2024'
});

async function testUpload() {
  try {
    console.log('Testing MinIO connection from host to Docker container...');

    // Check if bucket exists
    const bucketExists = await minioClient.bucketExists('gangrun-uploads');
    console.log(`Bucket 'gangrun-uploads' exists: ${bucketExists}`);

    if (!bucketExists) {
      console.log('Creating bucket...');
      await minioClient.makeBucket('gangrun-uploads', 'us-east-1');
      console.log('Bucket created successfully');
    }

    // Create a test file
    const testContent = Buffer.from('Test upload from Docker deployment - Customer/Product image upload test');
    const timestamp = new Date().getTime();
    const fileName = `test-upload-${timestamp}.txt`;

    // Upload test file
    console.log(`Uploading test file: ${fileName}`);
    await minioClient.putObject('gangrun-uploads', fileName, testContent);
    console.log('✅ Upload successful!');

    // Verify file exists
    const stat = await minioClient.statObject('gangrun-uploads', fileName);
    console.log('✅ File verified:', {
      size: stat.size,
      etag: stat.etag,
      lastModified: stat.lastModified
    });

    // Clean up test file
    await minioClient.removeObject('gangrun-uploads', fileName);
    console.log('✅ Test file removed');

    console.log('\n🎉 MinIO upload test PASSED - Ready for customer & product images!');
    process.exit(0);
  } catch (error) {
    console.error('❌ MinIO test FAILED:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testUpload();
