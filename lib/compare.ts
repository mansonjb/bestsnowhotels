import type { Locale } from '@/app/[locale]/dictionaries'
import { destinations } from './destinations'
import type { Destination } from './destinations'
import comparisonsContent from '@/data/comparisons.json'

/**
 * Head-to-head comparison pages: "X vs Y". Each pair has an editorial intro,
 * a clear verdict, and a longer description, plus structural data pulled live
 * from destinations.json.
 */
export interface ComparePair {
  slug: string
  slugA: string
  slugB: string
  heroSlug: string
  intro: Record<Locale, string>
  verdict: Record<Locale, string>
  description: Record<Locale, string>
}

interface ComparisonContent {
  intro: Record<Locale, string>
  verdict: Record<Locale, string>
  description: Record<Locale, string>
}

const CONTENT = comparisonsContent as Record<string, ComparisonContent>
const LOCALES: Locale[] = ['en', 'fr', 'es', 'pt', 'it']

function assertLocaleParity(slug: string, c: ComparisonContent) {
  for (const field of ['intro', 'verdict', 'description'] as const) {
    for (const l of LOCALES) {
      if (!c[field]?.[l]) throw new Error(`Missing locale '${l}' for comparison '${slug}' field '${field}'`)
    }
  }
}

function pair(slug: string, slugA: string, slugB: string, heroSlug: string): ComparePair {
  const c = CONTENT[slug]
  if (!c) throw new Error(`Missing comparison content for ${slug}`)
  assertLocaleParity(slug, c)
  return { slug, slugA, slugB, heroSlug, intro: c.intro, verdict: c.verdict, description: c.description }
}

export const COMPARE_PAIRS: ComparePair[] = [
  pair('zermatt-vs-st-moritz', 'zermatt', 'st-moritz', 'zermatt'),
  pair('whistler-blackcomb-vs-vail', 'whistler-blackcomb', 'vail', 'whistler-blackcomb'),
  pair('val-thorens-vs-tignes', 'val-thorens', 'tignes', 'val-thorens'),
  pair('niseko-vs-hakuba-happo-one', 'niseko', 'hakuba-happo-one', 'niseko'),
  pair('chamonix-vs-zermatt', 'chamonix', 'zermatt', 'chamonix'),
  pair('aspen-snowmass-vs-vail', 'aspen-snowmass', 'vail', 'aspen-snowmass'),
]

export function getComparePair(slug: string): ComparePair | undefined {
  return COMPARE_PAIRS.find((p) => p.slug === slug)
}

export function getComparisonDestinations(p: ComparePair): { a?: Destination; b?: Destination } {
  return {
    a: destinations.find((d) => d.slug === p.slugA),
    b: destinations.find((d) => d.slug === p.slugB),
  }
}
