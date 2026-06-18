import type { Locale } from '@/app/[locale]/dictionaries'
import type { Destination } from './destinations'

/**
 * Data-driven "good to know" prose, generated from each resort's real numbers.
 * The wording varies by threshold (terrain profile, snow reliability, size,
 * season length) so every page reads differently, not just with swapped
 * numbers. Returns 4 localised sentences. Pure function of the destination.
 */

const MONTH_NUM: Record<string, number> = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
}

/** Approximate day-of-year for "Mon DD"; used only to estimate season length. */
function dayOfYear(s: string): number | null {
  const m = s.match(/^([A-Za-z]{3})\s+(\d{1,2})$/)
  if (!m) return null
  const month = MONTH_NUM[m[1]]
  if (!month) return null
  const cumulative = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
  return cumulative[month - 1] + parseInt(m[2], 10)
}

function seasonWeeks(d: Destination): number | null {
  if (d.seasonStart === 'All year' || d.seasonEnd === 'All year') return null
  const start = dayOfYear(d.seasonStart)
  const end = dayOfYear(d.seasonEnd)
  if (start == null || end == null) return null
  const days = end >= start ? end - start : 365 - start + end
  return Math.max(1, Math.round(days / 7))
}

type Profile = 'beginner' | 'balanced' | 'expert'
function terrainProfile(d: Destination): Profile {
  const c = d.pisteCounts
  const total = c.green + c.blue + c.red + c.black
  if (total === 0) return 'balanced'
  const expertShare = c.black / total
  const beginnerShare = (c.green + c.blue) / total
  if (expertShare >= 0.38) return 'expert'
  if (beginnerShare >= 0.62) return 'beginner'
  return 'balanced'
}

type Snow = 'elite' | 'reliable' | 'decent' | 'low'
function snowBand(d: Destination): Snow {
  if (d.snowScore >= 90) return 'elite'
  if (d.snowScore >= 80) return 'reliable'
  if (d.snowScore >= 65) return 'decent'
  return 'low'
}

type Size = 'huge' | 'big' | 'mid' | 'compact'
function sizeBand(d: Destination): Size {
  if (d.pistesKm >= 250) return 'huge'
  if (d.pistesKm >= 120) return 'big'
  if (d.pistesKm >= 50) return 'mid'
  return 'compact'
}

/* Localised fragment tables. Each sentence template is a function of the
 * resort so we can interpolate numbers and pick the right categorical clause. */

const TERRAIN: Record<Profile, Record<Locale, (d: Destination) => string>> = {
  beginner: {
    en: (d) => `The piste map leans gentle: ${d.pisteCounts.green} green and ${d.pisteCounts.blue} blue runs against ${d.pisteCounts.red} red and ${d.pisteCounts.black} black, so beginners and early intermediates rarely run out of comfortable terrain.`,
    fr: (d) => `Le plan des pistes penche vers la douceur : ${d.pisteCounts.green} vertes et ${d.pisteCounts.blue} bleues face à ${d.pisteCounts.red} rouges et ${d.pisteCounts.black} noires. Débutants et premiers intermédiaires y trouvent toujours du terrain à leur main.`,
    es: (d) => `El mapa de pistas tira hacia lo suave: ${d.pisteCounts.green} verdes y ${d.pisteCounts.blue} azules frente a ${d.pisteCounts.red} rojas y ${d.pisteCounts.black} negras. Principiantes e intermedios iniciales rara vez se quedan sin terreno cómodo.`,
    pt: (d) => `O mapa de pistas pende para o suave: ${d.pisteCounts.green} verdes e ${d.pisteCounts.blue} azuis contra ${d.pisteCounts.red} vermelhas e ${d.pisteCounts.black} pretas. Principiantes e intermédios iniciais raramente ficam sem terreno confortável.`,
    it: (d) => `La mappa delle piste pende verso il facile: ${d.pisteCounts.green} verdi e ${d.pisteCounts.blue} blu contro ${d.pisteCounts.red} rosse e ${d.pisteCounts.black} nere. Principianti e primi intermedi non restano mai senza terreno comodo.`,
  },
  balanced: {
    en: (d) => `The terrain is well balanced: ${d.pisteCounts.green} green, ${d.pisteCounts.blue} blue, ${d.pisteCounts.red} red and ${d.pisteCounts.black} black runs, which suits a mixed group skiing together at different levels.`,
    fr: (d) => `Le terrain est bien équilibré : ${d.pisteCounts.green} vertes, ${d.pisteCounts.blue} bleues, ${d.pisteCounts.red} rouges et ${d.pisteCounts.black} noires. De quoi faire skier ensemble un groupe de niveaux variés.`,
    es: (d) => `El terreno está bien equilibrado: ${d.pisteCounts.green} verdes, ${d.pisteCounts.blue} azules, ${d.pisteCounts.red} rojas y ${d.pisteCounts.black} negras. Ideal para un grupo de niveles distintos que esquía junto.`,
    pt: (d) => `O terreno está bem equilibrado: ${d.pisteCounts.green} verdes, ${d.pisteCounts.blue} azuis, ${d.pisteCounts.red} vermelhas e ${d.pisteCounts.black} pretas. Perfeito para um grupo de níveis diferentes que esquia em conjunto.`,
    it: (d) => `Il terreno è ben bilanciato: ${d.pisteCounts.green} verdi, ${d.pisteCounts.blue} blu, ${d.pisteCounts.red} rosse e ${d.pisteCounts.black} nere. Ideale per un gruppo di livelli diversi che scia insieme.`,
  },
  expert: {
    en: (d) => `This is an expert-leaning mountain: ${d.pisteCounts.black} black runs alongside ${d.pisteCounts.red} red, with ${d.pisteCounts.green} green and ${d.pisteCounts.blue} blue for warming up. Strong skiers will find plenty to bite into.`,
    fr: (d) => `La montagne penche vers les bons skieurs : ${d.pisteCounts.black} noires épaulées de ${d.pisteCounts.red} rouges, avec ${d.pisteCounts.green} vertes et ${d.pisteCounts.blue} bleues pour s'échauffer. Les skieurs confirmés y trouvent largement de quoi faire.`,
    es: (d) => `Es una montaña orientada a expertos: ${d.pisteCounts.black} negras junto a ${d.pisteCounts.red} rojas, con ${d.pisteCounts.green} verdes y ${d.pisteCounts.blue} azules para calentar. Los esquiadores fuertes tienen mucho donde morder.`,
    pt: (d) => `É uma montanha virada para experts: ${d.pisteCounts.black} pretas ao lado de ${d.pisteCounts.red} vermelhas, com ${d.pisteCounts.green} verdes e ${d.pisteCounts.blue} azuis para aquecer. Os esquiadores fortes têm muito por onde atacar.`,
    it: (d) => `È una montagna orientata agli esperti: ${d.pisteCounts.black} nere accanto a ${d.pisteCounts.red} rosse, con ${d.pisteCounts.green} verdi e ${d.pisteCounts.blue} blu per scaldarsi. Gli sciatori forti hanno parecchio da mordere.`,
  },
}

const SNOW: Record<Snow, Record<Locale, (d: Destination) => string>> = {
  elite: {
    en: (d) => `With a base at ${d.altitudeBase.toLocaleString()} m climbing to ${d.altitudeSummit.toLocaleString()} m, snow reliability is among the best on our index (score ${d.snowScore}/100).`,
    fr: (d) => `Avec une base à ${d.altitudeBase.toLocaleString()} m qui grimpe jusqu'à ${d.altitudeSummit.toLocaleString()} m, la fiabilité de l'enneigement compte parmi les meilleures de notre index (score ${d.snowScore}/100).`,
    es: (d) => `Con una base a ${d.altitudeBase.toLocaleString()} m que sube hasta ${d.altitudeSummit.toLocaleString()} m, la fiabilidad de la nieve está entre las mejores de nuestro índice (puntuación ${d.snowScore}/100).`,
    pt: (d) => `Com uma base a ${d.altitudeBase.toLocaleString()} m que sobe até ${d.altitudeSummit.toLocaleString()} m, a fiabilidade da neve está entre as melhores do nosso índice (pontuação ${d.snowScore}/100).`,
    it: (d) => `Con una base a ${d.altitudeBase.toLocaleString()} m che sale fino a ${d.altitudeSummit.toLocaleString()} m, l'affidabilità della neve è tra le migliori del nostro indice (punteggio ${d.snowScore}/100).`,
  },
  reliable: {
    en: (d) => `The base sits at ${d.altitudeBase.toLocaleString()} m and the top reaches ${d.altitudeSummit.toLocaleString()} m, a profile that holds snow well across a normal winter (score ${d.snowScore}/100).`,
    fr: (d) => `La base est à ${d.altitudeBase.toLocaleString()} m et le sommet atteint ${d.altitudeSummit.toLocaleString()} m, un profil qui tient bien la neige sur un hiver normal (score ${d.snowScore}/100).`,
    es: (d) => `La base está a ${d.altitudeBase.toLocaleString()} m y la cima llega a ${d.altitudeSummit.toLocaleString()} m, un perfil que aguanta bien la nieve en un invierno normal (puntuación ${d.snowScore}/100).`,
    pt: (d) => `A base fica a ${d.altitudeBase.toLocaleString()} m e o topo chega a ${d.altitudeSummit.toLocaleString()} m, um perfil que segura bem a neve num inverno normal (pontuação ${d.snowScore}/100).`,
    it: (d) => `La base è a ${d.altitudeBase.toLocaleString()} m e la cima raggiunge ${d.altitudeSummit.toLocaleString()} m, un profilo che tiene bene la neve in un inverno normale (punteggio ${d.snowScore}/100).`,
  },
  decent: {
    en: (d) => `From ${d.altitudeBase.toLocaleString()} m at the base to ${d.altitudeSummit.toLocaleString()} m up top, the resort leans on grooming and snowmaking in lean spells (score ${d.snowScore}/100).`,
    fr: (d) => `De ${d.altitudeBase.toLocaleString()} m en bas à ${d.altitudeSummit.toLocaleString()} m en haut, la station s'appuie sur le damage et la neige de culture lors des passages maigres (score ${d.snowScore}/100).`,
    es: (d) => `De ${d.altitudeBase.toLocaleString()} m en la base a ${d.altitudeSummit.toLocaleString()} m arriba, la estación se apoya en el pisado y la nieve de cultivo en los tramos flojos (puntuación ${d.snowScore}/100).`,
    pt: (d) => `De ${d.altitudeBase.toLocaleString()} m na base a ${d.altitudeSummit.toLocaleString()} m no topo, a estância apoia-se no pisão e na neve artificial nos períodos fracos (pontuação ${d.snowScore}/100).`,
    it: (d) => `Da ${d.altitudeBase.toLocaleString()} m alla base a ${d.altitudeSummit.toLocaleString()} m in cima, la località si appoggia su battitura e neve programmata nei periodi magri (punteggio ${d.snowScore}/100).`,
  },
  low: {
    en: (d) => `At ${d.altitudeBase.toLocaleString()} m to ${d.altitudeSummit.toLocaleString()} m this is a lower-altitude resort, so check conditions before you book and lean on the live snow report (score ${d.snowScore}/100).`,
    fr: (d) => `Entre ${d.altitudeBase.toLocaleString()} m et ${d.altitudeSummit.toLocaleString()} m, c'est une station de plus basse altitude : vérifiez les conditions avant de réserver et fiez-vous au bulletin neige en direct (score ${d.snowScore}/100).`,
    es: (d) => `Entre ${d.altitudeBase.toLocaleString()} m y ${d.altitudeSummit.toLocaleString()} m es una estación de menor altitud: comprueba las condiciones antes de reservar y apóyate en el parte de nieve en directo (puntuación ${d.snowScore}/100).`,
    pt: (d) => `Entre ${d.altitudeBase.toLocaleString()} m e ${d.altitudeSummit.toLocaleString()} m é uma estância de menor altitude: verifique as condições antes de reservar e confie no boletim de neve em direto (pontuação ${d.snowScore}/100).`,
    it: (d) => `Tra ${d.altitudeBase.toLocaleString()} m e ${d.altitudeSummit.toLocaleString()} m è una località di quota più bassa: controlla le condizioni prima di prenotare e affidati al bollettino neve in tempo reale (punteggio ${d.snowScore}/100).`,
  },
}

const SIZE: Record<Size, Record<Locale, (d: Destination) => string>> = {
  huge: {
    en: (d) => `It is one of the bigger domains here, ${d.pistesKm} km of piste on ${d.lifts} lifts, enough to ski a different sector every day of a week.`,
    fr: (d) => `C'est l'un des grands domaines de notre sélection, ${d.pistesKm} km de pistes sur ${d.lifts} remontées, de quoi changer de secteur chaque jour de la semaine.`,
    es: (d) => `Es uno de los dominios grandes de nuestra selección, ${d.pistesKm} km de pistas en ${d.lifts} remontes, suficiente para esquiar un sector distinto cada día de la semana.`,
    pt: (d) => `É um dos grandes domínios da nossa seleção, ${d.pistesKm} km de pistas em ${d.lifts} teleféricos, suficiente para esquiar um setor diferente cada dia da semana.`,
    it: (d) => `È uno dei grandi comprensori della nostra selezione, ${d.pistesKm} km di piste su ${d.lifts} impianti, abbastanza per sciare un settore diverso ogni giorno della settimana.`,
  },
  big: {
    en: (d) => `At ${d.pistesKm} km of piste on ${d.lifts} lifts, it is a substantial mountain that earns a multi-day stay.`,
    fr: (d) => `Avec ${d.pistesKm} km de pistes sur ${d.lifts} remontées, c'est une montagne consistante qui mérite un séjour de plusieurs jours.`,
    es: (d) => `Con ${d.pistesKm} km de pistas en ${d.lifts} remontes, es una montaña de peso que justifica una estancia de varios días.`,
    pt: (d) => `Com ${d.pistesKm} km de pistas em ${d.lifts} teleféricos, é uma montanha consistente que justifica uma estadia de vários dias.`,
    it: (d) => `Con ${d.pistesKm} km di piste su ${d.lifts} impianti, è una montagna sostanziosa che merita un soggiorno di più giorni.`,
  },
  mid: {
    en: (d) => `With ${d.pistesKm} km of piste on ${d.lifts} lifts, it is a mid-size area, easy to get to know in a long weekend.`,
    fr: (d) => `Avec ${d.pistesKm} km de pistes sur ${d.lifts} remontées, c'est un domaine de taille moyenne, facile à apprivoiser sur un long week-end.`,
    es: (d) => `Con ${d.pistesKm} km de pistas en ${d.lifts} remontes, es un dominio de tamaño medio, fácil de conocer en un fin de semana largo.`,
    pt: (d) => `Com ${d.pistesKm} km de pistas em ${d.lifts} teleféricos, é um domínio de tamanho médio, fácil de conhecer num fim de semana prolongado.`,
    it: (d) => `Con ${d.pistesKm} km di piste su ${d.lifts} impianti, è un comprensorio di media taglia, facile da conoscere in un weekend lungo.`,
  },
  compact: {
    en: (d) => `It is a compact resort, ${d.pistesKm} km of piste on ${d.lifts} lifts, best as a day trip or a relaxed short break rather than a week-long base.`,
    fr: (d) => `C'est une petite station, ${d.pistesKm} km de pistes sur ${d.lifts} remontées, idéale pour une sortie à la journée ou un court séjour tranquille plutôt qu'une semaine entière.`,
    es: (d) => `Es una estación compacta, ${d.pistesKm} km de pistas en ${d.lifts} remontes, mejor para una salida de un día o una escapada corta que para una semana entera.`,
    pt: (d) => `É uma estância compacta, ${d.pistesKm} km de pistas em ${d.lifts} teleféricos, melhor para uma saída de um dia ou uma escapadela curta do que para uma semana inteira.`,
    it: (d) => `È una località compatta, ${d.pistesKm} km di piste su ${d.lifts} impianti, meglio per una gita in giornata o una breve fuga che per una settimana intera.`,
  },
}

function seasonSentence(d: Destination, locale: Locale): string | null {
  const weeks = seasonWeeks(d)
  if (weeks == null) {
    const yr: Record<Locale, string> = {
      en: `Snow lies year-round here, so it skis well outside the usual winter window too.`,
      fr: `La neige tient toute l'année ici, on peut donc skier même hors de la fenêtre hivernale habituelle.`,
      es: `Aquí la nieve aguanta todo el año, así que también se esquía fuera de la ventana invernal habitual.`,
      pt: `Aqui a neve mantém-se todo o ano, por isso esquia-se bem mesmo fora da janela de inverno habitual.`,
      it: `Qui la neve resiste tutto l'anno, quindi si scia bene anche fuori dalla solita finestra invernale.`,
    }
    return yr[locale]
  }
  const t: Record<Locale, string> = {
    en: `The lifts typically turn for about ${weeks} weeks a season, planning around late January to late February tends to land the most reliable cover.`,
    fr: `Les remontées tournent en général environ ${weeks} semaines par saison ; viser fin janvier à fin février donne souvent l'enneigement le plus fiable.`,
    es: `Los remontes suelen funcionar unas ${weeks} semanas por temporada; apuntar a finales de enero o febrero suele dar la nieve más fiable.`,
    pt: `Os teleféricos funcionam normalmente cerca de ${weeks} semanas por época; apontar para o fim de janeiro a fim de fevereiro costuma dar a neve mais fiável.`,
    it: `Gli impianti girano di solito per circa ${weeks} settimane a stagione; puntare tra fine gennaio e fine febbraio offre spesso l'innevamento più affidabile.`,
  }
  return t[locale]
}

/** Returns 4 localised "good to know" sentences, derived from the resort data. */
export function resortFacts(d: Destination, locale: Locale): string[] {
  const out = [
    TERRAIN[terrainProfile(d)][locale](d),
    SNOW[snowBand(d)][locale](d),
    SIZE[sizeBand(d)][locale](d),
  ]
  const season = seasonSentence(d, locale)
  if (season) out.push(season)
  return out
}
