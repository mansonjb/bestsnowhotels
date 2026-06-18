import type { Locale } from '@/app/[locale]/dictionaries'
import { destinations } from './destinations'
import type { Destination } from './destinations'
import { isSouthernHemisphere } from './countries'

/**
 * Buckets resorts by their TYPICAL opening period. These are indicative
 * windows derived from our season data and recent seasons, NOT confirmed
 * official 2026-2027 dates: most resorts only publish exact dates in the
 * autumn. Every resort links to its official site for confirmation.
 *
 * Grouping is honest by design: it never claims a precise per-resort date,
 * only the realistic window the resort usually falls in.
 */

const MONTH: Record<string, number> = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
}
const startMonth = (d: Destination): number | null =>
  d.seasonStart === 'All year' ? null : MONTH[d.seasonStart.slice(0, 3)] ?? null

export type BucketId =
  | 'year-round'
  | 'autumn-glacier'
  | 'october'
  | 'november'
  | 'december'
  | 'spring-summer'
  | 'southern-hemisphere'

function bucketOf(d: Destination): BucketId {
  if (isSouthernHemisphere(d)) return 'southern-hemisphere'
  // Year-round: glacier-365 (Zermatt) or indoor (Ski Egypt, Jan 1 to Dec 31).
  if (d.seasonStart === 'All year') return 'year-round'
  if (d.vibes.includes('indoor') || (d.seasonStart === 'Jan 1' && d.seasonEnd === 'Dec 31'))
    return 'year-round'
  const m = startMonth(d)
  const glacier = d.vibes.includes('glacier') || d.vibes.includes('summer-ski')
  if (m == null) return 'december'
  // Spring/summer-only ski (e.g. Stryn, May to Aug).
  if (m >= 4 && m <= 8) return 'spring-summer'
  // Autumn glacier openers (Sep, plus glacier resorts opening in October).
  if (m === 9 || (m === 10 && glacier)) return 'autumn-glacier'
  if (m === 10) return 'october'
  if (m === 11) return 'november'
  return 'december' // Dec + Jan
}

export interface OpeningBucket {
  id: BucketId
  label: Record<Locale, string>
  blurb: Record<Locale, string>
  resorts: Destination[]
}

const META: Record<BucketId, { label: Record<Locale, string>; blurb: Record<Locale, string> }> = {
  'year-round': {
    label: {
      en: 'Open year-round', fr: "Ouvert toute l'année", es: 'Abierto todo el año',
      pt: 'Aberto todo o ano', it: "Aperto tutto l'anno",
    },
    blurb: {
      en: 'Glacier and indoor slopes that run in every month.',
      fr: 'Glaciers et pistes couvertes qui tournent tous les mois.',
      es: 'Glaciares y pistas cubiertas que funcionan todos los meses.',
      pt: 'Glaciares e pistas cobertas que funcionam todos os meses.',
      it: 'Ghiacciai e piste coperte aperti ogni mese.',
    },
  },
  'autumn-glacier': {
    label: {
      en: 'Autumn openers (glaciers)', fr: "Ouvertures d'automne (glaciers)", es: 'Aperturas de otoño (glaciares)',
      pt: 'Aberturas de outono (glaciares)', it: "Aperture d'autunno (ghiacciai)",
    },
    blurb: {
      en: 'High glacier sectors that usually spin up in September or October.',
      fr: 'Secteurs glaciaires hauts qui démarrent en général en septembre ou octobre.',
      es: 'Sectores glaciares altos que suelen arrancar en septiembre u octubre.',
      pt: 'Setores glaciares altos que costumam arrancar em setembro ou outubro.',
      it: 'Settori glaciali alti che di solito aprono a settembre o ottobre.',
    },
  },
  october: {
    label: {
      en: 'Typically open in October', fr: 'Ouvrent en général en octobre', es: 'Abren normalmente en octubre',
      pt: 'Abrem normalmente em outubro', it: 'Aprono di solito a ottobre',
    },
    blurb: {
      en: 'Early-season resorts, often the Nordic long-season fields and high-altitude names.',
      fr: 'Stations de début de saison, souvent les domaines nordiques à longue saison et les noms d\'altitude.',
      es: 'Estaciones de inicio de temporada, a menudo los dominios nórdicos de larga temporada y los nombres de altura.',
      pt: 'Estâncias de início de época, muitas vezes os domínios nórdicos de longa época e os nomes de altitude.',
      it: 'Località di inizio stagione, spesso i comprensori nordici a stagione lunga e i nomi d\'alta quota.',
    },
  },
  november: {
    label: {
      en: 'Typically open in November', fr: 'Ouvrent en général en novembre', es: 'Abren normalmente en noviembre',
      pt: 'Abrem normalmente em novembro', it: 'Aprono di solito a novembre',
    },
    blurb: {
      en: 'The big high-altitude Alpine and North American names that lead the season.',
      fr: 'Les grands noms alpins et nord-américains d\'altitude qui lancent la saison.',
      es: 'Los grandes nombres alpinos y norteamericanos de altura que abren la temporada.',
      pt: 'Os grandes nomes alpinos e norte-americanos de altitude que lançam a época.',
      it: 'I grandi nomi alpini e nordamericani d\'alta quota che aprono la stagione.',
    },
  },
  december: {
    label: {
      en: 'Typically open in December', fr: 'Ouvrent en général en décembre', es: 'Abren normalmente en diciembre',
      pt: 'Abrem normalmente em dezembro', it: 'Aprono di solito a dicembre',
    },
    blurb: {
      en: 'The bulk of resorts, aiming to be fully open for the Christmas holidays.',
      fr: 'Le gros des stations, qui visent une ouverture complète pour les fêtes de Noël.',
      es: 'La mayoría de las estaciones, que apuntan a abrir del todo para las fiestas de Navidad.',
      pt: 'A maioria das estâncias, que apontam a abrir por completo para as festas de Natal.',
      it: 'La maggior parte delle località, che puntano ad aprire del tutto per le feste di Natale.',
    },
  },
  'spring-summer': {
    label: {
      en: 'Spring and summer skiing', fr: 'Ski de printemps et d\'été', es: 'Esquí de primavera y verano',
      pt: 'Esqui de primavera e verão', it: 'Sci di primavera ed estate',
    },
    blurb: {
      en: 'Rare fields that ski the warm months on lingering high-altitude snow.',
      fr: 'Rares domaines qui skient les mois chauds sur une neige d\'altitude persistante.',
      es: 'Raros dominios que esquían los meses cálidos sobre nieve de altura persistente.',
      pt: 'Raros domínios que esquiam os meses quentes sobre neve de altitude persistente.',
      it: 'Rari comprensori che sciano nei mesi caldi su neve d\'alta quota persistente.',
    },
  },
  'southern-hemisphere': {
    label: {
      en: 'Southern Hemisphere (June to October)', fr: 'Hémisphère sud (juin à octobre)', es: 'Hemisferio sur (junio a octubre)',
      pt: 'Hemisfério sul (junho a outubro)', it: 'Emisfero sud (da giugno a ottobre)',
    },
    blurb: {
      en: 'Australia, New Zealand, Chile, Lesotho and South Africa, in season while the Alps sleep.',
      fr: 'Australie, Nouvelle-Zélande, Chili, Lesotho et Afrique du Sud, en saison quand les Alpes dorment.',
      es: 'Australia, Nueva Zelanda, Chile, Lesoto y Sudáfrica, en temporada mientras los Alpes duermen.',
      pt: 'Austrália, Nova Zelândia, Chile, Lesoto e África do Sul, em época enquanto os Alpes dormem.',
      it: 'Australia, Nuova Zelanda, Cile, Lesotho e Sudafrica, in stagione mentre le Alpi dormono.',
    },
  },
}

const ORDER: BucketId[] = [
  'year-round', 'autumn-glacier', 'october', 'november', 'december', 'spring-summer', 'southern-hemisphere',
]

/** Group all destinations into ordered opening-period buckets (non-empty only). */
export function openingBuckets(): OpeningBucket[] {
  const map = new Map<BucketId, Destination[]>()
  for (const d of destinations) {
    const b = bucketOf(d)
    const list = map.get(b) ?? []
    list.push(d)
    map.set(b, list)
  }
  return ORDER.filter((id) => (map.get(id)?.length ?? 0) > 0).map((id) => ({
    id,
    label: META[id].label,
    blurb: META[id].blurb,
    // Sort within a bucket: snowiest first, a useful default.
    resorts: (map.get(id) ?? []).sort((a, b) => b.snowScore - a.snowScore),
  }))
}
