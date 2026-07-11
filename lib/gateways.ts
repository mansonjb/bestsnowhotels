import { destinations, type Destination } from './destinations'

/**
 * Airport / city gateways for the "Ski resorts near [airport]" guides
 * (/[locale]/ski-near/[slug]). One of the highest-intent ski planning queries:
 * you know which airport you are flying into and want the closest snow.
 *
 * We rank purely by real great-circle distance from the airport's coordinates
 * (nothing invented). Road transfers in the mountains are longer, which the copy
 * says plainly, so the distance is a factual "as the crow flies" figure, not a
 * fake drive time.
 */
export interface Gateway {
  slug: string
  airport: string
  city: string
  code: string
  lat: number
  lng: number
}

export const GATEWAYS: Gateway[] = [
  { slug: 'geneva-airport', airport: 'Geneva Airport', city: 'Geneva', code: 'GVA', lat: 46.2381, lng: 6.109 },
  { slug: 'lyon-airport', airport: 'Lyon-Saint-Exupery Airport', city: 'Lyon', code: 'LYS', lat: 45.7256, lng: 5.0811 },
  { slug: 'grenoble-airport', airport: 'Grenoble Alpes-Isere Airport', city: 'Grenoble', code: 'GNB', lat: 45.3629, lng: 5.3294 },
  { slug: 'chambery-airport', airport: 'Chambery-Savoie Airport', city: 'Chambery', code: 'CMF', lat: 45.6381, lng: 5.88 },
  { slug: 'zurich-airport', airport: 'Zurich Airport', city: 'Zurich', code: 'ZRH', lat: 47.4647, lng: 8.5492 },
  { slug: 'turin-airport', airport: 'Turin Airport', city: 'Turin', code: 'TRN', lat: 45.2008, lng: 7.6496 },
  { slug: 'milan-bergamo-airport', airport: 'Milan Bergamo Airport', city: 'Bergamo', code: 'BGY', lat: 45.6739, lng: 9.7042 },
  { slug: 'innsbruck-airport', airport: 'Innsbruck Airport', city: 'Innsbruck', code: 'INN', lat: 47.2602, lng: 11.344 },
  { slug: 'salzburg-airport', airport: 'Salzburg Airport', city: 'Salzburg', code: 'SZG', lat: 47.7933, lng: 13.0043 },
  { slug: 'munich-airport', airport: 'Munich Airport', city: 'Munich', code: 'MUC', lat: 48.3538, lng: 11.7861 },
  { slug: 'venice-airport', airport: 'Venice Marco Polo Airport', city: 'Venice', code: 'VCE', lat: 45.5053, lng: 12.3519 },
  { slug: 'barcelona-airport', airport: 'Barcelona El Prat Airport', city: 'Barcelona', code: 'BCN', lat: 41.2974, lng: 2.0833 },
  { slug: 'toulouse-airport', airport: 'Toulouse-Blagnac Airport', city: 'Toulouse', code: 'TLS', lat: 43.6293, lng: 1.3638 },
  { slug: 'sofia-airport', airport: 'Sofia Airport', city: 'Sofia', code: 'SOF', lat: 42.6967, lng: 23.4114 },
  { slug: 'sapporo-airport', airport: 'New Chitose Airport', city: 'Sapporo', code: 'CTS', lat: 42.7752, lng: 141.6923 },
  { slug: 'denver-airport', airport: 'Denver International Airport', city: 'Denver', code: 'DEN', lat: 39.8561, lng: -104.6737 },
  { slug: 'salt-lake-city-airport', airport: 'Salt Lake City Airport', city: 'Salt Lake City', code: 'SLC', lat: 40.7899, lng: -111.9791 },
  { slug: 'calgary-airport', airport: 'Calgary International Airport', city: 'Calgary', code: 'YYC', lat: 51.1315, lng: -114.0106 },
  { slug: 'vancouver-airport', airport: 'Vancouver International Airport', city: 'Vancouver', code: 'YVR', lat: 49.1947, lng: -123.1792 },
  { slug: 'queenstown-airport', airport: 'Queenstown Airport', city: 'Queenstown', code: 'ZQN', lat: -45.0211, lng: 168.7392 },
]

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const toRad = (x: number) => (x * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export interface NearResort {
  d: Destination
  km: number
}

export function resortsNear(g: Gateway, limit = 12, maxKm = 250): NearResort[] {
  return destinations
    .map((d) => ({ d, km: Math.round(distanceKm(g.lat, g.lng, d.lat, d.lng)) }))
    .filter((x) => x.km <= maxKm)
    .sort((a, b) => a.km - b.km)
    .slice(0, limit)
}

const MIN_RESORTS = 3

/** Gateways with enough nearby resorts to make a page. */
export function getGateways(): Gateway[] {
  return GATEWAYS.filter((g) => resortsNear(g).length >= MIN_RESORTS)
}
export const getGateway = (slug: string): Gateway | undefined =>
  GATEWAYS.find((g) => g.slug === slug)
