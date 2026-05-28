import data from '@/data/destinations.json'
import type { Locale } from '@/app/[locale]/dictionaries'

export interface Destination {
  slug: string
  name: string
  country: string
  countryCode: string
  flag: string
  region: string
  lat: number
  lng: number
  altitudeBase: number
  altitudeSummit: number
  pistesKm: number
  lifts: number
  skiInSkiOutNote: Record<Locale, string>
  seasonStart: string
  seasonEnd: string
  snowScore: number
  vibes: string[]
  /** Indicative number of marked runs by piste colour. Green is 0 in countries
   *  whose classification has no green (Italy, Austria, Switzerland). */
  pisteCounts: { green: number; blue: number; red: number; black: number }
  intro: Record<Locale, string>
  /** Longer editorial paragraph shown in the "Get to know the resort" section. */
  longDescription: Record<Locale, string>
}

export const destinations = data as Destination[]

export function getDestination(slug: string): Destination | undefined {
  return destinations.find((d) => d.slug === slug)
}

export function getDestinationsByCountry(): Map<string, Destination[]> {
  const map = new Map<string, Destination[]>()
  for (const d of destinations) {
    const list = map.get(d.country) ?? []
    list.push(d)
    map.set(d.country, list)
  }
  return map
}

export function getRelatedDestinations(slug: string, limit = 4): Destination[] {
  const current = getDestination(slug)
  if (!current) return []
  // Same region first, then same country, then everything else. Excludes self.
  const sameRegion = destinations.filter(
    (d) => d.slug !== slug && d.region === current.region,
  )
  const sameCountry = destinations.filter(
    (d) => d.slug !== slug && d.country === current.country && d.region !== current.region,
  )
  const rest = destinations.filter(
    (d) => d.slug !== slug && d.country !== current.country,
  )
  return [...sameRegion, ...sameCountry, ...rest].slice(0, limit)
}
