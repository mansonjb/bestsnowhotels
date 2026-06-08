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
    // Japan (Japon) is masculine → "au"
    // United States (États-Unis) is plural → "aux"
    if (englishName === 'Japan') return `au ${name}`
    if (englishName === 'United States') return `aux ${name}`
    return `en ${name}`
  }
  if (locale === 'es') {
    // Estados Unidos plural masculine usually takes "en" without article in modern usage.
    return `en ${name}`
  }
  if (locale === 'pt') {
    // PT-PT rule: "em" before names without article (França, Itália, Espanha, Andorra, Finlândia),
    // "na" before feminine names with article (Suíça, Áustria, Alemanha, Noruega, Suécia),
    // "no" before masculine singular with article (Japão),
    // "nos" before masculine plural with article (Estados Unidos).
    if (englishName === 'Japan') return `no ${name}`
    if (englishName === 'United States') return `nos ${name}`
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
