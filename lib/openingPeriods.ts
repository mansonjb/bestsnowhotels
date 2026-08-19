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
      ja: '通年営業',
      nl: "Het hele jaar open",
      'zh-hk': '全年開放',
    },
    blurb: {
      en: 'Glacier and indoor slopes that run in every month.',
      fr: 'Glaciers et pistes couvertes qui tournent tous les mois.',
      es: 'Glaciares y pistas cubiertas que funcionan todos los meses.',
      pt: 'Glaciares e pistas cobertas que funcionam todos os meses.',
      it: 'Ghiacciai e piste coperte aperti ogni mese.',
      ja: '氷河エリアと屋内ゲレンデは、一年を通じて滑走できる。',
      nl: 'Gletsjers en overdekte pistes die het hele jaar open zijn.',
      'zh-hk': '冰川及室內雪場全年每月均可滑雪。',
    },
  },
  'autumn-glacier': {
    label: {
      en: 'Autumn openers (glaciers)', fr: "Ouvertures d'automne (glaciers)", es: 'Aperturas de otoño (glaciares)',
      pt: 'Aberturas de outono (glaciares)', it: "Aperture d'autunno (ghiacciai)",
      ja: '秋のオープン(氷河エリア)',
      nl: "Herfstopeningen (gletsjers)",
      'zh-hk': '秋季開放（冰川）',
    },
    blurb: {
      en: 'High glacier sectors that usually spin up in September or October.',
      fr: 'Secteurs glaciaires hauts qui démarrent en général en septembre ou octobre.',
      es: 'Sectores glaciares altos que suelen arrancar en septiembre u octubre.',
      pt: 'Setores glaciares altos que costumam arrancar em setembro ou outubro.',
      it: 'Settori glaciali alti che di solito aprono a settembre o ottobre.',
      ja: '標高の高い氷河エリアは、通常9月か10月に滑走を開始する。',
      nl: 'Hooggelegen gletsjersectoren die meestal in september of oktober opengaan.',
      'zh-hk': '高海拔冰川雪場通常於9月或10月開放。',
    },
  },
  october: {
    label: {
      en: 'Typically open in October', fr: 'Ouvrent en général en octobre', es: 'Abren normalmente en octubre',
      pt: 'Abrem normalmente em outubro', it: 'Aprono di solito a ottobre',
      ja: '例年10月にオープン',
      nl: 'Meestal open in oktober',
      'zh-hk': '通常於10月開放',
    },
    blurb: {
      en: 'Early-season resorts, often the Nordic long-season fields and high-altitude names.',
      fr: 'Stations de début de saison, souvent les domaines nordiques à longue saison et les noms d\'altitude.',
      es: 'Estaciones de inicio de temporada, a menudo los dominios nórdicos de larga temporada y los nombres de altura.',
      pt: 'Estâncias de início de época, muitas vezes os domínios nórdicos de longa época e os nomes de altitude.',
      it: 'Località di inizio stagione, spesso i comprensori nordici a stagione lunga e i nomi d\'alta quota.',
      ja: '早期オープンのスキー場。北欧の長期シーズンのゲレンデや標高の高い名だたる山が多い。',
      nl: 'Vroege skigebieden, vaak de Noordse gebieden met een lang seizoen en de namen op grote hoogte.',
      'zh-hk': '雪季較早開放的滑雪勝地，多為北歐長雪季雪場及高海拔知名雪場。',
    },
  },
  november: {
    label: {
      en: 'Typically open in November', fr: 'Ouvrent en général en novembre', es: 'Abren normalmente en noviembre',
      pt: 'Abrem normalmente em novembro', it: 'Aprono di solito a novembre',
      ja: '例年11月にオープン',
      nl: 'Meestal open in november',
      'zh-hk': '通常於11月開放',
    },
    blurb: {
      en: 'The big high-altitude Alpine and North American names that lead the season.',
      fr: 'Les grands noms alpins et nord-américains d\'altitude qui lancent la saison.',
      es: 'Los grandes nombres alpinos y norteamericanos de altura que abren la temporada.',
      pt: 'Os grandes nomes alpinos e norte-americanos de altitude que lançam a época.',
      it: 'I grandi nomi alpini e nordamericani d\'alta quota che aprono la stagione.',
      ja: 'シーズンの先陣を切る、標高の高いアルプスと北米の大型スキー場。',
      nl: 'De grote namen uit de Alpen en Noord-Amerika op grote hoogte die het seizoen openen.',
      'zh-hk': '率先展開雪季的阿爾卑斯山及北美高海拔知名雪場。',
    },
  },
  december: {
    label: {
      en: 'Typically open in December', fr: 'Ouvrent en général en décembre', es: 'Abren normalmente en diciembre',
      pt: 'Abrem normalmente em dezembro', it: 'Aprono di solito a dicembre',
      ja: '例年12月にオープン',
      nl: 'Meestal open in december',
      'zh-hk': '通常於12月開放',
    },
    blurb: {
      en: 'The bulk of resorts, aiming to be fully open for the Christmas holidays.',
      fr: 'Le gros des stations, qui visent une ouverture complète pour les fêtes de Noël.',
      es: 'La mayoría de las estaciones, que apuntan a abrir del todo para las fiestas de Navidad.',
      pt: 'A maioria das estâncias, que apontam a abrir por completo para as festas de Natal.',
      it: 'La maggior parte delle località, che puntano ad aprire del tutto per le feste di Natale.',
      ja: '大半のスキー場が対象で、クリスマス休暇までの全面オープンを目指す。',
      nl: 'Het merendeel van de skigebieden, met als doel volledig open te zijn voor de kerstvakantie.',
      'zh-hk': '大部分滑雪勝地均以聖誕假期全面開放為目標。',
    },
  },
  'spring-summer': {
    label: {
      en: 'Spring and summer skiing', fr: 'Ski de printemps et d\'été', es: 'Esquí de primavera y verano',
      pt: 'Esqui de primavera e verão', it: 'Sci di primavera ed estate',
      ja: '春・夏スキー',
      nl: 'Skiën in voorjaar en zomer',
      'zh-hk': '春夏滑雪',
    },
    blurb: {
      en: 'Rare fields that ski the warm months on lingering high-altitude snow.',
      fr: 'Rares domaines qui skient les mois chauds sur une neige d\'altitude persistante.',
      es: 'Raros dominios que esquían los meses cálidos sobre nieve de altura persistente.',
      pt: 'Raros domínios que esquiam os meses quentes sobre neve de altitude persistente.',
      it: 'Rari comprensori che sciano nei mesi caldi su neve d\'alta quota persistente.',
      ja: '暖かい時期でも標高の高い残雪で滑走できる、数少ないゲレンデ。',
      nl: 'Zeldzame gebieden waar in de warme maanden wordt geskied op lang liggende sneeuw op grote hoogte.',
      'zh-hk': '罕見於暖季仍可滑雪的雪場，全靠高海拔殘留積雪。',
    },
  },
  'southern-hemisphere': {
    label: {
      en: 'Southern Hemisphere (June to October)', fr: 'Hémisphère sud (juin à octobre)', es: 'Hemisferio sur (junio a octubre)',
      pt: 'Hemisfério sul (junho a outubro)', it: 'Emisfero sud (da giugno a ottobre)',
      ja: '南半球(6月から10月)',
      nl: 'Zuidelijk halfrond (juni tot oktober)',
      'zh-hk': '南半球（6月至10月）',
    },
    blurb: {
      en: 'Australia, New Zealand, Chile, Lesotho and South Africa, in season while the Alps sleep.',
      fr: 'Australie, Nouvelle-Zélande, Chili, Lesotho et Afrique du Sud, en saison quand les Alpes dorment.',
      es: 'Australia, Nueva Zelanda, Chile, Lesoto y Sudáfrica, en temporada mientras los Alpes duermen.',
      pt: 'Austrália, Nova Zelândia, Chile, Lesoto e África do Sul, em época enquanto os Alpes dormem.',
      it: 'Australia, Nuova Zelanda, Cile, Lesotho e Sudafrica, in stagione mentre le Alpi dormono.',
      ja: 'オーストラリア、ニュージーランド、チリ、レソト、南アフリカ。アルプスが眠る間、シーズンを迎える。',
      nl: 'Australië, Nieuw-Zeeland, Chili, Lesotho en Zuid-Afrika, in seizoen terwijl de Alpen slapen.',
      'zh-hk': '澳洲、紐西蘭、智利、萊索托及南非，趁阿爾卑斯山休眠期間迎來雪季。',
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
