export function GET() {
  const content = `User-agent: *
Allow: /
Allow: /blogs
Allow: /ai-tools
Allow: /systems/documentation
Disallow: /admin
Disallow: /monitor
Disallow: /systems
Disallow: /api

Sitemap: https://mharomo.systems/sitemap.xml
`

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}
