import type { MetadataRoute } from 'next'
import { SITE_URL, hreflangFor } from '@/lib/site'
import { destinations } from '@/lib/destinations'
import { COUNTRIES } from '@/lib/countries'
import { SKI_AREAS } from '@/lib/skiAreas'
import { BEST_FOR_LISTS } from '@/lib/bestFor'
import { COMPARE_PAIRS } from '@/lib/compare'
import { getRegionHubs } from '@/lib/regionPages'
import { getFamilyCountries } from '@/lib/familyCountries'
import { getGateways } from '@/lib/gateways'
import { SEASONAL_GUIDES } from '@/lib/seasonalGuides'
import { skiInSkiOutByCountry } from '@/lib/skiInSkiOut'
import { getWinterAreas } from '@/lib/winterHolidays'
import { getThemes } from '@/lib/skiThemes'
import { getHotels } from '@/lib/hotels'
import { BEST_HOTELS_SLUGS } from '@/lib/bestHotels'
import { locales } from './[locale]/dictionaries'

const REGION_HUBS = getRegionHubs()
const FAMILY_COUNTRIES = getFamilyCountries()
const GATEWAYS = getGateways()

// Only resorts with at least one bookable hotel belong in the sitemap. The 4
// hotel-less resorts (lofsdalen, jbel-bou-iblane, tala-guilef, tiffindell)
// render thin "0 hotels" pages and are noindex, so they are excluded from the
// destination and weather loops below.
const INDEXABLE_DESTINATIONS = destinations.filter((d) => getHotels(d.slug).length > 0)

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
    for (const d of INDEXABLE_DESTINATIONS) {
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

    // Regions index
    entries.push({
      url: `${SITE_URL}/${locale}/regions`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: hreflangFor(`/regions`),
      },
    })

    // Each region
    for (const h of REGION_HUBS) {
      entries.push({
        url: `${SITE_URL}/${locale}/regions/${h.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: {
          languages: hreflangFor(`/regions/${h.slug}`),
        },
      })
    }

    // Ski resorts near an airport: index + each gateway
    entries.push({
      url: `${SITE_URL}/${locale}/ski-near`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: { languages: hreflangFor(`/ski-near`) },
    })
    for (const g of GATEWAYS) {
      entries.push({
        url: `${SITE_URL}/${locale}/ski-near/${g.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: { languages: hreflangFor(`/ski-near/${g.slug}`) },
      })
    }

    // Family skiing by country: index + each country
    entries.push({
      url: `${SITE_URL}/${locale}/family-ski`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: { languages: hreflangFor(`/family-ski`) },
    })
    for (const h of FAMILY_COUNTRIES) {
      entries.push({
        url: `${SITE_URL}/${locale}/family-ski/${h.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: { languages: hreflangFor(`/family-ski/${h.slug}`) },
      })
    }

    // Southern Hemisphere hub (evergreen: ski in July/August/September)
    entries.push({
      url: `${SITE_URL}/${locale}/southern-hemisphere`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: { languages: hreflangFor(`/southern-hemisphere`) },
    })

    // Andes 2026 last-weeks conversion page (in-season booking push)
    entries.push({
      url: `${SITE_URL}/${locale}/andes-2026`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: { languages: hreflangFor(`/andes-2026`) },
    })

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
    for (const path of ['weather', 'weather/best-snow', 'weather/fresh-powder', 'weather/snowing-now']) {
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
    for (const d of INDEXABLE_DESTINATIONS) {
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

    // Opening dates (typical season windows)
    entries.push({
      url: `${SITE_URL}/${locale}/opening-dates`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
      alternates: {
        languages: hreflangFor(`/opening-dates`),
      },
    })

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

    // Ski-in/ski-out hub + per-country
    entries.push({
      url: `${SITE_URL}/${locale}/ski-in-ski-out`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: {
        languages: hreflangFor(`/ski-in-ski-out`),
      },
    })
    for (const c of skiInSkiOutByCountry()) {
      entries.push({
        url: `${SITE_URL}/${locale}/ski-in-ski-out/${c.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.75,
        alternates: {
          languages: hreflangFor(`/ski-in-ski-out/${c.slug}`),
        },
      })
    }

    // Resort guides hub only. The per-resort /guides/{slug} pages are noindex
    // (near-duplicate of /destinations/{slug}), so they are intentionally left
    // out of the sitemap.
    entries.push({
      url: `${SITE_URL}/${locale}/guides`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: {
        languages: hreflangFor(`/guides`),
      },
    })

    // Winter holidays 2027 hub + per-domain
    entries.push({
      url: `${SITE_URL}/${locale}/winter-2027`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: { languages: hreflangFor(`/winter-2027`) },
    })
    for (const a of getWinterAreas()) {
      entries.push({
        url: `${SITE_URL}/${locale}/winter-2027/${a.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: { languages: hreflangFor(`/winter-2027/${a.slug}`) },
      })
    }

    // Ski guides (thematic) hub + each
    entries.push({
      url: `${SITE_URL}/${locale}/ski-guides`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
      alternates: { languages: hreflangFor(`/ski-guides`) },
    })
    for (const t of getThemes()) {
      entries.push({
        url: `${SITE_URL}/${locale}/ski-guides/${t.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: { languages: hreflangFor(`/ski-guides/${t.slug}`) },
      })
    }

    // Best-hotels comparison hub + curated per-resort comparison pages
    entries.push({
      url: `${SITE_URL}/${locale}/best-hotels`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: { languages: hreflangFor('/best-hotels') },
    })
    for (const slug of BEST_HOTELS_SLUGS) {
      entries.push({
        url: `${SITE_URL}/${locale}/best-hotels/${slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.8,
        alternates: { languages: hreflangFor(`/best-hotels/${slug}`) },
      })
    }

    // Static pages
    for (const path of ['about', 'disclosure', 'privacy', 'methodology']) {
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
