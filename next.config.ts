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
}

export default nextConfig
