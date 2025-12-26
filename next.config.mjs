import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', 'web-ifc-three'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'three': path.resolve(__dirname, 'node_modules/three'),
    }
    return config
  },
}

export default nextConfig
