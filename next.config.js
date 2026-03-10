/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/dashboard/chat',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
