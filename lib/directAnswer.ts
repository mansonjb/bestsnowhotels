import type { Locale } from '@/app/[locale]/dictionaries'
import type { Destination } from './destinations'
import { localizeCountry, inCountry } from './countryNames'
import { localizeRegion } from './regions'
import { formatSeasonRange } from './dates'
import { skiInSkiOutTier } from './skiInSkiOut'

/**
 * A single, factual, extractable answer sentence built entirely from our data,
 * placed at the top of each resort page. This is the format generative engines
 * (ChatGPT, Perplexity, Google AI Overviews) quote: one self-contained, number
 * rich statement that answers "what is <resort>?". No fabrication, all data.
 */
export function directAnswer(d: Destination, l: Locale): string {
  const region = localizeRegion(d.region, l)
  const country = localizeCountry(d.country, l)
  const inC = inCountry(d.country, l)
  const season = formatSeasonRange(d.seasonStart, d.seasonEnd, l)
  const tier = skiInSkiOutTier(d.slug)

  // Localised ski-in/ski-out qualifier by honesty tier.
  const sio = {
    en: tier === 'strong' ? 'ski-in/ski-out resort (most of the village is genuinely on the snow)' : tier === 'partial' ? 'ski resort with genuine ski-in/ski-out hotels' : 'ski resort',
    fr: tier === 'strong' ? 'station ski au pied (l’essentiel du village est vraiment sur la neige)' : tier === 'partial' ? 'station avec de vrais hôtels ski au pied' : 'station de ski',
    es: tier === 'strong' ? 'estación a pie de pista (la mayor parte del pueblo está sobre la nieve)' : tier === 'partial' ? 'estación con hoteles a pie de pista de verdad' : 'estación de esquí',
    pt: tier === 'strong' ? 'estância ski-in/ski-out (a maior parte da aldeia está sobre a neve)' : tier === 'partial' ? 'estância com hotéis ski-in/ski-out a sério' : 'estância de esqui',
    it: tier === 'strong' ? 'località sci ai piedi (gran parte del paese è davvero sulla neve)' : tier === 'partial' ? 'località con veri hotel sci ai piedi' : 'località sciistica',
    nl: tier === 'strong' ? 'ski-in/ski-out skigebied (het grootste deel van het dorp ligt echt aan de piste)' : tier === 'partial' ? 'skigebied met echte ski-in/ski-out hotels' : 'skigebied',
    ja: tier === 'strong' ? 'ski-in/ski-outリゾート(集落の大部分が本当に雪の上にある)' : tier === 'partial' ? '本物のski-in/ski-outホテルがあるスキーリゾート' : 'スキーリゾート',
  }[l]

  switch (l) {
    case 'fr':
      return `${d.name} est une ${sio} ${inC}, dans le massif ${region}. Le village est à ${d.altitudeBase} m et les remontées montent à ${d.altitudeSummit} m, avec ${d.pistesKm} km de pistes et ${d.lifts} remontées. Son score neige BestSnowHotels est de ${d.snowScore}/100, et la saison va généralement de ${season}.`
    case 'es':
      return `${d.name} es una ${sio} ${inC}, en ${region}. El pueblo está a ${d.altitudeBase} m y los remontes llegan a ${d.altitudeSummit} m, con ${d.pistesKm} km de pistas y ${d.lifts} remontes. Su puntuación de nieve BestSnowHotels es ${d.snowScore}/100, y la temporada suele ir de ${season}.`
    case 'pt':
      return `${d.name} é uma ${sio} ${inC}, em ${region}. A aldeia está a ${d.altitudeBase} m e os teleféricos sobem até ${d.altitudeSummit} m, com ${d.pistesKm} km de pistas e ${d.lifts} teleféricos. A sua pontuação de neve BestSnowHotels é ${d.snowScore}/100, e a época vai normalmente de ${season}.`
    case 'it':
      return `${d.name} è una ${sio} ${inC}, nel comprensorio ${region}. Il paese è a ${d.altitudeBase} m e gli impianti salgono a ${d.altitudeSummit} m, con ${d.pistesKm} km di piste e ${d.lifts} impianti. Il suo punteggio neve BestSnowHotels è ${d.snowScore}/100, e la stagione va di solito da ${season}.`
    case 'nl':
      return `${d.name} is een ${sio} ${inC}, in de regio ${region}. Het dorp ligt op ${d.altitudeBase} m en de liften reiken tot ${d.altitudeSummit} m, met ${d.pistesKm} km piste en ${d.lifts} liften. De BestSnowHotels sneeuwscore is ${d.snowScore}/100, en het seizoen loopt meestal van ${season}.`
    case 'ja':
      return `${d.name}は${inC}の${region}にある${sio}です。${d.lifts}基のリフトが通る${d.pistesKm}kmのコースがあり、標高${d.altitudeBase}mから${d.altitudeSummit}mまで広がっています。BestSnowHotelsの積雪スコアは${d.snowScore}/100で、シーズンは例年${season}です。`
    default:
      return `${d.name} is a ${sio} ${inC}, in the ${region}. The village sits at ${d.altitudeBase} m and the lifts top out at ${d.altitudeSummit} m, with ${d.pistesKm} km of pistes and ${d.lifts} lifts. Its BestSnowHotels snow score is ${d.snowScore}/100, and the season usually runs ${season}.`
  }
}
