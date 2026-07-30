/**
 * Contextual cross-links to our sister travel site perfectcitybreak.com.
 *
 * Several of our airport gateways (see lib/gateways.ts) are cities that are
 * also city-break destinations on perfectcitybreak.com, so on those /ski-near
 * pages we bridge "fly in for the ski, stay a night for the city".
 *
 * URL rules (verified against the citytrip repo):
 *  - canonical apex domain, no www
 *  - English lives at the root: /<city>
 *  - other locales under /<locale>/<city>
 *  - some cities are English-only there; `locales` lists what actually exists,
 *    so we fall back to the English URL rather than linking a 404.
 */

const CITY_BREAK_BASE = 'https://perfectcitybreak.com'

interface CityBreak {
  slug: string
  name: string
  /** locales that actually have a page on perfectcitybreak.com */
  locales: string[]
}

/** gateway slug (lib/gateways.ts) -> matching city on perfectcitybreak.com */
const GATEWAY_CITY: Record<string, CityBreak> = {
  'lyon-airport': { slug: 'lyon', name: 'Lyon', locales: ['en'] },
  'salzburg-airport': { slug: 'salzburg', name: 'Salzburg', locales: ['en'] },
  'milan-bergamo-airport': { slug: 'milan', name: 'Milan', locales: ['en'] },
  'zurich-airport': { slug: 'zurich', name: 'Zurich', locales: ['en', 'fr', 'es', 'it', 'pt'] },
  'munich-airport': { slug: 'munich', name: 'Munich', locales: ['en', 'fr', 'es', 'it', 'pt'] },
  'venice-airport': { slug: 'venice', name: 'Venice', locales: ['en', 'fr', 'es', 'it', 'pt'] },
  'barcelona-airport': { slug: 'barcelona', name: 'Barcelona', locales: ['en', 'fr', 'es', 'it', 'pt'] },
  'sofia-airport': { slug: 'sofia', name: 'Sofia', locales: ['en', 'fr', 'es', 'it', 'pt'] },
}

export function cityBreakForGateway(gatewaySlug: string): CityBreak | undefined {
  return GATEWAY_CITY[gatewaySlug]
}

/** Full URL to the city page, in the visitor's locale when it exists, else English. */
export function cityBreakUrl(city: CityBreak, locale: string): string {
  const useLocale = locale !== 'en' && city.locales.includes(locale)
  return useLocale ? `${CITY_BREAK_BASE}/${locale}/${city.slug}` : `${CITY_BREAK_BASE}/${city.slug}`
}
