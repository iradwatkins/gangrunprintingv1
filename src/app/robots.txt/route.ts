import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const robotsTxt = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

# Sitemaps
Sitemap: https://gangrunprinting.com/sitemap.xml

# Disallow admin pages
User-agent: *
Disallow: /admin/
Disallow: /api/

# Allow crawling of product pages
User-agent: *
Allow: /products/
Allow: /category/
Allow: /locations/

# Crawl-delay for respectful crawling
Crawl-delay: 1
`

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
