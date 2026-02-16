const siteUrl = 'https://mharomo.systems'

export default function sitemap() {
  const routes = [
    '/',
    '/systems',
    '/blogs',
    '/systems/documentation',
    '/systems/documentation/slm',
    '/systems/documentation/images',
    '/systems/documentation/videos',
    '/systems/documentation/music',
    '/systems/documentation/transcribe',
    '/systems/documentation/tts',
    '/SLM',
    '/images',
    '/videos',
    '/music',
    '/transcribe',
    '/tts',
    '/login',
    '/register',
  ]

  const lastModified = new Date()

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
  }))
}
