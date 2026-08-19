import type { Locale } from '@/app/[locale]/dictionaries'

/**
 * Localised country names. Source of truth uses the English name
 * (as stored in data/destinations.json and lib/countries.ts).
 * This helper translates that name into the supported locales
 * so we never display "Hôtels en Switzerland".
 */
const NAMES: Record<string, Record<Locale, string>> = {
  France: { en: 'France', fr: 'France', es: 'Francia', pt: 'França', it: 'Francia', ja: 'フランス', nl: 'Frankrijk', 'zh-hk': '法國' },
  Switzerland: { en: 'Switzerland', fr: 'Suisse', es: 'Suiza', pt: 'Suíça', it: 'Svizzera', ja: 'スイス', nl: 'Zwitserland', 'zh-hk': '瑞士' },
  Austria: { en: 'Austria', fr: 'Autriche', es: 'Austria', pt: 'Áustria', it: 'Austria', ja: 'オーストリア', nl: 'Oostenrijk', 'zh-hk': '奧地利' },
  Italy: { en: 'Italy', fr: 'Italie', es: 'Italia', pt: 'Itália', it: 'Italia', ja: 'イタリア', nl: 'Italië', 'zh-hk': '意大利' },
  Spain: { en: 'Spain', fr: 'Espagne', es: 'España', pt: 'Espanha', it: 'Spagna', ja: 'スペイン', nl: 'Spanje', 'zh-hk': '西班牙' },
  Andorra: { en: 'Andorra', fr: 'Andorre', es: 'Andorra', pt: 'Andorra', it: 'Andorra', ja: 'アンドラ', nl: 'Andorra', 'zh-hk': '安道爾' },
  Germany: { en: 'Germany', fr: 'Allemagne', es: 'Alemania', pt: 'Alemanha', it: 'Germania', ja: 'ドイツ', nl: 'Duitsland', 'zh-hk': '德國' },
  Norway: { en: 'Norway', fr: 'Norvège', es: 'Noruega', pt: 'Noruega', it: 'Norvegia', ja: 'ノルウェー', nl: 'Noorwegen', 'zh-hk': '挪威' },
  Sweden: { en: 'Sweden', fr: 'Suède', es: 'Suecia', pt: 'Suécia', it: 'Svezia', ja: 'スウェーデン', nl: 'Zweden', 'zh-hk': '瑞典' },
  Finland: { en: 'Finland', fr: 'Finlande', es: 'Finlandia', pt: 'Finlândia', it: 'Finlandia', ja: 'フィンランド', nl: 'Finland', 'zh-hk': '芬蘭' },
  Japan: { en: 'Japan', fr: 'Japon', es: 'Japón', pt: 'Japão', it: 'Giappone', ja: '日本', nl: 'Japan', 'zh-hk': '日本' },
  'United States': { en: 'United States', fr: 'États-Unis', es: 'Estados Unidos', pt: 'Estados Unidos', it: 'Stati Uniti', ja: 'アメリカ', nl: 'Verenigde Staten', 'zh-hk': '美國' },
  Morocco: { en: 'Morocco', fr: 'Maroc', es: 'Marruecos', pt: 'Marrocos', it: 'Marocco', ja: 'モロッコ', nl: 'Marokko', 'zh-hk': '摩洛哥' },
  Algeria: { en: 'Algeria', fr: 'Algérie', es: 'Argelia', pt: 'Argélia', it: 'Algeria', ja: 'アルジェリア', nl: 'Algerije', 'zh-hk': '阿爾及利亞' },
  Lesotho: { en: 'Lesotho', fr: 'Lesotho', es: 'Lesoto', pt: 'Lesoto', it: 'Lesotho', ja: 'レソト', nl: 'Lesotho', 'zh-hk': '萊索托' },
  'South Africa': { en: 'South Africa', fr: 'Afrique du Sud', es: 'Sudáfrica', pt: 'África do Sul', it: 'Sudafrica', ja: '南アフリカ', nl: 'Zuid-Afrika', 'zh-hk': '南非' },
  Egypt: { en: 'Egypt', fr: 'Égypte', es: 'Egipto', pt: 'Egito', it: 'Egitto', ja: 'エジプト', nl: 'Egypte', 'zh-hk': '埃及' },
  Canada: { en: 'Canada', fr: 'Canada', es: 'Canadá', pt: 'Canadá', it: 'Canada', ja: 'カナダ', nl: 'Canada', 'zh-hk': '加拿大' },
  'South Korea': { en: 'South Korea', fr: 'Corée du Sud', es: 'Corea del Sur', pt: 'Coreia do Sul', it: 'Corea del Sud', ja: '韓国', nl: 'Zuid-Korea', 'zh-hk': '南韓' },
  Australia: { en: 'Australia', fr: 'Australie', es: 'Australia', pt: 'Austrália', it: 'Australia', ja: 'オーストラリア', nl: 'Australië', 'zh-hk': '澳洲' },
  'New Zealand': { en: 'New Zealand', fr: 'Nouvelle-Zélande', es: 'Nueva Zelanda', pt: 'Nova Zelândia', it: 'Nuova Zelanda', ja: 'ニュージーランド', nl: 'Nieuw-Zeeland', 'zh-hk': '紐西蘭' },
  Chile: { en: 'Chile', fr: 'Chili', es: 'Chile', pt: 'Chile', it: 'Cile', ja: 'チリ', nl: 'Chili', 'zh-hk': '智利' },
  Argentina: { en: 'Argentina', fr: 'Argentine', es: 'Argentina', pt: 'Argentina', it: 'Argentina', ja: 'アルゼンチン', nl: 'Argentinië', 'zh-hk': '阿根廷' },
  Bulgaria: { en: 'Bulgaria', fr: 'Bulgarie', es: 'Bulgaria', pt: 'Bulgária', it: 'Bulgaria', ja: 'ブルガリア', nl: 'Bulgarije', 'zh-hk': '保加利亞' },
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
