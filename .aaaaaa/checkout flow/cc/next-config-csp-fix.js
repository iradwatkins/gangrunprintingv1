/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing config...
  reactStrictMode: true,
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              // Default sources
              "default-src 'self'",
              
              // Scripts - Allow Square and Cardinal Commerce
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://*.squarecdn.com https://geoissuer.cardinalcommerce.com https://songbird.cardinalcommerce.com https://centinelapistag.cardinalcommerce.com",
              
              // Styles
              "style-src 'self' 'unsafe-inline'",
              
              // Frames - CRITICAL: Allow Cardinal Commerce for 3D Secure
              "frame-src 'self' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://*.squarecdn.com https://kit.cash.app https://geoissuer.cardinalcommerce.com https://songbird.cardinalcommerce.com https://centinelapistag.cardinalcommerce.com",
              
              // Images
              "img-src 'self' data: https:",
              
              // Connect/API calls - Allow Square and Cardinal Commerce
              "connect-src 'self' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://*.squarecdn.com https://connect.squareup.com https://pci-connect.squareup.com https://connect.squareupsandbox.com https://pci-connect.squareupsandbox.com https://geoissuer.cardinalcommerce.com https://songbird.cardinalcommerce.com https://centinelapistag.cardinalcommerce.com",
              
              // Form actions - CRITICAL: Allow Cardinal Commerce forms
              "form-action 'self' https://geoissuer.cardinalcommerce.com https://songbird.cardinalcommerce.com https://centinelapistag.cardinalcommerce.com",
              
              // Child sources (for iframes)
              "child-src 'self' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://*.squarecdn.com https://geoissuer.cardinalcommerce.com https://songbird.cardinalcommerce.com https://centinelapistag.cardinalcommerce.com",
              
              // Fonts
              "font-src 'self' data:",
              
              // Media
              "media-src 'self'",
              
              // Objects
              "object-src 'none'",
              
              // Base URI
              "base-uri 'self'",
              
              // Upgrade insecure requests (optional, for production)
              // "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;