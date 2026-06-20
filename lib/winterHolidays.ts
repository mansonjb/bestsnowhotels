import type { Locale } from '@/app/[locale]/dictionaries'
import type { Destination } from './destinations'
import { getDestination } from './destinations'
import { SKI_AREAS, getSkiArea } from './skiAreas'
import type { SkiArea } from './skiAreas'
import { formatSeasonDate } from './dates'

/**
 * "Why ski [domain] for the 2027 winter holidays" content, generated from each
 * ski area's real figures and its member resorts. The 2027 framing is just the
 * season hook: every concrete claim (size, lifts, top altitude, season window,
 * which resorts to base in) comes from our own data, with no invented prices,
 * events or confirmed dates. Pure function of the ski area.
 */

const SEASON_YEAR = 2027

export interface Reason {
  title: string
  body: string
}

const MONTH_IDX: Record<string, number> = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
}
const CUM = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
function dayOfYear(s: string): number | null {
  const m = s.match(/^([A-Za-z]{3})\s+(\d{1,2})$/)
  if (!m || !MONTH_IDX[m[1]]) return null
  return CUM[MONTH_IDX[m[1]] - 1] + parseInt(m[2], 10)
}

export function getWinterAreas(): SkiArea[] {
  return [...SKI_AREAS].sort((a, b) => b.pistesKm - a.pistesKm)
}
export const isWinterArea = (slug: string): boolean => SKI_AREAS.some((a) => a.slug === slug)
export function getWinterArea(slug: string): SkiArea | undefined {
  return getSkiArea(slug)
}

export function winterMembers(area: SkiArea): Destination[] {
  return area.members
    .map((m) => getDestination(m))
    .filter((d): d is Destination => Boolean(d))
    .sort((a, b) => b.snowScore - a.snowScore)
}

/** Indicative domain season window: earliest member opening to latest closing. */
function seasonWindow(members: Destination[]): { start: string; end: string } | null {
  let bestStart: { s: string; d: number } | null = null
  let bestEnd: { s: string; d: number } | null = null
  for (const m of members) {
    if (m.seasonStart === 'All year' || m.seasonEnd === 'All year') continue
    const ds = dayOfYear(m.seasonStart)
    const de = dayOfYear(m.seasonEnd)
    // Treat autumn openings (Sep to Dec, day >= 244) as "early" relative to the winter.
    if (ds != null) {
      const norm = ds >= 244 ? ds - 365 : ds
      if (!bestStart || norm < bestStart.d) bestStart = { s: m.seasonStart, d: norm }
    }
    if (de != null && de <= 200) {
      if (!bestEnd || de > bestEnd.d) bestEnd = { s: m.seasonEnd, d: de }
    }
  }
  if (!bestStart || !bestEnd) return null
  return { start: bestStart.s, end: bestEnd.s }
}

const NOUN = {
  resorts: { en: 'resorts', fr: 'stations', es: 'estaciones', pt: 'estâncias', it: 'località' },
} as const

function joinNames(names: string[], locale: Locale): string {
  const and = { en: 'and', fr: 'et', es: 'y', pt: 'e', it: 'e' }[locale]
  if (names.length <= 1) return names.join('')
  return `${names.slice(0, -1).join(', ')} ${and} ${names[names.length - 1]}`
}

export function winterTitle(area: SkiArea, locale: Locale): string {
  const t: Record<Locale, string> = {
    en: `Why ski ${area.name} for the ${SEASON_YEAR} winter holidays`,
    fr: `Pourquoi partir à ${area.name} pour les vacances d'hiver ${SEASON_YEAR}`,
    es: `Por qué esquiar en ${area.name} en las vacaciones de invierno ${SEASON_YEAR}`,
    pt: `Porque esquiar em ${area.name} nas férias de inverno de ${SEASON_YEAR}`,
    it: `Perché sciare a ${area.name} per le vacanze invernali ${SEASON_YEAR}`,
  }
  return t[locale]
}

export function winterReasons(area: SkiArea, locale: Locale): Reason[] {
  const members = winterMembers(area)
  const n = members.length
  const km = area.pistesKm
  const lifts = area.lifts
  const top = area.topAltitude
  const out: Reason[] = []

  // R1: one pass, size
  const r1t = { en: 'One pass, one huge playground', fr: 'Un forfait, un immense terrain de jeu', es: 'Un forfait, un enorme parque de juego', pt: 'Um passe, um enorme parque de jogo', it: 'Uno skipass, un enorme parco giochi' }[locale]
  const r1b: Record<Locale, string> = {
    en: `${area.name} links ${n} ${NOUN.resorts.en} on a single lift pass: ${km} km of piste and ${lifts} lifts, enough that a week of the ${SEASON_YEAR} holidays never skis the same run twice.`,
    fr: `${area.name} relie ${n} ${NOUN.resorts.fr} sur un seul forfait : ${km} km de pistes et ${lifts} remontées, de quoi ne jamais refaire deux fois la même piste sur une semaine de vacances ${SEASON_YEAR}.`,
    es: `${area.name} conecta ${n} ${NOUN.resorts.es} con un solo forfait: ${km} km de pistas y ${lifts} remontes, suficiente para que una semana de vacaciones ${SEASON_YEAR} no repita pista.`,
    pt: `${area.name} liga ${n} ${NOUN.resorts.pt} num único passe: ${km} km de pistas e ${lifts} teleféricos, o suficiente para que uma semana de férias de ${SEASON_YEAR} nunca repita a mesma pista.`,
    it: `${area.name} collega ${n} ${NOUN.resorts.it} con un solo skipass: ${km} km di piste e ${lifts} impianti, abbastanza perché una settimana di vacanze ${SEASON_YEAR} non ripeta mai la stessa pista.`,
  }
  out.push({ title: r1t, body: r1b[locale] })

  // R2: snow / altitude band
  const band: 'high' | 'mid' | 'low' = top >= 2800 ? 'high' : top >= 2000 ? 'mid' : 'low'
  const r2t = { en: 'Snow you can plan a holiday around', fr: 'Une neige sur laquelle planifier ses vacances', es: 'Nieve sobre la que planificar las vacaciones', pt: 'Neve para planear as férias', it: 'Neve su cui pianificare le vacanze' }[locale]
  const r2: Record<typeof band, Record<Locale, string>> = {
    high: {
      en: `The domain climbs to ${top} m, so snow holds reliably right through the Christmas and February holiday weeks of winter ${SEASON_YEAR}.`,
      fr: `Le domaine grimpe à ${top} m : l'enneigement tient de façon fiable jusque dans les semaines de Noël et de février de l'hiver ${SEASON_YEAR}.`,
      es: `El dominio sube hasta ${top} m, así que la nieve aguanta de forma fiable durante las semanas de Navidad y febrero del invierno ${SEASON_YEAR}.`,
      pt: `O domínio sobe até ${top} m, por isso a neve aguenta de forma fiável durante as semanas de Natal e de fevereiro do inverno de ${SEASON_YEAR}.`,
      it: `Il comprensorio sale fino a ${top} m, quindi la neve tiene in modo affidabile per tutte le settimane di Natale e febbraio dell'inverno ${SEASON_YEAR}.`,
    },
    mid: {
      en: `Topping out at ${top} m and backed by serious snowmaking, the cover holds well across a normal winter ${SEASON_YEAR}.`,
      fr: `Culminant à ${top} m et épaulé par une solide neige de culture, l'enneigement tient bien sur un hiver ${SEASON_YEAR} normal.`,
      es: `Con cima a ${top} m y respaldado por una sólida nieve de cultivo, la cobertura aguanta bien en un invierno ${SEASON_YEAR} normal.`,
      pt: `Com topo a ${top} m e apoiado por forte neve artificial, a cobertura aguenta bem num inverno ${SEASON_YEAR} normal.`,
      it: `Con la cima a ${top} m e una solida neve programmata, l'innevamento tiene bene in un inverno ${SEASON_YEAR} normale.`,
    },
    low: {
      en: `At ${top} m up top this is a lower domain, so check the live snow report when you fix your winter ${SEASON_YEAR} dates and keep them flexible.`,
      fr: `À ${top} m au sommet, c'est un domaine de plus basse altitude : vérifiez le bulletin neige en direct pour caler vos dates d'hiver ${SEASON_YEAR} et gardez de la souplesse.`,
      es: `Con ${top} m arriba es un dominio de menor altitud: consulta el parte de nieve en directo al fijar tus fechas de invierno ${SEASON_YEAR} y mantén flexibilidad.`,
      pt: `Com ${top} m no topo é um domínio de menor altitude: consulte o boletim de neve em direto ao marcar as suas datas de inverno ${SEASON_YEAR} e mantenha flexibilidade.`,
      it: `Con ${top} m in cima è un comprensorio di quota più bassa: controlla il bollettino neve in tempo reale quando fissi le date d'inverno ${SEASON_YEAR} e tienile flessibili.`,
    },
  }
  out.push({ title: r2t, body: r2[band][locale] })

  // R3: where to base
  const bases = members.slice(0, 3).map((m) => m.name)
  if (bases.length) {
    const r3t = { en: 'Choose your base', fr: 'Choisissez votre camp de base', es: 'Elige tu base', pt: 'Escolha a sua base', it: 'Scegli la tua base' }[locale]
    const list = joinNames(bases, locale)
    const r3b: Record<Locale, string> = {
      en: `Base yourself in ${list}: each opens onto the same linked terrain on one pass, so you pick the village that fits your group and still ski the whole domain.`,
      fr: `Posez vos valises à ${list} : chacune ouvre sur le même domaine relié avec un seul forfait, vous choisissez le village qui colle à votre groupe tout en skiant l'ensemble.`,
      es: `Alójate en ${list}: cada una da al mismo terreno enlazado con un forfait, así eliges el pueblo que encaja con tu grupo y esquías todo el dominio.`,
      pt: `Fique em ${list}: cada uma abre para o mesmo terreno ligado com um passe, por isso escolhe a aldeia que encaixa no seu grupo e esquia o domínio inteiro.`,
      it: `Sistematevi a ${list}: ognuna si apre sullo stesso terreno collegato con un solo skipass, così scegliete il paese giusto per il vostro gruppo e sciate tutto il comprensorio.`,
    }
    out.push({ title: r3t, body: r3b[locale] })
  }

  // R4: when to go (indicative season window)
  const win = seasonWindow(members)
  const r4t = { en: `When to go in ${SEASON_YEAR}`, fr: `Quand y aller en ${SEASON_YEAR}`, es: `Cuándo ir en ${SEASON_YEAR}`, pt: `Quando ir em ${SEASON_YEAR}`, it: `Quando andare nel ${SEASON_YEAR}` }[locale]
  let r4b: string
  if (win) {
    const start = formatSeasonDate(win.start, locale)
    // Strip a trailing abbreviation period (e.g. "21 avr.") so it does not double
    // the sentence-ending period; the single period then serves as both.
    const end = formatSeasonDate(win.end, locale).replace(/\.$/, '')
    const t: Record<Locale, string> = {
      en: `Lifts typically turn from ${start} to ${end}. The Christmas and February school-holiday weeks are the lively peaks; for the same snow with thinner crowds, mid-January and mid-March are the smart ${SEASON_YEAR} windows.`,
      fr: `Les remontées tournent en général de ${start} à ${end}. Les semaines de Noël et de février sont les pics animés ; pour la même neige avec moins de monde, mi-janvier et mi-mars sont les fenêtres malines de ${SEASON_YEAR}.`,
      es: `Los remontes funcionan normalmente de ${start} a ${end}. Las semanas de Navidad y febrero son los picos animados; para la misma nieve con menos gente, mediados de enero y mediados de marzo son las ventanas inteligentes de ${SEASON_YEAR}.`,
      pt: `Os teleféricos funcionam normalmente de ${start} a ${end}. As semanas de Natal e de fevereiro são os picos animados; para a mesma neve com menos gente, meados de janeiro e meados de março são as janelas espertas de ${SEASON_YEAR}.`,
      it: `Gli impianti girano di solito da ${start} a ${end}. Le settimane di Natale e febbraio sono i picchi vivaci; per la stessa neve con meno folla, metà gennaio e metà marzo sono le finestre furbe del ${SEASON_YEAR}.`,
    }
    r4b = t[locale]
  } else {
    const t: Record<Locale, string> = {
      en: `Plan around the deep-winter window: the Christmas and February holiday weeks are busiest, while mid-January and mid-March give reliable snow with fewer crowds in ${SEASON_YEAR}.`,
      fr: `Visez le coeur de l'hiver : les semaines de Noël et de février sont les plus chargées, tandis que mi-janvier et mi-mars offrent une neige fiable avec moins de monde en ${SEASON_YEAR}.`,
      es: `Apunta al pleno invierno: las semanas de Navidad y febrero son las más concurridas, mientras que mediados de enero y mediados de marzo dan nieve fiable con menos gente en ${SEASON_YEAR}.`,
      pt: `Aponte para o pleno inverno: as semanas de Natal e de fevereiro são as mais cheias, enquanto meados de janeiro e meados de março dão neve fiável com menos gente em ${SEASON_YEAR}.`,
      it: `Punta al pieno inverno: le settimane di Natale e febbraio sono le più affollate, mentre metà gennaio e metà marzo offrono neve affidabile con meno folla nel ${SEASON_YEAR}.`,
    }
    r4b = t[locale]
  }
  out.push({ title: r4t, body: r4b })

  return out
}
