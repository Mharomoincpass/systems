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
      {
        source: '/',
        has: [{ type: 'query', key: 'tab' }],
        destination: '/studio',
        permanent: false,
      },
      {
        source: '/',
        has: [{ type: 'query', key: 'admin' }],
        destination: '/studio',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
