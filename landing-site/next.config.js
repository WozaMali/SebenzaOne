/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable React 19 features
    reactCompiler: false,
  },
  // Enable static exports for Vercel deployment
  // output: 'export',
  // trailingSlash: true,
  // Disable image optimization for static export
  images: {
    unoptimized: true,
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
  // Set the output file tracing root to avoid workspace warnings
  outputFileTracingRoot: __dirname,
  // Disable ESLint during build to avoid warnings
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
