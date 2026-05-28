import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { destinations } from '@/lib/destinations'
import { COUNTRIES } from '@/lib/countries'
import { SKI_AREAS } from '@/lib/skiAreas'
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

    // Countries index
    entries.push({
      url: `${SITE_URL}/${locale}/countries`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${SITE_URL}/${l}/countries`]),
        ),
      },
    })

    // Each country
    for (const c of COUNTRIES) {
      entries.push({
        url: `${SITE_URL}/${locale}/countries/${c.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${SITE_URL}/${l}/countries/${c.slug}`]),
          ),
        },
      })
    }

    // Ski areas index
    entries.push({
      url: `${SITE_URL}/${locale}/ski-areas`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${SITE_URL}/${l}/ski-areas`]),
        ),
      },
    })

    // Each ski area
    for (const a of SKI_AREAS) {
      entries.push({
        url: `${SITE_URL}/${locale}/ski-areas/${a.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${SITE_URL}/${l}/ski-areas/${a.slug}`]),
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
