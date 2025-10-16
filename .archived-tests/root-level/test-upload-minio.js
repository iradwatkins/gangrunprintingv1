const { Client } = require('minio')

const minioClient = new Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'gangrun_minio_access',
  secretKey: 'gangrun_minio_secret_2024',
})

const BUCKET_NAME = 'gangrun-uploads'

async function testUpload() {
  try {
    // Create a test file buffer
    const testContent =
      'This is a test file for GangRun Printing customer upload verification.\n\nOrder ID: test_order_123\nUploaded: ' +
      new Date().toISOString()
    const buffer = Buffer.from(testContent)
    const fileName = `customer-uploads/test_order_123/${Date.now()}-test-design.txt`

    console.log('🔄 Uploading test file to MinIO...')
    console.log('📁 Bucket:', BUCKET_NAME)
    console.log('📄 File:', fileName)

    // Upload to MinIO
    await minioClient.putObject(BUCKET_NAME, fileName, buffer, buffer.length, {
      'Content-Type': 'text/plain',
    })

    console.log('✅ Upload successful!')

    // Generate download URL
    const downloadUrl = await minioClient.presignedGetObject(BUCKET_NAME, fileName, 24 * 60 * 60)
    console.log('🔗 Download URL (valid for 24h):', downloadUrl)

    // List files in bucket
    console.log('\n📋 Files in customer-uploads/test_order_123/:')
    const stream = minioClient.listObjects(BUCKET_NAME, 'customer-uploads/test_order_123/', true)

    stream.on('data', (obj) => {
      console.log('  -', obj.name, `(${obj.size} bytes)`)
    })

    stream.on('error', (err) => {
      console.error('❌ Error listing files:', err)
    })

    stream.on('end', () => {
      console.log('\n✅ MinIO upload test completed successfully!')
    })
  } catch (error) {
    console.error('❌ Upload test failed:', error)
    process.exit(1)
  }
}

testUpload()
