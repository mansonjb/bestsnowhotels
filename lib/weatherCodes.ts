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
  clear: { en: 'Clear', fr: 'Ciel clair', es: 'Despejado', pt: 'Céu limpo', it: 'Sereno', ja: '晴れ', nl: 'Helder', 'zh-hk': '晴天' },
  partlyCloudy: {
    en: 'Partly cloudy',
    fr: 'Partiellement nuageux',
    es: 'Parcialmente nublado',
    pt: 'Parcialmente nublado',
    it: 'Parzialmente nuvoloso',
    ja: '一部曇り',
    nl: 'Gedeeltelijk bewolkt',
    'zh-hk': '部分多雲',
  },
  overcast: {
    en: 'Overcast',
    fr: 'Couvert',
    es: 'Cubierto',
    pt: 'Encoberto',
    it: 'Coperto',
    ja: '曇り',
    nl: 'Zwaar bewolkt',
    'zh-hk': '密雲',
  },
  fog: { en: 'Fog', fr: 'Brouillard', es: 'Niebla', pt: 'Nevoeiro', it: 'Nebbia', ja: '霧', nl: 'Mist', 'zh-hk': '霧' },
  drizzle: { en: 'Drizzle', fr: 'Bruine', es: 'Llovizna', pt: 'Chuvisco', it: 'Pioviggine', ja: '霧雨', nl: 'Motregen', 'zh-hk': '微雨' },
  rain: { en: 'Rain', fr: 'Pluie', es: 'Lluvia', pt: 'Chuva', it: 'Pioggia', ja: '雨', nl: 'Regen', 'zh-hk': '雨' },
  freezingRain: {
    en: 'Freezing rain',
    fr: 'Pluie verglaçante',
    es: 'Lluvia helada',
    pt: 'Chuva gelada',
    it: 'Pioggia gelata',
    ja: '着氷性の雨',
    nl: 'IJzel',
    'zh-hk': '凍雨',
  },
  snowLight: {
    en: 'Light snow',
    fr: 'Neige légère',
    es: 'Nieve ligera',
    pt: 'Neve fraca',
    it: 'Neve leggera',
    ja: '小雪',
    nl: 'Lichte sneeuw',
    'zh-hk': '小雪',
  },
  snowHeavy: {
    en: 'Heavy snow',
    fr: 'Fortes chutes de neige',
    es: 'Nieve intensa',
    pt: 'Neve forte',
    it: 'Neve intensa',
    ja: '大雪',
    nl: 'Zware sneeuwval',
    'zh-hk': '大雪',
  },
  thunderstorm: {
    en: 'Thunderstorm',
    fr: 'Orage',
    es: 'Tormenta',
    pt: 'Trovoada',
    it: 'Temporale',
    ja: '雷雨',
    nl: 'Onweer',
    'zh-hk': '雷暴',
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
