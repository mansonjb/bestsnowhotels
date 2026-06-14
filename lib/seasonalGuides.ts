import type { Locale } from '@/app/[locale]/dictionaries'
import { destinations } from './destinations'
import type { Destination } from './destinations'
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

const SH_CODES = new Set(['AU', 'NZ', 'LS', 'ZA'])

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
  return { slug, heroSlug, name, intro: c.intro, picks: c.picks, description: c.description, filter, sort, limit }
}

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
    (d) => !SH_CODES.has(d.countryCode) && (d.altitudeBase >= 1800 || d.vibes.includes('glacier') || d.vibes.includes('snow-sure')),
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
    (d) => !SH_CODES.has(d.countryCode) && d.snowScore >= 80,
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
    (d) => !SH_CODES.has(d.countryCode) && d.snowScore >= 78,
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
    (d) => !SH_CODES.has(d.countryCode) && d.pistesKm >= 80 && d.snowScore >= 75,
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
    (d) => !SH_CODES.has(d.countryCode) && (d.altitudeBase >= 1800 || d.vibes.includes('glacier') || d.vibes.includes('summer-ski')),
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
    (d) => SH_CODES.has(d.countryCode),
    (d) => d.snowScore,
    20,
  ),
]

export function getSeasonalGuide(slug: string): SeasonalGuide | undefined {
  return SEASONAL_GUIDES.find((g) => g.slug === slug)
}
