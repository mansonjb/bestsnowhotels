import type { Locale } from '@/app/[locale]/dictionaries'
import type { Hotel } from './hotels'

/**
 * Localised, data-driven copy for hotel cards (rating word, price tier, the
 * "good to know" blurb). Kept here, like regions.ts / vibes.ts, so the card
 * stays a dumb presentational component and the dictionaries keep parity.
 * Everything is derived from existing Hotel fields, nothing is fabricated.
 */

const RATING_WORD: Record<string, Record<Locale, string>> = {
  excellent: { en: 'Excellent', fr: 'Excellent', es: 'Excelente', pt: 'Excelente' },
  veryGood: { en: 'Very good', fr: 'Très bien', es: 'Muy bien', pt: 'Muito bom' },
  great: { en: 'Great', fr: 'Très bon', es: 'Muy bueno', pt: 'Muito bom' },
  good: { en: 'Good', fr: 'Bien', es: 'Bien', pt: 'Bom' },
}

function ratingKey(r: number): string {
  if (r >= 4.6) return 'excellent'
  if (r >= 4.3) return 'veryGood'
  if (r >= 4.0) return 'great'
  return 'good'
}

export function hotelRatingWord(rating: number, locale: Locale): string {
  return RATING_WORD[ratingKey(rating)][locale]
}

/** Capitalised price-tier label, used as a chip. */
const PRICE_CAP: Record<string, Record<Locale, string>> = {
  budget: { en: 'Budget-friendly', fr: 'Économique', es: 'Económico', pt: 'Económico' },
  mid: { en: 'Mid-range', fr: 'Milieu de gamme', es: 'Gama media', pt: 'Gama média' },
  upper: { en: 'Upper-scale', fr: 'Haut de gamme', es: 'Gama alta', pt: 'Gama alta' },
  luxury: { en: 'Luxury', fr: 'Luxe', es: 'Lujo', pt: 'Luxo' },
}

/** Lower-case price-tier phrase, used inside the blurb sentence. */
const PRICE_PHRASE: Record<string, Record<Locale, string>> = {
  budget: { en: 'budget-friendly', fr: 'économique', es: 'económica', pt: 'económica' },
  mid: { en: 'mid-range', fr: 'de milieu de gamme', es: 'de gama media', pt: 'de gama média' },
  upper: { en: 'upper-scale', fr: 'haut de gamme', es: 'de gama alta', pt: 'de gama alta' },
  luxury: { en: 'luxury', fr: 'de luxe', es: 'de lujo', pt: 'de luxo' },
}

function priceKey(p: number): string {
  if (p < 110) return 'budget'
  if (p < 180) return 'mid'
  if (p < 260) return 'upper'
  return 'luxury'
}

export function hotelPriceWord(priceFrom: number, locale: Locale): string {
  return PRICE_CAP[priceKey(priceFrom)][locale]
}

export function hotelDistanceLabel(m: number | null): string | null {
  if (m == null) return null
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`
}

const GOOD_TO_KNOW: Record<Locale, string> = {
  en: 'Good to know',
  fr: 'Bon à savoir',
  es: 'Bueno saber',
  pt: 'Bom saber',
}

export function goodToKnowLabel(locale: Locale): string {
  return GOOD_TO_KNOW[locale]
}

const WHY_WE_LIKE: Record<Locale, string> = {
  en: 'Why we like it',
  fr: 'Pourquoi on aime',
  es: 'Por qué nos gusta',
  pt: 'Porque gostamos',
}
export function whyWeLikeLabel(locale: Locale): string {
  return WHY_WE_LIKE[locale]
}

const TOP_PICK: Record<Locale, string> = {
  en: 'Top pick',
  fr: 'Notre coup de cœur',
  es: 'Nuestra preferida',
  pt: 'A nossa preferida',
}
export function topPickLabel(locale: Locale): string {
  return TOP_PICK[locale]
}

/**
 * A short editorial "why we like it" reason, picking the hotel's single
 * strongest selling point from its data (slope-side, top-rated, luxury,
 * value, popular, or a safe default).
 */
export function hotelReason(hotel: Hotel, resortName: string, locale: Locale): string {
  const d = hotel.distanceToSlopesM
  const r = hotel.rating
  const n = hotel.reviewCount
  const tier = priceKey(hotel.priceFrom)

  let kind: string
  if (d != null && d <= 350) kind = 'slopeside'
  else if (r >= 4.7 && n >= 150) kind = 'topRated'
  else if (tier === 'luxury') kind = 'luxury'
  else if ((tier === 'budget' || tier === 'mid') && r >= 4.4) kind = 'value'
  else if (n >= 600) kind = 'popular'
  else kind = 'reliable'

  const R: Record<string, Record<Locale, string>> = {
    slopeside: {
      en: `Moments from the lifts in ${resortName}, so you can ski back to the door and skip the morning queues.`,
      fr: `À quelques pas des remontées à ${resortName} : on rentre skis aux pieds et on évite les files du matin.`,
      es: `A pocos pasos de los remontes en ${resortName}: vuelves esquiando hasta la puerta y te ahorras las colas de la mañana.`,
      pt: `A poucos passos dos teleféricos em ${resortName}: regressa a esquiar até à porta e evita as filas da manhã.`,
    },
    topRated: {
      en: `One of the highest-rated places to stay in ${resortName}, with guests singling out the service and comfort.`,
      fr: `L'un des hôtels les mieux notés de ${resortName}, où les voyageurs saluent l'accueil et le confort.`,
      es: `Uno de los alojamientos mejor valorados de ${resortName}, donde los huéspedes destacan el trato y el confort.`,
      pt: `Um dos alojamentos mais bem avaliados de ${resortName}, onde os hóspedes destacam o atendimento e o conforto.`,
    },
    luxury: {
      en: `A polished, high-end base for ${resortName} when you want to be properly looked after after a day on the snow.`,
      fr: `Une adresse haut de gamme et soignée à ${resortName}, pour se faire chouchouter après une journée sur les pistes.`,
      es: `Una dirección de alta gama y cuidada en ${resortName}, para que te mimen tras un día en la nieve.`,
      pt: `Uma morada de alta gama e cuidada em ${resortName}, para se deixar mimar depois de um dia na neve.`,
    },
    value: {
      en: `Strong value for ${resortName}, with a high guest rating that punches above its nightly price.`,
      fr: `Un très bon plan à ${resortName}, avec une note voyageurs élevée pour un prix à la nuit raisonnable.`,
      es: `Una gran relación calidad-precio en ${resortName}, con una nota de huéspedes alta para su precio por noche.`,
      pt: `Uma ótima relação qualidade-preço em ${resortName}, com uma nota de hóspedes alta para o preço por noite.`,
    },
    popular: {
      en: `A long-standing favourite in ${resortName}, trusted by thousands of guests before you.`,
      fr: `Un favori de longue date à ${resortName}, plébiscité par des milliers de voyageurs avant vous.`,
      es: `Un favorito de siempre en ${resortName}, avalado por miles de huéspedes antes que tú.`,
      pt: `Um favorito de longa data em ${resortName}, recomendado por milhares de hóspedes antes de si.`,
    },
    reliable: {
      en: `A dependable, well-reviewed choice for a stay in ${resortName}.`,
      fr: `Un choix fiable et bien noté pour un séjour à ${resortName}.`,
      es: `Una opción fiable y bien valorada para alojarse en ${resortName}.`,
      pt: `Uma opção fiável e bem avaliada para ficar em ${resortName}.`,
    },
  }
  return R[kind][locale]
}

/** A short, data-driven "good to know" paragraph for the card. */
export function hotelBlurb(hotel: Hotel, resortName: string, locale: Locale): string {
  const rw = hotelRatingWord(hotel.rating, locale).toLowerCase()
  const pw = PRICE_PHRASE[priceKey(hotel.priceFrom)][locale]
  const r = hotel.rating.toFixed(1)
  const n = hotel.reviewCount.toLocaleString(locale === 'en' ? 'en-US' : locale)
  const d = hotelDistanceLabel(hotel.distanceToSlopesM)
  if (locale === 'fr') {
    return `Les voyageurs jugent cet hôtel ${rw} (${r}/5 sur ${n} avis).${d ? ` Il se trouve à environ ${d} des pistes.` : ''} Une adresse ${pw} pour ${resortName}, avec les prix par nuit en direct pour vos dates, pour toujours voir le meilleur tarif.`
  }
  if (locale === 'es') {
    return `Los viajeros valoran este hotel como ${rw} (${r}/5 con ${n} opiniones).${d ? ` Está a unos ${d} de las pistas.` : ''} Una opción ${pw} para ${resortName}, con precios por noche en directo para tus fechas, para ver siempre la mejor tarifa.`
  }
  if (locale === 'pt') {
    return `Os viajantes classificam este hotel como ${rw} (${r}/5 em ${n} avaliações).${d ? ` Fica a cerca de ${d} das pistas.` : ''} Uma opção ${pw} para ${resortName}, com preços por noite em direto para as suas datas, para ver sempre a melhor tarifa.`
  }
  return `Guests rate this hotel as ${rw} (${r}/5 from ${n} reviews).${d ? ` It sits about ${d} from the slopes.` : ''} A ${pw} option for ${resortName}, with live nightly rates shown for your exact dates so you always see the best price.`
}
