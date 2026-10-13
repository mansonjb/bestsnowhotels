import type { Hotel } from './hotels'
import { getHotels } from './hotels'
import { getDestination } from './destinations'

/**
 * "Best hotels in X" comparison pages: a curated set of the 10 highest-profile
 * French + Swiss resorts (France first, per priority), each with >= 6 hotels so
 * the situational verdicts below have something to compare. This is a decision
 * page (which hotel for which need), deliberately distinct from the resort
 * detail page at /destinations/{slug}.
 */
export const BEST_HOTELS_SLUGS = [
  // France (priority)
  'courchevel',
  'val-thorens',
  'val-d-isere',
  'chamonix',
  'megeve',
  'tignes',
  'alpe-d-huez',
  // Switzerland
  'zermatt',
  'verbier',
  'saas-fee',
] as const

export function isBestHotelsResort(slug: string): boolean {
  return (BEST_HOTELS_SLUGS as readonly string[]).includes(slug)
}

/** Resorts that actually resolve AND still have >= 3 hotels (build-time guard). */
export function bestHotelsResorts(): string[] {
  return BEST_HOTELS_SLUGS.filter((s) => getDestination(s) && getHotels(s).length >= 3)
}

export type PickAxis = 'overall' | 'luxury' | 'value' | 'popular' | 'budget'

export interface HotelPick {
  axis: PickAxis
  hotel: Hotel
}

/** Reliability-weighted score: rating pulled towards the mean when few reviews. */
const composite = (h: Hotel): number => h.rating * Math.log10((h.reviewCount || 0) + 10)

/**
 * Assign each situational axis a DISTINCT hotel (so the verdict cards name up to
 * five different places, which is what AI answer engines quote). Every axis is
 * derived only from reliable fields: rating, reviewCount, priceFrom. We do NOT
 * use distanceToSlopesM (it is centre-distance, not lift-distance, so a
 * "closest to the slopes" verdict would be misleading).
 */
export function hotelPicks(hotels: Hotel[]): HotelPick[] {
  if (hotels.length < 3) return []
  const best = (cands: Hotel[], cmp: (a: Hotel, b: Hotel) => number): Hotel | null =>
    cands.length ? [...cands].sort(cmp)[0] : null

  const byPrice = [...hotels].sort((a, b) => a.priceFrom - b.priceFrom)
  const cheaperHalf = byPrice.slice(0, Math.ceil(byPrice.length / 2))

  // TRUE winner per axis, overlaps allowed. Each headline claim is literally
  // correct: budget = cheapest (rating >= 4), luxury = priciest, popular = most
  // reviewed, overall = best rating x reviews, value = best rating among the
  // cheaper half. The page dedupes by hotel, so a place that wins two axes shows
  // two badges rather than fabricating a distinct "winner" that isn't one.
  const out: HotelPick[] = []
  const add = (axis: PickAxis, h: Hotel | null) => {
    if (h) out.push({ axis, hotel: h })
  }
  add('overall', best(hotels, (a, b) => composite(b) - composite(a)))
  add('luxury', best(hotels, (a, b) => b.priceFrom - a.priceFrom || b.rating - a.rating))
  add('value', best(cheaperHalf, (a, b) => composite(b) - composite(a)))
  add('popular', best(hotels, (a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)))
  add('budget', best(hotels.filter((h) => h.rating >= 4.0), (a, b) => a.priceFrom - b.priceFrom))
  return out
}

/** Group picks by hotel (dedupe), preserving axis display order. */
export function pickCards(picks: HotelPick[]): { hotel: Hotel; axes: PickAxis[] }[] {
  const map = new Map<string, { hotel: Hotel; axes: PickAxis[] }>()
  for (const { axis, hotel } of picks) {
    const e = map.get(hotel.id) ?? { hotel, axes: [] }
    e.axes.push(axis)
    map.set(hotel.id, e)
  }
  return [...map.values()]
}

/** Indicative nightly price range across the resort's hotels (EUR). */
export function priceRange(hotels: Hotel[]): { min: number; max: number } {
  const p = hotels.map((h) => h.priceFrom).filter((n) => n > 0)
  return { min: Math.min(...p), max: Math.max(...p) }
}
