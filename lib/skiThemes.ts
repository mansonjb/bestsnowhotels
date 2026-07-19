import type { Locale } from '@/app/[locale]/dictionaries'
import { destinations } from './destinations'
import type { Destination } from './destinations'
import { getHotels } from './hotels'
import type { Hotel } from './hotels'
import content from '@/data/skiThemes.json'

/**
 * Long-tail thematic ski guides that showcase resorts or hotels around one
 * idea (spa skiing, apres-ski, luxury hotels). Editorial copy lives in
 * data/skiThemes.json (5 locales); the picks are selected from our own data
 * here, so nothing is invented. Two shapes: 'resorts' guides list matching
 * destinations, 'hotels' guides surface real, well-rated hotels.
 */
export type ThemeKind = 'resorts' | 'hotels'

export interface SkiTheme {
  slug: string
  heroSlug: string
  kind: ThemeKind
}

interface ThemeContent {
  title: Record<Locale, string>
  intro: Record<Locale, string>
  body: Record<Locale, string>
  faq: { q: Record<Locale, string>; a: Record<Locale, string> }[]
}

const CONTENT = content as Record<string, ThemeContent>

export const SKI_THEMES: SkiTheme[] = [
  { slug: 'ski-spa-resorts', heroSlug: 'leukerbad', kind: 'resorts' },
  { slug: 'apres-ski-resorts', heroSlug: 'st-anton', kind: 'resorts' },
  { slug: 'luxury-ski-hotels', heroSlug: 'courchevel', kind: 'hotels' },
  // France focus: geographic (Alps, Pyrenees) + value, all data-driven selections.
  { slug: 'french-alps', heroSlug: 'val-thorens', kind: 'resorts' },
  { slug: 'french-pyrenees', heroSlug: 'saint-lary', kind: 'resorts' },
  { slug: 'value-france', heroSlug: 'les-menuires', kind: 'resorts' },
  // Spain focus: the Pyrenees range + the two angles that are Spain's identity
  // (affordable and family), all data-driven selections.
  { slug: 'spanish-pyrenees', heroSlug: 'baqueira-beret', kind: 'resorts' },
  { slug: 'value-spain', heroSlug: 'formigal', kind: 'resorts' },
  { slug: 'family-spain', heroSlug: 'la-molina', kind: 'resorts' },
]

export const getThemes = (): SkiTheme[] => SKI_THEMES
export const getTheme = (slug: string): SkiTheme | undefined => SKI_THEMES.find((t) => t.slug === slug)

const LOCALES: Locale[] = ['en', 'fr', 'es', 'pt', 'it']
export function themeContent(slug: string): ThemeContent {
  const c = CONTENT[slug]
  if (!c) throw new Error(`Missing ski-theme content for ${slug}`)
  for (const f of ['title', 'intro', 'body'] as const)
    for (const l of LOCALES) if (!c[f]?.[l]) throw new Error(`Missing ${f}.${l} for theme ${slug}`)
  for (const item of c.faq)
    for (const l of LOCALES) if (!item.q?.[l] || !item.a?.[l]) throw new Error(`Missing faq locale for theme ${slug}`)
  return c
}

/* ---- resort selection (data-driven, defensible) ---- */
const hasVibe = (d: Destination, ...v: string[]) => v.some((x) => d.vibes.includes(x))

export function themeResorts(slug: string): Destination[] {
  let list: Destination[] = []
  if (slug === 'ski-spa-resorts') list = destinations.filter((d) => hasVibe(d, 'thermal', 'wellness'))
  else if (slug === 'apres-ski-resorts') list = destinations.filter((d) => hasVibe(d, 'party'))
  else if (slug === 'french-alps') list = destinations.filter((d) => d.region === 'French Alps')
  else if (slug === 'french-pyrenees') list = destinations.filter((d) => d.region === 'French Pyrenees')
  else if (slug === 'value-france') list = destinations.filter((d) => d.countryCode === 'FR' && d.vibes.includes('value'))
  else if (slug === 'spanish-pyrenees') list = destinations.filter((d) => d.region === 'Spanish Pyrenees')
  else if (slug === 'value-spain') list = destinations.filter((d) => d.countryCode === 'ES' && d.vibes.includes('value'))
  else if (slug === 'family-spain') list = destinations.filter((d) => d.countryCode === 'ES' && d.vibes.includes('family'))
  // Cap the big French Alps and value lists to the top 24 by snow score; the
  // Pyrenees lists and the Spain lists (all under 24) show in full.
  const capped = slug === 'french-alps' || slug === 'value-france'
  const sorted = list.sort((a, b) => b.snowScore - a.snowScore)
  return capped ? sorted.slice(0, 24) : sorted
}

/* ---- hotel selection for 'hotels' guides ---- */
export interface ThemeHotel {
  hotel: Hotel
  resort: Destination
}

/**
 * Important criteria that apply to a hotel pick, each derived from data we can
 * stand behind: the resort's editorial vibes, the hotel's distance to the
 * slopes, the hotel's own name (many advertise a spa), and its guest rating.
 * Returns criterion keys; the page maps them to localised labels + icons.
 */
export type HotelCriterion = 'ski' | 'spa' | 'dining' | 'apres' | 'family' | 'scenery' | 'topRated'
export function hotelCriteria(resort: Destination, hotel: Hotel): HotelCriterion[] {
  const v = resort.vibes
  const out: HotelCriterion[] = []
  if (hotel.distanceToSlopesM != null && hotel.distanceToSlopesM <= 400) out.push('ski')
  if (/spa|wellness|therm/i.test(hotel.name) || v.includes('thermal') || v.includes('wellness')) out.push('spa')
  if (v.includes('gastronomy') || /restaurant|gastronom|cuisine/i.test(hotel.name)) out.push('dining')
  if (v.includes('party')) out.push('apres')
  if (v.includes('family')) out.push('family')
  if (v.includes('scenic') || v.includes('panoramic') || v.includes('iconic')) out.push('scenery')
  if (hotel.rating >= 4.7) out.push('topRated')
  return out
}

/** Top-rated hotels in the great luxury ski resorts (max 2 per resort for variety). */
export function themeHotels(slug: string): ThemeHotel[] {
  if (slug !== 'luxury-ski-hotels') return []
  const luxResorts = destinations.filter((d) => hasVibe(d, 'luxury', 'old-money'))
  const score = (h: Hotel) => h.rating * Math.log10((h.reviewCount ?? 1) + 10)
  const out: ThemeHotel[] = []
  for (const resort of luxResorts) {
    const picks = getHotels(resort.slug)
      .filter((h) => h.rating >= 4.6 && (h.reviewCount ?? 0) >= 100)
      .sort((a, b) => score(b) - score(a))
      .slice(0, 2)
    for (const hotel of picks) out.push({ hotel, resort })
  }
  return out.sort((a, b) => score(b.hotel) - score(a.hotel)).slice(0, 18)
}
