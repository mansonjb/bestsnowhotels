import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { destinations } from '@/lib/destinations'
import { locales } from './[locale]/dictionaries'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    // Home
    entries.push({
      url: `${SITE_URL}/${locale}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${SITE_URL}/${l}`]),
        ),
      },
    })

    // Destinations index
    entries.push({
      url: `${SITE_URL}/${locale}/destinations`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${SITE_URL}/${l}/destinations`]),
        ),
      },
    })

    // Each destination
    for (const d of destinations) {
      entries.push({
        url: `${SITE_URL}/${locale}/destinations/${d.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${SITE_URL}/${l}/destinations/${d.slug}`]),
          ),
        },
      })
    }

    // Static pages
    for (const path of ['about', 'disclosure', 'privacy']) {
      entries.push({
        url: `${SITE_URL}/${locale}/${path}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.4,
      })
    }
  }

  return entries
}
