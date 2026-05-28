import type { Destination } from '@/lib/destinations'

/**
 * The kinds of skiing a resort realistically offers, derived from its vibes,
 * glacier flag and a small list of resorts known for cross-country. Alpine and
 * snowboard apply everywhere; the rest are added only when there is a clear
 * signal, so the list stays honest.
 */
const NORDIC = new Set([
  'les-saisies',
  'font-romeu',
  'le-grand-bornand',
  'la-clusaz',
  'chamonix',
  'davos',
  'serre-chevalier',
])

export type SkiType =
  | 'alpine'
  | 'snowboard'
  | 'freeride'
  | 'snowpark'
  | 'glacier'
  | 'nordic'
  | 'touring'

export function getSkiTypes(d: Destination): SkiType[] {
  const v = new Set(d.vibes)
  const types: SkiType[] = ['alpine', 'snowboard']
  if (v.has('freeride') || v.has('high-altitude') || v.has('big-domain')) types.push('freeride')
  if (v.has('freestyle') || v.has('party') || v.has('family')) types.push('snowpark')
  if (v.has('glacier')) types.push('glacier')
  if (NORDIC.has(d.slug)) types.push('nordic')
  if (v.has('freeride') || v.has('authentic') || v.has('mountaineering')) types.push('touring')
  // de-duplicate while preserving order
  return Array.from(new Set(types))
}
