import type { Locale } from '@/app/[locale]/dictionaries'
import { destinations } from './destinations'
import type { Destination } from './destinations'
import { isSouthernHemisphere } from './countries'
import seasonalContent from '@/data/seasonalGuides.json'

/**
 * "Where to ski in [period] 2027" guides for programmatic SEO. Each guide
 * has a localised name (used in title), editorial intro + picks + description,
 * a heroSlug for the cover photo, and a filter that returns the curated list
 * of destinations to display.
 */
export interface SeasonalGuide {
  slug: string
  heroSlug: string
  name: Record<Locale, string>
  intro: Record<Locale, string>
  picks: Record<Locale, string>
  description: Record<Locale, string>
  filter: (d: Destination) => boolean
  sort: (d: Destination) => number
  limit?: number
}

interface SeasonalContent {
  intro: Record<Locale, string>
  picks: Record<Locale, string>
  description: Record<Locale, string>
}

const CONTENT = seasonalContent as Record<string, SeasonalContent>

/**
 * A destination's season window covers a given month if its seasonStart →
 * seasonEnd range (which may wrap around the year, e.g. "Jul 12" → "Apr 21"
 * for Saas-Fee) includes the month. Used to filter out summer-only glaciers
 * from northern-hemisphere winter guides.
 */
const MONTH_IDX: Record<string, number> = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
}
function seasonCoversMonth(d: Destination, month: number): boolean {
  // Year-round resorts (indoor, glacier-365) — explicit pass.
  if (d.seasonStart === 'All year' || d.seasonEnd === 'All year') return true
  const start = MONTH_IDX[d.seasonStart.slice(0, 3)]
  const end = MONTH_IDX[d.seasonEnd.slice(0, 3)]
  if (!start || !end) return true // unknown season string — be permissive rather than silently dropping
  return start <= end ? month >= start && month <= end : month >= start || month <= end
}

const LOCALES: Locale[] = ['en', 'fr', 'es', 'pt', 'it']
function assertLocaleParity(slug: string, c: SeasonalContent) {
  for (const field of ['intro', 'picks', 'description'] as const) {
    for (const l of LOCALES) {
      if (!c[field]?.[l]) throw new Error(`Missing locale '${l}' for seasonal guide '${slug}' field '${field}'`)
    }
  }
}

function guide(
  slug: string,
  heroSlug: string,
  name: Record<Locale, string>,
  filter: (d: Destination) => boolean,
  sort: (d: Destination) => number,
  limit?: number,
): SeasonalGuide {
  const c = CONTENT[slug]
  if (!c) throw new Error(`Missing seasonal content for ${slug}`)
  assertLocaleParity(slug, c)
  return { slug, heroSlug, name, intro: c.intro, picks: c.picks, description: c.description, filter, sort, limit }
}

/** Northern-hemisphere monthly guide: not in the Southern Hemisphere AND the resort's
 *  season actually covers the target month. Extra dispatch on snow/altitude/size. */
const nhMonth = (month: number, extra: (d: Destination) => boolean) => (d: Destination) =>
  !isSouthernHemisphere(d) && seasonCoversMonth(d, month) && extra(d)

export const SEASONAL_GUIDES: SeasonalGuide[] = [
  guide(
    'december-2026',
    'val-thorens',
    {
      en: 'Where to ski in December 2026',
      fr: 'Où skier en décembre 2026',
      es: 'Dónde esquiar en diciembre de 2026',
      pt: 'Onde esquiar em dezembro de 2026',
      it: 'Dove sciare a dicembre 2026',
    },
    nhMonth(12, (d) => d.altitudeBase >= 1800 || d.vibes.includes('glacier') || d.vibes.includes('snow-sure')),
    (d) => d.snowScore + d.altitudeBase / 100,
    24,
  ),
  guide(
    'january-2027',
    'niseko',
    {
      en: 'Where to ski in January 2027',
      fr: 'Où skier en janvier 2027',
      es: 'Dónde esquiar en enero de 2027',
      pt: 'Onde esquiar em janeiro de 2027',
      it: 'Dove sciare a gennaio 2027',
    },
    nhMonth(1, (d) => d.snowScore >= 80),
    (d) => d.snowScore,
    24,
  ),
  guide(
    'february-2027',
    'ischgl',
    {
      en: 'Where to ski in February 2027',
      fr: 'Où skier en février 2027',
      es: 'Dónde esquiar en febrero de 2027',
      pt: 'Onde esquiar em fevereiro de 2027',
      it: 'Dove sciare a febbraio 2027',
    },
    nhMonth(2, (d) => d.snowScore >= 78),
    (d) => d.snowScore,
    24,
  ),
  guide(
    'march-2027',
    'verbier',
    {
      en: 'Where to ski in March 2027',
      fr: 'Où skier en mars 2027',
      es: 'Dónde esquiar en marzo de 2027',
      pt: 'Onde esquiar em março de 2027',
      it: 'Dove sciare a marzo 2027',
    },
    nhMonth(3, (d) => d.pistesKm >= 80 && d.snowScore >= 75),
    (d) => d.snowScore + Math.min(d.pistesKm, 300) / 10,
    24,
  ),
  guide(
    'april-2027',
    'tignes',
    {
      en: 'Where to ski in April 2027',
      fr: 'Où skier en avril 2027',
      es: 'Dónde esquiar en abril de 2027',
      pt: 'Onde esquiar em abril de 2027',
      it: 'Dove sciare ad aprile 2027',
    },
    nhMonth(4, (d) => d.altitudeBase >= 1800 || d.vibes.includes('glacier') || d.vibes.includes('summer-ski')),
    (d) => d.altitudeBase + d.snowScore * 10,
    24,
  ),
  guide(
    'southern-hemisphere-winter-2027',
    'thredbo',
    {
      en: 'Where to ski in the Southern Hemisphere winter 2027',
      fr: "Où skier dans l'hémisphère sud à l'hiver 2027",
      es: 'Dónde esquiar en el invierno austral 2027',
      pt: 'Onde esquiar no inverno austral de 2027',
      it: "Dove sciare nell'inverno australe 2027",
    },
    (d) => isSouthernHemisphere(d),
    (d) => d.snowScore,
    20,
  ),
]

export function getSeasonalGuide(slug: string): SeasonalGuide | undefined {
  return SEASONAL_GUIDES.find((g) => g.slug === slug)
}
