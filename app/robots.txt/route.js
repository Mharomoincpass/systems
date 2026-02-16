export function GET() {
  const content = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /monitor
Disallow: /api
Sitemap: https://mharomo.systems/sitemap.xml
  Allow: /blogs
`

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}
