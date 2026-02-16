const siteUrl = 'https://mharomo.systems'

export default function sitemap() {
  const routes = [
    '/',
    '/systems',
    '/blogs',
    '/ai-tools',
    '/ai-tools/mcm',
    '/ai-image-generator',
    '/ai-video-generator',
    '/ai-music-generator',
    '/speech-to-text',
    '/text-to-speech',
    '/systems/documentation',
    '/systems/documentation/mcm',
    '/systems/documentation/images',
    '/systems/documentation/videos',
    '/systems/documentation/music',
    '/systems/documentation/transcribe',
    '/systems/documentation/tts',
  ]

  const lastModified = new Date()

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
  }))
}
