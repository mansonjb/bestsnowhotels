import { destinations, type Destination } from './destinations'
import { localizeRegion } from './regions'
import type { Locale } from '@/app/[locale]/dictionaries'

/**
 * Region hub pages (/[locale]/regions/[slug]). Each gathers every resort whose
 * `region` matches, giving the semantic cocoon a mid-level node between a single
 * resort and its whole country. All copy is templated from the data (counts,
 * altitudes, the top resort), so nothing is invented and parity is automatic.
 */
export interface RegionHub {
  slug: string
  /** Canonical English region name as stored on destinations. */
  name: string
  resorts: Destination[]
  countries: string[]
  stats: {
    count: number
    maxSummit: number
    minBase: number
    /** Highest snow score in the region. */
    topSlug: string
    topName: string
    topScore: number
    /** Largest resort by piste length. */
    biggestSlug: string
    biggestName: string
    biggestKm: number
  }
}

/** Slug from the English region name: strip accents, keep any "(qualifier)" as
 *  a suffix so e.g. "Sierra Nevada (Spain)" stays distinct from US Sierra Nevada. */
export function regionSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[()]/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const HUBS: RegionHub[] = (() => {
  const byRegion = new Map<string, Destination[]>()
  for (const d of destinations) {
    const list = byRegion.get(d.region) ?? []
    list.push(d)
    byRegion.set(d.region, list)
  }
  const hubs: RegionHub[] = []
  for (const [name, list] of byRegion) {
    const byScore = [...list].sort((a, b) => b.snowScore - a.snowScore)
    const byKm = [...list].sort((a, b) => b.pistesKm - a.pistesKm)
    const top = byScore[0]
    const biggest = byKm[0]
    hubs.push({
      slug: regionSlug(name),
      name,
      resorts: byScore,
      countries: [...new Set(list.map((d) => d.country))],
      stats: {
        count: list.length,
        maxSummit: Math.max(...list.map((d) => d.altitudeSummit)),
        minBase: Math.min(...list.map((d) => d.altitudeBase)),
        topSlug: top.slug,
        topName: top.name,
        topScore: top.snowScore,
        biggestSlug: biggest.slug,
        biggestName: biggest.name,
        biggestKm: biggest.pistesKm,
      },
    })
  }
  return hubs.sort((a, b) => b.stats.count - a.stats.count)
})()

export const getRegionHubs = (): RegionHub[] => HUBS
export const getRegionHub = (slug: string): RegionHub | undefined =>
  HUBS.find((h) => h.slug === slug)
export const regionHubForName = (name: string): RegionHub | undefined =>
  HUBS.find((h) => h.name === name)

/** Data-built intro paragraph, one factual sentence pair per locale. */
export function regionIntro(h: RegionHub, l: Locale): string {
  const r = localizeRegion(h.name, l)
  const s = h.stats
  const single = s.count === 1
  const en = single
    ? `${r} has one ski resort in our guide, ${s.topName}, rising to ${s.maxSummit} m. Below you will find its ski-in/ski-out hotels, snow record and trip links.`
    : `${r} gathers ${s.count} ski resorts in our guide, rising to ${s.maxSummit} m at the highest. ${s.topName} holds the top snow score here and ${s.biggestName} is the largest with ${s.biggestKm} km of piste. Compare them all below, each with ski-in/ski-out hotels.`
  const fr = single
    ? `${r} compte une station de ski dans notre guide, ${s.topName}, qui culmine à ${s.maxSummit} m. Vous trouverez ci-dessous ses hôtels ski au pied, son enneigement et les liens utiles.`
    : `${r} réunit ${s.count} stations de ski dans notre guide, jusqu'à ${s.maxSummit} m au plus haut. ${s.topName} y obtient le meilleur score d'enneigement et ${s.biggestName} est la plus vaste avec ${s.biggestKm} km de pistes. Comparez-les ci-dessous, chacune avec ses hôtels ski au pied.`
  const es = single
    ? `${r} tiene una estación de esquí en nuestra guía, ${s.topName}, que llega a ${s.maxSummit} m. Más abajo verás sus hoteles a pie de pista, su nieve y los enlaces de viaje.`
    : `${r} reúne ${s.count} estaciones de esquí en nuestra guía, hasta ${s.maxSummit} m en lo más alto. ${s.topName} logra aquí la mejor puntuación de nieve y ${s.biggestName} es la mayor, con ${s.biggestKm} km de pistas. Compáralas todas más abajo, cada una con sus hoteles a pie de pista.`
  const pt = single
    ? `${r} tem uma estância de esqui no nosso guia, ${s.topName}, que chega aos ${s.maxSummit} m. Em baixo encontra os seus hotéis à beira das pistas, a neve e as ligações de viagem.`
    : `${r} reúne ${s.count} estâncias de esqui no nosso guia, até aos ${s.maxSummit} m no ponto mais alto. ${s.topName} alcança aqui a melhor pontuação de neve e ${s.biggestName} é a maior, com ${s.biggestKm} km de pistas. Compare-as todas em baixo, cada uma com hotéis à beira das pistas.`
  const it = single
    ? `${r} ha una località sciistica nella nostra guida, ${s.topName}, che arriva a ${s.maxSummit} m. Qui sotto trovi i suoi hotel sugli sci, l'innevamento e i link utili.`
    : `${r} riunisce ${s.count} località sciistiche nella nostra guida, fino a ${s.maxSummit} m nel punto più alto. ${s.topName} ottiene qui il punteggio neve più alto e ${s.biggestName} è la più estesa, con ${s.biggestKm} km di piste. Confrontale tutte qui sotto, ciascuna con i suoi hotel sugli sci.`
  return { en, fr, es, pt, it }[l]
}
