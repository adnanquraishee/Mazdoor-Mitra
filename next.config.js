/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['supabase.co'],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
