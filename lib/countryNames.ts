import type { Locale } from '@/app/[locale]/dictionaries'

/**
 * Localised country names. Source of truth uses the English name
 * (as stored in data/destinations.json and lib/countries.ts).
 * This helper translates that name into the supported locales
 * so we never display "Hôtels en Switzerland".
 */
const NAMES: Record<string, Record<Locale, string>> = {
  France: { en: 'France', fr: 'France', es: 'Francia', pt: 'França', it: 'Francia' },
  Switzerland: { en: 'Switzerland', fr: 'Suisse', es: 'Suiza', pt: 'Suíça', it: 'Svizzera' },
  Austria: { en: 'Austria', fr: 'Autriche', es: 'Austria', pt: 'Áustria', it: 'Austria' },
  Italy: { en: 'Italy', fr: 'Italie', es: 'Italia', pt: 'Itália', it: 'Italia' },
  Spain: { en: 'Spain', fr: 'Espagne', es: 'España', pt: 'Espanha', it: 'Spagna' },
  Andorra: { en: 'Andorra', fr: 'Andorre', es: 'Andorra', pt: 'Andorra', it: 'Andorra' },
  Germany: { en: 'Germany', fr: 'Allemagne', es: 'Alemania', pt: 'Alemanha', it: 'Germania' },
  Norway: { en: 'Norway', fr: 'Norvège', es: 'Noruega', pt: 'Noruega', it: 'Norvegia' },
  Sweden: { en: 'Sweden', fr: 'Suède', es: 'Suecia', pt: 'Suécia', it: 'Svezia' },
  Finland: { en: 'Finland', fr: 'Finlande', es: 'Finlandia', pt: 'Finlândia', it: 'Finlandia' },
  Japan: { en: 'Japan', fr: 'Japon', es: 'Japón', pt: 'Japão', it: 'Giappone' },
  'United States': { en: 'United States', fr: 'États-Unis', es: 'Estados Unidos', pt: 'Estados Unidos', it: 'Stati Uniti' },
  Morocco: { en: 'Morocco', fr: 'Maroc', es: 'Marruecos', pt: 'Marrocos', it: 'Marocco' },
  Algeria: { en: 'Algeria', fr: 'Algérie', es: 'Argelia', pt: 'Argélia', it: 'Algeria' },
  Lesotho: { en: 'Lesotho', fr: 'Lesotho', es: 'Lesoto', pt: 'Lesoto', it: 'Lesotho' },
  'South Africa': { en: 'South Africa', fr: 'Afrique du Sud', es: 'Sudáfrica', pt: 'África do Sul', it: 'Sudafrica' },
  Egypt: { en: 'Egypt', fr: 'Égypte', es: 'Egipto', pt: 'Egito', it: 'Egitto' },
  Canada: { en: 'Canada', fr: 'Canada', es: 'Canadá', pt: 'Canadá', it: 'Canada' },
  'South Korea': { en: 'South Korea', fr: 'Corée du Sud', es: 'Corea del Sur', pt: 'Coreia do Sul', it: 'Corea del Sud' },
  Australia: { en: 'Australia', fr: 'Australie', es: 'Australia', pt: 'Austrália', it: 'Australia' },
  'New Zealand': { en: 'New Zealand', fr: 'Nouvelle-Zélande', es: 'Nueva Zelanda', pt: 'Nova Zelândia', it: 'Nuova Zelanda' },
  Chile: { en: 'Chile', fr: 'Chili', es: 'Chile', pt: 'Chile', it: 'Cile' },
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
  if (locale === 'fr') {
    // EN names: Switzerland, Italy, Spain, France, Austria, Andorra → "en" (feminine)
    // Masculine singular country → "au" (Japon, Maroc, Lesotho, Canada)
    // Plural masculine → "aux" (États-Unis)
    if (
      englishName === 'Japan' ||
      englishName === 'Morocco' ||
      englishName === 'Lesotho' ||
      englishName === 'Canada' ||
      englishName === 'Chile'
    )
      return `au ${name}`
    if (englishName === 'United States') return `aux ${name}`
    return `en ${name}`
  }
  if (locale === 'es') {
    return `en ${name}`
  }
  if (locale === 'pt') {
    // PT-PT rule: "em" before names without article (França, Itália, Espanha, Andorra, Finlândia, Marrocos),
    // "na" before feminine names with article (Suíça, Áustria, Alemanha, Noruega, Suécia, Argélia, África do Sul),
    // "no" before masculine singular with article (Japão, Lesoto, Egito),
    // "nos" before masculine plural with article (Estados Unidos).
    if (
      englishName === 'Japan' ||
      englishName === 'Lesotho' ||
      englishName === 'Egypt' ||
      englishName === 'Canada' ||
      englishName === 'Chile'
    )
      return `no ${name}`
    if (englishName === 'United States') return `nos ${name}`
    if (
      englishName === 'Algeria' ||
      englishName === 'South Africa' ||
      englishName === 'South Korea' ||
      englishName === 'Australia' ||
      englishName === 'New Zealand'
    )
      return `na ${name}`
    if (
      englishName === 'Switzerland' ||
      englishName === 'Austria' ||
      englishName === 'Germany' ||
      englishName === 'Norway' ||
      englishName === 'Sweden'
    )
      return `na ${name}`
    return `em ${name}`
  }
  if (locale === 'it') {
    // Italian: most countries take "in" + name. Plural masculine takes "negli" (Stati Uniti).
    if (englishName === 'United States') return `negli ${name}`
    return `in ${name}`
  }
  return name
}
