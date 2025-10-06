/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure for subdomain deployment - office.sebenzawaste.co.za
  basePath: process.env.NODE_ENV === 'production' ? '' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  
  experimental: {
    // Enable React 19 features
    reactCompiler: false,
    // Fix chunk loading issues
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  // Enable TypeScript strict mode
  typescript: {
    ignoreBuildErrors: false,
  },
  // Enable ESLint during builds
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Configure images if needed
  images: {
    domains: ['office.sebenzawaste.co.za', 'sebenzawaste.co.za'],
  },
  // Output configuration for deployment
  output: 'standalone',
  // Webpack configuration to fix chunk loading
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
        },
      }
      
      // Add chunk loading error handling
      config.output.chunkLoadingGlobal = 'webpackChunksebenza_office_suite'
      
      // Improve chunk loading reliability
      if (dev) {
        config.optimization.removeAvailableModules = false
        config.optimization.removeEmptyChunks = false
        config.optimization.splitChunks = false
      }
    }
    return config
  },
  // Add timeout configuration
  staticPageGenerationTimeout: 1000,
}

module.exports = nextConfig
