import type { MetadataRoute } from 'next'
import { SITE_URL, hreflangFor } from '@/lib/site'
import { destinations } from '@/lib/destinations'
import { COUNTRIES } from '@/lib/countries'
import { SKI_AREAS } from '@/lib/skiAreas'
import { BEST_FOR_LISTS } from '@/lib/bestFor'
import { COMPARE_PAIRS } from '@/lib/compare'
import { SEASONAL_GUIDES } from '@/lib/seasonalGuides'
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
        languages: hreflangFor(``),
      },
    })

    // Destinations index
    entries.push({
      url: `${SITE_URL}/${locale}/destinations`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: hreflangFor(`/destinations`),
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
          languages: hreflangFor(`/destinations/${d.slug}`),
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
        languages: hreflangFor(`/countries`),
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
          languages: hreflangFor(`/countries/${c.slug}`),
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
        languages: hreflangFor(`/ski-areas`),
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
          languages: hreflangFor(`/ski-areas/${a.slug}`),
        },
      })
    }

    // Best-for index
    entries.push({
      url: `${SITE_URL}/${locale}/best`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: {
        languages: hreflangFor(`/best`),
      },
    })

    // Each best-for list
    for (const b of BEST_FOR_LISTS) {
      entries.push({
        url: `${SITE_URL}/${locale}/best/${b.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.75,
        alternates: {
          languages: hreflangFor(`/best/${b.slug}`),
        },
      })
    }

    // Weather index + curated lists (live data; high change frequency)
    for (const path of ['weather', 'weather/best-snow', 'weather/fresh-powder']) {
      entries.push({
        url: `${SITE_URL}/${locale}/${path}`,
        lastModified: now,
        changeFrequency: 'hourly',
        priority: 0.8,
        alternates: {
          languages: hreflangFor(`/${path}`),
        },
      })
    }

    // Per-resort weather pages (one per destination, every 30 min ISR)
    for (const d of destinations) {
      entries.push({
        url: `${SITE_URL}/${locale}/weather/${d.slug}`,
        lastModified: now,
        changeFrequency: 'hourly',
        priority: 0.75,
        alternates: {
          languages: hreflangFor(`/weather/${d.slug}`),
        },
      })
    }

    // Compare index + pairs
    entries.push({
      url: `${SITE_URL}/${locale}/compare`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: hreflangFor(`/compare`),
      },
    })
    for (const p of COMPARE_PAIRS) {
      entries.push({
        url: `${SITE_URL}/${locale}/compare/${p.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: {
          languages: hreflangFor(`/compare/${p.slug}`),
        },
      })
    }

    // When index + seasonal guides
    entries.push({
      url: `${SITE_URL}/${locale}/when`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: {
        languages: hreflangFor(`/when`),
      },
    })
    for (const g of SEASONAL_GUIDES) {
      entries.push({
        url: `${SITE_URL}/${locale}/when/${g.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.75,
        alternates: {
          languages: hreflangFor(`/when/${g.slug}`),
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
