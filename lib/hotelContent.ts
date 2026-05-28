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
