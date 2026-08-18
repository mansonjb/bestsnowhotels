import type { Locale } from '@/app/[locale]/dictionaries'

/**
 * Localised country names. Source of truth uses the English name
 * (as stored in data/destinations.json and lib/countries.ts).
 * This helper translates that name into the supported locales
 * so we never display "Hôtels en Switzerland".
 */
const NAMES: Record<string, Record<Locale, string>> = {
  France: { en: 'France', fr: 'France', es: 'Francia', pt: 'França', it: 'Francia', ja: 'フランス', nl: 'Frankrijk' },
  Switzerland: { en: 'Switzerland', fr: 'Suisse', es: 'Suiza', pt: 'Suíça', it: 'Svizzera', ja: 'スイス', nl: 'Zwitserland' },
  Austria: { en: 'Austria', fr: 'Autriche', es: 'Austria', pt: 'Áustria', it: 'Austria', ja: 'オーストリア', nl: 'Oostenrijk' },
  Italy: { en: 'Italy', fr: 'Italie', es: 'Italia', pt: 'Itália', it: 'Italia', ja: 'イタリア', nl: 'Italië' },
  Spain: { en: 'Spain', fr: 'Espagne', es: 'España', pt: 'Espanha', it: 'Spagna', ja: 'スペイン', nl: 'Spanje' },
  Andorra: { en: 'Andorra', fr: 'Andorre', es: 'Andorra', pt: 'Andorra', it: 'Andorra', ja: 'アンドラ', nl: 'Andorra' },
  Germany: { en: 'Germany', fr: 'Allemagne', es: 'Alemania', pt: 'Alemanha', it: 'Germania', ja: 'ドイツ', nl: 'Duitsland' },
  Norway: { en: 'Norway', fr: 'Norvège', es: 'Noruega', pt: 'Noruega', it: 'Norvegia', ja: 'ノルウェー', nl: 'Noorwegen' },
  Sweden: { en: 'Sweden', fr: 'Suède', es: 'Suecia', pt: 'Suécia', it: 'Svezia', ja: 'スウェーデン', nl: 'Zweden' },
  Finland: { en: 'Finland', fr: 'Finlande', es: 'Finlandia', pt: 'Finlândia', it: 'Finlandia', ja: 'フィンランド', nl: 'Finland' },
  Japan: { en: 'Japan', fr: 'Japon', es: 'Japón', pt: 'Japão', it: 'Giappone', ja: '日本', nl: 'Japan' },
  'United States': { en: 'United States', fr: 'États-Unis', es: 'Estados Unidos', pt: 'Estados Unidos', it: 'Stati Uniti', ja: 'アメリカ', nl: 'Verenigde Staten' },
  Morocco: { en: 'Morocco', fr: 'Maroc', es: 'Marruecos', pt: 'Marrocos', it: 'Marocco', ja: 'モロッコ', nl: 'Marokko' },
  Algeria: { en: 'Algeria', fr: 'Algérie', es: 'Argelia', pt: 'Argélia', it: 'Algeria', ja: 'アルジェリア', nl: 'Algerije' },
  Lesotho: { en: 'Lesotho', fr: 'Lesotho', es: 'Lesoto', pt: 'Lesoto', it: 'Lesotho', ja: 'レソト', nl: 'Lesotho' },
  'South Africa': { en: 'South Africa', fr: 'Afrique du Sud', es: 'Sudáfrica', pt: 'África do Sul', it: 'Sudafrica', ja: '南アフリカ', nl: 'Zuid-Afrika' },
  Egypt: { en: 'Egypt', fr: 'Égypte', es: 'Egipto', pt: 'Egito', it: 'Egitto', ja: 'エジプト', nl: 'Egypte' },
  Canada: { en: 'Canada', fr: 'Canada', es: 'Canadá', pt: 'Canadá', it: 'Canada', ja: 'カナダ', nl: 'Canada' },
  'South Korea': { en: 'South Korea', fr: 'Corée du Sud', es: 'Corea del Sur', pt: 'Coreia do Sul', it: 'Corea del Sud', ja: '韓国', nl: 'Zuid-Korea' },
  Australia: { en: 'Australia', fr: 'Australie', es: 'Australia', pt: 'Austrália', it: 'Australia', ja: 'オーストラリア', nl: 'Australië' },
  'New Zealand': { en: 'New Zealand', fr: 'Nouvelle-Zélande', es: 'Nueva Zelanda', pt: 'Nova Zelândia', it: 'Nuova Zelanda', ja: 'ニュージーランド', nl: 'Nieuw-Zeeland' },
  Chile: { en: 'Chile', fr: 'Chili', es: 'Chile', pt: 'Chile', it: 'Cile', ja: 'チリ', nl: 'Chili' },
  Argentina: { en: 'Argentina', fr: 'Argentine', es: 'Argentina', pt: 'Argentina', it: 'Argentina', ja: 'アルゼンチン', nl: 'Argentinië' },
  Bulgaria: { en: 'Bulgaria', fr: 'Bulgarie', es: 'Bulgaria', pt: 'Bulgária', it: 'Bulgaria', ja: 'ブルガリア', nl: 'Bulgarije' },
}

export function localizeCountry(englishName: string, locale: Locale): string {
  return NAMES[englishName]?.[locale] ?? englishName
}

/**
 * Preposition + country, idiomatic per locale.
 * e.g. "en France", "en Suisse", "in France", "en España", "em França", "na Suíça", "in Francia".
 */
export function inCountry(englishName: string, locale: Locale): string {
  const name = localizeCountry(englishName, locale)
  if (locale === 'en') return `in ${name}`
  // Per-country preposition maps. Default to the per-locale fallback below.
  // Adding a country becomes one row in NAMES + (optionally) one row here per
  // locale that needs a non-default preposition.
  const PREP_FR: Record<string, string> = {
    Japan: 'au', Morocco: 'au', Lesotho: 'au', Canada: 'au', Chile: 'au',
    'United States': 'aux',
  }
  const PREP_PT: Record<string, string> = {
    Japan: 'no', Lesotho: 'no', Egypt: 'no', Canada: 'no', Chile: 'no',
    'United States': 'nos',
    Switzerland: 'na', Austria: 'na', Germany: 'na', Norway: 'na', Sweden: 'na',
    Algeria: 'na', 'South Africa': 'na', 'South Korea': 'na', Australia: 'na', 'New Zealand': 'na',
    Argentina: 'na', Bulgaria: 'na',
  }
  const PREP_IT: Record<string, string> = {
    'United States': 'negli',
  }
  // Dutch takes "in" for almost every country; plural country names take "in de".
  const PREP_NL: Record<string, string> = {
    'United States': 'in de',
  }
  if (locale === 'fr') return `${PREP_FR[englishName] ?? 'en'} ${name}`
  if (locale === 'es') return `en ${name}`
  if (locale === 'pt') return `${PREP_PT[englishName] ?? 'em'} ${name}`
  if (locale === 'it') return `${PREP_IT[englishName] ?? 'in'} ${name}`
  if (locale === 'nl') return `${PREP_NL[englishName] ?? 'in'} ${name}`
  return name
}
