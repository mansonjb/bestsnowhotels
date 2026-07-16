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
  pair('val-d-isere-vs-tignes', 'val-d-isere', 'tignes', 'val-d-isere'),
  pair('courchevel-vs-meribel', 'courchevel', 'meribel', 'courchevel'),
  pair('les-arcs-vs-la-plagne', 'les-arcs', 'la-plagne', 'les-arcs'),
  pair('saalbach-vs-st-anton', 'saalbach', 'st-anton', 'st-anton'),
  pair('jackson-hole-vs-big-sky', 'jackson-hole', 'big-sky', 'jackson-hole'),
  // Wave 24: high-intent rivalry queries (FR "ou", EN "vs", NA "vs").
  pair('avoriaz-vs-morzine', 'avoriaz', 'morzine', 'avoriaz'),
  pair('les-menuires-vs-val-thorens', 'les-menuires', 'val-thorens', 'val-thorens'),
  pair('alpe-d-huez-vs-les-deux-alpes', 'alpe-d-huez', 'les-deux-alpes', 'alpe-d-huez'),
  pair('verbier-vs-zermatt', 'verbier', 'zermatt', 'zermatt'),
  pair('verbier-vs-courchevel', 'verbier', 'courchevel', 'verbier'),
  pair('st-anton-vs-lech-zurs', 'st-anton', 'lech-zurs', 'st-anton'),
  pair('ischgl-vs-st-anton', 'ischgl', 'st-anton', 'st-anton'),
  pair('park-city-vs-deer-valley', 'park-city', 'deer-valley', 'deer-valley'),
  pair('park-city-vs-vail', 'park-city', 'vail', 'vail'),
  pair('breckenridge-vs-vail', 'breckenridge', 'vail', 'vail'),
  pair('whistler-blackcomb-vs-lake-louise', 'whistler-blackcomb', 'lake-louise', 'whistler-blackcomb'),
  // Wave 25: Southern Hemisphere head-to-heads (in-season June to October, our
  // page-1 LATAM / Oceania markets). One high-intent rivalry per SH region.
  pair('valle-nevado-vs-portillo', 'valle-nevado', 'portillo', 'valle-nevado'),
  pair('valle-nevado-vs-cerro-catedral', 'valle-nevado', 'cerro-catedral', 'valle-nevado'),
  pair('cerro-catedral-vs-las-lenas', 'cerro-catedral', 'las-lenas', 'cerro-catedral'),
  pair('perisher-vs-thredbo', 'perisher', 'thredbo', 'thredbo'),
  pair('coronet-peak-vs-the-remarkables', 'coronet-peak', 'the-remarkables', 'the-remarkables'),
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
