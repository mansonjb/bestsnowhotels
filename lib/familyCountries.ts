import { destinations, type Destination } from './destinations'
import { countrySlug } from './countries'
import { skiInSkiOutTier } from './skiInSkiOut'

/**
 * Resorts that authoritative family-ski roundups repeatedly name as the best for
 * children (dedicated kids' worlds, ski kindergartens, car-free or Famille Plus /
 * Kinderland credentials). Researched from the ski press in 2026, cross-checked
 * against our own resort list. These are floated to the top of each country page
 * and badged, so the ranking reflects real reputation, not just our terrain math.
 * Sources include InTheSnow, Ski Solutions, OnTheSnow, austria.info, skiresort.info
 * and the resorts' own family labels.
 */
export const FAMILY_CHAMPIONS = new Set<string>([
  // France (Famille Plus)
  'avoriaz', 'les-arcs', 'la-plagne', 'la-rosiere', 'les-menuires', 'saint-lary',
  'saint-gervais', 'courchevel', 'les-saisies', 'flaine', 'valmorel', 'les-gets', 'peisey-vallandry', 'montchavin',
  // Austria (Kinderland champions)
  'serfaus-fiss-ladis', 'soll', 'wagrain', 'obergurgl', 'nauders', 'alpbach', 'zell-am-see', 'katschberg',
  // Italy (Dolomites family)
  'alta-badia', 'corvara', 'san-cassiano', 'kronplatz', 'andalo', 'livigno', 'la-thuile', 'san-martino-di-castrozza',
  // Switzerland (car-free + kids)
  'saas-fee', 'wengen', 'grindelwald', 'murren', 'nendaz', 'grachen',
  // USA
  'keystone', 'northstar', 'beaver-creek', 'steamboat', 'park-city',
  // Spain
  'sierra-nevada', 'formigal', 'la-molina', 'astun',
  // Andorra (family sectors)
  'soldeu', 'ordino-arcalis', 'vallnord-pal-arinsal',
  // Canada
  'sun-peaks', 'big-white',
  // Japan
  'tomamu', 'niseko', 'rusutsu', 'kiroro', 'furano',
  // Norway / Scandinavia
  'geilo', 'trysil', 'hemsedal',
])

export const isFamilyChampion = (slug: string): boolean => FAMILY_CHAMPIONS.has(slug)

/**
 * Per-country "best ski resorts for families / with kids" pages
 * (/[locale]/family-ski/[country]).
 *
 * A resort qualifies as a family pick if it carries our hand-assigned `family`
 * vibe. Within a country we then rank those picks best-first with a transparent,
 * data-built family score: what kids actually need is gentle terrain, real
 * beginner runs, a safe (ideally car-free or ski-in/ski-out) base. Nothing here
 * is invented; it all comes from the resort's own piste breakdown and tags.
 */
export function familyScore(d: Destination): number {
  const total = d.pisteCounts.green + d.pisteCounts.blue + d.pisteCounts.red + d.pisteCounts.black
  const easy = d.pisteCounts.green + d.pisteCounts.blue
  const easyShare = total > 0 ? easy / total : 0
  const tier = skiInSkiOutTier(d.slug)
  let s = easyShare * 40
  if (d.pisteCounts.green > 0) s += 10 // genuine beginner runs
  if (d.vibes.includes('family')) s += 18
  if (d.vibes.includes('car-free')) s += 12 // safe to walk with kids
  if (tier === 'strong') s += 16
  else if (tier === 'partial') s += 8
  if (d.vibes.includes('scenic')) s += 4
  return Math.round(s)
}

export type FamilyReason = 'champion' | 'gentle' | 'beginner' | 'carfree' | 'sio' | 'tagged'

/** The reasons we surface per resort, each true from the data or our research. */
export function familyReasons(d: Destination): FamilyReason[] {
  const total = d.pisteCounts.green + d.pisteCounts.blue + d.pisteCounts.red + d.pisteCounts.black
  const easyShare = total > 0 ? (d.pisteCounts.green + d.pisteCounts.blue) / total : 0
  const out: FamilyReason[] = []
  if (isFamilyChampion(d.slug)) out.push('champion')
  if (easyShare >= 0.5) out.push('gentle')
  if (d.pisteCounts.green > 0) out.push('beginner')
  if (d.vibes.includes('car-free')) out.push('carfree')
  if (skiInSkiOutTier(d.slug) === 'strong') out.push('sio')
  if (d.vibes.includes('family')) out.push('tagged')
  return out
}

export interface FamilyCountry {
  country: string
  slug: string
  flag: string
  resorts: Destination[]
  /** Total qualifying family resorts before the display cap. */
  total: number
}

const MIN_QUALIFYING = 3
const SHOW = 14

// Researched champions always sort above the data-only picks, ordered among
// themselves by family score.
const rank = (d: Destination): number => familyScore(d) + (FAMILY_CHAMPIONS.has(d.slug) ? 1000 : 0)

const HUBS: FamilyCountry[] = (() => {
  const byCountry = new Map<string, Destination[]>()
  for (const d of destinations) {
    // A resort qualifies if we tag it family OR the ski press names it a family champion.
    if (!d.vibes.includes('family') && !FAMILY_CHAMPIONS.has(d.slug)) continue
    const list = byCountry.get(d.country) ?? []
    list.push(d)
    byCountry.set(d.country, list)
  }
  const hubs: FamilyCountry[] = []
  for (const [country, list] of byCountry) {
    if (list.length < MIN_QUALIFYING) continue
    list.sort((a, b) => rank(b) - rank(a) || b.snowScore - a.snowScore)
    hubs.push({
      country,
      slug: countrySlug(country),
      flag: list[0].flag,
      resorts: list.slice(0, SHOW),
      total: list.length,
    })
  }
  // Most family resorts first (France, Austria, Italy...).
  return hubs.sort((a, b) => b.total - a.total || a.country.localeCompare(b.country))
})()

export const getFamilyCountries = (): FamilyCountry[] => HUBS
export const getFamilyCountry = (slug: string): FamilyCountry | undefined =>
  HUBS.find((h) => h.slug === slug)
