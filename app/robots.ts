import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/security',
        '/privacy',
        '/terms',
        '/demo',
        '/book',
      ],
      disallow: [
        '/pro',
        '/admin',
        '/api',
      ],
    },
    sitemap: 'https://bankkey.ch/sitemap.xml',
  }
}
