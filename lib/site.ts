export const SITE_URL = 'https://www.bestsnowhotels.com'
export const SITE_NAME = 'BestSnowHotels'

const LOCALES = ['en', 'fr', 'es', 'pt', 'it'] as const

/**
 * Build the `alternates.languages` map for a given site-relative path,
 * including the `x-default` hreflang pointing at the English variant.
 * One place to update if the locale set or default ever changes.
 *
 * Usage:
 *   alternates: {
 *     canonical: `${SITE_URL}/${locale}/best`,
 *     languages: hreflangFor('/best'),
 *   }
 */
export function hreflangFor(path: string): Record<string, string> {
  const p = path.startsWith('/') ? path : `/${path}`
  const out: Record<string, string> = {}
  for (const l of LOCALES) out[l] = `${SITE_URL}/${l}${p}`
  out['x-default'] = `${SITE_URL}/en${p}`
  return out
}

/**
 * Serialise one or more JSON-LD nodes for a single <script type="application/ld+json">.
 * A single node is emitted as-is. Multiple nodes are wrapped in a top-level
 * object with "@context" + "@graph" rather than a bare array: a top-level array
 * has no "@context", which makes naive consumers crash on data["@context"].
 */
export function jsonLdGraph(data: object | object[]): string {
  if (!Array.isArray(data)) return JSON.stringify(data)
  const graph = data.map((node) => {
    const { ['@context']: _ctx, ...rest } = node as Record<string, unknown>
    return rest
  })
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
}

/** Stay22 partner ID used for the letmeallez script, map embed and Allez deep links. */
export const STAY22_ID = '6a172a3725eb5f0f8532400c'

/**
 * Stay22 map embed URL for a destination.
 * The map renders hotels around the given coordinates, all links auto-tracked.
 */
export function buildStay22MapSrc(lat: number, lng: number, zoom = 13): string {
  return `https://www.stay22.com/embed/gm?aid=${STAY22_ID}&lat=${lat}&lng=${lng}&zoom=${zoom}&maintype=ski`
}

/**
 * Stay22 Allez deep link for a destination (city/resort, no specific hotel).
 * Lands the user on the best booking platform (Booking, Expedia, Hotels.com) for their geo,
 * tracked under our affiliate. Use this for hero CTAs and destination cards.
 */
export function buildAllezDestLink(
  resortName: string,
  country: string,
  campaign = 'bestsnowhotels',
  nights = 0,
): string {
  const address = encodeURIComponent(`${resortName} ${country}`)
  return `https://www.stay22.com/allez/roam?aid=${STAY22_ID}&campaign=${campaign}&address=${address}${buildDateRange(nights)}`
}

/**
 * Stay22 Allez deep link for a specific named hotel inside a resort.
 */
export function buildAllezHotelLink(
  hotelName: string,
  resortName: string,
  country: string,
  campaign = 'bestsnowhotels',
  nights = 0,
): string {
  const address = encodeURIComponent(`${resortName} ${country}`)
  const name = encodeURIComponent(hotelName)
  return `https://www.stay22.com/allez/roam?aid=${STAY22_ID}&campaign=${campaign}&hotelname=${name}&address=${address}${buildDateRange(nights)}`
}

/**
 * Pre-fill checkin / checkout query-string for Allez links.
 * Pushes longer stays by defaulting to today + 30 days as checkin.
 */
function buildDateRange(nights: number): string {
  if (!nights || nights <= 0) return ''
  const today = new Date()
  const checkin = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
  const checkout = new Date(checkin.getTime() + nights * 24 * 60 * 60 * 1000)
  const fmt = (d: Date) => d.toISOString().split('T')[0]
  return `&checkin=${fmt(checkin)}&checkout=${fmt(checkout)}`
}
