import tiers from '@/data/skiInSkiOut.json'
import { destinations } from './destinations'
import type { Destination } from './destinations'
import { countrySlug } from './countries'

/**
 * Ski-in/ski-out access tier per resort, classified from our own editorial
 * skiInSkiOutNote (the note already makes the genuine-vs-marketing call):
 *   strong  = most of the village is genuinely ski-to-the-door
 *   partial = some addresses / specific sub-villages qualify
 *   limited = rare, or you rely on a lift/shuttle from town
 * Source of truth: data/skiInSkiOut.json (slug -> tier).
 */
export type SioTier = 'strong' | 'partial' | 'limited'
const TIERS = tiers as Record<string, SioTier>

export const skiInSkiOutTier = (slug: string): SioTier => TIERS[slug] ?? 'limited'
export const isCarFree = (d: Destination): boolean => d.vibes.includes('car-free')

export interface SioCountry {
  country: string
  slug: string
  resorts: Destination[]
  strongCount: number
  carFreeCount: number
}

const tierRank: Record<SioTier, number> = { strong: 2, partial: 1, limited: 0 }

/**
 * Countries with a page: those with at least MIN_QUALIFYING resorts where
 * ski-in/ski-out is genuine (strong or partial). Within a country, strong
 * tier first, then partial, snowScore descending inside each tier. "limited"
 * resorts are excluded: we will not list a resort as ski-in/ski-out when our
 * own note says it is not.
 */
const MIN_QUALIFYING = 3

export function skiInSkiOutByCountry(): SioCountry[] {
  const byCountry = new Map<string, Destination[]>()
  for (const d of destinations) {
    if (skiInSkiOutTier(d.slug) === 'limited') continue
    const list = byCountry.get(d.country) ?? []
    list.push(d)
    byCountry.set(d.country, list)
  }

  const out: SioCountry[] = []
  for (const [country, resorts] of byCountry) {
    if (resorts.length < MIN_QUALIFYING) continue
    resorts.sort((a, b) => {
      const t = tierRank[skiInSkiOutTier(b.slug)] - tierRank[skiInSkiOutTier(a.slug)]
      return t !== 0 ? t : b.snowScore - a.snowScore
    })
    out.push({
      country,
      slug: countrySlug(country),
      resorts,
      strongCount: resorts.filter((d) => skiInSkiOutTier(d.slug) === 'strong').length,
      carFreeCount: resorts.filter(isCarFree).length,
    })
  }
  // Most genuine ski-in/ski-out countries first.
  return out.sort((a, b) => b.strongCount - a.strongCount || b.resorts.length - a.resorts.length)
}

export function getSioCountry(slug: string): SioCountry | undefined {
  return skiInSkiOutByCountry().find((c) => c.slug === slug)
}
