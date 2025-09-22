const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'  // Listen on all interfaces (IPv4 and IPv6)
const port = process.env.PORT || 3002

// Check if port is already in use
const checkPort = (port) => {
  return new Promise((resolve, reject) => {
    const tester = createServer()
      .once('error', err => {
        if (err.code === 'EADDRINUSE') {
          console.error(`Port ${port} is already in use`)
          reject(err)
        } else {
          reject(err)
        }
      })
      .once('listening', () => {
        tester.close(() => resolve())
      })
      .listen(port, hostname)
  })
}

// Initialize Next.js app with increased body parser limit
const app = next({
  dev,
  hostname,
  port,
  conf: {
    experimental: {
      serverActions: {
        bodySizeLimit: '20mb'
      }
    }
  }
})
const handle = app.getRequestHandler()

// Graceful shutdown handler
let server
const gracefulShutdown = () => {
  console.log('Received shutdown signal, closing server gracefully...')
  if (server) {
    server.close(() => {
      console.log('Server closed')
      process.exit(0)
    })
    // Force close after 10 seconds
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down')
      process.exit(1)
    }, 10000)
  } else {
    process.exit(0)
  }
}

// Register shutdown handlers
process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

// Start server
async function startServer() {
  try {
    // Check if port is available
    await checkPort(port)

    // Prepare Next.js app
    await app.prepare()

    server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true)

        // Set max body size for incoming requests
        if (req.method === 'POST' && parsedUrl.pathname?.includes('/api/products/upload-image')) {
          // Allow larger payloads for image uploads
          req.socket.server.maxHeadersCount = 50
          req.socket.server.headersTimeout = 60000
        }

        await handle(req, res, parsedUrl)
      } catch (err) {
        console.error('Error occurred handling', req.url, err)
        res.statusCode = 500
        res.end('internal server error')
      }
    })

    // Increase server limits for file uploads
    server.maxHeadersCount = 100
    server.headersTimeout = 120000 // 2 minutes
    server.requestTimeout = 120000 // 2 minutes
    server.timeout = 120000 // 2 minutes

    server
      .on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.error(`Port ${port} is already in use. Another instance may be running.`)
          console.error('Please stop the other instance or use a different port.')
          process.exit(1)
        } else {
          console.error('Server error:', err)
          process.exit(1)
        }
      })
      .listen(port, hostname, () => {
        console.log(`> Ready on http://localhost:${port}`)
        console.log(`> Server PID: ${process.pid}`)
      })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

// Start the server
startServer()