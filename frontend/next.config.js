/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Removed output: 'export' to allow dynamic routes
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig