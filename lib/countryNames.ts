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
    // EN names: Switzerland, Italy, Spain, France, Austria, Andorra
    // FR rule: "en" for feminine country names (the usual case for these)
    return `en ${name}`
  }
  if (locale === 'es') return `en ${name}`
  if (locale === 'pt') {
    // PT-PT rule: "em" before names without article (França, Itália, Espanha, Andorra),
    // "na" before names with article (Suíça, Áustria, Alemanha).
    if (englishName === 'Switzerland' || englishName === 'Austria' || englishName === 'Germany')
      return `na ${name}`
    return `em ${name}`
  }
  if (locale === 'it') {
    // Italian: "in" works for all seven (Francia, Svizzera, Austria, Italia, Spagna, Andorra, Germania).
    return `in ${name}`
  }
  return name
}
