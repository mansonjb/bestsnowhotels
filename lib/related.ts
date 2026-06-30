import { destinations, getDestination, type Destination } from './destinations'
import { BEST_FOR_LISTS, type BestForList } from './bestFor'
import { COMPARE_PAIRS } from './compare'
import { getSkiAreaForResort } from './skiAreas'
import { getThemes, themeResorts } from './skiThemes'
import { countrySlug } from './countries'
import { getSioCountry } from './skiInSkiOut'
import { regionSlug } from './regionPages'
import type { Locale } from '@/app/[locale]/dictionaries'

/** Great-circle distance in km. */
function distanceKm(a: Destination, b: Destination): number {
  const R = 6371
  const toRad = (x: number) => (x * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

/** Closest resorts by real geography, the most intuitive "alternative nearby". */
export function nearbyResorts(slug: string, limit = 4, maxKm = 320): Destination[] {
  const c = getDestination(slug)
  if (!c) return []
  return destinations
    .filter((d) => d.slug !== slug)
    .map((d) => ({ d, km: distanceKm(c, d) }))
    .filter((x) => x.km <= maxKm)
    .sort((a, b) => a.km - b.km)
    .slice(0, limit)
    .map((x) => x.d)
}

/**
 * "If you like this resort": shared character (vibes) plus a similar profile
 * (snow score, size, altitude). Excludes the resorts already shown as nearby so
 * the two bridges never repeat the same card.
 */
export function similarResorts(slug: string, limit = 4, exclude: string[] = []): Destination[] {
  const c = getDestination(slug)
  if (!c) return []
  const skip = new Set([slug, ...exclude])
  const sig = new Set(c.vibes)
  return destinations
    .filter((d) => !skip.has(d.slug))
    .map((d) => {
      const shared = d.vibes.filter((v) => sig.has(v)).length
      const snowDiff = Math.abs(d.snowScore - c.snowScore)
      const sizeDiff = Math.abs(d.pistesKm - c.pistesKm)
      const altDiff = Math.abs(d.altitudeSummit - c.altitudeSummit)
      const score = shared * 100 - snowDiff * 0.6 - sizeDiff * 0.04 - altDiff * 0.008
      return { d, score, shared }
    })
    .filter((x) => x.shared >= 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.d)
}

// Precompute which resorts actually appear on each "best for" list (respecting
// each list's own sort + cap), so membership lookups are O(1) at render time.
const BEST_FOR_MEMBERS: Record<string, Set<string>> = {}
for (const b of BEST_FOR_LISTS) {
  const matched = destinations
    .filter(b.filter)
    .sort((a, c) => b.sort(c) - b.sort(a))
    .slice(0, b.limit ?? 24)
  BEST_FOR_MEMBERS[b.slug] = new Set(matched.map((m) => m.slug))
}

export function bestForListsFor(slug: string): BestForList[] {
  return BEST_FOR_LISTS.filter((b) => BEST_FOR_MEMBERS[b.slug]?.has(slug))
}

export interface ChipLink {
  href: string
  label: string
}
export interface ChipGroup {
  key: 'explore' | 'bestFor' | 'compare' | 'plan'
  title: string
  items: ChipLink[]
}

const GROUP_TITLES: Record<ChipGroup['key'], Record<Locale, string>> = {
  explore: { en: 'Explore the area', fr: 'Explorer la région', es: 'Explora la zona', pt: 'Explorar a zona', it: 'Esplora la zona' },
  bestFor: { en: 'This resort is on our lists', fr: 'Cette station est dans nos sélections', es: 'Esta estación está en nuestras listas', pt: 'Esta estância está nas nossas listas', it: 'Questa località è nelle nostre liste' },
  compare: { en: 'Compare it', fr: 'La comparer', es: 'Compárala', pt: 'Compará-la', it: 'Confrontala' },
  plan: { en: 'Plan your trip', fr: 'Préparer le voyage', es: 'Planifica tu viaje', pt: 'Planeie a viagem', it: 'Pianifica il viaggio' },
}

const T = {
  region: { en: 'in', fr: 'dans', es: 'en', pt: 'em', it: 'in' },
  allIn: { en: 'All resorts in', fr: 'Toutes les stations de', es: 'Todas las estaciones de', pt: 'Todas as estâncias de', it: 'Tutte le località di' },
  vs: { en: 'vs', fr: 'ou', es: 'vs', pt: 'vs', it: 'vs' },
  skiArea: { en: 'Ski area', fr: 'Domaine skiable', es: 'Dominio esquiable', pt: 'Domínio esquiável', it: 'Comprensorio' },
  sio: { en: 'Ski-in/ski-out', fr: 'Ski au pied', es: 'A pie de pista', pt: 'À beira das pistas', it: 'Sugli sci' },
  winter: { en: 'Winter 2027', fr: 'Hiver 2027', es: 'Invierno 2027', pt: 'Inverno 2027', it: 'Inverno 2027' },
  weather: { en: 'Snow & weather', fr: 'Neige et météo', es: 'Nieve y tiempo', pt: 'Neve e tempo', it: 'Neve e meteo' },
  guide: { en: 'Things to know', fr: 'À savoir', es: 'Qué saber', pt: 'O que saber', it: 'Cosa sapere' },
} satisfies Record<string, Record<Locale, string>>

const THEME_LABELS: Record<string, Record<Locale, string>> = {
  'ski-spa-resorts': { en: 'Ski & spa resorts', fr: 'Stations ski et spa', es: 'Estaciones de esquí y spa', pt: 'Estâncias de esqui e spa', it: 'Località sci e spa' },
  'apres-ski-resorts': { en: 'Best apres-ski', fr: 'Meilleur après-ski', es: 'Mejor apres-ski', pt: 'Melhor apres-ski', it: 'Miglior apres-ski' },
}

/**
 * Every internal page this resort connects to, grouped for a coloured chip
 * cloud. Drives the bulk of the destination-to-destination maillage.
 */
export function hubLinksFor(d: Destination, l: Locale, regionLabel: string, countryLabel: string): ChipGroup[] {
  const cSlug = countrySlug(d.country)
  const area = getSkiAreaForResort(d.slug)
  const sio = getSioCountry(cSlug)

  const explore: ChipLink[] = [
    { href: `/${l}/regions/${regionSlug(d.region)}`, label: regionLabel },
    { href: `/${l}/countries/${cSlug}`, label: countryLabel },
  ]
  if (area) explore.push({ href: `/${l}/ski-areas/${area.slug}`, label: area.name })

  const bestFor: ChipLink[] = bestForListsFor(d.slug)
    .slice(0, 6)
    .map((b) => ({ href: `/${l}/best/${b.slug}`, label: b.name[l] }))

  const compare: ChipLink[] = COMPARE_PAIRS.filter((p) => p.slugA === d.slug || p.slugB === d.slug)
    .slice(0, 4)
    .map((p) => {
      const a = getDestination(p.slugA)
      const b = getDestination(p.slugB)
      return { href: `/${l}/compare/${p.slug}`, label: `${a?.name ?? p.slugA} ${T.vs[l]} ${b?.name ?? p.slugB}` }
    })

  const themes = getThemes().filter((t) => t.kind === 'resorts' && themeResorts(t.slug).some((r) => r.slug === d.slug))
  const plan: ChipLink[] = [
    { href: `/${l}/guides/${d.slug}`, label: T.guide[l] },
    { href: `/${l}/weather/${d.slug}`, label: T.weather[l] },
  ]
  if (sio) plan.push({ href: `/${l}/ski-in-ski-out/${cSlug}`, label: `${T.sio[l]}: ${countryLabel}` })
  if (area) plan.push({ href: `/${l}/winter-2027/${area.slug}`, label: T.winter[l] })
  for (const t of themes.slice(0, 2)) plan.push({ href: `/${l}/ski-guides/${t.slug}`, label: THEME_LABELS[t.slug]?.[l] ?? t.slug.replace(/-/g, ' ') })

  const groups: ChipGroup[] = [
    { key: 'explore', title: GROUP_TITLES.explore[l], items: explore },
    { key: 'bestFor', title: GROUP_TITLES.bestFor[l], items: bestFor },
    { key: 'compare', title: GROUP_TITLES.compare[l], items: compare },
    { key: 'plan', title: GROUP_TITLES.plan[l], items: plan },
  ]
  return groups.filter((g) => g.items.length > 0)
}
