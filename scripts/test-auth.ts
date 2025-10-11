// Test auth endpoint to see what it returns
import https from 'https'

const testAuth = () => {
  const options = {
    hostname: 'gangrunprinting.com',
    port: 443,
    path: '/api/auth/me',
    method: 'GET',
    headers: {
      Accept: 'application/json',
      // Add a test cookie if needed
    },
  }

  const req = https.request(options, (res) => {
    let data = ''

    res.on('data', (chunk) => {
      data += chunk
    })

    res.on('end', () => {
      try {
        const parsed = JSON.parse(data)
        console.log('Parsed response:', JSON.stringify(parsed, null, 2))
      } catch (e) {}
    })
  })

  req.on('error', (error) => {
    console.error('Error:', error)
  })

  req.end()
}

testAuth()
