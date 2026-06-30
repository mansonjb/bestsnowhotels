import Link from 'next/link'
import type { ReactNode } from 'react'
import { destinations, type Destination } from './destinations'
import { localizeRegion } from './regions'
import { localizeCountry } from './countryNames'
import { countrySlug } from './countries'
import { getSioCountry } from './skiInSkiOut'
import { getSkiAreaForResort } from './skiAreas'
import { regionSlug } from './regionPages'
import type { Locale } from '@/app/[locale]/dictionaries'

/**
 * Turns a plain editorial paragraph into React nodes where the first mention of
 * another resort, the region, the country, the ski area or a key concept becomes
 * an internal link. This is the in-text half of the maillage: the prose itself
 * sends readers (and crawlers) deeper into the cocoon.
 *
 * Rules that keep it clean and safe:
 *  - resort / region / country / ski-area names match case-sensitively (they are
 *    proper nouns, always capitalised in copy) so a lowercase common word never
 *    gets linked by accident;
 *  - only the FIRST occurrence of each term is linked, and the whole paragraph is
 *    capped, so the text never turns blue;
 *  - links never nest (we only ever split plain string segments).
 */

const LINK_CLASS =
  'font-medium text-ice-700 underline decoration-ice-300 underline-offset-2 hover:text-alpenglow-600 hover:decoration-alpenglow-400 transition-colors'

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

interface Candidate {
  term: string
  href: string
  /** case-insensitive (for concept words); proper nouns stay case-sensitive */
  ci?: boolean
}

// Concept words per locale -> a hub page. Distinctive, low false-positive terms
// only. Each maps to a page we know exists.
const CONCEPTS: Record<Locale, { terms: string[]; to: 'family' | 'luxury' | 'glacier' | 'beginner' | 'freestyle' | 'apres' | 'spa' | 'powder' }[]> = {
  en: [
    { terms: ['family-friendly', 'families', 'family'], to: 'family' },
    { terms: ['luxury'], to: 'luxury' },
    { terms: ['glacier'], to: 'glacier' },
    { terms: ['beginners', 'beginner'], to: 'beginner' },
    { terms: ['snowpark', 'freestyle'], to: 'freestyle' },
    { terms: ['apres-ski', 'apres ski'], to: 'apres' },
    { terms: ['spa', 'thermal', 'wellness'], to: 'spa' },
    { terms: ['powder'], to: 'powder' },
  ],
  fr: [
    { terms: ['familiale', 'familial', 'familles'], to: 'family' },
    { terms: ['luxe'], to: 'luxury' },
    { terms: ['glacier'], to: 'glacier' },
    { terms: ['debutants', 'debutant'], to: 'beginner' },
    { terms: ['snowpark', 'freestyle'], to: 'freestyle' },
    { terms: ['apres-ski'], to: 'apres' },
    { terms: ['thermes', 'thermal', 'bien-etre'], to: 'spa' },
    { terms: ['poudreuse'], to: 'powder' },
  ],
  es: [
    { terms: ['familiar', 'familias'], to: 'family' },
    { terms: ['lujo'], to: 'luxury' },
    { terms: ['glaciar'], to: 'glacier' },
    { terms: ['principiantes', 'principiante'], to: 'beginner' },
    { terms: ['snowpark', 'freestyle'], to: 'freestyle' },
    { terms: ['apres-ski'], to: 'apres' },
    { terms: ['termal', 'spa', 'bienestar'], to: 'spa' },
    { terms: ['nieve polvo', 'polvo'], to: 'powder' },
  ],
  pt: [
    { terms: ['familiar', 'familias'], to: 'family' },
    { terms: ['luxo'], to: 'luxury' },
    { terms: ['glaciar'], to: 'glacier' },
    { terms: ['principiantes', 'principiante'], to: 'beginner' },
    { terms: ['snowpark', 'freestyle'], to: 'freestyle' },
    { terms: ['apres-ski'], to: 'apres' },
    { terms: ['termal', 'spa', 'bem-estar'], to: 'spa' },
    { terms: ['neve fresca'], to: 'powder' },
  ],
  it: [
    { terms: ['familiare', 'famiglie'], to: 'family' },
    { terms: ['lusso'], to: 'luxury' },
    { terms: ['ghiacciaio'], to: 'glacier' },
    { terms: ['principianti', 'principiante'], to: 'beginner' },
    { terms: ['snowpark', 'freestyle'], to: 'freestyle' },
    { terms: ['apres-ski'], to: 'apres' },
    { terms: ['terme', 'termale', 'benessere'], to: 'spa' },
    { terms: ['neve fresca'], to: 'powder' },
  ],
}

function conceptHref(to: string, l: Locale): string {
  switch (to) {
    case 'apres':
      return `/${l}/best/apres-ski`
    case 'spa':
      return `/${l}/ski-guides/ski-spa-resorts`
    case 'powder':
      return `/${l}/weather/fresh-powder`
    default:
      return `/${l}/best/${to}`
  }
}

function applyLinks(text: string, cands: Candidate[], max: number): ReactNode[] {
  let segs: ReactNode[] = [text]
  const usedHrefs = new Set<string>()
  let count = 0
  let key = 0
  for (const c of cands) {
    if (count >= max) break
    if (usedHrefs.has(c.href)) continue
    let re: RegExp
    try {
      re = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(c.term)}(?![\\p{L}\\p{N}])`, c.ci ? 'iu' : 'u')
    } catch {
      continue
    }
    for (let i = 0; i < segs.length; i++) {
      const seg = segs[i]
      if (typeof seg !== 'string') continue
      const m = re.exec(seg)
      if (!m || m.index == null) continue
      const before = seg.slice(0, m.index)
      const matched = m[0]
      const after = seg.slice(m.index + matched.length)
      const node = (
        <Link key={`tl-${key++}`} href={c.href} className={LINK_CLASS}>
          {matched}
        </Link>
      )
      segs.splice(i, 1, before, node, after)
      usedHrefs.add(c.href)
      count++
      break
    }
  }
  return segs.filter((s) => s !== '')
}

export function linkifyProse(text: string, d: Destination, l: Locale, max = 6): ReactNode[] {
  const cands: Candidate[] = []

  // 1. Other resorts named in the copy (proper nouns, longest first).
  const mentioned = destinations
    .filter((o) => o.slug !== d.slug && o.name.length >= 4 && text.includes(o.name))
    .sort((a, b) => b.name.length - a.name.length)
  for (const o of mentioned.slice(0, 4)) {
    cands.push({ term: o.name, href: `/${l}/destinations/${o.slug}` })
  }

  // 2. The ski area, if its name appears.
  const area = getSkiAreaForResort(d.slug)
  if (area && text.includes(area.name)) {
    cands.push({ term: area.name, href: `/${l}/ski-areas/${area.slug}` })
  }

  // 3. Region and 4. country (localised names).
  cands.push({ term: localizeRegion(d.region, l), href: `/${l}/regions/${regionSlug(d.region)}` })
  cands.push({ term: localizeCountry(d.country, l), href: `/${l}/countries/${countrySlug(d.country)}` })

  // 5. Concept words -> their hub.
  const cSlug = countrySlug(d.country)
  const hasSio = !!getSioCountry(cSlug)
  for (const c of CONCEPTS[l]) {
    for (const term of c.terms) {
      cands.push({ term, href: conceptHref(c.to, l), ci: true })
    }
  }
  // ski-in/ski-out phrase -> the country SIO page (or generic index).
  const sioPhrase: Record<Locale, string[]> = {
    en: ['ski-in/ski-out', 'ski-in ski-out'],
    fr: ['ski au pied'],
    es: ['a pie de pista', 'a pie de pistas'],
    pt: ['a beira das pistas', 'pe nas pistas'],
    it: ['sugli sci', 'ai piedi delle piste'],
  }
  for (const p of sioPhrase[l]) {
    cands.push({ term: p, href: hasSio ? `/${l}/ski-in-ski-out/${cSlug}` : `/${l}/ski-in-ski-out`, ci: true })
  }

  return applyLinks(text, cands, max)
}
