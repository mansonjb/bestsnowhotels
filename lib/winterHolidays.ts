import type { Locale } from '@/app/[locale]/dictionaries'
import type { Destination } from './destinations'
import { getDestination } from './destinations'
import { SKI_AREAS, getSkiArea } from './skiAreas'
import type { SkiArea } from './skiAreas'
import { formatSeasonDate } from './dates'
import { localizeCountry, inCountry } from './countryNames'

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
    en: `Why ski ${area.name} for the ${SEASON_YEAR} winter holidays?`,
    fr: `Pourquoi partir à ${area.name} pour les vacances d'hiver ${SEASON_YEAR} ?`,
    es: `¿Por qué esquiar en ${area.name} en las vacaciones de invierno ${SEASON_YEAR}?`,
    pt: `Porque esquiar em ${area.name} nas férias de inverno de ${SEASON_YEAR}?`,
    it: `Perché sciare a ${area.name} per le vacanze invernali ${SEASON_YEAR}?`,
  }
  return t[locale]
}

export interface WinterStats {
  km: number
  lifts: number
  topAlt: number
  resorts: number
  vertical: number
  mix: { green: number; blue: number; red: number; black: number }
  flagship: Destination | undefined
}

/** At-a-glance numbers for the domain, aggregated from its member resorts. */
export function winterStats(area: SkiArea): WinterStats {
  const members = winterMembers(area)
  const mix = { green: 0, blue: 0, red: 0, black: 0 }
  let minBase = Infinity
  for (const m of members) {
    mix.green += m.pisteCounts.green
    mix.blue += m.pisteCounts.blue
    mix.red += m.pisteCounts.red
    mix.black += m.pisteCounts.black
    if (m.altitudeBase < minBase) minBase = m.altitudeBase
  }
  const vertical = Number.isFinite(minBase) ? Math.max(0, area.topAltitude - minBase) : 0
  return {
    km: area.pistesKm,
    lifts: area.lifts,
    topAlt: area.topAltitude,
    resorts: members.length,
    vertical,
    mix,
    flagship: members[0],
  }
}

/** Data-backed FAQ for the domain (rendered visibly + as FAQPage JSON-LD). */
export function winterFaq(area: SkiArea, locale: Locale): Reason[] {
  const members = winterMembers(area)
  const n = members.length
  const out: Reason[] = []
  const top3 = members.slice(0, 3).map((m) => m.name)

  // Q1: resorts on one pass
  if (n > 0) {
    const q = { en: `How many resorts can you ski in ${area.name} on one pass?`, fr: `Combien de stations peut-on skier à ${area.name} avec un seul forfait ?`, es: `¿Cuántas estaciones se pueden esquiar en ${area.name} con un forfait?`, pt: `Quantas estâncias se podem esquiar em ${area.name} com um passe?`, it: `Quante località si possono sciare a ${area.name} con un solo skipass?` }[locale]
    const list = joinNames(top3, locale)
    const a: Record<Locale, string> = {
      en: `${n} linked resorts share the ${area.pass} pass, including ${list}, for ${area.pistesKm} km of piste in total.`,
      fr: `${n} stations reliées partagent le forfait ${area.pass}, dont ${list}, pour ${area.pistesKm} km de pistes au total.`,
      es: `${n} estaciones enlazadas comparten el forfait ${area.pass}, entre ellas ${list}, con ${area.pistesKm} km de pistas en total.`,
      pt: `${n} estâncias ligadas partilham o passe ${area.pass}, incluindo ${list}, num total de ${area.pistesKm} km de pistas.`,
      it: `${n} località collegate condividono lo skipass ${area.pass}, tra cui ${list}, per ${area.pistesKm} km di piste in totale.`,
    }
    out.push({ title: q, body: a[locale] })
  }

  // Q2: beginners / families
  const mix = { green: 0, blue: 0, red: 0, black: 0 }
  for (const m of members) { mix.green += m.pisteCounts.green; mix.blue += m.pisteCounts.blue; mix.red += m.pisteCounts.red; mix.black += m.pisteCounts.black }
  const tot = mix.green + mix.blue + mix.red + mix.black
  if (tot > 0) {
    const easy = Math.round(((mix.green + mix.blue) / tot) * 100)
    const tier: 'good' | 'ok' | 'less' = easy >= 50 ? 'good' : easy >= 35 ? 'ok' : 'less'
    const q = { en: `Is ${area.name} good for beginners and families?`, fr: `${area.name} est-elle adaptée aux débutants et aux familles ?`, es: `¿${area.name} es buena para principiantes y familias?`, pt: `${area.name} é boa para principiantes e famílias?`, it: `${area.name} è adatta a principianti e famiglie?` }[locale]
    const A: Record<typeof tier, Record<Locale, string>> = {
      good: {
        en: `Yes. Around ${easy}% of the domain's runs are green or blue, so beginners and families have plenty of gentle terrain on the same pass as stronger skiers.`,
        fr: `Oui. Environ ${easy}% des pistes du domaine sont vertes ou bleues, donc débutants et familles ont largement de quoi progresser, sur le même forfait que les bons skieurs.`,
        es: `Sí. Cerca del ${easy}% de las pistas del dominio son verdes o azules, así que principiantes y familias tienen terreno suave de sobra, en el mismo forfait que los esquiadores fuertes.`,
        pt: `Sim. Cerca de ${easy}% das pistas do domínio são verdes ou azuis, por isso principiantes e famílias têm terreno suave de sobra, no mesmo passe dos esquiadores fortes.`,
        it: `Sì. Circa il ${easy}% delle piste del comprensorio è verde o blu, quindi principianti e famiglie hanno terreno facile in abbondanza, sullo stesso skipass degli sciatori esperti.`,
      },
      ok: {
        en: `It works: about ${easy}% of the runs are green or blue to learn on, though the domain leans intermediate and above overall, so pick the gentler resorts to start.`,
        fr: `Cela convient : environ ${easy}% des pistes sont vertes ou bleues pour débuter, même si le domaine penche globalement vers l'intermédiaire et plus, donc visez les stations les plus douces au départ.`,
        es: `Funciona: cerca del ${easy}% de las pistas son verdes o azules para empezar, aunque el dominio tiende a intermedio y superior, así que elige las estaciones más suaves al principio.`,
        pt: `Funciona: cerca de ${easy}% das pistas são verdes ou azuis para começar, embora o domínio tenda para intermédio e acima, por isso escolha as estâncias mais suaves ao início.`,
        it: `Va bene: circa il ${easy}% delle piste è verde o blu per iniziare, anche se il comprensorio tende all'intermedio e oltre, quindi scegli le località più dolci all'inizio.`,
      },
      less: {
        en: `Less so: only about ${easy}% of the runs are green or blue, so the domain skews intermediate and expert and committed beginners should choose the resort and sector with care.`,
        fr: `Moins : seulement ${easy}% environ des pistes sont vertes ou bleues, le domaine penche vers l'intermédiaire et l'expert, donc les vrais débutants ont intérêt à bien choisir leur station et leur secteur.`,
        es: `Menos: solo cerca del ${easy}% de las pistas son verdes o azules, el dominio tiende a intermedio y experto, así que los principiantes deben elegir bien la estación y el sector.`,
        pt: `Menos: só cerca de ${easy}% das pistas são verdes ou azuis, o domínio tende a intermédio e experiente, por isso principiantes a sério devem escolher bem a estância e o setor.`,
        it: `Meno: solo circa il ${easy}% delle piste è verde o blu, il comprensorio tende all'intermedio ed esperto, quindi i principianti dovrebbero scegliere con cura località e settore.`,
      },
    }
    out.push({ title: q, body: A[tier][locale] })
  }

  // Q3: which countries
  const countries = [...new Set(members.map((m) => m.country))]
  if (countries.length) {
    const q = { en: `Which country is ${area.name} in?`, fr: `Dans quel pays se trouve ${area.name} ?`, es: `¿En qué país está ${area.name}?`, pt: `Em que país fica ${area.name}?`, it: `In quale paese si trova ${area.name}?` }[locale]
    const names = joinNames(countries.map((c) => localizeCountry(c, locale)), locale)
    const a: Record<Locale, string> = countries.length > 1
      ? {
          en: `${area.name} spans ${names}, all skiable on one pass.`,
          fr: `${area.name} s'étend sur ${names}, le tout skiable avec un seul forfait.`,
          es: `${area.name} se extiende por ${names}, todo esquiable con un forfait.`,
          pt: `${area.name} estende-se por ${names}, tudo esquiável com um passe.`,
          it: `${area.name} si estende su ${names}, tutto sciabile con un solo skipass.`,
        }
      : {
          en: `${area.name} is in ${names}.`,
          fr: `${area.name} se trouve ${inCountry(countries[0], locale)}.`,
          es: `${area.name} está en ${names}.`,
          pt: `${area.name} fica ${inCountry(countries[0], locale)}.`,
          it: `${area.name} si trova ${inCountry(countries[0], locale)}.`,
        }
    out.push({ title: q, body: a[locale] })
  }

  // Q4: season dates
  const win = seasonWindow(members)
  const q4 = { en: `When does the ${area.name} ski season run in ${SEASON_YEAR}?`, fr: `Quand a lieu la saison de ski à ${area.name} en ${SEASON_YEAR} ?`, es: `¿Cuándo es la temporada de esquí en ${area.name} en ${SEASON_YEAR}?`, pt: `Quando decorre a época de esqui em ${area.name} em ${SEASON_YEAR}?`, it: `Quando va la stagione sciistica a ${area.name} nel ${SEASON_YEAR}?` }[locale]
  if (win) {
    const start = formatSeasonDate(win.start, locale)
    const end = formatSeasonDate(win.end, locale).replace(/\.$/, '')
    const a: Record<Locale, string> = {
      en: `Indicatively from ${start} to ${end}. The Christmas and February school-holiday weeks are busiest; mid-January and mid-March give the same snow with fewer crowds.`,
      fr: `Indicativement de ${start} à ${end}. Les semaines de Noël et de février sont les plus chargées ; mi-janvier et mi-mars offrent la même neige avec moins de monde.`,
      es: `Indicativamente de ${start} a ${end}. Las semanas de Navidad y febrero son las más concurridas; mediados de enero y mediados de marzo dan la misma nieve con menos gente.`,
      pt: `Indicativamente de ${start} a ${end}. As semanas de Natal e de fevereiro são as mais cheias; meados de janeiro e meados de março dão a mesma neve com menos gente.`,
      it: `Indicativamente da ${start} a ${end}. Le settimane di Natale e febbraio sono le più affollate; metà gennaio e metà marzo offrono la stessa neve con meno folla.`,
    }
    out.push({ title: q4, body: a[locale] })
  }

  return out
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

  // R5: terrain for every level (aggregate piste mix across members)
  const mix = { green: 0, blue: 0, red: 0, black: 0 }
  for (const m of members) {
    mix.green += m.pisteCounts.green; mix.blue += m.pisteCounts.blue
    mix.red += m.pisteCounts.red; mix.black += m.pisteCounts.black
  }
  const mixTot = mix.green + mix.blue + mix.red + mix.black
  if (mixTot > 0) {
    const easy = Math.round(((mix.green + mix.blue) / mixTot) * 100)
    const red = Math.round((mix.red / mixTot) * 100)
    const black = Math.max(0, 100 - easy - red)
    const r5t = { en: 'Terrain for every level', fr: 'Du terrain pour tous les niveaux', es: 'Terreno para todos los niveles', pt: 'Terreno para todos os níveis', it: 'Terreno per ogni livello' }[locale]
    const r5b: Record<Locale, string> = {
      en: `Across the domain about ${easy}% of the runs are green or blue, ${red}% red and ${black}% black, so beginners, intermediates and experts share the same lift pass without anyone running out of terrain.`,
      fr: `Sur l'ensemble du domaine, environ ${easy}% des pistes sont vertes ou bleues, ${red}% rouges et ${black}% noires : débutants, intermédiaires et experts partagent le même forfait sans jamais manquer de terrain.`,
      es: `En todo el dominio cerca del ${easy}% de las pistas son verdes o azules, ${red}% rojas y ${black}% negras, así que principiantes, intermedios y expertos comparten el mismo forfait sin quedarse sin terreno.`,
      pt: `Em todo o domínio cerca de ${easy}% das pistas são verdes ou azuis, ${red}% vermelhas e ${black}% pretas, por isso principiantes, intermédios e experts partilham o mesmo passe sem ficar sem terreno.`,
      it: `Su tutto il comprensorio circa il ${easy}% delle piste è verde o blu, il ${red}% rosso e il ${black}% nero, quindi principianti, intermedi ed esperti condividono lo stesso skipass senza restare mai senza terreno.`,
    }
    out.push({ title: r5t, body: r5b[locale] })
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
