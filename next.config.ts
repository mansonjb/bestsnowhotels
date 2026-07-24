import type { NextConfig } from 'next'

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: { root: process.cwd() },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
  // Any straggling literal /images/... URL (cached HTML, external inbound
  // links) 301s to the R2 CDN now that the files no longer ship in the
  // deploy. next/image goes through lib/image-loader.js and never hits this.
  async redirects() {
    const CDN = process.env.NEXT_PUBLIC_IMAGE_CDN
    if (!CDN) return []
    return [{ source: '/images/:path*', destination: `${CDN}/images/:path*`, permanent: true }]
  },
  images: {
    // Custom loader serves destination/hotel photos from the Cloudflare R2
    // CDN (see lib/image-loader.js + NEXT_PUBLIC_IMAGE_CDN). Unsplash hero
    // images pass through the loader untouched, no remotePatterns needed.
    loader: 'custom',
    loaderFile: './lib/image-loader.js',
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
}

export default nextConfig
