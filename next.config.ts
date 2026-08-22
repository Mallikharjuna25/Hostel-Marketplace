import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['bcryptjs', 'mongoose'],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: process.cwd(),
  },
}

export default nextConfig
