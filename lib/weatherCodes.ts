import type { Locale } from '@/app/[locale]/dictionaries'

/**
 * WMO weather code labels, grouped into the categories used by the UI.
 * Open-Meteo returns WMO codes 0 to 99; we bucket them into nine display states
 * with their own localised label and an emoji glyph for at-a-glance scanning.
 */

export type WeatherKind =
  | 'clear'
  | 'partlyCloudy'
  | 'overcast'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'freezingRain'
  | 'snowLight'
  | 'snowHeavy'
  | 'thunderstorm'

export function weatherKind(code: number | null): WeatherKind {
  if (code == null) return 'overcast'
  if (code === 0) return 'clear'
  if (code === 1 || code === 2) return 'partlyCloudy'
  if (code === 3) return 'overcast'
  if (code === 45 || code === 48) return 'fog'
  if (code >= 51 && code <= 55) return 'drizzle'
  if (code === 56 || code === 57) return 'freezingRain'
  if (code >= 61 && code <= 65) return 'rain'
  if (code === 66 || code === 67) return 'freezingRain'
  if (code === 71 || code === 73 || code === 77) return 'snowLight'
  if (code === 75) return 'snowHeavy'
  if (code === 80 || code === 81 || code === 82) return 'rain'
  if (code === 85) return 'snowLight'
  if (code === 86) return 'snowHeavy'
  if (code === 95 || code === 96 || code === 99) return 'thunderstorm'
  return 'overcast'
}

const LABELS: Record<WeatherKind, Record<Locale, string>> = {
  clear: { en: 'Clear', fr: 'Ciel clair', es: 'Despejado', pt: 'Céu limpo', it: 'Sereno' },
  partlyCloudy: {
    en: 'Partly cloudy',
    fr: 'Partiellement nuageux',
    es: 'Parcialmente nublado',
    pt: 'Parcialmente nublado',
    it: 'Parzialmente nuvoloso',
  },
  overcast: {
    en: 'Overcast',
    fr: 'Couvert',
    es: 'Cubierto',
    pt: 'Encoberto',
    it: 'Coperto',
  },
  fog: { en: 'Fog', fr: 'Brouillard', es: 'Niebla', pt: 'Nevoeiro', it: 'Nebbia' },
  drizzle: { en: 'Drizzle', fr: 'Bruine', es: 'Llovizna', pt: 'Chuvisco', it: 'Pioviggine' },
  rain: { en: 'Rain', fr: 'Pluie', es: 'Lluvia', pt: 'Chuva', it: 'Pioggia' },
  freezingRain: {
    en: 'Freezing rain',
    fr: 'Pluie verglaçante',
    es: 'Lluvia helada',
    pt: 'Chuva gelada',
    it: 'Pioggia gelata',
  },
  snowLight: {
    en: 'Light snow',
    fr: 'Neige légère',
    es: 'Nieve ligera',
    pt: 'Neve fraca',
    it: 'Neve leggera',
  },
  snowHeavy: {
    en: 'Heavy snow',
    fr: 'Fortes chutes de neige',
    es: 'Nieve intensa',
    pt: 'Neve forte',
    it: 'Neve intensa',
  },
  thunderstorm: {
    en: 'Thunderstorm',
    fr: 'Orage',
    es: 'Tormenta',
    pt: 'Trovoada',
    it: 'Temporale',
  },
}

const GLYPH: Record<WeatherKind, string> = {
  clear: '☀️',
  partlyCloudy: '⛅',
  overcast: '☁️',
  fog: '🌫️',
  drizzle: '🌦️',
  rain: '🌧️',
  freezingRain: '🌨️',
  snowLight: '🌨️',
  snowHeavy: '❄️',
  thunderstorm: '⛈️',
}

export function weatherLabel(code: number | null, locale: Locale): string {
  return LABELS[weatherKind(code)][locale]
}

export function weatherGlyph(code: number | null): string {
  return GLYPH[weatherKind(code)]
}
